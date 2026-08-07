namespace XrmDefinitelyTyped.Core.Domain;

public sealed record RelationshipModel(
    string SchemaName,
    string AttributeName,
    string NavigationPropertyName,
    string RelatedSchemaName,
    string RelatedEntitySetName,
    bool IsReferencing,
    bool IsRelatedEntityIncluded);
