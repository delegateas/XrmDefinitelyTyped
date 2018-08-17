module DG.XrmDefinitelyTyped.Setup

open System
open System.Collections.Generic

open IntermediateRepresentation
open InterpretEntityMetadata
open InterpretBpfJson
open InterpretFormXml
open InterpretView
open InterpretAction


let intersectMappedSets a b = Map.ofSeq (seq {
  for KeyValue(k, va) in a do
    match Map.tryFind k b with
    | Some vb -> yield k, Set.intersect va vb
    | None    -> () })

// Reduces a list of quadruple sets to a single quadruple set
let intersectFormQuads =
  Seq.reduce (fun (d1, a1, c1, t1) (d2, a2, c2, t2) ->
    Set.union d1 d2, Set.intersect a1 a2, Set.intersect c1 c2, intersectMappedSets t1 t2)

let intersectContentByGuid typ (dict: IDictionary<Guid, 'a>) ((name, guids): Intersect) contentMap reduce =
  guids 
  |> Seq.choose (fun g ->
    match dict.ContainsKey g with
    | true  -> Some dict.[g]
    | false -> printfn "%s with GUID %A was not found" typ g; None)

  |> Seq.map contentMap
  |> reduce
  |> fun q -> name, q

// Makes intersection of forms by guid
let intersectFormContentByGuid (formDict: IDictionary<Guid, XrmForm>) intersect =
  let contentMap =
    (fun (f: XrmForm) -> 
      f.entityDependencies |> Set.ofSeq,  
      f.attributes |> Set.ofList, 
      f.controls |> Set.ofList, 
      f.tabs |> Seq.map (fun (name, iname, sections) -> (name, iname), sections |> Set.ofList) |> Map.ofSeq)

  intersectContentByGuid "Form" formDict intersect contentMap intersectFormQuads

// Makes intersection of views by guid
let intersectViewContentByGuids (viewDict: IDictionary<Guid, XrmView>) intersect =
  let contentMap =
    (fun (v: XrmView) ->
      v.attributes |> Set.ofList,
      v.linkedAttributes |> Set.ofList
      )
  
  let reduce = Seq.reduce(fun (a1, la1) (a2, la2) -> Set.intersect a1 a2, Set.intersect la1 la2)
  
  intersectContentByGuid "View" viewDict intersect contentMap reduce

let intersect (dict: IDictionary<Guid, 'a>) instersectContentByGuids mapContent =
  Array.distinctBy fst
  >> Array.Parallel.map (instersectContentByGuids dict)
  >> Seq.map mapContent

// Intersect forms based on argument
let intersectForms formDict formsToIntersect =
  let contentMap =
    (fun (name, (deps, a, c, t)) -> 
    { XrmForm.name = name
      entityName = "_special"
      guid = None
      entityDependencies = deps |> Set.toSeq
      formType = None
      attributes = a |> Set.toList
      controls = c |> Set.toList
      tabs = t |> Map.toList |> List.map (fun ((k1, k2), v) -> k1, k2, v |> Set.toList)
    })

  intersect formDict intersectFormContentByGuid contentMap formsToIntersect
  |> Seq.append formDict.Values
  |> Seq.toArray

// Intersect views based on argument
let intersectViews (viewDict: IDictionary<Guid, XrmView>) viewsToIntersect =
  if viewDict.Count > 0 then
    let contentMap =
      (fun (name, (attributes, linkedAttributes)) -> 
      { XrmView.name = name
        entityName = "_special"
        attributes = attributes |> Set.toList
        linkedAttributes = linkedAttributes |> Set.toList
      })

    intersect viewDict intersectViewContentByGuids contentMap viewsToIntersect

  else Seq.empty

/// Interprets the raw CRM data into an intermediate state used for further generation
let interpretCrmData out formsToIntersect viewsToIntersect (rawState: RawState) =
  printf "Interpreting data..."

  let schemaNames = 
      rawState.metadata
      |> Array.Parallel.map (fun em -> em.SchemaName)
      |> Set.ofArray

  let entityMetadata =
    rawState.metadata |> Array.Parallel.map (interpretEntity schemaNames rawState.nameMap)

  let viewDict =
    rawState.viewData 
    |> Array.map(interpretView entityMetadata)
    |> dict

  let viewData = 
    intersectViews viewDict viewsToIntersect
    |> Seq.append viewDict.Values
    |> Seq.toArray

  let actionData =
    rawState.actionData
    |> Array.map (interpretAction rawState.nameMap)

  let bpfControls = interpretBpfs rawState.bpfData

  let formDict = interpretFormXmls entityMetadata rawState.formData bpfControls
  let forms = intersectForms formDict formsToIntersect
  printfn "Done!"

  { InterpretedState.entities = entityMetadata
    bpfControls = bpfControls
    forms = forms
    imageWebResourceNames = rawState.imageWebResourceNames
    lcidData = rawState.lcidData
    viewData = viewData
    outputDir = out 
    actionData = actionData
  }
