using XrmTyped.Shared.Domain;
using XrmTyped.Shared.Generation.Generators;

namespace XrmTyped.Shared.Tests;

public sealed class OptionSetGeneratorTests
{
    [Fact]
    public void Generate_EmitsUnionTypeWithLabelDocumentation()
    {
        var optionSet = new OptionSetModel("account_category", [new OptionModel("Preferred", 1), new OptionModel("Standard", 2)]);

        var file = Assert.Single(new OptionSetGenerator().Generate([optionSet]));

        Assert.Equal(Path.Combine("_internal", "Enum", "account_category.d.ts"), file.Filename);
        Assert.Contains("declare type account_category = 1 | 2;", file.Content, StringComparison.Ordinal);
        Assert.Contains("`1`: Preferred", file.Content, StringComparison.Ordinal);
        Assert.Contains("`2`: Standard", file.Content, StringComparison.Ordinal);
    }

    [Fact]
    public void Generate_WithoutOptions_FallsBackToNumber()
    {
        var file = Assert.Single(new OptionSetGenerator().Generate([new OptionSetModel("empty_set", [])]));

        Assert.Contains("declare type empty_set = number;", file.Content, StringComparison.Ordinal);
    }

    [Fact]
    public void Generate_DeduplicatesOptionSetsByNameAndOrdersThem()
    {
        var first = new OptionSetModel("b_set", [new OptionModel("One", 1)]);
        var second = new OptionSetModel("a_set", [new OptionModel("One", 1)]);

        var files = new OptionSetGenerator().Generate([first, second, first]);

        Assert.Equal(
            [Path.Combine("_internal", "Enum", "a_set.d.ts"), Path.Combine("_internal", "Enum", "b_set.d.ts")],
            files.Select(file => file.Filename));
    }
}
