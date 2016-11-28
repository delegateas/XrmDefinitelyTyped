@echo off
cls

:: Set which nuget package that should be fetched
set package=Delegate.XrmDefinitelyTyped


:: Check if Paket bootstrapper exists, otherwise download latest version from GitHub
if not exist .paket\paket.bootstrapper.exe (
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "New-Item -ItemType directory -Force -Path .paket > $null; $client = New-Object System.Net.WebClient; $client.Headers.Add('User-Agent', 'Anything'); $url = $client.DownloadString('https://api.github.com/repos/fsprojects/Paket/releases/latest') | ConvertFrom-Json | Select -ExpandProperty assets | Where { $_.Name -eq 'paket.bootstrapper.exe' } | Select -ExpandProperty browser_download_url | %%{ $client.DownloadFile($_, '.paket/paket.bootstrapper.exe') }"
)

:: Run paket boostrapper to get paket.exe
.paket\paket.bootstrapper.exe
if errorlevel 1 (
    exit /b %errorlevel%
)

:: Install package
.paket\paket.exe init
.paket\paket.exe add nuget %package%
if errorlevel 1 (
  exit /b %errorlevel%
)


:: Copy all relevant files to current folder
echo %*
pushd packages
for /R %%F in (*.exe,*.dll,*.js) do (
	copy /Y "%%F" "..\%%~nxF"
)
popd


:: Clean up
del paket.dependencies paket.lock
rmdir /S /Q packages


:: Generate default .config file if one does not already exist
if not exist XrmDefinitelyTyped.exe.config (
	XrmDefinitelyTyped.exe -gc
)