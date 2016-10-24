namespace DG.XrmDefinitelyTyped

open Utility
open TsStringUtil
open IntermediateRepresentation

module internal CreateWebEntities =

  (** Interface name helper functions *)
  let strConcat = sprintf "%s%s"
  let superEntityName = "WebEntity"
  let mappingName = "WebMapping"
  let entityResult = TsType.Custom "WebEntityResult"
  
  let baseName x = strConcat x "_Base"
  let resultName x = strConcat x "_Result"
  let fResultName x = strConcat x "_FormattedResult"
  let selectName x = strConcat x "_Select"
  let filterName x = strConcat x "_Filter"
  let expName x = strConcat x "_Expand"

  let currencyId = "transactioncurrencyid"
  let formattedName = sprintf "%s_formatted"
  let guidName = sprintf "%s_guid"

  (** Various type helper functions *)
  let arrayOf = TsType.Custom >> TsType.Array
  let varsToType =
    varsToInlineInterfaceString >> TsType.Custom

  let sortByName = List.sortBy (fun (x: Variable) -> x.name)
  let concatDistinctSort = 
    List.concat >> List.distinctBy (fun (x: Variable) -> x.name) >> sortByName

  let defToResVars (name, ty, nameTransform) =
    Variable.Create(nameTransform ?| id <| name, TsType.Union [ ty; TsType.Null ]) 

  let defToFormattedVars (name, _, _) =
    Variable.Create(formattedName name, TsType.String, optional = true) 

  let hasFormatted a = 
    match a.specialType, a.varType with
    | SpecialType.EntityReference, _
    | SpecialType.Money, _
    | SpecialType.OptionSet, _
    | _, TsType.Date -> true
    | _ -> false

  let getEntityRefDef nameFormat (a: XrmAttribute) =
    nameFormat a.logicalName, [ a.logicalName, a.varType, Some guidName ]

  let getResultDef a = 
    let vType = a.varType
    let name = a.logicalName

    match a.specialType with
    | SpecialType.EntityReference -> getEntityRefDef guidName a
    | SpecialType.Money -> name, [ name, vType, None; currencyId, TsType.String, Some guidName ]
    | _ -> name, [ name, vType, None ]


  let getSelectVariable parent (a: XrmAttribute) = 
    let name, vars = getResultDef a

    let resType = vars |> List.map defToResVars |> varsToType
    let formattedType = 
      match hasFormatted a with
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

  let getResultVariable (a: XrmAttribute) = 
    match a.specialType with
    | SpecialType.EntityReference -> getEntityRefDef guidName a |> snd |> List.map defToResVars
    | _ -> []

  let getFormattedResultVariable (a: XrmAttribute) = 
    match hasFormatted a with
    | true  -> getResultDef a |> snd |> List.map defToFormattedVars
    | false -> []

  let getBaseVariable (a: XrmAttribute) = 
    match a.specialType with
    | SpecialType.EntityReference -> []
    | _ -> getResultDef a |> snd |> List.map defToResVars

  let getExpandVariable parent (r: XrmRelationship) = 
    let resultInterface =
      match r.referencing with
      | true  -> id
      | false -> TsType.Array
      <| TsType.Intersection [entityResult; TsType.Custom (resultName r.relatedSetName)]
      |> fun ty -> [ Variable.Create(r.navProp, ty) ] |> varsToType

    let tys =
      [ TsType.fromInterface parent
        selectName r.relatedSetName |> TsType.Custom
        filterName r.relatedSetName |> TsType.Custom
        resultInterface
      ]
    Variable.Create(r.navProp, TsType.SpecificGeneric("WebExpand", tys))


  (** Code creation methods *)
  type EntityInterfaces = {
    _base: Interface
    cu: Interface
    result: Interface
    select: Interface
    expand: Interface
    filter: Interface
    fResult: Interface
  }

  let getBlankEntityInterfaces e = 
    let bn = baseName e.entitySetName;
    { _base = Interface.Create(bn, superClass = superEntityName)
      cu = Interface.Create(e.entitySetName, superClass = bn) 
      result = Interface.Create(resultName e.entitySetName, superClass = bn) 
      select = Interface.Create(selectName e.entitySetName)
      expand = Interface.Create(expName e.entitySetName)
      filter = Interface.Create(filterName e.entitySetName)
      fResult = Interface.Create(fResultName e.entitySetName)
    }

  /// Create entity interfaces
  let getEntityInterfaceLines ns e = 
    let ei = getBlankEntityInterfaces e

    let mapping = 
      [ ei.cu; ei.select; ei.expand; ei.filter; ei.result; ei.fResult ]
      |> List.map (fun i -> i.name)
      |> CreateCommon.wrapNamesInNsIfAny ns
      |> fun interfaces ->
        Variable.Create(
          e.entitySetName, TsType.Generic (mappingName, 
            (interfaces |> String.concat ",")))


    let is = 
      [ { ei.select with vars = e.attr_vars |> List.map (getSelectVariable ei.select) |> sortByName } 
        { ei.filter with vars = e.attr_vars |> List.map getFilterVariable |> sortByName }
        { ei._base with vars = e.attr_vars |> List.map getBaseVariable |> concatDistinctSort } 
        { ei.result with vars = e.attr_vars |> List.map getResultVariable |> concatDistinctSort }
        { ei.fResult with vars = e.attr_vars |> List.map getFormattedResultVariable |> concatDistinctSort }
        { ei.expand with vars = e.rel_vars |> List.map (getExpandVariable ei.expand) |> sortByName }
      ]

    List.concat 
      [ CreateCommon.interfacesToNsLines ns is
        Interface.Create("WebEntities", vars = [mapping]) |> interfaceToString
      ]

  /// Create blank interfaces for web-entities.d.ts
  let getBlankInterfacesLines ns es = 
    let queryMapping = 
      Interface.Create(sprintf "%s<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>" mappingName)

    let is =
      es
      |> Array.Parallel.map (fun e ->
        let ei = getBlankEntityInterfaces e
        [ ei._base; ei.cu; ei.result; ei.fResult; ei.select; ei.expand; ei.filter ])
      |> List.concat
      |> fun list -> queryMapping :: Interface.Create(superEntityName) :: list 
    
    CreateCommon.interfacesToNsLines ns is
    