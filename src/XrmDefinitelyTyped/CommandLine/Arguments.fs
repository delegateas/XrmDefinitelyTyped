namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Configuration

type ArgInfo = 
  { command: string
    altCommands: string list
    description: string
    required: bool 
  }

type Args private () =

  static member generationArgs = [
    { command="out"
      altCommands=["o"]
      description="Output directory for the generated files."
      required=false }

    { command="jsLib"
      altCommands=["jl"]
      description="Directory where XrmQuery JavaScript files should be placed."
      required=false }

    { command="tsLib"
      altCommands=["tl"]
      description="Directory where XrmQuery TypeScript files should be placed."
      required=false }

    { command="crmVersion"
      altCommands=["cv"]
      description="Version of the targeted CRM"
      required=false }

    { command="useDeprecated"
      altCommands=["ud"]
      description="Flag to include deprecated functionality"
      required=false }

    { command="solutions"
      altCommands=["ss"]
      description="Comma-separated list of solutions names. Generates code for the entities found in these solutions."
      required=false }

    { command="entities"
      altCommands=["es"]
      description="Comma-separated list of logical names of the entities it should generate code for. This is additive with the entities gotten via the \"solutions\" argument."
      required=false }

    { command="skipForms"
      altCommands=["sf"]
      description="Set to true if form interfaces should not be generated"
      required=false }

    { command="oneFile"
      altCommands=["of"]
      description="Set to true if all the dynamic parts of the generated declarations should be put into a single file."
      required=false }

    { command="rest"
      altCommands=["r"]
      description="Flag to generate REST API entities. Setting it to a value sets up a namespace for them."
      required=false }

    { command="web"
      altCommands=["w"]
      description="Flag to generate Web API entities. Setting it to a value sets up a namespace for them."
      required=false }

    { command="formintersect"
      altCommands=["fi"]
      description="Comma-separated list of named semicolon-separated lists of form GUIDs that should be intersected. "
       + "Example: 'MyAccountIntersect: 284FF02B-BDD1-4BB0-9BCF-6CFDBDA130D4;16068A3B-D428-4430-AEF6-397CE2AEFE07, MyContactIntersect: F4B3397C-C1A5-40BE-89DD-CEA5F7064D1D;824CFA3C-3EB4-4746-BA3C-7F1DFCA114C0'"
      required=false }
  ]

  static member connectionArgs = [
    { command="url"
      altCommands=[]
      description="Url to the Organization.svc"
      required=true }

    { command="username"
      altCommands=["u"; "usr"]
      description="CRM Username"
      required=true }

    { command="password"
      altCommands=["p"; "pwd"]
      description="CRM Password"
      required=true }

    { command="domain"
      altCommands=["d"; "dmn"]
      description="Domain to use for CRM"
      required=false }

    { command="ap"
      altCommands=[]
      description="Authentication Provider Type"
      required=false }
  ]


  (** Special arguments, which make the program act differently than normal *)
  static member saveFlag = 
    { command="save"
      altCommands=[]
      description="Flag to indicate to retrieve the metadata and store it in a file."
      required=false }

  static member loadFlag = 
    { command="load"
      altCommands=[]
      description="Flag to indicate to load the metadata from a local file instead of contacting CRM."
      required=false }

  static member genConfigFlag = 
    { command="genconfig"
      altCommands=["gc"]
      description="Flag to indicate that a dummy configuration file should be generated."
      required=false }

  static member flagArgs = [
    Args.saveFlag
    Args.loadFlag
    Args.genConfigFlag
  ] 

  static member useConfig = 
    { command="useconfig"
      altCommands=["uc"]
      description="Flag to indicate that it should use the given configuration along with command-line arguments."
      required=false }



  static member useConfigSet = Args.useConfig.command :: Args.useConfig.altCommands |> Set.ofList

  static member makeArgMap argList = 
    argList
    |> Seq.fold (fun acc argInfo -> 
        argInfo.command :: argInfo.altCommands 
        |> List.fold (fun innerAcc arg -> 
          (arg.ToLower(), argInfo) :: innerAcc) acc) 
      []
    |> Map.ofSeq

  static member flagArgMap = Args.makeArgMap Args.flagArgs

  static member fullArgList = List.concat [ Args.connectionArgs; Args.generationArgs; Args.flagArgs; [Args.useConfig] ]
  static member argMap = Args.makeArgMap Args.fullArgList

  // Usage
  static member usageString = 
    @"Usage: XrmDefinitelyTyped.exe /url:http://<serverName>/<organizationName>/XRMServices/2011/Organization.svc /u:<username> /p:<password>"
  
  static member helpArgs = [ "?"; "help"; "-h"; "-help"; "--help"; "/h"; "/help" ] |> Set.ofList

  static member configFileMissing () =
    File.Exists(AppDomain.CurrentDomain.SetupInformation.ConfigurationFile) |> not

  static member genConfig () =
    let configmanager = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None)
    let config = configmanager.AppSettings.Settings
    config.AllKeys |> Array.iter config.Remove
    config.Add("url", "https://INSTANCE.crm4.dynamics.com/XRMServices/2011/Organization.svc")
    config.Add("username","admin@INSTANCE.onmicrosoft.com")
    config.Add("password", "pass@word1")
    config.Add("out", "../typings/XRM")
    config.Add("solutions", "")
    config.Add("entities", "account, contact")
    config.Add("web", "")
    config.Add("jsLib", "../src/lib")
    configmanager.Save(ConfigurationSaveMode.Modified)
    printfn "A configuration file has been set up with dummy values. Change them to fit your environment."

