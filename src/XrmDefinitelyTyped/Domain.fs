namespace DG.XrmDefinitelyTyped

open System
open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Metadata
open Microsoft.Xrm.Sdk.Client
open System.Runtime.Serialization

type XrmVersion = int * int * int * int
type FormIntersect = string * Guid[]

type XrmAuthentication = {
  url: Uri
  username: string
  password: string
  domain: string option
  ap: AuthenticationProviderType option
}

type XdtGenerationSettings = {
  out: string option
  crmVersion: XrmVersion option
  skipForms: bool
  jsLib: string option
  tsLib: string option
  restNs: string option
  webNs: string option
  formIntersects: FormIntersect [] option
}

type XdtRetrievalSettings = {
  entities: string[] option
  solutions: string[] option
}


/// Serializable record containing necessary (meta)data
[<DataContract>]
type RawState = {

  [<field : DataMember>]
  metadata: EntityMetadata[]
  
  [<field : DataMember>]
  nameMap: Map<string, (string * string)>

  [<field : DataMember>]
  bpfData: Entity[]
  
  [<field : DataMember>]
  formData: Map<string, Entity[]>
}
