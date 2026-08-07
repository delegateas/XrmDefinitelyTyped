namespace XrmQueryTyped.Core.Generation.ViewModels;

internal sealed record WebInterfaceViewModel(
    string Name,
    string Extends,
    IReadOnlyList<WebMemberViewModel> Members);
