namespace DG.XrmDefinitelyTyped

open System.Net
open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Client


module internal CrmAuth =

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
        new OrganizationServiceProxy(serviceManagement, ac.ClientCredentials)
    | _ ->
        new OrganizationServiceProxy(serviceManagement, ac.SecurityTokenResponse)

  // Authentication
  let authenticate org ap username password domain =
    let m = ServiceConfigurationFactory.CreateManagement<IOrganizationService>(org)
    let at = m.Authenticate(getCredentials ap username password domain)
    m,at

  let proxyInstance manager authToken =
    getOrganizationServiceProxy manager authToken
