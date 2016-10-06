namespace DG.XrmDefinitelyTyped

module internal TsStringUtil =

  let getConstantType (name:string) = name.Replace("\\", "\\\\").Replace("\"", "\\\"") |> sprintf "\"%s\"" |> Type.Custom

  let rec wrapIfUnionType ty =
    match ty with
    | Type.Union _ -> typeToString ty |> sprintf "(%s)"
    | _ -> typeToString ty

  and typeToString = function
    | Type.Void           -> "void"
    | Type.Null           -> "null"
    | Type.Undefined      -> "undefined"
    | Type.Never          -> "never"
    | Type.Any            -> "any"
    | Type.Boolean        -> "boolean"
    | Type.String         -> "string"
    | Type.Number         -> "number"
    | Type.Array a        -> sprintf "%s[]" (wrapIfUnionType a)
    | Type.Date           -> "Date"
    | Type.Function(v, r) -> 
      sprintf "(%s) => %s" 
        (String.concat ", " (List.map varToIString v)) 
        (typeToString r)
    | Type.Custom s       -> s
    | Type.Generic(n, t)  -> sprintf "%s<%s>" n t
    | Type.SpecificGeneric(n,t) 
                          -> sprintf "%s<%s>" n (typeToString t)
    | Type.Union types    -> types |> List.map wrapIfUnionType |> String.concat " | "

  and valueToString = function
    | Value.String s  -> sprintf "\"%s\"" s
    | Value.NumberI i -> string(i)
    | Value.NumberD d -> string(d)
    | Value.List l    -> 
      sprintf "[%s]" (String.concat ", " (List.map valueToString l))
    | Value.Map m     ->
      sprintf "[%s]" 
        (String.concat ", " (List.map keyValueToString (Map.toList m)))
    | Value.Object o  ->
      sprintf "{%s}" 
        (String.concat ", " (List.map keyValueToOString (Map.toList o)))
    | Value.Date d    -> sprintf "new Date(%s)" (d.ToString("o"))
    | Value.Boolean b -> b.ToString()

  and keyValueToString (s:string, v:Value) =
    sprintf "\"%s\" = %s" s (valueToString v)

  and keyValueToOString (s:string, v:Value) =
    sprintf "%s: %s" s (valueToString v)

  and someValueToString = function
    | Some x  -> sprintf " = %s" (valueToString x)
    | None    -> ""

  and someTypeToString = function
    | Some x  -> sprintf ": %s" (typeToString x)
    | None    -> ""

  and varToString (v:Variable) =
    sprintf "%s%s%s" 
      v.name 
      (someTypeToString v.varType)
      (someValueToString v.value)

  and varToIString (v:Variable) =
    sprintf "%s%s%s" 
      v.name 
      (if v.optional then "?" else "")
      (someTypeToString v.varType)




  let indent =
    List.map (fun s -> sprintf "  %s" s)

  let superClassToString = function
    | Some x  -> sprintf "extends %s " x
    | None    -> ""

  let implementationsToString = function
    | []    -> ""
    | list  -> sprintf "implements %s " (String.concat ", " list)

  let exportTypeToString = function
    | Export  -> "export "
    | Regular -> ""

  let declareToString = function
    | true  -> "declare "
    | false -> ""

  let enumValToString ((k, v): string * int option) =
    match v with
    | Some i  -> sprintf "%s = %d," k i
    | None    -> sprintf "%s," k

  let enumToString (e:Enum) =
    [ (sprintf "%s%s%senum %s {"
        (if e.export then "export " else "")
        (if (not e.export) && e.declare then "declare " else "")
        (if e.constant then "const " else "")
        e.name) ]
    @ indent (List.map enumValToString e.vals)
    @ ["}"]

  let funcToString (desc:bool) (f:Function) =
    [""; sprintf "%s%s(%s)%s {"
      (if desc then "function " else "") 
      f.name 
      (String.concat ", " (List.map varToString f.args)) 
      (someTypeToString f.returnType)
    ] 
    @ indent f.expr
    @ [ "}" ]
      
  let funcToIString (desc:bool) (f:Function) =
    sprintf "%s%s(%s)%s" 
      (if desc then "function " else "") 
      f.name 
      (String.concat ", " (List.map varToIString f.args)) 
      (someTypeToString f.returnType)

  let endLines = List.map (fun s -> sprintf "%s;" s)
  let preLines s1 = List.map (fun s2 -> sprintf "%s%s" s1 s2)

  let classToString (c:Class) =
    [(sprintf "%sclass %s %s%s{"
        (exportTypeToString c.export)
        c.name 
        (superClassToString c.superClass)
        (implementationsToString c.impls))
    ]
    @ indent 
      ( endLines(List.map (fun s -> sprintf "static %s" (varToString s)) c.consts)
      @ endLines(List.map varToString c.vars)
      @ List.concat (List.map (funcToString false) c.funcs)
      )
    @ ["}"]
    
  let interfaceToString (i:Interface) =  
    [(sprintf "%sinterface %s %s%s{"
        (exportTypeToString i.export)
        i.name 
        (superClassToString i.superClass)
        (implementationsToString i.impls))
    ]
    @ indent
      ( (List.map varToIString i.vars |> endLines)
      @ (List.map (funcToIString false) i.funcs |> endLines)
      )
    @ ["}"]

  let rec moduleToString (m:Module) =
    let funcs = 
      match m.ambient with
      | true  -> List.map (funcToIString true) m.funcs |> endLines
      | false -> List.map (funcToString true) m.funcs |> List.concat

    [(sprintf "%s%smodule %s {"
        (declareToString m.declare)
        (exportTypeToString m.export)
        m.name 
    )]
    @ indent 
      ( (List.map varToString m.vars |> preLines "var " |> endLines)
      @ (List.map enumToString m.enums |> List.concat)
      @ funcs
      @ (List.map moduleToString m.modules |> List.concat)
      @ (List.map interfaceToString m.interfaces |> List.concat)
      @ (List.map classToString m.classes |> List.concat)
      )
    @ ["}"]

