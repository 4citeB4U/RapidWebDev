# Update Sitemap PowerShell Script
# This script runs the sitemap generator and updates the sitemap.xml file

# Set the current directory to the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Change to the project root directory
Set-Location $projectRoot

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion"
}
catch {
    Write-Host "Error: Node.js is not installed or not in the PATH. Please install Node.js to run this script."
    exit 1
}

# Run the sitemap generator
Write-Host "Running sitemap generator..."
node "$scriptDir\generate-sitemap.js"

# Check if the sitemap.xml file was created
if (Test-Path "sitemap.xml") {
    Write-Host "Sitemap generated successfully: sitemap.xml"
    
    # Optional: Validate the sitemap
    try {
        [xml]$sitemap = Get-Content "sitemap.xml"
        $urlCount = $sitemap.urlset.url.Count
        Write-Host "Sitemap is valid XML with $urlCount URLs."
    }
    catch {
        Write-Host "Warning: Sitemap validation failed. The file may not be valid XML."
        Write-Host $_.Exception.Message
    }
}
else {
    Write-Host "Error: Sitemap generation failed. The sitemap.xml file was not created."
    exit 1
}

# Optional: Ping search engines to notify them of the updated sitemap
$pingUrls = @(
    "https://www.google.com/ping?sitemap=$($config.host)/sitemap.xml",
    "https://www.bing.com/ping?sitemap=$($config.host)/sitemap.xml"
)

Write-Host "Pinging search engines..."
foreach ($url in $pingUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
        Write-Host "Pinged $url - Status: $($response.StatusCode)"
    }
    catch {
        Write-Host "Failed to ping $url - Error: $($_.Exception.Message)"
    }
}

Write-Host "Sitemap update completed."
