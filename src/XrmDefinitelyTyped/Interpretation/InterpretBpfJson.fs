module internal DG.XrmDefinitelyTyped.InterpretBpfJson

open Utility
open InterpretFormXml
open IntermediateRepresentation

open Microsoft.Xrm.Sdk
open System.Runtime.Serialization
open System.Collections.Generic
open System

// Part of the JSON data model for the "clientdata" attribute on BPF workflows.
// Used to retrieve which fields on which entities are in the BPF forms
[<DataContract>]
type Steps =
  {
    [<field: DataMember(Name = "list")>]
    list: List<InnerData>
  }

and [<DataContract>]OuterData = 
  {
    [<field: DataMember(Name = "__class")>]
    __class: string
    [<field: DataMember(Name = "steps")>]
    steps: Steps
  }

and [<DataContract>]InnerData = 
  {
    [<field: DataMember(Name = "__class")>]
    __class: string
    [<field: DataMember(Name = "description")>]
    description: string
    [<field: DataMember(Name = "steps")>]
    steps: Steps
    [<field: DataMember(Name = "controlId")>]
    controlId: string
    [<field: DataMember(Name = "dataFieldName")>]
    dataFieldName: string
    [<field: DataMember(Name = "classId")>]
    classId: string
    [<field: DataMember(Name = "entity")>]
    entity: RelatedEntity
  }

and [<DataContract>]RelatedEntity =
  {
    [<field: DataMember(Name = "__class")>]
    __class: string
    [<field: DataMember(Name = "parameterName")>]
    parameterName: string
    [<field: DataMember(Name = "entityName")>]
    entityName: string
    [<field: DataMember(Name = "relatedAttributeName")>]
    relatedAttributeName: string
    [<field: DataMember(Name = "relationshipName")>]
    relationshipName: string
  }

/// Recursive helper function to analyze a BPF json file
let rec analyzeEntity (data:List<InnerData>) (fields:ControlField list) : ControlField list =
  data.ToArray()
  |> Array.map(fun d ->
    match d.__class with
    | StartsWith "PageStep" ()
    | StartsWith "StageStep" () 
    | StartsWith "StepStep" ()  -> analyzeEntity d.steps.list fields
    | StartsWith "ControlStep" () -> 
      match box d.controlId with
      | null -> fields
      | _ ->
        let controlClass = getControlClass d.controlId d.classId String.Empty Map.empty // Empty string and map must be replaced to generate proper typings for controls in BPFs
        ( d.controlId, 
          d.dataFieldName, 
          controlClass,
          true,
          false,
          match box d.entity, controlClass with
          | e, Lookup when e <> null -> Some (sprintf "\"%s\"" d.entity.entityName)
          | _, _ -> None
        ) :: fields
    | _ -> fields
  ) |> List.concat

/// Analyzes a BPF json file recursively
let rec analyze (data:List<InnerData>) =
  data.ToArray()
  |> Array.map(fun d ->
    match d.__class with
    | StartsWith "EntityStep" () ->
      Some (d.description, analyzeEntity d.steps.list [])
    | _ -> None) 
  |> Array.choose id


/// Finds all fields present on all the given BPFs and makes a map of them
/// on a per-entity basis.
let interpretBpfs (workflows:Entity[]): Map<string,ControlField list> = 
  workflows
  |> Array.map (fun e ->
    let data = e.GetAttributeValue<string>("clientdata") |> parseJson<OuterData>
    analyze data.steps.list)
  |> Array.concat
  |> Array.groupBy fst
  |> Array.map (fun (lname,x) -> 
    lname, 
    x |> Array.map snd 
    |> List.concat 
    |> List.filter (fun (_, datafieldname,_,_,_,_) -> datafieldname <> String.Empty)
    |> List.map (fun (id, datafieldname, controlClass, canBeNull, _, tes) -> sprintf "header_process_%s" datafieldname, datafieldname,  controlClass, canBeNull, true, tes))
    |> Map.ofArray