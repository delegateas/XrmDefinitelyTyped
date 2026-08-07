using XrmDefinitelyTyped.Core.Domain;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Xml.Linq;

namespace XrmDefinitelyTyped.Core.Metadata;

public sealed class DataverseMetadataFetcher(ServiceClient serviceClient, XrmFetchConfig config) : IDataverseMetadataFetcher
{
    private const int MaxParallelism = 8;

    private readonly EntitySelectionResolver entitySelectionResolver = new(serviceClient, config);

    public async Task<IReadOnlyList<FormModel>> FetchMetadataAsync()
    {
        var entityNames = await entitySelectionResolver.ResolveEntityNamesAsync();
        var query = BuildFormQuery(entityNames);
        var entities = await RetrieveAllPagesAsync(query);

        return entities
            .AsParallel()
            .WithDegreeOfParallelism(MaxParallelism)
            .Select(ParseForm)
            .ToList();
    }

    private QueryExpression BuildFormQuery(IReadOnlyList<string> entityNames)
    {
        var query = new QueryExpression("systemform")
        {
            ColumnSet = new ColumnSet("formid", "objecttypecode", "name", "type", "formxml"),
            Criteria = new FilterExpression(LogicalOperator.And),
        };

        if (config.SkipInactiveForms)
            query.Criteria.AddCondition("formactivationstate", ConditionOperator.Equal, 1);

        if (entityNames.Count > 0)
        {
            var condition = new ConditionExpression("objecttypecode", ConditionOperator.In);
            foreach (var name in entityNames)
                condition.Values.Add(name);

            query.Criteria.Conditions.Add(condition);
        }

        return query;
    }

    private async Task<IReadOnlyList<Entity>> RetrieveAllPagesAsync(QueryExpression query)
    {
        var results = new List<Entity>();
        query.PageInfo = new PagingInfo { Count = 5000, PageNumber = 1 };

        while (true)
        {
            var response = await serviceClient.RetrieveMultipleAsync(query);
            results.AddRange(response.Entities);

            if (!response.MoreRecords)
                break;

            query.PageInfo.PageNumber++;
            query.PageInfo.PagingCookie = response.PagingCookie;
        }

        return results;
    }

    private FormModel ParseForm(Entity entity)
    {
        var id = entity.Id;
        var entityLogicalName = entity.GetAttributeValue<string>("objecttypecode") ?? string.Empty;
        var name = entity.GetAttributeValue<string>("name") ?? string.Empty;
        var typeOptionSet = entity.GetAttributeValue<OptionSetValue>("type");
        var formType = (FormType)(typeOptionSet?.Value ?? 0);
        var formXml = entity.GetAttributeValue<string>("formxml") ?? "<form/>";

        var formElement = XDocument.Parse(formXml).Root ?? new XElement("form");
        var tabs = ParseTabs(formElement, config.LabelMappings);

        return new FormModel(id, entityLogicalName, name, formType, tabs);
    }

    private static IReadOnlyList<TabModel> ParseTabs(XElement formElement, IReadOnlyDictionary<string, string> labelMappings)
    {
        return formElement
            .Element("tabs")?
            .Elements("tab")
            .Select(tab => new TabModel(
                tab.Attribute("name")?.Value ?? string.Empty,
                GetLabel(tab, labelMappings),
                ParseSections(tab, labelMappings)))
            .ToList() ?? [];
    }

    private static IReadOnlyList<SectionModel> ParseSections(XElement tabElement, IReadOnlyDictionary<string, string> labelMappings)
    {
        return tabElement
            .Element("columns")?
            .Elements("column")
            .SelectMany(col => col.Element("sections")?.Elements("section") ?? [])
            .Select(section => new SectionModel(
                section.Attribute("name")?.Value ?? string.Empty,
                GetLabel(section, labelMappings),
                ParseControls(section)))
            .ToList() ?? [];
    }

    private static IReadOnlyList<ControlModel> ParseControls(XElement sectionElement)
    {
        return sectionElement
            .Element("rows")?
            .Elements("row")
            .SelectMany(row => row.Elements("cell"))
            .SelectMany(cell => cell.Elements("control"))
            .Select(control => new ControlModel(
                control.Attribute("id")?.Value ?? string.Empty,
                control.Attribute("datafieldname")?.Value,
                control.Attribute("classid")?.Value ?? string.Empty))
            .ToList() ?? [];
    }

    private static string GetLabel(XElement element, IReadOnlyDictionary<string, string> labelMappings)
    {
        var labels = element.Element("labels")?.Elements("label").ToList() ?? [];
        if (labels.Count == 0)
            return string.Empty;

        foreach (var langCode in labelMappings.Keys)
        {
            var match = labels.FirstOrDefault(l => l.Attribute("languagecode")?.Value == langCode);
            if (match is not null)
                return match.Attribute("description")?.Value ?? string.Empty;
        }

        var english = labels.FirstOrDefault(l => l.Attribute("languagecode")?.Value == "1033");
        if (english is not null)
            return english.Attribute("description")?.Value ?? string.Empty;

        return labels[0].Attribute("description")?.Value ?? string.Empty;
    }
}
