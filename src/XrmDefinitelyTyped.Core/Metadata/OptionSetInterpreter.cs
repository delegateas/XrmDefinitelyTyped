using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using System.Text.RegularExpressions;
using XrmDefinitelyTyped.Core.Domain;

namespace XrmDefinitelyTyped.Core.Metadata;

public static partial class OptionSetInterpreter
{
    private const string EmptyLabel = "_EmptyString";

    private static readonly HashSet<string> ReservedWords = new(StringComparer.Ordinal)
    {
        "import", "export", "class", "enum", "var", "for", "if", "else", "const", "true", "false",
    };

    [GeneratedRegex(@"[^\w]")]
    private static partial Regex NonWordCharacters();

    public static OptionSetModel? Interpret(
        OptionSetMetadataBase metadata,
        IReadOnlySet<string> entityNames,
        IReadOnlyDictionary<string, string> labelMappings)
    {
        var name = entityNames.Contains(metadata.Name) ? $"{metadata.Name}_Enum" : metadata.Name;

        return metadata switch
        {
            OptionSetMetadata optionSet => new OptionSetModel(name, BuildOptions(optionSet, labelMappings)),
            BooleanOptionSetMetadata booleanOptionSet => new OptionSetModel(name, BuildBooleanOptions(booleanOptionSet, labelMappings)),
            _ => null,
        };
    }

    private static OptionModel[] BuildOptions(OptionSetMetadata metadata, IReadOnlyDictionary<string, string> labelMappings)
    {
        var labelOccurrences = new Dictionary<string, int>(StringComparer.Ordinal);
        var options = new List<OptionModel>();

        foreach (var option in metadata.Options)
        {
            var label = GetLabel(option.Label, labelMappings);
            labelOccurrences.TryGetValue(label, out var previousOccurrences);
            labelOccurrences[label] = previousOccurrences + 1;

            var uniqueLabel = previousOccurrences == 0 ? label : $"{label}_{previousOccurrences + 1}";
            options.Add(new OptionModel(uniqueLabel, option.Value.GetValueOrDefault()));
        }

        return [.. options.OrderBy(option => option.Value)];
    }

    private static OptionModel[] BuildBooleanOptions(BooleanOptionSetMetadata metadata, IReadOnlyDictionary<string, string> labelMappings) =>
    [
        new OptionModel(GetLabel(metadata.FalseOption.Label, labelMappings), 0),
        new OptionModel(GetLabel(metadata.TrueOption.Label, labelMappings), 1),
    ];

    private static string GetLabel(Label label, IReadOnlyDictionary<string, string> labelMappings)
    {
        var text = label.UserLocalizedLabel?.Label;
        if (text is null)
            return EmptyLabel;

        var mapped = labelMappings.Aggregate(text, (current, mapping) => Regex.Replace(current, mapping.Key, mapping.Value));
        return Sanitize(mapped);
    }

    private static string Sanitize(string label)
    {
        var stripped = NonWordCharacters().Replace(label, string.Empty);

        return stripped switch
        {
            "" => EmptyLabel,
            _ when char.IsAsciiDigit(stripped[0]) => $"_{stripped}",
            _ when ReservedWords.Contains(stripped) => $"_{stripped}",
            _ => stripped,
        };
    }
}
