
open System
open System.Text.RegularExpressions

open Microsoft.Xrm.Sdk.Client

open DG.XrmDefinitelyTyped
open CommandLineHelper
open GeneratorLogic

// Main executable function
let executeGetContext argv =
  let parsedArgs = parseArgs argv Args.expectedArgs

  let ap = 
    match parsedArgs.TryFind "ap" with
    | Some ap -> 
        Enum.Parse(typeof<AuthenticationProviderType>, ap) 
          :?> AuthenticationProviderType |> Some
    | None -> None

  let xrmAuth =
    { XrmAuthentication.url = Uri(parsedArgs.Item "url");
      username = parsedArgs.Item "username";
      password = parsedArgs.Item "password";
      domain = parsedArgs.TryFind "domain";
      ap = ap; }
   
  let entities = getListArg parsedArgs "entities" (fun s -> s.ToLower())
  let solutions = getListArg parsedArgs "solutions" id

  let settings =
    { XrmDefinitelyTypedSettings.out = parsedArgs.TryFind "out"
      entities = entities
      solutions = solutions
      crmVersion = None
    }

  XrmDefinitelyTyped.GetContext(xrmAuth, settings)



// Main method
[<EntryPoint>]
let main argv = 
  #if DEBUG
  executeGetContext argv
  0
  #else
  try 
    showDescription()
    if argv.Length > 0 && Args.helpArgs.Contains argv.[0] then showUsage()
    else if argv.Length > 0 && Args.genConfigArgs.Contains argv.[0] then Args.genConfig()
    else executeGetContext argv
    0
  with ex ->
    eprintfn "%s" ex.Message
    1
  #endif