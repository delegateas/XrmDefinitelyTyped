using XrmTyped.Shared.Metadata;

namespace XrmDefinitelyTyped.Core.Metadata;

public interface IMetadataSourceFactory
{
    IDataverseMetadataFetcher CreateFetcher(MetadataSourceType type, object config);

    bool SupportsSourceType(MetadataSourceType type);
}
