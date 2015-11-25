namespace DG.XrmDefinitelyTyped

open System.Text.RegularExpressions
open Microsoft.FSharp.Reflection

open TsStringUtil
open Utility
open IntermediateRepresentation

module internal CreateFormDts =

  /// Translate internal attribute type to corresponding TypeScript interface.
  let getAttributeInterface = function
    | AttributeType.OptionSet ty  -> Type.SpecificGeneric ("IPage.OptionSetAttribute", ty)
    | AttributeType.Default ty    -> Type.SpecificGeneric ("IPage.Attribute", ty)
    | x                           -> Type.Custom (sprintf "IPage.%AAttribute" x)
 
  /// Gets the corresponding enum of the option set if possible
  let getOptionSetType = function
    | AttributeType.OptionSet ty -> ty
    | _ -> Type.Number

  /// Translate internal control type to corresponding TypeScript interface.
  let getControlInterface cType aType =
    match aType, cType with
    | None, ControlType.Default       -> Type.Custom "IPage.BaseControl"
    | Some (AttributeType.Default Type.String), ControlType.Default
                                      -> Type.Custom "IPage.StringControl"
    | Some at, ControlType.OptionSet  -> Type.SpecificGeneric ("IPage.OptionSetControl", getOptionSetType at)
    | Some at, ControlType.Default    -> Type.SpecificGeneric ("IPage.Control", getAttributeInterface at) 
    | _, x                            -> Type.Custom (sprintf "IPage.%AControl" x)

  /// Default collection functions which also use the "get" function name.
  let defaultCollectionFuncs emptyType defaultType = 
    [ Function.Create("get", 
        [ Variable.Create("name", Type.String) ], 
        Type.Custom emptyType)

      Function.Create("get", [], Type.Array (Type.Custom defaultType))
      Function.Create("get", 
        [Variable.Create("index", Type.Number)], Type.Custom defaultType)
      Function.Create("get", 
        [Variable.Create("chooser", 
          Type.Function(
            [ Variable.Create("item", Type.Custom defaultType)
              Variable.Create("index", Type.Number) ], 
            Type.Boolean))], 
          Type.Array (Type.Custom defaultType))]


  /// Generate Xrm.Page.data.entity.attributes.get(<string>) functions.
  let getAttributeCollection (attributes:XrmFormAttribute list) =
    let getFuncs = 
      attributes
      |> List.map (fun (name,ty) ->
        let paramType = getConstantType name
        let returnType = getAttributeInterface ty
        Function.Create("get", [Variable.Create("name", paramType)], returnType))

    let defaultFuncs = defaultCollectionFuncs "IPage.EmptyAttribute" "IPage.Attribute<any>"
    Interface.Create("Attributes", superClass = "IPage.AttributeCollectionBase",
      funcs = getFuncs @ defaultFuncs)


  /// Generate Xrm.Page.ui.controls.get(<string>) functions.
  let getControlCollection (controls:XrmFormControl list) =
    let getFuncs = 
      controls
      |> List.map (fun (name, aType, cType) ->
        let paramType = getConstantType name
        let returnType = getControlInterface cType aType          
        Function.Create("get", [Variable.Create("name", paramType)], returnType))

    let defaultFuncs = defaultCollectionFuncs "IPage.EmptyControl" "IPage.BaseControl"
    Interface.Create("Controls", superClass = "IPage.ControlCollectionBase",
      funcs = getFuncs @ defaultFuncs)


  /// Generate Xrm.Page.ui.tabs.get(<string>) functions.
  let getTabCollection (tabs:XrmFormTab list) =
    let getFuncs =
      tabs
      |> List.map (fun (iname, name, sections) ->
        let paramType = getConstantType name
        let returnType = sprintf "IPage.PageTab<Tabs.%s>" iname |> Type.Custom
        Function.Create("get", [Variable.Create("name", paramType)], returnType))

    let defaultFuncs = 
      defaultCollectionFuncs 
        "IPage.EmptyPageTab" 
        "IPage.PageTab<IPage.Collection<IPage.PageSection>>"

    Interface.Create("Tabs", superClass = "IPage.TabCollectionBase",
      funcs = getFuncs @ defaultFuncs)


  /// Generate Xrm.Page.ui.tabs.get(<someTab>).sections.get(<string>) functions.
  let getSectionCollections (tabs:XrmFormTab list) =
    let getFuncs sections = 
      sections
      |> List.map (fun name -> 
        let paramType = getConstantType name
        Function.Create("get", [ Variable.Create("name", paramType) ], 
          Type.Custom "IPage.PageSection"))

    let defaultFuncs = defaultCollectionFuncs "IPage.EmptyPageSection" "IPage.PageSection"
    tabs |> List.map (fun (iname, name, sections) ->
      Interface.Create(iname, superClass = "IPage.SectionCollectionBase",
        funcs = getFuncs sections @ defaultFuncs))



  /// Generate Xrm.Page.getAttribute(<string>) functions.
  let getAttributeFuncs (attributes:XrmFormAttribute list) =
    let attrFuncs = 
      attributes
      |> List.map (fun (name, ty) ->
        let paramType = getConstantType name
        let returnType = getAttributeInterface ty
        Function.Create("getAttribute", 
          [ Variable.Create("attributeName", paramType) ], returnType))

    let defaultFunc =
      Function.Create("getAttribute", 
        [ Variable.Create("attributeName", Type.String) ], 
        Type.Custom "IPage.EmptyAttribute")
    attrFuncs @ [ defaultFunc ]


  
  /// Generate Xrm.Page.getControl(<string>) functions.
  let getControlFuncs (controls:XrmFormControl list) =
    let ctrlFuncs = 
      controls
      |> List.map (fun (name, aType, cType) ->
        let paramType = getConstantType name
        let returnType = getControlInterface cType aType
        Function.Create("getControl", 
          [ Variable.Create("controlName", paramType) ], returnType))

    let defaultFunc =
      Function.Create("getControl", 
        [ Variable.Create("controlName", Type.String) ], 
        Type.Custom "IPage.EmptyControl")
    ctrlFuncs @ [ defaultFunc ]



  /// Generate internal module for keeping track all the collections.
  let getFormSubmodule (form:XrmForm) =
    Module.Create(form.name,
      interfaces = 
        [ getAttributeCollection form.attributes 
          getControlCollection form.controls 
          getTabCollection form.tabs ],
      modules = 
        [ Module.Create("Tabs", interfaces = getSectionCollections form.tabs) ])


  /// Generate the interface for the Xrm.Page of the form.
  let getFormInterface (form:XrmForm) =
    let superClass = 
      sprintf "IPage.PageBase<%s.Attributes,%s.Tabs,%s.Controls>"
        form.name form.name form.name

    Interface.Create(form.name, superClass = superClass, 
      funcs = 
        getAttributeFuncs form.attributes @ 
        getControlFuncs form.controls)


  /// Generate the module containing all the form interface and internal 
  /// module for collections.
  let getFormDts (form:XrmForm) = 
    Module.Create(
      sprintf "Form.%s.%s" (form.entityName |> Utility.sanitizeString) form.formType, 
      declare = true,
      modules = [ getFormSubmodule form ],
      interfaces = [ getFormInterface form ]) 
    |> moduleToString

