using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;

namespace XrmTyped.Shared.Metadata;

public sealed class EntitySelectionResolver(ServiceClient serviceClient, XrmFetchConfig config)
{
    private const int EntityComponentType = 1;

    public async Task<IReadOnlyList<string>> ResolveEntityNamesAsync()
    {
        if (config.Solutions.Count == 0)
            return [.. new HashSet<string>(config.Entities, StringComparer.OrdinalIgnoreCase)];

        var nameMap = await FetchEntityNameMapAsync();
        return await ResolveEntityNamesAsync(nameMap);
    }

    public async Task<IReadOnlyList<string>> ResolveEntityNamesAsync(IReadOnlyDictionary<string, EntityNameInfo> nameMap)
    {
        var entityNames = new HashSet<string>(config.Entities, StringComparer.OrdinalIgnoreCase);

        if (config.Solutions.Count > 0)
        {
            var solutionEntityNames = await FetchEntityNamesFromSolutionsAsync(nameMap);
            entityNames.UnionWith(solutionEntityNames);
        }

        return [.. entityNames];
    }

    public async Task<IReadOnlyDictionary<string, EntityNameInfo>> FetchEntityNameMapAsync()
    {
        var request = new RetrieveAllEntitiesRequest
        {
            EntityFilters = EntityFilters.Entity,
            RetrieveAsIfPublished = true,
        };

        var response = (RetrieveAllEntitiesResponse)await serviceClient.ExecuteAsync(request);

        return response.EntityMetadata.ToDictionary(
            e => e.LogicalName,
            e => new EntityNameInfo(
                e.MetadataId.GetValueOrDefault(),
                e.LogicalName,
                e.SchemaName,
                string.IsNullOrWhiteSpace(e.EntitySetName) ? null : e.EntitySetName),
            StringComparer.OrdinalIgnoreCase);
    }

    private async Task<IReadOnlyList<string>> FetchEntityNamesFromSolutionsAsync(IReadOnlyDictionary<string, EntityNameInfo> nameMap)
    {
        var solutionIds = await FetchSolutionIdsAsync();
        if (solutionIds.Count == 0)
            return [];

        var entityMetadataIds = await FetchEntityMetadataIdsFromSolutionsAsync(solutionIds);
        if (entityMetadataIds.Count == 0)
            return [];

        var metadataIdSet = new HashSet<Guid>(entityMetadataIds);

        return nameMap.Values
            .Where(e => metadataIdSet.Contains(e.MetadataId))
            .Select(e => e.LogicalName)
            .ToList();
    }

    private async Task<IReadOnlyList<Guid>> FetchSolutionIdsAsync()
    {
        var query = new QueryExpression("solution")
        {
            ColumnSet = new ColumnSet("solutionid"),
            Criteria = new FilterExpression(),
        };

        var condition = new ConditionExpression("uniquename", ConditionOperator.In);
        foreach (var name in config.Solutions)
        {
            condition.Values.Add(name);
        }

        query.Criteria.Conditions.Add(condition);

        var response = await serviceClient.RetrieveMultipleAsync(query);
        return response.Entities.Select(e => e.Id).ToList();
    }

    private async Task<IReadOnlyList<Guid>> FetchEntityMetadataIdsFromSolutionsAsync(IReadOnlyList<Guid> solutionIds)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(),
        };

        var solutionCondition = new ConditionExpression("solutionid", ConditionOperator.In);
        foreach (var id in solutionIds)
        {
            solutionCondition.Values.Add(id);
        }

        query.Criteria.Conditions.Add(solutionCondition);
        query.Criteria.AddCondition("componenttype", ConditionOperator.Equal, EntityComponentType);

        var response = await serviceClient.RetrieveMultipleAsync(query);
        return response.Entities
            .Select(e => e.GetAttributeValue<Guid>("objectid"))
            .Where(id => id != Guid.Empty)
            .ToList();
    }
}
