module DG.XrmDefinitelyTyped.CrmAuth

open System
open System.IO
open System.Security
open Microsoft.Xrm.Sdk
open Microsoft.PowerPlatform.Dataverse.Client
open Microsoft.PowerPlatform.Dataverse.Client.Auth

let ensureClientIsReady (client: ServiceClient) =
  match client.IsReady with
  | false ->
    let s = sprintf "Client could not authenticate. If the application user was just created, it might take a while before it is available.\n%s" client.LastError
    in failwith s
  | true -> client

let private makeSecureString (value: string) =
  let secureValue = new SecureString()
  value |> Seq.iter secureValue.AppendChar
  secureValue.MakeReadOnly()
  secureValue

// OAuth user authentication (with MFA support) through the Dataverse ServiceClient
let internal getCrmServiceClient username password (orgUrl:Uri) mfaAppId mfaReturnUrl =
  if String.IsNullOrWhiteSpace mfaAppId then failwith "OAuth authentication requires mfaAppId"
  if String.IsNullOrWhiteSpace mfaReturnUrl then failwith "OAuth authentication requires mfaReturnUrl"
  let cacheFileLocation = Path.Combine(Path.GetTempPath(), orgUrl.Host, "oauth-cache.txt")
  let securePassword = makeSecureString password
  new ServiceClient(
    username,
    securePassword,
    orgUrl,
    true,
    mfaAppId,
    Uri(mfaReturnUrl),
    PromptBehavior.Auto,
    false,
    cacheFileLocation,
    null)
  |> ensureClientIsReady
  |> fun x -> x :> IOrganizationService

let internal getCrmServiceClientClientSecret (org: Uri) (appId: string) (clientSecret: string) =
  new ServiceClient(org, appId, clientSecret, true)
  |> ensureClientIsReady
  |> fun x -> x :> IOrganizationService

let internal getCrmServiceClientConnectionString (connectionString: string option) =
  if connectionString.IsNone then failwith "Ensure connectionString is set when using ConnectionString method" else
  new ServiceClient(connectionString.Value)
  |> ensureClientIsReady
  |> fun x -> x :> IOrganizationService
