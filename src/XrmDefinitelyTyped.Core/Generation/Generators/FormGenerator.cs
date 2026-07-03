using Scriban;
using Scriban.Runtime;
using System.Reflection;
using XrmDefinitelyTyped.Core.Domain;
using XrmDefinitelyTyped.Core.Generation;
using XrmDefinitelyTyped.Core.Generation.Utilities;
using XrmDefinitelyTyped.Core.Generation.ViewModels;

namespace XrmDefinitelyTyped.Core.Generation.Generators;

public sealed class FormGenerator
{
    private static readonly Template _template = LoadTemplate();

    public IReadOnlyList<GeneratedFile> Generate(IReadOnlyList<FormModel> forms)
    {
        ArgumentNullException.ThrowIfNull(forms);
        return forms.Select(GenerateFormFile).ToList();
    }

    private static GeneratedFile GenerateFormFile(FormModel form)
    {
        var viewModel = BuildFormViewModel(form);

        var scriptObject = new ScriptObject();
        scriptObject.Import(viewModel, renamer: member => member.Name);

        var context = new TemplateContext { MemberRenamer = member => member.Name };
        context.PushGlobal(scriptObject);

        var content = _template.Render(context);
        var filename = Path.Combine(form.EntityLogicalName, form.FormType.ToString(), $"{viewModel.FormName}.d.ts");
        return new GeneratedFile(filename, content);
    }

    private static FormViewModel BuildFormViewModel(FormModel form)
    {
        var tabs = form.Tabs.Select(BuildTabViewModel).ToList();

        var allControls = form.Tabs
            .SelectMany(t => t.Sections)
            .SelectMany(s => s.Controls)
            .ToList();

        var attributes = allControls
            .Where(c => c.DataFieldName is not null)
            .GroupBy(c => c.DataFieldName!, StringComparer.OrdinalIgnoreCase)
            .Select(g =>
            {
                var typeInfo = ClassIdMap.Resolve(g.First().ClassId);
                return typeInfo.AttributeType is not null
                    ? new AttributeViewModel(g.Key, typeInfo.AttributeType)
                    : null;
            })
            .OfType<AttributeViewModel>()
            .OrderBy(a => a.FieldName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var controls = allControls
            .Select(c => new ControlViewModel(c.Id, ClassIdMap.Resolve(c.ClassId).ControlType))
            .OrderBy(c => c.ControlId, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new FormViewModel(
            form.EntityLogicalName,
            form.FormType.ToString(),
            TypeScriptIdentifier.ToPascalCase(form.Name),
            tabs,
            attributes,
            controls);
    }

    private static TabViewModel BuildTabViewModel(TabModel tab)
    {
        var sections = tab.Sections
            .Select(s => new SectionViewModel(s.Name))
            .ToList();
        return new TabViewModel(tab.Name, sections);
    }

    private static Template LoadTemplate()
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var stream = assembly.GetManifestResourceStream("XrmDefinitelyTyped.Core.Templates.form.sbn")
            ?? throw new InvalidOperationException("Embedded template 'form.sbn' not found.");
        using var reader = new StreamReader(stream);
        return Template.Parse(reader.ReadToEnd());
    }
}
