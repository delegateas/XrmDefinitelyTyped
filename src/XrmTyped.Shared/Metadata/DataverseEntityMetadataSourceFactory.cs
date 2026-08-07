using Microsoft.PowerPlatform.Dataverse.Client;

namespace XrmTyped.Shared.Metadata;

public sealed class DataverseEntityMetadataSourceFactory(ServiceClient serviceClient) : IEntityMetadataSourceFactory
{
    public IEntityMetadataFetcher CreateEntityMetadataFetcher(MetadataSourceType type, object config)
    {
        return type switch
        {
            MetadataSourceType.Dataverse => new DataverseEntityMetadataFetcher(serviceClient, XrmFetchConfig.From(config)),
            _ => throw new NotSupportedException($"Metadata source type {type} is not supported by this factory."),
        };
    }

    public bool SupportsSourceType(MetadataSourceType type)
    {
        return type is MetadataSourceType.Dataverse;
    }
}
