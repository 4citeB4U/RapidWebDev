/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_BRAIN
TAG: LEEWAY.RAPIDWEBDEV.AGENT_LEE_CONVERSATION_ENTRYPOINT
5WH:
WHAT = Preserve the existing public Digital Brain and add source-grounded engineering journey narration.
WHY = Provide bounded non-LLM engineering-story responses through existing microphone/session and canonical Voice Fabric.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/public-brain.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08 scoped addition; original source/history preserved.
HOW = Route documented questions through the deterministic Machine Consciousness projection and canonical Voice Fabric; stop spoken work on existing interruption controls.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const LeeWayVoiceMetrics=globalThis.LeeWayVoiceMetrics||Object.freeze({
 record(){},
 snapshot(){return[]},
 clear(){}
});
globalThis.LeeWayVoiceMetrics=LeeWayVoiceMetrics;
const qs=s=>document.querySelector(s);
const world=qs("#world"),nodesEl=qs("#nodes"),edges=qs("#edges"),track=qs("#carouselTrack"),search=qs("#searchBox");
const hud=qs("#hud"),workspace=qs("#workspace"),workspaceBody=qs("#workspaceBody"),workspaceTitle=qs("#workspaceTitle"),workspaceKicker=qs("#workspaceKicker");
const openExternal=qs("#workspaceOpenExternal"),agentText=qs("#agentText"),agentNarration=qs("#agentNarration"),agentState=qs("#agentState"),agentTranscript=qs("#agentTranscript"),micBtn=qs("#micBtn"),agentBubble=qs("#agentBubble"),agentBubbleClose=qs("#agentBubbleClose"),agentInput=qs("#agentInput"),agentSend=qs("#agentSend");
const appearancePanel=qs("#appearancePanel"),nucleusImg=qs("#nucleusFallbackImage"),waveCanvas=qs("#nucleusWaveCanvas"),carouselPrev=qs("#carouselPrev"),carouselNext=qs("#carouselNext");
let projects=[],evidence=[],decks=[],items=[],selected=null,activeItem=null,activeTab="overview",brainEntered=false;
let scale=1,panX=0,panY=0,dragging=false,dragStart=null,positions=new Map(),listening=false,activeCategory=null,outwardWheel=0,agentPersona=null;
const graphTouchPoints=new Map();let graphPinchStartDistance=0,graphPinchStartScale=1,graphPinchBacked=false;
let waveCtx=null,waveRaf=0,appearance={bg:"#010713",accent:"#00b7e8",speed:.52,horizontal:10,vertical:6.5,secondary:.30,stripHeight:4,hue:0,saturation:.90,brightness:.78,dotColor:"#35d8ff",dotVariation:16,dotStrength:.22,labelScale:1};

const upstreamRepos=new Set(["gpt-engineer","whisper","BitNet","automatisch","view-transitions","llama-models"]);
const colors={Core:"#50e6ff","Agentic Systems":"#6f9cff","Scientific Research":"#c978ff",Governance:"#e6d75a",Runtime:"#50e6ff",Capabilities:"#e6d75a",Devices:"#57e49a",Compute:"#56c7ff","Voice / Realtime":"#ffad52","Developer Tools":"#8b9dff",Education:"#e273ff",Legal:"#ff6577",Logistics:"#ff8a16",Operations:"#54e0be","Business / Operations":"#54e0be","Creative AI":"#a67cff",Publishing:"#c978ff","Community / Business":"#c58b64",Safety:"#ff6577",Professional:"#93a8ba","Client / Brand":"#8c74ff",Gaming:"#6fc4ff","Business / Web":"#ff8a16","Publishing / Education":"#e273ff","Physical Systems":"#c58b64",Evidence:"#4de0cf","Reference / Upstream":"#718096","Other Projects":"#7890a7"};
const categoryDefs=[
{id:"cat::core",label:"CORE LEEWAY",groups:["Agentic Systems","Scientific Research","Governance","Runtime","Capabilities","Devices","Compute","Voice / Realtime","Developer Tools"]},
{id:"cat::products",label:"PROJECTS / APPLICATIONS",groups:["Education","Legal","Logistics","Operations","Business / Operations","Creative AI","Publishing","Safety","Gaming","Publishing / Education"]},
{id:"cat::business",label:"BUSINESS / CLIENT WORK",groups:["Business / Web","Community / Business","Client / Brand"]},
{id:"cat::professional",label:"PROFESSIONAL / LINEAGE",groups:["Professional","Physical Systems"]},
{id:"cat::other",label:"OTHER / REFERENCES",groups:["Other Projects","Reference / Upstream"]}
];
const categoryAnchors={"cat::core":{x:700,y:205},"cat::products":{x:1160,y:335},"cat::business":{x:1010,y:670},"cat::professional":{x:390,y:670},"cat::other":{x:240,y:335}};
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
function categoryFor(x){
 const g=groupFor(x);
 if(g==="Evidence")return "__evidence_rail__";
 if(x.core_scope==="CORE"||x.core_priority)return "cat::core";
 if(x.core_scope==="DIRECT")return "cat::products";
 if(x.core_scope==="OPTIONAL")return "cat::other";
 return categoryDefs.filter(c=>c.id!=="cat::core").find(c=>c.groups.includes(g))?.id||"cat::other";
}
function setWorldTransform(){world.style.setProperty("--graph-inverse",String(1/scale));world.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${scale})`;window.__leewayGraphCamera={z:scale/4}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function hexRgb(hex){const h=String(hex||"#50e6ff").replace("#","");const n=parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function hexHue(hex){
 const {r,g,b}=hexRgb(hex),R=r/255,G=g/255,B=b/255,max=Math.max(R,G,B),min=Math.min(R,G,B),d=max-min;
 if(!d)return 0;
 let h=max===R?((G-B)/d)%6:max===G?(B-R)/d+2:(R-G)/d+4;
 h*=60;if(h<0)h+=360;return h;
}
let nucleusBase=null,nucleusBaseCtx=null,nucleusW=1,nucleusH=1,nucleusDpr=1,brightPoints=[];
function hexToHsl(hex){
 let s=String(hex||"#51eaff").replace("#","");if(s.length===3)s=s.split("").map(c=>c+c).join("");
 let r=parseInt(s.slice(0,2),16)/255,g=parseInt(s.slice(2,4),16)/255,b=parseInt(s.slice(4,6),16)/255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,ss=0,l=(max+min)/2,d=max-min;
 if(d){ss=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60}
 return{h,s:ss*100,l:l*100};
}
function cover(sw,sh,dw,dh){const s=Math.max(dw/sw,dh/sh),rw=sw*s,rh=sh*s;return{x:(dw-rw)/2,y:(dh-rh)/2,w:rw,h:rh}}
function applyAppearance(next={},persist=true){
 appearance={...appearance,...next};
 document.documentElement.style.setProperty("--bg",appearance.bg);
 document.documentElement.style.setProperty("--cyan",appearance.accent);
 document.documentElement.style.setProperty("--label-scale",String(appearance.labelScale||1));
 document.body.style.background=appearance.bg;qs("#app").style.background=appearance.bg;const nucleus=qs("#nucleus");if(nucleus)nucleus.style.background=appearance.bg;
 const values={bgColor:"bg",accentColor:"accent",nucleusSpeedRange:"speed",nucleusHorizontalRange:"horizontal",nucleusVerticalRange:"vertical",nucleusHueRange:"hue",nucleusSaturationRange:"saturation",nucleusBrightnessRange:"brightness",nucleusDotColor:"dotColor",nucleusDotVariationRange:"dotVariation",nucleusDotStrengthRange:"dotStrength",labelScaleRange:"labelScale"};
 Object.entries(values).forEach(([id,key])=>{const el=qs("#"+id);if(el&&appearance[key]!=null)el.value=String(appearance[key])});
 rebuildNucleusBase();
 window.dispatchEvent(new CustomEvent("leeway-appearance-change",{detail:{...appearance}}));
 if(persist)try{localStorage.setItem("leeway.brain.appearance.v3",JSON.stringify(appearance))}catch{}
}
function loadAppearance(){try{const saved=JSON.parse(localStorage.getItem("leeway.brain.appearance.v3")||"null");if(saved)appearance={...appearance,...saved}}catch{}applyAppearance(appearance,false)}
const nucleusPresets={
 original:{bg:"#010713",accent:"#00b7e8",hue:0,saturation:.90,brightness:.78,dotColor:"#35d8ff",dotVariation:16,dotStrength:.22},
 midnight:{bg:"#01030a",accent:"#78bfff",hue:0,saturation:.72,brightness:.48,dotColor:"#78bfff",dotVariation:12,dotStrength:.25},
 storm:{bg:"#140609",accent:"#ff6577",hue:145,saturation:1.34,brightness:.72,dotColor:"#ff515e",dotVariation:25,dotStrength:.38},
 violet:{bg:"#120822",accent:"#9b6cff",hue:255,saturation:1.25,brightness:.82,dotColor:"#b06cff",dotVariation:26,dotStrength:.34},
 emerald:{bg:"#031712",accent:"#54e0be",hue:90,saturation:1.18,brightness:.78,dotColor:"#54e0be",dotVariation:20,dotStrength:.32}
};
function detectBrightPoints(){
 brightPoints=[];if(!nucleusBase||nucleusW<2||nucleusH<2)return;
 const scale=.22,sw=Math.max(1,Math.round(nucleusW*scale)),sh=Math.max(1,Math.round(nucleusH*scale)),sample=document.createElement("canvas");sample.width=sw;sample.height=sh;
 const sctx=sample.getContext("2d",{willReadFrequently:true});sctx.drawImage(nucleusBase,0,0,nucleusBase.width,nucleusBase.height,0,0,sw,sh);
 let data;try{data=sctx.getImageData(0,0,sw,sh).data}catch{return}
 const candidates=[];for(let y=2;y<sh-2;y+=2){for(let x=2;x<sw-2;x+=2){const k=(y*sw+x)*4,r=data[k],g=data[k+1],b=data[k+2],lum=.2126*r+.7152*g+.0722*b,cyan=Math.min(g,b)-r*.35;if(lum>150&&cyan>48)candidates.push({x:x/scale,y:y/scale,score:lum+cyan})}}
 candidates.sort((a,b)=>b.score-a.score);const minDist=Math.max(13,Math.min(nucleusW,nucleusH)*.014),limit=Math.min(150,Math.max(42,Math.round(nucleusW*nucleusH/17500)));
 for(const c of candidates){if(brightPoints.length>=limit)break;let ok=true;for(const p of brightPoints){const dx=p.x-c.x,dy=p.y-c.y;if(dx*dx+dy*dy<minDist*minDist){ok=false;break}}if(ok)brightPoints.push({x:c.x,y:c.y,phase:((c.x*17+c.y*29)%628)/100})}
}
function rebuildNucleusBase(){
 if(!nucleusImg?.naturalWidth||!nucleusBaseCtx)return;
 nucleusBaseCtx.setTransform(nucleusDpr,0,0,nucleusDpr,0,0);nucleusBaseCtx.fillStyle=appearance.bg;nucleusBaseCtx.fillRect(0,0,nucleusW,nucleusH);
 const r=cover(nucleusImg.naturalWidth,nucleusImg.naturalHeight,nucleusW,nucleusH);
 nucleusBaseCtx.filter=`hue-rotate(${appearance.hue}deg) saturate(${appearance.saturation}) brightness(${appearance.brightness})`;
 nucleusBaseCtx.drawImage(nucleusImg,r.x,r.y,r.w,r.h);nucleusBaseCtx.filter="none";detectBrightPoints();
}
function resizeWave(){
 if(!waveCanvas)return;nucleusDpr=Math.min(devicePixelRatio||1,2);const rect=waveCanvas.parentElement.getBoundingClientRect();nucleusW=Math.max(1,Math.round(rect.width));nucleusH=Math.max(1,Math.round(rect.height));
 waveCanvas.width=Math.round(nucleusW*nucleusDpr);waveCanvas.height=Math.round(nucleusH*nucleusDpr);waveCanvas.style.width="100%";waveCanvas.style.height="100%";waveCtx=waveCanvas.getContext("2d",{alpha:true});waveCtx.setTransform(nucleusDpr,0,0,nucleusDpr,0,0);
 nucleusBase=document.createElement("canvas");nucleusBase.width=Math.round(nucleusW*nucleusDpr);nucleusBase.height=Math.round(nucleusH*nucleusDpr);nucleusBaseCtx=nucleusBase.getContext("2d",{alpha:false,willReadFrequently:true});rebuildNucleusBase();
}
function waveOffset(y,t){const i=y/appearance.stripHeight,p=i*.078;return{dx:Math.sin(t*1.72+p)*appearance.horizontal+Math.sin(t*.83+p*.43)*appearance.horizontal*appearance.secondary,dy:Math.cos(t*1.16+p*.67)*appearance.vertical+Math.sin(t*.64+p*.31)*appearance.vertical*.22}}
function drawWave(ms){
 if(document.hidden){waveRaf=requestAnimationFrame(drawWave);return}
 if(!waveCtx||!waveCanvas||!nucleusBase){waveRaf=requestAnimationFrame(drawWave);return}
 if(matchMedia("(prefers-reduced-motion: reduce)").matches){waveCtx.clearRect(0,0,nucleusW,nucleusH);waveCtx.drawImage(nucleusBase,0,0,nucleusBase.width,nucleusBase.height,0,0,nucleusW,nucleusH);waveRaf=requestAnimationFrame(drawWave);return}
 if(document.hidden){waveRaf=requestAnimationFrame(drawWave);return}const t=ms*.001*appearance.speed;waveCtx.clearRect(0,0,nucleusW,nucleusH);const sh=appearance.stripHeight,count=Math.ceil(nucleusH/sh)+2;
 for(let i=0;i<count;i++){const y=i*sh,p=i*.078,dx=Math.sin(t*1.72+p)*appearance.horizontal+Math.sin(t*.83+p*.43)*appearance.horizontal*appearance.secondary,dy=Math.cos(t*1.16+p*.67)*appearance.vertical+Math.sin(t*.64+p*.31)*appearance.vertical*.22;
  waveCtx.drawImage(nucleusBase,0,Math.max(0,Math.round(y*nucleusDpr)),nucleusBase.width,Math.max(1,Math.round((sh+2)*nucleusDpr)),dx,y+dy,nucleusW,sh+3)}
 if(appearance.dotStrength>0&&brightPoints.length){const c=hexToHsl(appearance.dotColor);waveCtx.save();waveCtx.globalCompositeOperation="screen";for(const p of brightPoints){const o=waveOffset(p.y,t),pulse=.5+.5*Math.sin(ms*.0013+p.phase),hue=(c.h+Math.sin(ms*.00055+p.phase)*appearance.dotVariation+360)%360,alpha=appearance.dotStrength*(.22+.34*pulse),rad=1.25+2.2*pulse;waveCtx.shadowColor=`hsla(${hue},100%,66%,${Math.min(1,alpha*1.8)})`;waveCtx.shadowBlur=8+10*pulse;waveCtx.fillStyle=`hsla(${hue},${Math.max(65,c.s)}%,${Math.max(58,c.l)}%,${alpha})`;waveCtx.beginPath();waveCtx.arc(p.x+o.dx,p.y+o.dy,rad,0,Math.PI*2);waveCtx.fill()}waveCtx.restore();waveCtx.shadowBlur=0}
 waveRaf=requestAnimationFrame(drawWave);
}
function startWave(){
 resizeWave();if(waveRaf)cancelAnimationFrame(waveRaf);if(nucleusImg&&!nucleusImg.complete)nucleusImg.addEventListener("load",()=>{resizeWave()},{once:true});waveRaf=requestAnimationFrame(drawWave)
}
function enterBrain(){
 const b=window.__leeway3DBrain;
 if(b){
  const dir=b.camera.position.clone().sub(b.controls.target).normalize();
  b.camera.position.copy(b.controls.target).add(dir.multiplyScalar(5.75));
  b.controls.update();
  return;
 }
}
function backOneLevel(){
  closeWorkspace();
  if(activeCategory||search.value.trim()){
    activeCategory=null;search.value="";rebuildUniverse();selectItem("center",false);fit();
    return "root-universe";
  }
  showBrainOnly();
  return "brain-overview";
}
function currentAgentScreenContext(){
  const visible=el=>{
    if(!el||el.disabled)return false;
    const style=globalThis.getComputedStyle?getComputedStyle(el):null;
    return style?.display!=='none'&&style?.visibility!=='hidden'&&(el.offsetWidth||el.offsetHeight||el.getClientRects?.().length);
  };
  const visibleControls=[...document.querySelectorAll('button,a,[role="button"]')]
    .filter(visible)
    .map(el=>({label:String(el.getAttribute('aria-label')||el.textContent||el.title||'').replace(/\s+/g,' ').trim().slice(0,120),id:el.id||null,action:el.dataset.workAction||null}))
    .filter(x=>x.label)
    .slice(0,24);
  const category=activeCategory?categoryDefs.find(c=>c.id===activeCategory):null;
  const records=items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!search.value.trim()||(x.label+' '+(x.summary||'')+' '+groupFor(x)).toLowerCase().includes(search.value.trim().toLowerCase())));
  const selectedRecord=activeItem&&['project','evidence'].includes(activeItem.kind)?{
    id:activeItem.id,
    label:activeItem.label,
    summary:activeItem.summary||activeItem.desc||'',
    group:groupFor(activeItem),
    evidenceState:activeItem.evidence_state||activeItem.evidenceState||activeItem.type||'PUBLIC',
    repoName:activeItem.repo_name||null,
    repoUrl:activeItem.repo_url||null,
    liveUrl:activeItem.live_url||activeItem.url||null
  }:null;
  const workspaceOpen=!workspace.classList.contains('hidden');
  return {
    surface:'rapidwebdevelop.com',
    page:'LeeWay Digital Brain',
    brainEntered,
    location:workspaceOpen&&activeItem?`${activeItem.label} workspace`:category?.label|| (brainEntered?'PROJECT UNIVERSE':'DIGITAL BRAIN'),
    categoryId:activeCategory,
    categoryLabel:category?.label||null,
    visibleRecordCount:records.length,
    search:String(search.value||''),
    selectedRecord,
    workspace:workspaceOpen?{tab:activeTab,title:String(workspaceTitle?.textContent||''),kicker:String(workspaceKicker?.textContent||'')}:null,
    visibleControls
  };
}
window.__leewayAgentScreenContext=currentAgentScreenContext;
window.__leewayPublicBackOneLevel=backOneLevel;
window.__leewayPublicState=()=>({
  brainEntered,
  activeCategory,
  scale,
  search:String(search?.value||""),
  introActive:Boolean(window.__leewayBrainIntroActive),
  bodyClass:document.body.className,
  screenContext:currentAgentScreenContext()
});
function showBrainOnly(){
 closeWorkspace();hud.classList.add("hidden");activeCategory=null;search.value="";brainEntered=false;
 if(window.__leewayEnterBrainOverview){window.__leewayEnterBrainOverview();return}
 document.body.classList.add("brain-intro");qs("#crumbCurrent").textContent="DIGITAL BRAIN";
 scale=innerWidth<900?.64:.82;panX=0;panY=0;setWorldTransform();
}
window.__leewayPublicBrainEntered=()=>{
 brainEntered=true;
 activeCategory=null;search.value="";
 rebuildUniverse();fit();
 qs("#crumbCurrent").textContent="PROJECT UNIVERSE";
 agentText.textContent="Choose a category to explore its projects. Use Back or Return to Brain at any time.";
};
window.__leewayPublicBrainOverview=()=>{
 brainEntered=false;
 closeWorkspace();hud.classList.add("hidden");activeCategory=null;search.value="";
 rebuildUniverse();
 qs("#crumbCurrent").textContent="DIGITAL BRAIN";
};
function openAgentBubble(focus=false){
 agentBubble.classList.remove("hidden");
 void refreshVoiceChoices();
 if(focus){qs('#typeMessage').open=true;setTimeout(()=>agentInput?.focus({preventScroll:true}),60);}
}
function closeAgentBubble(){
 agentBubble.classList.add("hidden");
 endVoice();
 micBtn.classList.remove("listening");agentState.textContent="Conversation ended";
}
async function submitAgentInput(){
 const text=String(agentInput?.value||"").trim();if(!text)return;
 openAgentBubble(false);agentInput.value="";agentTranscript.textContent=text;agentTranscript.classList.remove("hidden");
 await handleAgentCommand(text,selectedThreadId);
}
function scrollRail(dir){track.scrollBy({left:dir*Math.max(260,track.clientWidth*.72),behavior:"smooth"})}
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
 const p=positions.get(x.id),b=document.createElement("button"),label=String(x.label||"");
 const lengthClass=label.length>42?" veryLongLabel":label.length>26?" longLabel":"";
 b.className="node "+(x.type||"project")+lengthClass+(selected===x.id?" selected":"");b.dataset.id=x.id;b.title=label;b.style.left=p.x+"px";b.style.top=p.y+"px";b.style.setProperty("--zone",x.zone||colors[groupFor(x)]||"#62a8ff");b.innerHTML=`<b>${esc(label)}</b><small>${esc(x.sub||"")}</small>`;
 b.onclick=e=>{e.stopPropagation();if(x.id==="center"){backOneLevel();return}if(x.type==="category"){activeCategory=x.id;rebuildUniverse();const c=categoryDefs.find(y=>y.id===x.id);qs("#crumbCurrent").textContent=c.label;agentText.textContent=`Entering ${c.label}. Select a project or use the carousel below.`;return}selectItem(x.id,true)};return b;
}
function renderNodes(filter=""){
 document.body.classList.toggle("collection-view",Boolean(activeCategory||filter));
 nodesEl.innerHTML="";const cLabel=activeCategory?categoryDefs.find(c=>c.id===activeCategory)?.label:"";
 nodesEl.appendChild(nodeButton({id:"center",label:activeCategory?cLabel:"LEEWAY DIGITAL BRAIN",sub:activeCategory?"tap center to return":"Connect • Reason • Build • Impact",type:"center",zone:"#50e6ff"}));
 const q=filter.toLowerCase();
 if(!activeCategory&&!q){
  categoryDefs.forEach(c=>nodesEl.appendChild(nodeButton({id:c.id,label:c.label,sub:`${items.filter(x=>categoryFor(x)===c.id).length} items`,type:"category",zone:c.id==="cat::evidence"?"#4de0cf":"#62a8ff"})));
 }else{
  items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!q||(x.label+" "+(x.summary||"")+" "+groupFor(x)).toLowerCase().includes(q))).forEach(x=>nodesEl.appendChild(nodeButton({id:x.id,label:x.label,sub:groupFor(x),type:x.kind==="evidence"?"project evidence":"project"})));
 }
}
function rawNarrationFor(x){
  if(x.id==="center")return "Agent Lee here. Come on in, family—the LeeWay Digital Brain is the Creator’s engineering journey made visible, from the first pressure that called the system into being through Standards, Formula, Runtime, Device Bridge, Machine Consciousness, Voice Fabric, and the evidence that separates source code from what actually ran. This is the story with the lights on.";
  if(x.id?.startsWith("cat::"))return `Agent Lee here. ${x.label} carries ${items.filter(y=>categoryFor(y)===x.id).length} records. This lane follows LeeWay’s documented roles, not repository-name guesswork. Pick a project and I’ll tell you what it is, why it matters, and what the evidence can truly prove. We keep the cadence human and the ledger honest.`;
  if(x.kind==="evidence")return `Agent Lee here. ${x.label}. ${x.summary||"This artifact belongs to the public historical research archive; it is not automatically evidence for every project."} Every claim got to know its source before it gets a spotlight.`;
 if(x.core_role){
  const source=x.repo_url?"The named GitHub repository source is available.":"No public source link is exposed for this record.";
   return `Agent Lee here. ${x.label} carries the role of ${x.core_role}. ${x.summary} ${source} Portfolio evidence state: ${x.evidence_state}. A repository or configured link is a trailhead, not proof that production execution completed. We can tell it with rhythm, but we do not let the rhyme outrun the receipt.`;
 }
 const status=x.live_url?"A website link is configured; its backend execution has not been verified.":x.repo_url?"Public source is listed; current runtime operation has not been verified.":"No public repository or live execution is linked.";
  return `Agent Lee here. Let me put ${x.label} in plain sight: ${x.summary||x.desc||"a project in the Creator's software portfolio."} ${status} Ask me why it was developed or open its exact evidence. Every build has a reason, every reason has a trail.`;
}
let expressiveTurn=0;
const expressiveOpeners=[
 'Yo, family—how we doing today?',
 'Hey now—what’s happening?',
 'Good to see you. What we building?',
 'Aight, let’s walk it through.',
 'Come on in—what’s on your mind?',
 'What’s good? I’m with you.'
];
function agentLeeVoice(text){
 const value=String(text||"").replace(/^Agent Lee here(?:[.!—])?\s*/i,'').trim();
 const turn=++expressiveTurn;
 return turn===1||turn%2===0?expressiveOpeners[(turn-1)%expressiveOpeners.length]+' '+value:value;
}
function narrationFor(x){return agentLeeVoice(rawNarrationFor(x));}
async function projectEvidenceContext(x){
 const ctx={
  label:x.label,
  category:groupFor(x),
  summary:x.summary||x.desc||"",
  evidence_state:x.evidence_state||"unknown",
  live_url:x.live_url||null,
  repo_url:x.repo_url||null,
  repo_name:x.repo_name||null,
  language:x.language||null,
  created_at:x.created_at||null,
  updated_at:x.updated_at||null,
  linked_evidence:relevantEvidence(x).slice(0,12).map(e=>({title:e.label,type:e.type,url:e.url||null,date:e.date||null}))
 };
 if(x.repo_name){
  try{
   const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),3500);
   const r=await fetch(`https://api.github.com/repos/4citeB4U/${encodeURIComponent(x.repo_name)}/readme`,{headers:{Accept:"application/vnd.github.raw+json"},signal:ctrl.signal});
   clearTimeout(timer);
   if(r.ok)ctx.readme=(await r.text()).slice(0,14000);
  }catch{}
 }
 return ctx;
}
function projectPresentationPrompt(ctx){
 const status=ctx.live_url?"A website link is configured at "+ctx.live_url:ctx.repo_url?"Public GitHub source is available at "+ctx.repo_url:"No public live runtime is currently verified.";
 return [
  "Give a polished spoken presentation of this selected Digital Brain record.",
  "Use clear, conversational English with calm Secretary-of-State composure, a Southern-cadenced warmth, and light OG hip-hop influence when it helps the human story. Do not caricature the voice, force slang, or repeat introductions. Start with a direct answer in two to four sentences; provide more detail when asked.",
  "Cover only evidence-supported points: what it is, why it exists, the problem it addresses, documented architecture/capabilities, live status, available evidence/source, and how it fits the broader LeeWay systems lineage.",
  "HARD EVIDENCE RULE: every factual claim must be directly supported by the JSON context or README excerpt below.",
  "Never upgrade a source label into a stronger claim. Do not say full-stack, production-ready, complete, proven, revenue-generating, autonomous, or deployed unless those exact ideas are supported in the supplied evidence.",
  "If evidence is incomplete, say so in the presentation instead of filling the gap.",
  "Do not invent motives, metrics, customers, architecture, revenue, performance, or completion status.",
  "Evidence context:",
  JSON.stringify(ctx)
 ].join("\n");
}
function resolveItem(id){
 if(id==="center")return {id,label:"LeeWay Digital Brain",group:"Presentation Core",summary:"The public presentation core for Leonard Lee and LeeWay Industries: projects, evidence, systems lineage, and governed AI in one explorable universe.",evidence_state:"PUBLIC LINEAGE",kind:"identity"};
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
 hud.classList.remove("hidden");if(open){silenceSpeechOnly();openWorkspace(activeItem,activeItem.kind==="evidence"?"evidence":"overview");}
}
function renderCarousel(filter=""){
 const q=filter.toLowerCase(),rows=items.filter(x=>(!activeCategory||categoryFor(x)===activeCategory)&&(!q||(x.label+" "+(x.summary||"")+" "+groupFor(x)).toLowerCase().includes(q)));track.innerHTML="";
 rows.forEach(x=>{const b=document.createElement("button");b.className="projectCard"+(selected===x.id?" active":"");b.innerHTML=`<div class="cardTop"><span class="cardType">${esc(x.kind==="evidence"?x.type:"PROJECT")}</span><span class="cardEvidence">${esc(x.evidence_state||"")}</span></div><h3>${esc(x.label)}</h3><p>${esc(x.summary||"")}</p>`;b.onclick=()=>selectItem(x.id,true);track.appendChild(b)});qs("#carouselCount").textContent=`${rows.length} items`;
}
function rebuildUniverse(){const q=search.value.trim();buildLayout(q);renderEdges(q);renderNodes(q);renderCarousel(q);fit()}
function openWorkspace(x,tab="overview"){activeItem=x;activeTab=tab;workspace.classList.remove("hidden");workspaceTitle.textContent=x.label;workspaceKicker.textContent=x.kind==="evidence"?"EVIDENCE WORKSPACE":"PROJECT WORKSPACE";const ext=x.live_url||x.url||x.repo_url;openExternal.classList.toggle("hidden",!ext);if(ext)openExternal.href=ext;document.querySelectorAll(".workspaceTabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));renderWorkspace()}
function closeWorkspace(){workspace.classList.add("hidden");hud.classList.add("hidden");qs("#crumbCurrent").textContent=activeCategory?categoryDefs.find(c=>c.id===activeCategory)?.label:"PROJECT UNIVERSE"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function overviewHtml(x){return `<div class="workspaceGrid"><section class="workspacePanel"><h3>What this is</h3><p>${esc(x.summary||x.desc||"Public project record.")}</p><div class="hudFacts">${[["Category",groupFor(x)],["Evidence",x.evidence_state||"PUBLIC"],["Language",x.language||"—"],["Created",x.created_at?.slice?.(0,10)||x.date||"—"],["Updated",x.updated_at?.slice?.(0,10)||"—"],["Repository size",x.size!=null?Math.round(x.size/1024)+" MB":"—"]].map(([a,b])=>`<div class="hudFact"><b>${a}</b><span>${esc(b)}</span></div>`).join("")}</div></section><section class="workspacePanel"><h3>Agent Lee</h3><p>${esc(narrationFor(x))}</p><div class="hudButtons">${x.live_url?`<button data-work-action="live">Live View</button>`:""}${x.repo_name?`<button data-work-action="files">Browse Files</button>`:""}<button data-work-action="evidence">Evidence</button><button data-work-action="speak">Narrate</button></div></section></div>`}
function renderLive(x){if(!x.live_url){workspaceBody.innerHTML=`<div class="workspacePanel"><h3>No configured preview URL</h3><p>No publicly configured browser preview is associated with this project.</p></div>`;return}workspaceBody.innerHTML=`<div class="workspacePanel"><p>Configured website preview only. Page visibility does not prove backend execution, independent verification, or production readiness. If framing is blocked, use Open Full.</p></div><iframe class="liveFrame" src="${esc(x.live_url)}" title="${esc(x.label)} linked website preview" loading="eager" sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"></iframe>`}
async function renderFiles(x,path=""){if(!x.repo_name){workspaceBody.innerHTML=`<div class="workspacePanel"><h3>No GitHub repository</h3><p>This record comes from the Estate Projection rather than a public repository.</p></div>`;return}workspaceBody.innerHTML=`<div class="fileBrowser"><div class="fileList"><div class="fileListHead">Loading repository…</div></div><div class="filePreview"><div class="filePreviewInner">Select a file to preview it.</div></div></div>`;const list=workspaceBody.querySelector(".fileList"),preview=workspaceBody.querySelector(".filePreview");try{const u=`https://api.github.com/repos/4citeB4U/${encodeURIComponent(x.repo_name)}/contents/${path}?ref=${encodeURIComponent(x.default_branch||"main")}`;const r=await fetch(u,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error("GitHub "+r.status);const data=await r.json();const rows=Array.isArray(data)?data:[data];list.innerHTML=`<div class="fileListHead">${esc(x.repo_name)} /${esc(path)}</div>`;rows.sort((a,b)=>(a.type===b.type?a.name.localeCompare(b.name):a.type==="dir"?-1:1)).forEach(f=>{const b=document.createElement("button");b.className="fileEntry";b.innerHTML=`<span class="fileGlyph">${f.type==="dir"?"▣":"▤"}</span><span class="fileName">${esc(f.name)}</span>`;b.onclick=()=>f.type==="dir"?renderFiles(x,f.path):previewFile(f,preview);list.appendChild(b)})}catch(e){list.innerHTML=`<div class="fileListHead">Unable to load files</div><div class="filePreviewInner">${esc(e.message)}</div>`}}
async function previewFile(f,host){host.innerHTML=`<div class="filePreviewInner">Loading ${esc(f.name)}…</div>`;const ext=(f.name.split(".").pop()||"").toLowerCase(),url=f.download_url||f.html_url;if(/png|jpg|jpeg|gif|webp|svg/.test(ext)){host.innerHTML=`<div class="filePreviewInner"><img src="${esc(url)}" alt=""><p><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></p></div>`;return}if(ext==="pdf"){host.innerHTML=`<iframe class="liveFrame" src="${esc(url)}"></iframe>`;return}if(/mp4|webm/.test(ext)){host.innerHTML=`<div class="filePreviewInner"><video controls src="${esc(url)}"></video></div>`;return}try{const r=await fetch(url);const t=await r.text();host.innerHTML=`<div class="filePreviewInner"><div class="hudButtons"><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></div><pre>${esc(t.slice(0,180000))}</pre></div>`}catch{host.innerHTML=`<div class="filePreviewInner"><a class="workspaceAction" target="_blank" href="${esc(f.html_url)}">Open on GitHub</a></div>`}}
function relevantEvidence(x){
 if(x.kind==="evidence")return [x];
 // Evidence must have an exact project/repository binding, never an overlapping keyword.
 const attached=evidence.filter(e=>e.project_id===x.id||(x.repo_name&&e.repo_name===x.repo_name));
 const source=globalThis.LeeWayCorePortfolio?.evidenceFor(x)||[];
 const seen=new Set();
 return [...source,...attached].filter(e=>{const key=e.url||e.id;if(!key||seen.has(key))return false;seen.add(key);return true;});
}
function renderEvidence(x){
 if(x.kind==="evidence"){
  const directDeck=decks.find(z=>z.title===x.label);
  openEvidenceDetail(x,directDeck);
  return;
 }
 const rows=relevantEvidence(x);
 workspaceBody.innerHTML=`<div class="workspacePanel"><h3>Evidence for ${esc(x.label)}</h3><p>Repository source, CI history, configured website links, and real execution are different claim classes. This page does not convert one into another. Only evidence explicitly associated with this project is shown.</p><p><b>Current portfolio status:</b> ${esc(x.evidence_state||"NOT VERIFIED")}</p></div><div class="evidenceGrid"></div>`;
 const g=workspaceBody.querySelector(".evidenceGrid");
 if(x.live_url){
  const linked={id:"linked::"+x.id,label:x.label+" — Configured website",summary:"A website URL is configured, but the current backend and physical execution have not been verified by this portfolio.",type:"Configured Website",url:x.live_url,evidence_state:"LINK ONLY · NOT EXECUTION"};
  const tile=document.createElement("article");tile.className="evidenceTile";
  tile.innerHTML=`<div class="evidenceTileBody"><b>${esc(linked.label)}</b><small>LINK ONLY · NOT EXECUTION</small></div>`;
  tile.onclick=()=>openEvidenceDetail(linked,null);g.appendChild(tile);
 }
 rows.forEach(e=>{
  const d=e.kind==="evidence"?decks.find(z=>z.title===e.label):null;
  const tile=document.createElement("article");tile.className="evidenceTile";
  const title=e.label||e.title,classification=e.claim||e.evidence_state||e.type||"SOURCE REFERENCE";
  tile.innerHTML=`${d?`<img src="${esc(d.thumbnail)}" alt="">`:""}<div class="evidenceTileBody"><b>${esc(title)}</b><small>${esc(classification)}</small></div>`;
  tile.onclick=()=>openEvidenceDetail({...e,label:title},d);g.appendChild(tile);
 });
 if(!g.children.length)g.innerHTML='<div class="workspacePanel"><p>No project-specific public evidence has been admitted for this repository. The global research archive remains separate.</p></div>';
}
function openEvidenceDetail(e,d){
 workspaceTitle.textContent=e.label||e.title;
 const citedType=e.type||'Evidence reference';
 if(["Source Code","CI History","Configured Website"].includes(citedType)&&e.url){
  workspaceBody.innerHTML=`<section class="workspacePanel"><h3>${esc(citedType)}</h3><p>${esc(e.summary||e.claim||"Linked public source. This is not physical execution evidence.")}</p><p>Current claim: ${esc(e.claim||e.evidence_state||"SOURCE ONLY")}</p><div class="hudButtons"><a class="workspaceAction" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Open original reference</a></div></section>`;
  return;
 }
 if(d){
  workspaceBody.innerHTML=`<iframe class="liveFrame" src="${esc(d.pdf)}" title="${esc(e.label)}"></iframe><div class="slideStrip">${d.slides.map(src=>`<img loading="lazy" src="${esc(src)}" alt="">`).join("")}</div><div class="hudButtons"><a class="workspaceAction" href="${esc(d.pptx)}">PowerPoint</a><a class="workspaceAction" href="${esc(d.pdf)}" target="_blank">PDF</a></div>`;
  return;
 }
 if(e.url&&/\.(png|jpe?g)$/i.test(e.url)){
  workspaceBody.innerHTML=`<div class="workspacePanel"><img style="max-width:100%;border-radius:12px" src="${esc(e.url)}" alt=""><p>${esc(e.summary||"")}</p></div>`;return;
 }
 workspaceBody.innerHTML=`<div class="workspacePanel"><p>${esc(e.summary||"Historical evidence reference")}</p><p>Evidence has not been upgraded to runtime proof.</p></div>`;
}
function renderWorkspace(){if(!activeItem)return;if(activeTab==="overview")workspaceBody.innerHTML=overviewHtml(activeItem);else if(activeTab==="live")renderLive(activeItem);else if(activeTab==="files")renderFiles(activeItem);else renderEvidence(activeItem)}
let tourEpoch=0,voiceConnecting=false;
const threadWorkplane=new LeeWayThreadWorkplane({maxHands:8,onState:()=>setTimeout(renderThreadState,0)});
let selectedThreadId=threadWorkplane.mainThread.id,pendingVoiceThreadId=null;
function threadDisplay(thread){return (thread.kind==='main'?'Main task':'Side chat')+' ['+thread.id+']';}
function renderThreadState(){
 const select=qs('#agentThreadSelect'),status=qs('#agentThreadStatus'),box=select?.closest('.agent-thread-controls');if(!select)return;
 const threads=threadWorkplane.listThreads(),existing=new Set([...select.options].map(o=>o.value));
 for(const thread of threads)if(!existing.has(thread.id)){const option=document.createElement('option');option.value=thread.id;option.textContent=threadDisplay(thread);select.append(option);}
 if(!select.value||!threadWorkplane.getThread(select.value))select.value=selectedThreadId;
 const current=threadWorkplane.getThread(select.value)||threadWorkplane.mainThread,snap=threadWorkplane.snapshot(),running=snap.hands.filter(h=>h.status==='RUNNING');
 if(status)status.textContent=threadDisplay(current)+' · '+current.status.toLowerCase()+' · '+running.length+'/'+snap.maxHands+' hands active';
 if(box)box.dataset.busy=String(running.length>0);
}
function selectThread(threadId){
 const thread=threadWorkplane.selectThread(threadId);selectedThreadId=thread.id;const select=qs('#agentThreadSelect');if(select)select.value=thread.id;
 if(thread.lastOutput){agentText.textContent=thread.lastOutput;agentNarration.textContent=thread.lastOutput;}
 renderThreadState();return thread;
}
function createSideThread(){const side=threadWorkplane.createSideThread();selectThread(side.id);return side;}
let fabricSpeechEpoch=0;
function interruptFabricSpeech(reason='microphone-onset'){
 fabricSpeechEpoch++;
 LeeWayVoiceMetrics.record('fabric-interrupt',{reason,epoch:fabricSpeechEpoch});
 browserListener?.clearPlaybackText?.();
 void globalThis.LeeWayPortfolioVoiceSession?.stop();
}
function speakFromFabric(text,title='Agent Lee'){
 if(!text||conversationSession?.state!=='listening'||!globalThis.LeeWayPortfolioVoiceSession)return Promise.resolve();
 const epoch=++fabricSpeechEpoch;
 browserListener?.setPlaybackText?.(text);
 return globalThis.LeeWayPortfolioVoiceSession.speak(text).then(result=>{
  if(epoch!==fabricSpeechEpoch)return {state:'SUPERSEDED'};
  if(result?.state==='SUPERSEDED')return result;
  if(result?.state==='VOICE_FABRIC_RESPONSE')agentState.textContent=title+' · Voice Fabric completed its playback request; human hearing not independently tested.';
  else agentState.textContent=title+' · Voice Fabric '+String(result?.state||'unavailable');
  return result;
 }).catch(error=>{if(conversationSession.state==='listening')agentState.textContent=title+' · Voice Fabric unavailable: '+String(error.message||error);}).finally(()=>{if(epoch===fabricSpeechEpoch)browserListener?.clearPlaybackText?.();});
}
function threadSpeech(thread,text){
 if(!text||conversationSession?.state!=='listening')return Promise.resolve();
 return speakFromFabric(text,threadDisplay(thread));
}
function showPublicAnswerSources(sources=[]){
 const holder=qs('#agentEvidence'),list=qs('#agentEvidenceList');
 if(!holder||!list)return;
 list.replaceChildren();
 for(const value of sources.slice(0,8)){
  try{
   const url=new URL(String(value));
   if(url.protocol!=='https:'||url.hostname!=='github.com'||!url.pathname.startsWith('/4citeB4U/'))continue;
   const item=document.createElement('li'),link=document.createElement('a');
   link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
   link.textContent=url.pathname.split('/').slice(1,4).join(' / ')||'LeeWay source';
   item.append(link);list.append(item);
  }catch{}
 }
 holder.hidden=list.children.length===0;
 if(holder.hidden)holder.open=false;
}
qs('#clearChatHistory').addEventListener('click',()=>{voiceController.history=[];for(const thread of threadWorkplane.threads.values())thread.history=[];});
let completedDraft='';
const knowledgeReady=LeeWayKnowledge.load().then(()=>{qs('#leewaySourceStatus').textContent='Pinned Agent Skills and Formula sources loaded. Runtime/Formula execution is reported separately from source authority.';}).catch(error=>{qs('#leewaySourceStatus').textContent=error.message;});
qs('#downloadAgentDraft').onclick=()=>{if(!completedDraft)return;const url=URL.createObjectURL(new Blob([completedDraft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='agent-lee-draft.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const voiceController=new LeeWayVoiceController({
 onState:message=>agentState.textContent=message,
 onCancel:()=>{tourEpoch++}
});
async function refreshVoiceChoices(){
 const select=qs('#agentVoiceSelect'),status=qs('#agentVoiceStatus');
 if(!select)return;
 try{
  const voices=await globalThis.LeeWayPortfolioVoiceSession.listVoices();
  const selected=globalThis.LeeWayPortfolioVoiceSession.status().voicePackageId;
  select.replaceChildren(...voices.map(pkg=>{const option=document.createElement('option');option.value=pkg.id;option.textContent=pkg.name;return option;}));
  if(selected&&voices.some(pkg=>pkg.id===selected))select.value=selected;
  select.disabled=voices.length===0;
  if(status)status.textContent=voices.length?'Voice Fabric owns the speaker identity. Choose a verified package; device speech is not used.':'No verified LeeWay voice packages are available.';
 }catch(error){
  select.disabled=true;
  if(status)status.textContent='LeeWay Voice Fabric catalog unavailable: '+String(error.message||error);
 }
}
qs('#agentVoiceSelect')?.addEventListener('change',async event=>{
 const select=event.currentTarget,status=qs('#agentVoiceStatus'),id=select.value;
 select.disabled=true;
 if(status)status.textContent='Selecting the LeeWay Voice Fabric speaker…';
 interruptFabricSpeech('voice-selection');
 try{
  const pkg=await globalThis.LeeWayPortfolioVoiceSession.selectVoice(id);
  await globalThis.LeeWayPortfolioVoiceSession.prime();
  if(status)status.textContent=pkg.name+' · selected by LeeWay Voice Fabric.';
 }catch(error){
  if(status)status.textContent='Voice selection failed closed: '+String(error.message||error);
 }finally{select.disabled=false;}
});
const browserListener=new LeeWayBrowserListener({
 onState:message=>{agentState.textContent=message;qs("#recognitionLoadStatus").textContent=browserListener.ready?"LeeWay speech input ready.":message;qs("#recognitionProgress").hidden=browserListener.ready;},
 onSpeech:()=>{
  const active=threadWorkplane.getThread(selectedThreadId);pendingVoiceThreadId=active?.kind==='main'?'AUTO_SIDE':active?.id||selectedThreadId;
  if(browserListener.isPlaybackActive?.()){LeeWayVoiceMetrics.record('speech-onset-during-playback');return;}
  interruptFabricSpeech();LeeWayVoiceMetrics.record('speech-onset');
 },
 onListening:active=>{voiceController.listening=active;listening=active;micBtn.classList.toggle("listening",active);if(!active&&conversationSession.requested&&conversationSession.state==="listening")conversationSession.mute();},
 onTranscript:text=>{
  if(browserListener.isLikelyPlaybackEcho?.(text)){LeeWayVoiceMetrics.record('playback-echo-discarded',{characters:String(text).length});return;}
  if(browserListener.isPlaybackActive?.())interruptFabricSpeech('user-barge-in');
  agentTranscript.textContent=text;agentTranscript.classList.remove('hidden');const route=pendingVoiceThreadId;pendingVoiceThreadId=null;void handleAgentCommand(text,route)
 },
 onMetric:(stage,detail)=>LeeWayVoiceMetrics.record(stage,detail),
 onProgress:p=>showModelProgress("recognition",p)
});
function showModelProgress(kind,p){
 const bar=qs("#"+kind+"Progress"),label=qs("#"+kind+"LoadStatus");
 if(!bar||!label)return;
 bar.hidden=false;
 if(p.message){bar.removeAttribute("value");label.textContent=p.message;return;}
 if(p.total&&p.loaded!=null){bar.max=p.total;bar.value=p.loaded;label.textContent=`LeeWay speech input: ${Math.round(p.loaded/p.total*100)}% of ${p.file?.split("/").pop()||"voice runtime"}`;}
 else{bar.removeAttribute("value");label.textContent="Preparing LeeWay speech input...";}
}
 void refreshVoiceChoices();
function cancelAgentGeneration(){
 browserListener.cancelUtterance();
 voiceController.stop();
}
function silenceSpeechOnly(){void globalThis.LeeWayPortfolioVoiceSession?.stop();browserListener.cancelUtterance();}
function endVoice(){conversationSession.mute()}
function stopSpeech(){void globalThis.LeeWayPortfolioVoiceSession?.stop();browserListener.cancelUtterance();agentState.textContent=conversationSession.requested?'Stopped speaking. Still listening.':'Speech stopped. Microphone is off.';}
function scoreProject(q,p){const hay=(p.label+" "+(p.repo_name||"")+" "+(p.summary||"")+" "+(p.group||"")).toLowerCase();if(hay.includes(q))return 100+q.length;return q.split(/\s+/).reduce((n,w)=>n+(w.length>2&&hay.includes(w)?5:0),0)}
function bestProject(q){return projects.map(p=>[scoreProject(q,p),p]).sort((a,b)=>b[0]-a[0])[0]}
function navigateAgentRequest(text){
 const q=text.trim().toLowerCase();
 if(/(?:contact|reach|email|message).*(?:leonard|creator)|(?:leonard|creator).*(?:contact|reach|email|message)/.test(q))return "You can contact Leonard Lee directly at leonardlee6@outlook.com. His public GitHub profile is @4citeB4U at github.com/4citeB4U; for project-specific public communication, use the relevant repository channels where available.";
 if(/(?:build|make|create|develop).*(?:for me|for us|something similar|like this)|(?:service|hire|work with leonard)/.test(q))return "Yes. Leonard provides guidance and development support for comparable websites, AI workflows, governed agent systems, and related digital experiences. This public experience does not publish pricing; contact him directly at leonardlee6@outlook.com.";
 if(/pocket agent/.test(q))return "Pocket Agent Lee is planned as a subscriber gift and early-access release. The source project exists, but this site does not claim the public consumer install and distribution path is complete yet.";

 if(/^(?:go |back |return )?(?:home|back|reset|close|whole brain|to the brain)[.!?]*$/.test(q)){showBrainOnly();return "Back at the Digital Brain.";}
 if(/^(?:show|open|take me to|go to) (?:the )?(?:digital brain|project universe|main brain|brain overview)[.!?]*$/.test(q)){showBrainOnly();return "We’re back at the Digital Brain overview. The whole house is in view—ask me for a lane, a project, or the story behind what you’re seeing.";}
 if(activeItem&&/^(?:show|open|browse)(?: me)?(?: the| project)? (?:files?|source|code)[.!?]*$/.test(q)){openWorkspace(activeItem,"files");return "Opening the project files.";}
 if(activeItem&&/^(?:show|open)(?: me)?(?: the| project)? (?:live view|website|demo)[.!?]*$/.test(q)){openWorkspace(activeItem,"live");return activeItem.live_url?"Opening the listed project link.":"No live view is listed for this project.";}
 if(activeItem&&/^(?:show|open)(?: me)?(?: the| project)? (?:evidence|proof|presentation)[.!?]*$/.test(q)){openWorkspace(activeItem,"evidence");return "Opening the linked evidence.";}
 if(/^(?:show|open|take me to|go to) /.test(q)){
   const subject=q.replace(/^(?:show|open|take me to|go to) +(?:the )?/,'').trim();
   const categoryHit=categoryDefs.find(c=>{
    const label=c.label.toLowerCase(),compact=label.replace(/[^a-z0-9]+/g,' ');
    return subject===label||subject===compact||subject.includes(compact)||compact.includes(subject);
   });
   if(categoryHit){
    closeWorkspace();activeCategory=categoryHit.id;search.value='';rebuildUniverse();selectItem(categoryHit.id,false);
    return `Opening ${categoryHit.label}. This lane has ${items.filter(x=>categoryFor(x)===categoryHit.id).length} records; pick one and I’ll walk you through the purpose and the proof.`;
   }
 }
 if(/^(show|open|take me to|find|go to) /.test(q)){
   const subject=q.replace(/^(show|open|take me to|find|go to) +/,"").trim(),hit=bestProject(subject);
   if(hit&&hit[0]>=10){selectItem(hit[1].id,false);openWorkspace(hit[1],"overview");return narrationFor(hit[1]);}
 }
 return null;
}
async function handleAgentCommand(raw,requestedThreadId=selectedThreadId){
 let text=raw.trim();if(!text)return;
 agentTranscript.textContent=text;agentTranscript.classList.remove("hidden");
 if(globalThis.LeeWayPauseIntent?.(text)){void globalThis.LeeWayPortfolioVoiceSession?.stop();return;}
 if(globalThis.LeeWayResumeIntent?.(text)){agentState.textContent='I am listening for your next turn.';return;}
 if(LeeWayStopIntent(text)){void globalThis.LeeWayPortfolioVoiceSession?.stop();return;}
 let thread;
 if(/^(?:main|main chat|main task)[:,]?\s+/i.test(text)){text=text.replace(/^(?:main|main chat|main task)[:,]?\s+/i,'');thread=threadWorkplane.mainThread;}
 else if(/^(?:side|side chat)[:,]?\s+/i.test(text)){text=text.replace(/^(?:side|side chat)[:,]?\s+/i,'');thread=threadWorkplane.getThread(selectedThreadId)?.kind==='side'?threadWorkplane.getThread(selectedThreadId):createSideThread();}
 else if(requestedThreadId==='AUTO_SIDE')thread=createSideThread();
 else thread=threadWorkplane.getThread(requestedThreadId)||threadWorkplane.getThread(selectedThreadId)||threadWorkplane.mainThread;
 selectThread(thread.id);recordChat('You · '+threadDisplay(thread),text);threadWorkplane.remember(thread.id,"user",text);
 browserListener.cancelUtterance();
 showPublicAnswerSources([]);
 const navigation=navigateAgentRequest(text);
  if(navigation){const voicedNavigation=agentLeeVoice(navigation);agentText.textContent=voicedNavigation;agentNarration.textContent=voicedNavigation;recordChat('Agent Lee · '+threadDisplay(thread),voicedNavigation);threadWorkplane.remember(thread.id,"assistant",voicedNavigation);void threadSpeech(thread,voicedNavigation);return voicedNavigation;}
 const machineAnswer=await globalThis.LeeWayMachineConsciousnessPublic?.answer(text,currentAgentScreenContext()).catch(()=>null);
 if(machineAnswer){
  // Public Machine Consciousness projection: deterministic source knowledge, no carrier exposure.
  thread.lastOutput=machineAnswer.text;
  if(selectedThreadId===thread.id){agentText.textContent=machineAnswer.text;agentNarration.textContent=machineAnswer.text;}
  completedDraft=machineAnswer.text;qs('#downloadAgentDraft').disabled=false;
  const evidencePanel=qs('#agentEvidence'),evidenceList=qs('#agentEvidenceList');
  if(evidencePanel&&evidenceList){evidenceList.innerHTML=machineAnswer.sources.map(source=>`<li><a target="_blank" rel="noopener" href="${esc(source)}">${esc(source)}</a></li>`).join('');evidencePanel.hidden=false;}
  recordChat('Agent Lee · '+threadDisplay(thread)+' · Machine Consciousness',machineAnswer.text);
  threadWorkplane.remember(thread.id,'assistant',machineAnswer.text);
  agentState.textContent=machineAnswer.title+' · deterministic public projection · no LLM';
  renderThreadState();
  if(conversationSession.state==='listening'&&globalThis.LeeWayPortfolioVoiceSession)void speakFromFabric(machineAnswer.text,machineAnswer.title);
  return machineAnswer.text;
 }
 const narrative=globalThis.LeeWayEngineeringJourney?.answer(text);
 if(narrative){
  // Curated public narrative: no Formula evaluation, native action, or LLM execution is claimed.
   const voicedNarrative=agentLeeVoice(narrative.text);
   thread.lastOutput=voicedNarrative;
   if(selectedThreadId===thread.id){agentText.textContent=voicedNarrative;agentNarration.textContent=voicedNarrative;}
   completedDraft=voicedNarrative;qs('#downloadAgentDraft').disabled=false;
   recordChat('Agent Lee · '+threadDisplay(thread)+' · engineering journey',voicedNarrative);
   threadWorkplane.remember(thread.id,'assistant',voicedNarrative);
  agentState.textContent=narrative.title+' · '+narrative.sources.length+' documented sources · no LLM';
  renderThreadState();
  showPublicAnswerSources(narrative.sources);
   void speakFromFabric(voicedNarrative,narrative.title);
   return voicedNarrative;
 }
 const message=agentLeeVoice("I don’t fully understand that one yet, family. That part isn’t in my admitted public record, and I won’t make up an answer just to keep the sound moving. Say it another way, or point me toward the Creator, a LeeWay project, the Digital Brain, diagnostics, Continuum, Voice Fabric, or the engineering journey, and I’ll walk it with you plain.");
 agentText.textContent=message;agentNarration.textContent=message;recordChat('Agent Lee · '+threadDisplay(thread),message);threadWorkplane.remember(thread.id,"assistant",message);void threadSpeech(thread,message);
}
qs('#agentEngineeringStory').onclick=()=>{void startEngineeringJourney();};
const conversationSession=new LeeWayConversationSession({
  // Capture and recognition feed the deterministic Machine Consciousness route; Voice Fabric owns speech output.
 prepare:async()=>true,
 start:()=>browserListener.start(),stop:()=>browserListener.stop(),silence:silenceSpeechOnly,
 onStopped:active=>{agentState.textContent=active?'Stopped speaking. Still listening.':'Speech stopped. Microphone is off.';},
 onState:state=>{
  voiceConnecting=state==='preparing';const active=conversationSession.requested;
  micBtn.setAttribute('aria-pressed',String(active));micBtn.setAttribute('aria-label',active?'Mute Agent Lee microphone and speech':'Start live conversation with Agent Lee');
  micBtn.dataset.mode=state;qs('#agentStartVoice').textContent=active?'Mute conversation':'Start live conversation';qs('#agentStartVoice').setAttribute('aria-pressed',String(active));
  agentState.textContent=state==='listening'?(browserListener.ready?'Listening. Speak naturally; tap Agent Lee to mute.':'Microphone is on. Preparing speech input...'):state==='preparing'?'Opening microphone. Allow access if your browser asks.':state==='setup'?'Microphone could not start. Check browser permission.':'Muted. Microphone and speech are off.';
 },onError:error=>{agentState.textContent=error.message||'Microphone unavailable. You can type instead.';}
});
async function toggleMic(){
 openAgentBubble(false);
 const starting=!conversationSession.requested;
 const opening=conversationSession.toggle();
 await opening;
 if(starting&&conversationSession.requested){
   const greeting=agentLeeVoice('The conversation is open. Speak naturally; I am listening through the LeeWay Voice Fabric.');
   agentText.textContent=greeting;agentNarration.textContent=greeting;agentState.textContent='Listening. Voice Fabric prepares when Agent Lee has an answer; speak when ready.';
 }
}
async function startEngineeringJourney(){
 openAgentBubble(false);
 globalThis.LeeWayEngineeringJourney?.reset();
 if(!conversationSession.requested){
  // A direct click requests microphone permission. Recognition and Voice Fabric are independent.
  const opening=conversationSession.toggle();
  await opening;
 }
 // This skips the separate prerecorded welcome so it cannot speak over the live story.
 silenceSpeechOnly();
 await handleAgentCommand('tell me the story');
 if(conversationSession.state!=='listening')agentState.textContent='Story available as text. Allow microphone access to continue hands-free.';
}
if(typeof window!=='undefined')window.addEventListener('leeway-start-engineering-conversation',()=>{void startEngineeringJourney();});
let mobileVisibilityTimer=0;
function clearMobileVisibilityTimer(){if(mobileVisibilityTimer){clearTimeout(mobileVisibilityTimer);mobileVisibilityTimer=0;}}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{
 clearMobileVisibilityTimer();
 if(!document.hidden||!conversationSession.requested)return;
 // Mobile browsers briefly hide the document while showing microphone permission
 // or changing the audio route. Do not tear down a connection during that transient.
 if(conversationSession.connecting)return;
 mobileVisibilityTimer=setTimeout(()=>{
  mobileVisibilityTimer=0;
  if(document.hidden&&conversationSession.requested)endVoice();
 },5000);
});
async function startTour(){
 // The tour is a real conversation entry, not a timed slideshow or model-dependent recording.
 silenceSpeechOnly();const epoch=++tourEpoch;
 openAgentBubble(false);
 if(!conversationSession.requested){
  // The button click is the browser gesture that requests microphone permission.
  const opening=conversationSession.toggle();
  await opening;
 }
 if(epoch!==tourEpoch)return;
 if(conversationSession.state!=='listening'){
  agentState.textContent='Guided tour needs microphone permission for a hands-free conversation. Typed project exploration remains available.';
  return;
 }
 const stages=globalThis.LeeWayCorePortfolio?.tour()||[];
 const intro=globalThis.LeeWayEngineeringJourney?.answer('tell me the story');
 const steps=[];
 if(intro)steps.push({title:'Why LeeWay began',text:intro.text,sources:intro.sources});
 const identity=globalThis.LeeWayEngineeringJourney?.answer('Why Agent Lee?');
 if(identity)steps.push({title:'Why Agent Lee exists',text:identity.text,sources:identity.sources});
 for(const stage of stages){
  const project=projects.find(x=>x.core_repo_name===stage.repoName||x.repo_name===stage.repoName);
  if(!project)continue;
  const text='Our next chapter is '+stage.title+'. '+stage.narrative+' '+narrationFor(project);
  steps.push({title:stage.repoName,text,project,sources:project.repo_url?[project.repo_url]:[]});
 }
 if(!steps.length){agentState.textContent='The source-grounded LeeWay tour inventory is unavailable. No invented tour was played.';return;}
 for(let i=0;i<steps.length;i++){
  if(epoch!==tourEpoch||conversationSession.state!=='listening')return;
  const chapter=steps[i];
  if(chapter.project){selectItem(chapter.project.id,false);openWorkspace(chapter.project,'overview');}
  agentText.textContent=chapter.text;agentNarration.textContent=chapter.text;
  showPublicAnswerSources(chapter.sources||[]);
  agentState.textContent='Guided journey · chapter '+(i+1)+' of '+steps.length+' · '+chapter.title;
  const result=await speakFromFabric(chapter.text,chapter.title);
  if(epoch!==tourEpoch)return;
  if(result?.state!=='VOICE_FABRIC_RESPONSE'){
   agentState.textContent='Tour stopped: Voice Fabric did not confirm the spoken chapter. No silent slide advancement.';
   return;
  }
 }
 if(epoch===tourEpoch)agentState.textContent='Guided journey complete. I am still listening for your questions.';
}
function fit(){const height=qs("#stage").clientHeight;scale=innerWidth<900?.58:Math.min(.78,Math.max(.38,(height-130)/490));panX=0;panY=0;setWorldTransform()}
function bindAppearance(){
 const panel=appearancePanel;
 qs("#appearanceBtn").onclick=()=>panel.classList.toggle("hidden");
 qs("#appearanceClose").onclick=()=>panel.classList.add("hidden");
 qs("#appearanceReset").onclick=()=>applyAppearance({bg:"#010713",accent:"#00b7e8",speed:.52,horizontal:10,vertical:6.5,secondary:.30,stripHeight:4,hue:0,saturation:.90,brightness:.78,dotColor:"#35d8ff",dotVariation:16,dotStrength:.22,labelScale:1});
 const bindings={
  bgColor:["bg",String],accentColor:["accent",String],nucleusSpeedRange:["speed",Number],
  nucleusHorizontalRange:["horizontal",Number],nucleusVerticalRange:["vertical",Number],
  nucleusHueRange:["hue",Number],nucleusSaturationRange:["saturation",Number],
  nucleusBrightnessRange:["brightness",Number],nucleusDotColor:["dotColor",String],
  nucleusDotVariationRange:["dotVariation",Number],nucleusDotStrengthRange:["dotStrength",Number],
  labelScaleRange:["labelScale",Number]
 };
 Object.entries(bindings).forEach(([id,[key,transform]])=>{const el=qs("#"+id);if(el)el.oninput=e=>applyAppearance({[key]:transform(e.target.value)})});
 panel.querySelectorAll(".nucleusPreset").forEach(b=>b.onclick=()=>{const p=nucleusPresets[b.dataset.nucleus];if(p)applyAppearance(p)});
}
search.oninput=()=>{activeCategory=null;rebuildUniverse()};
qs("#hudClose").onclick=()=>hud.classList.add("hidden");
 qs("#speakBtn").onclick=()=>{silenceSpeechOnly();void speakFromFabric(agentNarration.textContent||agentText.textContent,"Agent Lee")};
qs("#agentStop")?.addEventListener("click",stopSpeech);
qs("#agentEndVoice")?.addEventListener("click",endVoice);
qs("#agentStartVoice")?.addEventListener("click",()=>void toggleMic());
window.addEventListener("pagehide",event=>{clearMobileVisibilityTimer();if(!event.persisted)endVoice();});
qs("#tourBtn").onclick=startTour;
qs('#agentGuidedTour').onclick=()=>{void startTour();};
qs("#resetBtn").onclick=showBrainOnly;
qs(".crumb.active").onclick=backOneLevel;
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!workspace.classList.contains("hidden")){closeWorkspace();return}if(e.key==="Escape"){e.preventDefault();backOneLevel()}});
micBtn.onclick=()=>void toggleMic();
qs('#guideExplore').onclick=()=>{qs('#enterBrainBtn').click();};
qs("#workspaceClose").onclick=closeWorkspace;
qs("#backOneLevelBtn").onclick=()=>backOneLevel();
qs("#wholeBrainCrumb").onclick=()=>showBrainOnly();
agentBubbleClose.onclick=closeAgentBubble;
qs('#agentThreadSelect').onchange=e=>{if(e.target.value)selectThread(e.target.value);};
qs('#agentNewSide').onclick=()=>{const side=createSideThread();agentState.textContent=threadDisplay(side)+' ready.';};
selectThread(threadWorkplane.mainThread.id);
agentSend.onclick=submitAgentInput;
agentInput.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitAgentInput()}});
carouselPrev.onclick=()=>scrollRail(-1);carouselNext.onclick=()=>scrollRail(1);
track.addEventListener("wheel",e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();track.scrollLeft+=e.deltaY}},{passive:false});
bindAppearance();loadAppearance();startWave();
let layoutFrame=0;
const syncLayout=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{resizeWave();fit()})};
new ResizeObserver(syncLayout).observe(qs("#stage"));
window.addEventListener("resize",syncLayout);
qs("#enterBrainBtn").onclick=()=>{if(window.__leewayEnterBrain)window.__leewayEnterBrain();else enterBrain()};
document.querySelectorAll(".workspaceTabs button").forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;document.querySelectorAll(".workspaceTabs button").forEach(x=>x.classList.toggle("active",x===b));renderWorkspace()});
 workspace.addEventListener("click",e=>{const a=e.target.closest("[data-work-action]");if(!a)return;const x=a.dataset.workAction;if(x==="live"){activeTab="live";renderWorkspace()}else if(x==="files"){activeTab="files";renderWorkspace()}else if(x==="evidence"){activeTab="evidence";renderWorkspace()}else if(x==="speak"){silenceSpeechOnly();void speakFromFabric(narrationFor(activeItem),"Agent Lee")}});
qs("#zoomIn").onclick=()=>{scale=clamp(scale+.12,.38,1.9);setWorldTransform()};qs("#zoomOut").onclick=()=>{scale=clamp(scale-.12,.38,1.9);setWorldTransform()};qs("#zoomFit").onclick=fit;
qs("#stage").addEventListener("wheel",e=>{
 if(window.__leewayBrainIntroActive||innerWidth<900||document.body.classList.contains("collection-view"))return;
 e.preventDefault();
 const minScale=innerWidth<900?.58:.78;
 if(e.deltaY>0 && scale<=minScale+.012){
  outwardWheel=0;
  backOneLevel();
  return;
 }
 if(e.deltaY<0)outwardWheel=0;
 scale=clamp(scale*(e.deltaY<0?1.08:.92),minScale,1.9);setWorldTransform();
},{passive:false});
function graphTouchDistance(){const pts=[...graphTouchPoints.values()];if(pts.length<2)return 0;const dx=pts[0].x-pts[1].x,dy=pts[0].y-pts[1].y;return Math.hypot(dx,dy)}
function endGraphTouch(pointerId){graphTouchPoints.delete(pointerId);if(graphTouchPoints.size<2){graphPinchStartDistance=0;graphPinchStartScale=scale;graphPinchBacked=false}}
qs("#stage").addEventListener("pointerdown",e=>{
 if(window.__leewayBrainIntroActive||innerWidth<900||document.body.classList.contains("collection-view"))return;
 if(e.target.closest(".node,#hud,#zoomControls,#agentLee,.appearancePanel,#projectCarousel,#workspace"))return;
 if(e.pointerType==="touch"){
  graphTouchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(graphTouchPoints.size===2){
   dragging=false;
   graphPinchStartDistance=graphTouchDistance();
   graphPinchStartScale=scale;
   graphPinchBacked=false;
   e.preventDefault();
   return;
  }
 }
 dragging=true;dragStart={x:e.clientX,y:e.clientY,px:panX,py:panY};try{qs("#stage").setPointerCapture(e.pointerId)}catch{}
});
qs("#stage").addEventListener("pointermove",e=>{
 if(e.pointerType==="touch"&&graphTouchPoints.has(e.pointerId)){
  graphTouchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(graphTouchPoints.size===2&&graphPinchStartDistance>0){
   const current=graphTouchDistance();
   const minScale=innerWidth<900?.58:.78;
   const next=clamp(graphPinchStartScale*(current/graphPinchStartDistance),minScale,1.9);
   if(!graphPinchBacked&&next<=minScale+.012&&current<graphPinchStartDistance*.78){
    graphPinchBacked=true;
    backOneLevel();
   }else if(!graphPinchBacked){
    scale=next;setWorldTransform();
   }
   e.preventDefault();
   return;
  }
 }
 if(!dragging)return;
 panX=dragStart.px+e.clientX-dragStart.x;panY=dragStart.py+e.clientY-dragStart.y;setWorldTransform()
});
qs("#stage").addEventListener("pointerup",e=>{dragging=false;endGraphTouch(e.pointerId)});
qs("#stage").addEventListener("pointercancel",e=>{dragging=false;endGraphTouch(e.pointerId)});

function materializeProjects(source,overrides){
 const om=new Map((overrides.overrides||[]).map(x=>[x.repo_name,x]));
 const rows=(source||[]).map(r=>{const ov=om.get(r.name)||{};return {id:"repo::"+r.name,repo_name:r.name,label:ov.label||cleanName(r.name),summary:ov.summary||r.description||"Public GitHub project by Leonard Lee / LeeWay Industries.",group:ov.group||classifyRepo(r),repo_url:r.html_url||`https://github.com/4citeB4U/${r.name}`,live_url:liveUrlFor(r,ov),evidence_state:ov.evidence_state||(upstreamRepos.has(r.name)?"UPSTREAM REFERENCE":"PUBLIC SOURCE"),default_branch:r.default_branch||"main",language:r.language,size:r.size,created_at:r.created_at,updated_at:r.updated_at,kind:"project"}});
 (overrides.estate_only||[]).forEach(x=>rows.push({...x,kind:"project",repo_name:null,repo_url:null,live_url:null}));
 return rows;
}
function applyProjectSource(source,overrides){
 const activeThread=threadWorkplane?.getThread?.(selectedThreadId);
 const spoken=activeThread?.lastOutput?{text:activeThread.lastOutput,narration:activeThread.lastOutput}:voiceController.epoch>0?{text:agentText.textContent,narration:agentNarration.textContent}:null;
 projects=globalThis.LeeWayCorePortfolio?.enrich(materializeProjects(source,overrides))||materializeProjects(source,overrides);
 items=[...projects,...evidence];
 qs("#projectCount").textContent=`PROJECTS ${projects.length}`;
 qs("#evidenceCount").textContent=`EVIDENCE ${evidence.length}`;
 activeCategory=null;search.value="";rebuildUniverse();selectItem("center",false);
 if(spoken){agentText.textContent=spoken.text;agentNarration.textContent=spoken.narration;}
}
async function boot(){
 const [generated,overrides,estate,visuals,fallback,persona]=await Promise.all([
  fetch("/brain/generated-projects.json",{cache:"no-store"}).then(r=>r.ok?r.json():({repositories:[]})).catch(()=>({repositories:[]})),
  fetch("/brain/project-overrides.json").then(r=>r.json()),
  fetch("/leeway-brain/data/estate-index.json").then(r=>r.json()),
  fetch("/brain/evidence-visuals.json").then(r=>r.json()),
  fetch("/brain/project-catalog.json").then(r=>r.json()).catch(()=>({projects:[]})),
  fetch("/brain/agent-lee-persona-public.json").then(r=>r.json()).catch(()=>null)
 ]);
 // Keep the original catalog available if the supplemental core roster cannot load.
 try{await globalThis.LeeWayCorePortfolio?.load();}catch(error){console.warn('LeeWay core reconciliation unavailable:',error.message);}
 agentPersona=persona;
 decks=visuals.decks||[];
 evidence=(estate.evidence||[]).filter(x=>x.file).map(x=>({id:"evidence::"+x.id,label:x.title,summary:x.summary,group:"Evidence",type:x.type,url:"/leeway-brain/"+String(x.file).replace(/^\/+/, ""),date:x.date,evidence_state:"PUBLIC REFERENCE",kind:"evidence"}));
 decks.forEach(d=>{if(!evidence.some(e=>e.label===d.title))evidence.push({id:d.id,label:d.title,summary:"Visual PowerPoint evidence from the LeeWay research archive.",group:"Evidence",type:"PowerPoint",url:d.pptx,evidence_state:"PUBLIC REFERENCE",kind:"evidence"})});
 const fallbackSource=(fallback.projects||[]).map(x=>({name:x.repo_name||x.label,description:x.summary,html_url:x.repo,homepage:x.url,has_pages:!!x.url,default_branch:"main",language:null,size:null,created_at:null,updated_at:null}));
 const durable=(generated.repositories||[]).length?generated.repositories:fallbackSource;
 applyProjectSource(durable,overrides);
 if(agentState.textContent==="ready")agentState.textContent="Browser AI available — load models to begin";
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
// Guide first. Voice preparation begins through the canonical LeeWay Voice Fabric session.
