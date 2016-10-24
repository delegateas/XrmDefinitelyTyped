namespace DG.XrmDefinitelyTyped

open Utility
open InterpretFormXml
open IntermediateRepresentation

open Microsoft.Xrm.Sdk
open System.Runtime.Serialization
open System.Collections.Generic

module internal InterpretBpfJson =

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
    }

  /// Recursive helper function to analyze a BPF json file
  let rec analyzeEntity (data:List<InnerData>) (fields:ControlField list) : ControlField list =
    data.ToArray()
    |> Array.map(fun d ->
      match d.__class with
      | StartsWith "StageStep" () 
      | StartsWith "StepStep" ()  -> analyzeEntity d.steps.list fields
      | StartsWith "ControlStep" () -> 
        ( d.controlId, 
          d.dataFieldName, 
          getControlClass d.controlId d.classId) :: fields
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
      let data = e.Attributes.["clientdata"] :?> string |> parseJson<OuterData>
      analyze data.steps.list)
    |> Array.concat
    |> Array.groupBy fst
    |> Array.map (fun (lname,x) -> 
      lname, 
      x |> Array.map snd 
      |> List.concat 
      |> List.distinctBy (fun (id,_,_) -> id)
      |> List.map (fun (id, datafieldname, controlClass) -> 
        sprintf "header_process_%s" id, datafieldname, controlClass))
    |> Map.ofArray