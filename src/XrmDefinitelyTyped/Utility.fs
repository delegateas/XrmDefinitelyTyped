namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Runtime.Serialization.Json
open System.Text
open System.Text.RegularExpressions

module Utility =

  let (|>>) x g = g x; x
  let (?>>) m f = Option.bind f m
  let (?|>) m f = Option.map f m
  let (|?) = defaultArg

  let parseInt str =
    let mutable intvalue = 0
    if System.Int32.TryParse(str, &intvalue) then Some(intvalue)
    else None

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

  let parseVersion (str:string) =
    let vArr = str.Split('.')
    let getIdx idx = Array.tryItem idx vArr ?>> parseInt |? 0
    (getIdx 0, getIdx 1, getIdx 2, getIdx 3)

  let checkVersion (a1,b1,c1,d1) (a2,b2,c2,d2) =
    ([a2;b2;c2;d2], [a1;b1;c1;d1])
    ||> List.map2 (-)
    |> List.tryFind ((<>) 0)
    ?|> fun x -> x > 0
    |? true
