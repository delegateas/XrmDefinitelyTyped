using Microsoft.Xrm.Sdk.Metadata;
using XrmDefinitelyTyped.Core.Domain;
using XrmDefinitelyTyped.Core.Metadata;

namespace XrmQueryTyped.Core.Tests;

public sealed class EntityMetadataInterpreterTests
{
    private static readonly Dictionary<string, EntityNameInfo> NameMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["account"] = new EntityNameInfo(Guid.Empty, "account", "Account", "accounts"),
        ["contact"] = new EntityNameInfo(Guid.Empty, "contact", "Contact", "contacts"),
        ["owner"] = new EntityNameInfo(Guid.Empty, "owner", "Owner", "owners"),
        ["nointerest"] = new EntityNameInfo(Guid.Empty, "nointerest", "NoInterest", "nointerests"),
    };

    [Fact]
    public void Interpret_SkipsAttributeOfYomiAndVirtualAttributes()
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
        [
            MetadataBuilder.Attribute("name", AttributeTypeCode.String),
            MetadataBuilder.Attribute("namename", AttributeTypeCode.String, attributeOf: "name"),
            MetadataBuilder.Attribute("yomifullname", AttributeTypeCode.String),
            MetadataBuilder.Attribute("someplugin", AttributeTypeCode.Virtual),
            MetadataBuilder.MultiSelectPicklist("categories", "account_categories", ("A", 1)),
        ]);

        var model = Interpret(entity);

        Assert.Equal(["categories", "name"], model.Attributes.Select(attribute => attribute.LogicalName).Order());
    }

    [Theory]
    [InlineData(AttributeTypeCode.String, "string", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.Memo, "string", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.Boolean, "boolean", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.DateTime, "Date", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.Integer, "number", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.Double, "number", SpecialAttributeType.Default)]
    [InlineData(AttributeTypeCode.Money, "number", SpecialAttributeType.Money)]
    [InlineData(AttributeTypeCode.Decimal, "number", SpecialAttributeType.Decimal)]
    [InlineData(AttributeTypeCode.Uniqueidentifier, "string", SpecialAttributeType.Guid)]
    [InlineData(AttributeTypeCode.Customer, "string", SpecialAttributeType.EntityReference)]
    [InlineData(AttributeTypeCode.ManagedProperty, "any", SpecialAttributeType.Default)]
    public void Interpret_MapsAttributeTypeToTypeScriptType(
        AttributeTypeCode attributeType,
        string expectedType,
        SpecialAttributeType expectedSpecialType)
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
            [MetadataBuilder.Attribute("field", attributeType)]);

        var attribute = Assert.Single(Interpret(entity).Attributes);
        Assert.Equal(expectedType, attribute.TypeScriptType);
        Assert.Equal(expectedSpecialType, attribute.SpecialType);
    }

    [Fact]
    public void Interpret_ForPicklist_UsesOptionSetNameAsTypeAndCollectsOptionSet()
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
        [
            MetadataBuilder.Picklist("accountcategorycode", "account_accountcategorycode", ("Preferred Customer", 1), ("Standard", 2)),
        ]);

        var model = Interpret(entity);

        Assert.Equal("account_accountcategorycode", model.Attributes.Single().TypeScriptType);
        Assert.Equal(SpecialAttributeType.OptionSet, model.Attributes.Single().SpecialType);
        var optionSet = Assert.Single(model.OptionSets);
        Assert.Equal(["PreferredCustomer", "Standard"], optionSet.Options.Select(option => option.Label));
    }

    [Fact]
    public void Interpret_AppliesLabelMappingsAndSuffixesDuplicateLabels()
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
        [
            MetadataBuilder.Picklist("code", "account_code", ("Alpha One", 1), ("Alpha Two", 2), ("Beta", 3)),
        ]);

        var model = Interpret(entity, labelMappings: new Dictionary<string, string> { ["Alpha.*"] = "Alpha" });

        Assert.Equal(["Alpha", "Alpha_2", "Beta"], model.OptionSets.Single().Options.Select(option => option.Label));
    }

    [Fact]
    public void Interpret_WhenOptionSetNameCollidesWithEntity_SuffixesWithEnum()
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
            [MetadataBuilder.Picklist("code", "Account", ("Alpha", 1))]);

        var model = Interpret(entity);

        Assert.Equal("Account_Enum", model.OptionSets.Single().Name);
    }

    [Fact]
    public void Interpret_ForOwnerRelationship_SplitsIntoTeamAndSystemUser()
    {
        var entity = MetadataBuilder.Entity("account", "Account", manyToOne:
            [MetadataBuilder.ManyToOne("owner_accounts", "account", "ownerid", "owner", "ownerid")]);

        var model = Interpret(entity);

        Assert.Equal(
            [("SystemUser", "systemusers"), ("Team", "teams")],
            model.Relationships
                .Select(relationship => (relationship.RelatedSchemaName, relationship.RelatedEntitySetName))
                .Order());
        Assert.All(model.Relationships, relationship =>
        {
            Assert.True(relationship.IsReferencing);
            Assert.Equal("ownerid", relationship.NavigationPropertyName);
        });
    }

    [Fact]
    public void Interpret_ForMissingNavigationPropertyName_UsesPlaceholder()
    {
        var entity = MetadataBuilder.Entity("account", "Account", oneToMany:
            [MetadataBuilder.OneToMany("contact_customer_accounts", "contact", "account")]);

        Assert.Equal("navigationPropertyNameNotDefined", Interpret(entity).Relationships.Single().NavigationPropertyName);
    }

    [Fact]
    public void Interpret_ForSelfReferentialRelationships_PrefixesSchemaName()
    {
        var entity = MetadataBuilder.Entity(
            "account",
            "Account",
            manyToOne: [MetadataBuilder.ManyToOne("account_parent_account", "account", "parentaccountid", "account", "parentaccountid")],
            oneToMany: [MetadataBuilder.OneToMany("account_parent_account", "account", "account", "account_parent_account")]);

        Assert.Equal(
            ["Referencedaccount_parent_account", "Referencingaccount_parent_account"],
            Interpret(entity).Relationships.Select(relationship => relationship.SchemaName).Order());
    }

    [Fact]
    public void Interpret_MarksRelatedEntityIncludedOnlyForInterpretedEntities()
    {
        var entity = MetadataBuilder.Entity("account", "Account", manyToOne:
        [
            MetadataBuilder.ManyToOne("account_primary_contact", "account", "primarycontactid", "contact", "primarycontactid"),
            MetadataBuilder.ManyToOne("account_nointerest", "account", "nointerestid", "nointerest", "nointerestid"),
        ]);

        var model = EntityMetadataInterpreter
            .Interpret([entity, MetadataBuilder.Entity("contact", "Contact")], NameMap, new Dictionary<string, string>())
            .First();

        Assert.True(model.Relationships.Single(relationship => relationship.RelatedSchemaName == "Contact").IsRelatedEntityIncluded);
        Assert.False(model.Relationships.Single(relationship => relationship.RelatedSchemaName == "NoInterest").IsRelatedEntityIncluded);
    }

    [Fact]
    public void Interpret_ForLookup_ResolvesTargetEntitySets()
    {
        var entity = MetadataBuilder.Entity("account", "Account", attributes:
            [MetadataBuilder.Lookup("parentcustomerid", "account", "contact", "unknownentity")]);

        Assert.Equal(
            [new TargetEntitySet("account", "accounts"), new TargetEntitySet("contact", "contacts")],
            Interpret(entity).Attributes.Single().Targets);
    }

    [Fact]
    public void Interpret_WhenEntitySetNameIsMissing_YieldsNull()
    {
        var entity = MetadataBuilder.Entity("account", "Account", entitySetName: "");

        Assert.Null(Interpret(entity).EntitySetName);
    }

    private static EntityModel Interpret(EntityMetadata entity, IReadOnlyDictionary<string, string>? labelMappings = null) =>
        EntityMetadataInterpreter.Interpret([entity], NameMap, labelMappings ?? new Dictionary<string, string>()).Single();
}
