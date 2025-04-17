# Generates a .md blog file with timestamp and SEO tags
$date = Get-Date -Format "yyyy-MM-dd"
$title = "AI Web Marketing Strategy - $date"
$file = "web-marketing-seo/blog-$date.md"
$content = @"
# AI Web Marketing Strategy ($date)

Discover how AI-powered websites and automation tools help your brand grow faster, rank higher, and convert smarter — all with less effort.

...

> Visit [https://rapidwebdevelop.com](https://rapidwebdevelop.com)
"@
$content | Out-File -Encoding UTF8 $file
