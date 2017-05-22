open System.Diagnostics

let shellExecute program args =
  let startInfo = new ProcessStartInfo()
  startInfo.FileName <- program
  startInfo.Arguments <- args
  startInfo.UseShellExecute <- true

  let proc = Process.Start(startInfo)
  proc.WaitForExit()
  ()

shellExecute (__SOURCE_DIRECTORY__ + "/XrmDefinitelyTyped.exe") ""