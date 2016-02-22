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
    let m = Regex("^/([^:]+):\"?(.*)\"?$").Match(input)
    if m.Success then Some (m.Groups.[1].Value.ToLower(), m.Groups.[2].Value)
    else None

  let handleArg expectedArgs parsedArgs k v =
    match Set.contains k expectedArgs with
    | true -> Map.add k v parsedArgs
    | false ->
      printfn "Option '%s' not recognized." k
      parsedArgs

  let sharesElement set1 =
    Set.intersect set1 >> Set.isEmpty >> not

  /// Helper function that recursively parses the arguments
  let rec parseCommandLineRec args expectedArgs parsedArgs =
    match args with
    | GetArgVal(k,v) :: xs ->
      handleArg expectedArgs parsedArgs k v
      |> parseCommandLineRec xs expectedArgs
    | [] -> parsedArgs
    | x :: xs  -> failwithf "Did not understand argument '%s'." x


  let parseConfigArgs expectedArgs parsedArgs =
    ConfigurationManager.AppSettings.AllKeys
    |> Array.fold (fun args k -> 
      handleArg expectedArgs args k ConfigurationManager.AppSettings.[k]
    ) parsedArgs

  /// Parses the given arguments against the expected arguments.
  let parseArgs argv expectedArgs =
    let argSet = expectedArgs |> List.map (fun a -> a.command.ToLower()) |> Set.ofList 

    let metaArgs, appArgs = argv |> Array.partition (fun a -> Args.useConfigArgs.Contains a)
    let metaArgs = metaArgs |> Set.ofArray
    let appArgs = appArgs |> List.ofArray

    let parsedArgs = 
      Map.empty
      |> if List.isEmpty appArgs || sharesElement metaArgs Args.useConfigArgs
         then parseConfigArgs argSet else id
      |> parseCommandLineRec appArgs argSet
  
    let missingArgs =
      expectedArgs
      |> List.filter (fun a -> a.required) 
      |> List.map (fun a -> (a.command, parsedArgs.ContainsKey(a.command)))
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
        printfn "%12s - %s%s"
          arg.command 
          arg.description 
          (if arg.required then " (required)" else ""))

  let showDescription () =
    printfn "[%s v.%s]" 
      (Reflection.Assembly.GetExecutingAssembly().GetName().Name) 
      System.AssemblyVersionInformation.Version
    printfn ""

  let showUsage () =
    printfn "%s" Args.usageString
    printfn ""
    printArgumentHelp Args.expectedArgs