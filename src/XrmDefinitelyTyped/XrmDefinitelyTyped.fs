namespace DG.XrmDefinitelyTyped

open System
open Utility
open GeneratorLogic

type XrmDefinitelyTyped private () =

  static member GetContext(url, username, password, ?domain, ?ap, ?out, ?tsv) =
    let xrmAuth =
      { XrmAuthentication.url = Uri(url);
        username = username;
        password = password;
        domain = domain
        ap = ap
      }
    XrmDefinitelyTyped.GetContext(xrmAuth, out, tsv)


  static member GetContext(xrmAuth, out, tsv) =
    #if !DEBUG
    try
    #endif
      let out = out |? "."
      let tsv = tsv |? (Int32.MaxValue, Int32.MaxValue)

      // Pre-generation tasks
      clearOldOutputFiles out
      generateFolderStructure out

      // Connect to CRM and interpret the data
      let data = 
        xrmAuth
        |> connectToCrm 
        |> retrieveCrmData
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

