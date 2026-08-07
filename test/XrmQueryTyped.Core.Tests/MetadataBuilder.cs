using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using System.Reflection;

namespace XrmQueryTyped.Core.Tests;

// Builds SDK metadata objects for tests. Most metadata properties are read-only in the SDK, so
// they are assigned through their non-public setters.
internal static class MetadataBuilder
{
    private const int EnglishLanguageCode = 1033;

    public static EntityMetadata Entity(
        string logicalName,
        string schemaName,
        string? entitySetName = null,
        AttributeMetadata[]? attributes = null,
        OneToManyRelationshipMetadata[]? manyToOne = null,
        OneToManyRelationshipMetadata[]? oneToMany = null,
        ManyToManyRelationshipMetadata[]? manyToMany = null)
    {
        var entity = new EntityMetadata();
        Set(entity, nameof(EntityMetadata.LogicalName), logicalName);
        Set(entity, nameof(EntityMetadata.SchemaName), schemaName);
        Set(entity, nameof(EntityMetadata.EntitySetName), entitySetName ?? $"{logicalName}s");
        Set(entity, nameof(EntityMetadata.PrimaryIdAttribute), $"{logicalName}id");
        Set(entity, nameof(EntityMetadata.ObjectTypeCode), 1);
        Set(entity, nameof(EntityMetadata.Attributes), attributes ?? []);
        Set(entity, nameof(EntityMetadata.ManyToOneRelationships), manyToOne ?? []);
        Set(entity, nameof(EntityMetadata.OneToManyRelationships), oneToMany ?? []);
        Set(entity, nameof(EntityMetadata.ManyToManyRelationships), manyToMany ?? []);
        return entity;
    }

    public static AttributeMetadata Attribute(
        string logicalName,
        AttributeTypeCode attributeType,
        string? attributeOf = null,
        bool valid = true)
    {
        var attribute = new AttributeMetadata();
        Initialize(attribute, logicalName, attributeType, attributeOf, valid);
        return attribute;
    }

    public static AttributeMetadata Lookup(string logicalName, params string[] targets)
    {
        var attribute = new LookupAttributeMetadata();
        Initialize(attribute, logicalName, AttributeTypeCode.Lookup, attributeOf: null, valid: true);
        Set(attribute, nameof(LookupAttributeMetadata.Targets), targets);
        return attribute;
    }

    public static AttributeMetadata Picklist(string logicalName, string optionSetName, params (string Label, int Value)[] options)
    {
        var attribute = new PicklistAttributeMetadata();
        Initialize(attribute, logicalName, AttributeTypeCode.Picklist, attributeOf: null, valid: true);
        Set(attribute, nameof(PicklistAttributeMetadata.OptionSet), OptionSet(optionSetName, options));
        return attribute;
    }

    public static AttributeMetadata MultiSelectPicklist(string logicalName, string optionSetName, params (string Label, int Value)[] options)
    {
        var attribute = new MultiSelectPicklistAttributeMetadata();
        Initialize(attribute, logicalName, AttributeTypeCode.Virtual, attributeOf: null, valid: true);
        Set(attribute, nameof(AttributeMetadata.AttributeTypeName), AttributeTypeDisplayName.MultiSelectPicklistType);
        Set(attribute, nameof(MultiSelectPicklistAttributeMetadata.OptionSet), OptionSet(optionSetName, options));
        return attribute;
    }

    public static OptionSetMetadata OptionSet(string name, params (string Label, int Value)[] options)
    {
        var optionSet = new OptionSetMetadata();
        Set(optionSet, nameof(OptionSetMetadata.Name), name);
        foreach (var option in options)
        {
            optionSet.Options.Add(new OptionMetadata(Label(option.Label), option.Value));
        }

        return optionSet;
    }

    public static Label Label(string text)
    {
        var label = new Label(text, EnglishLanguageCode);
        Set(label, nameof(Microsoft.Xrm.Sdk.Label.UserLocalizedLabel), new LocalizedLabel(text, EnglishLanguageCode));
        return label;
    }

    public static OneToManyRelationshipMetadata ManyToOne(
        string schemaName,
        string referencingEntity,
        string referencingAttribute,
        string referencedEntity,
        string? navigationPropertyName = null)
    {
        var relationship = new OneToManyRelationshipMetadata();
        Set(relationship, nameof(OneToManyRelationshipMetadata.SchemaName), schemaName);
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencingEntity), referencingEntity);
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencingAttribute), referencingAttribute);
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencedEntity), referencedEntity);
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencedAttribute), $"{referencedEntity}id");
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencingEntityNavigationPropertyName), navigationPropertyName);
        return relationship;
    }

    public static OneToManyRelationshipMetadata OneToMany(
        string schemaName,
        string referencingEntity,
        string referencedEntity,
        string? navigationPropertyName = null)
    {
        var relationship = ManyToOne(schemaName, referencingEntity, $"{referencedEntity}id", referencedEntity);
        Set(relationship, nameof(OneToManyRelationshipMetadata.ReferencedEntityNavigationPropertyName), navigationPropertyName);
        return relationship;
    }

    private static void Initialize(
        AttributeMetadata attribute,
        string logicalName,
        AttributeTypeCode attributeType,
        string? attributeOf,
        bool valid)
    {
        Set(attribute, nameof(AttributeMetadata.LogicalName), logicalName);
        Set(attribute, nameof(AttributeMetadata.SchemaName), logicalName);
        Set(attribute, nameof(AttributeMetadata.AttributeType), attributeType);
        Set(attribute, nameof(AttributeMetadata.AttributeOf), attributeOf);
        Set(attribute, nameof(AttributeMetadata.IsValidForRead), valid);
        Set(attribute, nameof(AttributeMetadata.IsValidForCreate), valid);
        Set(attribute, nameof(AttributeMetadata.IsValidForUpdate), valid);
    }

    private static void Set(object target, string propertyName, object? value)
    {
        for (var type = target.GetType(); type is not null; type = type.BaseType)
        {
            var property = type.GetProperty(
                propertyName,
                BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly);

            if (property?.GetSetMethod(nonPublic: true) is { } setter)
            {
                setter.Invoke(target, [value]);
                return;
            }
        }

        throw new InvalidOperationException($"{target.GetType().Name} has no settable property '{propertyName}'.");
    }
}
