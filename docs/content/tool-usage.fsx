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


