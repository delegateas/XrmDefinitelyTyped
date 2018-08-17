module internal DG.XrmDefinitelyTyped.InterpretAction

open System.Xml.Linq
open System.Text.RegularExpressions
open DG.XrmDefinitelyTyped.IntermediateRepresentation
open System.IO
open System.Reflection

let name x = XName.Get(x)

let xPrefix = "{http://schemas.microsoft.com/winfx/2006/xaml}"
let mxPrefix = "{clr-namespace:Microsoft.Xrm.Sdk.Workflow;assembly=Microsoft.Xrm.Sdk.Workflow, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35}"

let parseActionType name typ optional =
  let regex = Regex(@"([A-Z]{1}[a-z]{1,2})Argument\([mxs]{1,3}:([a-zA-Z]*[0-9]*)\)")
  let m = regex.Match(typ)
  match m.Success with
  | false -> None
  | true -> 
    if m.Groups.[1].Success && m.Groups.[2].Success 
    then Some (name, (m.Groups.[2].Value), optional, (m.Groups.[1].Value = "Out")) 
    else None

let isRealParameter (_, _, (xaml:XElement)) =
  xaml
    .Element(name (mxPrefix + "ArgumentTargetAttribute"))
    .Attribute(name "Value").Value = "False"

let interpretXaml xaml =  
  XDocument.Parse(xaml)
    .Element(name "{http://schemas.microsoft.com/netfx/2009/xaml/activities}Activity")
    .Element(name (xPrefix + "Members"))
    .Elements(name (xPrefix + "Property"))
  |> List.ofSeq  
  |> List.filter (fun (prop:XElement) -> prop.HasElements)
  |> List.map (fun (prop:XElement) -> 
    prop.Attribute(name "Name").Value, 
    prop.Attribute(name "Type").Value, 
    prop.Element(name (xPrefix + "Property.Attributes")))
  |> List.filter isRealParameter
  |> List.choose (
    fun (n, typ, attributes) -> 
      let optional = 
        attributes
          .Element(name (mxPrefix + "ArgumentRequiredAttribute"))
          .Attribute(name "Value").Value = "False"

      parseActionType n typ optional
  )


let (|Prefix|_|) (p:string) (s:string) =
    if s.StartsWith(p) then
        Some(s.Substring(p.Length))
    else
        None

let getParameterSubType = function
  | "Guid"
  | "String" -> TsType.String
  | "Int32"
  | "Decimal"
  | "Double"
  | "Money"
  | "OptionSetValue" -> TsType.Number
  | "Boolean" -> TsType.Boolean
  | "Entity" -> TsType.Any
  | "EntityReference" -> TsType.Custom "Xrm.EntityReference<string>"
  | "EntityCollection" -> TsType.Array TsType.Any
  | "DateTime" -> TsType.Date
  | _ -> TsType.Undefined

let rec getParameterType = function
  | Prefix "Collection(" rest -> TsType.Array(getParameterType (rest.TrimEnd(')')))
  | Prefix "mscrm." _ -> TsType.Any
  | Prefix "Edm." typ
  | typ -> getParameterSubType typ

let parseParameter isInput (parameter:XElement) : ActionParameter =
  parameter.Attribute(name "Name").Value, 
  parameter.Attribute(name "Type").Value, 
  parameter.Attribute(name "Nullable") = null, 
  isInput

let parseReturnType (typ:XElement) (returnTypes: Map<string, ActionParameter list>) =
  if typ = null then [] else
  match Map.tryFind (typ.Attribute(name "Type").Value) returnTypes with
  | None -> []
  | Some parameters -> parameters

let parseComplexType (typ:XElement) =
  sprintf "%s.%s" "mscrm" (typ.Attribute(name "Name").Value), 
  typ.Elements(name "Property") 
  |> Seq.toList
  |> List.map (parseParameter true) 

let interpretActionXml: ActionData[] =
  let assembly = Assembly.GetExecutingAssembly()
  use res = assembly.GetManifestResourceStream("actions.xml")
  use sr = new StreamReader(res)

  let xml = XDocument.Load(sr).Element(name "Actions")

  let returnTypes =
    xml.Elements(name "ComplexType")
    |> Seq.map parseComplexType
    |> Map.ofSeq
    
  xml.Elements(name "Action")
  |> Seq.toArray
  |> Array.map(
    fun (e:XElement) -> 
      let actionName = e.Attribute(name "Name").Value
      let isBound = e.Attribute(name "IsBound") <> null
      let inputParameters, boundEntities =
        (e.Elements(name "Parameter"))
        |> Seq.map (parseParameter false)
        |> Seq.toList
        |> List.partition (fun (name, _, _, _) -> name <> "entity" && name <> "entityset")
      let outputParameters = parseReturnType (e.Element(name "ReturnType")) returnTypes
      let primaryEntity =
        match isBound with
        | false -> ""
        | true -> 
          let (_, typ, _, _) 
            = (boundEntities |> List.head)
          typ
        
      actionName, primaryEntity, inputParameters @ outputParameters
  )

let interpretAction nameMap (name, primaryEntity, parameters) =
  let parsedParameters = 
    parameters
    |> List.map (
      fun (name, typ, optional, isOutput) ->
        let vType = getParameterType typ
        { XrmActionParameter.name = name
          varType = vType
          optional = optional
          isOutputParameter = isOutput}
    )

  let boundEntity =
    match primaryEntity with
    | Prefix "mscrm." e
    | e ->
      match Map.tryFind e nameMap with
      | None -> None
      | Some entityName -> Some (snd entityName)

  { XrmAction.name = name
    boundEntity = boundEntity
    parameters = parsedParameters }