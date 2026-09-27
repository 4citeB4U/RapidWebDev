const qs=s=>document.querySelector(s);
const world=qs("#world"),nodesEl=qs("#nodes"),edges=qs("#edges"),track=qs("#carouselTrack"),search=qs("#searchBox");
const hud=qs("#hud"),hudTitle=qs("#hudTitle"),hudSubtitle=qs("#hudSubtitle"),hudDesc=qs("#hudDesc"),hudFacts=qs("#hudFacts");
const openProject=qs("#openProjectBtn"),openRepo=qs("#openRepoBtn"),agentText=qs("#agentText"),agentNarration=qs("#agentNarration");
const colors={Core:"#50e6ff","Agentic Systems":"#6f9cff","Scientific Research":"#c978ff",Governance:"#e6d75a",Runtime:"#50e6ff",Capabilities:"#e6d75a",Devices:"#57e49a",Compute:"#56c7ff","Voice / Realtime":"#ffad52","Developer Tools":"#8b9dff",Education:"#e273ff",Legal:"#ff6577",Logistics:"#ff8a16",Operations:"#54e0be","Creative AI":"#a67cff",Publishing:"#c978ff","Community / Business":"#c58b64",Safety:"#ff6577",Professional:"#93a8ba","Client / Brand":"#8c74ff",Gaming:"#6fc4ff","Business / Web":"#ff8a16","Publishing / Education":"#e273ff",Evidence:"#4de0cf"};
let projects=[],evidence=[],items=[],selected=null,scale=1,panX=0,panY=0,dragging=false,dragStart=null,positions=new Map();

const categoryDefs=[
  {id:"cat::core",label:"CORE LEEWAY",groups:["Agentic Systems","Scientific Research","Governance","Runtime","Capabilities","Devices","Compute","Voice / Realtime","Developer Tools"]},
  {id:"cat::products",label:"PRODUCTS / APPLICATIONS",groups:["Education","Legal","Logistics","Operations","Creative AI","Publishing","Safety","Gaming","Publishing / Education"]},
  {id:"cat::business",label:"BUSINESS / CLIENT WORK",groups:["Business / Web","Community / Business","Client / Brand"]},
  {id:"cat::professional",label:"PROFESSIONAL / PUBLIC",groups:["Professional"]},
  {id:"cat::evidence",label:"EVIDENCE / RESEARCH",groups:["Evidence"]}
];
const categoryAnchors={
  "cat::core":{x:700,y:120},
  "cat::products":{x:1085,y:425},
  "cat::business":{x:700,y:730},
  "cat::professional":{x:315,y:425},
  "cat::evidence":{x:700,y:425}
};
function setWorldTransform(){world.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${scale})`;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function groupFor(item){return item.kind==="evidence"?"Evidence":item.group||"Core";}
function categoryFor(item){
  const g=groupFor(item);
  return categoryDefs.find(c=>c.groups.includes(g))?.id||"cat::products";
}
function buildLayout(){
  positions.clear();
  positions.set("center",{x:700,y:425});
  for(const c of categoryDefs)positions.set(c.id,categoryAnchors[c.id]);
  for(const c of categoryDefs){
    const members=items.filter(x=>categoryFor(x)===c.id);
    const anchor=categoryAnchors[c.id];
    const radius=c.id==="cat::evidence"?250:205;
    members.forEach((m,i)=>{
      const start=c.id==="cat::evidence"?Math.PI*.05:Math.PI*-.9;
      const angle=start+(Math.PI*1.8)*(members.length<=1?.5:i/(members.length-1));
      positions.set(m.id,{x:anchor.x+Math.cos(angle)*radius,y:anchor.y+Math.sin(angle)*radius});
    });
  }
}
function line(a,b,cls=""){
  const pa=positions.get(a),pb=positions.get(b);if(!pa||!pb)return;
  const l=document.createElementNS("http://www.w3.org/2000/svg","line");
  l.setAttribute("x1",pa.x);l.setAttribute("y1",pa.y);l.setAttribute("x2",pb.x);l.setAttribute("y2",pb.y);l.setAttribute("class","edge "+cls);edges.appendChild(l);
}
function renderEdges(){
  edges.setAttribute("viewBox","0 0 1400 850");edges.innerHTML="";
  categoryDefs.forEach(c=>line("center",c.id,c.id==="cat::evidence"?"evidence":"core"));
  items.forEach(x=>line(categoryFor(x),x.id,x.kind==="evidence"?"evidence":""));
}
function nodeButton({id,label,sub,type="project",zone="#62a8ff"}){
  const p=positions.get(id);const b=document.createElement("button");
  b.className="node "+type+(selected===id?" selected":"");b.dataset.id=id;b.style.left=p.x+"px";b.style.top=p.y+"px";b.style.setProperty("--zone",zone);
  b.innerHTML=`<b>${label}</b><small>${sub||""}</small>`;
  b.addEventListener("click",e=>{e.stopPropagation();selectItem(id)});return b;
}
function renderNodes(filter=""){
  nodesEl.innerHTML="";
  nodesEl.appendChild(nodeButton({id:"center",label:"LEONARD LEE",sub:"LeeWay Industries · Systems Builder",type:"center",zone:"#50e6ff"}));
  for(const c of categoryDefs)nodesEl.appendChild(nodeButton({id:c.id,label:c.label,sub:"Enter project universe",type:"category",zone:c.id==="cat::evidence"?"#4de0cf":"#62a8ff"}));
  const q=filter.toLowerCase();
  for(const x of items){
    const hay=(x.label+" "+(x.desc||"")+" "+groupFor(x)).toLowerCase();
    if(q&&!hay.includes(q))continue;
    nodesEl.appendChild(nodeButton({id:x.id,label:x.label,sub:groupFor(x),type:x.kind==="evidence"?"project evidence":"project",zone:colors[groupFor(x)]||"#62a8ff"}));
  }
}
function narrationFor(x){
  if(x.id==="center")return "This brain presents Leonard Lee's work as one systems lineage: physical systems, operations, business, software, research, and governed AI. Use the project universes to move through the evidence.";
  if(x.id?.startsWith("cat::"))return `${x.label} is a project universe. Select one of its orbiting nodes or use the project carousel below to inspect the work and its evidence.`;
  if(x.kind==="evidence")return `${x.label} is a visual evidence object in the LeeWay research history. It helps document how the architecture, governance, and training work developed over time.`;
  return `${x.label} is part of Leonard Lee's ${x.group||"systems"} work. ${x.desc||""} The public brain links the project to its live experience or source repository when available.`;
}
function selectItem(id){
  selected=id;renderNodes(search.value.trim());renderCarousel(search.value.trim());
  let x;
  if(id==="center")x={id,label:"Leonard Lee",group:"Systems Builder",desc:"A cross-domain body of work spanning construction, logistics, management, business, software, AI systems and governed research.",evidence:"PUBLIC LINEAGE"};
  else if(id.startsWith("cat::")){const c=categoryDefs.find(y=>y.id===id);x={id,label:c.label,group:"Project Universe",desc:`Contains ${items.filter(y=>categoryFor(y)===id).length} public project or evidence records.`,evidence:"PUBLIC PROJECTION"};}
  else x=items.find(y=>y.id===id);
  if(!x)return;
  const narr=narrationFor(x);agentText.textContent=narr;agentNarration.textContent=narr;
  hudTitle.textContent=x.label;hudSubtitle.textContent=groupFor(x);hudDesc.textContent=x.desc||narr;
  hudFacts.innerHTML=[
    ["Domain",groupFor(x)],["Evidence",x.evidence||x.type||"PUBLIC"],["Date",x.date||"Historical"],["Identity",x.id]
  ].map(([a,b])=>`<div class="hudFact"><b>${a}</b><span>${b}</span></div>`).join("");
  openProject.classList.toggle("hidden",!x.url);if(x.url)openProject.href=x.url;
  openRepo.classList.toggle("hidden",!x.repo);if(x.repo)openRepo.href=x.repo;
  qs("#hudIcon").textContent=x.kind==="evidence"?"◫":id.startsWith("cat::")?"◎":"◇";
  hud.classList.remove("hidden");qs("#crumbCurrent").textContent=x.label.toUpperCase();
}
function renderCarousel(filter=""){
  const q=filter.toLowerCase();const rows=items.filter(x=>!q||(x.label+" "+(x.desc||"")+" "+groupFor(x)).toLowerCase().includes(q));
  track.innerHTML="";for(const x of rows){
    const b=document.createElement("button");b.className="projectCard"+(selected===x.id?" active":"");
    b.innerHTML=`<div class="cardTop"><span class="cardType">${x.kind==="evidence"?x.type:"PROJECT"}</span><span class="cardEvidence">${x.evidence||""}</span></div><h3>${x.label}</h3><p>${x.desc||""}</p>`;
    b.addEventListener("click",()=>selectItem(x.id));track.appendChild(b);
  }
  qs("#carouselCount").textContent=`${rows.length} items`;
}
function speakCurrent(){
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(agentNarration.textContent||agentText.textContent);u.rate=.94;u.pitch=.95;speechSynthesis.speak(u);
}
function startTour(){
  const sequence=["center","proj::rapid-original","proj::formula","proj::standards","proj::agent","proj::leola","cat::evidence"];let i=0;
  const step=()=>{selectItem(sequence[i++%sequence.length]);if(i<=sequence.length)setTimeout(step,3800)};step();
}
function fit(){scale=.78;panX=0;panY=0;setWorldTransform();}
search.addEventListener("input",()=>{renderNodes(search.value.trim());renderCarousel(search.value.trim())});
qs("#hudClose").onclick=()=>hud.classList.add("hidden");qs("#speakBtn").onclick=speakCurrent;qs("#tourBtn").onclick=startTour;
qs("#resetBtn").onclick=fit;qs("#zoomIn").onclick=()=>{scale=clamp(scale+.12,.45,1.9);setWorldTransform()};qs("#zoomOut").onclick=()=>{scale=clamp(scale-.12,.45,1.9);setWorldTransform()};qs("#zoomFit").onclick=fit;
qs("#stage").addEventListener("wheel",e=>{e.preventDefault();scale=clamp(scale*(e.deltaY<0?1.08:.92),.45,1.9);setWorldTransform()},{passive:false});
qs("#stage").addEventListener("pointerdown",e=>{if(e.target.closest(".node,#hud,#zoomControls"))return;dragging=true;dragStart={x:e.clientX,y:e.clientY,px:panX,py:panY};qs("#stage").setPointerCapture(e.pointerId)});
qs("#stage").addEventListener("pointermove",e=>{if(!dragging)return;panX=dragStart.px+(e.clientX-dragStart.x);panY=dragStart.py+(e.clientY-dragStart.y);setWorldTransform()});
qs("#stage").addEventListener("pointerup",()=>dragging=false);qs("#stage").addEventListener("pointercancel",()=>dragging=false);
window.addEventListener("resize",()=>{if(innerWidth<900)scale=.58;setWorldTransform()});
Promise.all([
 fetch("/brain/project-catalog.json",{cache:"no-store"}).then(r=>r.json()),
 fetch("/leeway-brain/data/estate-index.json",{cache:"no-store"}).then(r=>r.json())
]).then(([pc,estate])=>{
 projects=(pc.projects||[]).map(x=>({...x,kind:"project"}));
 evidence=(estate.evidence||[]).filter(x=>x.file).map(x=>({id:"pub::"+x.id,label:x.title,desc:x.summary,group:"Evidence",type:x.type,url:"/"+x.file,date:x.date,evidence:"PUBLIC REFERENCE",kind:"evidence"}));
 items=[...projects,...evidence];qs("#projectCount").textContent=`PROJECTS ${projects.length}`;qs("#evidenceCount").textContent=`EVIDENCE ${evidence.length}`;
 buildLayout();renderEdges();renderNodes();renderCarousel();fit();selectItem("center");
}).catch(err=>{agentText.textContent="Project index failed to load: "+err.message});
