namespace DG.XrmDefinitelyTyped

open System

type Value = 
  | String of string
  | Boolean of bool
  | NumberI of int
  | NumberD of double
  | List of Value list
  | Date of DateTime
  | Map of Map<string, Value>
  | Object of Map<string, Value>

type TsType = 
  | Void
  | Null
  | Undefined
  | Never
  | Any
  | Boolean
  | String
  | Number
  | Date
  | Deprecated
  | Array of TsType
  | Generic of string * string
  | SpecificGeneric of string * TsType list
  | Function of Variable list * TsType
  | Custom of string
  | Union of TsType list
  | Intersection of TsType list

and Variable = 
  { name : string
    varType : TsType option
    value : Value option
    declare: bool
    optional: bool }
  static member Create(name, ?varType, ?value, ?declare, ?optional) = 
    { Variable.name = name
      varType = varType
      value = value
      declare = defaultArg declare false
      optional = defaultArg optional false }

type ExportType = 
  | Regular
  | Export

type TsEnum = 
  { name : string
    vals : (string * int option) list
    declare : bool
    constant: bool
    export : bool }
  static member Create(name, ?vals, ?constant, ?declare, ?export) = 
    { TsEnum.name = name
      vals = defaultArg vals []
      declare = defaultArg declare false
      constant = defaultArg constant true
      export = defaultArg export false }

type Function = 
  { name : string
    args : Variable list
    returnType : TsType option
    expr : string list }
  static member Create(name, ?args, ?returnType, ?expr) = 
    { Function.name = name
      args = defaultArg args []
      returnType = returnType
      expr = defaultArg expr [] }

type Class = 
  { name : string
    export : ExportType
    superClass : string option
    impls : string list
    consts : Variable list
    vars : Variable list
    funcs : Function list }
  static member Create(name, ?export, ?superClass, ?impls, ?consts, ?vars, 
                       ?funcs) = 
    { Class.name = name
      export = defaultArg export Regular
      superClass = superClass
      impls = defaultArg impls []
      consts = defaultArg consts []
      vars = defaultArg vars []
      funcs = defaultArg funcs [] }

type Interface = 
  { name : string
    export : ExportType
    extends : string list
    vars : Variable list
    funcs : Function list }
  static member Create(name, ?export, ?extends, ?vars, ?funcs) = 
    { Interface.name = name
      export = defaultArg export Regular
      extends = defaultArg extends []
      vars = defaultArg vars []
      funcs = defaultArg funcs [] }

type Namespace = 
  { name : string
    export : ExportType
    declare : bool
    ambient : bool
    vars : Variable list
    enums : TsEnum list
    funcs : Function list
    namespaces : Namespace list
    interfaces : Interface list
    classes : Class list
    typeDecs : (string * TsType) list
  }
  static member Create(name, ?export, ?declare, ?ambient, ?vars, ?enums, 
                       ?namespaces, ?funcs, ?interfaces, ?classes, ?typeDecs) = 
    { Namespace.name = name
      export = defaultArg export Regular
      declare = defaultArg declare false
      ambient = defaultArg ambient false || defaultArg declare false
      vars = defaultArg vars []
      enums = defaultArg enums []
      funcs = defaultArg funcs []
      namespaces = defaultArg namespaces []
      interfaces = defaultArg interfaces []
      classes = defaultArg classes []
      typeDecs = defaultArg typeDecs [] 
    }


type TsType with
  static member fromEnum (e : TsEnum) = TsType.Custom e.name
  static member fromInterface (i : Interface) = TsType.Custom i.name