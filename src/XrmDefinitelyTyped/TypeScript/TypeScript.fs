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

type Type = 
  | Void
  | Any
  | Boolean
  | String
  | Number
  | Date
  | Array of Type
  | Generic of string * string
  | SpecificGeneric of string * Type
  | Function of Variable list * Type
  | Custom of string

and Variable = 
  { name : string
    varType : Type option
    value : Value option
    declare: bool }
  static member Create(name, ?varType, ?value, ?declare) = 
    { Variable.name = name
      varType = varType
      value = value
      declare = defaultArg declare false }

type ExportType = 
  | Regular
  | Export

type Enum = 
  { name : string
    vals : (string * int option) list
    declare : bool
    constant: bool
    export : bool }
  static member Create(name, ?vals, ?constant, ?declare, ?export) = 
    { Enum.name = name
      vals = defaultArg vals []
      declare = defaultArg declare false
      constant = defaultArg constant true
      export = defaultArg export false }

type Type with
  static member fromEnum (e : Enum) = Type.Custom e.name

type Function = 
  { name : string
    args : Variable list
    returnType : Type option
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
    superClass : string option
    impls : string list
    vars : Variable list
    funcs : Function list }
  static member Create(name, ?export, ?superClass, ?impls, ?vars, ?funcs) = 
    { Interface.name = name
      export = defaultArg export Regular
      superClass = superClass
      impls = defaultArg impls []
      vars = defaultArg vars []
      funcs = defaultArg funcs [] }

type Type with
  static member fromInterface (i : Interface) = Type.Custom i.name

type Module = 
  { name : string
    export : ExportType
    declare : bool
    ambient : bool
    vars : Variable list
    enums : Enum list
    funcs : Function list
    modules : Module list
    interfaces : Interface list
    classes : Class list }
  static member Create(name, ?export, ?declare, ?ambient, ?vars, ?enums, 
                       ?modules, ?funcs, ?interfaces, ?classes) = 
    { Module.name = name
      export = defaultArg export Regular
      declare = defaultArg declare false
      ambient = defaultArg ambient false || defaultArg declare false
      vars = defaultArg vars []
      enums = defaultArg enums []
      funcs = defaultArg funcs []
      modules = defaultArg modules []
      interfaces = defaultArg interfaces []
      classes = defaultArg classes [] }
