namespace DG.XrmDefinitelyTyped

open System
open System.Configuration
open System.Text.RegularExpressions

module internal CommandLineHelper =

  let getArg args arg transformer = 
    match Map.tryFind arg args with
    | Some value -> transformer value |> Some
    | None -> None

  let getListArg (args:Map<string,string>) arg transformer = 
    match Map.tryFind arg args with
    | None -> None
    | Some value -> 
      value.Split([|','|], StringSplitOptions.RemoveEmptyEntries) 
      |> Array.map (fun s -> s.Trim())
      |> Array.filter (fun s -> s.Length > 0)
      |> Array.map transformer
      |> function
      | arr when arr.Length > 0 -> Some arr
      | _ -> None

  let (|GetArgVal|_|) input = 
    let m = Regex("^[/\-]([^:]+)(:\"?(.*)\"?)?$").Match(input)
    if m.Success then Some (m.Groups.[1].Value.ToLower(), m.Groups.[3].Value)
    else None


  let handleArg argMap parsedArgs k v =
    match Map.tryFind k argMap with
    | Some a -> Map.add a.command v parsedArgs
    | None ->
      printfn "Option '%s' not recognized." k
      parsedArgs

  let sharesElement set1 =
    Set.intersect set1 >> Set.isEmpty >> not

  /// Helper function that recursively parses the arguments
  let rec parseCommandLineRec args argMap parsedArgs =
    match args with
    | GetArgVal(k,v) :: xs ->
      handleArg argMap parsedArgs k v
      |> parseCommandLineRec xs argMap
    | [] -> parsedArgs
    | x :: xs  -> failwithf "Did not understand argument '%s'." x


  let parseConfigArgs argMap parsedArgs =
    ConfigurationManager.AppSettings.AllKeys
    |> Array.fold (fun args k -> 
      handleArg argMap args k ConfigurationManager.AppSettings.[k]
    ) parsedArgs


  /// Parses the given arguments against the expected arguments.
  let parseArgs argv argMap =
    let commandLineArgs = parseCommandLineRec argv argMap Map.empty
    let specialArgs, executionArgs = 
      commandLineArgs |> Map.partition (fun k v -> 
        Args.useConfigSet.Contains k || Args.flagArgMap.ContainsKey k)

    let configArgs =  
      match Map.isEmpty executionArgs || Map.containsKey "useconfig" commandLineArgs with
      | true  -> parseConfigArgs argMap Map.empty
      | false -> Map.empty

    commandLineArgs |> Map.fold (fun acc k v -> Map.add k v acc) configArgs

  // Check if args against current expected args
  let checkArgs expectedArgs parsedArgs =
    let validArgs = 
      expectedArgs
      |> List.map (fun a -> a.command :: a.altCommands) |> List.concat 
      |> List.map (fun c -> c.ToLower()) |> Set.ofList 

    let argIsInMap (aMap:Map<string, _>) a =
      a.command :: a.altCommands |> List.exists aMap.ContainsKey

    let missingArgs =
      expectedArgs
      |> List.filter (fun a -> a.required) 
      |> List.map (fun a -> 
        (a.command, a |> argIsInMap parsedArgs))
      |> List.filter (snd >> not)
      |> List.map fst

    match missingArgs.Length = 0 with
    | true -> parsedArgs 
    | false -> 
      failwithf "Missing required argument(s): %s" 
        (String.concat ", " missingArgs)


  /// Helper that prints all the possible arguments to console.
  let printArgumentHelp expectedArgs = 
    printfn "Available arguments:"
    expectedArgs |> List.iter
      (fun arg ->
        printfn "%12s - %s"
          arg.command 
          arg.description)

  let showDescription () =
    printfn "[%s v.%s]" 
      (Reflection.Assembly.GetExecutingAssembly().GetName().Name) 
      AssemblyVersionInformation.AssemblyVersion
    printfn ""

  let showUsage () =
    printfn "%s" Args.usageString
    printfn ""
    printArgumentHelp Args.fullArgList