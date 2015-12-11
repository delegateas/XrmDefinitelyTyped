param($installPath, $toolsPath, $package, $project)

$sampleFolder = "bin\dgtools"
$dest = "{0}\{1}\" -f $project.Name, $sampleFolder

write-host "Copying required .dll and .xml files to scripts folder:" $dest

dir "$installPath\content" -Recurse -include *.dll,*.xml,*.exe | 
    ? { -not $_.PSIsContainer } | 
    Select -ExpandProperty FullName |
    Copy-Item -ErrorAction SilentlyContinue -Dest $dest

foreach ($dep in $package.DependencySets.Dependencies) {
    $path = "{0}\{1}*\lib" -f (get-item $installPath).parent.FullName, $dep.Id

    dir $path -Recurse -include *.dll,*.xml | 
        ? { -not $_.PSIsContainer } | 
        Select -ExpandProperty FullName |
        Copy-Item -ErrorAction SilentlyContinue -Dest $dest
}