namespace DG.XrmDefinitelyTyped

module internal TsStringUtil =

  let getConstantType (name:string) = name.Replace("\\", "\\\\").Replace("\"", "\\\"") |> sprintf "\"%s\"" |> TsType.Custom

  let rec wrapIfRecursive ty =
    match ty with
    | TsType.Intersection _ 
    | TsType.Union _ -> typeToString ty |> sprintf "(%s)"
    | _ -> typeToString ty

  and typeToString = function
    | TsType.Void           -> "void"
    | TsType.Null           -> "null"
    | TsType.Undefined      -> "undefined"
    | TsType.Never          -> "never"
    | TsType.Any            -> "any"
    | TsType.Boolean        -> "boolean"
    | TsType.String         -> "string"
    | TsType.Number         -> "number"
    | TsType.Array a        -> sprintf "%s[]" (wrapIfRecursive a)
    | TsType.Date           -> "Date"
    | TsType.Function(v, r) -> 
      sprintf "(%s) => %s" 
        (String.concat ", " (List.map varToIString v)) 
        (typeToString r)
    | TsType.Custom s       -> s
    | TsType.Generic(n, t)  -> sprintf "%s<%s>" n t
    | TsType.SpecificGeneric(n,ts) 
                            -> sprintf "%s<%s>" n (ts |> Seq.map typeToString |> String.concat ", ")
    | TsType.Union types    -> types |> List.map wrapIfRecursive |> String.concat " | "
    | TsType.Intersection types    -> types |> List.map wrapIfRecursive |> String.concat " & "

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

  let enumToString (e:TsEnum) =
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

  let varsToInlineInterfaceString vars =  
    vars |> List.map varToIString |> String.concat "; " |> sprintf "{ %s }"


  let rec nsToString (m:Namespace) =
    let funcs = 
      match m.ambient with
      | true  -> List.map (funcToIString true) m.funcs |> endLines
      | false -> List.map (funcToString true) m.funcs |> List.concat

    [(sprintf "%s%snamespace %s {"
        (declareToString m.declare)
        (exportTypeToString m.export)
        m.name 
    )]
    @ indent 
      ( (List.map varToString m.vars |> preLines "var " |> endLines)
      @ (List.map enumToString m.enums |> List.concat)
      @ funcs
      @ (List.map nsToString m.namespaces |> List.concat)
      @ (List.map interfaceToString m.interfaces |> List.concat)
      @ (List.map classToString m.classes |> List.concat)
      )
    @ ["}"]
