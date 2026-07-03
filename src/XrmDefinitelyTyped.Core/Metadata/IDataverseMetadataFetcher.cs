using XrmDefinitelyTyped.Core.Domain;

namespace XrmDefinitelyTyped.Core.Metadata;

public interface IDataverseMetadataFetcher
{
    Task<IReadOnlyList<FormModel>> FetchMetadataAsync();
}
