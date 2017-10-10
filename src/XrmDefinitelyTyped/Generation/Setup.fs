module DG.XrmDefinitelyTyped.Setup

open System
open System.Collections.Generic

open IntermediateRepresentation
open InterpretEntityMetadata
open InterpretBpfJson
open InterpretFormXml
open InterpretView


let intersectMappedSets a b = Map.ofSeq (seq {
  for KeyValue(k, va) in a do
    match Map.tryFind k b with
    | Some vb -> yield k, Set.intersect va vb
    | None    -> () })

// Reduces a list of quadruple sets to a single quadruple set
let intersectFormQuads =
  Seq.reduce (fun (d1, a1, c1, t1) (d2, a2, c2, t2) ->
    Set.union d1 d2, Set.intersect a1 a2, Set.intersect c1 c2, intersectMappedSets t1 t2)

// Makes intersection of forms by guid
let intersectFormContentByGuid (formDict: IDictionary<Guid, XrmForm>) ((name, guids): FormIntersect) =
  guids 
  |> Seq.choose (fun g ->
    match formDict.ContainsKey g with
    | true  -> Some formDict.[g]
    | false -> printfn "Form with GUID %A was not found" g; None)

  |> Seq.map (fun f -> 
    f.entityDependencies |> Set.ofSeq,  
    f.attributes |> Set.ofList, 
    f.controls |> Set.ofList, 
    f.tabs |> Seq.map (fun (name, iname, sections) -> (name, iname), sections |> Set.ofList) |> Map.ofSeq)

  |> intersectFormQuads
  |> fun q -> name, q

// Intersect forms based on argument
let intersectForms formDict =
  Array.distinctBy fst
  >> Array.Parallel.map (intersectFormContentByGuid formDict)
  >> Seq.map (fun (name, (deps, a, c, t)) -> 
    { XrmForm.name = name
      entityName = "_special"
      entityDependencies = deps |> Set.toSeq
      formType = None
      attributes = a |> Set.toList
      controls = c |> Set.toList
      tabs = t |> Map.toList |> List.map (fun ((k1, k2), v) -> k1, k2, v |> Set.toList)
    })
  >> Seq.append formDict.Values
  >> Array.ofSeq

/// Interprets the raw CRM data into an intermediate state used for further generation
let interpretCrmData out toIntersect (rawState: RawState) =
  printf "Interpreting data..."

  let schemaNames = 
      rawState.metadata
      |> Array.Parallel.map (fun em -> em.SchemaName)
      |> Set.ofArray

  let entityMetadata =
    rawState.metadata |> Array.Parallel.map (interpretEntity schemaNames rawState.nameMap)

  let viewData =
    rawState.viewData |> Array.map(interpretView entityMetadata)

  let bpfControls = interpretBpfs rawState.bpfData

  let formDict = interpretFormXmls entityMetadata rawState.formData bpfControls
  let forms = intersectForms formDict toIntersect
  printfn "Done!"

  { InterpretedState.entities = entityMetadata
    bpfControls = bpfControls
    forms = forms
    imageWebResourceNames = rawState.imageWebResourceNames
    lcidData = rawState.lcidData
    viewData = viewData
    outputDir = out 
  }
