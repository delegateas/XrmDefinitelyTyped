module internal DG.XrmDefinitelyTyped.InterpretAction

open System.Xml.Linq
open System.Text.RegularExpressions
open DG.XrmDefinitelyTyped.IntermediateRepresentation

let getParameterType = function
  | "String" -> TsType.String, SpecialType.Default
  | "Int32" -> TsType.Number, SpecialType.Default
  | "Boolean" -> TsType.Boolean, SpecialType.Default
  | "Decimal" -> TsType.Number, SpecialType.Decimal
  | "Double" -> TsType.Number, SpecialType.Decimal
  | "Entity" 
  | "EntityReference" -> TsType.String, SpecialType.EntityReference
  | _ -> TsType.Undefined, SpecialType.Default

let parseActionType (name, typ) =
  let regex = Regex(@"([A-Z]{1}[a-z]{1,2})Argument\([mxs]{1,3}:([a-zA-Z]*[0-9]*)\)")
  let m = regex.Match(typ)
  match m.Success with
  | false -> None
  | true -> if m.Groups.[1].Success && m.Groups.[2].Success then Some (name, m.Groups.[1].Value, getParameterType (m.Groups.[2].Value)) else None

let interpretXaml xaml =
  let xml = XDocument.Parse(xaml)

  let xPrefix = "{http://schemas.microsoft.com/winfx/2006/xaml}"

  let parsedParameters = 
    xml.Element(XName.Get("{http://schemas.microsoft.com/netfx/2009/xaml/activities}Activity")).Element(XName.Get(xPrefix + "Members")).Elements(XName.Get(xPrefix + "Property"))
    |> Seq.filter (fun (prop:XElement) -> prop.HasElements)
    |> Seq.map (fun (prop:XElement) -> prop.Attribute(XName.Get("Name")).Value, prop.Attribute(XName.Get("Type")).Value)
    |> List.ofSeq

  let names, orientations, varTypes =
    parsedParameters
    |> List.choose (fun pp -> parseActionType pp)
    |> List.unzip3


  List.zip3 names orientations varTypes
  |> List.map (fun (name, orientation, (varType, specialType)) -> { XrmActionParameter.name = name; orientation = orientation; varType = varType; specialType = specialType })