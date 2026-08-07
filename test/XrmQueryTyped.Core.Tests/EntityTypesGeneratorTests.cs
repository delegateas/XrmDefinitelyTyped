using XrmTyped.Shared.Generation;
using XrmQueryTyped.Core.Generation;

namespace XrmQueryTyped.Core.Tests;

public sealed class EntityTypesGeneratorTests
{
    private static readonly XrmQueryGenerationConfig DefaultConfig = new();

    [Theory]
    [InlineData("account")]
    [InlineData("contact")]
    public void Generate_WritesOneFilePerEntityMatchingFixture(string logicalName)
    {
        var files = Generate(DefaultConfig);

        var file = files.Single(generated => generated.Filename == Path.Combine("Web", $"{logicalName}.d.ts"));
        Assert.Equal(Fixture($"{logicalName}.expected.d.ts"), Normalize(file.Content));
    }

    [Fact]
    public void Generate_WithSingleFile_ConcatenatesIntoWebEntities()
    {
        var files = Generate(DefaultConfig with { SingleFile = true });

        var file = Assert.Single(files);
        Assert.Equal(Path.Combine("Web", "WebEntities.d.ts"), file.Filename);
        Assert.Contains("interface Account_Select {", file.Content, StringComparison.Ordinal);
        Assert.Contains("interface Contact_Select {", file.Content, StringComparison.Ordinal);
    }

    [Fact]
    public void Generate_WithoutNamespace_EmitsInterfacesAtGlobalScope()
    {
        var files = Generate(DefaultConfig with { Namespace = "" });

        var content = files[0].Content;
        Assert.DoesNotContain("declare namespace", content, StringComparison.Ordinal);
        Assert.Contains("interface Account_Fixed {\n  accountid: string;\n}", Normalize(content), StringComparison.Ordinal);
        Assert.Contains("accounts: WebMappingRetrieve<Account_Select,", Normalize(content), StringComparison.Ordinal);
    }

    [Fact]
    public void Generate_WithoutEntitySetName_OmitsGlobalMergeBlocks()
    {
        var entity = TestEntityModels.Account() with { EntitySetName = null };

        var files = new EntityTypesGenerator().Generate([entity], DefaultConfig);

        Assert.DoesNotContain("WebEntitiesRetrieve", files[0].Content, StringComparison.Ordinal);
        Assert.Contains("interface Account_Fixed {", files[0].Content, StringComparison.Ordinal);
    }

    private static IReadOnlyList<GeneratedFile> Generate(XrmQueryGenerationConfig config) =>
        new EntityTypesGenerator().Generate([TestEntityModels.Account(), TestEntityModels.Contact()], config);

    private static string Fixture(string filename) =>
        Normalize(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "Fixtures", filename)));

    private static string Normalize(string content) => content.ReplaceLineEndings("\n");
}
