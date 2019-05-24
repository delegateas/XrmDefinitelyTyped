namespace DG.XrmDefinitelyTyped

open System
open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Metadata
open Microsoft.Xrm.Sdk.Client
open System.Runtime.Serialization

type Version = int * int * int * int
type Intersect = string * Guid[]

type XrmAuthentication = {
  url: Uri
  username: string
  password: string
  domain: string option
  ap: AuthenticationProviderType option
}

type OptionalNamespace = string option

type XdtGenerationSettings = {
  out: string option
  crmVersion: Version option
  skipForms: bool
  oneFile: bool
  useDeprecated: bool
  jsLib: string option
  tsLib: string option
  restNs: OptionalNamespace
  webNs: OptionalNamespace
  viewNs: OptionalNamespace
  formIntersects: Intersect [] option
  viewIntersects: Intersect [] option
  labelMapping: (string * string)[] option
  generateMappings: bool
}

type EntityName = string

type XdtRetrievalSettings = {
  entities: EntityName[] option
  solutions: string[] option
  skipInactiveForms: bool
}

type ViewName = string
type AttributeName = string
type OwnedAttributes = AttributeName List
type Alias = string
type LinkedEntityName = string * Alias
type LinkedEntity = LinkedEntityName * AttributeName list
type LinkedAttributes = LinkedEntity list
type ParsedFetchXml = (EntityName * OwnedAttributes * LinkedAttributes)
type ViewData = (Guid * ViewName * ParsedFetchXml)

/// Serializable record containing necessary (meta)data
[<DataContract>]
type RawState = {

  [<field : DataMember>]
  crmVersion: Version

  [<field : DataMember>]
  metadata: EntityMetadata[]
  
  [<field : DataMember>]
  nameMap: Map<EntityName, (string * string)>

  [<field : DataMember>]
  bpfData: Entity[]
  
  [<field : DataMember>]
  formData: Map<string, Entity[]>

  [<field : DataMember>]
  imageWebResourceNames: string[]

  [<field : DataMember>]
  lcidData : int[]

  [<field : DataMember>]
  viewData : ViewData []
}
