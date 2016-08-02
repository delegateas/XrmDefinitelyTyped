(*** hide ***)
// This block of code is omitted in the generated HTML documentation. Use 
// it to define helpers that you do not want to show in the documentation.
#r "../../bin/XrmDefinitelyTyped/Microsoft.Xrm.Sdk.dll"
#r "../../bin/XrmDefinitelyTyped/XrmDefinitelyTyped.exe"

(**
Usage of XrmDefinitelyTyped 
===========================

The executable can be used from a command prompt, but also directly from code, 
if you want the generation of the declaration files to be a part of your 
workflow.

> **Note:** The executable must be able to find the assemblies it depends on.
> This can be solved by having them placed in the same folder.
> It also needs either `FSharp.Core.dll` or F# installed on the computer.

Arguments
-------------------------------

Here is the full list of arguments for configuring the tool:

| Argument          | Description   
| :-                |:-             
| url               | URL to the Organization.svc
| username          | CRM Username
| password          | CRM Password
| domain            | Domain to use for CRM
| ap                | Authentication Provider Type
| out               | Output directory for the generated files.
| solutions         | Comma-separated list of solutions names. Generates code for the entities found in these solutions.
| entities          | Comma-separated list of logical names of the entities it should generate code for. <br/> This is additive with the entities gotten via the ***solutions*** argument.

You can also view this list of arguments using the "***/help***" argument.

### Configuration file

If no arguments are given to the executable, it will check if there is an configuration file in the same folder with arguments it can use instead.

If you want to generate a dummy configuration file to use for arguments, you can use the "***/genconfig***" argument.<br />
If you want to use a mix of the arguments from the configuration file and arguments passed to the executable, 
you can specify the "***/useconfig***" argument in the command-line.


Command prompt
-------------------------------

The arguments are similar to those given to the [CrmSvcUtil][crmsvcutil] tool. 
Example usage from a command prompt:

    [lang=bash]
    XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc  
            /out:WebResources\typings\XRM /username:<username> /password:<password> /domain:<domainName>

  [crmsvcutil]: https://msdn.microsoft.com/en-us/library/gg327844.aspx


Simple Generation Example in F#
-------------------------------

It can also be run through code by referencing the executable and calling the 
`GetContext` function.
*)

open Microsoft.Xrm.Sdk.Client
open DG.XrmDefinitelyTyped

XrmDefinitelyTyped.GetContext(
  "http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc", 
  "username", "password", 
  out = @"WebResources\typings\XRM")


