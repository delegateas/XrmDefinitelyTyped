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

        // LoopLimit counts iterations cumulatively across the whole context, so the default of 1000
        // trips on wide entities (nested member loops). 0 disables the limit.
        var context = new TemplateContext { MemberRenamer = member => member.Name, LoopLimit = 0 };
        context.PushGlobal(scriptObject);

        return template.Render(context);
    }
}
