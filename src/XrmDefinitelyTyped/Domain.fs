namespace DG.XrmDefinitelyTyped

open System
open Microsoft.Xrm.Sdk.Client

type XrmAuthentication = {
  url: Uri
  username: string
  password: string
  domain: string option
  ap: AuthenticationProviderType option
}

type XrmDefinitelyTypedSettings = {
  out: string option
  tsv: (int*int) option
  entities: string[] option
  solutions: string[] option
}