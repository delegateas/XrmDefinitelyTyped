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


  let interpretAttribute entityNames (a:AttributeMetadata) =
    let aType = a.AttributeType.GetValueOrDefault()
    if a.AttributeOf <> null ||
       aType = AttributeTypeCode.Virtual ||
       a.LogicalName.StartsWith("yomi") then None, None
    else

    let options =
      match a with
      | :? EnumAttributeMetadata as eam -> interpretOptionSet entityNames eam.OptionSet
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
    
    options, Some {
      XrmAttribute.schemaName = a.SchemaName
      logicalName = a.LogicalName
      varType = vType
      specialType = sType }


  let interpretRelationship map referencing (rel:OneToManyRelationshipMetadata) =
    if referencing then rel.ReferencedEntity
    else rel.ReferencingEntity
    |> fun s -> Map.tryFind s map
    ?|> (fun (rSchema, rSetName) ->
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

      rSchema, xRel)


  let interpretM2MRelationship map lname (rel:ManyToManyRelationshipMetadata) =
    match lname = rel.Entity2LogicalName with
    | true  -> rel.Entity1LogicalName
    | false -> rel.Entity2LogicalName
    |> fun s -> Map.tryFind s map
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


  let interpretEntity entityNames map (metadata:EntityMetadata) =
    if (metadata.Attributes = null) then failwith "No attributes found!"

    let opt_sets, attr_vars = 
      metadata.Attributes 
      |> Array.map (interpretAttribute entityNames)
      |> Array.unzip

    let attr_vars = attr_vars |> Array.choose id |> Array.toList
    
    let opt_sets = 
      opt_sets |> Seq.choose id 
      |> Seq.distinctBy (fun x -> x.displayName) 
      |> Seq.toList
    

    let handleOneToMany referencing = function
      | null -> Array.empty
      | x -> x |> Array.choose (interpretRelationship map referencing)
    
    let handleManyToMany logicalName = function
      | null -> Array.empty
      | x -> x |> Array.choose (interpretM2MRelationship map logicalName)


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
      entitySetName = metadata.EntitySetName
      attr_vars = attr_vars
      rel_vars = rel_vars
      opt_sets = opt_sets
      relatedEntities = rel_entities }