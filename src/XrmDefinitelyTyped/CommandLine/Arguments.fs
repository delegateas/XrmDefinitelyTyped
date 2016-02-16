namespace DG.XrmDefinitelyTyped

open System.Configuration

type ArgInfo = { command: string; description: string; required: bool }

type Args private () =
  static member expectedArgs = [
    { command="url"
      description="Url to the Organization.svc"
      required=true }

    { command="username"
      description="CRM Username"
      required=true }

    { command="password"
      description="CRM Password"
      required=true }

    { command="domain"
      description="Domain to use for CRM"
      required=false }

    { command="ap"
      description="Authentication Provider Type"
      required=false }

    { command="out"
      description="Output directory for the generated files"
      required=false }

    { command="tsversion"
      description="Specify which version of TS should be used, i.e. \"1.0\""
      required=false }

    { command="solutions"
      description="Comma-separated list of solutions names. Generates code for the entities found in these solutions."
      required=false }

    { command="entities"
      description="Comma-separated list of logical names of the entities it should generate code for. This is additive with the entities gotten via the \"solutions\" argument."
      required=false }
    ]


  // Usage
  static member usageString = 
    @"Usage: XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc /username:<username> /password:<password>"
  

  static member genConfig () =
    let configmanager = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None)
    let config = configmanager.AppSettings.Settings
    config.Add("url", "http://INSTANCE.crm4.dynamics.com/XRMServices/2011/Organization.svc")
    config.Add("username","admin@INSTANCE.onmicrosoft.com")
    config.Add("password", "pass@word1")
    configmanager.Save(ConfigurationSaveMode.Modified)
    printfn "Generated configuration file with dummy values. Change them to fit your environment."


  static member configArgs = [ "-config"; "/config" ] |> Set.ofList
  static member helpArgs = [ "help"; "-h"; "-help"; "--help"; "/h"; "/help" ] |> Set.ofList