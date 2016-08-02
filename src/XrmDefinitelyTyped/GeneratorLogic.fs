namespace DG.XrmDefinitelyTyped

open System
open System.IO
open System.Reflection

open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Metadata
open Microsoft.Xrm.Sdk.Client

open IntermediateRepresentation
open Utility

open InterpretEntityMetadata
open InterpretBpfJson
open InterpretFormXml
  
open CreateEntityDts
open CreateEntityRestDts
open CreateOptionSetDts
open CreateIPageDts
open CreateFormDts

module GeneratorLogic =

  type XrmAuthentication = {
    url: Uri
    username: string
    password: string
    domain: string option
    ap: AuthenticationProviderType option
  }

  type RawState = {
    metadata: EntityMetadata[]
    bpfData: Entity[]
    formData: Map<string,Entity[]>
  }

  type InterpretedState = {
    outputDir: string
    entities: XrmEntity[]
    forms: XrmForm[]
    bpfControls: Map<string,ControlField list>
  }


  (** Reference helpers *)

  let makeRef = sprintf "/// <reference path=\"%s.d.ts\" />"
  let makeRefSub n = sprintf "/// <reference path=\"%s%s.d.ts\" />" (String.replicate n "../")
  let baseRef n = makeRefSub n "base"
  let entityRef n = makeRefSub n "_internal/entities"
  let entityEnumRef n name = makeRefSub n (sprintf "_internal/EntityEnum/%s" name)
  let enumRef n name = makeRefSub n (sprintf "_internal/Enum/%s" name)
  let enumsToRefs enums = enums |> List.map (fun enum -> sprintf "../Enum/%s" enum |> makeRef)


  (** Resource helpers *)

  let getResourceLines resName =
    let assembly = Assembly.GetExecutingAssembly()
    use res = assembly.GetManifestResourceStream(resName)
    use sr = new StreamReader(res)

    seq {
      while not sr.EndOfStream do yield sr.ReadLine ()
    } |> List.ofSeq


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
  let generateFolderStructure out =
    printf "Generating folder structure..."
    Directory.CreateDirectory (sprintf "%s/IPage" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/Entity" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/Form" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal/Enum" out) |> ignore
    Directory.CreateDirectory (sprintf "%s/_internal/EntityEnum" out) |> ignore
    printfn "Done!"

  // Proxy helper that makes it easy to get a new proxy instance
  let proxyHelper xrmAuth () =
    let ap = xrmAuth.ap |? AuthenticationProviderType.OnlineFederation
    let domain = xrmAuth.domain |? ""
    CrmAuth.authenticate
      xrmAuth.url ap xrmAuth.username 
      xrmAuth.password domain
    ||> CrmAuth.proxyInstance


  /// Connect to CRM with the given authentication
  let connectToCrm xrmAuth =
    printf "Connecting to CRM..."
    let proxy = proxyHelper xrmAuth ()
    printfn "Done!"
    proxy


  // Retrieve CRM entity metadata
  let retrieveEntityMetadata entities mainProxy proxyGetter =
    printf "Fetching entity metadata from CRM..."

    let rawEntityMetadata = 
      match entities with
      | None -> CrmBaseHelper.getAllEntityMetadata mainProxy
      | Some logicalNames -> 
        CrmBaseHelper.getSpecificEntitiesAndDependentMetadata proxyGetter logicalNames

    printfn "Done!"
    rawEntityMetadata

  /// Retrieve version from CRM
  let retrieveCrmVersion mainProxy =
    printf "Retrieving CRM version..."

    let version = 
      CrmBaseHelper.retrieveVersion mainProxy

    printfn "Done!"
    version

  /// Retrieve all the necessary CRM data
  let retrieveCrmData sdkVersion entities mainProxy proxyGetter =
    let rawEntityMetadata = 
      retrieveEntityMetadata entities mainProxy proxyGetter
    
    printf "Fetching BPF metadata from CRM..."
    let bpfData = 
      match checkVersion (6,0,0,0) sdkVersion with
      | true  -> CrmDataHelper.getBpfData mainProxy
      | false -> [||]
    printfn "Done!"

    printf "Fetching FormXmls from CRM..."
    let formData =
      rawEntityMetadata
      |> Array.Parallel.map (fun em -> 
        let proxy = proxyGetter()
        em.LogicalName, 
        CrmDataHelper.getEntityForms proxy em.LogicalName)
      |> Map.ofArray
    printfn "Done!"

    { RawState.metadata = rawEntityMetadata
      bpfData = bpfData
      formData = formData }


  /// Gets all the entities related to the given solutions and merges with the given entities
  let getFullEntityList entities solutions proxy =
    printf "Figuring out which entities should be included in the context.."
    let solutionEntities = 
      match solutions with
      | Some sols -> 
        sols 
        |> Array.map (CrmBaseHelper.retrieveSolutionEntities proxy)
        |> Seq.concat
        |> Set.ofSeq
      | None -> Set.empty

    let allEntities =
      match entities with
      | Some ents -> Set.union solutionEntities (Set.ofArray ents)
      | None -> solutionEntities

    printfn "Done!"
    match allEntities.Count with
    | 0 -> 
      printfn "Creating context for all entities"
      None
    | _ -> 
      let entities = allEntities |> Set.toArray 
      printfn "Creating context for the following entities: %s" (String.Join(",", entities))
      entities
      |> Some

  /// Interprets the raw CRM data into an intermediate state used for further generation
  let interpretCrmData out (rawState:RawState) =
    printf "Interpreting data..."
    let nameMap = 
      rawState.metadata
      |> Array.Parallel.map (fun em -> em.LogicalName, em.SchemaName)
      |> Map.ofArray

    let entityNames = 
       rawState.metadata
       |> Array.Parallel.map (fun em -> em.SchemaName)
       |> Set.ofArray

    let entityMetadata =
      rawState.metadata |> Array.Parallel.map (interpretEntity entityNames nameMap)

    let bpfControls = interpretBpfs rawState.bpfData

    let forms = interpretFormXmls entityMetadata rawState.formData bpfControls
    printfn "Done!"

    { InterpretedState.entities = entityMetadata
      bpfControls = bpfControls
      forms = forms
      outputDir = out 
    }


  /// Generate the files stored as resources
  let generateResourceFiles state =
    getResourceLines "base.d.ts"
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/base.d.ts" state.outputDir, makeRef "_internal/entities" :: lines)

    getResourceLines "metadata.d.ts"
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/metadata.d.ts" state.outputDir, lines)
      
    getResourceLines "dg.xrmquery.d.ts"
    |> fun lines -> 
      File.WriteAllLines(sprintf "%s/dg.xrmquery.d.ts" state.outputDir, lines)


  /// Generate a few base files
  let generateBaseFiles state =
    // Blank entity interfaces
    state.entities
    |> getBlankEntityInterfaces
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/_internal/entities.d.ts" state.outputDir, 
        lines)

    // REST file
    state.entities
    |> getFullRestModule
    |> fun lines ->  
      File.WriteAllLines(
        sprintf "%s/rest.d.ts" state.outputDir, 
        makeRef "_internal/entities" :: lines)


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


  /// Generate the Entity files
  let generateEntityFiles state =
    printf "Writing Entity files..."
    state.entities
    |> Array.Parallel.map (fun e -> e.logicalName, getEntityContext e)
    |> Array.Parallel.iter (fun (name, lines) ->
      File.WriteAllLines(sprintf "%s/Entity/%s.d.ts" state.outputDir name, 
        entityRef 1 :: baseRef 1 :: entityEnumRef 1 name :: lines))
    printfn "Done!"


  /// Generate the IPage files
  let generateIPageFiles state =
    printf "Writing IPage files..."
    state.entities
    |> Array.Parallel.map (fun e -> e.logicalName, getIPageContext e)
    |> Array.Parallel.iter 
      (fun (name, lines) -> 
        File.WriteAllLines(sprintf "%s/IPage/%s.d.ts" state.outputDir name, 
          baseRef 1 :: entityEnumRef 1 name :: lines))
    printfn "Done!"


  /// Generate the Form files
  let generateFormFiles state =
    printf "Writing Form files..."
    state.forms
    |> Array.Parallel.iter (fun xrmForm ->
      let path = sprintf "%s/Form/%s/%s" state.outputDir xrmForm.entityName xrmForm.formType
      Directory.CreateDirectory path |> ignore

      // TODO: check for forms with same name
      let lines = xrmForm |> getFormDts
      File.WriteAllLines(sprintf "%s/%s.d.ts" path xrmForm.name, 
        baseRef 3 :: entityEnumRef 3 xrmForm.entityName :: lines)
    )
    printfn "Done!"