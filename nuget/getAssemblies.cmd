::Find the all assemblies from the gotten packages and copy them to this folder
set mydir=%cd%
cd ../../
if exist ../content/ (
	for /R ../../ %%f in (*.dll) do copy "%%f" "%mydir%"
	goto :end
) else (
	goto :findpackages
)
:findpackages
if exist packages/ (
	for /R . %%f in (*.dll) do copy "%%f" "%mydir%"
	goto :end
) else (
	cd ..
	:: If not at root, continue
	if not "%cd:~3,1%"=="" (
		goto :findpackages
	)
)
:end
cd %mydir%