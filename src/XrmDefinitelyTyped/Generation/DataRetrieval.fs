module DG.XrmDefinitelyTyped.DataRetrieval

open System
open Utility

open CrmBaseHelper
open CrmDataHelper
open DG.XrmDefinitelyTyped.InterpretView
open Microsoft.Xrm.Sdk.Metadata
open System.Text.RegularExpressions
open InterpretAction


/// Connect to CRM with the given authentication
let connectToCrm xrmAuth =
  printf "Connecting to CRM..."
  let proxy = proxyHelper xrmAuth ()
  printfn "Done!"
  proxy

// Retrieve CRM entity name map
let retrieveEntityNameMap mainProxy =
  printf "Fetching entity names from CRM..."

  let map =
    getAllEntityMetadataLight mainProxy
    |> Array.Parallel.map (fun m -> m.LogicalName, (m.SchemaName, m.EntitySetName))
    |> Map.ofArray

  printfn "Done!"
  map

// Retrieve CRM entity metadata
let retrieveEntityMetadata entities mainProxy proxyGetter =
  printf "Fetching specific entity metadata from CRM..."

  let rawEntityMetadata = 
    match entities with
    | None -> getAllEntityMetadata mainProxy
    | Some logicalNames -> 
      getSpecificEntitiesAndDependentMetadata proxyGetter logicalNames

  printfn "Done!"
  rawEntityMetadata

let getEntityMetadataNameIfMissing entityName (rawEntityMetadata: EntityMetadata[]) = 
  let option = Array.tryFind(fun (em: EntityMetadata) -> em.LogicalName = entityName) rawEntityMetadata

  match option with
  | None -> Some entityName
  | Some x -> None

// Retrieve missing entitymetadat that some views depend on
let retrieveMissingViewDependingEntityMetadata parsedFetchXmlViews mainProxy rawEntityMetadata =
  let allLinkedAttributes = 
    parsedFetchXmlViews
    |> Array.map (fun (_, _, (_, _, (linkedAttributes))) -> linkedAttributes)
    |> List.concat
    |> Array.ofList

  let referencedEntityNames =
    allLinkedAttributes
    |> Array.map (fun ((entityName,_),_) -> entityName)
    |> Array.distinct

  let missingEntityMetadataNames =
    referencedEntityNames
    |> Array.choose(fun referencedEntityName -> getEntityMetadataNameIfMissing referencedEntityName rawEntityMetadata)
  
  getEntityMetadataBulk mainProxy missingEntityMetadataNames
  
// Retrieve CRM views
let retrieveViews entitiesToFetch rawEntityMetadata mainProxy : ViewData[] * EntityMetadata[] =
  printf "Fetching specific views from CRM..."

  let _,rawViews =
    getViews entitiesToFetch mainProxy
    |> Seq.fold (fun previous (entityName, guid, viewName, fetchXml) ->
    let (previousNames, previousViews) = previous
    let regex = new Regex(@"[^a-zA-Z0-9_]")
    let trimmedName = 
      regex.Replace(viewName, "")
      |> fun s -> if Char.IsNumber(s, 0) then "_" + s else s
    let fullName = (sprintf "%s_%s" entityName trimmedName)

    let duplicates, nextMap = 
      match Map.tryFind fullName previousNames with
      | Some i -> i, Map.add fullName (i + 1) previousNames
      | None -> 0, Map.add fullName 1 previousNames
    
    let safeName = if duplicates > 0 then trimmedName + duplicates.ToString() else trimmedName
    nextMap, (guid, safeName, fetchXml)::previousViews) (Map.empty, [])

  let fetchXmlParsedViews =
    rawViews
    |> List.map (fun (guid, name, fetchxml) -> (guid, name, intepretFetchXml fetchxml))
    |> Array.ofList
    
  let missingEntityMetadata = 
    rawEntityMetadata
    |> retrieveMissingViewDependingEntityMetadata fetchXmlParsedViews mainProxy
  
  printfn "Done!"
  fetchXmlParsedViews, missingEntityMetadata

let retrieveActions mainProxy: ActionData[] =
  getActionData mainProxy
  |> Seq.rev
  |> Seq.map (fun (name, boundEntity, xaml) -> (name, boundEntity, interpretXaml xaml))
  |> Array.ofSeq

/// Retrieve version from CRM
let retrieveCrmVersion mainProxy =
  printf "Retrieving CRM version..."

  let version = 
    CrmBaseHelper.retrieveVersion mainProxy

  printfn "Done!"
  version

/// Retrieve all the necessary CRM data
let retrieveCrmData crmVersion entities solutions mainProxy proxyGetter =
  let nameMap = 
    retrieveEntityNameMap mainProxy

  let originalRawEntityMetadata = 
    retrieveEntityMetadata entities mainProxy proxyGetter
    |> Array.sortBy(fun md -> md.LogicalName)
    
  let rawViewData, additionalEntityMetadata = 
    match crmVersion .>= (8,2,0,0) with
    | false -> [||], [||]
    | true  -> retrieveViews entities originalRawEntityMetadata mainProxy

  let imageWebResources =
    match crmVersion .>= (8,2,0,0) with
    | false -> [||]
    | true  -> getImgWebResourceNames solutions mainProxy

  let localIDs = 
    match crmVersion .>= (8,2,0,0) with
    | false -> [||]
    | true  -> getLCIDS mainProxy

  let rawEntityMetadata =
    Array.append originalRawEntityMetadata additionalEntityMetadata
  
  let defaultActionData =
    interpretActionXml

  let customActionData =
    retrieveActions mainProxy

  let actionData =
    Array.append defaultActionData customActionData

  let bpfData = 
    match crmVersion .>= (6,0,0,0) with
    | false -> [||]
    | true  -> 
      printf "Fetching BPF metadata from CRM..."
      let data = getBpfData mainProxy
      printfn "Done!"
      data


  printf "Fetching FormXmls from CRM..."
  let formData =
    rawEntityMetadata
    |> Array.filter (fun (em: EntityMetadata) -> em.CanCreateForms.Value && em.CanCreateAttributes.Value)
    |> Array.Parallel.map (fun em -> 
      let proxy = proxyGetter()
      em.LogicalName, 
      getEntityForms proxy em.LogicalName)
    |> Map.ofArray
  printfn "Done!"

  { 
    RawState.metadata = rawEntityMetadata
    nameMap = nameMap
    imageWebResourceNames = imageWebResources
    lcidData = localIDs
    viewData = rawViewData
    bpfData = bpfData
    formData = formData 
    actionData = actionData
    crmVersion = crmVersion
  }


/// Gets all the entities related to the given solutions and merges with the given entities
let getFullEntityList entities solutions proxy =
  printf "Figuring out which entities should be included in the context.."
  let solutionEntities = 
    match solutions with
    | Some sols -> 
      sols 
      |> Array.map (CrmBaseHelper.retrieveSolutionEntities proxy)
      |> Seq.concat |> Set.ofSeq
    | None -> Set.empty

  let finalEntities =
    match entities with
    | Some ents -> Set.union solutionEntities (Set.ofArray ents)
    | None -> solutionEntities

  printfn "Done!"
  match finalEntities.Count with
  | 0 -> 
    printfn "Creating context for all entities"
    None

  | _ -> 
    let entitySet = finalEntities |> Set.toArray 
    printfn "Creating context for the following entities:"
    entitySet |> Array.iter (printfn "\t- %s")
    Some entitySet
