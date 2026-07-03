using Microsoft.PowerPlatform.Dataverse.Client;

namespace XrmDefinitelyTyped.Core.Metadata;

public class DataverseMetadataSourceFactory : IMetadataSourceFactory
{
    private readonly ServiceClient serviceClient;

    public DataverseMetadataSourceFactory(ServiceClient serviceClient)
    {
        this.serviceClient = serviceClient;
    }

    public IDataverseMetadataFetcher CreateFetcher(MetadataSourceType type, object config)
    {
        return type switch
        {
            MetadataSourceType.Dataverse => CreateDataverseFetcher(config),
            _ => throw new NotSupportedException($"Metadata source type {type} is not supported by this factory"),
        };
    }

    public bool SupportsSourceType(MetadataSourceType type)
    {
        return type is MetadataSourceType.Dataverse;
    }

    private IDataverseMetadataFetcher CreateDataverseFetcher(object config)
    {
        if (config is not XrmFetchConfig fetchConfig)
            throw new ArgumentException("Expected XrmFetchConfig for Dataverse metadata source", nameof(config));

        return new DataverseMetadataFetcher(serviceClient, fetchConfig);
    }
}