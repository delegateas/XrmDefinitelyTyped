using Microsoft.PowerPlatform.Dataverse.Client;

namespace XrmDefinitelyTyped.Core.Metadata;

public sealed class DataverseMetadataSourceFactory(ServiceClient serviceClient) : IMetadataSourceFactory
{
    public IDataverseMetadataFetcher CreateFetcher(MetadataSourceType type, object config)
    {
        return type switch
        {
            MetadataSourceType.Dataverse => new DataverseMetadataFetcher(serviceClient, AsFetchConfig(config)),
            _ => throw new NotSupportedException($"Metadata source type {type} is not supported by this factory."),
        };
    }

    public IEntityMetadataFetcher CreateEntityMetadataFetcher(MetadataSourceType type, object config)
    {
        return type switch
        {
            MetadataSourceType.Dataverse => new DataverseEntityMetadataFetcher(serviceClient, AsFetchConfig(config)),
            _ => throw new NotSupportedException($"Metadata source type {type} is not supported by this factory."),
        };
    }

    public bool SupportsSourceType(MetadataSourceType type)
    {
        return type is MetadataSourceType.Dataverse;
    }

    private static XrmFetchConfig AsFetchConfig(object config)
    {
        if (config is not XrmFetchConfig fetchConfig)
            throw new ArgumentException("Expected XrmFetchConfig for Dataverse metadata source.", nameof(config));

        return fetchConfig;
    }
}
