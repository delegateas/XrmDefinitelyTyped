namespace XrmDefinitelyTyped.Core.Domain;

public sealed record TabModel(string Name, string Label, IReadOnlyList<SectionModel> Sections);
