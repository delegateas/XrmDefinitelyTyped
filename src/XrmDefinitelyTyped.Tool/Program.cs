using DataverseConnection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.PowerPlatform.Dataverse.Client;
using XrmDefinitelyTyped.Core.Generation;
using XrmDefinitelyTyped.Core.Metadata;
using XrmDefinitelyTyped.Core.Output;
using XrmDefinitelyTyped.Tool;
using XrmDefinitelyTyped.Tool.Configuration;

try
{
    var configuration = AppSettingsConfigBuilder.BuildConfiguration();
    var appSettingsConfig = AppSettingsConfigBuilder.BuildFromConfiguration(configuration);

    // Parse command line args and merge
    var paramsConfig = CommandLineParser.Parse(args);

    var config = new XdtConfig(
        paramsConfig.OutputDirectory ?? appSettingsConfig.OutputDirectory ?? string.Empty,
        new XrmFetchConfig(
            paramsConfig.Solutions ?? appSettingsConfig.Solutions ?? [],
            paramsConfig.Entities ?? appSettingsConfig.Entities ?? [],
            paramsConfig.LabelMappings ?? appSettingsConfig.LabelMappings ?? new Dictionary<string, string>(),
            paramsConfig.SkipInactiveForms ?? appSettingsConfig.SkipInactiveForms ?? false),
        new XdtGenerationConfig(
            paramsConfig.IntersectMapping ?? appSettingsConfig.IntersectMapping ?? new Dictionary<string, IReadOnlyList<string>>(),
            SingleFile: paramsConfig.SingleFile ?? appSettingsConfig.SingleFile ?? false,
            GenerateCustomApis: paramsConfig.GenerateCustomApis ?? appSettingsConfig.GenerateCustomApis ?? false));

    ConfigValidator.Validate(config);

    // Authentication is handled by the DataverseConnection package via DefaultAzureCredential,
    // whose credential chain includes the caller's Azure CLI session (`az login`). The package
    // reads the environment URL from configuration (DATAVERSE_URL).
    var services = new ServiceCollection();
    services.AddSingleton(configuration);
    services.AddDataverse();
    using var provider = services.BuildServiceProvider();
    var serviceClient = provider.GetRequiredService<ServiceClient>();

    var fetcher = new DataverseMetadataSourceFactory(serviceClient)
        .CreateFetcher(MetadataSourceType.Dataverse, config.Fetch);

    Console.WriteLine($"Fetching form metadata from {configuration["DATAVERSE_URL"]} ...");
    var forms = await fetcher.FetchMetadataAsync();
    Console.WriteLine($"Fetched {forms.Count} form(s).");

    var files = new CodeGenerator().GenerateCode(forms, [], config.Generation).ToList();
    Console.WriteLine($"Generated {files.Count} file(s).");

    new FileSystemOutputWriter().WriteFiles(files, config.OutputDirectory);
    Console.WriteLine($"Wrote output to {Path.GetFullPath(config.OutputDirectory)}");

    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Error: {ex.Message}");
    return 1;
}
