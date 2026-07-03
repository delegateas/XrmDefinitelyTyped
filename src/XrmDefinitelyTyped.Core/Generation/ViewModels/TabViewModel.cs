namespace XrmDefinitelyTyped.Core.Generation.ViewModels;

internal sealed record TabViewModel(
    string Name,
    IReadOnlyList<SectionViewModel> Sections);
