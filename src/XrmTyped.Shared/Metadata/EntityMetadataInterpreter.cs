using Microsoft.Xrm.Sdk.Metadata;
using XrmTyped.Shared.Domain;

namespace XrmTyped.Shared.Metadata;

public static class EntityMetadataInterpreter
{
    private const string MissingNavigationPropertyName = "navigationPropertyNameNotDefined";
    private const string OwnerEntitySetName = "owners";

    public static EntityModel[] Interpret(
        IReadOnlyList<EntityMetadata> metadata,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlyDictionary<string, string> labelMappings)
    {
        var includedSchemaNames = metadata.Select(entity => entity.SchemaName).ToHashSet(StringComparer.Ordinal);
        return [.. metadata.Select(entity => Interpret(entity, nameMap, includedSchemaNames, labelMappings))];
    }

    public static EntityModel Interpret(
        EntityMetadata metadata,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlySet<string> includedSchemaNames,
        IReadOnlyDictionary<string, string> labelMappings)
    {
        var interpretedAttributes = (metadata.Attributes ?? [])
            .Select(attribute => InterpretAttribute(attribute, nameMap, includedSchemaNames, labelMappings))
            .ToList();

        var attributes = interpretedAttributes
            .Select(interpreted => interpreted.Attribute)
            .OfType<AttributeModel>()
            .ToArray();

        var optionSets = interpretedAttributes
            .Select(interpreted => interpreted.OptionSet)
            .OfType<OptionSetModel>()
            .DistinctBy(optionSet => optionSet.Name, StringComparer.Ordinal)
            .ToArray();

        var relationships = InterpretRelationships(metadata, nameMap, includedSchemaNames).ToArray();

        return new EntityModel(
            metadata.ObjectTypeCode.GetValueOrDefault(),
            metadata.SchemaName,
            metadata.LogicalName,
            string.IsNullOrWhiteSpace(metadata.EntitySetName) ? null : metadata.EntitySetName,
            metadata.PrimaryIdAttribute,
            attributes,
            relationships,
            optionSets);
    }

    private static (OptionSetModel? OptionSet, AttributeModel? Attribute) InterpretAttribute(
        AttributeMetadata attribute,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlySet<string> includedSchemaNames,
        IReadOnlyDictionary<string, string> labelMappings)
    {
        var attributeType = attribute.AttributeType.GetValueOrDefault();

        if (attribute.AttributeOf is not null ||
            attribute.LogicalName.StartsWith("yomi", StringComparison.Ordinal) ||
            (attributeType is AttributeTypeCode.Virtual && attribute.AttributeTypeName != AttributeTypeDisplayName.MultiSelectPicklistType))
        {
            return (null, null);
        }

        var optionSet = attribute is EnumAttributeMetadata enumAttribute && enumAttribute.OptionSet is not null
            ? OptionSetInterpreter.Interpret(enumAttribute.OptionSet, includedSchemaNames, labelMappings)
            : null;

        var (typeScriptType, specialType) = ResolveType(attributeType, attribute, optionSet);

        var targets = attribute is LookupAttributeMetadata lookup && lookup.Targets is not null
            ? lookup.Targets
                .Select(target => nameMap.TryGetValue(target, out var info) ? info : null)
                .OfType<EntityNameInfo>()
                .Where(info => info.EntitySetName is not null)
                .Select(info => new TargetEntitySet(info.LogicalName, info.EntitySetName!))
                .ToArray()
            : [];

        var model = new AttributeModel(
            attribute.SchemaName,
            attribute.LogicalName,
            typeScriptType,
            specialType,
            targets,
            attribute.IsValidForRead.GetValueOrDefault(),
            attribute.IsValidForCreate.GetValueOrDefault(),
            attribute.IsValidForUpdate.GetValueOrDefault());

        return (optionSet, model);
    }

    private static (string TypeScriptType, SpecialAttributeType SpecialType) ResolveType(
        AttributeTypeCode attributeType,
        AttributeMetadata attribute,
        OptionSetModel? optionSet) =>
        attributeType switch
        {
            AttributeTypeCode.Virtual when attribute is MultiSelectPicklistAttributeMetadata =>
                (OptionSetTypeName(optionSet), SpecialAttributeType.MultiSelectOptionSet),
            AttributeTypeCode.Money => ("number", SpecialAttributeType.Money),
            AttributeTypeCode.Picklist or AttributeTypeCode.State or AttributeTypeCode.Status =>
                (OptionSetTypeName(optionSet), SpecialAttributeType.OptionSet),
            AttributeTypeCode.Lookup or AttributeTypeCode.PartyList or AttributeTypeCode.Customer or AttributeTypeCode.Owner =>
                ("string", SpecialAttributeType.EntityReference),
            AttributeTypeCode.Uniqueidentifier => ("string", SpecialAttributeType.Guid),
            AttributeTypeCode.Decimal => ("number", SpecialAttributeType.Decimal),
            _ => (ToTypeScriptType(attributeType), SpecialAttributeType.Default),
        };

    private static string OptionSetTypeName(OptionSetModel? optionSet) => optionSet?.Name ?? "number";

    private static string ToTypeScriptType(AttributeTypeCode attributeType) =>
        attributeType switch
        {
            AttributeTypeCode.Boolean => "boolean",
            AttributeTypeCode.DateTime => "Date",
            AttributeTypeCode.Memo or AttributeTypeCode.EntityName or AttributeTypeCode.String => "string",
            AttributeTypeCode.Integer or AttributeTypeCode.Double or AttributeTypeCode.BigInt => "number",
            _ => "any",
        };

    private static IEnumerable<RelationshipModel> InterpretRelationships(
        EntityMetadata metadata,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlySet<string> includedSchemaNames)
    {
        var oneToMany = (metadata.OneToManyRelationships ?? [])
            .SelectMany(relationship => InterpretOneToMany(relationship, referencing: false, nameMap, includedSchemaNames));

        var manyToOne = (metadata.ManyToOneRelationships ?? [])
            .SelectMany(relationship => InterpretOneToMany(relationship, referencing: true, nameMap, includedSchemaNames));

        var manyToMany = (metadata.ManyToManyRelationships ?? [])
            .SelectMany(relationship => InterpretManyToMany(relationship, metadata.LogicalName, nameMap, includedSchemaNames));

        return oneToMany.Concat(manyToOne).Concat(manyToMany);
    }

    private static IEnumerable<RelationshipModel> InterpretOneToMany(
        OneToManyRelationshipMetadata relationship,
        bool referencing,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlySet<string> includedSchemaNames)
    {
        var relatedLogicalName = referencing ? relationship.ReferencedEntity : relationship.ReferencingEntity;
        if (!nameMap.TryGetValue(relatedLogicalName, out var relatedInfo) || relatedInfo.EntitySetName is null)
            return [];

        var schemaName = relationship.ReferencedEntity == relationship.ReferencingEntity
            ? $"{(referencing ? "Referencing" : "Referenced")}{relationship.SchemaName}"
            : relationship.SchemaName;

        var attributeName = referencing ? relationship.ReferencingAttribute : relationship.ReferencedAttribute;
        var navigationPropertyName = referencing
            ? relationship.ReferencingEntityNavigationPropertyName
            : relationship.ReferencedEntityNavigationPropertyName;

        return ResolveRelatedEntities(relatedInfo)
            .Select(related => new RelationshipModel(
                schemaName,
                attributeName,
                navigationPropertyName ?? MissingNavigationPropertyName,
                related.SchemaName,
                related.EntitySetName,
                referencing,
                includedSchemaNames.Contains(related.SchemaName)));
    }

    private static IEnumerable<RelationshipModel> InterpretManyToMany(
        ManyToManyRelationshipMetadata relationship,
        string logicalName,
        IReadOnlyDictionary<string, EntityNameInfo> nameMap,
        IReadOnlySet<string> includedSchemaNames)
    {
        var isSecondEntity = logicalName == relationship.Entity2LogicalName;
        var relatedLogicalName = isSecondEntity ? relationship.Entity1LogicalName : relationship.Entity2LogicalName;
        if (!nameMap.TryGetValue(relatedLogicalName, out var relatedInfo) || relatedInfo.EntitySetName is null)
            return [];

        var navigationPropertyName = isSecondEntity
            ? relationship.Entity1NavigationPropertyName
            : relationship.Entity2NavigationPropertyName;

        return
        [
            new RelationshipModel(
                relationship.SchemaName,
                relationship.SchemaName,
                navigationPropertyName ?? MissingNavigationPropertyName,
                relatedInfo.SchemaName,
                relatedInfo.EntitySetName,
                IsReferencing: false,
                includedSchemaNames.Contains(relatedInfo.SchemaName)),
        ];
    }

    private static (string SchemaName, string EntitySetName)[] ResolveRelatedEntities(EntityNameInfo relatedInfo) =>
        relatedInfo.EntitySetName == OwnerEntitySetName
            ? [("Team", "teams"), ("SystemUser", "systemusers")]
            : [(relatedInfo.SchemaName, relatedInfo.EntitySetName!)];
}
