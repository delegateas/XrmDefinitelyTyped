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
    { command="solutions";  required=false; description="Comma-separated list of solutions names. Generates code for the entities found in these solutions." }
    { command="entities";   required=false; 
      description=  "Comma-separated list of logical names of the entities it should generate code for. This is additive with the entities gotten via the \"solutions\" argument." }
    ]

  // Usage
  static member usageString = 
    @"Usage: XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc /username:<username> /password:<password>"
  

  static member helpArgs = [ "help"; "-h"; "-help"; "--help"; "/h"; "/help" ] |> Set.ofList