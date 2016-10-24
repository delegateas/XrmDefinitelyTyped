namespace DG.XrmDefinitelyTyped

open System

open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Client
open Microsoft.Xrm.Sdk.Messages
open Microsoft.Xrm.Sdk.Query
open Microsoft.Xrm.Sdk.Metadata

open Utility
open CrmBaseHelper

module internal CrmDataHelper =

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
