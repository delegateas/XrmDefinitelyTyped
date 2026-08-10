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

        if (config.Solutions.Count > 0 && entityNames.Count == 0)
        {
            Console.Error.WriteLine(
                $"Warning: the requested solution(s) [{string.Join(", ", config.Solutions)}] contain no tables, " +
                "so every table in the environment will be generated.");
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
            ColumnSet = new ColumnSet("solutionid", "uniquename"),
            Criteria = new FilterExpression(),
        };

        var condition = new ConditionExpression("uniquename", ConditionOperator.In);
        foreach (var name in config.Solutions)
        {
            condition.Values.Add(name);
        }

        query.Criteria.Conditions.Add(condition);

        var response = await serviceClient.RetrieveMultipleAsync(query);

        var foundNames = response.Entities
            .Select(e => e.GetAttributeValue<string>("uniquename"))
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = config.Solutions.Where(name => !foundNames.Contains(name)).ToList();
        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                $"Solution(s) not found in the environment: {string.Join(", ", missing)}. " +
                "Check the unique name (not the display name).");
        }

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
