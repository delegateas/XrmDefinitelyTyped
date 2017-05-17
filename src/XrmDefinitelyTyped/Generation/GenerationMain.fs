module DG.XrmDefinitelyTyped.GenerationMain

open System.IO
open Utility

open CrmBaseHelper
open DataRetrieval
open Setup
open FileGeneration


/// Retrieve data from CRM and setup raw state
let retrieveRawState xrmAuth rSettings =
  let mainProxy = connectToCrm xrmAuth

  let proxyGetter = proxyHelper xrmAuth
  let crmVersion = retrieveCrmVersion mainProxy
  let entities = 
    getFullEntityList rSettings.entities rSettings.solutions mainProxy
      
  // Retrieve data from CRM
  retrieveCrmData crmVersion entities mainProxy proxyGetter


/// Main generator function
let generateFromRaw gSettings rawState =
  let out = gSettings.out ?| "."
  let formIntersects = gSettings.formIntersects ?| [||]
  let crmVersion = gSettings.crmVersion ?| rawState.crmVersion

  // Pre-generation tasks 
  clearOldOutputFiles out
  generateFolderStructure out gSettings

  // Interpret data and generate resource files
  let data =
    interpretCrmData out formIntersects rawState 

  let defs = 
    seq {
      yield! generateEnumDefs data
      if not gSettings.skipForms then yield! generateFormDefs data

      match gSettings.webNs with
      | Some ns -> 
        yield generateBaseWebEntityDef ns data
        yield! generateWebEntityDefs ns data
      | None -> ()

      match gSettings.restNs with
      | Some ns -> 
        yield generateRestDef ns data
        yield generateBaseRestEntityDef ns data
        yield! generateRestEntityDefs ns data
      | None -> ()
    }
    |> Array.ofSeq
  
  printf "Writing to files..."
  copyJsLibResourceFiles gSettings
  copyTsLibResourceFiles gSettings
  generateDtsResourceFiles crmVersion gSettings data

  match gSettings.oneFile with
  | false -> 
    defs 
    |> Array.Parallel.iter (fun (path, lines) -> 
      Directory.CreateDirectory path |> ignore
      File.WriteAllLines(path, lines)
    )
  | true  -> 
    let singleFilePath = Path.Combine(out, "context.d.ts")
    defs |> Array.Parallel.map snd |> List.concat |> fun lines -> File.WriteAllLines(singleFilePath, lines)
  printfn "Done!"
