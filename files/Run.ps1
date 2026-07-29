Push-Location (Split-Path $SCRIPT:MyInvocation.MyCommand.Path -Parent)
try {
  dotnet .\XrmDefinitelyTyped.dll
} finally {
  Pop-Location
}
