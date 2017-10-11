module internal DG.XrmDefinitelyTyped.CrmDataHelper

open Microsoft.Xrm.Sdk.Client
open Microsoft.Xrm.Sdk.Messages
open Microsoft.Xrm.Sdk.Query

open CrmBaseHelper
open Microsoft.Crm.Sdk.Messages
open Microsoft.Xrm.Sdk


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

// Retrieve views
let getViews (entities: string[] option) proxy =
  let query = new QueryExpression("savedquery")
  query.ColumnSet <- new ColumnSet([| "name"; "querytype"; "returnedtypecode"; "fetchxml" |])

  query.Criteria.AddCondition(new ConditionExpression("querytype", ConditionOperator.Equal, 0)) // Public Views
  query.Criteria.AddCondition(new ConditionExpression("fetchxml", ConditionOperator.NotNull))
  if entities.IsSome then
    query.Criteria.AddCondition(new ConditionExpression("returnedtypecode", ConditionOperator.In, entities.Value))
  let request = RetrieveMultipleRequest()
  request.Query <- query

  let resp = getResponse<RetrieveMultipleResponse> proxy request
  
  resp.EntityCollection.Entities 
  |> Array.ofSeq
  |> Array.map (fun viewEntity -> 
      (viewEntity.GetAttributeValue<string>("returnedtypecode"), viewEntity.GetAttributeValue<string>("name"), viewEntity.GetAttributeValue<string>("fetchxml"))
  )

// Retrieve webresources of given type from given solution
let getWebResourceNamesFromSolution (resourcetypes: int[]) (solution: string) proxy =
  //Query the solution components for web resources
  let query = new QueryExpression("solutioncomponent")
  query.Criteria.AddCondition(new ConditionExpression("componenttype", ConditionOperator.Equal, 61)) // Web Resource
  
  //Make sure to only retrieve componentents belonging to the given solution
  let solutionLink = new LinkEntity("solutioncomponent", "solution", "solutionid", "solutionid", JoinOperator.Inner)
  solutionLink.LinkCriteria.AddCondition(new ConditionExpression("uniquename", ConditionOperator.Equal, solution))
  query.LinkEntities.Add(solutionLink)

  //Get the web resources that match, the guids retrieved from solution component and the given types
  let webresourceLink = new LinkEntity("solutioncomponent", "webresource", "objectid", "webresourceid", JoinOperator.Inner)
  webresourceLink.Columns <- new ColumnSet([|"name"|])
  webresourceLink.LinkCriteria.AddCondition(new ConditionExpression("webresourcetype", ConditionOperator.In, resourcetypes))
  webresourceLink.EntityAlias <- "webresource"
  query.LinkEntities.Add(webresourceLink)

  let request = RetrieveMultipleRequest()
  request.Query <- query

  let resp = getResponse<RetrieveMultipleResponse> proxy request

  //Output an array of the names of the webresources
  resp.EntityCollection.Entities
  |> Seq.map (fun (sc: Entity) -> downcast sc.GetAttributeValue<AliasedValue>("webresource.name").Value : string)
  |> Array.ofSeq

// Retrieve all web resources of the given type
let getAllWebResourceNames (resourcetypes: int[]) proxy =
  let query = new QueryExpression("webresource")
  query.ColumnSet <- new ColumnSet([| "name" |])

  query.Criteria.AddCondition(new ConditionExpression("webresourcetype", ConditionOperator.In, resourcetypes))
  let request = RetrieveMultipleRequest()
  request.Query <- query

  let resp = getResponse<RetrieveMultipleResponse> proxy request

  resp.EntityCollection.Entities
  |> Seq.map (fun img -> img.GetAttributeValue<string>("name"))
  |> Array.ofSeq

//Retrieve image webresources
let getImgWebResourceNames solutions proxy =
  let imageTypes = [|5;6;7|] //Web Resource Image Types (PNG, JPG, GIF)

  match solutions with
  | Some sol -> 
    sol
    |> Array.map (fun sol -> getWebResourceNamesFromSolution imageTypes sol proxy)
    |> Array.concat
    |> Array.distinct

  | None -> getAllWebResourceNames imageTypes proxy

//Retrieve supported languages
let getLCIDS proxy =
 let request = RetrieveAvailableLanguagesRequest()

 let resp = getResponse<RetrieveAvailableLanguagesResponse> proxy request

 resp.LocaleIds