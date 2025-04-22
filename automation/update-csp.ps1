# Update CSP PowerShell Script
# This script runs the CSP updater and updates the CSP in both the meta tag and .htaccess file

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

# Run the CSP updater
Write-Host "Running CSP updater..."
node "$scriptDir\update-csp.js"

# Check if the files were updated
$htmlFile = "index.html"
$htaccessFile = ".htaccess"

if (Test-Path $htmlFile) {
    Write-Host "HTML file updated: $htmlFile"
}
else {
    Write-Host "Error: HTML file not found: $htmlFile"
}

if (Test-Path $htaccessFile) {
    Write-Host "Htaccess file updated: $htaccessFile"
}
else {
    Write-Host "Error: Htaccess file not found: $htaccessFile"
}

Write-Host "CSP update completed."
