import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stageEl=document.getElementById('stage');
const brainLayer=document.getElementById('brainUniverseLayer');
const brainHost=document.getElementById('brain3DCanvas');
if(!stageEl||!brainLayer||!brainHost) throw new Error('LEEWAY_3D_BRAIN_HOST_MISSING');

window.__leewayBrainIntroActive=true;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x01050b,0.019);
const brainCamera=new THREE.PerspectiveCamera(46,1,.1,1000);
brainCamera.position.set(0,.65,18.8);

const renderer3D=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer3D.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer3D.setClearColor(0x01050b,0);
renderer3D.toneMapping=THREE.ACESFilmicToneMapping;
renderer3D.toneMappingExposure=.92;
brainHost.appendChild(renderer3D.domElement);

const orbit=new OrbitControls(brainCamera,renderer3D.domElement);
orbit.enableDamping=true;
orbit.dampingFactor=.055;
orbit.enableZoom=false;
orbit.enablePan=false;
orbit.minDistance=5.7;
orbit.maxDistance=50;
orbit.autoRotate=false;
orbit.target.set(0,0,0);

function createBrainHemisphereGeometry(isLeft){
  const sphere=new THREE.SphereGeometry(4.4,96,72),pos=sphere.attributes.position,sign=isLeft?-1:1;
  for(let i=0;i<pos.count;i++){
    let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    if((isLeft&&x>.04)||(!isLeft&&x<-.04))x*=.1;
    x=x*.9+(sign*.42);y*=.86;z*=1.16;
    if(y<.2&&z>-.8&&z<2.2){x*=1.2;y*=.94}
    if(y<-.8&&z<-1.2){y*=.72;z*=.88}
    if(y>-.4&&y<.8&&Math.abs(x)>2&&z>-.2&&z<2){const s=Math.sin((y+.4)*Math.PI/1.2);x-=sign*s*.35}
    const g1=Math.sin(x*2.4)*Math.cos(y*2.4)*Math.sin(z*2.4);
    const g2=Math.sin(x*5.2+1.2)*Math.sin(y*5.2)*Math.cos(z*5.2+.8);
    const g3=Math.cos(x*10.4)*Math.sin(y*10.4*.8)*Math.cos(z*10.4+.5)*.35;
    const d=g1*.44+g2*.24+g3*.1,len=Math.sqrt(x*x+y*y+z*z)||1;
    x+=(x/len)*d;y+=(y/len)*d;z+=(z/len)*d;pos.setXYZ(i,x,y,z);
  }
  sphere.computeVertexNormals();return sphere;
}

scene.add(new THREE.AmbientLight(0x031225,2.25));
const key=new THREE.DirectionalLight(0x00a8d8,2.9);key.position.set(16,22,18);scene.add(key);
const rim=new THREE.DirectionalLight(0x183c78,2.7);rim.position.set(-18,-12,-16);scene.add(rim);
const warm=new THREE.DirectionalLight(0x0a2440,.45);warm.position.set(-12,3,15);scene.add(warm);

const root=new THREE.Group();scene.add(root);
const hg=new THREE.Group();root.add(hg);
const leftGeo=createBrainHemisphereGeometry(true),rightGeo=createBrainHemisphereGeometry(false);
const cortexMat=new THREE.MeshPhysicalMaterial({
  color:0x010a18,emissive:0x00233f,emissiveIntensity:.58,roughness:.28,metalness:.16,
  clearcoat:.58,clearcoatRoughness:.16,transparent:true,opacity:.74,depthWrite:false,side:THREE.DoubleSide
});
const wireMat=new THREE.MeshBasicMaterial({color:0x0086b2,wireframe:true,transparent:true,opacity:.23,blending:THREE.AdditiveBlending});
hg.add(new THREE.Mesh(leftGeo,cortexMat),new THREE.Mesh(rightGeo,cortexMat),new THREE.Mesh(leftGeo,wireMat),new THREE.Mesh(rightGeo,wireMat));

const coreLight=new THREE.PointLight(0x50e6ff,4.0,16);root.add(coreLight);
const runtimeCore=new THREE.Mesh(
  new THREE.IcosahedronGeometry(.54,2),
  new THREE.MeshPhysicalMaterial({color:0x50e6ff,emissive:0x00b8d4,emissiveIntensity:2.0,transparent:true,opacity:.76,roughness:.2})
);root.add(runtimeCore);
const ring=new THREE.Mesh(
  new THREE.TorusGeometry(1.02,.022,12,96),
  new THREE.MeshBasicMaterial({color:0x2ec7ff,transparent:true,opacity:.38,blending:THREE.AdditiveBlending})
);ring.rotation.x=Math.PI/2;root.add(ring);

const orbShell=new THREE.Mesh(
  new THREE.SphereGeometry(5.45,64,48),
  new THREE.MeshPhysicalMaterial({
    color:0x031226,
    emissive:0x00172b,
    emissiveIntensity:.18,
    transparent:true,
    opacity:.055,
    roughness:.18,
    metalness:.08,
    clearcoat:.7,
    clearcoatRoughness:.18,
    side:THREE.DoubleSide,
    depthWrite:false
  })
);
root.add(orbShell);

const orbWire=new THREE.Mesh(
  new THREE.SphereGeometry(5.48,40,28),
  new THREE.MeshBasicMaterial({
    color:0x1a78a6,
    wireframe:true,
    transparent:true,
    opacity:.055,
    blending:THREE.AdditiveBlending
  })
);
root.add(orbWire);

const orbitalGroup=new THREE.Group();
root.add(orbitalGroup);
[
  [5.72,0,0,0],
  [5.95,Math.PI/2.7,0,Math.PI/8],
  [6.18,Math.PI/2,Math.PI/7,0]
].forEach(([radius,rx,ry,rz],i)=>{
  const m=new THREE.Mesh(
    new THREE.TorusGeometry(radius,.012,8,180),
    new THREE.MeshBasicMaterial({
      color:i===0?0x2aa7d7:0x235e9a,
      transparent:true,
      opacity:i===0?.22:.15,
      blending:THREE.AdditiveBlending
    })
  );
  m.rotation.set(rx,ry,rz);
  orbitalGroup.add(m);
});

const particleCount=4200,pGeo=new THREE.BoxGeometry(.06,.06,.06),
pMat=new THREE.MeshBasicMaterial({color:0x00ffff,transparent:true,opacity:.66,blending:THREE.AdditiveBlending}),
particles=new THREE.InstancedMesh(pGeo,pMat,particleCount),dummy=new THREE.Object3D();
for(let i=0;i<particleCount;i++){
  const r=2.35*Math.cbrt(Math.random()),th=Math.random()*Math.PI*2,ph=Math.acos((Math.random()-.5)*2);
  dummy.position.set(r*Math.sin(ph)*Math.cos(th)*.85,r*Math.sin(ph)*Math.sin(th)*.75,r*Math.cos(ph)*1.15);
  dummy.scale.setScalar(.55+Math.random()*.8);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);
}
particles.instanceMatrix.needsUpdate=true;root.add(particles);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const depth=()=>brainCamera.position.distanceTo(orbit.target);
let lastReveal=-1;

function applyDepth(){
  const d=depth();
  const reveal=clamp((15.7-d)/7.4,0,1);
  const late=clamp((reveal-.18)/.82,0,1);
  const labelPulse=clamp(1-Math.abs(reveal-.58)/.30,0,1);

  document.documentElement.style.setProperty('--ecosystem-alpha',String(late));
  document.documentElement.style.setProperty('--ecosystem-scale',String(.83+late*.17));
  document.documentElement.style.setProperty('--ecosystem-blur',String((1-late)*1.4)+'px');
  document.documentElement.style.setProperty('--ecosystem-bright',String(.68+late*.32));
  document.documentElement.style.setProperty('--brain-shell-alpha',String(1-late));
  document.documentElement.style.setProperty('--brain-label-alpha',String(labelPulse*.92));

  if(Math.abs(reveal-lastReveal)>.004){
    window.dispatchEvent(new CustomEvent('leeway-brain-depth',{detail:{distance:d,reveal,late}}));
    lastReveal=reveal;
  }

  if(reveal>=.985 && window.__leewayBrainIntroActive){
    window.__leewayBrainIntroActive=false;
    document.body.classList.add('galaxy-active');
    document.body.classList.remove('brain-intro');
    brainLayer.style.pointerEvents='none';
    window.__leewayPublicBrainEntered?.();
  }
}

function enterBrainOverview(){
  window.__leewayBrainIntroActive=true;
  document.body.classList.remove('galaxy-active');
  document.body.classList.add('brain-intro');
  brainLayer.style.pointerEvents='auto';
  const dir=new THREE.Vector3(0,.65,18.8).normalize();
  brainCamera.position.copy(dir.multiplyScalar(18.8));
  orbit.target.set(0,0,0);orbit.update();applyDepth();
  window.__leewayPublicBrainOverview?.();
}
window.__leewayEnterBrainOverview=enterBrainOverview;
window.__leeway3DBrain={scene,camera:brainCamera,renderer:renderer3D,controls:orbit,root,hg,orbShell,orbWire,orbitalGroup,cortexMat,wireMat,particles,enterBrainOverview,depth};

orbit.addEventListener('change',applyDepth);

brainLayer.addEventListener('wheel',e=>{
  if(!window.__leewayBrainIntroActive)return;
  e.preventDefault();e.stopPropagation();
  const off=brainCamera.position.clone().sub(orbit.target);
  const next=clamp(off.length()*Math.exp(e.deltaY*.00115),5.75,42);
  off.setLength(next);brainCamera.position.copy(orbit.target).add(off);orbit.update();applyDepth();
},{passive:false});

stageEl.addEventListener('wheel',e=>{
  if(window.__leewayBrainIntroActive)return;
  const gc=window.__leewayGraphCamera;
  if(gc && gc.z<=.112 && e.deltaY>0){
    e.preventDefault();e.stopImmediatePropagation();enterBrainOverview();
  }
},{capture:true,passive:false});

const wholeBrain=document.getElementById('homeBtn');
if(wholeBrain){
  wholeBrain.addEventListener('contextmenu',e=>e.preventDefault());
  wholeBrain.addEventListener('dblclick',e=>{
    e.preventDefault();e.stopPropagation();enterBrainOverview();
  });
}

function apply3DAppearance(a={}){
  const accent=new THREE.Color(a.accent||"#00b4d8");
  const bg=new THREE.Color(a.bg||"#01050b");
  const dark=bg.clone().lerp(accent,.08);
  const emissive=bg.clone().lerp(accent,.22);
  cortexMat.color.copy(dark);
  cortexMat.emissive.copy(emissive);
  cortexMat.emissiveIntensity=.42+Math.max(0,Number(a.brightness??1)-.5)*.18;
  wireMat.color.copy(accent.clone().multiplyScalar(.62));
  pMat.color.copy(accent.clone().lerp(new THREE.Color("#b9f6ff"),.18));
  runtimeCore.material.color.copy(accent.clone().multiplyScalar(.75));
  runtimeCore.material.emissive.copy(accent.clone().multiplyScalar(.55));
  ring.material.color.copy(accent.clone().multiplyScalar(.72));
  orbWire.material.color.copy(accent.clone().multiplyScalar(.45));
  orbitalGroup.children.forEach((m,i)=>m.material.color.copy(accent.clone().multiplyScalar(i===0?.56:.36)));
  key.color.copy(accent.clone().multiplyScalar(.72));
  coreLight.color.copy(accent.clone().multiplyScalar(.82));
  scene.fog.color.copy(bg.clone().multiplyScalar(.72));
  renderer3D.toneMappingExposure=.72+Math.min(1.25,Math.max(.25,Number(a.brightness??1)))*.20;
}
window.addEventListener("leeway-appearance-change",e=>apply3DAppearance(e.detail||{}));
try{apply3DAppearance(JSON.parse(localStorage.getItem("leeway.brain.appearance.v2")||"null")||{bg:"#010713",accent:"#00b7e8",brightness:.78})}catch{apply3DAppearance({bg:"#010713",accent:"#00b7e8",brightness:.78})}
function resizeBrain(){
  const r=stageEl.getBoundingClientRect();
  brainCamera.aspect=Math.max(.1,r.width/r.height);
  brainCamera.updateProjectionMatrix();
  renderer3D.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
}
window.addEventListener('resize',resizeBrain);resizeBrain();applyDepth();

const clock3D=new THREE.Clock();
let lastFrame=0;
function animateBrain(ts=0){
  requestAnimationFrame(animateBrain);
  if(document.hidden||document.body.classList.contains('galaxy-active'))return;
  if(ts-lastFrame<33)return;
  lastFrame=ts;
  orbit.update();
  const t=clock3D.getElapsedTime(),breath=1+Math.sin(t*1.6)*.012;
  hg.scale.setScalar(breath);
  coreLight.intensity=3.0+Math.sin(t*2.5)*1.0;
  cortexMat.emissiveIntensity=.62+Math.sin(t*2)*.22;
  runtimeCore.rotation.x=t*.32;runtimeCore.rotation.y=t*.48;ring.rotation.z=t*.22;
  orbWire.rotation.y=t*.028;orbWire.rotation.x=Math.sin(t*.11)*.04;
  orbitalGroup.rotation.y=t*.018;orbitalGroup.rotation.z=Math.sin(t*.08)*.025;
  renderer3D.render(scene,brainCamera);
}
animateBrain();
