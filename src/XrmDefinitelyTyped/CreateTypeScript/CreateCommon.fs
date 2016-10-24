namespace DG.XrmDefinitelyTyped

open TsStringUtil
open IntermediateRepresentation

module internal CreateCommon =
 
  let interfacesToNsLines ns is =
    match System.String.IsNullOrWhiteSpace ns with
    | true ->
      is
      |> List.map interfaceToString
      |> List.concat
    | false ->
      Namespace.Create(ns, declare = true, interfaces = is)
      |> nsToString

  let wrapNamesInNsIfAny ns =
    match System.String.IsNullOrWhiteSpace ns with
    | true -> id
    | false -> List.map (sprintf "%s.%s" ns)