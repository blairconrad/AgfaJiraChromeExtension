[CmdletBinding()]
Param ( 
    [string]$NewVersion = $(throw "NewVersion is required"),
    [string]$RemoteName = "upstream"
)

# ------------------------------------------------------------------------------

$manifestFile = "Extension/manifest.json"

# ------------------------------------------------------------------------------

Function Get-ScriptDirectory {
    Split-Path $MyInvocation.ScriptName
}

Function SetVersion ($InputFile, $Version) {
    $versionPattern = [regex]'"version"\s*:\s*"[0-9]+\.[0-9]+\.[0-9]+"'
    $newVersionText = '"version" = "' + $Version + '"'

    $text = [System.IO.File]::ReadAllText($InputFile)
    $text = $versionPattern.Replace($text, $newVersionText)
    [System.IO.File]::WriteAllText($InputFile, $text)
}

# ------------------------------------------------------------------------------

$manifestFilePath = Join-Path (Get-ScriptDirectory) $manifestFile
$branchName  = "release/$NewVersion"

Write-Host "Releasing version $NewVersion"
$response = Read-Host "  Proceed (y/N)?"
Switch ($response) {
    y { }
    n { Write-Host "Update cancelled."; return }
    Default { Write-Host "Unknown response '$response'. Aborting."; return }
}

git checkout --quiet -b  $branchName master
SetVersion $manifestFilePath $NewVersion
git commit --quiet --message "Set version to $NewVersion" $manifestFilePath
git checkout --quiet master
git merge --quiet --no-ff $branchName
git branch --delete $branchName

git tag $NewVersion
git push --tags $RemoteName HEAD
