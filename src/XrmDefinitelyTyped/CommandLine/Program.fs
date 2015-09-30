
open System
open System.Text.RegularExpressions

open Microsoft.Xrm.Sdk.Client

open DG.XrmDefinitelyTyped
open CommandLineHelper
open GeneratorLogic

// Arguments
let expectedArgs = [
  { command="url";        required=true;  description="Url to the Organization.svc" }
  { command="username";   required=true;  description="CRM Username" }
  { command="password";   required=true;  description="CRM Password" }
  { command="domain";     required=false; description="Domain to use for CRM" }
  { command="ap";         required=false; description="Authentication Provider Type" }
  { command="out";        required=false; description="Output directory for the generated files" }
  { command="tsversion";  required=false; description="Specify which version of TS should be used, i.e. \"1.0\"" }
  ]

// Usage
let showUsage () = 
  printfn @"Usage: XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc /username:<username> /password:<password>"
  printfn ""
  printArgumentHelp expectedArgs


// Main executable function
let executeGetContext argv =
  let parsedArgs = parseArgs argv expectedArgs

  let ap = 
    match parsedArgs.TryFind "ap" with
    | Some ap -> 
        Enum.Parse(typeof<AuthenticationProviderType>, ap) :?> AuthenticationProviderType |> Some
    | None -> None

  let xrmAuth =
    { XrmAuthentication.url = Uri(parsedArgs.Item "url");
      username = parsedArgs.Item "username";
      password = parsedArgs.Item "password";
      domain = parsedArgs.TryFind "domain";
      ap = ap; }

  let tsv = 
    match parsedArgs.TryFind "tsversion" with
    | None -> None
    | Some tsv -> 
      Regex.Match(tsv, "^(\d+)(\.(\d+))?$") |> fun m ->
        match m.Success with
        | false -> None
        | true -> 
          match m.Groups.[3].Success with
          | true -> Some (Int32.Parse m.Groups.[1].Value, Int32.Parse m.Groups.[3].Value) 
          | false -> Some (Int32.Parse m.Groups.[1].Value, 0) 
    
  XrmDefinitelyTyped.GetContext(xrmAuth, parsedArgs.TryFind "out", tsv)


// Main method
[<EntryPoint>]
let main argv = 
  #if DEBUG
  executeGetContext argv
  0
  #else
  if argv.Length = 0 then // Given no args, show usage
    showUsage()
  else
    try 
      executeGetContext argv
    with ex ->
      eprintfn "%s" ex.Message
  0
  #endif