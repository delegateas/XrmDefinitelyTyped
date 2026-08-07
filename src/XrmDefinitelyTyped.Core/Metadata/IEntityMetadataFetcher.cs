using XrmDefinitelyTyped.Core.Domain;

namespace XrmDefinitelyTyped.Core.Metadata;

public interface IEntityMetadataFetcher
{
    Task<IReadOnlyList<EntityModel>> FetchEntityMetadataAsync();
}
