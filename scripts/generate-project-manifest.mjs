import fs from "node:fs";
import crypto from "node:crypto";
const owner=process.env.LEEWAY_GITHUB_OWNER||"4citeB4U";
const token=process.env.GITHUB_TOKEN||"";
const headers={Accept:"application/vnd.github+json","User-Agent":"LeeWay-Project-Manifest/1.0"};
if(token)headers.Authorization="Bearer "+token;
const repos=[];
for(let page=1;page<=5;page++){
  const r=await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&page=${page}&type=owner&sort=updated`,{headers});
  if(!r.ok)throw new Error(`GitHub API ${r.status}: ${await r.text()}`);
  const rows=await r.json(); if(!rows.length)break;
  repos.push(...rows.filter(x=>x.owner?.login===owner&&!x.private));
  if(rows.length<100)break;
}
const cleaned=repos.map(r=>({
  id:r.id,name:r.name,description:r.description,html_url:r.html_url,homepage:r.homepage||null,
  has_pages:Boolean(r.has_pages),default_branch:r.default_branch||"main",language:r.language||null,
  size:r.size||0,created_at:r.created_at,updated_at:r.updated_at,pushed_at:r.pushed_at,
  archived:Boolean(r.archived),fork:Boolean(r.fork)
})).sort((a,b)=>a.name.localeCompare(b.name));
const canonical=JSON.stringify(cleaned);
const source_hash=crypto.createHash("sha256").update(canonical).digest("hex");
const path="brain/generated-projects.json";
let prior=null;try{prior=JSON.parse(fs.readFileSync(path,"utf8"))}catch{}
if(prior?.source_hash===source_hash){
  console.log(`No project-manifest change (${cleaned.length} repos).`);
  process.exit(0);
}
const out={schema:"leeway-public-project-manifest-v1",owner,count:cleaned.length,generated_at:new Date().toISOString(),source_hash,repositories:cleaned};
fs.writeFileSync(path,JSON.stringify(out,null,2)+"\n","utf8");
console.log(`Updated ${path}: ${cleaned.length} public repositories.`);