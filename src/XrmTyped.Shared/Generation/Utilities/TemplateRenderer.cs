using Scriban;
using Scriban.Runtime;
using System.Reflection;

namespace XrmTyped.Shared.Generation.Utilities;

public static class TemplateRenderer
{
    public static Template Load(Assembly assembly, string resourceName)
    {
        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Embedded template '{resourceName}' not found.");
        using var reader = new StreamReader(stream);
        return Template.Parse(reader.ReadToEnd());
    }

    public static string Render(Template template, object viewModel)
    {
        var scriptObject = new ScriptObject();
        scriptObject.Import(viewModel, renamer: member => member.Name);

        // Both Scriban defaults are too small for generated declarations: LoopLimit (1000) counts
        // iterations cumulatively across the whole context and trips on wide entities, and
        // LimitToString (1 MiB) silently truncates the output mid-token and appends "...".
        // 0 disables each limit.
        var context = new TemplateContext
        {
            MemberRenamer = member => member.Name,
            LoopLimit = 0,
            LimitToString = 0,
        };
        context.PushGlobal(scriptObject);

        return template.Render(context);
    }
}
