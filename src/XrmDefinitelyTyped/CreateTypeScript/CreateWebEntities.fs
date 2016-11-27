namespace DG.XrmDefinitelyTyped

open Utility
open TsStringUtil
open IntermediateRepresentation

module internal CreateWebEntities =

  (** Interface name helper functions *)
  let withEnding ending str = sprintf "%s%s" str ending
  let superEntityName = "WebEntity"
  let retrieveMapping = "WebMappingRetrieve"
  let cudMapping = "WebMappingCUD"
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
    targetEntitySets = Some [| "transactioncurrencies" |]
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
    a.targetEntitySets ?|> Array.map (sprintf "%s_bind$%s" a.logicalName)

  (** Various type helper functions *)
  let arrayOf = TsType.Custom >> TsType.Array
  let varsToType =
    varsToInlineInterfaceString >> TsType.Custom

  let sortByName = List.sortBy (fun (x: Variable) -> x.name)
  let concatDistinctSort = 
    List.concat >> List.distinctBy (fun (x: Variable) -> x.name) >> sortByName

  let hasFormattedValue a = 
    match a.specialType, a.varType with
    | SpecialType.EntityReference, _
    | SpecialType.Money, _
    | SpecialType.OptionSet, _
    | _, TsType.Date -> true
    | _ -> false

  let getMapping eName ns name =
    List.map (fun f -> f eName)
    >> CreateCommon.wrapNamesInNsIfAny ns
    >> fun names -> TsType.Generic (name, names |> String.concat ",")
  
  let retrieveMappingType eName ns =
    [ selectName; expName; filterName; fixedName; resultName; fResultName ]
    |> getMapping eName ns retrieveMapping

  let cudMappingType eName ns =
    [ createName; updateName ]
    |> getMapping eName ns cudMapping

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
      | SpecialType.Guid  -> TsType.Custom "XQW.Guid"
      | _ -> a.varType
    Variable.Create(a.logicalName, vType)

  let getCreateUpdateVariables isCreate isUpdate (a: XrmAttribute) = 
    match 
      a.specialType, 
      isCreate = a.createable && isUpdate = a.updateable,
      bindNames a with

    | SpecialType.EntityReference, true, Some varNames ->
      varNames 
      |> Array.map (fun n -> Variable.Create(n, TsType.Union [ TsType.String; TsType.Null ], optional = true)) 
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
    cu: Interface
    rels: Interface
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
      _fixed = Interface.Create(fixedName e.schemaName, vars = [ Variable.Create(e.idAttr, TsType.String) ], extends = [ superResultFixed ])
      rels = Interface.Create(rn) 
      oneRelated = Interface.Create(oneRelName e.schemaName) 
      manyRelated = Interface.Create(manyRelName e.schemaName) 
      cu = Interface.Create(cu, extends = [bn; rn]) 
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
    let ei = getBlankEntityInterfaces e
    
    let is = 
      [ { ei._base with vars = e.attrs |> List.map getBaseVariable |> concatDistinctSort } 
        { ei.rels with vars = e.rels |> List.map getRelationVars |> sortByName }
        
        { ei.cu with vars = e.attrs |> List.map (getCreateUpdateVariables true true) |> concatDistinctSort }
        { ei.create with vars = e.attrs |> List.map (getCreateUpdateVariables true false) |> concatDistinctSort }
        { ei.update with vars = e.attrs |> List.map (getCreateUpdateVariables false true) |> concatDistinctSort }

        { ei.select with vars = e.attrs |> List.map (getSelectVariable ei.select) |> sortByName } 
        { ei.filter with vars = e.attrs |> List.map getFilterVariable |> sortByName }
        { ei.expand with vars = e.rels |> List.map (getExpandVariable ei.expand) |> sortByName }

        { ei.formattedResult with vars = e.attrs |> List.map getFormattedResultVariable |> concatDistinctSort }
        { ei.result with vars = entityTag :: (List.map getResultVariable e.attrs |> concatDistinctSort) }

        { ei.oneRelated with vars = e.rels |> List.choose (getRelatedVariable "" true) |> sortByName }
        { ei.manyRelated with vars = e.rels |> List.choose (getRelatedVariable "" false) |> sortByName }
      ]
      
    let mapping = 
      Variable.Create(
        e.entitySetName, 
        TsType.Intersection 
          [ retrieveMappingType e.schemaName ns
            cudMappingType e.schemaName ns 
            relatedMappingType e.schemaName ns
          ]) 

    let ns = Namespace.Create(ns, declare = true, interfaces = is)
    List.concat 
      [ CreateCommon.skipNsIfEmpty ns
        Interface.Create("WebEntities", vars = [ mapping ]) |> interfaceToString
      ]

  /// Create blank interfaces for web-entities.d.ts
  let getBlankInterfacesLines ns es = 
    let iRetrieveMapping = 
      Interface.Create(sprintf "%s<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>" retrieveMapping)
    let iCudMapping = 
      Interface.Create(sprintf "%s<ICreate, IUpdate>" cudMapping)
    let iRelatedMapping = 
      Interface.Create(sprintf "%s<ISingle, IMultiple>" relatedMapping)
    

    let interfaces =
      es 
      |> Array.Parallel.map (fun e ->
        let ei = getBlankEntityInterfaces e
        [ ei._base; ei._fixed; ei.cu; ei.rels; ei.result; ei.formattedResult; ei.select; ei.expand; ei.filter; ei.create; ei.update ])
      |> List.concat
      |> fun list -> 
        Interface.Create(superEntityName) :: 
        Interface.Create(superResultFixed, vars = [ entityTag ]) :: 
        list
    
    let mappingLines =
        [ iRetrieveMapping  
          iCudMapping
          iRelatedMapping
        ] |> List.map interfaceToString |> List.concat

    let ns = Namespace.Create(ns, declare = true, interfaces = interfaces)

    mappingLines
    @ CreateCommon.skipNsIfEmpty ns
    
    