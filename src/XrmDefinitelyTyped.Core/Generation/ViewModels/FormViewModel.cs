namespace XrmDefinitelyTyped.Core.Generation.ViewModels;

internal sealed record FormViewModel(
    string EntityLogicalName,
    string FormTypeName,
    string FormName,
    IReadOnlyList<TabViewModel> Tabs,
    IReadOnlyList<AttributeViewModel> Attributes,
    IReadOnlyList<ControlViewModel> Controls);
