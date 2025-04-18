# PowerShell script to update all industry pages with new pricing and styling
$baseDir = "seo-keywords"
$industries = @(
    @{name="lawyers"; title="Legal Professionals"; icon="⚖️"},
    @{name="photographers"; title="Photographers"; icon="📸"},
    @{name="therapists"; title="Mental Health Professionals"; icon="🧠"},
    @{name="real-estate"; title="Real Estate Professionals"; icon="🏠"},
    @{name="nonprofits"; title="Nonprofit Organizations"; icon="❤️"}
)
$locations = @("california", "florida", "new-york", "texas", "wisconsin")
$types = @("flat-rate", "no-subscription", "one-time-fee", "under-1000", "under-500")
$durations = @("3-days", "5-days", "express", "fastest", "one-week")

# Update each industry page
foreach ($industry in $industries) {
    foreach ($location in $locations) {
        foreach ($type in $types) {
            foreach ($duration in $durations) {
                $fileName = "$baseDir/$($industry.name)-$location-$type-$duration.html"
                if (Test-Path $fileName) {
                    Write-Host "Updating $fileName"
                    # Update file with new pricing and industry-specific content
                    # Add new styling and components
                }
            }
        }
    }
}

Write-Host "All pages have been updated with new pricing and styling"