namespace DG.XrmDefinitelyTyped

open System
open Utility
open GeneratorLogic

type XrmDefinitelyTyped private () =

  static member GetContext(url, username, password, ?domain, ?ap, ?out, ?entities, ?solutions, ?formIntersects) =
    let xrmAuth =
      { XrmAuthentication.url = Uri(url);
        username = username;
        password = password;
        domain = domain
        ap = ap
      }

    let settings =
      { XrmDefinitelyTypedSettings.out = out
        entities = entities
        solutions = solutions
        crmVersion = None
        formIntersects = formIntersects
      }
    XrmDefinitelyTyped.GetContext(xrmAuth, settings)


  static member GetContext(xrmAuth, settings) =
    #if !DEBUG
    try
    #endif
      let out = settings.out ?| "."

      // Pre-generation tasks
      clearOldOutputFiles out
      generateFolderStructure out

      let mainProxy = connectToCrm xrmAuth
      let proxyGetter = proxyHelper xrmAuth

      let crmVersion =
        settings.crmVersion ?| retrieveCrmVersion mainProxy

      let entities = 
        getFullEntityList settings.entities settings.solutions mainProxy

      let formIntersects = 
        settings.formIntersects ?| [||]

      // Connect to CRM and interpret the data
      let data = 
        (mainProxy, proxyGetter)
        ||> retrieveCrmData crmVersion entities
        |> interpretCrmData out formIntersects

      // Generate the files
      data
      |>> generateResourceFiles crmVersion
      |>> generateEntityBaseFiles
      |>> generateEnumFiles
      |>> generateEntityEnumFiles
      |>> generateEntityFiles
      |>> generateIPageFiles
      |>  generateFormFiles

      printfn "\nSuccessfully generated all TypeScript declaration files."

    #if !DEBUG
    with _ as ex ->
      getFirstExceptionMessage ex |> failwithf "\nUnable to generate TypeScript files: %s"
    #endif

