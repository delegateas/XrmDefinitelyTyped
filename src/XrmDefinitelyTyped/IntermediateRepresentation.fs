namespace DG.XrmDefinitelyTyped

module IntermediateRepresentation =

  type Option = {
    label: string 
    value: int
  }

  type OptionSet = {
    displayName: string
    options: Option[]
  }

  type SpecialType = Default | OptionSet | Money | Guid | EntityReference

  type XrmAttribute = { 
    schemaName: string
    logicalName: string
    varType: Type
    specialType: SpecialType
  }

  type XrmRelationship = {
    schemaName: string
    attributeName: string
    relatedEntity: string
    referencing: bool
  }

  type XrmEntity = {
    typecode: int
    schemaName: string
    logicalName: string
    attr_vars: XrmAttribute list 
    opt_sets: OptionSet list
    rel_vars: XrmRelationship list
    relatedEntities: string list }


  // Forms
  type ControlType = 
    | Default
    | Number
    | Date
    | Lookup
    | OptionSet
    | SubGrid
    | WebResource
    | IFrame

  type AttributeType = 
    | Default of Type
    | Number
    | Lookup
    | OptionSet of Type

  type FormType =
    | Dashboard = 0
    | AppointmentBook = 1
    | Main = 2
    | MiniCampaignBO = 3
    | Preview = 4
    | Mobile = 5
    | Quick = 6
    | QuickCreate = 7
    | Other = 100
    | MainBackup = 101
    | AppointmentBookBackup = 102
  
  type XrmFormAttribute = string * AttributeType
  type XrmFormControl = string * AttributeType option * ControlType
  type XrmFormTab = string * string * string list
  
  type ControlClassId =
    | CheckBox | DateTime | Decimal | Duration | EmailAddress | EmailBody 
    | Float | IFrame | Integer | Language | Lookup | MoneyValue | Notes
    | PartyListLookup | Picklist | RadioButtons | RegardingLookup 
    | StatusReason | TextArea | TextBox | TickerSymbol | TimeZonePicklist | Url
    | WebResource | Map | Subgrid | QuickView | Timer
    | Other
    with override x.ToString() = x.GetType().Name

  type ControlField = string * string * ControlClassId


  type XrmForm = {
    entityName: string
    formType: string
    name: string
    attributes: XrmFormAttribute list
    controls: XrmFormControl list
    tabs: XrmFormTab list
  }




