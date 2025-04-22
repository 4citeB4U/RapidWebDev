param()  # no parameters, just guard for dot‑sourcing oddities

# 1. Figure out the root folder
$RootPath = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$rootClean = $RootPath.TrimEnd('\','/')

# 2. Where to save
$OutputFile = Join-Path $rootClean 'sitemap.xml'

# 3. Gather pages
$pages = Get-ChildItem -Path $rootClean -Recurse -Include *.html

# 4. Build XML
[xml]$doc = New-Object System.Xml.XmlDocument
$urlset = $doc.CreateElement('urlset')
$urlset.SetAttribute('xmlns','http://www.sitemaps.org/schemas/sitemap/0.9')
$doc.AppendChild($urlset) > $null

foreach ($page in $pages) {
  $rel = $page.FullName.Substring($rootClean.Length).TrimStart('\','/')
  $loc = "https://rapidwebdevelop.com/$($rel -replace '\\','/')"

  $urlElem = $doc.CreateElement('url')
  $locElem = $doc.CreateElement('loc');  $locElem.InnerText = $loc
  $modElem = $doc.CreateElement('lastmod'); $modElem.InnerText = $page.LastWriteTimeUtc.ToString('yyyy-MM-dd')

  $urlElem.AppendChild($locElem)  | Out-Null
  $urlElem.AppendChild($modElem)  | Out-Null
  $urlset.AppendChild($urlElem)   | Out-Null
}

# 5. Save & report
$doc.Save($OutputFile)
Write-Host "✅ Sitemap written to $OutputFile ($($pages.Count) URLs)."
