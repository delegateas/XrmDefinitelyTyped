module DG.XrmDefinitelyTyped.CrmAuth

open System
open System.Net
open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Client
open Microsoft.Xrm.Tooling.Connector
open Microsoft.Xrm.Sdk.WebServiceClient

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
let internal getOrganizationServiceProxyUsingMFA userName password (orgUrl:Uri) mfaAppId mfaReturnUrl =
    let mutable orgName = ""
    let mutable region = ""
    let mutable isOnPrem = false
    Utilities.GetOrgnameAndOnlineRegionFromServiceUri(orgUrl, &region, &orgName, &isOnPrem)
    let cacheFileLocation = System.IO.Path.Combine(System.IO.Path.GetTempPath(), orgName, "oauth-cache.txt")
    let mutable proxy = new CrmServiceClient(userName, CrmServiceClient.MakeSecureString(password), region, orgName, false, null, null, mfaAppId, new Uri(mfaReturnUrl), cacheFileLocation, null)
    proxy :> IOrganizationService

// Authentication
let internal getServiceManagement org = 
    ServiceConfigurationFactory.CreateManagement<IOrganizationService>(org)

let internal authenticate (serviceManagement:IServiceManagement<IOrganizationService>) ap username password domain =
    serviceManagement.Authenticate(getCredentials ap username password domain)
  
