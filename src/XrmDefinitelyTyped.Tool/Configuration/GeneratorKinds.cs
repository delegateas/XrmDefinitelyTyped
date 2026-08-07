namespace XrmDefinitelyTyped.Tool.Configuration;

public static class GeneratorKinds
{
    public const string FormsValue = "forms";
    public const string WebValue = "web";

    public static GeneratorKind[] All => [GeneratorKind.Forms, GeneratorKind.Web];

    public static GeneratorKind[] Parse(IReadOnlyList<string> values) =>
        values.Count == 0 ? All : [.. values.Select(ParseSingle).Distinct()];

    private static GeneratorKind ParseSingle(string value) =>
        value.Trim().ToLowerInvariant() switch
        {
            FormsValue => GeneratorKind.Forms,
            WebValue => GeneratorKind.Web,
            _ => throw new ArgumentException($"Unknown generator '{value}'. Valid values are '{FormsValue}' and '{WebValue}'."),
        };
}
