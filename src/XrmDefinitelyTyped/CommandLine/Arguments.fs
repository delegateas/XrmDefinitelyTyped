namespace DG.XrmDefinitelyTyped

open DG.XrmDefinitelyTyped

type ArgInfo = { command: string; description: string; required: bool }

type Args private () =
  static member expectedArgs = [
    { command="url";        required=true;  description="Url to the Organization.svc" }
    { command="username";   required=true;  description="CRM Username" }
    { command="password";   required=true;  description="CRM Password" }
    { command="domain";     required=false; description="Domain to use for CRM" }
    { command="ap";         required=false; description="Authentication Provider Type" }
    { command="out";        required=false; description="Output directory for the generated files" }
    { command="tsversion";  required=false; description="Specify which version of TS should be used, i.e. \"1.0\"" }
    ]

  // Usage
  static member usageString = 
    @"Usage: XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc /username:<username> /password:<password>"
  

  static member helpArgs = [ "help"; "-h"; "-help"; "--help"; "/h"; "/help" ] |> Set.ofList