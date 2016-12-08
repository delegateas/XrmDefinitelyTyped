namespace DG.XrmDefinitelyTyped

open Utility

open IntermediateRepresentation
open InterpretOptionSetMetadata
open Microsoft.Xrm.Sdk.Metadata

module internal InterpretEntityMetadata =
  
  let toSome convertFunc (nullable:System.Nullable<'a>) =
    match nullable.HasValue with
    | true -> convertFunc (nullable.GetValueOrDefault())
    | false -> TsType.Any

  let typeConv = function   
    | AttributeTypeCode.Boolean   -> TsType.Boolean
    | AttributeTypeCode.DateTime  -> TsType.Date
    | AttributeTypeCode.Integer   -> TsType.Number
    
    | AttributeTypeCode.Memo      
    | AttributeTypeCode.EntityName
    | AttributeTypeCode.Double    
    | AttributeTypeCode.Decimal   
    | AttributeTypeCode.String    -> TsType.String

    | AttributeTypeCode.BigInt    
    | AttributeTypeCode.Integer
    | AttributeTypeCode.Money     
    | AttributeTypeCode.Picklist  
    | AttributeTypeCode.State     
    | AttributeTypeCode.Status    -> TsType.Number
    | _                           -> TsType.Any


  let interpretAttribute map entityNames (a:AttributeMetadata) =
    let aType = a.AttributeType.GetValueOrDefault()
    if a.AttributeOf <> null ||
       aType = AttributeTypeCode.Virtual ||
       a.LogicalName.StartsWith("yomi") then None, None
    else

    let options =
      match a with
      | :? EnumAttributeMetadata as eam -> interpretOptionSet entityNames eam.OptionSet
      | _ -> None

    let targetEntitySets =
      match a with
      | :? LookupAttributeMetadata as lam -> 
        lam.Targets
        |> Array.choose (fun k -> Map.tryFind k map ?|> snd)
        |> Some
      | _ -> None

    let vType, sType = 
      match aType with
      | AttributeTypeCode.Money     -> TsType.Number, SpecialType.Money
      | AttributeTypeCode.Picklist
      | AttributeTypeCode.State
      | AttributeTypeCode.Status    -> TsType.Custom options.Value.displayName, SpecialType.OptionSet

      | AttributeTypeCode.Lookup    
      | AttributeTypeCode.PartyList  
      | AttributeTypeCode.Customer  
      | AttributeTypeCode.Owner     -> TsType.String, SpecialType.EntityReference
        
      | AttributeTypeCode.Uniqueidentifier -> TsType.String, SpecialType.Guid
      | _ -> toSome typeConv a.AttributeType, SpecialType.Default

    let attr = 
      match a.IsValidForCreate.GetValueOrDefault(false) <> a.IsValidForUpdate.GetValueOrDefault(false) with
      | true -> Some a
      | false -> None

    if attr.IsSome then
      ()

    options, Some {
      XrmAttribute.schemaName = a.SchemaName
      logicalName = a.LogicalName
      varType = vType
      specialType = sType
      targetEntitySets = targetEntitySets
      readable = a.IsValidForRead.GetValueOrDefault(false)
      createable = a.IsValidForCreate.GetValueOrDefault(false)
      updateable = a.IsValidForUpdate.GetValueOrDefault(false)
    }


  let interpretRelationship schemaNames map referencing (rel:OneToManyRelationshipMetadata) =
    let rLogical =
      if referencing then rel.ReferencedEntity
      else rel.ReferencingEntity
    
    Map.tryFind rLogical map
    ?>>? fun (rSchema, _) -> Set.contains rSchema schemaNames
    ?|> fun (rSchema, rSetName) ->
      let name =
        match rel.ReferencedEntity = rel.ReferencingEntity with
        | false -> rel.SchemaName
        | true  ->
          match referencing with
          | true  -> sprintf "Referencing%s" rel.SchemaName
          | false -> sprintf "Referenced%s" rel.SchemaName

      let xRel = 
        { XrmRelationship.schemaName = name
          attributeName = 
            if referencing then rel.ReferencingAttribute 
            else rel.ReferencedAttribute
          navProp = 
            if referencing then rel.ReferencingEntityNavigationPropertyName
            else rel.ReferencedEntityNavigationPropertyName
          referencing = referencing
          relatedSetName = rSetName
          relatedSchemaName = rSchema }

      rSchema, xRel


  let interpretM2MRelationship schemaNames map lname (rel:ManyToManyRelationshipMetadata) =
    let rLogical =
      match lname = rel.Entity2LogicalName with
      | true  -> rel.Entity1LogicalName
      | false -> rel.Entity2LogicalName
    
    Map.tryFind rLogical map
    ?>>? fun (rSchema, _) -> Set.contains rSchema schemaNames
    ?|> (fun (rSchema, rSetName) ->
      
      let xRel = 
        { XrmRelationship.schemaName = rel.SchemaName 
          attributeName = rel.SchemaName
          navProp = 
            if lname = rel.Entity2LogicalName then rel.Entity1NavigationPropertyName
            else rel.Entity2NavigationPropertyName
          referencing = false
          relatedSetName = rSetName
          relatedSchemaName = rSchema }
    
      rSchema, xRel)


  let interpretEntity schemaNames map (metadata:EntityMetadata) =
    if (metadata.Attributes = null) then failwith "No attributes found!"

    let opt_sets, attr_vars = 
      metadata.Attributes 
      |> Array.map (interpretAttribute map schemaNames)
      |> Array.unzip

    let attr_vars = attr_vars |> Array.choose id |> Array.toList
    
    let opt_sets = 
      opt_sets |> Seq.choose id 
      |> Seq.distinctBy (fun x -> x.displayName) 
      |> Seq.toList
    

    let handleOneToMany referencing = function
      | null -> Array.empty
      | x -> x |> Array.choose (interpretRelationship schemaNames map referencing)
    
    let handleManyToMany logicalName = function
      | null -> Array.empty
      | x -> x |> Array.choose (interpretM2MRelationship schemaNames map logicalName)


    let rel_entities, rel_vars = 
      [ metadata.OneToManyRelationships |> handleOneToMany false 
        metadata.ManyToOneRelationships |> handleOneToMany true 
        metadata.ManyToManyRelationships |> handleManyToMany metadata.LogicalName 
      ] |> List.map Array.toList
        |> List.concat
        |> List.unzip

    let rel_entities = 
      rel_entities 
      |> Set.ofList |> Set.remove metadata.SchemaName |> Set.toList

    { XrmEntity.typecode = metadata.ObjectTypeCode.GetValueOrDefault()
      schemaName = metadata.SchemaName
      logicalName = metadata.LogicalName
      entitySetName = metadata.EntitySetName |> Utility.stringToOption
      idAttr = metadata.PrimaryIdAttribute
      attrs = attr_vars
      rels = rel_vars
      opt_sets = opt_sets
      relatedEntities = rel_entities }