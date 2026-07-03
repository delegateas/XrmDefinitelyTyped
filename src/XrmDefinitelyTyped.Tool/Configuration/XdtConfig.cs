using XrmDefinitelyTyped.Core.Generation;
using XrmDefinitelyTyped.Core.Metadata;

namespace XrmDefinitelyTyped.Tool.Configuration;

public record XdtConfig(
    string OutputDirectory,
    XrmFetchConfig Fetch,
    XdtGenerationConfig Generation);