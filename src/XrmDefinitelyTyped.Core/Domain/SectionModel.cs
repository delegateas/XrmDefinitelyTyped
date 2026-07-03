namespace XrmDefinitelyTyped.Core.Domain;

public sealed record SectionModel(string Name, string Label, IReadOnlyList<ControlModel> Controls);
