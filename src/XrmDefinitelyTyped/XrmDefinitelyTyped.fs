namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Runtime.Serialization.Json

open Utility
open GenerationMain

type XrmDefinitelyTyped private () = 

  static member GenerateFromCrm(url, username, password, ?domain, ?ap, ?mfaAppId, ?mfaReturnUrl, ?outDir, ?jsLib, ?tsLib, ?entities, ?solutions, ?crmVersion, ?useDeprecated, ?skipForms, ?oneFile, ?restNs, ?webNs, ?viewNs, ?formIntersects, ?viewintersects, ?labelMapping, ?generateMapping, ?skipInactiveForms) = 
    let xrmAuth = 
      { XrmAuthentication.url = Uri(url)
        username = username
        password = password
        domain = domain
        ap = ap 
        mfaAppId = mfaAppId
        mfaReturnUrl = mfaReturnUrl }
    
    let rSettings = 
      { XdtRetrievalSettings.entities = entities
        solutions = solutions
        skipInactiveForms = skipInactiveForms ?| true
      }

    let gSettings = 
      { XdtGenerationSettings.out = outDir
        jsLib = jsLib
        tsLib = tsLib
        crmVersion = crmVersion
        useDeprecated = useDeprecated ?| false
        skipForms = skipForms ?| false
        oneFile = oneFile ?| false
        restNs = restNs
        webNs = webNs
        viewNs = viewNs
        formIntersects = formIntersects
        viewIntersects = viewintersects
        labelMapping = labelMapping
        generateMappings = generateMapping ?| false
       }
    
    XrmDefinitelyTyped.GenerateFromCrm(xrmAuth, rSettings, gSettings)
  


  static member GenerateFromCrm(xrmAuth, rSettings, gSettings) =
    #if !DEBUG 
    try
    #endif 
      
      retrieveRawState xrmAuth rSettings
      |> generateFromRaw gSettings
      printfn "\nSuccessfully generated all TypeScript declaration files."

    #if !DEBUG
    with ex -> getFirstExceptionMessage ex |> failwithf "\nUnable to generate TypeScript files: %s"
    #endif



  static member SaveMetadataToFile(xrmAuth, rSettings, ?filePath) =
    #if !DEBUG 
    try
    #endif 
      
      let filePath = 
        filePath 
        ?>>? (String.IsNullOrWhiteSpace >> not)
        ?| "XdtData.json"

      let serializer = DataContractJsonSerializer(typeof<RawState>, null, System.Int32.MaxValue, true, null, false)
      use stream = new FileStream(filePath, FileMode.Create)

      retrieveRawState xrmAuth rSettings
      |> fun state -> serializer.WriteObject(stream, state)
      printfn "\nSuccessfully saved retrieved data to file."

    #if !DEBUG
    with ex -> getFirstExceptionMessage ex |> failwithf "\nUnable to generate data file: %s"
    #endif



  static member GenerateFromRawState(rawState, gSettings) =
    #if !DEBUG 
    try
    #endif 

      generateFromRaw gSettings rawState
      printfn "\nSuccessfully generated all TypeScript declaration files."

    #if !DEBUG
    with ex -> getFirstExceptionMessage ex |> failwithf "\nUnable to generate TypeScript files: %s"
    #endif


  static member GenerateFromFile(gSettings, ?filePath) =
    #if !DEBUG 
    try
    #endif 
      let filePath = 
        filePath 
        ?>>? (String.IsNullOrWhiteSpace >> not)
        ?| "XdtData.json"

      let rawState =
        try
          let serializer = DataContractJsonSerializer(typeof<RawState>)
          use stream = new FileStream(filePath, FileMode.Open)
          serializer.ReadObject(stream) :?> RawState
        with ex -> failwithf "\nUnable to parse data file"
    
      generateFromRaw gSettings rawState
      printfn "\nSuccessfully generated all TypeScript declaration files."

    #if !DEBUG
    with ex -> getFirstExceptionMessage ex |> failwithf "\nUnable to generate TypeScript files: %s"
    #endif
