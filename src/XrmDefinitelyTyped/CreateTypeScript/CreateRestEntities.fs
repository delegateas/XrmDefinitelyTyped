module internal DG.XrmDefinitelyTyped.CreateRestEntities 

open TsStringUtil
open IntermediateRepresentation

(** Interface name helper functions *)
let strConcat = sprintf "%s%s"
let superEntityName = "RestEntity"
let mappingName = "RestMapping"
let baseName x = strConcat x "Base"
let resultName x = strConcat x "Result"
let selectName x = strConcat x "_Select"
let filterName x = strConcat x "_Filter"
let expName x = strConcat x "_Expand"

(** Type helper functions *)
let arrayOf = TsType.Custom >> TsType.Array

let attribute t = TsType.Generic("RestAttribute",t)
let expandable t u = TsType.Generic("RestExpand", sprintf "%s,%s" (selectName t) (selectName u))
let valueContainer t = TsType.SpecificGeneric("XQR.ValueContainerFilter", [ t ])
let results = sprintf "%sResult" >> fun x -> TsType.Generic("SDK.Results", x) 

(** TypeScript helper functions *)
let getSelectVariables selectName (list: XrmAttribute list) = 
  list |> List.map (fun v -> 
    Variable.Create(v.schemaName, attribute selectName))


let getExpandVariables entityName (list: XrmRelationship list) = 
  list |> List.map (fun r -> 
    Variable.Create(r.schemaName, expandable entityName r.relatedSchemaName))


let getOrgVariables (list: XrmAttribute list) = 
  list |> List.map (fun v -> 
    let vType = 
      match v.specialType with
      | SpecialType.OptionSet       -> TsType.SpecificGeneric("SDK.OptionSet", [v.varType])
      | SpecialType.Money           -> TsType.Custom "SDK.Money"
      | SpecialType.EntityReference -> TsType.Custom "SDK.EntityReference"
      | SpecialType.Decimal         -> TsType.String
      | _ -> v.varType
      |> fun ty -> TsType.Union [ty; TsType.Null]
    Variable.Create(v.schemaName, vType, optional = true))

let getFilterVariables (list: XrmAttribute list) = 
  list |> List.map (fun v -> 
    let vType = 
      match v.specialType with
      | SpecialType.OptionSet       -> valueContainer v.varType
      | SpecialType.Money           -> valueContainer TsType.Number
      | SpecialType.EntityReference -> TsType.Custom "XQR.EntityReferenceFilter"
      | SpecialType.Guid            -> TsType.Custom "XQR.Guid"
      | _ -> v.varType
    Variable.Create(v.schemaName, vType))


let getRelationshipVariables isResult (list: XrmRelationship list) =
  list |> List.map (fun r -> 
    match r.referencing, isResult with
    | true, _       -> TsType.Custom 
    | false, false  -> arrayOf
    | false, true   -> results
    |> fun tyFunc -> TsType.Union [tyFunc r.relatedSchemaName; TsType.Null]
    |> fun ty -> Variable.Create(r.schemaName, ty, optional = true))


(** Code creation methods *)

/// Create entity interfaces
let getEntityInterfaces ns e = 
  let baseName = baseName e.schemaName
  let selName = selectName e.schemaName
  let expName = expName e.schemaName
  let resultName = resultName e.schemaName
  let filterName = filterName e.schemaName

  let mapping = 
    [ e.schemaName; selName; expName; filterName; resultName ]
    |> CreateCommon.wrapNamesInNsIfAny ns
    |> fun interfaces ->
      Variable.Create(
        e.schemaName, TsType.Generic (mappingName, 
          (interfaces |> String.concat ",")))

  let is = 
    [ Interface.Create(baseName, 
        vars = (e.attributes |> getOrgVariables),
        extends = [superEntityName])
      Interface.Create(e.schemaName, 
        vars = (e.availableRelationships |> getRelationshipVariables false),
        extends = [baseName])
      Interface.Create(resultName, 
        vars = (e.availableRelationships |> getRelationshipVariables true),
        extends = [baseName])

      // XrmQuery interfaces
      Interface.Create(selName, 
        vars = (e.attributes |> getSelectVariables selName),
        extends = [expName])
      Interface.Create(filterName, 
        vars = (e.attributes |> getFilterVariables))
      Interface.Create(expName, 
        vars = (e.availableRelationships |> getExpandVariables e.schemaName))

    ]

  let ns = Namespace.Create(ns, declare = true, interfaces = is)
  List.concat 
    [ CreateCommon.skipNsIfEmpty ns
      Interface.Create("RestEntities", vars = [mapping]) |> interfaceToString
    ]

  

/// Create blank interfaces for rest-entities.d.ts
let getBlankEntityInterfaces ns es = 
  let queryMapping = 
    Interface.Create(sprintf "%s<O, S, E, F, R>" mappingName)

  let is =
    es
    |> Array.map (fun e ->
      let bn = baseName e.schemaName 
      [ Interface.Create(bn, extends = [superEntityName])
        Interface.Create(resultName e.schemaName, extends = [bn])
        Interface.Create(selectName e.schemaName)
        Interface.Create(e.schemaName, extends = [bn]) ])
    |> List.concat
    |> fun list -> queryMapping :: Interface.Create(superEntityName) :: list 
    
  let ns = Namespace.Create(ns, declare = true, interfaces = is)
  CreateCommon.skipNsIfEmpty ns
    