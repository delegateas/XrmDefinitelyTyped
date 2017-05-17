module DG.XrmDefinitelyTyped.DataRetrieval

open System
open Utility

open CrmBaseHelper
open CrmDataHelper


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

/// Retrieve version from CRM
let retrieveCrmVersion mainProxy =
  printf "Retrieving CRM version..."

  let version = 
    CrmBaseHelper.retrieveVersion mainProxy

  printfn "Done!"
  version

/// Retrieve all the necessary CRM data
let retrieveCrmData crmVersion entities mainProxy proxyGetter =
  let nameMap = 
    retrieveEntityNameMap mainProxy

  let rawEntityMetadata = 
    retrieveEntityMetadata entities mainProxy proxyGetter
    
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
    |> Array.Parallel.map (fun em -> 
      let proxy = proxyGetter()
      em.LogicalName, 
      getEntityForms proxy em.LogicalName)
    |> Map.ofArray
  printfn "Done!"

  { 
    RawState.metadata = rawEntityMetadata
    nameMap = nameMap
    bpfData = bpfData
    formData = formData 
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
