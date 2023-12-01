module internal DG.XrmDefinitelyTyped.InterpretFormXml

open System
open System.Xml.Linq
open System.Text.RegularExpressions

open Microsoft.Xrm.Sdk

open IntermediateRepresentation
open Utility


// IDs gotten from MSDN page: 
//    https://msdn.microsoft.com/en-in/library/cc906186.aspx
// Still need to identify some class ids found in certain Form XMLs
let classIds = 
  [ ("B0C6723A-8503-4FD7-BB28-C8A06AC933C2", CheckBox)
    ("5B773807-9FB2-42DB-97C3-7A91EFF8ADFF", DateTime)
    ("C3EFE0C3-0EC6-42BE-8349-CBD9079DFD8E", Decimal)
    ("AA987274-CE4E-4271-A803-66164311A958", Duration)
    ("ADA2203E-B4CD-49BE-9DDF-234642B43B52", EmailAddress)
    ("6F3FB987-393B-4D2D-859F-9D0F0349B6AD", EmailBody)
    ("0D2C745A-E5A8-4C8F-BA63-C6D3BB604660", Float)
    ("FD2A7985-3187-444E-908D-6624B21F69C0", IFrame)
    ("C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F", Integer)
    ("671A9387-CA5A-4D1E-8AB7-06E39DDCF6B5", Language)
    ("270BD3DB-D9AF-4782-9025-509E298DEC0A", Lookup)
    ("533B9E00-756B-4312-95A0-DC888637AC78", MoneyValue)
    ("06375649-C143-495E-A496-C962E5B4488E", Notes)
    ("CBFB742C-14E7-4A17-96BB-1A13F7F64AA2", PartyListLookup)
    ("3EF39988-22BB-4F0B-BBBE-64B5A3748AEE", Picklist)
    ("67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED", RadioButtons)
    ("F3015350-44A2-4AA0-97B5-00166532B5E9", RegardingLookup)
    ("5D68B988-0661-4DB2-BC3E-17598AD3BE6C", StatusReason)
    ("E0DECE4B-6FC8-4A8F-A065-082708572369", TextArea)
    ("4273EDBD-AC1D-40D3-9FB2-095C621B552D", TextBox)
    ("1E1FC551-F7A8-43AF-AC34-A8DC35C7B6D4", TickerSymbol)
    ("7C624A0B-F59E-493D-9583-638D34759266", TimeZonePicklist)
    ("71716B6C-711E-476C-8AB8-5D11542BFB47", Url) 
    ("5C5600E0-1D6E-4205-A272-BE80DA87FD42", QuickView)
    ("62B0DF79-0464-470F-8AF7-4483CFEA0C7D", Map)
    ("E7A81278-8635-4D9E-8D4D-59480B391C5B", Subgrid)
    ("9C5CA0A1-AB4D-4781-BE7E-8DFBE867B87E", Timer)
    ("4AA28AB7-9C13-4F57-A73D-AD894D048B5F", MultiPicklist)
    ("E616A57F-20E0-4534-8662-A101B5DDF4E0", KnowledgeBaseSearch)
  ] |> List.map (fun (id,t) -> id.ToUpper(), t) |> Map.ofList
 
let getTargetEntities (tes: string option) (a: XrmAttribute option) =
  match tes, a with
  | Some _, _ -> tes.Value
  | None, None -> "\"NoAttribute\""
  | None, Some a' ->
    match a'.targetEntitySets with
    | None -> if a.Value.specialType = Guid then "string" else "\"NoAttributeTargets\""
    | Some tes' ->
      let el = tes' |> Array.unzip |> fst |> Array.toList
      match el.IsEmpty with
      | true -> "\"NoTargets\""
      | false -> List.fold(fun acc e -> sprintf "%s | \"%s\"" acc e) (sprintf "\"%s\"" el.Head) el.Tail

let getAttributeType = function
  | None -> TsType.Undefined
  | Some a -> a.varType
let getAttribute (enums:Map<string,TsType>) (entity: XrmEntity) (_, attrName, controlClass, canBeNull, _, tes) =
  if String.IsNullOrEmpty attrName then None else 
  
  let attribute =
    entity.attributes
    |> List.tryFind (fun a -> a.logicalName = attrName)

  let attrType = getAttributeType attribute

  let aType = 
    if attrType = TsType.Boolean && controlClass = ControlClassId.Picklist then AttributeType.OptionSet TsType.Boolean else
    match controlClass with
    | Picklist 
    | StatusReason  -> AttributeType.OptionSet (enums.TryFind(attrName) ?| TsType.Number)
    | RadioButtons 
    | CheckBox      -> AttributeType.OptionSet TsType.Boolean
    | MultiPicklist -> AttributeType.MultiSelectOptionSet (enums.TryFind(attrName) ?| TsType.Number)
        
    | Decimal 
    | Duration
    | Integer 
    | MoneyValue 
    | Float         -> AttributeType.Number

    | PartyListLookup 
    | RegardingLookup 
    | Lookup        -> AttributeType.Lookup (getTargetEntities tes attribute)

    | DateTime      -> AttributeType.Date

    | EmailAddress 
    | EmailBody 
    | Notes
    | TextArea 
    | TextBox 
    | Url           -> AttributeType.Default TsType.String

    // Custom controls will not have their "standard" control type to derivate the attribute type from.
    // This is done using the typescript type instead.
    // There might be additional types that need special handling.
    // It might be relevant to support some with a configuration setting, allowing override of the attribute type in some scenarios.
    | _             ->  match attribute with
                        | None   -> AttributeType.Default TsType.Any
                        | Some a -> match a.specialType with
                                    // As lookups have TsType string for some custom controls, we need to filter them before checking the attribute type
                                    | SpecialType.EntityReference -> AttributeType.Lookup (getTargetEntities tes attribute)
                                    | _ ->  match attrType with
                                            | TsType.Boolean    -> AttributeType.OptionSet TsType.Boolean
                                            | TsType.String     -> AttributeType.Default TsType.String
                                            | TsType.Number     -> AttributeType.Number
                                            | TsType.Date       -> AttributeType.Date
                                            | _                 -> AttributeType.Default TsType.Any
        
  Some (attrName, aType, canBeNull)


let getControl  (enums:Map<string,TsType>) entity (controlField:ControlField): XrmFormControl option =
  let controlId, attrName, controlClass, canBeNull, isBpf, tes = controlField
  if controlClass = QuickView then None else

  let aType = 
    getAttribute enums entity controlField
    |> Option.map (fun (_, a, _) -> a)

  let attribute =
    entity.attributes
    |> List.tryFind (fun a -> a.logicalName = attrName)
    
  let cType = 
    match controlClass with
    | DateTime              -> ControlType.Date

    | Picklist 
    | StatusReason
    | RadioButtons
    | CheckBox              -> ControlType.OptionSet

    | MultiPicklist         -> ControlType.MultiSelectOptionSet
        
    | Decimal 
    | Duration
    | Integer 
    | MoneyValue 
    | Float                 -> ControlType.Number

    | WebResource           -> ControlType.WebResource
    | IFrame                -> ControlType.IFrame 
        
    | Subgrid               -> ControlType.SubGrid (getTargetEntities tes attribute)

    | PartyListLookup 
    | RegardingLookup 
    | Lookup                -> ControlType.Lookup (getTargetEntities tes attribute)
        
    | KnowledgeBaseSearch   -> ControlType.KBSearch

    // TODO: Figure out if the following should be special control types
    | Language
    | QuickView
    | TimeZonePicklist 
    | TickerSymbol
    | Map
    | Timer                 -> ControlType.Default
                // Custom controls might need different handling. It might be better to set these as CustomControl (need to be created) or just BaseControl. 
    | _     ->  match aType with
                | Some (AttributeType.Lookup _)                     -> ControlType.Lookup (getTargetEntities tes attribute)
                | Some (AttributeType.OptionSet aType)              -> ControlType.OptionSet
                | Some (AttributeType.Number)                       -> ControlType.Number
                | Some (AttributeType.Date)                         -> ControlType.Date
                | Some (AttributeType.MultiSelectOptionSet aType)   -> ControlType.MultiSelectOptionSet
                | _                                                 -> ControlType.Default
  
  Some (controlId, aType, cType, isBpf, canBeNull)
  
let getValue (xEl:XElement) (str:string) =
  match xEl.Attribute(XName.Get(str)) with
  | null -> null
  | xattr -> xattr.Value

let (|IsWebResource|) (str:string) = str.StartsWith("WebResource_")
let getControlClass id (classId:string) (uniqueId:string) (controlDescriptions:Map<string,string>) =
  match id with
    | IsWebResource true -> ControlClassId.WebResource
    | _ -> 
      let normalizedClassId = Regex.Replace(classId.ToUpper(), "[{}]", "")
      if normalizedClassId = "F9A8A302-114E-466A-B582-6771B2AE0D92" // CustomControl
      then 
        match Map.tryFind uniqueId controlDescriptions with
        | Some customControlId -> 
          let normalizedCustomControlId = Regex.Replace(customControlId.ToUpper(), "[{}]", "")
          classIds.TryFind normalizedCustomControlId ?| ControlClassId.Other
        | None -> ControlClassId.Other
      else 
        classIds.TryFind normalizedClassId ?| ControlClassId.Other


/// Renames controls with number suffixes if some share the same id
let renameControls (controls:XrmFormControl list) =
  controls
  |> List.groupBy (fun (x,_,_,_,_) -> x)
  |> List.map (fun (x,cs) -> 
    List.mapi (fun i (_,a,c,isBpf,canBeNull) -> 
      if i = 0 then x, a, c, isBpf, canBeNull else 
      
      if isBpf 
      then sprintf "%s_%d" x i, a, c, isBpf, canBeNull  
      else sprintf "%s%d" x i, a, c, isBpf, canBeNull 
    ) cs)
  |> List.concat


let getCompositeField (id, datafieldname, _, canBeNull, isBpf, _) subFieldName ty : ControlField =
  sprintf "%s_compositionLinkControl_%s" id subFieldName,
  subFieldName,
  ty,
  canBeNull,
  isBpf,
  None

let (|IsCompositeAddress|_|) (str:string) = 
  let regex = Regex.Match(str, "^address(\d)_composite$")
  match regex.Success with
  | true -> Some (Int32.Parse(regex.Groups.[1].Value))
  | false -> None

/// Finds all composite fields and adds the sub-fields that they bring along
let getCompositeFields : ControlField list -> ControlField list =
  List.choose (fun field  ->
    let (id, datafieldname, _, _,_, _) = field

    match datafieldname with
    | null -> None
    | IsCompositeAddress x -> 
      Some 
        [ getCompositeField field (sprintf "address%d_line1" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_line2" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_line3" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_city" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_stateorprovince" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_postalcode" x) ControlClassId.TextBox
          getCompositeField field (sprintf "address%d_country" x) ControlClassId.TextBox
        ]
    | _ -> None
  ) >> List.concat

/// Function to interpret a single FormXml
let interpretFormXml (enums:Map<string,TsType>) (bpfFields: ControlField list option) entity (systemForm:Entity) =
  let bpfFields = bpfFields ?| []
  let form = XElement.Parse(systemForm.GetAttributeValue<string>("formxml"))

  let tabs = 
    form.Descendants(XName.Get("tab"))
    |> Seq.choose (fun c -> 
      let tabName = getValue c "name"
      if tabName = null then None
      else

      let sections = 
        c.Descendants(XName.Get("section"))
        |> Seq.map (fun s -> getValue s "name")
        |> Seq.filter (fun s -> s <> null && s.Length > 0)
        |> List.ofSeq
        |> List.sort

      Some (Utility.sanitizeString tabName, tabName, sections))
    |> Seq.filter (fun (name, _, _) -> String.IsNullOrEmpty name |> not) 
    |> Seq.sortBy (fun (name, _, _) -> name)
    |> List.ofSeq

 
  // Attributes and controls
  let controlFields = 
    let controlDescriptions =
      form.Descendants(XName.Get("controlDescription"))
      |> Seq.choose (fun cd -> 
        cd.Elements(XName.Get("customControl"))
        |> Seq.choose (fun cc -> 
          match getValue cc "id" with 
          | null -> None 
          | x -> Some (getValue cd "forControl", x))
        |> Seq.tryHead)
      |> Map.ofSeq

    form.Descendants(XName.Get("control"))
    |> Seq.map (fun c -> 
      let id = getValue c "id"
      let classId = getValue c "classid"
      let uniqueId = getValue c "uniqueid"
      let controlClass = getControlClass id classId uniqueId controlDescriptions
      let datafieldname = getValue c "datafieldname"

      let targetEntities = 
        let parms = c.Descendants(XName.Get("parameters")) 
        if Seq.isEmpty parms then 
          let rel = getValue c "relationship"
          entity.allRelationships
          |> List.choose (fun r -> if r.schemaName = rel then Some r.relatedSetName else None)
        else
          parms
          |> Seq.collect (fun p -> p.Elements(XName.Get("TargetEntityType")))
          |> Seq.map (fun e -> e.Value)
          |> Seq.toList
      
      //Composite controls are on the form in Web UI, but not in UUI
      let canBeNull = match datafieldname with 
                        | null -> false
                        | IsCompositeAddress _ -> true
                        | "fullname" -> true
                        | _ -> false 

      if(targetEntities.Length > 0) then
        let tes =
          Seq.fold(fun acc e -> sprintf "%s | \"%s\"" acc e) (sprintf "\"%s\"" targetEntities.Head) targetEntities.Tail
        id, datafieldname, controlClass, canBeNull, false, Some tes
      else
        id, datafieldname, controlClass, canBeNull, false, None)
    |> List.ofSeq

  let compositeFields = getCompositeFields controlFields

  let name = systemForm.GetAttributeValue<string>("name")
  let typeInt = systemForm.GetAttributeValue<OptionSetValue>("type").Value
  let logicalName = systemForm.GetAttributeValue<string>("objecttypecode")

  systemForm.Id,
  { XrmForm.name =  name |> Utility.sanitizeString
    entityName = logicalName
    guid = Some systemForm.Id 
    entityDependencies = Seq.singleton logicalName
    formType = enum<FormType>(typeInt).ToString() |> Utility.sanitizeString |> Some
    attributes = 
      controlFields @ compositeFields @ bpfFields
      |> List.choose (getAttribute enums entity)
      |> List.distinctBy (fun (a, _, _) -> a)
      |> List.sortBy (fun (a, _, _) -> a)

    controls = 
      controlFields @ compositeFields @ bpfFields
      |> List.choose (getControl enums entity)
      |> renameControls
      |> List.sortBy (fun (name, _, _, _,_) -> name)

    tabs = tabs
  }

/// Main function to interpret a grouping of FormXmls
let interpretFormXmls (entityMetadata: XrmEntity[]) (formData:Map<string,Entity[]>) (bpfControls:Map<string, ControlField list>) =
  entityMetadata
  |> Array.choose (fun em ->
      let enums = 
        em.attributes
        |> List.filter (fun attr -> attr.specialType = SpecialType.OptionSet || attr.specialType = SpecialType.MultiSelectOptionSet)
        |> List.map (fun attr -> attr.logicalName, attr.varType)
        |> Map.ofList

      formData.TryFind em.logicalName
      ?|> Array.Parallel.map (interpretFormXml enums (bpfControls.TryFind em.logicalName) em))
  |> Array.concat
  |> dict