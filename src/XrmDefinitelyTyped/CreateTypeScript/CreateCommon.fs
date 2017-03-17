module internal DG.XrmDefinitelyTyped.CreateCommon

open TsStringUtil

let skipNsIfEmpty (ns: Namespace) =
  match System.String.IsNullOrWhiteSpace ns.name with
  | true ->
    (ns.interfaces |> List.map interfaceToString |> List.concat)
    @ (ns.typeDecs |> List.map makeTypeDeclaration)
  | false ->
    nsToString ns



let wrapNameInNsIfAny ns =
  match System.String.IsNullOrWhiteSpace ns with
  | true -> id
  | false -> sprintf "%s.%s" ns

let wrapNamesInNsIfAny ns =
  match System.String.IsNullOrWhiteSpace ns with
  | true -> id
  | false -> List.map (wrapNameInNsIfAny ns)