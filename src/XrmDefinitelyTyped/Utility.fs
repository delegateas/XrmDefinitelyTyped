module DG.XrmDefinitelyTyped.Utility

open System
open System.IO
open System.Runtime.Serialization.Json
open System.Text
open System.Text.RegularExpressions


/// Use argument and pass it along
let (|>>) x g = g x; x
/// Option binder
let (?>>) m f = Option.bind f m
/// Option mapper
let (?|>) m f = Option.map f m
/// Option checker
let (?>>?) m c = Option.bind (fun x -> match c x with | true -> Some x | false -> None) m
/// Option default argument
let (?|) = defaultArg

let stringToOption s =
  match String.IsNullOrWhiteSpace(s) with
  | true  -> None
  | false -> Some s

let parseInt str =
  let mutable intvalue = 0
  if System.Int32.TryParse(str, &intvalue) then Some(intvalue)
  else None

let truthySet = Set.ofList ["true"; "1"; "yes"; "y"]
let parseBoolish (str: string) =
  not (isNull str) && truthySet.Contains(str.ToLower()) 

let rec getFirstExceptionMessage (ex:Exception) =
  match ex with
  | :? AggregateException as ae -> getFirstExceptionMessage ae.InnerException
  | _ -> ex.Message

let (|StartsWithNumber|) (str:string) = str.Length > 0 && str.[0] >= '0' && str.[0] <= '9'
let (|StartsWith|_|) needle (haystack : string) = if haystack.StartsWith(needle) then Some() else None

  
let keywords = [ "import"; "export"; "class"; "enum"; "var"; "for"; "if"; "else"; "const"; "true"; "false" ] |> Set.ofList
let emptyLabel = "_EmptyString"
let (|IsKeyword|) = keywords.Contains

let applyLabelMappings (labelMapping: (string * string)[] option) (label: string) =
  match labelMapping with
  | Some mapping -> 
    mapping 
    |> Array.fold (fun (acc:string) (elem:(string*string)) -> 
       Regex.Replace(acc,fst elem,snd elem)) label
  | None  -> label;;

let sanitizeString str = 
  Regex.Replace(str, @"[^\w]", "")
  |> fun str ->
    match str with
    | StartsWithNumber true
    | IsKeyword true -> sprintf "_%s" str
    | "" -> emptyLabel
    | _ -> str
  
let parseJson<'t> (jsonString:string)  : 't =  
  use ms = new MemoryStream(ASCIIEncoding.UTF8.GetBytes(jsonString)) 
  let obj = (new DataContractJsonSerializer(typeof<'t>)).ReadObject(ms) 
  obj :?> 't


// Versioning
type Version = int * int * int * int
type VersionCriteria = Version option * Version option * Version option

let defaultVersion: Version =
  (9,1,0,0)

let parseVersion (str:string): Version =
  let vArr = str.Split('.')
  let getIdx idx = Array.tryItem idx vArr ?>> parseInt ?| 0
  (getIdx 0, getIdx 1, getIdx 2, getIdx 3)

  
let getIntGroup def (m:Match) (idx:int) = parseInt m.Groups.[idx].Value ?| def
let getMinVersion = getIntGroup 0
let getMaxVersion (m:Match) (idx:int) = getIntGroup Int32.MaxValue m idx
let criteriaRegex = Regex(@"^(?:(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?)?-(?:(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?)?(-)?(?:(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?)?$")

let parseVersionCriteria criteria: VersionCriteria option =
  let m = criteriaRegex.Match(criteria)
  match m.Success with
  | false -> None
  | true ->

    let fromVersion =
      match m.Groups.[1].Success with
      | false -> None
      | true  -> Some (getMinVersion m 1, getMinVersion m 2, getMinVersion m 3, getMinVersion m 4)

    //Question is if group five should be required
    let deprecationVersion =
      match m.Groups.[9].Success && m.Groups.[5].Success with
      | true -> Some (getMinVersion m 5, getMinVersion m 6, getMinVersion m 7, getMinVersion m 8)
      | false -> None

    let toVersion =
      match m.Groups.[9].Success with
      | false when m.Groups.[5].Success -> 
        Some (getMinVersion m 5, getMinVersion m 6, getMinVersion m 7, getMinVersion m 8)
      | true when m.Groups.[10].Success -> 
        Some (getMinVersion m 10, getMinVersion m 11, getMinVersion m 12, getMinVersion m 13)
      | _ -> None

    Some (fromVersion, deprecationVersion, toVersion)

let versionCompare ((a1,b1,c1,d1): Version) ((a2,b2,c2,d2): Version) =
  ([a1;b1;c1;d1], [a2;b2;c2;d2])
  ||> List.map2 (-)
  |> List.tryFind ((<>) 0)

/// Version greater than or equal to
let (.>=) v1 v2 =
  versionCompare v1 v2
  ?|> fun x -> x > 0
  ?| true

/// Version less than or equal to
let (.<=) v1 v2 =
  versionCompare v1 v2
  ?|> fun x -> x < 0
  ?| true

/// Version less than
let (.<) v1 v2 = 
  v1 .>= v2 |> not

/// Version greater than
let (.>) v1 v2 = 
  v1 .<= v2 |> not

/// Check if the version matches the version criteria
let matchesVersionCriteria (versionToCheck: Version) (useDeprecated: bool) (criteria: VersionCriteria) =
  match criteria with
  | None, None, None          -> true
  | Some v1, None, None       -> v1 .<= versionToCheck
  | None, None, Some v3       -> versionToCheck .< v3
  | Some v1, None, Some v3    -> v1 .<= versionToCheck && versionToCheck .< v3
  | None, Some v2, None       -> versionToCheck .< v2 || useDeprecated
  | Some v1, Some v2, None    -> v1 .<= versionToCheck && (versionToCheck .< v2 || useDeprecated)
  | None, Some v2, Some v3    -> (versionToCheck .< v2 || useDeprecated) && versionToCheck .< v3
  | Some v1, Some v2, Some v3 -> v1 .<= versionToCheck && (versionToCheck .< v2 || useDeprecated) && versionToCheck .< v3