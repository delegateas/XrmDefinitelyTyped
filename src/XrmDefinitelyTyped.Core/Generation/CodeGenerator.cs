using XrmDefinitelyTyped.Core.Domain;
using XrmDefinitelyTyped.Core.Generation.Generators;

namespace XrmDefinitelyTyped.Core.Generation;

public sealed class CodeGenerator : ICodeGenerator
{
    private readonly FormGenerator _formGenerator = new();

    public IEnumerable<GeneratedFile> GenerateCode(
        IEnumerable<FormModel> forms,
        IEnumerable<object> customApis,
        XdtGenerationConfig config)
    {
        ArgumentNullException.ThrowIfNull(forms);
        ArgumentNullException.ThrowIfNull(config);

        var files = new List<GeneratedFile>();
        files.AddRange(_formGenerator.Generate(forms.ToList()));

        // Custom API generation is not yet implemented. When added, guard with
        // config.GenerateCustomApis and consume the customApis argument here.

        return files;
    }
}
