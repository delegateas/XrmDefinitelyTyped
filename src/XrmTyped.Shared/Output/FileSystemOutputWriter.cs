using XrmTyped.Shared.Generation;

namespace XrmTyped.Shared.Output;

public class FileSystemOutputWriter : IOutputWriter
{
    public void WriteFiles(IEnumerable<GeneratedFile> files, string outputDirectory)
    {
        ArgumentNullException.ThrowIfNull(files);

        if (Directory.Exists(outputDirectory))
        {
            foreach (var file in Directory.GetFiles(outputDirectory))
            {
                File.Delete(file);
            }

            foreach (var dir in Directory.GetDirectories(outputDirectory))
            {
                Directory.Delete(dir, true);
            }
        }
        else
        {
            Directory.CreateDirectory(outputDirectory);
        }

        foreach (var file in files)
        {
            var filePath = Path.Combine(outputDirectory, file.Filename);
            var directoryPath = Path.GetDirectoryName(filePath) ?? throw new InvalidOperationException("Unable to determine directory path for file creation.");
            Directory.CreateDirectory(directoryPath);
            File.WriteAllText(filePath, file.Content);
        }
    }
}