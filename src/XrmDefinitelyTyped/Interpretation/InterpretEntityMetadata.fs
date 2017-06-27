module internal DG.XrmDefinitelyTyped.InterpretEntityMetadata

open Utility

open IntermediateRepresentation
open InterpretOptionSetMetadata
open Microsoft.Xrm.Sdk.Metadata

  
let toSome convertFunc (nullable: System.Nullable<'a>) =
  match nullable.HasValue with
  | true -> nullable.GetValueOrDefault() |> convertFunc
  | false -> TsType.Any

let typeConv = function   
  | AttributeTypeCode.Boolean   -> TsType.Boolean
  | AttributeTypeCode.DateTime  -> TsType.Date
    
  | AttributeTypeCode.Memo      
  | AttributeTypeCode.EntityName
  | AttributeTypeCode.String    -> TsType.String

  | AttributeTypeCode.Integer
  | AttributeTypeCode.Double  
  | AttributeTypeCode.BigInt    
  | AttributeTypeCode.Money     
  | AttributeTypeCode.Picklist  
  | AttributeTypeCode.State     
  | AttributeTypeCode.Status    -> TsType.Number
  | _                           -> TsType.Any


let interpretAttribute nameMap entityNames (a: AttributeMetadata) =
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
      |> Array.choose (fun k -> Map.tryFind k nameMap ?|> snd)
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
        
    | AttributeTypeCode.Uniqueidentifier 
                                  -> TsType.String, SpecialType.Guid

    | AttributeTypeCode.Decimal   -> toSome typeConv a.AttributeType, SpecialType.Decimal
    | _                           -> toSome typeConv a.AttributeType, SpecialType.Default


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


let interpretRelationship schemaNames nameMap referencing (rel:OneToManyRelationshipMetadata) =
  let rLogical =
    if referencing then rel.ReferencedEntity
    else rel.ReferencingEntity
    
  Map.tryFind rLogical nameMap
  //?>>? fun (rSchema, _) -> Set.contains rSchema schemaNames
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
        relatedSchemaName = rSchema 
      }

    rSchema, xRel


let interpretM2MRelationship schemaNames nameMap logicalName (rel:ManyToManyRelationshipMetadata) =
  let rLogical =
    match logicalName = rel.Entity2LogicalName with
    | true  -> rel.Entity1LogicalName
    | false -> rel.Entity2LogicalName
    
  Map.tryFind rLogical nameMap
  //?>>? fun (rSchema, _) -> Set.contains rSchema schemaNames
  ?|> fun (rSchema, rSetName) ->
      
    let xRel = 
      { XrmRelationship.schemaName = rel.SchemaName 
        attributeName = rel.SchemaName
        navProp = 
          if logicalName = rel.Entity2LogicalName then rel.Entity1NavigationPropertyName
          else rel.Entity2NavigationPropertyName
        referencing = false
        relatedSetName = rSetName
        relatedSchemaName = rSchema 
      }
    
    rSchema, xRel


let interpretEntity schemaNames nameMap (metadata:EntityMetadata) =
  if isNull metadata.Attributes then failwith "No attributes found!"

  let opt_sets, attr_vars = 
    metadata.Attributes 
    |> Array.map (interpretAttribute nameMap schemaNames)
    |> Array.unzip

  let attr_vars = 
    attr_vars 
    |> Array.choose id 
    |> Array.toList
    
  let opt_sets = 
    opt_sets 
    |> Seq.choose id 
    |> Seq.distinctBy (fun x -> x.displayName) 
    |> Seq.toList
    

  let handleOneToMany referencing = function
    | null  -> Array.empty
    | x     -> x |> Array.choose (interpretRelationship schemaNames nameMap referencing)
    
  let handleManyToMany logicalName = function
    | null  -> Array.empty
    | x     -> x |> Array.choose (interpretM2MRelationship schemaNames nameMap logicalName)


  let rel_entities, rel_vars = 
    [ metadata.OneToManyRelationships  |> handleOneToMany false 
      metadata.ManyToOneRelationships  |> handleOneToMany true 
      metadata.ManyToManyRelationships |> handleManyToMany metadata.LogicalName 
    ] |> Array.concat
      |> List.ofArray
      |> List.unzip

  let rel_entities = 
    rel_entities 
    |> Set.ofList 
    |> Set.remove metadata.SchemaName 
    |> Set.toList

  { XrmEntity.typecode = metadata.ObjectTypeCode.GetValueOrDefault()
    schemaName = metadata.SchemaName
    logicalName = metadata.LogicalName
    entitySetName = metadata.EntitySetName |> Utility.stringToOption
    idAttribute = metadata.PrimaryIdAttribute
    attributes = attr_vars
    relationships = rel_vars
    optionSets = opt_sets
    relatedEntities = rel_entities 
  }