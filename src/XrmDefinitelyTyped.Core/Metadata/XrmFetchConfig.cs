namespace XrmDefinitelyTyped.Core.Metadata;

public record XrmFetchConfig(
    IReadOnlyList<string> Solutions,
    IReadOnlyList<string> Entities,
    IReadOnlyDictionary<string, string> LabelMappings,
    bool SkipInactiveForms);