using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using XrmTyped.Shared.Domain;

namespace XrmTyped.Shared.Metadata;

public sealed class DataverseEntityMetadataFetcher(ServiceClient serviceClient, XrmFetchConfig config) : IEntityMetadataFetcher
{
    private const int MaxParallelism = 8;

    private readonly EntitySelectionResolver entitySelectionResolver = new(serviceClient, config);

    public async Task<IReadOnlyList<EntityModel>> FetchEntityMetadataAsync()
    {
        var nameMap = await entitySelectionResolver.FetchEntityNameMapAsync();
        var entityNames = await entitySelectionResolver.ResolveEntityNamesAsync(nameMap);

        var metadata = entityNames.Count == 0
            ? await FetchAllEntityMetadataAsync()
            : await FetchEntityMetadataAsync(entityNames);

        var ordered = metadata.OrderBy(entity => entity.LogicalName, StringComparer.Ordinal).ToList();
        return EntityMetadataInterpreter.Interpret(ordered, nameMap, config.LabelMappings);
    }

    private async Task<IReadOnlyList<EntityMetadata>> FetchAllEntityMetadataAsync()
    {
        var request = new RetrieveAllEntitiesRequest
        {
            EntityFilters = EntityFilters.Attributes | EntityFilters.Relationships,
            RetrieveAsIfPublished = true,
        };

        var response = (RetrieveAllEntitiesResponse)await serviceClient.ExecuteAsync(request);
        return response.EntityMetadata;
    }

    private async Task<IReadOnlyList<EntityMetadata>> FetchEntityMetadataAsync(IReadOnlyList<string> entityNames)
    {
        var metadata = new List<EntityMetadata>(entityNames.Count);

        foreach (var batch in entityNames.Chunk(MaxParallelism))
        {
            var responses = await Task.WhenAll(batch.Select(FetchSingleEntityMetadataAsync));
            metadata.AddRange(responses);
        }

        return metadata;
    }

    private async Task<EntityMetadata> FetchSingleEntityMetadataAsync(string logicalName)
    {
        var request = new RetrieveEntityRequest
        {
            LogicalName = logicalName,
            EntityFilters = EntityFilters.Attributes | EntityFilters.Relationships,
            RetrieveAsIfPublished = true,
        };

        var response = (RetrieveEntityResponse)await serviceClient.ExecuteAsync(request);
        return response.EntityMetadata;
    }
}
