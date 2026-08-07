using Microsoft.PowerPlatform.Dataverse.Client;
using XrmTyped.Shared.Metadata;

namespace XrmDefinitelyTyped.Core.Metadata;

public sealed class DataverseMetadataSourceFactory(ServiceClient serviceClient) : IMetadataSourceFactory
{
    public IDataverseMetadataFetcher CreateFetcher(MetadataSourceType type, object config)
    {
        return type switch
        {
            MetadataSourceType.Dataverse => new DataverseMetadataFetcher(serviceClient, XrmFetchConfig.From(config)),
            _ => throw new NotSupportedException($"Metadata source type {type} is not supported by this factory."),
        };
    }

    public bool SupportsSourceType(MetadataSourceType type)
    {
        return type is MetadataSourceType.Dataverse;
    }
}
