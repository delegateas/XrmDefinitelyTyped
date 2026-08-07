namespace XrmQueryTyped.Core.Generation.ViewModels;

internal sealed record WebEntitySetViewModel(
    string EntitySetName,
    string RetrieveMapping,
    string RelatedMapping,
    string CreateUpdateDeleteAssociateMapping);
