[CmdletBinding()]
Param (
    [string]$NewVersion = $(throw "NewVersion is required"),
    [string]$RemoteName = "upstream"
)

# ------------------------------------------------------------------------------

Function Get-ScriptDirectory {
    Split-Path $MyInvocation.ScriptName
}

Function SetVersion ($InputFile, $Version) {
    $versionPattern = [regex]'"version"\s*:\s*"[0-9]+\.[0-9]+\.[0-9]+"'
    $newVersionText = '"version" : "' + $Version + '"'

    $text = [System.IO.File]::ReadAllText($InputFile)
    $text = $versionPattern.Replace($text, $newVersionText)
    [System.IO.File]::WriteAllText($InputFile, $text)
}

# ------------------------------------------------------------------------------
$ErrorActionPreference = "Stop"

$allRemotes = git remote

if (! $allRemotes.Contains($RemoteName)) {
    throw "'$RemoteName' is not a valid remote name. Aborting."
}

Write-Host "Releasing version $NewVersion"
$response = Read-Host "  Proceed (y/N)?"
Switch ($response) {
    y { }
    n { Write-Host "Update cancelled."; return }
    Default { Write-Host "Unknown response '$response'. Aborting."; return }
}

git fetch $RemoteName master
git checkout master
git reset --hard $RemoteName/master

$branchName = "release/$NewVersion"

git checkout --quiet -b  $branchName master

Get-ChildItem "Extension/manifest_*.json" | ForEach-Object {
    SetVersion $_ $NewVersion
    git add $_
}

git commit --quiet --message "Set version to $NewVersion"
git checkout --quiet master
git merge --quiet --no-ff $branchName
git branch --delete $branchName

git tag $NewVersion
git push --tags $RemoteName HEAD
