module internal DG.XrmDefinitelyTyped.CreateWebEntities

open Utility
open TsStringUtil
open IntermediateRepresentation


(** Interface name helper functions *)
let withEnding ending str = sprintf "%s%s" str ending
let superEntityName = "WebEntity"
let retrieveMapping = "WebMappingRetrieve"
let cudaMapping = "WebMappingCUDA"
let relatedMapping = "WebMappingRelated"

let baseName = withEnding "_Base"
let fixedName = withEnding "_Fixed"
let createName = withEnding "_Create"
let relName = withEnding "_Relationships"
let oneRelName = withEnding "_RelatedOne"
let manyRelName = withEnding "_RelatedMany"

let updateName = withEnding "_Update"
let resultName = withEnding "_Result"
let fResultName = withEnding "_FormattedResult"
let selectName = withEnding "_Select"
let filterName = withEnding "_Filter"
let expName = withEnding "_Expand"

let superResultFixed = fixedName superEntityName

let currencyId = {
  XrmAttribute.logicalName = "transactioncurrencyid"
  schemaName = "TransactionCurrencyId"
  specialType = SpecialType.EntityReference
  varType = TsType.String
  targetEntitySets = Some [| "transactioncurrency", "transactioncurrencies" |]
  readable = true
  createable = true
  updateable = true
}

let entityTag = 
  Variable.Create("\"@odata.etag\"", TsType.String)

let logicalName (a: XrmAttribute) = a.logicalName
let guidName (a: XrmAttribute) = sprintf "%s_guid" a.logicalName
let formattedName (a: XrmAttribute) = sprintf "%s_formatted" a.logicalName

let bindNames (a: XrmAttribute) = 
  a.targetEntitySets ?|> Array.map (fun tes -> (sprintf "%s_bind$%s" a.logicalName (snd tes)))

(** Various type helper functions *)
let arrayOf = TsType.Custom >> TsType.Array
let varsToType =
  varsToInlineInterfaceString >> TsType.Custom

let sortByName = List.sortBy (fun (x: Variable) -> x.name)
let assignUniqueNames =
  List.groupBy (fun (var: Variable) -> var.name)
  >> List.map (fun (_, var) -> 
         var
//         |> Array.sortBy (fun var -> var.guid)
         |> List.mapi (fun i var -> 
                    if i = 0 then var
                    else { var with name = sprintf "%s%i" var.name i }))
  >> List.concat
//  >> sortByName

let concatDistinctSort = 
  List.concat >> List.distinctBy (fun (x: Variable) -> x.name) >> sortByName

let mergeOwnerId (vars: Variable list) =
  let owner, notOwner =
    vars
    |> List.partition (fun var -> var.name = "ownerid")
  
  match owner.IsEmpty with
  | true -> notOwner
  | false ->
    let combinedOwner =
      let varTypes =
        owner
        |> List.fold (fun (types: TsType list) var ->
          match var.varType with
          | None -> types
          | Some t -> t :: types
        ) []
      Variable.Create("ownerid",TsType.Intersection varTypes)
    combinedOwner :: notOwner


let hasFormattedValue a = 
  match a.specialType, a.varType with
  | SpecialType.EntityReference, _
  | SpecialType.Money, _
  | SpecialType.OptionSet, _
  | SpecialType.MultiSelectOptionSet, _
  | _, TsType.Date -> true
  | _ -> false

let getMapping eName ns name =
  List.map (fun f -> f eName)
  >> CreateCommon.wrapNamesInNsIfAny ns
  >> fun names -> TsType.Generic (name, names |> String.concat ",")
  
let retrieveMappingType eName ns =
  [ selectName; expName; filterName; fixedName; resultName; fResultName ]
  |> getMapping eName ns retrieveMapping

let cudaMappingType eName ns =
  [ createName; updateName; selectName ]
  |> getMapping eName ns cudaMapping
  
let relatedMappingType eName ns =
  [ oneRelName; manyRelName ]
  |> getMapping eName ns relatedMapping

(** Definition functions *)
let defToBaseVars (a, ty, nameTransform) =
  Variable.Create(nameTransform ?| logicalName <| a, TsType.Union [ ty; TsType.Null ], optional = true) 

let defToResVars (a, ty, nameTransform) =
  Variable.Create(nameTransform ?| logicalName <| a, TsType.Union [ ty; TsType.Null ]) 

let defToFormattedVars (a, _, _) =
  Variable.Create(formattedName a, TsType.String, optional = true) 


let getEntityRefDef nameFormat (a: XrmAttribute) =
  nameFormat a, [ a, a.varType, Some guidName ]

let getResultDef a = 
  let vType = a.varType
  let name = a.logicalName

  match a.specialType with
  | SpecialType.EntityReference -> getEntityRefDef guidName a
  | SpecialType.Money -> name, [ a, vType, None; currencyId, TsType.String, Some guidName ]
  | SpecialType.Decimal -> name, [ a, TsType.Number, None ]
  | _ -> name, [ a, vType, None ]

(** Variable functions *)
let getSelectVariable parent (a: XrmAttribute) = 
  let name, vars = getResultDef a

  let resType = vars |> List.map defToResVars |> varsToType
  let formattedType = 
    match hasFormattedValue a with
    | true -> vars |> List.map defToFormattedVars  
    | false -> []
    |> varsToType

  let tys =
    [ TsType.fromInterface parent
      resType
      formattedType
    ]
  Variable.Create(name, TsType.SpecificGeneric("WebAttribute", tys))


let getFilterVariable (a: XrmAttribute) = 
  let vType = 
    match a.specialType with
    | SpecialType.EntityReference 
    | SpecialType.Guid -> TsType.Custom "XQW.Guid"
    | _ -> a.varType
  
  let name = 
    match a.specialType with
    | SpecialType.EntityReference -> guidName a
    | _ -> a.logicalName

  Variable.Create(name, vType)


let getBindVariables isCreate isUpdate attrMap (r: XrmRelationship) =
  Map.tryFind r.attributeName attrMap
  ?>> fun attr ->
    match r.referencing && isCreate = attr.createable && isUpdate = attr.updateable with
    | false -> None
    | true  -> sprintf "%s_bind$%s" r.navProp r.relatedSetName |> Some
  ?|> fun name -> Variable.Create(name, TsType.Union [ TsType.String; TsType.Null ], optional = true)


let getCreateUpdateVariables isCreate isUpdate (a: XrmAttribute) = 
  match 
    a.specialType, 
    isCreate = a.createable && isUpdate = a.updateable,
    bindNames a with

  | SpecialType.EntityReference, true, Some varNames ->
    varNames 
    |> Array.map (fun name -> Variable.Create(name, TsType.Union [ TsType.String; TsType.Null ], optional = true)) 
    |> List.ofArray
  | _    -> []


let getResultVariable (a: XrmAttribute) = 
  match a.specialType with
  | SpecialType.EntityReference -> getEntityRefDef guidName a |> snd |> List.map defToResVars
  | _ -> []


let getRelationVars (r: XrmRelationship) = 
  TsType.Custom (resultName r.relatedSchemaName)
  |> 
    match r.referencing with
    | true  -> id
    | false -> TsType.Array
  |> fun ty -> Variable.Create(r.navProp, TsType.Union [ ty; TsType.Null ], optional = true)


let getFormattedResultVariable (a: XrmAttribute) = 
  match hasFormattedValue a with
  | true  -> getResultDef a |> snd |> List.map defToFormattedVars
  | false -> []


let getBaseVariable (a: XrmAttribute) = 
  match a.specialType with
  | SpecialType.EntityReference -> []
  | _ -> getResultDef a |> snd |> List.map defToBaseVars


let getExpandVariable parent (r: XrmRelationship) = 
  let typeMapper =
    match r.referencing with
    | true  -> id
    | false -> TsType.Array
    
  let resultInterface =
    TsType.Custom (resultName r.relatedSchemaName)
    |> fun ty ->
      [ Variable.Create(r.navProp, typeMapper ty) ] |> varsToType

  let tys =
    [ TsType.fromInterface parent
      selectName r.relatedSchemaName |> TsType.Custom
      filterName r.relatedSchemaName |> TsType.Custom
      resultInterface
    ]
    
  Variable.Create(r.navProp, TsType.SpecificGeneric("WebExpand", tys))
  

let getRelatedVariable ns referencing (r: XrmRelationship) = 
  if r.referencing <> referencing then None
  else Some <| Variable.Create(r.navProp, retrieveMappingType r.relatedSchemaName ns)


(** Code creation methods *)
type EntityInterfaces = {
  _base: Interface
  _fixed: Interface
  createAndUpdate: Interface
  relationships: Interface
  oneRelated: Interface
  manyRelated: Interface
  create: Interface
  update: Interface
  result: Interface
  select: Interface
  expand: Interface
  filter: Interface
  formattedResult: Interface
}

let getBlankEntityInterfaces e = 
  let bn = baseName e.schemaName;
  let rn = relName e.schemaName
  let cu = e.schemaName
  { _base = Interface.Create(bn, extends = [superEntityName])
    _fixed = Interface.Create(fixedName e.schemaName, vars = [ Variable.Create(e.idAttribute, TsType.String) ], extends = [ superResultFixed ])
    relationships = Interface.Create(rn) 
    oneRelated = Interface.Create(oneRelName e.schemaName) 
    manyRelated = Interface.Create(manyRelName e.schemaName) 
    createAndUpdate = Interface.Create(cu, extends = [bn; rn])
    create = Interface.Create(createName e.schemaName, extends = [cu]) 
    update = Interface.Create(updateName e.schemaName, extends = [cu])
    result = Interface.Create(resultName e.schemaName, extends = [bn; rn]) 
    select = Interface.Create(selectName e.schemaName)
    expand = Interface.Create(expName e.schemaName)
    filter = Interface.Create(filterName e.schemaName)
    formattedResult = Interface.Create(fResultName e.schemaName)
  }
        

/// Create entity interfaces
let getEntityInterfaceLines ns e = 
  let entityInterfaces = getBlankEntityInterfaces e

  let attrMap = e.attributes |> List.map (fun a -> a.logicalName, a) |> Map.ofList
  let availableNavProp (r: XrmRelationship) = attrMap.ContainsKey r.navProp |> not
  
  let interfaces = 
    [ { entityInterfaces._base with vars = e.attributes |> List.map getBaseVariable |> concatDistinctSort } 
      { entityInterfaces.relationships with vars = e.availableRelationships |> List.filter availableNavProp |> List.map getRelationVars |> assignUniqueNames |> sortByName }
      
      { entityInterfaces.createAndUpdate with vars = e.allRelationships |> List.choose (getBindVariables true true attrMap) |> assignUniqueNames |> sortByName }
      { entityInterfaces.create with vars = e.allRelationships |> List.choose (getBindVariables true false attrMap) |> assignUniqueNames |> sortByName }
      { entityInterfaces.update with vars = e.allRelationships |> List.choose (getBindVariables false true attrMap) |> assignUniqueNames |> sortByName }

      { entityInterfaces.select with vars = e.attributes |> List.map (getSelectVariable entityInterfaces.select) |> assignUniqueNames |> sortByName } 
      { entityInterfaces.filter with vars = e.attributes |> List.map getFilterVariable |> assignUniqueNames |> sortByName }
      { entityInterfaces.expand with vars = e.availableRelationships |> List.map (getExpandVariable entityInterfaces.expand) |> assignUniqueNames |> sortByName }

      { entityInterfaces.formattedResult with vars = e.attributes |> List.map getFormattedResultVariable |> concatDistinctSort }
      { entityInterfaces.result with vars = entityTag :: (List.map getResultVariable e.attributes |> concatDistinctSort) }

      { entityInterfaces.oneRelated with vars = e.availableRelationships |> List.choose (getRelatedVariable ns true) |> mergeOwnerId |> assignUniqueNames |> sortByName }
      { entityInterfaces.manyRelated with vars = e.availableRelationships |> List.choose (getRelatedVariable ns false) |> assignUniqueNames |> sortByName }
    ]
    
  let namespacedLines = 
    Namespace.Create(ns, declare = true, interfaces = interfaces) |> CreateCommon.skipNsIfEmpty  
    
  let entityBindingLines =
    match e.entitySetName with
    | None -> []
    | Some setName ->
      let retrieve = 
        Interface.Create("WebEntitiesRetrieve", vars = [Variable.Create(setName, retrieveMappingType e.schemaName ns)])
        |> interfaceToString
      
      let related =
        Interface.Create("WebEntitiesRelated", vars = [Variable.Create(setName, relatedMappingType e.schemaName ns)])
        |> interfaceToString
      
      let cuda =
        Interface.Create("WebEntitiesCUDA", vars = [Variable.Create(setName, cudaMappingType e.schemaName ns)])
        |> interfaceToString
      
      retrieve @ related @ cuda

  namespacedLines @ entityBindingLines

/// Create blank interfaces for web-entities.d.ts
let getBlankInterfacesLines ns es = 
  let iRetrieveMapping = 
    Interface.Create(sprintf "%s<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>" retrieveMapping)
  let iCudaMapping = 
    Interface.Create(sprintf "%s<ICreate, IUpdate, ISelect>" cudaMapping)
  let iRelatedMapping = 
    Interface.Create(sprintf "%s<ISingle, IMultiple>" relatedMapping)
    

  let interfaces =
    es 
    |> Array.Parallel.map (fun e ->
      let ei = getBlankEntityInterfaces e
      [ ei._base; ei._fixed; ei.createAndUpdate; ei.relationships; ei.result; ei.formattedResult; ei.select; ei.expand; ei.filter; ei.create; ei.update ])
    |> List.concat
    |> fun list -> 
      Interface.Create(superEntityName) :: 
      Interface.Create(superResultFixed, vars = [ entityTag ]) :: 
      list
    
  let mappingLines =
      [ iRetrieveMapping  
        iCudaMapping
        iRelatedMapping
      ] |> List.map interfaceToString |> List.concat

  let ns = Namespace.Create(ns, declare = true, interfaces = interfaces)

  mappingLines
  @ CreateCommon.skipNsIfEmpty ns
    
    