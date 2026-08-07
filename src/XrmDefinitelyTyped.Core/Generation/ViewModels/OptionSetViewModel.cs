namespace XrmDefinitelyTyped.Core.Generation.ViewModels;

internal sealed record OptionSetViewModel(
    string Name,
    string Union,
    IReadOnlyList<OptionViewModel> Options);
