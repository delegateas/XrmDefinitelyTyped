module DG.XrmDefinitelyTyped.GenerationMain

open System
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
  let crmVersion =
    gSettings.crmVersion ?| (Int32.MaxValue, Int32.MaxValue, Int32.MaxValue, Int32.MaxValue)

  // Pre-generation tasks 
  clearOldOutputFiles out
  generateFolderStructure out gSettings
  copyJsLibResourceFiles gSettings
  copyTsLibResourceFiles gSettings

  // Generate the files
  let data =
    interpretCrmData out formIntersects rawState 
    |>> generateDtsResourceFiles crmVersion gSettings 
    |>> generateEnumFiles 
    |>> generateEntityEnumFiles 

  match gSettings.skipForms with
  | false -> generateFormFiles data
  | true  -> ()

  match gSettings.webNs with
  | Some ns -> 
    generateBaseWebEntityFile ns data
    generateWebEntityFiles ns data
  | None -> ()

  match gSettings.restNs with
  | Some ns -> 
    generateRestFile ns data
    generateBaseRestEntityFile ns data
    generateRestEntityFiles ns data
  | None -> ()