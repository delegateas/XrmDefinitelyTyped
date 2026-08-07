using Scriban;
using System.Reflection;
using XrmDefinitelyTyped.Core.Domain;
using XrmDefinitelyTyped.Core.Generation.Utilities;
using XrmDefinitelyTyped.Core.Generation.ViewModels;

namespace XrmDefinitelyTyped.Core.Generation.Generators;

public sealed class OptionSetGenerator
{
    private static readonly Template Template = TemplateRenderer.Load(
        Assembly.GetExecutingAssembly(),
        "XrmDefinitelyTyped.Core.Templates.optionset.sbn");

    public IReadOnlyList<GeneratedFile> Generate(IReadOnlyList<OptionSetModel> optionSets)
    {
        return optionSets
            .DistinctBy(optionSet => optionSet.Name, StringComparer.Ordinal)
            .OrderBy(optionSet => optionSet.Name, StringComparer.Ordinal)
            .Select(GenerateOptionSetFile)
            .ToList();
    }

    private static GeneratedFile GenerateOptionSetFile(OptionSetModel optionSet)
    {
        var viewModel = new OptionSetViewModel(
            optionSet.Name,
            BuildUnion(optionSet),
            [.. optionSet.Options.Select(option => new OptionViewModel(option.Label, option.Value))]);

        var content = TemplateRenderer.Render(Template, viewModel);
        var filename = Path.Combine("_internal", "Enum", $"{optionSet.Name}.d.ts");
        return new GeneratedFile(filename, content);
    }

    private static string BuildUnion(OptionSetModel optionSet) =>
        optionSet.Options.Length == 0
            ? "number"
            : string.Join(" | ", optionSet.Options.Select(option => option.Value).Distinct().Order());
}
