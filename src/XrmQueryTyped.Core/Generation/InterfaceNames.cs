namespace XrmQueryTyped.Core.Generation;

internal static class InterfaceNames
{
    public static string Fixed(string entityName) => $"{entityName}_Fixed";

    public static string Result(string entityName) => $"{entityName}_Result";

    public static string FormattedResult(string entityName) => $"{entityName}_FormattedResult";

    public static string Select(string entityName) => $"{entityName}_Select";

    public static string Filter(string entityName) => $"{entityName}_Filter";

    public static string Expand(string entityName) => $"{entityName}_Expand";

    public static string Create(string entityName) => $"{entityName}_Create";

    public static string Update(string entityName) => $"{entityName}_Update";

    public static string RelatedOne(string entityName) => $"{entityName}_RelatedOne";

    public static string RelatedMany(string entityName) => $"{entityName}_RelatedMany";

    public static string RetrieveMapping(string entityName, string prefix = "") =>
        $"WebMappingRetrieve<{prefix}{Select(entityName)}, {prefix}{Expand(entityName)}, {prefix}{Filter(entityName)}, " +
        $"{prefix}{Fixed(entityName)}, {prefix}{Result(entityName)}, {prefix}{FormattedResult(entityName)}>";

    public static string RelatedMapping(string entityName, string prefix = "") =>
        $"WebMappingRelated<{prefix}{RelatedOne(entityName)}, {prefix}{RelatedMany(entityName)}>";

    public static string CreateUpdateDeleteAssociateMapping(string entityName, string prefix = "") =>
        $"WebMappingCUDA<{prefix}{Create(entityName)}, {prefix}{Update(entityName)}, {prefix}{Select(entityName)}>";
}
