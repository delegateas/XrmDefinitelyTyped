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

let rec intersectExpand isFirst (types: TsType list list) =
  if types |> List.forall (fun x -> x.IsEmpty) then [] else
  let current = 
    match isFirst with
    | true -> types.Head.Head 
    | false -> TsType.Intersection (types |> List.map (fun x -> x.Head)) 
      
  current :: intersectExpand false (types |> List.map (fun x -> x.Tail))

let mergeOwnerExpand expandGrouping (vars: (Variable * string) list) =
  let owner, notOwner =
    vars
    |> List.partition (fun (_,name) -> name = "ownerid")
  
  let strippedNotOwner = notOwner |> List.map fst

  match owner.IsEmpty with
  | true -> strippedNotOwner
  | false ->
    let combinedOwner =
      let varTypes =
        owner
        |> List.fold (fun (types: TsType list list) (var,name) ->
          match var.varType with
          | None -> types
          | Some (TsType.SpecificGeneric(_,t)) -> t :: types
          | Some _ -> types
        ) []
      let varName = (fst owner.Head).name
      Variable.Create(varName, TsType.SpecificGeneric(expandGrouping, intersectExpand true varTypes))
    combinedOwner :: strippedNotOwner