module internal DG.XrmDefinitelyTyped.CreateActions

open DG.XrmDefinitelyTyped.IntermediateRepresentation
open DG.XrmDefinitelyTyped.TsStringUtil

let withEnding ending str = sprintf "%s%s" str ending
let inputName = withEnding "_Input"
let outputName = withEnding "_Output"
let boundEntitiesName = withEnding "_BoundEntity"

let getActionInterfaceLines ns (a:XrmAction) =
  let output, input =
    a.parameters
    |> List.partition (fun p -> p.isOutputParameter)

  let inputInterface = 
    Interface.Create(inputName a.name, vars = List.map (fun (p:XrmActionParameter) -> Variable.Create(p.name, p.varType, optional = p.optional)) input)
  let outputInterface = 
    Interface.Create(outputName a.name, vars = List.map (fun (p:XrmActionParameter) -> Variable.Create(p.name, p.varType)) output)
  
  let boundEntityVariables =
    match a.boundEntity with
    | None -> []
    | Some e -> [Variable.Create(e, TsType.String)]

  let boundEntitiesInterface = 
    Interface.Create(boundEntitiesName a.name, vars = boundEntityVariables)

  let ns = Namespace.Create(ns, declare = true, interfaces = [inputInterface;outputInterface;boundEntitiesInterface])
  
  let mapping = 
    Interface.Create(sprintf "Web%sActions" (if a.boundEntity.IsSome then "Bound" else "Unbound"), 
      vars = [Variable.Create(a.name, TsType.SpecificGeneric ("WebMappingAction", [TsType.Custom (inputName a.name); TsType.Custom (boundEntitiesName a.name); TsType.Custom (outputName a.name)]))]
    )

  CreateCommon.skipNsIfEmpty ns @ (mapping |> interfaceToString)