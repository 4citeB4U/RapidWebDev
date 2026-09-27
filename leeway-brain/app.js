const state={data:null,selected:"creator"};
const $=s=>document.querySelector(s);
const nodeLayer=$("#nodeLayer"),edgeLayer=$("#edgeLayer"),detailTitle=$("#detailTitle"),detailSummary=$("#detailSummary"),detailMeta=$("#detailMeta"),detailLink=$("#detailLink"),evidenceTrack=$("#evidenceTrack"),evidenceSearch=$("#evidenceSearch"),evidenceCount=$("#evidenceCount"),viewer=$("#viewer"),viewerBody=$("#viewerBody");

const groupClass=g=>["identity","formula","governance","evidence","domain"].includes(g)?g:"";
const iconFor=t=>({
  PowerPoint:"▰",Infographic:"◫",Repository:"⌘","Live Site":"↗",PDF:"▤",Audio:"♪",Video:"▶",Spreadsheet:"▦"
}[t]||"◇");

function renderEdges(){
  const w=$("#brainMap").clientWidth,h=$("#brainMap").clientHeight;
  edgeLayer.setAttribute("viewBox",`0 0 ${w} ${h}`);
  edgeLayer.innerHTML="";
  const map=Object.fromEntries(state.data.nodes.map(n=>[n.id,n]));
  for(const [a,b] of state.data.edges){
    const na=map[a],nb=map[b]; if(!na||!nb) continue;
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",na.x/100*w);line.setAttribute("y1",na.y/100*h);
    line.setAttribute("x2",nb.x/100*w);line.setAttribute("y2",nb.y/100*h);
    line.setAttribute("class","edge");edgeLayer.appendChild(line);
  }
}
function renderNodes(){
  nodeLayer.innerHTML="";
  for(const n of state.data.nodes){
    const el=document.createElement("button");
    el.className=`node ${groupClass(n.group)}`;
    if(n.id===state.selected) el.classList.add("active");
    el.style.left=n.x+"%";el.style.top=n.y+"%";el.textContent=n.label;
    el.addEventListener("click",()=>selectNode(n.id));
    nodeLayer.appendChild(el);
  }
  requestAnimationFrame(renderEdges);
}
function selectNode(id){
  state.selected=id;renderNodes();
  const n=state.data.nodes.find(x=>x.id===id); if(!n)return;
  detailTitle.textContent=n.label;detailSummary.textContent=n.summary;
  detailMeta.innerHTML=`<div class="meta-row"><span>Domain</span><span>${n.group}</span></div><div class="meta-row"><span>Evidence model</span><span>Public projection</span></div><div class="meta-row"><span>Authority</span><span>LeeWay Intellectual Estate</span></div>`;
  if(n.url){detailLink.href=n.url;detailLink.classList.remove("hidden")}else detailLink.classList.add("hidden");
}
function evidenceCard(e){
  const card=document.createElement("article");card.className="evidence-card";
  const thumb=document.createElement("div");thumb.className="thumb";
  if(e.file&&/\.(png|jpg|jpeg)$/i.test(e.file)){
    const img=document.createElement("img");img.src=e.file;img.alt=e.title;thumb.appendChild(img);
  }else{
    const icon=document.createElement("div");icon.className="file-icon";icon.textContent=iconFor(e.type);thumb.appendChild(icon);
  }
  const body=document.createElement("div");body.className="card-body";
  body.innerHTML=`<div class="tag">${e.type}</div><h3>${e.title}</h3><p>${e.summary}</p><div class="card-meta"><span>${e.group||""}</span><span>${e.date||""}</span></div>`;
  card.append(thumb,body);card.addEventListener("click",()=>openEvidence(e));return card;
}
function renderEvidence(query=""){
  const q=query.trim().toLowerCase();
  const rows=state.data.evidence.filter(e=>!q||[e.title,e.type,e.group,e.summary,e.date].join(" ").toLowerCase().includes(q));
  evidenceTrack.innerHTML="";rows.forEach(e=>evidenceTrack.appendChild(evidenceCard(e)));
  evidenceCount.textContent=`${rows.length} evidence objects`;
}
function openEvidence(e){
  const media=e.file&&/\.(png|jpg|jpeg)$/i.test(e.file)?`<img src="${e.file}" alt="${e.title}">`:"";
  const target=e.file||e.url;
  viewerBody.innerHTML=`<div class="viewer-content"><div class="tag">${e.type}</div><h2>${e.title}</h2><p>${e.summary}</p>${media}<div class="detail-meta"><div class="meta-row"><span>Date</span><span>${e.date||"Historical"}</span></div><div class="meta-row"><span>Group</span><span>${e.group||""}</span></div><div class="meta-row"><span>Evidence class</span><span>Public reference</span></div></div><div class="viewer-actions">${target?`<a class="primary-link" href="${target}" target="_blank" rel="noreferrer">${e.file?"Open / download artifact":"Open source"}</a>`:""}</div></div>`;
  viewer.showModal();
}
$("#viewerClose").addEventListener("click",()=>viewer.close());
viewer.addEventListener("click",e=>{if(e.target===viewer)viewer.close()});
evidenceSearch.addEventListener("input",e=>renderEvidence(e.target.value));
window.addEventListener("resize",renderEdges);

fetch("data/estate-index.json").then(r=>r.json()).then(data=>{
  state.data=data;renderNodes();selectNode("creator");renderEvidence();
}).catch(err=>{
  nodeLayer.innerHTML=`<div style="padding:30px;color:#ff8a16">Evidence index failed to load: ${err}</div>`;
});
