namespace XrmTyped.Shared.Metadata;

public interface IEntityMetadataSourceFactory
{
    IEntityMetadataFetcher CreateEntityMetadataFetcher(MetadataSourceType type, object config);

    bool SupportsSourceType(MetadataSourceType type);
}
