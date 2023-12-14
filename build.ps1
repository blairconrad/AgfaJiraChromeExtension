$extensionNameChrome = 'Agfa Jira Chrome Extension'
$extensionNameFirefox = 'Agfa Jira Firefox Extension'

# --------------

function BuildExtension($manifestFileName, $extensionName) {
    Copy-Item "Extension\$manifestFileName" -Destination "Extension\manifest.json"
    $extensionSlug = $extensionName.Replace(' ', '')
    $output = "artifacts\output\$($extensionSlug).zip"
    
    Write-Output "Zipping extension to $output..."
    .\BuildTools\7z a "$output" .\Extension\* 
    Write-Output "Zipped extension to $output."
}

BuildExtension 'manifest_chrome.json' $extensionNameChrome
BuildExtension 'manifest_firefox.json' $extensionNameFirefox
