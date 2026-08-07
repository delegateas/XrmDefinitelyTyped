namespace XrmTyped.Shared.Metadata;

public record XrmFetchConfig(
    IReadOnlyList<string> Solutions,
    IReadOnlyList<string> Entities,
    IReadOnlyDictionary<string, string> LabelMappings,
    bool SkipInactiveForms)
{
    public static XrmFetchConfig From(object config)
    {
        if (config is not XrmFetchConfig fetchConfig)
            throw new ArgumentException("Expected XrmFetchConfig for Dataverse metadata source.", nameof(config));

        return fetchConfig;
    }
}
