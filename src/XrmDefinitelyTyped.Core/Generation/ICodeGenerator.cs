using XrmDefinitelyTyped.Core.Domain;

namespace XrmDefinitelyTyped.Core.Generation;

public interface ICodeGenerator
{
    /// <summary>
    /// Generates code files from the provided Dataverse form models, including intersection interfaces.
    /// </summary>
    /// <param name="forms">The Dataverse form models to generate code for.</param>
    /// <param name="customApis">Coming soon: The Dataverse Custom APIs to generate code for.</param>
    /// <param name="config">Configuration for code generation, including intersection mappings and output options.</param>
    /// <returns>A collection of generated files (filename and content).</returns>
    IEnumerable<GeneratedFile> GenerateCode(IEnumerable<FormModel> forms, IEnumerable<object> customApis, XdtGenerationConfig config);
}