namespace DG.XrmDefinitelyTyped

open System
open Utility
open GeneratorLogic

type XrmDefinitelyTyped private () =

  static member GetContext(url, username, password, ?domain, ?ap, ?out, ?tsv, ?entities, ?solutions) =
    let xrmAuth =
      { XrmAuthentication.url = Uri(url);
        username = username;
        password = password;
        domain = domain
        ap = ap
      }

    let settings =
      { XrmDefinitelyTypedSettings.out = out
        tsv = tsv
        entities = entities
        solutions = solutions
      }
    XrmDefinitelyTyped.GetContext(xrmAuth, settings)


  static member GetContext(xrmAuth, settings) =
    #if !DEBUG
    try
    #endif
      let out = settings.out |? "."
      let tsv = settings.tsv |? (Int32.MaxValue, Int32.MaxValue)

      // Pre-generation tasks
      clearOldOutputFiles out
      generateFolderStructure out

      let proxy =
        xrmAuth
        |> connectToCrm 
      
      let entities = 
        getFullEntityList settings.entities settings.solutions proxy

      // Connect to CRM and interpret the data
      let data = 
        proxy
        |> retrieveCrmData entities
        |> interpretCrmData out tsv

      // Generate the files
      data
      |>> generateResourceFiles
      |>> generateBaseFiles
      |>> generateEnumFiles
      |>> generateEntityEnumFiles
      |>> generateEntityFiles
      |>> generateIPageFiles
      |>  generateFormFiles

      printfn "\nSuccessfully generated all TypeScript declaration files."

    #if !DEBUG
    with _ as ex ->
      failwithf "\nUnable to generate TypeScript files: %s" ex.Message
    #endif

