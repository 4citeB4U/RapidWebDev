#!/usr/bin/env node
import fs from "node:fs";

const storyPath="leeway-story.html";
const manifestPath="leeway-application.manifest.json";
const adapterPath="brain/public-project-adapter.js";
const indexPath="index.html";

for(const path of [storyPath,manifestPath,adapterPath,indexPath]){
  if(!fs.existsSync(path)) throw new Error("Missing RapidWebDevelop convergence artifact: "+path);
}

const story=fs.readFileSync(storyPath,"utf8");
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const adapter=fs.readFileSync(adapterPath,"utf8");
const index=fs.readFileSync(indexPath,"utf8");

for(const token of [
  "MOVEMENT I · IMAGINATION",
  "MOVEMENT II · THE SHOULDERS",
  "MOVEMENT III · THE QUESTION",
  "MOVEMENT IV · THE MATHEMATICS",
  "MOVEMENT V · THE LIVING SYSTEM",
  "MOVEMENT VI · GIVE THE PATH FORWARD",
  "God's Eye View · Bilawal Sidhu",
  "Formula execution state here: NOT EXECUTED",
  "AI should increase human capability, not replace human responsibility.",
  "LEEWAY_ECOSYSTEM_AUTHORITY_V1",
  "open-source-lineage-v1.json"
]){
  if(!story.includes(token)) throw new Error("LeeWay story missing required evidence token: "+token);
}

for(const token of [
  "F2 · Governance / Eligibility",
  "F3 · Routing",
  "F4 · Veritas / Evidence",
  "F5 · Recovery",
  "F6 · Resource Conservation",
  "F7 · Queue",
  "F8 · Automation",
  "F9 · Consensus",
  "F10 · Autonomy"
]){
  if(!story.includes(token)) throw new Error("LeeWay story missing Formula family: "+token);
}

if(manifest.applicationId!=="rapid-web-develop") throw new Error("RapidWebDevelop application identity drift");
if(manifest.repository?.fullName!=="4citeB4U/RapidWebDev") throw new Error("RapidWebDevelop repository identity drift");
if(manifest.repository?.commitPolicy!=="SELF_COMMIT_RESOLVED_AT_CONSUMPTION") throw new Error("RapidWebDevelop self identity must resolve at consumption");
if(manifest.runtimeBindings?.persistentExecution!=="runtime-fabric") throw new Error("RapidWebDevelop persistent execution must bind Runtime Fabric");
if(manifest.runtimeBindings?.deviceExecution!=="device-bridge") throw new Error("RapidWebDevelop device execution must bind Device Bridge");
if(manifest.evidence?.formulaExecutionClaim!=="NOT_EXECUTED_BY_APPLICATION_MANIFEST") throw new Error("RapidWebDevelop manifest must not claim Formula execution");

if(!adapter.includes("proj::leeway-story") || !adapter.includes("/leeway-story.html")){
  throw new Error("Digital Brain project universe does not expose the LeeWay story");
}
if(!index.includes("Why LeeWay") || !index.includes("/leeway-story.html")){
  throw new Error("Digital Brain top bar does not expose the Why LeeWay story");
}

const authorityUrl=manifest.publicAuthoritySources?.ecosystem;
const lineageUrl=manifest.publicAuthoritySources?.openSourceLineage;
if(!authorityUrl || !lineageUrl) throw new Error("RapidWebDevelop missing canonical public authority sources");

const [authorityResponse,lineageResponse]=await Promise.all([
  fetch(authorityUrl,{cache:"no-store"}),
  fetch(lineageUrl,{cache:"no-store"})
]);
if(!authorityResponse.ok) throw new Error("Standards authority registry unavailable: "+authorityResponse.status);
if(!lineageResponse.ok) throw new Error("Open-source lineage registry unavailable: "+lineageResponse.status);

const authority=await authorityResponse.json();
const lineage=await lineageResponse.json();
if(authority.registryId!=="LEEWAY_ECOSYSTEM_AUTHORITY_V1") throw new Error("Standards registry identity mismatch");
if((lineage.sources||[]).length<30) throw new Error("Open-source lineage coverage fell below required evidence floor");
if(!lineage.sources.some((x)=>x.repo==="bilawalsidhu/gods-eye-view"&&x.relationship==="DIRECT_LINEAGE")){
  throw new Error("God's Eye View foundational lineage missing from canonical provenance");
}

console.log(JSON.stringify({
  state:"PASS_RAPIDWEBDEVELOP_LEEWAY_STORY",
  application:manifest.applicationId,
  authorityRegistry:authority.registryId,
  authorityCount:authority.authorities?.length||0,
  upstreamRepositories:lineage.sources.length,
  foundationalLineage:"bilawalsidhu/gods-eye-view",
  formulaExecution:"NOT_EXECUTED"
},null,2));
