const qs=s=>document.querySelector(s);
const world=qs("#world"),nodesEl=qs("#nodes"),edges=qs("#edges"),track=qs("#carouselTrack"),search=qs("#searchBox");
const hud=qs("#hud"),workspace=qs("#workspace"),workspaceBody=qs("#workspaceBody"),workspaceTitle=qs("#workspaceTitle"),workspaceKicker=qs("#workspaceKicker");
const openExternal=qs("#workspaceOpenExternal"),agentText=qs("#agentText"),agentNarration=qs("#agentNarration"),agentState=qs("#agentState"),agentTranscript=qs("#agentTranscript"),micBtn=qs("#micBtn"),reasonBtn=qs("#reasonBtn");
let projects=[],evidence=[],decks=[],items=[],selected=null,activeItem=null,activeTab="overview";
let scale=1,panX=0,panY=0,dragging=false,dragStart=null,positions=new Map(),voice=null,voiceConfig=null,audioPlayer=null,recognition=null,listening=false,activeCategory=null,gemmaEngine=null,gemmaConversation=null,gemmaLoading=false,gemmaGenerating=false,agentPersona=null;
const upstreamRepos=new Set(["gpt-engineer","whisper","BitNet","automatisch","view-transitions","llama-models"]);
const colors={Core:"#50e6ff","Agentic Systems":"#6f9cff","Scientific Research":"#c978ff",Governance:"#e6d75a",Runtime:"#50e6ff",Capabilities:"#e6d75a",Devices:"#57e49a",Compute:"#56c7ff","Voice / Realtime":"#ffad52","Developer Tools":"#8b9dff",Education:"#e273ff",Legal:"#ff6577",Logistics:"#ff8a16",Operations:"#54e0be","Business / Operations":"#54e0be","Creative AI":"#a67cff",Publishing:"#c978ff","Community / Business":"#c58b64",Safety:"#ff6577",Professional:"#93a8ba","Client / Brand":"#8c74ff",Gaming:"#6fc4ff","Business / Web":"#ff8a16","Publishing / Education":"#e273ff","Physical Systems":"#c58b64",Evidence:"#4de0cf","Reference / Upstream":"#718096","Other Projects":"#7890a7"};
const categoryDefs=[
{id:"cat::core",label:"CORE LEEWAY",groups:["Agentic Systems","Scientific Research","Governance","Runtime","Capabilities","Devices","Compute","Voice / Realtime","Developer Tools"]},
{id:"cat::products",label:"PRODUCTS / APPLICATIONS",groups:["Education","Legal","Logistics","Operations","Business / Operations","Creative AI","Publishing","Safety","Gaming","Publishing / Education"]},
{id:"cat::business",label:"BUSINESS / CLIENT WORK",groups:["Business / Web","Community / Business","Client / Brand"]},
{id:"cat::professional",label:"PROFESSIONAL / LINEAGE",groups:["Professional","Physical Systems"]},
{id:"cat::other",label:"OTHER / REFERENCES",groups:["Other Projects","Reference / Upstream"]},
{id:"cat::evidence",label:"EVIDENCE / RESEARCH",groups:["Evidence"]}
];
const categoryAnchors={"cat::core":{x:700,y:110},"cat::products":{x:1080,y:360},"cat::business":{x:930,y:710},"cat::professional":{x:470,y:710},"cat::other":{x:310,y:360},"cat::evidence":{x:700,y:425}};
function cleanName(n){return String(n||"").replace(/[-_]+/g," ").replace(/\s+/g," ").trim()}
function classifyRepo(r){
 if(upstreamRepos.has(r.name))return "Reference / Upstream";
 const s=((r.name||"")+" "+(r.description||"")).toLowerCase();
 if(/agent.?lee|agentlee|agentx|agentic.?operating/.test(s))return "Agentic Systems";
 if(/formula|quant|benchmark|80.?bench|research/.test(s))return "Scientific Research";
 if(/standard|governance/.test(s))return "Governance";
 if(/runtime.?fabric|runtime/.test(s))return "Runtime";
 if(/agent.?skills|skills/.test(s))return "Capabilities";
 if(/device.?bridge|pocket.?agent|android/.test(s))return "Devices";
 if(/edge.?gpu|webgpu|gpu/.test(s))return "Compute";
 if(/edge.?rtc|voice|rtc|tts/.test(s))return "Voice / Realtime";
 if(/vscode|ide|studio|bridge/.test(s))return "Developer Tools";
 if(/training|academy|cpr/.test(s))return "Education";
 if(/legal|contract/.test(s))return "Legal";
 if(/truck|logistics/.test(s))return "Logistics";
 if(/lex|ops|crm|waterhole/.test(s))return "Operations";
 if(/content|creator|creative|author|marketing/.test(s))return "Creative AI";
 if(/leola|library|book/.test(s))return "Publishing / Education";
 if(/blackbook|milwaukee/.test(s))return "Community / Business";
 if(/safety|uvision|health/.test(s))return "Safety";
 if(/resume|portfolio|business.?card|contact/.test(s))return "Professional";
 if(/game|gamer|chess/.test(s))return "Gaming";
 if(/rapidweb|webportfolio|jump|influencer|artist|brand|campbell|tireshop|family/.test(s))return "Business / Web";
 return "Other Projects";
}
function liveUrlFor(repo,ov){
 if(ov?.live_url)return ov.live_url;
 if(repo.homepage&&/^https?:/i.test(repo.homepage))return repo.homepage;
 if(repo.has_pages)return `https://4citeb4u.github.io/${encodeURIComponent(repo.name)}/`;
 return null;
}
async function fetchGithubRepos(){
 const pages=[1,2];
 const sets=await Promise.all(pages.map(p=>fetch(`https://api.github.com/users/4citeB4U/repos?per_page=100&page=${p}&sort=updated`,{headers:{Accept:"application/vnd.github+json"}}).then(r=>r.ok?r.json():[]).catch(()=>[])));
 return sets.flat().filter(r=>r&&r.owner?.login==="4citeB4U"&&!r.private);
}
function groupFor(x){return x.kind==="evidence"?"Evidence":x.group||"Other Projects"}
function categoryFor(x){const g=groupFor(x);return categoryDefs.find(c=>c.groups.includes(g))?.id||"cat::other"}
function setWorldTransform(){world.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${scale})`}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function buildLayout(filter=""){
 positions.clear();positions.set("center",{x:700,y:425});
 const q=filter.toLowerCase();
 if(activeCategory||q){
  const members=items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!q||(x.label+" "+(x.summary||"")+" "+groupFor(x)).toLowerCase().includes(q)));
  const rings=Math.max(1,Math.ceil(members.length/14));
  members.forEach((x,i)=>{const ring=Math.floor(i/14),slot=i%14,count=Math.min(14,members.length-ring*14),radius=185+ring*92,angle=-Math.PI/2+(Math.PI*2)*(slot/Math.max(1,count));positions.set(x.id,{x:700+Math.cos(angle)*radius,y:425+Math.sin(angle)*radius})});
 }else{
  for(const c of categoryDefs)positions.set(c.id,categoryAnchors[c.id]);
 }
}
function renderEdges(filter=""){
 edges.setAttribute("viewBox","0 0 1400 850");edges.innerHTML="";
 const draw=(a,b,cls="")=>{const p=positions.get(a),q=positions.get(b);if(!p||!q)return;const l=document.createElementNS("http://www.w3.org/2000/svg","line");Object.entries({x1:p.x,y1:p.y,x2:q.x,y2:q.y}).forEach(([k,v])=>l.setAttribute(k,v));l.setAttribute("class","edge "+cls);edges.appendChild(l)};
 if(activeCategory||filter){for(const x of items)if(positions.has(x.id))draw("center",x.id,x.kind==="evidence"?"evidence":"core")}
 else categoryDefs.forEach(c=>draw("center",c.id,c.id==="cat::evidence"?"evidence":"core"));
}
function nodeButton(x){
 const p=positions.get(x.id),b=document.createElement("button");b.className="node "+(x.type||"project")+(selected===x.id?" selected":"");b.dataset.id=x.id;b.style.left=p.x+"px";b.style.top=p.y+"px";b.style.setProperty("--zone",x.zone||colors[groupFor(x)]||"#62a8ff");b.innerHTML=`<b>${x.label}</b><small>${x.sub||""}</small>`;
 b.onclick=e=>{e.stopPropagation();if(x.id==="center"){if(activeCategory||search.value.trim()){activeCategory=null;search.value="";rebuildUniverse();selectItem("center",false)}else selectItem("center",false);return}if(x.type==="category"){activeCategory=x.id;rebuildUniverse();const c=categoryDefs.find(y=>y.id===x.id);qs("#crumbCurrent").textContent=c.label;agentText.textContent=`Entering ${c.label}. Select a project or use the carousel below.`;return}selectItem(x.id,true)};return b;
}
function renderNodes(filter=""){
 nodesEl.innerHTML="";const cLabel=activeCategory?categoryDefs.find(c=>c.id===activeCategory)?.label:"";
 nodesEl.appendChild(nodeButton({id:"center",label:activeCategory?cLabel:"LEONARD LEE",sub:activeCategory?"tap center to return":"LeeWay Industries · Systems Builder",type:"center",zone:"#50e6ff"}));
 const q=filter.toLowerCase();
 if(!activeCategory&&!q){
  categoryDefs.forEach(c=>nodesEl.appendChild(nodeButton({id:c.id,label:c.label,sub:`${items.filter(x=>categoryFor(x)===c.id).length} items`,type:"category",zone:c.id==="cat::evidence"?"#4de0cf":"#62a8ff"})));
 }else{
  items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!q||(x.label+" "+(x.summary||"")+" "+groupFor(x)).toLowerCase().includes(q))).forEach(x=>nodesEl.appendChild(nodeButton({id:x.id,label:x.label,sub:groupFor(x),type:x.kind==="evidence"?"project evidence":"project"})));
 }
}
function narrationFor(x){
 if(x.id==="center")return "This is Leonard Lee's public Digital Brain: a systems history spanning physical work, logistics, business, software, research, and governed AI.";
 if(x.id?.startsWith("cat::"))return `${x.label} contains ${items.filter(y=>categoryFor(y)===x.id).length} explorable records. Choose one and I can open its live view, files, or evidence.`;
 if(x.kind==="evidence")return `${x.label} is a visual evidence object in the LeeWay research history. Open Evidence to inspect the presentation or artifact directly.`;
 return `${x.label} is part of Leonard Lee's ${x.group} work. ${x.summary||x.desc||""} I can open its live view, repository files, or related evidence without leaving the brain.`;
}
function resolveItem(id){
 if(id==="center")return {id,label:"Leonard Lee",group:"Systems Builder",summary:"Cross-domain systems work spanning construction, logistics, management, business, software, AI and governed research.",evidence_state:"PUBLIC LINEAGE",kind:"identity"};
 if(id?.startsWith("cat::")){const c=categoryDefs.find(x=>x.id===id);return {id,label:c.label,group:"Project Universe",summary:`Contains ${items.filter(y=>categoryFor(y)===id).length} public project or evidence records.`,evidence_state:"PUBLIC PROJECTION",kind:"category"}}
 return items.find(x=>x.id===id);
}
function selectItem(id,open=false){
 selected=id;activeItem=resolveItem(id);renderNodes(search.value.trim());renderCarousel(search.value.trim());if(!activeItem)return;
 const n=narrationFor(activeItem);agentText.textContent=n;agentNarration.textContent=n;qs("#crumbCurrent").textContent=activeItem.label.toUpperCase();
 if(["identity","category"].includes(activeItem.kind)){
   hud.classList.add("hidden");
   return;
 }
 qs("#hudTitle").textContent=activeItem.label;qs("#hudSubtitle").textContent=groupFor(activeItem);qs("#hudDesc").textContent=activeItem.summary||activeItem.desc||n;
 qs("#hudFacts").innerHTML=[["Domain",groupFor(activeItem)],["Evidence",activeItem.evidence_state||activeItem.type||"PUBLIC"],["Updated",activeItem.updated_at?.slice?.(0,10)||activeItem.date||"Historical"],["Identity",activeItem.id]].map(([a,b])=>`<div class="hudFact"><b>${a}</b><span>${b}</span></div>`).join("");
 qs("#openProjectBtn").classList.toggle("hidden",!activeItem.live_url&&!activeItem.url);if(activeItem.live_url||activeItem.url)qs("#openProjectBtn").href=activeItem.live_url||activeItem.url;
 qs("#openRepoBtn").classList.toggle("hidden",!activeItem.repo_url);if(activeItem.repo_url)qs("#openRepoBtn").href=activeItem.repo_url;
 hud.classList.remove("hidden");if(open)openWorkspace(activeItem,"overview");
}
function renderCarousel(filter=""){
 const q=filter.toLowerCase(),rows=items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!q||(x.label+" "+(x.summary||"")+" "+groupFor(x)).toLowerCase().includes(q)));track.innerHTML="";
 rows.forEach(x=>{const b=document.createElement("button");b.className="projectCard"+(selected===x.id?" active":"");b.innerHTML=`<div class="cardTop"><span class="cardType">${x.kind==="evidence"?x.type:"PROJECT"}</span><span class="cardEvidence">${x.evidence_state||""}</span></div><h3>${x.label}</h3><p>${x.summary||""}</p>`;b.onclick=()=>{selectItem(x.id,false);openWorkspace(x,x.kind==="evidence"?"evidence":"overview")};track.appendChild(b)});qs("#carouselCount").textContent=`${rows.length} items`;
}
function rebuildUniverse(){const q=search.value.trim();buildLayout(q);renderEdges(q);renderNodes(q);renderCarousel(q);fit()}
function openWorkspace(x,tab="overview"){activeItem=x;activeTab=tab;workspace.classList.remove("hidden");workspaceTitle.textContent=x.label;workspaceKicker.textContent=x.kind==="evidence"?"EVIDENCE WORKSPACE":"PROJECT WORKSPACE";const ext=x.live_url||x.url||x.repo_url;openExternal.classList.toggle("hidden",!ext);if(ext)openExternal.href=ext;document.querySelectorAll(".workspaceTabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));renderWorkspace()}
function closeWorkspace(){workspace.classList.add("hidden")}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function overviewHtml(x){return `<div class="workspaceGrid"><section class="workspacePanel"><h3>What this is</h3><p>${esc(x.summary||x.desc||"Public project record.")}</p><div class="hudFacts">${[["Category",groupFor(x)],["Evidence",x.evidence_state||"PUBLIC"],["Language",x.language||"—"],["Created",x.created_at?.slice?.(0,10)||x.date||"—"],["Updated",x.updated_at?.slice?.(0,10)||"—"],["Repository size",x.size!=null?Math.round(x.size/1024)+" MB":"—"]].map(([a,b])=>`<div class="hudFact"><b>${a}</b><span>${esc(b)}</span></div>`).join("")}</div></section><section class="workspacePanel"><h3>Agent Lee</h3><p>${esc(narrationFor(x))}</p><div class="hudButtons">${x.live_url?`<button data-work-action="live">Live View</button>`:""}${x.repo_name?`<button data-work-action="files">Browse Files</button>`:""}<button data-work-action="evidence">Evidence</button><button data-work-action="speak">Narrate</button></div></section></div>`}
function renderLive(x){if(!x.live_url){workspaceBody.innerHTML=`<div class="workspacePanel"><h3>No verified live URL</h3><p>This project has source evidence but no live view has been discovered yet.</p></div>`;return}workspaceBody.innerHTML=`<div class="workspacePanel"><p>Live project viewport. If a project blocks framing, use Open Full.</p></div><iframe class="liveFrame" src="${esc(x.live_url)}" title="${esc(x.label)} live view" loading="eager" sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"></iframe>`}
async function renderFiles(x,path=""){if(!x.repo_name){workspaceBody.innerHTML=`<div class="workspacePanel"><h3>No GitHub repository</h3><p>This record comes from the Estate Projection rather than a public repository.</p></div>`;return}workspaceBody.innerHTML=`<div class="fileBrowser"><div class="fileList"><div class="fileListHead">Loading repository…</div></div><div class="filePreview"><div class="filePreviewInner">Select a file to preview it.</div></div></div>`;const list=workspaceBody.querySelector(".fileList"),preview=workspaceBody.querySelector(".filePreview");try{const u=`https://api.github.com/repos/4citeB4U/${encodeURIComponent(x.repo_name)}/contents/${path}?ref=${encodeURIComponent(x.default_branch||"main")}`;const r=await fetch(u,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error("GitHub "+r.status);const data=await r.json();const rows=Array.isArray(data)?data:[data];list.innerHTML=`<div class="fileListHead">${esc(x.repo_name)} /${esc(path)}</div>`;rows.sort((a,b)=>(a.type===b.type?a.name.localeCompare(b.name):a.type==="dir"?-1:1)).forEach(f=>{const b=document.createElement("button");b.className="fileEntry";b.innerHTML=`<span class="fileGlyph">${f.type==="dir"?"▣":"▤"}</span><span class="fileName">${esc(f.name)}</span>`;b.onclick=()=>f.type==="dir"?renderFiles(x,f.path):previewFile(f,preview);list.appendChild(b)})}catch(e){list.innerHTML=`<div class="fileListHead">Unable to load files</div><div class="filePreviewInner">${esc(e.message)}</div>`}}
async function previewFile(f,host){host.innerHTML=`<div class="filePreviewInner">Loading ${esc(f.name)}…</div>`;const ext=(f.name.split(".").pop()||"").toLowerCase(),url=f.download_url||f.html_url;if(/png|jpg|jpeg|gif|webp|svg/.test(ext)){host.innerHTML=`<div class="filePreviewInner"><img src="${esc(url)}" alt=""><p><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></p></div>`;return}if(ext==="pdf"){host.innerHTML=`<iframe class="liveFrame" src="${esc(url)}"></iframe>`;return}if(/mp4|webm/.test(ext)){host.innerHTML=`<div class="filePreviewInner"><video controls src="${esc(url)}"></video></div>`;return}try{const r=await fetch(url);const t=await r.text();host.innerHTML=`<div class="filePreviewInner"><div class="hudButtons"><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></div><pre>${esc(t.slice(0,180000))}</pre></div>`}catch{host.innerHTML=`<div class="filePreviewInner"><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></div>`}}
function relevantEvidence(x){if(x.kind==="evidence")return [x];const words=(x.label+" "+groupFor(x)).toLowerCase().split(/\W+/).filter(w=>w.length>3);let rows=evidence.filter(e=>words.some(w=>(e.label+" "+(e.summary||"")).toLowerCase().includes(w)));if(!rows.length&&["Scientific Research","Governance","Agentic Systems","Runtime"].includes(groupFor(x)))rows=evidence.slice();return rows}
function renderEvidence(x){
 if(x.kind==="evidence"){
  const directDeck=decks.find(z=>z.title===x.label)||decks.find(z=>(x.label||"").toLowerCase().includes(z.title.toLowerCase().replace(/^the /,"")));
  openEvidenceDetail(x,directDeck);
  return;
 }
 const rows=relevantEvidence(x);workspaceBody.innerHTML=`<div class="evidenceGrid"></div>`;const g=workspaceBody.querySelector(".evidenceGrid");
 if(x.live_url){
  const live={id:"live::"+x.id,label:x.label+" — Live Project",summary:"Running project experience preserved as public execution evidence.",type:"Live Project",url:x.live_url,evidence_state:"LIVE"};
  const tile=document.createElement("article");tile.className="evidenceTile";tile.innerHTML=`<div style="aspect-ratio:16/9;display:grid;place-items:center;background:radial-gradient(circle,rgba(80,230,255,.16),#07101a);font-size:34px">▶</div><div class="evidenceTileBody"><b>${esc(live.label)}</b><small>Live Project Evidence</small></div>`;tile.onclick=()=>openEvidenceDetail(live,null);g.appendChild(tile);
 }
 rows.forEach(e=>{const d=decks.find(z=>z.title===e.label)||decks.find(z=>(e.label||"").toLowerCase().includes(z.title.toLowerCase().replace(/^the /,"")));const tile=document.createElement("article");tile.className="evidenceTile";tile.innerHTML=`${d?`<img src="${d.thumbnail}" alt="">`:e.url&&/\.(png|jpe?g)$/i.test(e.url)?`<img src="${e.url}" alt="">`:`<div style="aspect-ratio:16/9;display:grid;place-items:center;background:#07101a;font-size:34px">◫</div>`}<div class="evidenceTileBody"><b>${esc(e.label)}</b><small>${esc(e.type||"Evidence")}</small></div>`;tile.onclick=()=>openEvidenceDetail(e,d);g.appendChild(tile)});
 if(!g.children.length)g.innerHTML=`<div class="workspacePanel"><p>No public evidence has been linked to this project yet.</p></div>`;
}
function openEvidenceDetail(e,d){
 workspaceTitle.textContent=e.label;
 if(e.type==="Live Project"&&e.url){workspaceBody.innerHTML=`<iframe class="liveFrame" src="${esc(e.url)}" title="${esc(e.label)}" loading="eager" sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"></iframe><div class="hudButtons"><a class="workspaceAction" href="${esc(e.url)}" target="_blank" rel="noopener">Open Full</a></div>`;return}
 if(d){workspaceBody.innerHTML=`<iframe class="liveFrame" src="${d.pdf}" title="${esc(e.label)}"></iframe><div class="slideStrip">${d.slides.map(s=>`<img loading="lazy" src="${s}" alt="">`).join("")}</div><div class="hudButtons"><a class="workspaceAction" href="${d.pptx}">PowerPoint</a><a class="workspaceAction" href="${d.pdf}" target="_blank">PDF</a></div>`;return}
 if(e.url&&/\.(png|jpe?g)$/i.test(e.url)){workspaceBody.innerHTML=`<div class="workspacePanel"><img style="max-width:100%;border-radius:12px" src="${e.url}" alt=""><p>${esc(e.summary||"")}</p></div>`;return}
 workspaceBody.innerHTML=`<div class="workspacePanel"><p>${esc(e.summary||"Evidence record")}</p></div>`;
}
function renderWorkspace(){if(!activeItem)return;if(activeTab==="overview")workspaceBody.innerHTML=overviewHtml(activeItem);else if(activeTab==="live")renderLive(activeItem);else if(activeTab==="files")renderFiles(activeItem);else renderEvidence(activeItem)}
function chooseVoice(){if(!("speechSynthesis"in window))return;const voices=speechSynthesis.getVoices();voice=voices.find(v=>/Google.*English/i.test(v.name))||voices.find(v=>/(Guy|Ryan|Christopher|Andrew|Brian|Eric|Daniel|David)/i.test(v.name)&&/^en/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null}
function stopSpeech(){if(audioPlayer){try{audioPlayer.pause();audioPlayer.src=""}catch{}audioPlayer=null}if("speechSynthesis"in window)speechSynthesis.cancel()}
async function speak(text){
 if(!text)return;stopSpeech();
 const endpoint=voiceConfig?.secure_backend_endpoint;
 if(endpoint){
  try{
   agentState.textContent="speaking · premium voice";
   const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,voice:voiceConfig?.chirp3?.voice_name||"en-US-Chirp3-HD-Charon",language_code:voiceConfig?.chirp3?.language_code||"en-US"})});
   if(!r.ok)throw new Error("voice "+r.status);
   const blob=await r.blob(),url=URL.createObjectURL(blob);audioPlayer=new Audio(url);
   audioPlayer.onended=()=>{URL.revokeObjectURL(url);audioPlayer=null;agentState.textContent=listening?"listening":"ready"};
   await audioPlayer.play();return;
  }catch(e){console.warn("Premium voice unavailable, using browser fallback",e)}
 }
 if(!("speechSynthesis"in window))return;chooseVoice();const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;
 u.rate=voiceConfig?.browser_fallback?.rate??.94;u.pitch=voiceConfig?.browser_fallback?.pitch??.93;
 u.onstart=()=>agentState.textContent="speaking · tap mic to interrupt";u.onend=()=>agentState.textContent=listening?"listening":"ready";speechSynthesis.speak(u)
}
async function enableGemma(){
 if(gemmaEngine||gemmaLoading)return;
 if(!("gpu" in navigator)){agentState.textContent="Gemma requires WebGPU on this device";return}
 const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
 const downloadLabel=mobile?"about 2.0 GB":"about 3.0 GB";
 if(navigator.connection?.saveData){agentState.textContent="Gemma disabled while Data Saver is enabled";return}
 if(!confirm(`Enable local Gemma 4 reasoning? This downloads ${downloadLabel} once for the selected model and uses significant device memory. The Digital Brain works without it.`)){agentState.textContent="deterministic mode · Gemma optional";return}
 gemmaLoading=true;reasonBtn.classList.add("loading");agentState.textContent="loading Gemma 4 locally";
 try{
  const {Engine}=await import("https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm");
  const model=mobile
   ?"https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm"
   :"https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it-web.litertlm";
  gemmaEngine=await Engine.create({model,mainExecutorSettings:{maxNumTokens:4096}});
  const persona=agentPersona||{};
  const preface=[
   "You are Agent Lee, the public cognitive guide for Leonard Lee and LeeWay Industries.",
   "Role: "+(persona.roles||[]).join(", "),
   "Prime directive: "+(persona.prime_directive||"Schema-First, Personality-Second"),
   "Be calm, concise, technically precise, source-conscious, and never fabricate project facts.",
   "Use the project context supplied in each user message. Navigation decisions remain controlled by the deterministic LeeWay UI controller."
  ].join("\n");
  gemmaConversation=await gemmaEngine.createConversation({preface:{messages:[{role:"system",content:preface}]}});
  reasonBtn.classList.remove("loading");reasonBtn.classList.add("ready");reasonBtn.textContent="G4";agentState.textContent="Gemma 4 local reasoning ready";
 }catch(e){
  console.error(e);gemmaEngine=null;gemmaConversation=null;reasonBtn.classList.remove("loading","ready");agentState.textContent="Gemma load unavailable; deterministic mode active";
 }finally{gemmaLoading=false}
}
async function askGemma(question){
 if(!gemmaConversation)return null;
 gemmaGenerating=true;agentState.textContent="Gemma 4 reasoning locally";
 const ctx=activeItem?{label:activeItem.label,group:groupFor(activeItem),summary:activeItem.summary||activeItem.desc||"",live_url:activeItem.live_url||null,repo:activeItem.repo_url||null,evidence:activeItem.evidence_state||null}:null;
 const prompt=`Public Digital Brain context:\n${JSON.stringify(ctx)}\n\nVisitor question: ${question}\nAnswer as Agent Lee. If the question asks for navigation, describe the relevant project and let the LeeWay controller handle UI actions.`;
 let out="";
 try{
  const stream=gemmaConversation.sendMessageStreaming(prompt);
  for await(const chunk of stream){
   if(!gemmaGenerating)break;
   for(const item of chunk.content||[])if(item.type==="text"){out+=item.text;agentText.textContent=out}
  }
  if(out.trim()){agentNarration.textContent=out.trim();speak(out.trim());return out.trim()}
 }catch(e){console.error(e);agentState.textContent="Gemma reasoning failed; deterministic mode active"}
 finally{gemmaGenerating=false}
 return null;
}
function cancelAgentGeneration(){
 if(gemmaGenerating&&gemmaConversation?.cancel)try{gemmaConversation.cancel()}catch{}
 gemmaGenerating=false;
 stopSpeech();
}
function scoreProject(q,p){const hay=(p.label+" "+(p.repo_name||"")+" "+(p.summary||"")+" "+(p.group||"")).toLowerCase();if(hay.includes(q))return 100+q.length;return q.split(/\s+/).reduce((n,w)=>n+(w.length>2&&hay.includes(w)?5:0),0)}
function bestProject(q){return projects.map(p=>[scoreProject(q,p),p]).sort((a,b)=>b[0]-a[0])[0]}
async function handleAgentCommand(raw){
 const text=raw.trim(),q=text.toLowerCase();agentTranscript.textContent=text;agentTranscript.classList.remove("hidden");
 if(/\b(stop|quiet|pause|interrupt)\b/.test(q)){cancelAgentGeneration();agentState.textContent="ready";return}
 if(/\b(home|reset|close)\b/.test(q)){closeWorkspace();activeCategory=null;search.value="";rebuildUniverse();speak("Back at the main Digital Brain.");return}
 if(activeItem&&/\b(files?|source|code)\b/.test(q)){openWorkspace(activeItem,"files");speak("Opening the project files.");return}
 if(activeItem&&/\b(live|website|demo|running)\b/.test(q)){openWorkspace(activeItem,"live");speak(activeItem.live_url?"Opening the live project view.":"I do not have a verified live view for this project yet.");return}
 if(activeItem&&/\b(evidence|proof|presentation|powerpoint|infographic)\b/.test(q)){openWorkspace(activeItem,"evidence");speak("Opening the evidence linked to this work.");return}
 let subject=q.replace(/^(show|open|take me to|tell me about|explain|find|go to)\s+/,"").trim();
 const hit=bestProject(subject);
 if(hit&&hit[0]>=10){selectItem(hit[1].id,false);openWorkspace(hit[1],"overview");speak(narrationFor(hit[1]));return}
 if(gemmaConversation){const answer=await askGemma(text);if(answer)return}
 speak("I can navigate projects, open live views, browse repository files, show evidence, and—when local reasoning is enabled—answer broader questions about Leonard Lee and LeeWay Industries.");
}
function setupRecognition(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){agentState.textContent="voice input unavailable in this browser";micBtn.disabled=true;return}recognition=new R();recognition.lang="en-US";recognition.continuous=true;recognition.interimResults=true;recognition.onstart=()=>{listening=true;micBtn.classList.add("listening");agentState.textContent="listening"};recognition.onresult=e=>{let final="",interim="";for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)final+=t;else interim+=t}const heard=(final||interim).trim();if(heard&&(("speechSynthesis"in window&&speechSynthesis.speaking)||audioPlayer)){stopSpeech();if(gemmaGenerating)cancelAgentGeneration();agentState.textContent="interrupted · listening"}agentTranscript.textContent=heard;agentTranscript.classList.remove("hidden");if(final)handleAgentCommand(final)};recognition.onerror=e=>{agentState.textContent="voice "+e.error};recognition.onend=()=>{if(listening)try{recognition.start()}catch{}}}
function toggleMic(){cancelAgentGeneration();if(!recognition)setupRecognition();if(!recognition)return;if(listening){listening=false;recognition.stop();micBtn.classList.remove("listening");agentState.textContent="ready"}else try{recognition.start()}catch{}}
function startTour(){const seq=projects.filter(p=>p.live_url).slice(0,5);let i=0;const step=()=>{if(i>=seq.length)return;const p=seq[i++];selectItem(p.id,false);speak(narrationFor(p));setTimeout(step,6500)};step()}
function fit(){scale=innerWidth<900?.58:.78;panX=0;panY=0;setWorldTransform()}
search.oninput=()=>{activeCategory=null;rebuildUniverse()};qs("#hudClose").onclick=()=>hud.classList.add("hidden");qs("#speakBtn").onclick=()=>speak(agentNarration.textContent||agentText.textContent);qs("#tourBtn").onclick=startTour;qs("#resetBtn").onclick=fit;micBtn.onclick=toggleMic;reasonBtn.onclick=enableGemma;qs("#workspaceClose").onclick=closeWorkspace;
document.querySelectorAll(".workspaceTabs button").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;document.querySelectorAll(".workspaceTabs button").forEach(x=>x.classList.toggle("active",x===b));renderWorkspace()});
workspace.addEventListener("click",e=>{const a=e.target.closest("[data-work-action]");if(!a)return;const x=a.dataset.workAction;if(x==="live"){activeTab="live";renderWorkspace()}else if(x==="files"){activeTab="files";renderWorkspace()}else if(x==="evidence"){activeTab="evidence";renderWorkspace()}else if(x==="speak")speak(narrationFor(activeItem))});
qs("#zoomIn").onclick=()=>{scale=clamp(scale+.12,.38,1.9);setWorldTransform()};qs("#zoomOut").onclick=()=>{scale=clamp(scale-.12,.38,1.9);setWorldTransform()};qs("#zoomFit").onclick=fit;
qs("#stage").addEventListener("wheel",e=>{e.preventDefault();scale=clamp(scale*(e.deltaY<0?1.08:.92),.38,1.9);setWorldTransform()},{passive:false});
qs("#stage").addEventListener("pointerdown",e=>{if(e.target.closest(".node,#hud,#zoomControls"))return;dragging=true;dragStart={x:e.clientX,y:e.clientY,px:panX,py:panY};qs("#stage").setPointerCapture(e.pointerId)});
qs("#stage").addEventListener("pointermove",e=>{if(!dragging)return;panX=dragStart.px+e.clientX-dragStart.x;panY=dragStart.py+e.clientY-dragStart.y;setWorldTransform()});qs("#stage").addEventListener("pointerup",()=>dragging=false);qs("#stage").addEventListener("pointercancel",()=>dragging=false);
speechSynthesis?.addEventListener?.("voiceschanged",chooseVoice);
function materializeProjects(source,overrides){
 const om=new Map((overrides.overrides||[]).map(x=>[x.repo_name,x]));
 const rows=(source||[]).map(r=>{const ov=om.get(r.name)||{};return {id:"repo::"+r.name,repo_name:r.name,label:ov.label||cleanName(r.name),summary:ov.summary||r.description||"Public GitHub project by Leonard Lee / LeeWay Industries.",group:ov.group||classifyRepo(r),repo_url:r.html_url||`https://github.com/4citeB4U/${r.name}`,live_url:liveUrlFor(r,ov),evidence_state:ov.evidence_state||(upstreamRepos.has(r.name)?"UPSTREAM REFERENCE":"PUBLIC SOURCE"),default_branch:r.default_branch||"main",language:r.language,size:r.size,created_at:r.created_at,updated_at:r.updated_at,kind:"project"}});
 (overrides.estate_only||[]).forEach(x=>rows.push({...x,kind:"project",repo_name:null,repo_url:null,live_url:null}));
 return rows;
}
function applyProjectSource(source,overrides){
 projects=materializeProjects(source,overrides);
 items=[...projects,...evidence];
 qs("#projectCount").textContent=`PROJECTS ${projects.length}`;
 qs("#evidenceCount").textContent=`EVIDENCE ${evidence.length}`;
 activeCategory=null;search.value="";rebuildUniverse();selectItem("center",false);
}
async function boot(){
 const [generated,overrides,estate,visuals,fallback,persona,voiceCfg]=await Promise.all([
  fetch("/brain/generated-projects.json",{cache:"no-store"}).then(r=>r.ok?r.json():({repositories:[]})).catch(()=>({repositories:[]})),
  fetch("/brain/project-overrides.json").then(r=>r.json()),
  fetch("/leeway-brain/data/estate-index.json").then(r=>r.json()),
  fetch("/brain/evidence-visuals.json").then(r=>r.json()),
  fetch("/brain/project-catalog.json").then(r=>r.json()).catch(()=>({projects:[]})),
  fetch("/brain/agent-lee-persona-public.json").then(r=>r.json()).catch(()=>null),
  fetch("/brain/agent-lee-voice.json").then(r=>r.json()).catch(()=>null)
 ]);
 agentPersona=persona;voiceConfig=voiceCfg;
 decks=visuals.decks||[];
 evidence=(estate.evidence||[]).filter(x=>x.file).map(x=>({id:"evidence::"+x.id,label:x.title,summary:x.summary,group:"Evidence",type:x.type,url:"/leeway-brain/"+String(x.file).replace(/^\/+/, ""),date:x.date,evidence_state:"PUBLIC REFERENCE",kind:"evidence"}));
 decks.forEach(d=>{if(!evidence.some(e=>e.label===d.title))evidence.push({id:d.id,label:d.title,summary:"Visual PowerPoint evidence from the LeeWay research archive.",group:"Evidence",type:"PowerPoint",url:d.pptx,evidence_state:"PUBLIC REFERENCE",kind:"evidence"})});
 const fallbackSource=(fallback.projects||[]).map(x=>({name:x.repo_name||x.label,description:x.summary,html_url:x.repo,homepage:x.url,has_pages:!!x.url,default_branch:"main",language:null,size:null,created_at:null,updated_at:null}));
 const durable=(generated.repositories||[]).length?generated.repositories:fallbackSource;
 applyProjectSource(durable,overrides);
 chooseVoice();setupRecognition();if(recognition)listening=false;
 // Opportunistic freshness: never block rendering on GitHub.
 fetchGithubRepos().then(live=>{
  if(!live.length)return;
  const current=new Set(projects.filter(p=>p.repo_name).map(p=>p.repo_name));
  const incoming=new Set(live.map(r=>r.name));
  let changed=current.size!==incoming.size;
  if(!changed)for(const n of incoming)if(!current.has(n)){changed=true;break}
  if(changed)applyProjectSource(live,overrides);
 }).catch(()=>{});
}
boot().catch(e=>{agentText.textContent="Digital Brain project discovery failed: "+e.message;console.error(e)});