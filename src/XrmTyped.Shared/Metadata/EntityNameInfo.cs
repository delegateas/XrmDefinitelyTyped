namespace XrmTyped.Shared.Metadata;

public sealed record EntityNameInfo(Guid MetadataId, string LogicalName, string SchemaName, string? EntitySetName);
