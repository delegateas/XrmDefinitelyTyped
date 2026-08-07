namespace XrmQueryTyped.Core.Generation.ViewModels;

internal sealed record WebEntityFileViewModel(
    string Namespace,
    bool HasNamespace,
    string Indent,
    IReadOnlyList<WebInterfaceViewModel> Interfaces,
    IReadOnlyList<WebEntitySetViewModel> EntitySets);
