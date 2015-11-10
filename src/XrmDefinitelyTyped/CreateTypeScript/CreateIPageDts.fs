namespace DG.XrmDefinitelyTyped

open TsStringUtil
open IntermediateRepresentation
open Utility

module internal CreateIPageDts =

  
  let getAttributes (list: XrmAttribute list) =
    list
    |> List.map (fun v ->
      let aType = 
        match v.varType, v.specialType with
        | ty, SpecialType.OptionSet -> Type.SpecificGeneric ("OptionSetAttribute", ty)
        | Type.Boolean, _ -> Type.SpecificGeneric ("OptionSetAttribute", Type.Boolean)
        | Type.Number, _ -> Type.Custom "NumberAttribute"
        | Type.Custom "EntityReference", _ -> Type.Custom "LookupAttribute"
        | _ -> Type.SpecificGeneric("Attribute", v.varType)

      Function.Create("getAttribute",
        [Variable.Create("name", getConstantType v.logicalName)],
          aType))


  let getControls (list: XrmAttribute list) =
    list
    |> List.map (fun v ->
      let aType = 
        match v.varType, v.specialType with
        | ty, SpecialType.OptionSet -> Type.SpecificGeneric ("OptionSetControl", ty)
        | Type.Boolean, _ -> Type.SpecificGeneric ("OptionSetControl", Type.Boolean)
        | Type.Date, _     -> Type.Custom "DateControl"
        | Type.String _, _ -> Type.Custom "StringControl"
        | Type.Number _, _ -> Type.Custom "NumberControl"
        | Type.Custom "EntityReference", _ -> Type.Custom "LookupControl"
        | _ -> Type.Custom "BaseControl"

      Function.Create("getControl",
        [Variable.Create("name", getConstantType v.logicalName)],
          aType))



  /// Create the IPage interface for the entity.
  let getIPageInterface (e:XrmEntity) = 
    Interface.Create(e.schemaName, superClass = "BasicPage",
      funcs = 
        (getAttributes e.attr_vars)
        @ [ Function.Create("getAttribute",
              [ Variable.Create("name", Type.String) ],
              Type.Custom "EmptyAttribute")
          ]
        @ (getControls e.attr_vars)
        @ [ Function.Create("getControl",
              [ Variable.Create("name", Type.String) ],
              Type.Custom "EmptyControl")
            Function.Create("getControl", [], Type.Array (Type.Custom "BaseControl"))
            Function.Create("getControl", 
              [Variable.Create("index", Type.Number)], Type.Custom "BaseControl")
            Function.Create("getControl", 
              [Variable.Create("chooser", 
                Type.Function 
                  ([  Variable.Create("control", Type.Custom "BaseControl")
                      Variable.Create("index", Type.Number) ], 
                  Type.Boolean)) ],
              Type.Custom "BaseControl") ])

  let getIPageContext (e:XrmEntity): string list =
    (Module.Create("IPage", declare = true,
      interfaces = [getIPageInterface e]) 
    |> moduleToString)

