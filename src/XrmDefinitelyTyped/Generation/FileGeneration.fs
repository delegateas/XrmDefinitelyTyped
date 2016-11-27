namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Reflection

open Utility
open IntermediateRepresentation

open CreateOptionSetDts
open CreateFormDts

module FileGeneration =

  (** Reference helpers *)

  let makeRef = sprintf "/// <reference path=\"%s.d.ts\" />"
  let makeRefSub n = sprintf "/// <reference path=\"%s%s.d.ts\" />" (String.replicate n "../")

  let xrmRef n = makeRefSub n "xrm"
  let sdkRef n = makeRefSub n "_internal/sdk"

  let restRef n = makeRefSub n "dg.xrmquery.rest"
  let webEntityRef n = makeRefSub n "_internal/web-entities"
  let restEntityRef n = makeRefSub n "_internal/rest-entities"

  let entityEnumRef n name = makeRefSub n (sprintf "_internal/EntityEnum/%s" name)
  let enumRef n name = makeRefSub n (sprintf "_internal/Enum/%s" name)
  let enumsToRefs enums = enums |> List.map (sprintf "../Enum/%s" >> makeRef)


  (** Resource helpers *)
  let getResourceLines resName =
    let assembly = Assembly.GetExecutingAssembly()
    use res = assembly.GetManifestResourceStream(resName)
    use sr = new StreamReader(res)
    seq {
      while not sr.EndOfStream do yield sr.ReadLine ()
    } |> List.ofSeq

  let allResourceNames =
    let assembly = Assembly.GetExecutingAssembly()
    assembly.GetManifestResourceNames()

  let copyResourceDirectly outDir resName =
    File.WriteAllLines(
      sprintf "%s/%s" outDir resName, 
      getResourceLines resName)

  let stripReferenceLines : string list -> string list =
    List.skipWhile (fun l -> String.IsNullOrEmpty(l.Trim()) || l.StartsWith "/// <reference")


  let filterVersionedStrings crmVersion (prefix: string) (suffix: string) =
    Array.filter (fun (n: string) ->
      n.StartsWith prefix &&
      n.EndsWith suffix &&

      n.Substring(prefix.Length, n.Length - prefix.Length - suffix.Length) 
      |> parseVersionCriteria 
      ?|> matchesVersionCriteria crmVersion 
      ?| false
    )

  let getBaseExtensions crmVersion = 
    let prefix = "xrm_ext_"
    let suffix = ".d.ts"

    allResourceNames
    |> filterVersionedStrings crmVersion prefix suffix


  (** Generation functionality *)

  /// Clear any previously output files
  let clearOldOutputFiles out =
    printf "Clearing old files..."
    let rec emptyDir path =
      Directory.EnumerateFiles(path, "*.d.ts") |> Seq.iter File.Delete
      let dirs = Directory.EnumerateDirectories(path, "*") 
      dirs |> Seq.iter (fun dir ->
        emptyDir dir
        try Directory.Delete dir
        with ex -> ())

    Directory.CreateDirectory out |> ignore
    emptyDir out
    printfn "Done!"


  /// Generate the required output folder structure
  let generateFolderStructure out (gSettings: XdtGenerationSettings) =
    printf "Generating folder structure..."
    if gSettings.skipForms then Directory.CreateDirectory (sprintf "%s/Form" out) |> ignore
    if gSettings.restNs.IsSome then Directory.CreateDirectory (sprintf "%s/REST" out) |> ignore
    if gSettings.webNs.IsSome then Directory.CreateDirectory (sprintf "%s/Web" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal/Enum" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal/EntityEnum" out) |> ignore
    printfn "Done!"


  /// Generate the declaration files stored as resources
  let generateDtsResourceFiles crmVersion state =
    // Extend xrm.d.ts with version specific additions
    getBaseExtensions crmVersion
    |> Seq.map (getResourceLines >> stripReferenceLines)
    |> (getResourceLines "xrm.d.ts" |> Seq.singleton |> Seq.append)
    |> List.concat
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/xrm.d.ts" state.outputDir, lines)
 
    // Copy stable declaration files directly
    [ "metadata.d.ts"
      "dg.xrmquery.web.d.ts"
      "dg.xrmquery.rest.d.ts"
    ] |> List.iter (copyResourceDirectly state.outputDir)

    [ "sdk.d.ts"
    ] |> List.iter (copyResourceDirectly (sprintf "%s/_internal" state.outputDir))
    

  /// Copy the js files stored as resources
  let copyJsLibResourceFiles (gSettings: XdtGenerationSettings) =
    if gSettings.jsLib.IsNone then ()
    let path = gSettings.jsLib ?| "."
    
    if Directory.Exists path |> not then 
      Directory.CreateDirectory path |> ignore

    [ gSettings.webNs ?|> fun _ -> "dg.xrmquery.web.js"
      gSettings.webNs ?|> fun _ -> "dg.xrmquery.web.min.js"
      gSettings.restNs ?|> fun _ -> "dg.xrmquery.rest.js"
      gSettings.restNs ?|> fun _ -> "dg.xrmquery.rest.min.js"
    ] |> List.choose id |> List.iter (copyResourceDirectly path)

  /// Copy the ts files stored as resources
  let copyTsLibResourceFiles (gSettings: XdtGenerationSettings) =
    if gSettings.tsLib.IsNone then ()
    let path = gSettings.tsLib ?| "."
    
    if Directory.Exists path |> not then 
      Directory.CreateDirectory path |> ignore

    [ gSettings.webNs ?|> fun _ -> "dg.xrmquery.web.ts"
      gSettings.restNs ?|> fun _ -> "dg.xrmquery.rest.ts"
    ] |> List.choose id |> List.iter (copyResourceDirectly path)


  /// Generate the Enum files
  let generateEnumFiles state =
    printf "Writing Enum files..."
    state.entities
    |> getUniquePicklists
    |> Array.Parallel.iter (fun os ->
      File.WriteAllLines(
        sprintf "%s/_internal/Enum/%s.d.ts" state.outputDir os.displayName,
        getOptionSetEnum os))
    printfn "Done!"


  /// Generate the EntityEnum files
  let generateEntityEnumFiles state =
    printf "Writing EntityEnum files..."
    state.entities
    |> Array.Parallel.map (fun em -> 
      em.logicalName, 
      em.opt_sets |> List.map (fun os -> os.displayName))

    |> Array.Parallel.iter (fun (name, enums) ->
      File.WriteAllLines(
        sprintf "%s/_internal/EntityEnum/%s.d.ts" state.outputDir name, 
        enumsToRefs enums))
    printfn "Done!"

  /// rest.d.ts
  let generateRestFile ns state =
    state.entities
    |> CreateSdkRestDts.getFullRestNamespace ns
    |> fun lines ->  
      File.WriteAllLines(
        sprintf "%s/rest.d.ts" state.outputDir, 
        restEntityRef 0 :: lines)


  /// Generate blank REST entity files
  let generateBaseRestEntityFile ns state =
    state.entities
    |> CreateRestEntities.getBlankEntityInterfaces ns
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/_internal/rest-entities.d.ts" state.outputDir, 
        lines)

  /// Generate the REST entity files
  let generateRestEntityFiles ns state =
    printf "Writing REST entity files..."
    state.entities
    |> Array.Parallel.map (fun e -> e.logicalName, CreateRestEntities.getEntityInterfaces ns e)
    |> Array.Parallel.iter (fun (name, lines) ->
      File.WriteAllLines(sprintf "%s/REST/%s.d.ts" state.outputDir name, 
        sdkRef 1 :: restRef 1 :: restEntityRef 1 :: entityEnumRef 1 name :: lines))
    printfn "Done!"


  /// Generate blank web entity files
  let generateBaseWebEntityFile ns state =
    state.entities
    |> CreateWebEntities.getBlankInterfacesLines ns
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/_internal/web-entities.d.ts" state.outputDir, 
        lines)

  /// Generate the web entity files
  let generateWebEntityFiles ns state =
    printf "Writing Web entity files..."
    state.entities
    |> Array.Parallel.map (fun e -> e.logicalName, CreateWebEntities.getEntityInterfaceLines ns e)
    |> Array.Parallel.iter (fun (name, lines) ->
      File.WriteAllLines(sprintf "%s/Web/%s.d.ts" state.outputDir name, 
        webEntityRef 1 :: entityEnumRef 1 name :: lines))
    printfn "Done!"

  /// Generate the Form files
  let generateFormFiles state =
    printf "Writing Form files..."
    state.forms
    |> Array.Parallel.iter (fun xrmForm ->
      let path = sprintf "%s/Form/%s%s" state.outputDir xrmForm.entityName (xrmForm.formType ?|> sprintf "/%s" ?| "")
      Directory.CreateDirectory path |> ignore
      
      let depth = if xrmForm.formType.IsSome then 3 else 2

      let enumRefs = 
        xrmForm.entityDependencies 
        |> Seq.map (entityEnumRef depth)
        |> List.ofSeq

      // TODO: check for forms with same name
      let lines = xrmForm |> getFormDts
      File.WriteAllLines(sprintf "%s/%s.d.ts" path xrmForm.name, 
        xrmRef depth :: (List.append enumRefs lines))
    )
    printfn "Done!"
