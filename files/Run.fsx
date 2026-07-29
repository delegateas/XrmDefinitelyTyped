open System.Diagnostics
open System.IO

let assemblyPath = Path.Combine(__SOURCE_DIRECTORY__, "XrmDefinitelyTyped.dll")
let startInfo = ProcessStartInfo("dotnet")
startInfo.ArgumentList.Add(assemblyPath)
startInfo.UseShellExecute <- false

use proc = Process.Start(startInfo)
proc.WaitForExit()
if proc.ExitCode <> 0 then
  failwithf "XrmDefinitelyTyped returned exit code %d" proc.ExitCode
