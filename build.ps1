$extensionName = 'Agfa Jira Chrome Extension'
$appId = 'hmamnklhelndfigmpglijjgifibaoijf'

# --------------

$extensionSlug = $extensionName.Replace(' ', '')
$output = "artifacts\output\$($extensionSlug).zip"

.\BuildTools\7z a "$output" .\Extension

# --------------
# The following was lightly adapted from SilverC/Study-Helper-Extension:
# https://github.com/SilverC/Study-Helper-Extension/blob/5b7bd4df7e3e5eec02d9af2b50bff1795e0597fd/scripts/chrome-vsts-deploy.ps1

$body = @{
    refresh_token = $env:REFRESH_TOKEN
    client_id = $env:CLIENT_ID
    client_secret = $env:CLIENT_SECRET
    grant_type = "refresh_token"
}

Write-Output "Requesting new access token from Google...."
$response = Invoke-RestMethod -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body -Uri "https://www.googleapis.com/oauth2/v4/token"
Write-Output "Request for new access token was successful"
$token = $response.access_token

$headers = @{}
$headers.Add("Authorization", "Bearer $($token)")
$headers.Add("x-goog-api-version", "2")

Write-Output "Submitting new version of the extension to the store"
$response = Invoke-RestMethod -Method Put -Headers $headers -InFile $output -Uri "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$($appId)"
if($response.uploadState -ne "SUCCESS") {
    throw "Submitting new version failed `n error code= $($response.itemError.error_code) `n error= $($response.itemError.error_detail) `n"
    
}
Write-Output "Submission of new version successful. Item is in draft state in the Chrome Web Store"

Write-Output "Attempting to publish new version to Chrome Web Store"
$response = Invoke-RestMethod -Method Post -Headers $headers -Uri "https://www.googleapis.com/chromewebstore/v1.1/items/$appId/publish"
Write-Output $response
Write-Output "Publish of new version successful"
