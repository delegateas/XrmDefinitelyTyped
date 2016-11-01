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
  open System.Collections.Generic

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
    let prefix = "base_ext_"
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
    let ap = xrmAuth.ap ?| AuthenticationProviderType.OnlineFederation
    let domain = xrmAuth.domain ?| ""
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
  let retrieveCrmData crmVersion entities mainProxy proxyGetter =
    let rawEntityMetadata = 
      retrieveEntityMetadata entities mainProxy proxyGetter
    
    printf "Fetching BPF metadata from CRM..."
    let bpfData = 
      match crmVersion .>= (6,0,0,0) with
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


  let intersectMappedSets a b = Map.ofSeq (seq {
    for KeyValue(k, va) in a do
      match Map.tryFind k b with
      | Some vb -> yield k, Set.intersect va vb
      | None    -> () })

  // Reduces a list of quadruple sets to a single quadruple set
  let intersectFormQuads =
    Seq.reduce (fun (d1, a1, c1, t1) (d2, a2, c2, t2) ->
      Set.union d1 d2, Set.intersect a1 a2, Set.intersect c1 c2, intersectMappedSets t1 t2)

  // Makes intersection of forms by guid
  let intersectFormContentByGuid (formDict: IDictionary<Guid, XrmForm>) ((name, guids): FormIntersect) =
    guids 
    |> Seq.choose (fun g ->
      match formDict.ContainsKey g with
      | true  -> Some formDict.[g]
      | false -> printfn "Form with GUID %A was not found" g; None)

    |> Seq.map (fun f -> 
      f.entityDependencies |> Set.ofSeq,  
      f.attributes |> Set.ofList, 
      f.controls |> Set.ofList, 
      f.tabs |> Seq.map (fun (name, iname, sections) -> (name, iname), sections |> Set.ofList) |> Map.ofSeq)

    |> intersectFormQuads
    |> fun q -> name, q

  // Intersect forms based on argument
  let intersectForms formDict =
    Array.distinctBy fst
    >> Array.Parallel.map (intersectFormContentByGuid formDict)
    >> Seq.mapi (fun idx (name, (deps, a, c, t)) -> 
      { XrmForm.name = name
        entityName = "_special"
        entityDependencies = deps |> Set.toSeq
        formType = None
        attributes = a |> Set.toList
        controls = c |> Set.toList
        tabs = t |> Map.toList |> List.map (fun ((k1, k2), v) -> k1, k2, v |> Set.toList)
      })
    >> Seq.append formDict.Values
    >> Array.ofSeq

  /// Interprets the raw CRM data into an intermediate state used for further generation
  let interpretCrmData out toIntersect (rawState:RawState) =
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

    let formDict = interpretFormXmls entityMetadata rawState.formData bpfControls
    let forms = intersectForms formDict toIntersect
    printfn "Done!"

    { InterpretedState.entities = entityMetadata
      bpfControls = bpfControls
      forms = forms
      outputDir = out 
    }

  /// Generate the files stored as resources
  let generateResourceFiles crmVersion state =
    let exts = getBaseExtensions crmVersion

    // Extend base.d.ts with version specific additions
    getBaseExtensions crmVersion
    |> Seq.map (getResourceLines >> stripReferenceLines)
    |> (getResourceLines "base.d.ts" |> Seq.singleton |> Seq.append)
    |> List.concat
    |> fun lines -> 
      File.WriteAllLines(
        sprintf "%s/base.d.ts" state.outputDir, makeRef "_internal/entities" :: lines)
 
    // Copy stable declaration files directly
    [ "metadata.d.ts"
      "dg.xrmquery.d.ts"
    ] |> List.iter (copyResourceDirectly state.outputDir)

    [ "domain.d.ts"
      "sdk.d.ts"
    ] |> List.iter (copyResourceDirectly (sprintf "%s/_internal" state.outputDir))
    

  /// Generate a entity base files
  let generateEntityBaseFiles state =
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
        baseRef depth :: (List.append enumRefs lines))
    )
    printfn "Done!"