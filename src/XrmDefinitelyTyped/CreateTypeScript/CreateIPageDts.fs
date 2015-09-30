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
        | _ ->
          match v.varType with
          | Type.Custom "EntityReference" -> Type.Array (Type.Custom "EntityReference")
          | _ -> v.varType
          |> fun (vType) -> Type.SpecificGeneric("Attribute", vType)

      Function.Create("getAttribute",
        [Variable.Create("name", getConstantType v.logicalName)],
          aType))


  let getControls (list: XrmAttribute list) =
    list
    |> List.map (fun v ->
      let aType = 
        match v.varType with
        | Type.Date     -> Type.Custom "DateControl"
        | Type.Custom _ -> Type.Custom "LookupControl"
        | _ -> Type.Custom "Control"

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
            Function.Create("getControl", [], Type.Array (Type.Custom "Control"))
            Function.Create("getControl", 
              [Variable.Create("index", Type.Number)], Type.Custom "Control")
            Function.Create("getControl", 
              [Variable.Create("chooser", 
                Type.Function 
                  ([  Variable.Create("control", Type.Custom "Control")
                      Variable.Create("index", Type.Number) ], 
                  Type.Boolean)) ],
              Type.Custom "Control") ])

  let getIPageContext (e:XrmEntity): string list =
    (Module.Create("IPage", declare = true,
      interfaces = [getIPageInterface e]) 
    |> moduleToString)

