using XrmDefinitelyTyped.Core.Domain;

namespace XrmQueryTyped.Core.Tests;

internal static class TestEntityModels
{
    public static EntityModel Account() => new(
        TypeCode: 1,
        SchemaName: "Account",
        LogicalName: "account",
        EntitySetName: "accounts",
        PrimaryIdAttribute: "accountid",
        Attributes:
        [
            Attribute("AccountId", "accountid", "string", SpecialAttributeType.Guid, updateable: false),
            Attribute("Name", "name", "string", SpecialAttributeType.Default),
            Attribute("Revenue", "revenue", "number", SpecialAttributeType.Money),
            Attribute("CreatedOn", "createdon", "Date", SpecialAttributeType.Default, createable: false, updateable: false),
            Attribute("AccountCategoryCode", "accountcategorycode", "account_accountcategorycode", SpecialAttributeType.OptionSet),
            Lookup("PrimaryContactId", "primarycontactid", ("contact", "contacts")),
            Lookup("ParentAccountId", "parentaccountid", ("account", "accounts")),
            Lookup("OwnerId", "ownerid", ("team", "teams"), ("systemuser", "systemusers")),
            Attribute("MergedFlag", "merged", "boolean", SpecialAttributeType.Default, createable: false, updateable: false),
        ],
        Relationships:
        [
            ManyToOne("account_parent_account", "parentaccountid", "parentaccountid", "Account", "accounts"),
            ManyToOne("account_primary_contact", "primarycontactid", "primarycontactid", "Contact", "contacts"),
            ManyToOne("team_accounts", "ownerid", "ownerid", "Team", "teams"),
            ManyToOne("system_user_accounts", "ownerid", "ownerid", "SystemUser", "systemusers"),
            OneToMany("contact_customer_accounts", "contact_customer_accounts", "Contact", "contacts"),
            OneToMany("account_parent_account_children", "navigationPropertyNameNotDefined", "Account", "accounts"),
            OneToMany("account_master_account_children", "navigationPropertyNameNotDefined", "Account", "accounts"),
        ],
        OptionSets: [AccountCategoryCode()]);

    public static EntityModel Contact() => new(
        TypeCode: 2,
        SchemaName: "Contact",
        LogicalName: "contact",
        EntitySetName: "contacts",
        PrimaryIdAttribute: "contactid",
        Attributes:
        [
            Attribute("ContactId", "contactid", "string", SpecialAttributeType.Guid, updateable: false),
            Attribute("FullName", "fullname", "string", SpecialAttributeType.Default, createable: false, updateable: false),
            Attribute("CreditLimit", "creditlimit", "number", SpecialAttributeType.Money),
            Lookup("ParentCustomerId", "parentcustomerid", ("account", "accounts"), ("contact", "contacts")),
        ],
        Relationships:
        [
            ManyToOne("contact_customer_accounts", "parentcustomerid", "parentcustomerid_account", "Account", "accounts"),
            ManyToOne("contact_customer_contacts", "parentcustomerid", "parentcustomerid_contact", "Contact", "contacts"),
            OneToMany("account_primary_contact", "account_primary_contact", "Account", "accounts"),
        ],
        OptionSets: []);

    public static OptionSetModel AccountCategoryCode() => new(
        "account_accountcategorycode",
        [new OptionModel("PreferredCustomer", 1), new OptionModel("Standard", 2)]);

    private static AttributeModel Attribute(
        string schemaName,
        string logicalName,
        string typeScriptType,
        SpecialAttributeType specialType,
        bool readable = true,
        bool createable = true,
        bool updateable = true) =>
        new(schemaName, logicalName, typeScriptType, specialType, [], readable, createable, updateable);

    private static AttributeModel Lookup(string schemaName, string logicalName, params (string LogicalName, string EntitySetName)[] targets) =>
        new(schemaName,
            logicalName,
            "string",
            SpecialAttributeType.EntityReference,
            [.. targets.Select(target => new TargetEntitySet(target.LogicalName, target.EntitySetName))],
            Readable: true,
            Createable: true,
            Updateable: true);

    private static RelationshipModel ManyToOne(
        string schemaName,
        string attributeName,
        string navigationPropertyName,
        string relatedSchemaName,
        string relatedEntitySetName) =>
        new(schemaName, attributeName, navigationPropertyName, relatedSchemaName, relatedEntitySetName,
            IsReferencing: true, IsRelatedEntityIncluded: true);

    private static RelationshipModel OneToMany(
        string schemaName,
        string navigationPropertyName,
        string relatedSchemaName,
        string relatedEntitySetName) =>
        new(schemaName, string.Empty, navigationPropertyName, relatedSchemaName, relatedEntitySetName,
            IsReferencing: false, IsRelatedEntityIncluded: true);
}
