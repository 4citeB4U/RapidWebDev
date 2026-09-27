(()=>{
"use strict";
const CURATED_PROJECTS=[{"id":"proj::rapid-original","label":"Rapid Web Develop — MacMillion / Artist Platform","desc":"Original brother-dedicated artist empowerment experience preserved as a complete project exhibit.","group":"Business / Web","url":"/projects/rapid-web-develop-original/","repo":"https://github.com/4citeB4U/RapidWebDev","date":"2025","evidence":"LIVE"},{"id":"proj::leola","label":"Leola's Library","desc":"Interactive digital library and audiobook experience centered on Leola's crochet books and narrated learning.","group":"Publishing / Education","url":"https://4citeb4u.github.io/leolasliabrary/","repo":"https://github.com/4citeB4U/leolasliabrary","date":"2026","evidence":"LIVE"},{"id":"proj::agent","label":"Agent Lee — Sum of All Systems","desc":"Consolidated Agent Lee sovereign operating system lineage.","group":"Agentic Systems","url":"","repo":"https://github.com/4citeB4U/Agent-Lee-The-Sum-of-All-Systems","date":"2026","evidence":"SOURCE"},{"id":"proj::formula","label":"LeeWay Formula","desc":"Mathematical state, routing, quantization and evidence architecture.","group":"Scientific Research","url":"","repo":"https://github.com/4citeB4U/Leeway-formula-live","date":"2026","evidence":"CANONICAL"},{"id":"proj::standards","label":"LeeWay Standards","desc":"Governance, authority, receipts and sovereign architecture standards.","group":"Governance","url":"","repo":"https://github.com/4citeB4U/LeeWay-Standards","date":"2026","evidence":"CANONICAL"},{"id":"proj::runtime","label":"LeeWay Runtime Fabric","desc":"Governed execution substrate, runtime kernel and capability fabric.","group":"Runtime","url":"","repo":"https://github.com/4citeB4U/Leeway-Runtime-Fabric","date":"2026","evidence":"SOURCE"},{"id":"proj::skills","label":"LeeWay Agent Skills","desc":"Agent skill registry and MCP capability library.","group":"Capabilities","url":"","repo":"https://github.com/4citeB4U/LeeWay-Agent-Skills","date":"2026","evidence":"SOURCE"},{"id":"proj::device","label":"LeeWay Device Bridge","desc":"Governed bridge for phones and cross-device interaction.","group":"Devices","url":"","repo":"https://github.com/4citeB4U/LEEWAY-DEVICE-BRIDGE","date":"2026","evidence":"SOURCE"},{"id":"proj::edgegpu","label":"LeeWay Edge GPU","desc":"Local WebGPU and edge-compute research and execution layer.","group":"Compute","url":"","repo":"https://github.com/4citeB4U/LeeWay-Edge-GPU","date":"2026","evidence":"SOURCE"},{"id":"proj::edgertc","label":"LeeWay Edge RTC","desc":"Self-hosted RTC and voice orchestration system.","group":"Voice / Realtime","url":"","repo":"https://github.com/4citeB4U/LeeWay-Edge-RTC","date":"2026","evidence":"SOURCE"},{"id":"proj::vscode","label":"LeeWay VS Code","desc":"Governed creator/developer workspace for Agent Lee and LeeWay systems.","group":"Developer Tools","url":"","repo":"https://github.com/4citeB4U/LEEWAY-VSCODE","date":"2026","evidence":"SOURCE"},{"id":"proj::training","label":"LeeWay Training","desc":"AI workforce readiness and training platform.","group":"Education","url":"","repo":"https://github.com/4citeB4U/Leeway-Training","date":"2026","evidence":"SOURCE"},{"id":"proj::legal","label":"LeeWay Legal Contract System","desc":"Governed legal operations and contract workflow platform.","group":"Legal","url":"","repo":"https://github.com/4citeB4U/Leeway_legal_contract_system","date":"2026","evidence":"SOURCE"},{"id":"proj::truckforms","label":"TruckForms","desc":"Trucking forms, compliance and operational workflow SaaS.","group":"Logistics","url":"","repo":"https://github.com/4citeB4U/TruckForms","date":"2026","evidence":"SOURCE"},{"id":"proj::lex","label":"LEX Operations Center","desc":"AI-assisted career, document, task and life operations center.","group":"Operations","url":"","repo":"https://github.com/4citeB4U/LEXOPSCENTER","date":"2026","evidence":"SOURCE"},{"id":"proj::content","label":"LeeWay Agentic Content Foundry","desc":"Node-based agentic content production and orchestration environment.","group":"Creative AI","url":"","repo":"https://github.com/4citeB4U/Leeway-agentic-content-foundry","date":"2026","evidence":"SOURCE"},{"id":"proj::author","label":"LeeWay Author Marketing Agent","desc":"Agentic publishing and author marketing workforce.","group":"Publishing","url":"","repo":"https://github.com/4citeB4U/LEEWAY-Author-Marketing-Agent","date":"2026","evidence":"SOURCE"},{"id":"proj::blackbook","label":"The Black Book of Milwaukee","desc":"Milwaukee business/community directory project.","group":"Community / Business","url":"","repo":"https://github.com/4citeB4U/TheBlackBookofMilwaukee","date":"2026","evidence":"SOURCE"},{"id":"proj::safety","label":"UVision Safety App","desc":"Mobile/web incident, sensor and safety application architecture.","group":"Safety","url":"","repo":"https://github.com/4citeB4U/uvision-safety-app","date":"2026","evidence":"SOURCE"},{"id":"proj::resume","label":"Leonard Lee Resume","desc":"Live professional resume summarizing systems, operations and AI work.","group":"Professional","url":"https://4citeb4u.github.io/Leonard-Lee-Resume/","repo":"https://github.com/4citeB4U/Leonard-Lee-Resume","date":"2026","evidence":"LIVE"},{"id":"proj::beast","label":"Beast AI Website","desc":"Public Beast AI website and portfolio work.","group":"Client / Brand","url":"","repo":"https://github.com/4citeB4U/beast-ai-web-site","date":"2026","evidence":"SOURCE"},{"id":"proj::leo","label":"Leo's Insight","desc":"Gaming, development and learning/community platform.","group":"Gaming","url":"","repo":"https://github.com/4citeB4U/leosinsight","date":"2026","evidence":"SOURCE"}];
const GITHUB_PROJECTS=Array.isArray(window.__LEEWAY_GITHUB_PROJECTS)?window.__LEEWAY_GITHUB_PROJECTS:[];
const PROJECTS=(()=>{
  const out=CURATED_PROJECTS.map(x=>({...x}));
  const byRepo=new Map();
  out.forEach((p,i)=>{if(p.repo)byRepo.set(String(p.repo).toLowerCase(),i)});
  for(const raw of GITHUB_PROJECTS){
    const g={...raw};
    const repoKey=String(g.repo||"").toLowerCase();
    const idx=repoKey&&byRepo.has(repoKey)?byRepo.get(repoKey):-1;
    if(idx>=0){
      const p=out[idx];
      p.url=p.url||g.url||"";
      p.date=p.date||g.date||"";
      p.created_at=g.created_at||p.created_at||"";
      p.updated_at=g.updated_at||p.updated_at||"";
      p.language=g.language||p.language||"";
      p.is_private=!!g.is_private;
      if(g.is_private)p.repo="";
      if(g.evidence==="LIVE")p.evidence="LIVE";
    }else{
      if(g.is_private)g.repo="";
      out.push(g);
      if(g.repo)byRepo.set(String(g.repo).toLowerCase(),out.length-1);
    }
  }
  return out;
})();
const EVIDENCE=[{"id":"evidence::gov-blueprint","label":"LeeWay AI Governance Blueprint","type":"PowerPoint","url":"/leeway-brain/evidence/leeway-ai-governance-blueprint.pptx","desc":"Governance presentation artifact."},{"id":"evidence::sovereign-standard","label":"LeeWay Sovereign Standard","type":"PowerPoint","url":"/leeway-brain/evidence/leeway-sovereign-standard.pptx","desc":"Sovereign architecture presentation."},{"id":"evidence::ai-standard","label":"The LeeWay AI Standard","type":"PowerPoint","url":"/leeway-brain/evidence/leeway-ai-standard.pptx","desc":"AI standard presentation."},{"id":"evidence::workforce","label":"Workforce AI Readiness Workflow","type":"Infographic","url":"/leeway-brain/evidence/workforce-ai-readiness.png","desc":"Workforce readiness and governance visual."},{"id":"evidence::enterprise","label":"Enterprise AI Governance Architecture","type":"Infographic","url":"/leeway-brain/evidence/enterprise-ai-governance-architecture.png","desc":"Enterprise governance architecture visual."},{"id":"evidence::risk","label":"AI Risk and Governance Framework","type":"Infographic","url":"/leeway-brain/evidence/ai-risk-governance-framework.png","desc":"AI risk and governance framework."},{"id":"evidence::sovereign-image","label":"Sovereign AI Governance Architecture","type":"Infographic","url":"/leeway-brain/evidence/sovereign-ai-governance-architecture.png","desc":"Sovereign AI governance architecture visual."},{"id":"evidence::privacy","label":"Privacy-Governed AI Workflow","type":"Infographic","url":"/leeway-brain/evidence/privacy-governed-ai-workflow.png","desc":"Privacy-governed AI workflow architecture."}];
const PMAP=Object.fromEntries(PROJECTS.map(x=>[x.id,x]));
const EMAP=Object.fromEntries(EVIDENCE.map(x=>[x.id,x]));
window.__LEEWAY_PUBLIC_PROJECTS=PROJECTS;
window.__LEEWAY_PUBLIC_EVIDENCE=EVIDENCE;

const projectArchive={id:"project::archive",label:"PROJECTS / BUILT WORK",description:"Explore Leonard Lee's deployed systems, software, research platforms and business work.",domain:"fs",type:"directory",subtype:"portfolio",status:"active",parent_id:"scope::hemi::L",scope_id:"scope::hemi::L",source:"LeeWay public project projection",source_path:"projects",expandable:true,child_count:PROJECTS.length};
const evidenceArchive={id:"evidence::archive",label:"EVIDENCE / RESEARCH",description:"PowerPoints, infographics, research artifacts, receipts and visual development history.",domain:"fs",type:"directory",subtype:"evidence",status:"active",parent_id:"scope::hemi::R",scope_id:"scope::hemi::R",source:"LeeWay public evidence projection",source_path:"evidence",expandable:true,child_count:EVIDENCE.length};

const projectNodes=PROJECTS.map((p,i)=>({
 id:p.id,label:p.label,description:p.desc,domain:"fs",type:"file",subtype:"project",status:"active",
 parent_id:"project::archive",scope_id:"project::archive",source:"LeeWay project evidence",source_path:"projects/"+p.id.replace(/::/g,"-")+".md",
 expandable:false,child_count:0,region:p.group,cluster:p.group,brain_address:"PROJECT-"+String(i+1).padStart(3,"0")
}));
const evidenceNodes=EVIDENCE.map((e,i)=>({
 id:e.id,label:e.label,description:e.desc,domain:"fs",type:"file",subtype:e.type.toLowerCase(),status:"active",
 parent_id:"evidence::archive",scope_id:"evidence::archive",source:"LeeWay visual evidence",source_path:e.url,
 expandable:false,child_count:0,region:"Evidence",cluster:e.type,brain_address:"EVIDENCE-"+String(i+1).padStart(3,"0")
}));

const links=[
 ...PROJECTS.filter(p=>p.id==="proj::formula").map(p=>({source:p.id,target:"arch::formula",predicate:"IMPLEMENTS"})),
 ...PROJECTS.filter(p=>p.id==="proj::standards").map(p=>({source:p.id,target:"arch::standards",predicate:"GOVERNS"})),
 ...PROJECTS.filter(p=>p.id==="proj::agent").map(p=>({source:p.id,target:"arch::agent-lee",predicate:"REPRESENTS"})),
 {source:"proj::runtime",target:"runtime::nexus",predicate:"EXECUTES"},
 {source:"proj::skills",target:"arch::agent-lee",predicate:"EXTENDS"},
 {source:"proj::device",target:"arch::agent-lee",predicate:"CONNECTS"}
];

const graph={nodes:[projectArchive,evidenceArchive,...projectNodes,...evidenceNodes],links};
const org={
 identity:"LeeWay Industries / Leonard Lee Public Project Brain",
 host_paths_are_deployment_evidence:false,
 systems:[
   {key:"projects",graph_id:"project::archive",graph_present:true,label:"Projects / Built Work",bindings:[]},
   {key:"evidence",graph_id:"evidence::archive",graph_present:true,label:"Evidence / Research",bindings:[]}
 ]
};
const inventory={identity:"PUBLIC_PROJECT_BRAIN",projects:PROJECTS.length,evidence:EVIDENCE.length,total:PROJECTS.length+EVIDENCE.length};
const rootEntries=[
 {name:"PROJECTS / BUILT WORK",path:"projects",type:"directory",kind:"directory",child_count:PROJECTS.length,mime:"application/x-leeway-projects"},
 {name:"EVIDENCE / RESEARCH",path:"evidence",type:"directory",kind:"directory",child_count:EVIDENCE.length,mime:"application/x-leeway-evidence"}
];

function responseJson(v){return Promise.resolve(new Response(JSON.stringify(v),{status:200,headers:{"Content-Type":"application/json"}}));}
function responseText(v,type="text/plain"){return Promise.resolve(new Response(v,{status:200,headers:{"Content-Type":type}}));}
function detailsForPath(path){
 const p=PROJECTS.find(x=>"projects/"+x.id.replace(/::/g,"-")+".md"===path);
 if(p)return "# "+p.label+"\n\n"+p.desc+"\n\nGroup: "+p.group+"\nDate: "+p.date+"\nEvidence: "+p.evidence+"\n\nLive: "+(p.url||"Not published") +"\nRepository: "+(p.repo||"Not public");
 const e=EVIDENCE.find(x=>x.url===path);
 if(e)return "# "+e.label+"\n\n"+e.desc+"\n\nType: "+e.type+"\nPublic artifact: "+e.url;
 return "Public project evidence record.";
}
const NativeEventSource=window.EventSource;
class LeeWayPublicEventSource{
  constructor(url){this.url=url;this.readyState=1;setTimeout(()=>this.onopen?.({type:"open"}),120);}
  close(){this.readyState=2}
  addEventListener(type,fn){if(type==="open")setTimeout(()=>fn({type:"open"}),120)}
  removeEventListener(){}
}
if(NativeEventSource){
  window.EventSource=function(url,...args){
    if(String(url).includes("/brain/events"))return new LeeWayPublicEventSource(url);
    return new NativeEventSource(url,...args);
  };
}
const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
 const raw=typeof input==="string"?input:(input&&input.url)||"";
 const u=new URL(raw,location.origin);
 if(u.origin===location.origin){
   if(u.pathname==="/brain/graph.json")return responseJson(graph);
   if(u.pathname==="/brain/organization")return responseJson(org);
   if(u.pathname==="/brain/inventory")return responseJson(inventory);
   if(u.pathname==="/brain/static/formula-v2-candidate.metadata.json")return responseJson({status:"PUBLIC REFERENCE",authority:"Leeway-formula-live",claim_class:"PUBLIC PROJECTION"});
   if(u.pathname==="/brain/files/content")return responseText(detailsForPath(u.searchParams.get("path")||""));
   if(u.pathname==="/brain/files"){
      if(u.searchParams.get("count_only")==="true")return responseJson({files:PROJECTS.length+EVIDENCE.length,directories:2,total:PROJECTS.length+EVIDENCE.length+2});
      const path=u.searchParams.get("path")||"";
      if(!path)return responseJson({items:rootEntries,entries:rootEntries,files:0,directories:2,total:2});
      if(path==="projects"){
         const items=PROJECTS.map(p=>({name:p.label,path:"projects/"+p.id.replace(/::/g,"-")+".md",type:"file",kind:"file",mime:"text/markdown",size:0}));
         return responseJson({items,entries:items,files:items.length,directories:0,total:items.length});
      }
      if(path==="evidence"){
         const items=EVIDENCE.map(e=>({name:e.label,path:e.url,type:"file",kind:"file",mime:e.type==="Infographic"?"image/png":"application/vnd.openxmlformats-officedocument.presentationml.presentation",size:0}));
         return responseJson({items,entries:items,files:items.length,directories:0,total:items.length});
      }
      return responseJson({items:[],entries:[],files:0,directories:0,total:0});
   }
 }
 return nativeFetch(input,init);
};

function installNarrator(){
 if(document.getElementById("leePublicNarrator"))return;
 const style=document.createElement("style");
 style.textContent=`
 #leePublicNarrator{position:fixed;right:18px;bottom:18px;width:min(360px,calc(100vw - 36px));z-index:10050;border:1px solid rgba(80,230,255,.5);border-radius:18px;background:linear-gradient(180deg,rgba(5,16,29,.96),rgba(2,8,16,.98));box-shadow:0 22px 70px rgba(0,0,0,.55),0 0 32px rgba(80,230,255,.11);backdrop-filter:blur(18px);color:#eef7ff;font:12px/1.5 system-ui,sans-serif;overflow:hidden}
 .leeNarrHead{display:flex;align-items:center;gap:11px;padding:12px 14px;border-bottom:1px solid rgba(80,230,255,.18)}
 .leeNarrHead img{width:38px;height:38px;border-radius:50%;object-fit:cover;border:1px solid rgba(80,230,255,.5)}
 .leeNarrHead b{display:block;font-size:12px}.leeNarrHead small{color:#6f8ba4}
 .leeNarrBody{padding:13px 14px;color:#abc0d2;max-height:190px;overflow:auto}
 .leeNarrActions{display:flex;gap:8px;flex-wrap:wrap;padding:0 14px 14px}
 .leeNarrActions a,.leeNarrActions button{border:1px solid rgba(80,230,255,.32);border-radius:9px;background:rgba(80,230,255,.08);color:#dff8ff;padding:7px 9px;text-decoration:none;font:700 10px system-ui;cursor:pointer}
 #leeProjectViewer{position:fixed;inset:16px;z-index:20000;border:1px solid rgba(80,230,255,.55);border-radius:20px;background:#02060c;box-shadow:0 30px 120px rgba(0,0,0,.82);overflow:hidden;display:none}
 #leeProjectViewer.open{display:grid;grid-template-rows:54px 1fr}
 .leeProjectViewerBar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;background:rgba(4,13,23,.98);border-bottom:1px solid rgba(80,230,255,.2)}
 .leeProjectViewerBar strong{font-size:12px}.leeProjectViewerBar span{font-size:9px;color:#7993aa}
 .leeProjectViewerBar div:last-child{display:flex;gap:8px}
 .leeProjectViewerBar a,.leeProjectViewerBar button{border:1px solid rgba(80,230,255,.3);border-radius:9px;background:#07131e;color:#eaf8ff;padding:7px 10px;text-decoration:none;font:700 10px system-ui;cursor:pointer}
 #leeProjectFrame{width:100%;height:100%;border:0;background:#fff}
 `;
 document.head.appendChild(style);
 const el=document.createElement("aside");
 el.id="leePublicNarrator";
 el.innerHTML=`<div class="leeNarrHead"><img src="/98civa4fmf.png" alt="Agent Lee"><div><b>Agent Lee · Project Guide</b><small>LeeWay Digital Brain</small></div></div><div class="leeNarrBody" id="leeNarrText">Welcome. This Digital Brain is Leonard Lee's explorable body of work. Scroll, zoom, enter the Projects or Evidence universes, and select a node. I will explain what it is and where the evidence lives.</div><div class="leeNarrActions" id="leeNarrActions"><button type="button" data-lee-open="/projects/rapid-web-develop-original/" data-lee-title="Rapid Web Develop — MacMillion / Artist Platform">View original Rapid Web Develop</button></div>`;
 document.body.appendChild(el);
 const viewer=document.createElement("section");
 viewer.id="leeProjectViewer";
 viewer.innerHTML=`<div class="leeProjectViewerBar"><div><strong id="leeProjectViewerTitle">Project Exhibit</strong><br><span>LeeWay Digital Brain · framed work view</span></div><div><a id="leeProjectViewerExternal" target="_blank" rel="noopener">Open separately</a><button type="button" id="leeProjectViewerClose">Close</button></div></div><iframe id="leeProjectFrame" title="LeeWay project exhibit"></iframe>`;
 document.body.appendChild(viewer);
 document.getElementById("leeProjectViewerClose").onclick=()=>{viewer.classList.remove("open");document.getElementById("leeProjectFrame").src="about:blank"};
 document.addEventListener("click",ev=>{
   const b=ev.target.closest?.("[data-lee-open]");
   if(!b)return;
   const url=b.getAttribute("data-lee-open"),title=b.getAttribute("data-lee-title")||"Project Exhibit";
   document.getElementById("leeProjectViewerTitle").textContent=title;
   document.getElementById("leeProjectViewerExternal").href=url;
   document.getElementById("leeProjectFrame").src=url;
   viewer.classList.add("open");
 },true);
}
function showNarrator(id){
 installNarrator();
 const p=PMAP[id],e=EMAP[id],t=document.getElementById("leeNarrText"),a=document.getElementById("leeNarrActions");
 if(p){
   t.textContent=p.desc+" This project belongs to "+p.group+" and is classified here as "+p.evidence+" evidence.";
   a.innerHTML=(p.url?`<button type="button" data-lee-open="${p.url}" data-lee-title="${p.label.replace(/"/g,"&quot;")}">Open project in frame</button>`:"")+(p.repo?`<a href="${p.repo}" target="_blank" rel="noopener">GitHub source</a>`:"");
 }else if(e){
   t.textContent=e.desc+" This is a public visual evidence artifact in the LeeWay research history.";
   a.innerHTML=`<button type="button" data-lee-open="${e.url}" data-lee-title="${e.label.replace(/"/g,"&quot;")}">Open evidence in frame</button>`;
 }else if(id==="project::archive"){
   t.textContent="Projects / Built Work contains Leonard Lee's deployed systems, client work, products, research platforms and public source repositories.";
   a.innerHTML=`<button type="button" data-lee-open="/projects/rapid-web-develop-original/" data-lee-title="Rapid Web Develop — MacMillion / Artist Platform">Original Rapid Web Develop exhibit</button>`;
 }else if(id==="evidence::archive"){
   t.textContent="Evidence / Research contains visual proof objects—presentations, infographics and research artifacts—that document how the LeeWay body of work developed.";
   a.innerHTML="";
 }
}
function relabel(){
 const inv=document.getElementById("inventoryStatus");
 if(inv)inv.textContent=`PROJECTS ${PROJECTS.length} · EVIDENCE ${EVIDENCE.length}`;
 document.querySelectorAll(".filesystemCarouselSearch").forEach(x=>x.placeholder="Search projects and evidence...");
 document.querySelectorAll(".filesystemCarouselTitle").forEach(x=>{
   if(/matrix|grid|cluster|galaxy/i.test(x.textContent||"")) x.title="Project / evidence navigation";
 });
}
document.addEventListener("click",ev=>{
 const n=ev.target.closest?.("#nodes .node[data-id],.filesystemDocumentCard");
 if(!n)return;
 let id=n.dataset.id||"";
 if(!id){
   const text=(n.innerText||"").replace(/\s+/g," ").trim();
   const p=PROJECTS.find(x=>text.includes(x.label));
   const e=EVIDENCE.find(x=>text.includes(x.label));
   id=p?.id||e?.id||"";
 }
 if(id)showNarrator(id);
},true);
document.addEventListener("DOMContentLoaded",()=>{
 installNarrator();relabel();
 const mo=new MutationObserver(()=>relabel());
 mo.observe(document.body,{childList:true,subtree:true});
 setInterval(relabel,2500);
});
})();