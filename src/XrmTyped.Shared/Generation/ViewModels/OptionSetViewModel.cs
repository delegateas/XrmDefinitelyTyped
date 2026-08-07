namespace XrmTyped.Shared.Generation.ViewModels;

internal sealed record OptionSetViewModel(
    string Name,
    string Union,
    IReadOnlyList<OptionViewModel> Options);
