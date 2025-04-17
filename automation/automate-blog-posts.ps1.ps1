# === CONFIG ===
$projectRoot = "A:\rwb llc"
$blogSrc = "$projectRoot\blog-scheduled-posts"
$blogDest = "$projectRoot\web-marketing-seo"
$sitemapPath = "$projectRoot\sitemap.xml"
$today = Get-Date -Format "yyyy-MM-dd"

# === 1. Move Today's Markdown File ===
$mdFile = "$blogSrc\blog-$today.md"
if (Test-Path $mdFile) {
    Copy-Item $mdFile -Destination $blogDest
    Write-Host "✅ Copied blog-$today.md to $blogDest"
} else {
    Write-Host "⚠️ No blog file found for today: $mdFile"
    exit
}

# === 2. Convert Markdown to HTML ===
$mdContent = Get-Content "$blogDest\blog-$today.md" -Raw

$htmlBody = $mdContent `
    -replace '# (.+)', '<h1>$1</h1>' `
    -replace '## (.+)', '<h2>$1</h2>' `
    -replace '\* (.+)', '<li>$1</li>' `
    -replace '\> (.+)', '<blockquote>$1</blockquote>' `
    -replace '\[(.+)\]\((.+)\)', '<a href="$2">$1</a>'

$htmlTemplate = @"
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>AI Web Marketing Strategy - $today</title>
</head>
<body>
$htmlBody
</body>
</html>
"@

$htmlFile = "$blogDest\blog-$today.html"
$htmlTemplate | Out-File -Encoding UTF8 $htmlFile
Write-Host "✅ Converted blog-$today.md to blog-$today.html"

# === 3. Update sitemap.xml ===
$sitemapEntries = @()
$sitemapEntries += "<?xml version='1.0' encoding='UTF-8'?>"
$sitemapEntries += "<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>"

Get-ChildItem -Path $projectRoot -Filter *.html -Recurse | ForEach-Object {
    $urlPath = $_.FullName.Replace($projectRoot, "").Replace("\", "/").TrimStart("/")
    $loc = "https://rapidwebdevelop.com/$urlPath"
    $lastmod = (Get-Date $_.LastWriteTime).ToString("yyyy-MM-dd")
    $sitemapEntries += "  <url><loc>$loc</loc><lastmod>$lastmod</lastmod></url>"
}
$sitemapEntries += "</urlset>"

$sitemapEntries | Out-File -Encoding UTF8 $sitemapPath
Write-Host "✅ sitemap.xml updated"

# === 4. Git Push Everything ===
Set-Location $projectRoot
git add .
git commit -m "Auto blog post for $today and sitemap update"
git push origin main
Write-Host "✅ Changes pushed to GitHub"

# === Done ===
Write-Host "🎉 Daily blog post automation complete!"
