$ErrorActionPreference='Continue'
$owner='4citeB4U'
$out='E:\LeeWay-Intellectual-Estate\.runtime\rapidwebdev-worktree\brain\github-project-catalog.json'
$repos=gh repo list $owner --limit 200 --json name,description,url,visibility,isPrivate,isArchived,createdAt,updatedAt,homepageUrl,diskUsage,primaryLanguage | ConvertFrom-Json
function Get-Family([string]$n){
 $s=$n.ToLowerInvariant()
 if($s -match 'leola|library|crochet'){return 'Leola / Publishing'}
 if($s -match 'rapid|jump.?off|influencer|webportfolio|artistshowcase|portfolio'){return 'Rapid Web Develop / Creative'}
 if($s -match 'truck|logistics|always'){return 'Logistics / Transportation'}
 if($s -match 'legal|contract'){return 'Legal / Contracts'}
 if($s -match 'training|academic|statuscpr|course|school'){return 'Education / Training'}
 if($s -match 'beast|navneet'){return 'Beast AI / Client'}
 if($s -match 'gamer|gaming|leo.?s|leosinsight'){return 'Gaming / Community'}
 if($s -match 'blackbook|milwaukee'){return 'Community / Business'}
 if($s -match 'formula|standard|runtime|device|edge|bridge|vscode|agent.?skills|federate|cerebral'){return 'LeeWay Core'}
 if($s -match 'agent.?lee|agentic|agentx|assistant.?lee'){return 'Agent Lee / Agentic Systems'}
 return 'Business / Client / Experimental'
}
$rows=@()
foreach($repo in $repos){
 $pages=$null
 try{$pages=gh api "repos/$owner/$($repo.name)/pages" 2>$null | ConvertFrom-Json}catch{}
 $lang=''
 try{$lang=$repo.primaryLanguage.name}catch{}
 $rows += [ordered]@{
   name=$repo.name
   description=if($repo.description){$repo.description}else{''}
   family=Get-Family $repo.name
   repository_url=$repo.url
   visibility=$repo.visibility
   is_private=[bool]$repo.isPrivate
   is_archived=[bool]$repo.isArchived
   created_at=$repo.createdAt
   updated_at=$repo.updatedAt
   disk_usage_kb=$repo.diskUsage
   primary_language=$lang
   homepage_url=if($repo.homepageUrl){$repo.homepageUrl}else{''}
   pages_url=if($pages){$pages.html_url}else{''}
   pages_status=if($pages){$pages.status}else{''}
 }
}
$payload=[ordered]@{
 generated_at=(Get-Date).ToUniversalTime().ToString('o')
 owner=$owner
 count=$rows.Count
 public_count=@($rows|Where-Object{-not $_.is_private}).Count
 private_count=@($rows|Where-Object{$_.is_private}).Count
 pages_count=@($rows|Where-Object{$_.pages_url}).Count
 projects=$rows
}
$payload|ConvertTo-Json -Depth 8|Set-Content -LiteralPath $out -Encoding UTF8
Write-Output ($payload|ConvertTo-Json -Depth 3)
