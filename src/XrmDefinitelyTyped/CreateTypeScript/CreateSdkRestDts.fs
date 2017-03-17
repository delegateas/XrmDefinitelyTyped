module internal DG.XrmDefinitelyTyped.CreateSdkRestDts

open TsStringUtil
open IntermediateRepresentation


/// Structure for rest.d.ts
let getFullRestNamespace ns es = 
  let prefix = 
    match System.String.IsNullOrWhiteSpace ns with
    | true -> id
    | false -> sprintf "%s.%s" ns

  let succesCbEmpty = 
    Variable.Create("successCallBack", TsType.Function([], TsType.Any))

  let errorCb = 
    Variable.Create("errorCallback", 
      TsType.Function([Variable.Create("err", TsType.Custom "Error")], TsType.Any))

  let onComplete = Variable.Create("onComplete", TsType.Any)

  let successCbMulti resultType = 
    Variable.Create("successCallback", 
      TsType.Function([Variable.Create("result", TsType.Array resultType)], TsType.Any))

  let successCbSingle resultType = 
    Variable.Create("successCallback", 
      TsType.Function([Variable.Create("result", resultType)], TsType.Any))
    
  let createTypeVar t = Variable.Create("type", t)

  let entityFuncs =
    es
    |> Array.map (fun e ->
      let eType = TsType.Custom (prefix e.schemaName)
      let eResultType = TsType.Custom (sprintf "%sResult" e.schemaName |> prefix) 
      let typeVar = getConstantType e.schemaName |> createTypeVar

      [ Function.Create("createRecord",
          [ Variable.Create("object", eType); 
            typeVar; 
            successCbSingle eResultType; errorCb ],
          TsType.Void)
        Function.Create("deleteRecord",
          [ Variable.Create("id", TsType.String);
            typeVar;
            succesCbEmpty; errorCb ],
          TsType.Void)
        Function.Create("retrieveRecord",
          [ Variable.Create("id", TsType.String); 
            typeVar; 
            Variable.Create("select", TsType.String); 
            Variable.Create("expand", TsType.String);
            successCbSingle eResultType; errorCb ],
          TsType.Void)
        Function.Create("updateRecord",
          [ Variable.Create("id", TsType.String); 
            Variable.Create("object", eType)
            typeVar; 
            succesCbEmpty; errorCb ],
          TsType.Void)
        Function.Create("retrieveMultipleRecords",
          [ typeVar; 
            Variable.Create("options", TsType.String); 
            successCbMulti eResultType; errorCb; onComplete ],
          TsType.Void)
      ])
    |> List.concat

  let eType = TsType.Custom (prefix "RestEntity")
  let typeVar = createTypeVar TsType.String
  Namespace.Create("REST", 
    ambient = true,
    funcs = 
      entityFuncs
      @ [
      Function.Create("createRecord",
        [ Variable.Create("object", eType); 
          typeVar; 
          successCbSingle eType; errorCb ],
        TsType.Void)
      Function.Create("deleteRecord",
          [ Variable.Create("id", TsType.String);
            typeVar;
            succesCbEmpty; errorCb ],
          TsType.Void)
      Function.Create("retrieveRecord",
        [ Variable.Create("id", TsType.String); 
          typeVar; 
          Variable.Create("select", TsType.String); 
          Variable.Create("expand", TsType.String);
          successCbSingle eType; errorCb ],
        TsType.Void)
      Function.Create("updateRecord",
        [ Variable.Create("id", TsType.String); 
          Variable.Create("object", eType)
          typeVar; 
          succesCbEmpty; errorCb ],
        TsType.Void)
      Function.Create("retrieveMultipleRecords",
        [ typeVar; 
          Variable.Create("options", TsType.String); 
          successCbMulti eType; errorCb; onComplete ],
        TsType.Void)
      Function.Create("associateRecords",
          [ Variable.Create("parentId", TsType.String);
            Variable.Create("parentType", TsType.String);
            Variable.Create("relationshipName", TsType.String);
            Variable.Create("childId", TsType.String);
            Variable.Create("childType", TsType.String);
            succesCbEmpty; errorCb ],
          TsType.Void)
      Function.Create("disassociateRecords",
          [ Variable.Create("parentId", TsType.String);
            Variable.Create("parentType", TsType.String);
            Variable.Create("relationshipName", TsType.String);
            Variable.Create("childId", TsType.String);
            Variable.Create("childType", TsType.String);
            succesCbEmpty; errorCb ],
          TsType.Void)
    ])
  |> fun rest ->
    Namespace.Create("SDK", declare = true, namespaces = [rest])
  |> nsToString
