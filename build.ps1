$extensionName = 'Agfa Jira Chrome Extension'

# --------------

$extensionSlug = $extensionName.Replace(' ', '')
$output = "artifacts\output\$($extensionSlug).zip"

.\BuildTools\7z a "$output" .\Extension
