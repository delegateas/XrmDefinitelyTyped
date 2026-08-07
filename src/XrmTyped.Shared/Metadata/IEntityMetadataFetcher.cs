using XrmTyped.Shared.Domain;

namespace XrmTyped.Shared.Metadata;

public interface IEntityMetadataFetcher
{
    Task<IReadOnlyList<EntityModel>> FetchEntityMetadataAsync();
}
