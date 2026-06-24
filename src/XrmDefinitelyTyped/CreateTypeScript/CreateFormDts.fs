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
let getAttributeInterface ty canBeNull = 
  let returnType = 
    match ty with
    | AttributeType.OptionSet ty  -> TsType.SpecificGeneric ("Xrm.OptionSetAttribute", [ ty ])
    | AttributeType.MultiSelectOptionSet ty
                                -> TsType.SpecificGeneric ("Xrm.MultiSelectOptionSetAttribute", [ ty ])
    | AttributeType.Default ty    -> TsType.SpecificGeneric ("Xrm.Attribute", [ ty ])
    | AttributeType.Lookup ty     -> TsType.Custom (sprintf "Xrm.LookupAttribute<%s>" ty)
    | x                           -> TsType.Custom (sprintf "Xrm.%AAttribute" x)
  unionWithNull returnType canBeNull

let getAttributeMap ty canBeNull = 
  let returnType = 
    match ty with
    | AttributeType.OptionSet ty
    | AttributeType.MultiSelectOptionSet ty
    | AttributeType.Default ty    -> ty
    | AttributeType.Number        -> TsType.Number
    | AttributeType.Date          -> TsType.Date
    | AttributeType.Lookup ty     -> TsType.Custom (sprintf "Xrm.EntityReference<%s>" ty)
  unionWithNull returnType canBeNull
 
/// Gets the corresponding enum of the option set if possible
let getOptionSetType = function
  | Some (_, AttributeType.OptionSet ty, _) 
  | Some (_, AttributeType.MultiSelectOptionSet ty, _) -> ty
  | _ -> TsType.Number

/// Translate internal control type to corresponding TypeScript interface.
let getControlInterface cType attr canBeNull =
  let returnType = 
    match attr, cType with
    | None, ControlType.Default       -> TsType.Custom "Xrm.BaseControl"
    | Some (_, AttributeType.Default TsType.String, _), ControlType.Default
                                      -> TsType.Custom "Xrm.StringControl"
    | Some (_, at, _), ControlType.Default    -> TsType.SpecificGeneric ("Xrm.Control", [ getAttributeInterface at canBeNull ]) 
    | aType, ControlType.OptionSet    -> TsType.SpecificGeneric ("Xrm.OptionSetControl", [ getOptionSetType aType ])
    | aType, ControlType.MultiSelectOptionSet
                                      -> TsType.SpecificGeneric ("Xrm.MultiSelectOptionSetControl", [ getOptionSetType aType ])
    | Some (_, AttributeType.Lookup _, _), ControlType.Lookup tes
    | _, ControlType.Lookup tes       -> TsType.Custom (sprintf "Xrm.LookupControl<%s>" tes)
    | _, ControlType.SubGrid tes      -> TsType.Custom (sprintf "Xrm.SubGridControl<%s>" tes)
    | _, x                            -> TsType.Custom (sprintf "Xrm.%AControl" x)
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
let getAttributeCollection (attributes: XrmFormAttribute list) =
  let getFuncs = 
    attributes
    |> List.map (fun (name,ty,canBeNull) ->
      let paramType = getConstantType name
      let returnType = getAttributeInterface ty canBeNull
      Function.Create("get", [Variable.Create("name", paramType)], returnType))

  let defaultFuncs = defaultCollectionFuncs "Xrm.Attribute<any>"
  Interface.Create("Attributes", extends = ["Xrm.AttributeCollectionBase"],
    funcs = getFuncs @ defaultFuncs)

/// Generate Xrm.Page.data.entity.attributes Map.
let getAttributeCollectionMap (attributes: XrmFormAttribute list) =
  let getVars = 
    attributes
    |> List.map (fun (name,ty,canBeNull) ->
      let returnType = getAttributeMap ty canBeNull
      Variable.Create(name, returnType))
      
  Interface.Create("AttributeValueMap", vars = getVars)

/// Auxiliary function that determines if a control is to be included based on it's name and the crmVersion
let includeControl (name: string) (formType: string option) crmVersion =
    (not (name.StartsWith("header_")) && not (name.StartsWith("footer_")))
      || (crmVersion .>= (6,0,0,0) && not(formType.IsSome && formType.Value.Equals("Quick")))

/// Generate Xrm.Page.ui.controls.get(<string>) functions.
let getControlCollection (controls: XrmFormControl list) (formType: string option) (crmVersion: Version) =
  let getFuncs = 
    controls
    |> List.map (fun (name, attr, cType, isBpf, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getControlInterface cType attr canBeNull         
      match includeControl name formType crmVersion with
      | false -> None
      | true ->
        Some (Function.Create("get", [Variable.Create("name", paramType)], returnType))
      )
    |> List.choose id

  let defaultFuncs = defaultCollectionFuncs "Xrm.BaseControl"
  Interface.Create("Controls", extends = ["Xrm.ControlCollectionBase"],
    funcs = getFuncs @ defaultFuncs)

/// Generate Xrm.Page.ui.controls map.
let getControlCollectionMap (controls: XrmFormControl list) (formType: string option) (crmVersion: Version) =
  let getVars = 
    controls
    |> List.map (fun (name, aType, cType, isBpf, canBeNull) ->
      let returnType = getControlInterface cType aType canBeNull          
      match includeControl name formType crmVersion with
      | false -> None
      | true -> Some (Variable.Create(name, returnType))
      )
    |> List.choose id
    
  Interface.Create("ControlMap", vars = getVars)

let nsName xrmForm = 
  sprintf "Form.%s%s" 
    (xrmForm.entityName |> Utility.sanitizeString)
    (match xrmForm.formType with
    | Some ty -> sprintf ".%s" ty
    | None   -> "")

let getQuickViewFormCollection (quickViewForms: XrmFormQuickViewForm list) (formMap: Map<System.Guid, XrmForm>) =
  let getFuncs =
    quickViewForms
    |> List.map (fun (name, (_, formId)) ->
        let paramType = getConstantType name
        let returnType = 
          match formMap.TryGetValue formId with
          | (true, form) -> TsType.Custom (sprintf "%s.%s" (nsName form) form.name)
          | (false, _) -> TsType.Custom "Xrm.QuickViewFormBase"
        Function.Create("get", [Variable.Create("name", paramType)], returnType)
    )

  Interface.Create("QuickViewForms", extends = ["Xrm.QuickViewFormCollectionBase"],
    funcs = getFuncs @ defaultCollectionFuncs "Xrm.QuickViewFormBase")

/// Generate Xrm.Page.ui.tabs.get(<string>) functions.
let getTabCollection (tabs: XrmFormTab list) =
  let getFuncs =
    tabs
    |> List.map (fun (iname, name, sections) ->
      let paramType = getConstantType name
      let returnType = sprintf "Xrm.PageTab<Tabs.%s>" iname |> TsType.Custom
      Function.Create("get", [Variable.Create("name", paramType)], returnType))

  let defaultFuncs = 
    defaultCollectionFuncs 
      "Xrm.PageTab<Xrm.Collection<Xrm.PageSection>>"

  Interface.Create("Tabs", extends = ["Xrm.TabCollectionBase"],
    funcs = getFuncs @ defaultFuncs)


/// Generate Xrm.Page.ui.tabs.get(<someTab>).sections.get(<string>) functions.
let getSectionCollections (tabs: XrmFormTab list) =
  let getFuncs sections = 
    sections
    |> List.map (fun name -> 
      let paramType = getConstantType name
      Function.Create("get", [ Variable.Create("name", paramType) ], 
        TsType.Custom "Xrm.PageSection"))

  let defaultFuncs = defaultCollectionFuncs "Xrm.PageSection"
  tabs |> List.map (fun (iname, name, sections) ->
    Interface.Create(iname, extends = ["Xrm.SectionCollectionBase"],
      funcs = getFuncs sections @ defaultFuncs))

/// Generate Xrm.Page.getAttribute(<string>) functions.
let getAttributeFuncs (attributes: XrmFormAttribute list) (controls: XrmFormControl list) (formType: string option) (crmVersion: Version) =
  let controlMap =
    controls
    |> List.choose(fun (id, attr, _, _, _) ->
      match includeControl id formType crmVersion with
      | false -> None
      | true ->
        match attr with
        | Some (aName, _, _) -> Some (aName, id)
        | None -> None)
    |> Map.ofList

  let attrFuncs = 
    attributes
    |> List.filter (fun (aName, _, _) -> not(formType = Some "Quick") || controlMap |> Map.containsKey aName)
    |> List.map (fun (name, ty, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getAttributeInterface ty canBeNull
      Function.Create("getAttribute", 
        [ Variable.Create("attributeName", paramType) ], returnType))

  let defaultFunc =
    Function.Create("getAttribute", 
      [ Variable.Create("attributeName", TsType.String) ], 
      TsType.Undefined )
  
  let delegateFunc =
      Function.Create("getAttribute",
        [ Variable.Create("delegateFunction", TsType.Custom("Xrm.Collection.MatchingDelegate<Xrm.Attribute<any>>"))],
        TsType.Custom("Xrm.Attribute<any>[]"))
  
  attrFuncs @ [ defaultFunc; delegateFunc ]


  
/// Generate Xrm.Page.getControl(<string>) functions.
let getControlFuncs (controls: XrmFormControl list) (formType: string option) (crmVersion: Version)=
  let ctrlFuncs = 
    controls
    |> List.map (fun (name, aType, cType, isBpf, canBeNull) ->
      let paramType = getConstantType name
      let returnType = getControlInterface cType aType canBeNull
      match includeControl name formType crmVersion with
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
let getFormNamespace (form: XrmForm) formMap crmVersion generateMappings =
  let baseInterfaces =
    [ if not(form.formType = Some "Quick") then Some (getAttributeCollection form.attributes) else None
      Some (getControlCollection form.controls form.formType crmVersion)
      if not(form.formType = Some "Quick") then Some (getQuickViewFormCollection form.quickViewForms formMap) else None
      Some (getTabCollection form.tabs) ]
    |> List.choose id
  Namespace.Create(form.name,
    interfaces = 
      (if generateMappings then 
        baseInterfaces @ 
        [getAttributeCollectionMap form.attributes
         getControlCollectionMap form.controls form.formType crmVersion] 
      else baseInterfaces),
    namespaces = 
      [ Namespace.Create("Tabs", interfaces = getSectionCollections form.tabs) ])


/// Generate the interface for the Xrm.Page of the form.
let getFormInterface (form: XrmForm) crmVersion =
  let superClass =
    if (form.formType = Some "Quick") then
      sprintf "Xrm.QuickViewForm<%s.Tabs,%s.Controls>"
        form.name form.name
    else
      sprintf "Xrm.PageBase<%s.Attributes,%s.Tabs,%s.Controls,%s.QuickViewForms>"
        form.name form.name form.name form.name

  Interface.Create(form.name, extends = [superClass], 
    funcs = 
      getAttributeFuncs form.attributes form.controls form.formType crmVersion @ 
      getControlFuncs form.controls form.formType crmVersion)

/// Generate the namespace containing all the form interface and internal 
/// namespaces for collections.
let getFormDts (form: XrmForm) (formMap: Map<System.Guid, XrmForm>) crmVersion generateMappings = 
  Namespace.Create(
    nsName form,
    declare = true,
    namespaces = [ getFormNamespace form formMap crmVersion generateMappings],
    interfaces = [ getFormInterface form crmVersion]) 
  |> nsToString

