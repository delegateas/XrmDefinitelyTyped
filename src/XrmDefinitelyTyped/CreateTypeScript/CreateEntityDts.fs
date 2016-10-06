namespace DG.XrmDefinitelyTyped

open TsStringUtil
open IntermediateRepresentation

module internal CreateEntityDts =

  (** Interface name helper functions *)
  let strConcat = sprintf "%s%s"
  let baseName x = strConcat x "Base"
  let resultName x = strConcat x "Result"
  let selectName x = strConcat x "_Select"
  let filterName x = strConcat x "_Filter"
  let expName x = strConcat x "_Expand"

  (** Type helper functions *)
  let arrayOf = Type.Custom >> Type.Array

  let attribute t = Type.Generic("Attribute",t)
  let expandable t u = Type.Generic("Expandable", sprintf "%s,%s" (selectName t) (selectName u))
  let valueContainer t = Type.SpecificGeneric("ValueContainerFilter", t)
  let results = sprintf "%sResult" >> fun x -> Type.Generic("SDK.Results", x) 

  (** TypeScript helper functions *)
  let getSelectVariables selectName (list: XrmAttribute list) = 
    list |> List.map (fun v -> 
      Variable.Create(v.schemaName, attribute selectName))


  let getExpandVariables entityName (list: XrmRelationship list) = 
    list |> List.map (fun r -> 
      Variable.Create(r.schemaName, expandable entityName r.relatedEntity))


  let getOrgVariables (list: XrmAttribute list) = 
    list |> List.map (fun v -> 
      let vType = 
        match v.specialType with
        | SpecialType.OptionSet       -> Type.SpecificGeneric("SDK.OptionSet", v.varType)
        | SpecialType.Money           -> Type.Custom "SDK.Money"
        | SpecialType.EntityReference -> Type.Custom "SDK.EntityReference"
        | _ -> v.varType
        |> fun ty -> Type.Union [ty; Type.Null]
      Variable.Create(v.schemaName, vType, optional = true))

  let getFilterVariables (list: XrmAttribute list) = 
    list |> List.map (fun v -> 
      let vType = 
        match v.specialType with
        | SpecialType.OptionSet       -> valueContainer v.varType
        | SpecialType.Money           -> valueContainer Type.Number
        | SpecialType.EntityReference -> Type.Custom "EntityReferenceFilter"
        | SpecialType.Guid            -> Type.Custom "Guid"
        | _ -> v.varType
      Variable.Create(v.schemaName, vType))


  let getRelationshipVariables isResult (list: XrmRelationship list) =
    list |> List.map (fun r -> 
      let rType = 
        match r.referencing, isResult with
        | true, _       -> Type.Custom r.relatedEntity
        | false, false  -> arrayOf r.relatedEntity
        | false, true   -> results r.relatedEntity
        |> fun ty -> Type.Union [ty; Type.Null]
      Variable.Create(r.schemaName, rType, optional = true)
    )


  (** Code creation methods *)

  /// Create entity interfaces
  let getEntityInterfaces e = 
    let baseName = baseName e.schemaName
    let selName = selectName e.schemaName
    let expName = expName e.schemaName
    let resultName = resultName e.schemaName
    let filterName = filterName e.schemaName

    let mapping = 
      Variable.Create(
        e.schemaName, Type.Generic ("QueryMapping", 
          (sprintf "%s,%s,%s,%s,%s" e.schemaName selName expName filterName resultName)))

    [ Interface.Create(baseName, 
        vars = (e.attr_vars |> getOrgVariables),
        superClass = "Entity")
      Interface.Create(e.schemaName, 
        vars = (e.rel_vars |> getRelationshipVariables false),
        superClass = baseName)
      Interface.Create(resultName, 
        vars = (e.rel_vars |> getRelationshipVariables true),
        superClass = baseName)

      // XrmQuery interfaces
      Interface.Create(selName, 
        vars = (e.attr_vars |> getSelectVariables selName),
        superClass = expName)
      Interface.Create(filterName, 
        vars = (e.attr_vars |> getFilterVariables))
      Interface.Create(expName, 
        vars = (e.rel_vars |> getExpandVariables e.schemaName))

      Interface.Create("Entities", vars = [mapping])
    ]

  let getEntityContext (e:XrmEntity): string list =
    (getEntityInterfaces e |> List.map interfaceToString |> List.concat)
  

  /// Create blank interfaces for entities.d.ts
  let getBlankEntityInterfaces es = 
    let queryMapping = 
      Interface.Create("QueryMapping<O, S, E, F, R>")

    es
    |> Array.map (fun e ->
      let baseName = sprintf "%sBase" e.schemaName
      [ Interface.Create(baseName, superClass = "Entity")
        Interface.Create(sprintf "%sResult" e.schemaName, superClass = baseName)
        Interface.Create(sprintf "%s_Select" e.schemaName)
        Interface.Create(e.schemaName, superClass = baseName) ])
    |> List.concat
    |> fun list -> queryMapping :: Interface.Create("Entity") :: list 
    |> List.map interfaceToString
    |> List.concat


  /// Create entity enums
  let getEntityEnums (e:XrmEntity): string list =
    let enums =
      e.opt_sets
      |> List.map (fun os ->
        Enum.Create(os.displayName, 
          os.options 
            |> Array.map (fun o -> o.label, Some o.value) |> List.ofArray,
          export = true,
          constant = true))
      |> List.fold (fun acc os -> 
        if List.exists (fun (x:Enum) -> os.name = x.name) acc then acc 
        else os::acc) []

    Module.Create(
      sprintf "Enum.%s" e.schemaName,
      declare = true,
      enums = enums) 
    |> moduleToString
