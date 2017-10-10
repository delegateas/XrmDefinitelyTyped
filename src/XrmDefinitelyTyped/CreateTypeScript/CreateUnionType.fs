module internal DG.XrmDefinitelyTyped.CreateType

open TsStringUtil

let getUnionType name (types : string[]) =
  if types.Length > 0 then
    let tsTypes = types |> Array.map (fun t -> getConstantType t) |> List.ofArray

    let declaration = makeTypeDeclaration(name, tsTypes.Head)
    let unionType = 
      tsTypes.Tail
      |> List.map (fun t -> sprintf "| %s" (typeToString t))
      |> indent

    declaration::unionType
  else
    [makeTypeDeclaration(name, TsType.Undefined)]