module DG.XrmDefinitelyTyped.CrmAuth

open System
open System.Net
open Microsoft.IdentityModel.Clients.ActiveDirectory
open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Client
open Microsoft.Xrm.Tooling.Connector
open Microsoft.Xrm.Sdk.WebServiceClient
open System.IO

// Get credentials based on provider, username, password and domain
let internal getCredentials provider username password domain =

  let (password_:string) = password
  let ac = AuthenticationCredentials()

  match provider with
  | AuthenticationProviderType.ActiveDirectory ->
      ac.ClientCredentials.Windows.ClientCredential <-
        new NetworkCredential(username, password_, domain)

  | AuthenticationProviderType.OnlineFederation -> // CRM Online using Office 365 
      ac.ClientCredentials.UserName.UserName <- username
      ac.ClientCredentials.UserName.Password <- password_

  | AuthenticationProviderType.Federation -> // Local Federation
      ac.ClientCredentials.UserName.UserName <- username
      ac.ClientCredentials.UserName.Password <- password_

  | _ -> failwith "No valid authentification provider was used."

  ac

// Get Organization Service Proxy
let internal getOrganizationServiceProxy
  (serviceManagement:IServiceManagement<IOrganizationService>)
  (authCredentials:AuthenticationCredentials) =
  let ac = authCredentials

  match serviceManagement.AuthenticationType with
  | AuthenticationProviderType.ActiveDirectory ->
      new OrganizationServiceProxy(serviceManagement, ac.ClientCredentials) :> IOrganizationService
  | _ ->
      new OrganizationServiceProxy(serviceManagement, ac.SecurityTokenResponse) :> IOrganizationService

// Get Organization Service Proxy using MFA
let ensureClientIsReady (client: CrmServiceClient) =
  match client.IsReady with
  | false ->
    let s = sprintf "Client could not authenticate. If the application user was just created, it might take a while before it is available.\n%s" client.LastCrmError 
    in failwith s
  | true -> client

let internal getCrmServiceClient userName password (orgUrl:Uri) mfaAppId mfaReturnUrl =
  let mutable orgName = ""
  let mutable region = ""
  let mutable isOnPrem = false
  Utilities.GetOrgnameAndOnlineRegionFromServiceUri(orgUrl, &region, &orgName, &isOnPrem)
  let cacheFileLocation = System.IO.Path.Combine(System.IO.Path.GetTempPath(), orgName, "oauth-cache.txt")
  new CrmServiceClient(userName, CrmServiceClient.MakeSecureString(password), region, orgName, false, null, null, mfaAppId, Uri(mfaReturnUrl), cacheFileLocation, null)
  |> ensureClientIsReady
  |> fun x -> x :> IOrganizationService

let internal getCrmServiceClientClientSecret (org: Uri) appId clientSecret =
  new CrmServiceClient(org, appId, CrmServiceClient.MakeSecureString(clientSecret), true, Path.Combine(Path.GetTempPath(), appId, "oauth-cache.txt"))
  |> ensureClientIsReady
  |> fun x -> x :> IOrganizationService

// Authentication
let internal getServiceManagement org = 
    ServiceConfigurationFactory.CreateManagement<IOrganizationService>(org)

let internal authenticate (serviceManagement:IServiceManagement<IOrganizationService>) ap username password domain =
    serviceManagement.Authenticate(getCredentials ap username password domain)
  
