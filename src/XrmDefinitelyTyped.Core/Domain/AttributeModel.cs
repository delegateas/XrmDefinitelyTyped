namespace XrmDefinitelyTyped.Core.Domain;

public sealed record AttributeModel(
    string SchemaName,
    string LogicalName,
    string TypeScriptType,
    SpecialAttributeType SpecialType,
    TargetEntitySet[] Targets,
    bool Readable,
    bool Createable,
    bool Updateable);
