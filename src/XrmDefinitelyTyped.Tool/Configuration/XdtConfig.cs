using XrmDefinitelyTyped.Core.Generation;
using XrmDefinitelyTyped.Core.Metadata;
using XrmQueryTyped.Core.Generation;

namespace XrmDefinitelyTyped.Tool.Configuration;

public record XdtConfig(
    string OutputDirectory,
    XrmFetchConfig Fetch,
    XdtGenerationConfig Generation,
    GeneratorKind[] Generators,
    XrmQueryGenerationConfig XrmQuery);
