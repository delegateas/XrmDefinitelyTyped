
open System

open Microsoft.Xrm.Sdk.Client

open DG.XrmDefinitelyTyped
open Utility
open CommandLineHelper


let getXrmAuth parsedArgs = 
  let ap = 
    getArg parsedArgs "ap" (fun ap ->
      Enum.Parse(typeof<AuthenticationProviderType>, ap) 
        :?> AuthenticationProviderType)
  let method =
    getArg parsedArgs "method" (fun method ->
      match method with
      | "OAuth" -> ConnectionType.OAuth
      | "ClientSecret" -> ConnectionType.ClientSecret
      | "ConnectionString" -> ConnectionType.ConnectionString
      | _ -> ConnectionType.Proxy 
    )

  { XrmAuthentication.url = Uri(Map.find "url" parsedArgs)
    method = method
    username = Map.tryFind "username" parsedArgs
    password = Map.tryFind "password" parsedArgs
    domain = Map.tryFind "domain" parsedArgs
    clientId = Map.tryFind "mfaAppId" parsedArgs
    returnUrl = Map.tryFind "mfaReturnUrl" parsedArgs
    clientSecret = Map.tryFind "mfaClientSecret" parsedArgs
    connectionString = Map.tryFind "connectionString" parsedArgs
    ap = ap; }

let getRetrieveSettings parsedArgs =
  let entities = getListArg parsedArgs "entities" (fun s -> s.ToLower())
  let solutions = getListArg parsedArgs "solutions" id

  { XdtRetrievalSettings.entities = entities
    solutions = solutions
    skipInactiveForms = getArg parsedArgs "skipInactiveForms" parseBoolish ?| true
  }

let getGenerationSettings parsedArgs =
  let intersects typ = getListArg parsedArgs typ (fun definition -> 
    let nameSplit = definition.IndexOf(":")
    if nameSplit < 0 then failwithf "Missing name specification in %s-intersect list at: '%s'" typ definition

    let name = definition.Substring(0, nameSplit) |> Utility.sanitizeString
    let list = definition.Substring(nameSplit + 1)

    let guidInput = list.Split(';')
    let guids = 
      guidInput
      |> Array.map Guid.TryParse
      |> Array.mapi (fun idx (r,g) ->
        if r then Some g
        else printfn "Unable to parse given %s GUID: %s. Skipping it" typ guidInput.[idx]; None)
      |> Array.choose id
    name, guids)

  let labelMapping = getListArg parsedArgs "labelMappings" (fun definition -> 
    let nameSplit = definition.IndexOf(":")
    if nameSplit < 0 then failwithf "Missing name specification in label Mapping list at: '%s'" definition

    let label = definition.Substring(0, nameSplit)
    let value = definition.Substring(nameSplit + 1)

    label, value)

  let nsSanitizer ns =
    if String.IsNullOrWhiteSpace ns then String.Empty
    else sanitizeString ns

  { XdtGenerationSettings.out = Map.tryFind "out" parsedArgs 
    jsLib = Map.tryFind "jsLib" parsedArgs 
    tsLib = Map.tryFind "tsLib" parsedArgs 
    crmVersion = getArg parsedArgs "crmVersion" parseVersion
    useDeprecated = getArg parsedArgs "useDeprecated" parseBoolish ?| false
    skipForms = getArg parsedArgs "skipForms" parseBoolish ?| false
    oneFile = getArg parsedArgs "oneFile" parseBoolish ?| false
    restNs = getArg parsedArgs "rest" nsSanitizer
    webNs = getArg parsedArgs "web" nsSanitizer
    viewNs = getArg parsedArgs "views" nsSanitizer
    formIntersects = intersects "formintersect" 
    viewIntersects = intersects "viewintersect"
    labelMapping = labelMapping
    generateMappings = getArg parsedArgs "generateMappings" parseBoolish ?| false
    xrmNs = getArg parsedArgs "xrmNamespace" nsSanitizer ?| "Xrm"
  }


/// Load metadata from local file and generate
let loadGen parsedArgs =
  let filename = 
    match Map.tryFind "load" parsedArgs with
    | Some p -> p
    | None -> failwithf "No load argument found"

  XrmDefinitelyTyped.GenerateFromFile(
    getGenerationSettings parsedArgs,
    filename)

/// Save metadata to file
let dataSave parsedArgs =
  let filename = 
    match Map.tryFind "save" parsedArgs with
    | Some p -> p
    | None -> failwithf "No load argument found"

  XrmDefinitelyTyped.SaveMetadataToFile(
      getXrmAuth parsedArgs, 
      getRetrieveSettings parsedArgs,
      filename)

// Generate dts files only
let dtsGen parsedArgs =
  XrmDefinitelyTyped.GenerateDtsFiles(
    getGenerationSettings parsedArgs)

// Regular connect to CRM and generate
let connectGen parsedArgs =
  XrmDefinitelyTyped.GenerateFromCrm(
    getXrmAuth parsedArgs, 
    getRetrieveSettings parsedArgs, 
    getGenerationSettings parsedArgs)


// Main executable function
let executeWithArgs argv =
  let parsedArgs = parseArgs argv Args.argMap
  match parsedArgs |> Map.tryPick (fun k _ -> 
    Args.flagArgMap.TryFind k) with
  | Some flagArg when flagArg = Args.genConfigFlag -> 
    Args.genConfig()

  | Some flagArg when flagArg = Args.loadFlag ->
    parsedArgs |> checkArgs Args.generationArgs |> loadGen

  | Some flagArg when flagArg = Args.saveFlag ->
    parsedArgs |> checkArgs Args.connectionArgs |> dataSave

  | Some flagArg when flagArg = Args.genDtsFlag ->
    parsedArgs |> checkArgs Args.dtsGenerationArgs |> dtsGen

  | _ -> 
    parsedArgs |> checkArgs Args.fullArgList |> connectGen


// Main method
[<EntryPoint>]
let main argv = 
  #if DEBUG
  executeWithArgs (List.ofArray argv)
  0
  #else
  try 
    showDescription()
    if argv.Length > 0 && Args.helpArgs.Contains argv.[0] then showUsage()
    else if argv.Length = 0 && Args.configFileMissing() then 
      printfn "No configuration file found."
      Args.genConfig()
    else executeWithArgs (List.ofArray argv)

    0
  with ex ->
    eprintfn "%s" ex.Message
    1
  #endif