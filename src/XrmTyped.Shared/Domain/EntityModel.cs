namespace XrmTyped.Shared.Domain;

public sealed record EntityModel(
    int TypeCode,
    string SchemaName,
    string LogicalName,
    string? EntitySetName,
    string PrimaryIdAttribute,
    AttributeModel[] Attributes,
    RelationshipModel[] Relationships,
    OptionSetModel[] OptionSets);
