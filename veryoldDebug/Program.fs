// Learn more about F# at http://fsharp.org

open System
open DG.XrmDefinitelyTyped
open DG.XrmDefinitelyTyped.FileGeneration
open Microsoft.Xrm.Sdk.Client

Environment.CurrentDirectory <- __SOURCE_DIRECTORY__


let root = __SOURCE_DIRECTORY__
  
let webResourceProject = root + @"\WebResources"
let webResourceFolder = 
    webResourceProject + @"\src" + "\hph_hplush"
let xrmTypings = webResourceProject + @"\typings\XRM"
let jslib = webResourceFolder + "\lib"

[<EntryPoint>]
let main argv =
    DG.XrmDefinitelyTyped.XrmDefinitelyTyped.GenerateFromCrm(
        "https://testhplushdk.crm4.dynamics.com/XRMServices/2011/Organization.svc", 
            "dkcrm@hplush.onmicrosoft.com", "Vutu1602", ap = AuthenticationProviderType.OnlineFederation, outDir = webResourceFolder, jsLib = jslib, 
                solutions = [|
                    "hplush"
                |], webNs = "")


    0 // return an integer exit code
