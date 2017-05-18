$extensionName = 'Agfa Jira Chrome Extension'

# --------------

$extensionSlug = $extensionName.Replace(' ', '')
$outputDirectory = 'artifacts\output'

.\BuildTools\7z a "$outputDirectory\$extensionSlug.zip" .\Extension