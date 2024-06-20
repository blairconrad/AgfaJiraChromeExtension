Function Get-Version {
    (git describe --tags) -replace '-(\d+)-.*', '.$1'
}

Filter ConvertTo-Slug {
    (
        $_ -replace '\s+', '-' `
            -replace '[^\w-]', '' `
            -replace '-+', '-' `
            -replace '^[-]+', '' `
            -replace '[-]+$', '' `
    ).ToLower()
}

Filter Build-Extension {
    $manifestFile = $_
    $manifest = Get-Content $manifestFile | ConvertFrom-Json

    $name = $manifest | Select-Object -ExpandProperty name | ConvertTo-Slug

    $browser = $manifestFile.Name -replace 'manifest_(.+)\.json', '$1'
    $buildDirectory = "artifacts/build/${name}-${browser}"
    if (Test-Path $buildDirectory) {
        Remove-Item -Recurse -Force $buildDirectory
    }

    Copy-Item -Recurse Extension $buildDirectory
    Remove-Item (Join-Path $buildDirectory manifest_*.json)
    $manifest | Add-Member -NotePropertyName 'version' -NotePropertyValue (Get-Version)
    Out-File -Encoding utf8 -InputObject ($manifest | ConvertTo-Json -Depth 10) -FilePath "$buildDirectory/manifest.json"

    New-Item -ItemType Directory -Path "artifacts/output" -Force | Out-Null
    Compress-Archive -Force -DestinationPath "artifacts/output/${name}-${browser}.zip" -Path "${buildDirectory}/*"
}

Get-ChildItem "Extension/manifest_*.json" |  Build-Extension
