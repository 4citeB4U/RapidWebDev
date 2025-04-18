# PowerShell script to update pricing across all landing pages
$baseDir = "seo-keywords"
$industries = @("lawyers", "photographers", "therapists", "real-estate", "nonprofits")
$locations = @("california", "florida", "new-york", "texas", "wisconsin")
$types = @("flat-rate", "no-subscription", "one-time-fee", "under-1000", "under-500")
$durations = @("3-days", "5-days", "express", "fastest", "one-week")

# Create pricing component template
$pricingComponent = Get-Content "web-marketing-seo/pricing-component.html"

foreach ($industry in $industries) {
    foreach ($location in $locations) {
        foreach ($type in $types) {
            foreach ($duration in $durations) {
                $fileName = "$baseDir/$industry-$location-$type-$duration.html"
                if (Test-Path $fileName) {
                    Write-Host "Updating $fileName"
                    # Update file with new pricing component
                    $content = Get-Content $fileName
                    # Update pricing section
                    # Add new pricing component
                    Set-Content $fileName $content
                }
            }
        }
    }
}