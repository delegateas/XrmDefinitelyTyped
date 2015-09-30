namespace DG.XrmDefinitelyTyped

open System.IO
open System.Runtime.Serialization.Json
open System.Text
open System.Text.RegularExpressions

module Utility =

  let (|>>) x g = g x; x

  let (|?) = defaultArg
  let (|StartsWithNumber|) (str:string) = str.Length > 0 && str.[0] >= '0' && str.[0] <= '9'
  let (|StartsWith|_|) needle (haystack : string) = if haystack.StartsWith(needle) then Some() else None

  let getConstantType (name:string) = name.Replace("\\", "\\\\").Replace("\"", "\\\"") |> sprintf "\"%s\"" |> Type.Custom

  let keywords = [ "import"; "export"; "class"; "enum"; "var"; "for"; "if"; "else"; "const"; "true"; "false" ] |> Set.ofList
  let unknownLabel = "_Unknown"
  let (|IsKeyword|) = keywords.Contains

  let sanitizeString str = 
    Regex.Replace(str, @"[^\w]", "")
    |> fun str ->
      match str with
      | StartsWithNumber true
      | IsKeyword true -> sprintf "_%s" str
      | "" -> unknownLabel
      | _ -> str
  

  let parseJson<'t> (jsonString:string)  : 't =  
    use ms = new MemoryStream(ASCIIEncoding.UTF8.GetBytes(jsonString)) 
    let obj = (new DataContractJsonSerializer(typeof<'t>)).ReadObject(ms) 
    obj :?> 't

  