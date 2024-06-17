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
    $name = Get-Content $manifestFile | ConvertFrom-Json | Select-Object -ExpandProperty name | ConvertTo-Slug

    $browser = $manifestFile.Name -replace 'manifest_(.+)\.json', '$1'
    $buildDirectory = "artifacts/build/${name}-${browser}"
    if (Test-Path $buildDirectory) {
        Remove-Item -Recurse -Force $buildDirectory
    }

    Copy-Item -Recurse Extension $buildDirectory
    Copy-Item $manifestFile (Join-Path $buildDirectory "manifest.json")
    Remove-Item (Join-Path $buildDirectory manifest_*.json)

    New-Item -ItemType Directory -Path "artifacts/output" -Force | Out-Null
    Compress-Archive -Force -DestinationPath "artifacts/output/${name}-${browser}.zip" -Path "${buildDirectory}/*"
}

Get-ChildItem "Extension/manifest_*.json" |  Build-Extension
