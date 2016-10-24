namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Runtime.Serialization.Json
open System.Text
open System.Text.RegularExpressions

module Utility =

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
  type VersionCriteria = Version option * Version option

  let parseVersion (str:string): Version =
    let vArr = str.Split('.')
    let getIdx idx = Array.tryItem idx vArr ?>> parseInt ?| 0
    (getIdx 0, getIdx 1, getIdx 2, getIdx 3)

  
  let getIntGroup def (m:Match) (idx:int) = parseInt m.Groups.[idx].Value ?| def
  let getMinVersion = getIntGroup 0
  let getMaxVersion = getIntGroup Int32.MaxValue
  let criteriaRegex = Regex(@"^(?:(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?)?-(?:(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?)?$")

  let parseVersionCriteria criteria: VersionCriteria option =
    let m = criteriaRegex.Match(criteria)
    match m.Success with
    | false -> None
    | true ->

      let fromVersion =
        match m.Groups.[1].Success with
        | false -> None
        | true  -> Some (getMinVersion m 1, getMinVersion m 2, getMinVersion m 3, getMinVersion m 4)

      let toVersion =
        match m.Groups.[5].Success with
        | false -> None
        | true  -> Some (getMaxVersion m 5, getMaxVersion m 6, getMaxVersion m 7, getMaxVersion m 8)

      Some (fromVersion, toVersion)

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
  let matchesVersionCriteria (versionToCheck: Version) (criteria: VersionCriteria) =
    match criteria with
    | None, None       -> true
    | Some v1, None    -> v1 .<= versionToCheck
    | None, Some v2    -> versionToCheck .< v2
    | Some v1, Some v2 -> v1 .<= versionToCheck && versionToCheck .< v2