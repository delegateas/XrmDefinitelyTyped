@echo off
cls

WHERE nuget
if errorlevel 1 (
  echo nuget not installed. Please install with Chocolatey
  exit /b %errorlevel%
)

if not exist packages\FAKE\tools\Fake.exe (
  nuget install FAKE -OutputDirectory packages -ExcludeVersion
)
packages\FAKE\tools\FAKE.exe build.fsx %*