namespace DG.XrmDefinitelyTyped

open System

open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Client
open Microsoft.Xrm.Sdk.Messages
open Microsoft.Xrm.Sdk.Query
open Microsoft.Xrm.Sdk.Metadata

module internal CrmDataHelper =

  // Execute request
  let getResponse<'T when 'T :> OrganizationResponse> (proxy:OrganizationServiceProxy) request =
    proxy.Timeout <- TimeSpan(1,0,0)
    (proxy.Execute(request)) :?> 'T

  // Retrieve data
  let internal retrieveMultiple proxy
     logicalName (query:QueryExpression) = 

    query.PageInfo <- PagingInfo()

    let rec retrieveMultiple' 
      (proxy:OrganizationServiceProxy) (query:QueryExpression) page cookie =
      seq {
          query.PageInfo.PageNumber <- page
          query.PageInfo.PagingCookie <- cookie
          let resp = proxy.RetrieveMultiple(query)
          yield! resp.Entities

          match resp.MoreRecords with
          | true -> yield! retrieveMultiple' proxy query (page + 1) resp.PagingCookie
          | false -> ()
      }

    retrieveMultiple' proxy query 1 null

  // Get all entities
  let internal getEntities 
    proxy (logicalName:string) (cols:string list) =

    let q = QueryExpression(logicalName)
    if cols.Length = 0 then q.ColumnSet <- ColumnSet(true)
    else q.ColumnSet <- ColumnSet(Array.ofList cols)

    retrieveMultiple proxy logicalName q

  // Get all entities with a filter
  let internal getEntitiesFilter 
    proxy (logicalName:string)
    (cols:string list) (filter:Map<string,obj>) =
    
    let f = FilterExpression()
    filter |> Map.iter(fun k v -> f.AddCondition(k, ConditionOperator.Equal, v))

    let q = QueryExpression(logicalName)
    if cols.Length = 0 then q.ColumnSet <- ColumnSet(true)
    else q.ColumnSet <- ColumnSet(Array.ofList cols)
    q.Criteria <- f
    
    retrieveMultiple proxy logicalName q

  // Retrieve all entity metadata (Ramon Puaj Puaj)
  let getAllEntityMetadataLight proxy =
    let request = RetrieveAllEntitiesRequest()
    request.EntityFilters <- Microsoft.Xrm.Sdk.Metadata.EntityFilters.Entity
    request.RetrieveAsIfPublished <- true

    let resp = getResponse<RetrieveAllEntitiesResponse> proxy request
    resp.EntityMetadata

  // Retrieve all entity metadata
  let getAllEntityMetadata (proxy:OrganizationServiceProxy) =
    let request = RetrieveAllEntitiesRequest()
    request.EntityFilters <- Microsoft.Xrm.Sdk.Metadata.EntityFilters.All
    request.RetrieveAsIfPublished <- true

    let resp = getResponse<RetrieveAllEntitiesResponse> proxy request
    resp.EntityMetadata

  // Retrieve single entity metadata
  let getEntityMetadata (proxy:OrganizationServiceProxy) lname =
    let request = RetrieveEntityRequest()
    request.LogicalName <- lname
    request.EntityFilters <- Microsoft.Xrm.Sdk.Metadata.EntityFilters.All
    request.RetrieveAsIfPublished <- true

    let resp = getResponse<RetrieveEntityResponse> proxy request
    resp.EntityMetadata

  // Retrieve all optionset metadata
  let getAllOptionSetMetadata proxy =
    let request = RetrieveAllOptionSetsRequest()
    request.RetrieveAsIfPublished <- true

    let resp = getResponse<RetrieveAllOptionSetsResponse> proxy request
    resp.OptionSetMetadata

  // Retrieve entity form xml
  let getEntityForms proxy (lname:string) =
    let query = new QueryExpression("systemform")
    query.ColumnSet <- new ColumnSet([| "name"; "type"; "objecttypecode"; "formxml" |])

    query.Criteria.AddCondition(new ConditionExpression("objecttypecode", ConditionOperator.Equal, lname))
    
    let request = RetrieveMultipleRequest()
    request.Query <- query

    let resp = getResponse<RetrieveMultipleResponse> proxy request
    resp.EntityCollection.Entities 
    |> Array.ofSeq


  // Retrieve all entity form xmls
  let getAllEntityForms proxy =
    let query = new QueryExpression("systemform")
    query.ColumnSet <- new ColumnSet([| "name"; "type"; "objecttypecode"; "formxml" |])
    
    let request = RetrieveMultipleRequest()
    request.Query <- query
    
    let resp = getResponse<RetrieveMultipleResponse> proxy request
    resp.EntityCollection.Entities 
    |> Array.ofSeq


  // Retrieve fields for bpf
  let getBpfData (proxy:OrganizationServiceProxy) =
    let query = new QueryExpression("workflow")
    query.ColumnSet <- new ColumnSet([| "name"; "clientdata"; "category"; "primaryentity" |])

    query.Criteria.AddCondition(new ConditionExpression("category", ConditionOperator.Equal, 4)) // BPF
    query.Criteria.AddCondition(new ConditionExpression("clientdata", ConditionOperator.NotNull))
    let request = RetrieveMultipleRequest()
    request.Query <- query
    
    let resp = getResponse<RetrieveMultipleResponse> proxy request
    resp.EntityCollection.Entities 
    |> Array.ofSeq

  // Retrieve a single entity metadata along with any intersect
  let retrieveEntityAndDependentMetadata proxy allLogicalNames logicalName =
    let metadata = getEntityMetadata proxy logicalName
    let m2mRels = 
      metadata.ManyToManyRelationships 
      |> Array.filter (fun m2m -> 
        m2m.Entity1LogicalName = logicalName && 
        Set.contains m2m.Entity2LogicalName allLogicalNames)

      |> Array.map (fun m2m -> getEntityMetadata proxy m2m.IntersectEntityName)      
      |> List.ofArray

    metadata :: m2mRels

  // Retrieve activityparty entity metadata along with any necessary intersect
  let retrieveActivityPartyAndDependentMetadata proxy allLogicalNames =
    let metadata = getEntityMetadata proxy "activityparty"
    let m2mRels = 
      metadata.ManyToManyRelationships 
      |> Array.filter (fun m2m -> 
        Set.contains m2m.Entity2LogicalName allLogicalNames)
      |> Array.map (fun m2m -> getEntityMetadata proxy m2m.IntersectEntityName)      
      |> List.ofArray

    metadata :: m2mRels

  // Retrieve single entity metadata
  let getEntityLogicalNameFromId (proxy:OrganizationServiceProxy) metadataId =
    let request = RetrieveEntityRequest()
    request.MetadataId <- metadataId
    request.EntityFilters <- Microsoft.Xrm.Sdk.Metadata.EntityFilters.Entity
    request.RetrieveAsIfPublished <- true

    let resp = getResponse<RetrieveEntityResponse> proxy request
    resp.EntityMetadata.LogicalName


  // Retrieves all the logical names of a solution
  let retrieveSolutionEntities proxy solutionName =
    let solutionFilter = [("uniquename", solutionName)] |> Map.ofList
    let solutions = 
      getEntitiesFilter proxy "solution" 
        ["solutionid"; "uniquename"] solutionFilter
    
    solutions
    |> Seq.map (fun sol ->
      let solutionComponentFilter = 
        [ ("solutionid", sol.Attributes.["solutionid"]) 
          ("componenttype", 1 :> obj) 
        ] |> Map.ofList

      getEntitiesFilter proxy "solutioncomponent" 
        ["solutionid"; "objectid"; "componenttype"] solutionComponentFilter
      |> Seq.map (fun sc -> 
        getEntityLogicalNameFromId proxy (sc.Attributes.["objectid"] :?> Guid))
    )
    |> Seq.concat