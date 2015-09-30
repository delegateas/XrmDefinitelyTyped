namespace DG.XrmDefinitelyTyped


open TsStringUtil
open IntermediateRepresentation
open Utility


module internal CreateEntityRestDts =

  /// Structure for rest.d.ts
  let getFullRestModule es = 
    let succesCbEmpty = 
      Variable.Create("successCallBack", Type.Function([], Type.Any))

    let errorCb = 
      Variable.Create("errorCallback", 
        Type.Function([Variable.Create("err", Type.Custom "Error")], Type.Any))

    let onComplete = Variable.Create("onComplete", Type.Any)

    let successCbMulti resultType = 
      Variable.Create("successCallback", 
        Type.Function([Variable.Create("result", Type.Array resultType)], Type.Any))

    let successCbSingle resultType = 
      Variable.Create("successCallback", 
        Type.Function([Variable.Create("result", resultType)], Type.Any))
    
    let createTypeVar t = Variable.Create("type", t)

    let entityFuncs =
      es
      |> Array.map (fun e ->
        let eType = Type.Custom e.schemaName
        let eResultType = Type.Custom (sprintf "%sResult" e.schemaName) 
        let typeVar = getConstantType e.schemaName |> createTypeVar

        [ Function.Create("createRecord",
            [ Variable.Create("object", eType); 
              typeVar; 
              successCbSingle eResultType; errorCb ],
            Type.Void)
          Function.Create("deleteRecord",
            [ Variable.Create("id", Type.String);
              typeVar;
              succesCbEmpty; errorCb ],
            Type.Void)
          Function.Create("retrieveRecord",
            [ Variable.Create("id", Type.String); 
              typeVar; 
              Variable.Create("select", Type.String); 
              Variable.Create("expand", Type.String);
              successCbSingle eResultType; errorCb ],
            Type.Void)
          Function.Create("updateRecord",
            [ Variable.Create("id", Type.String); 
              Variable.Create("object", eType)
              typeVar; 
              succesCbEmpty; errorCb ],
            Type.Void)
          Function.Create("retrieveMultipleRecords",
            [ typeVar; 
              Variable.Create("options", Type.String); 
              successCbMulti eResultType; errorCb; onComplete ],
            Type.Void)
        ])
      |> List.concat

    let eType = Type.Custom "Entity"
    let typeVar = createTypeVar Type.String
    Module.Create("REST", 
      ambient = true,
      funcs = 
        entityFuncs
        @ [
        Function.Create("createRecord",
          [ Variable.Create("object", eType); 
            typeVar; 
            successCbSingle eType; errorCb ],
          Type.Void)
        Function.Create("deleteRecord",
            [ Variable.Create("id", Type.String);
              typeVar;
              succesCbEmpty; errorCb ],
            Type.Void)
        Function.Create("retrieveRecord",
          [ Variable.Create("id", Type.String); 
            typeVar; 
            Variable.Create("select", Type.String); 
            Variable.Create("expand", Type.String);
            successCbSingle eType; errorCb ],
          Type.Void)
        Function.Create("updateRecord",
          [ Variable.Create("id", Type.String); 
            Variable.Create("object", eType)
            typeVar; 
            succesCbEmpty; errorCb ],
          Type.Void)
        Function.Create("retrieveMultipleRecords",
          [ typeVar; 
            Variable.Create("options", Type.String); 
            successCbMulti eType; errorCb; onComplete ],
          Type.Void)
        Function.Create("associateRecords",
            [ Variable.Create("parentId", Type.String);
              Variable.Create("parentType", Type.String);
              Variable.Create("relationshipName", Type.String);
              Variable.Create("childId", Type.String);
              Variable.Create("childType", Type.String);
              succesCbEmpty; errorCb ],
            Type.Void)
        Function.Create("disassociateRecords",
            [ Variable.Create("parentId", Type.String);
              Variable.Create("parentType", Type.String);
              Variable.Create("relationshipName", Type.String);
              Variable.Create("childId", Type.String);
              Variable.Create("childType", Type.String);
              succesCbEmpty; errorCb ],
            Type.Void)
      ])
    |> fun rest ->
      Module.Create("SDK", declare = true, modules = [rest])
    |> moduleToString
