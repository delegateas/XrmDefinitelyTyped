namespace XrmDefinitelyTyped.Tool.Configuration;

public static class ConfigValidator
{
    public static void Validate(XdtConfig config)
    {
        if (string.IsNullOrWhiteSpace(config.OutputDirectory))
            throw new ArgumentException(
                "An output directory is required. Provide it via --output-directory or appsettings.json (XrmDefinitelyTyped:OutputDirectory).");
    }
}
