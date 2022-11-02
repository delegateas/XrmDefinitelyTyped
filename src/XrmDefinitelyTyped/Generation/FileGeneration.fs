﻿module DG.XrmDefinitelyTyped.FileGeneration

open System
open System.IO
open System.Reflection

open Utility
open IntermediateRepresentation

open CreateOptionSetDts
open CreateFormDts
open CreateType
open CreateLCID
open CreateView

(** Resource helpers *)
let resourcePrefix = "XrmDefinitelyTyped.Resources."
let getResourceLines (resName: string) =
  let assembly = Assembly.GetExecutingAssembly()
  let prefixedString = if resName.StartsWith(resourcePrefix) then resName else resourcePrefix + resName
  use res = assembly.GetManifestResourceStream(prefixedString)
  use sr = new StreamReader(res)
  seq {
    while not sr.EndOfStream do yield sr.ReadLine ()
  } |> List.ofSeq

let allResourceNames =
  let assembly = Assembly.GetExecutingAssembly()
  assembly.GetManifestResourceNames()

let copyResourceDirectly outDir resName filename =
  File.WriteAllLines(
    sprintf "%s/%s" outDir filename, 
    getResourceLines resName)

let stripReferenceLines : string list -> string list =
  List.skipWhile (fun l -> String.IsNullOrEmpty(l.Trim()) || l.StartsWith "/// <reference")


let filterVersionedStrings crmVersion (useDeprecated: bool) (prefix: string) (suffix: string) =
  Array.filter (fun (n: string) ->
    n.StartsWith prefix &&
    n.EndsWith suffix &&

    n.Substring(prefix.Length, n.Length - prefix.Length - suffix.Length) 
    |> parseVersionCriteria 
    ?|> matchesVersionCriteria crmVersion useDeprecated
    ?| false
  )

let getBaseExtensions crmVersion (useDeprecated: bool) prefix suffix = 
  allResourceNames
  |> filterVersionedStrings crmVersion useDeprecated prefix suffix

(** Generation functionality *)

/// Clear any previously output files
let clearOldOutputFiles out =
  printf "Clearing old files..."
  let rec emptyDir path =
    Directory.EnumerateFiles(path, "*.d.ts") 
    |> Seq.iter File.Delete

    Directory.EnumerateDirectories(path, "*")  
    |> Seq.iter (fun dir ->
      emptyDir dir
      try Directory.Delete dir
      with _ -> ()
    )

  Directory.CreateDirectory out |> ignore
  emptyDir out
  printfn "Done!"


/// Generate the required output folder structure
let generateFolderStructure out (gSettings: XdtGenerationSettings) =
  printf "Generating folder structure..."
  Directory.CreateDirectory (sprintf "%s/_internal" out) |> ignore
  if not gSettings.oneFile then 
    if gSettings.skipForms then Directory.CreateDirectory (sprintf "%s/Form" out) |> ignore
    if gSettings.restNs.IsSome then Directory.CreateDirectory (sprintf "%s/REST" out) |> ignore
    if gSettings.webNs.IsSome then Directory.CreateDirectory (sprintf "%s/Web" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal/Enum" out) |> ignore
    if gSettings.viewNs.IsSome then Directory.CreateDirectory (sprintf "%s/View" out) |> ignore
  printfn "Done!"

// Extend files with version specific additions
let versionExtendFile crmVersion gSettings outputDir (resName,fileName) preffix suffix =
  getBaseExtensions crmVersion gSettings.useDeprecated (resourcePrefix + preffix) suffix
  |> Seq.map (getResourceLines >> stripReferenceLines)
  |> (getResourceLines resName |> Seq.singleton |> Seq.append)
  |> List.concat
  |> Seq.map (fun l -> l.Replace("_XRMNS_", gSettings.xrmNs))
  |> fun lines -> 
    File.WriteAllLines(
    sprintf "%s/%s" outputDir fileName, lines
    )

let generateJSExtResourceFiles crmVersion gSettings =

  let path = gSettings.jsLib ?| "."

  // Generate extendable js files
  [ gSettings.webNs ?|> fun _ -> (("Dist.dg.xrmquery.web.js", "dg.xrmquery.web.js"), "Dist.Extensions.dg.xrmquery.web_ext_", ".js")
  ] |> List.choose id |> List.iter(fun param -> param |||> versionExtendFile crmVersion gSettings path)
 
/// Generate the declaration files stored as resources
let generateDtsResourceFiles crmVersion gSettings outputDir =

  // Generate extendable files
  [ Some (("xrm.d.ts","xrm.d.ts"), "Extensions.xrm_ext_", ".d.ts")
    gSettings.webNs ?|> fun _ -> (("Dist.dg.xrmquery.web.d.ts","dg.xrmquery.web.d.ts"), "Extensions.dg.xrmquery.web_ext_", ".d.ts")
  ] |> List.choose id |> List.iter(fun param -> param |||> versionExtendFile crmVersion gSettings outputDir)
 
  // Copy stable declaration files directly
  [ Some ("metadata.d.ts","metadata.d.ts")
    gSettings.restNs ?|> fun _ -> ("Dist.dg.xrmquery.rest.d.ts","dg.xrmquery.rest.d.ts")
  ] |> List.choose id |> List.iter (fun param -> param ||> copyResourceDirectly outputDir)

  [ "_internal.sdk.d.ts","sdk.d.ts"
  ] |> List.iter (fun param -> param ||> copyResourceDirectly (sprintf "%s/_internal" outputDir))
    

/// Copy the js files stored as resources
let copyJsLibResourceFiles (gSettings: XdtGenerationSettings) =
  if gSettings.jsLib.IsNone then ()
  else

  let path = gSettings.jsLib ?| "."
    
  if Directory.Exists path |> not then 
    Directory.CreateDirectory path |> ignore

  [ gSettings.webNs ?|> fun _ -> "Dist.dg.xrmquery.web.js","dg.xrmquery.web.js"
    gSettings.webNs ?|> fun _ -> "Dist.dg.xrmquery.web.min.js","dg.xrmquery.web.min.js"
    gSettings.webNs ?|> fun _ -> "Dist.dg.xrmquery.web.promise.min.js","dg.xrmquery.web.promise.min.js"
    gSettings.restNs ?|> fun _ -> "Dist.dg.xrmquery.rest.js","dg.xrmquery.rest.js"
    gSettings.restNs ?|> fun _ -> "Dist.dg.xrmquery.rest.min.js","dg.xrmquery.rest.min.js"
  ] |> List.choose id |> List.iter (fun param -> param ||> copyResourceDirectly path)

/// Copy the ts files stored as resources
let copyTsLibResourceFiles (gSettings: XdtGenerationSettings) =
  if gSettings.tsLib.IsNone then ()
  else

  let path = gSettings.tsLib ?| "."
    
  if Directory.Exists path |> not then 
    Directory.CreateDirectory path |> ignore

  [ gSettings.webNs ?|> fun _ -> "dg.xrmquery.web.ts","dg.xrmquery.web.ts"
    gSettings.restNs ?|> fun _ -> "dg.xrmquery.rest.ts","dg.xrmquery.rest.ts"
  ] |> List.choose id |> List.iter (fun param -> param ||> copyResourceDirectly path)


/// Generate the Enum definitions
let generateEnumDefs state =
  printf "Generating Enum definitions..."
  let defs = 
    state.entities
    |> getUniquePicklists
    |> Array.Parallel.map (fun os ->
      sprintf "%s/_internal/Enum/%s.d.ts" state.outputDir os.displayName,
      getOptionSetEnum os)

  printfn "Done!"
  defs

// Generate WebResource definitions
let generateWebResourceDefs (state: InterpretedState) =
  printf "Generating WebResources definitions..."
  let defs =
    sprintf "%s/_internal/WebResources.d.ts" state.outputDir,
    state.imageWebResourceNames
    |> getUnionType "WebResourceImage"

  printfn "Done!"
  defs

 // Generate LCID definitions
let generateLCIDDefs state =
  printf "Generating LCID definitions..."
  let defs =
    sprintf "%s/_internal/Enum/LCID.d.ts" state.outputDir,
    state.lcidData
    |> createLCIDEnum

  printfn "Done!"
  defs

// Generate View definitions
let generateViewDefs ns state =
  printf "Generating View definitions..."
  let defs =
    state.viewData
    |> Array.Parallel.map (fun (view: XrmView) ->
      sprintf "%s/View/%s/%s.d.ts" state.outputDir view.entityName view.name,
      getViewInterface ns view)
  
  printfn "Done!"
  defs

/// rest.d.ts
let generateRestDef ns state =
  let lines =
    state.entities
    |> CreateSdkRestDts.getFullRestNamespace ns

  sprintf "%s/rest.d.ts" state.outputDir, 
  lines


/// Generate blank REST entity definitions
let generateBaseRestEntityDef ns state =
  let lines = 
    state.entities
    |> CreateRestEntities.getBlankEntityInterfaces ns

  sprintf "%s/_internal/rest-entities.d.ts" state.outputDir, 
  lines

/// Generate the REST entity definitions
let generateRestEntityDefs ns state =
  printf "Generating REST entity definitions..."
  let defs = 
    state.entities
    |> Array.Parallel.map (fun e ->
      let name = e.logicalName
      let lines = CreateRestEntities.getEntityInterfaces ns e
      sprintf "%s/REST/%s.d.ts" state.outputDir name, 
      lines)

  printfn "Done!"
  defs


/// Generate blank web entity definitions
let generateBaseWebEntityDef ns state =
  let lines = 
    state.entities
    |> CreateWebEntities.getBlankInterfacesLines ns
  
  sprintf "%s/_internal/web-entities.d.ts" state.outputDir, 
  lines

/// Generate the web entity definitions
let generateWebEntityDefs ns state =
  printf "Generating Web entity definitions..."
  let defs = 
    state.entities
    |> Array.Parallel.map (fun (e) ->
      let name = e.logicalName
      let lines = CreateWebEntities.getEntityInterfaceLines ns e

      sprintf "%s/Web/%s.d.ts" state.outputDir name, 
      lines)

  printfn "Done!"
  defs

/// Generate the Form definitions
let generateFormDefs state crmVersion xdtSettings = 
  printf "Generation Form definitions..."
  let getFormType xrmForm = xrmForm.formType ?|> sprintf "/%s" ?| ""
  
  let defs = 
    state.forms
    |> Array.groupBy (fun (form : XrmForm) -> (form.entityName, getFormType form), form.name)
    |> Array.map (fun (_, forms) -> 
         forms 
         |> Array.sortBy (fun form -> form.guid)
         |> Array.mapi (fun i form -> 
                    if i = 0 then form
                    else { form with name = sprintf "%s%i" form.name i }))
    |> Array.concat
    |> Array.filter (fun (form: XrmForm) -> form.formType.IsNone || (form.formType.IsSome && form.formType.Value <> "Card" && form.formType.Value <> "InteractionCentricDashboard" && form.formType.Value <> "TaskFlowForm"))
    |> Array.Parallel.map (fun xrmForm -> 
         let path = sprintf "%s/Form/%s%s" state.outputDir xrmForm.entityName (getFormType xrmForm)
         let lines = getFormDts xrmForm crmVersion xdtSettings
         sprintf "%s/%s.d.ts" path xrmForm.name, lines)

  printfn "Done!"
  defs
