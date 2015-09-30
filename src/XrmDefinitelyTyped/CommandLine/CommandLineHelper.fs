namespace DG.XrmDefinitelyTyped

open System.Text.RegularExpressions

module CommandLineHelper =

  type ArgInfo = { command: string; description: string; required: bool }

  let (|GetArgVal|_|) input = 
    let m = Regex("^/([^:]+):\"?(.*)\"?$").Match(input)
    if m.Success then Some (m.Groups.[1].Value, m.Groups.[2].Value)
    else None

  /// Helper function that recursively parses the arguments
  let rec parseCommandLineRec args (expectedArgs:Set<string>) (parsedArgs:Map<string,string>) =
    match args with
    | GetArgVal(k,v) :: xs ->
      (match expectedArgs.Contains k with
      | true -> parsedArgs.Add(k, v)
      | false ->
        printfn "Option '%s' not recognized." k
        parsedArgs)
      |> parseCommandLineRec xs expectedArgs
    | [] -> parsedArgs
    | x :: xs  -> failwithf "Did not understand argument '%s'." x

  /// Parses the given arguments against the expected arguments.
  let parseArgs argv expectedArgs =
    let argSet = expectedArgs |> List.map (fun a -> a.command) |> Set.ofList 
    let argv = argv |> List.ofArray
    let parsedArgs = parseCommandLineRec argv argSet Map.empty
  
    let missingArgs =
      expectedArgs
      |> List.filter (fun a -> a.required) 
      |> List.map (fun a -> (a.command, parsedArgs.ContainsKey(a.command)))
      |> List.filter (snd >> not)
      |> List.map fst

    match missingArgs.Length = 0 with
    | true -> parsedArgs
    | false -> failwithf "Missing required argument(s): %s" (String.concat ", " missingArgs)

  /// Helper that prints all the possible arguments to console.
  let printArgumentHelp expectedArgs = 
    printfn "Available arguments:"
    expectedArgs |> List.iter
      (fun arg ->
        printfn "%12s - %s%s"
          arg.command 
          arg.description 
          (if arg.required then " (required)" else ""))