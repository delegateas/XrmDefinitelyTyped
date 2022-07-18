module internal DG.XrmDefinitelyTyped.CreateFormDts

open TsStringUtil
open IntermediateRepresentation
open Utility

let unionWithNull t canBeNull = 
  if canBeNull
  then 
    TsType.Union [t;TsType.Null]
  else
    t

/// Translate internal attribute type to corresponding TypeScript interface.
let getAttributeInterface ty canBeNull xrmNs = 
  let returnType = 
    match ty with
    | AttributeType.OptionSet ty  -> TsType.SpecificGeneric (sprintf "%s.OptionSetAttribute" xrmNs, [ ty ])
    | AttributeType.MultiSelectOptionSet ty
                                -> TsType.SpecificGeneric (sprintf "%s.MultiSelectOptionSetAttribute" xrmNs, [ ty ])
    | AttributeType.Default ty    -> TsType.SpecificGeneric (sprintf "%s.Attribute" xrmNs, [ ty ])
    | AttributeType.Lookup ty     -> TsType.Custom (sprintf "%s.LookupAttribute<%s>" xrmNs ty)
    | x                           -> TsType.Custom (sprintf "%s.%AAttribute" xrmNs x)
  unionWithNull returnType canBeNull

let getAttributeMap ty canBeNull xrmNs = 
  let returnType = 
    match ty with
    | AttributeType.OptionSet ty
    | AttributeType.MultiSelectOptionSet ty
    | AttributeType.Default ty    -> ty
    | AttributeType.Number        -> TsType.Number
    | AttributeType.Date          -> TsType.Date
    | AttributeType.Lookup ty     -> TsType.Custom (sprintf "%s.EntityReference<%s>" xrmNs ty)
  unionWithNull returnType canBeNull
 
/// Gets the corresponding enum of the option set if possible
let getOptionSetType = function
  | Some (AttributeType.OptionSet ty) 
  | Some (AttributeType.MultiSelectOptionSet ty) -> ty
  | _ -> TsType.Number

/// Translate internal control type to corresponding TypeScript interface.
let getControlInterface cType aType canBeNull xrmNs =
  let returnType = 
    match aType, cType with
    | None, ControlType.Default       -> TsType.Custom (sprintf "%s.BaseControl" xrmNs)
    | Some (AttributeType.Default TsType.String), ControlType.Default
                                      -> TsType.Custom (sprintf "%s.StringControl" xrmNs)
    | Some at, ControlType.Default    -> TsType.SpecificGeneric (sprintf "%s.Control" xrmNs, [ getAttributeInterface at canBeNull xrmNs ]) 
    | aType, ControlType.OptionSet    -> TsType.SpecificGeneric (sprintf "%s.OptionSetControl" xrmNs, [ getOptionSetType aType ])
    | aType, ControlType.MultiSelectOptionSet
                                      -> TsType.SpecificGeneric (sprintf "%s.MultiSelectOptionSetControl" xrmNs, [ getOptionSetType aType ])
    | Some (AttributeType.Lookup _), ControlType.Lookup tes
    | _, ControlType.Lookup tes       -> TsType.Custom (sprintf "%s.LookupControl<%s>" xrmNs tes)
    | _, ControlType.SubGrid tes      -> TsType.Custom (sprintf "%s.SubGridControl<%s>" xrmNs tes)
    | _, x                            -> TsType.Custom (sprintf "%s.%AControl" xrmNs x)
  unionWithNull returnType canBeNull

/// Default collection functions which also use the "get" function name.
let defaultCollectionFuncs defaultType = 
  [ Function.Create("get", 
      [ Variable.Create("name", TsType.String) ], TsType.Undefined)

    Function.Create("get", [], TsType.Array (TsType.Custom defaultType))
    Function.Create("get", 
      [Variable.Create("index", TsType.Number)], TsType.Custom defaultType)
    Function.Create("get", 
      [Variable.Create("chooser", 
        TsType.Function(
          [ Variable.Create("item", TsType.Custom defaultType)
            Variable.Create("index", TsType.Number) ], 
          TsType.Boolean))], 
        TsType.Array (TsType.Custom defaultType))]


/// Generate Xrm.Page.data.entity.attributes.get(<string>) functions.
let getAttributeCollection (attributes: XrmFormAttribute list) (xrmNs: string) =
  let getFuncs = 
    attributes
    |> List.map (fun (name,ty,canBeNull) ->
      let paramType = getConstantType name
      let returnType = getAttributeInterface ty canBeNull xrmNs
      Function.Create("get", [Variable.Create("name", paramType)], returnType))

  let defaultFuncs = defaultCollectionFuncs (sprintf "%s.Attribute<any>" xrmNs)
  Interface.Create("Attributes", extends = [ sprintf "%s.AttributeCollectionBase" xrmNs],
    funcs = getFuncs @ defaultFuncs)

/// Generate Xrm.Page.data.entity.attributes Map.
let getAttributeCollectionMap (attributes: XrmFormAttribute list) (xrmNs: string)=
  let getVars = 
    attributes
    |> List.map (fun (name,ty,canBeNull) ->
      let returnType = getAttributeMap ty canBeNull xrmNs
      Variable.Create(name, returnType))
      
  Interface.Create("AttributeValueMap", vars = getVars)

/// Auxiliary function that determines if a control is to be included based on it's name and the crmVersion
let includeControl (name: string) crmVersion =
    (not (name.StartsWith("header_")) && not (name.StartsWith("footer_"))) || crmVersion .>= (6,0,0,0)

/// Generate Xrm.Page.ui.controls.get(<string>) functions.
let getControlCollection (controls: XrmFormControl list) (crmVersion: Version) (xrmNs: string)=
  let getFuncs = 
    controls
    |> List.map (fun (name, aType, cType, isBpf, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getControlInterface cType aType canBeNull xrmNs
      match includeControl name crmVersion with
      | false -> None
      | true ->
        Some (Function.Create("get", [Variable.Create("name", paramType)], returnType))
      )
    |> List.choose id

  let defaultFuncs = defaultCollectionFuncs (sprintf "%s.BaseControl" xrmNs)
  Interface.Create("Controls", extends = [ (sprintf "%s.ControlCollectionBase" xrmNs)],
    funcs = getFuncs @ defaultFuncs)

/// Generate Xrm.Page.ui.controls map.
let getControlCollectionMap (controls: XrmFormControl list) (crmVersion: Version) (xrmNs: string)=
  let getVars = 
    controls
    |> List.map (fun (name, aType, cType, isBpf, canBeNull) ->
      let returnType = getControlInterface cType aType canBeNull xrmNs        
      match includeControl name crmVersion with
      | false -> None
      | true -> Some (Variable.Create(name, returnType))
      )
    |> List.choose id
    
  Interface.Create("ControlMap", vars = getVars)

/// Generate Xrm.Page.ui.tabs.get(<string>) functions.
let getTabCollection (tabs: XrmFormTab list) (xrmNs: string) =
  let getFuncs =
    tabs
    |> List.map (fun (iname, name, sections) ->
      let paramType = getConstantType name
      let returnType = sprintf "%s.PageTab<Tabs.%s>" xrmNs iname |> TsType.Custom
      Function.Create("get", [Variable.Create("name", paramType)], returnType))

  let defaultFuncs = 
    defaultCollectionFuncs 
      (sprintf "%s.PageTab<%s.Collection<%s.PageSection>>" xrmNs xrmNs xrmNs)

  Interface.Create("Tabs", extends = [(sprintf "%s.TabCollectionBase" xrmNs)],
    funcs = getFuncs @ defaultFuncs)


/// Generate Xrm.Page.ui.tabs.get(<someTab>).sections.get(<string>) functions.
let getSectionCollections (tabs: XrmFormTab list) (xrmNs: string) =
  let getFuncs sections = 
    sections
    |> List.map (fun name -> 
      let paramType = getConstantType name
      Function.Create("get", [ Variable.Create("name", paramType) ], 
        TsType.Custom (sprintf "%s.PageSection" xrmNs)))

  let defaultFuncs = defaultCollectionFuncs (sprintf "%s.PageSection" xrmNs)
  tabs |> List.map (fun (iname, name, sections) ->
    Interface.Create(iname, extends = [(sprintf "%s.SectionCollectionBase" xrmNs)],
      funcs = getFuncs sections @ defaultFuncs))



/// Generate Xrm.Page.getAttribute(<string>) functions.
let getAttributeFuncs (attributes: XrmFormAttribute list) (xrmNs: string) =
  let attrFuncs = 
    attributes
    |> List.map (fun (name, ty, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getAttributeInterface ty canBeNull xrmNs
      Function.Create("getAttribute", 
        [ Variable.Create("attributeName", paramType) ], returnType))

  let defaultFunc =
    Function.Create("getAttribute", 
      [ Variable.Create("attributeName", TsType.String) ], 
      TsType.Undefined )
  
  let delegateFunc =
      Function.Create("getAttribute",
        [ Variable.Create("delegateFunction", TsType.Custom(sprintf "%s.Collection.MatchingDelegate<%s.Attribute<any>>" xrmNs xrmNs))],
        TsType.Custom(sprintf "%s.Attribute<any>[]" xrmNs))
  
  attrFuncs @ [ defaultFunc; delegateFunc ]


  
/// Generate Xrm.Page.getControl(<string>) functions.
let getControlFuncs (controls: XrmFormControl list) (crmVersion: Version) (xrmNs: string) =
  let ctrlFuncs = 
    controls
    |> List.map (fun (name, aType, cType, isBpf, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getControlInterface cType aType canBeNull xrmNs
      match includeControl name crmVersion with
      | false -> None
      | true ->
        Some (Function.Create("getControl", 
               [ Variable.Create("controlName", paramType) ], returnType))
      )
    |> List.choose id

  let defaultFunc =
    Function.Create("getControl", 
      [ Variable.Create("controlName", TsType.String) ], 
      TsType.Undefined)
  
  let delegateFunc =
    Function.Create("getControl",
      [ Variable.Create("delegateFunction", TsType.Custom("Xrm.Collection.MatchingDelegate<Xrm.Control<any>>"))],
      TsType.Custom("Xrm.Control<any>[]"))
  
  ctrlFuncs @ [ defaultFunc; delegateFunc ]



/// Generate internal namespace for keeping track all the collections.
let getFormNamespace (form: XrmForm) crmVersion generateMappings xrmNs =
  let baseInterfaces =
    [ getAttributeCollection form.attributes xrmNs
      getControlCollection form.controls crmVersion xrmNs
      getTabCollection form.tabs xrmNs ]
  Namespace.Create(form.name,
    interfaces = 
      (if generateMappings then 
        baseInterfaces @ 
        [getAttributeCollectionMap form.attributes xrmNs
         getControlCollectionMap form.controls crmVersion xrmNs] 
      else baseInterfaces),
    namespaces = 
      [ Namespace.Create("Tabs", interfaces = getSectionCollections form.tabs xrmNs) ])


/// Generate the interface for the Xrm.Page of the form.
let getFormInterface (form: XrmForm) crmVersion (xrmNs : string) =
  let superClass = 
    sprintf "%s.PageBase<%s.Attributes,%s.Tabs,%s.Controls>"
      xrmNs form.name form.name form.name

  Interface.Create(form.name, extends = [superClass], 
    funcs = 
      getAttributeFuncs form.attributes xrmNs @ 
      getControlFuncs form.controls crmVersion xrmNs)


/// Generate the namespace containing all the form interface and internal 
/// namespaces for collections.
let getFormDts (form: XrmForm) crmVersion xdtSettings = 
  let nsName = 
    sprintf "Form.%s%s" 
      (form.entityName |> Utility.sanitizeString)
      (match form.formType with
      | Some ty -> sprintf ".%s" ty
      | None   -> "")

  Namespace.Create(
    nsName,
    declare = true,
    namespaces = [ getFormNamespace form crmVersion xdtSettings.generateMappings xdtSettings.xrmNs],
    interfaces = [ getFormInterface form crmVersion xdtSettings.xrmNs]) 
  |> nsToString

