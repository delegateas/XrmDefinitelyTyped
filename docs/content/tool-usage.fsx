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


Arguments
-------------------------------

Here is the full list of arguments for configuring the tool:

| Argument          | Short-hand  | Description   
| :-                | :-          |:-             
| url               |             | URL to the Organization.svc
| username          | u, usr      | Username for the CRM system.
| password          | p, pwd      | Password for the CRM system.
| domain            | d, dmn      | Domain for the user.
| ap                |             | Authentication Provider Type
| out               | o           | Output directory for the generated declaration files.
| jsLib             | jl          | Output directory for the JavaScript library files (**XrmQuery files**)
| solutions         | ss          | Comma-separated list of solutions names. Generates code for the entities found in these solutions.
| entities          | es          | Comma-separated list of logical names of the entities it should generate code for. <br/> This is additive with the entities gotten via the ***solutions*** argument.
| web               | w           | Generates declaration files for the Web API endpoint. If given a string, all the interfaces will be put in a namespace of that name. For example -web=WebNs puts all interfaces in namespace "WebNs"
| rest              | r           | Generates declaration files for the REST API endpoint. If given a string, all the interfaces will be put in a namespace of that name. For example -rest=RestNs puts all interfaces in namespace "RestNs"
| crmVersion        | cv          | Version of CRM that it should generate declaration files for.
| oneFile           | of          | Set to true if all the dynamic parts of the generated declarations should be put into a single file.
| skipForms         | sf          | Set to true to skip generation of form declaration files.
| formIntersect     | fi          | Comma-separated list of named semicolon-separated lists of form GUIDs that should be intersected. Example: <br /> <code>MyAccountIntersect: 284FF02B-BDD1-4BB0-9BCF-6CFDBDA130D4;16068A3B-D428-4430-AEF6-397CE2AEFE07, MyContactIntersect: F4B3397C-C1A5-40BE-89DD-CEA5F7064D1D;824CFA3C-3EB4-4746-BA3C-7F1DFCA114C0</code>
| useconfig         | uc          | Also applies the arguments found in the `.config` file.

You can also view this list of arguments using the "***/help***" argument.

### Special arguments

| Argument          | Short-hand  | Description   
| :-                | :-          |:-             
| genconfig         | gc          | Generates a configuration file with preset dummy values
| save              |             | Connects to CRM given the arguments, fetches the necessary metadata and saves it to a local file.
| load              |             | Loads a local file containing the necessary metadata and generates the declaration files based on it.


Configuration file
-------------------------------

If no arguments are given to the executable, it will check if there is an configuration file in the same folder with arguments it can use instead.

If you want to generate a configuration file with dummy values to use for arguments, you can use the "***/genconfig***" argument.<br />
If you want to use a mix of the arguments from the configuration file and arguments passed to the executable, 
you can use the "***/useconfig***" argument from the command-line.


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

XrmDefinitelyTyped.GenerateFromCrm(
  "http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc", 
  "username", "password", 
  outDir = @"WebResources\typings\XRM")


