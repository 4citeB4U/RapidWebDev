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
renderer3D.toneMappingExposure=.76;
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

scene.add(new THREE.AmbientLight(0x020914,1.75));
const key=new THREE.DirectionalLight(0x006e9b,1.95);key.position.set(16,22,18);scene.add(key);
const rim=new THREE.DirectionalLight(0x102a5c,1.85);rim.position.set(-18,-12,-16);scene.add(rim);
const warm=new THREE.DirectionalLight(0x07172b,.18);warm.position.set(-12,3,15);scene.add(warm);

const root=new THREE.Group();scene.add(root);
const hg=new THREE.Group();root.add(hg);
const leftGeo=createBrainHemisphereGeometry(true),rightGeo=createBrainHemisphereGeometry(false);
const cortexMat=new THREE.MeshPhysicalMaterial({
  color:0x010713,emissive:0x001629,emissiveIntensity:.34,roughness:.30,metalness:.17,
  clearcoat:.62,clearcoatRoughness:.17,transparent:true,opacity:.82,depthWrite:false,side:THREE.DoubleSide
});
const wireMat=new THREE.MeshBasicMaterial({color:0x00749c,wireframe:true,transparent:true,opacity:.18,blending:THREE.AdditiveBlending});
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
    opacity:.115,
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
    opacity:.115,
    blending:THREE.AdditiveBlending
  })
);
root.add(orbWire);

const orbHaloMat=new THREE.ShaderMaterial({
  transparent:true,
  depthWrite:false,
  side:THREE.BackSide,
  blending:THREE.AdditiveBlending,
  uniforms:{uColor:{value:new THREE.Color(0x0b78a8)},uStrength:{value:.30}},
  vertexShader:`
    varying vec3 vNormal;
    varying vec3 vView;
    void main(){
      vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
      vNormal=normalize(normalMatrix*normal);
      vView=normalize(-mvPosition.xyz);
      gl_Position=projectionMatrix*mvPosition;
    }`,
  fragmentShader:`
    uniform vec3 uColor;
    uniform float uStrength;
    varying vec3 vNormal;
    varying vec3 vView;
    void main(){
      float fresnel=pow(1.0-max(dot(normalize(vNormal),normalize(vView)),0.0),2.35);
      gl_FragColor=vec4(uColor,fresnel*uStrength);
    }`
});
const orbHalo=new THREE.Mesh(new THREE.SphereGeometry(5.62,64,48),orbHaloMat);
root.add(orbHalo);

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
      opacity:i===0?.34:.22,
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
window.__leeway3DBrain={scene,camera:brainCamera,renderer:renderer3D,controls:orbit,root,hg,orbShell,orbWire,orbHalo,orbHaloMat,orbitalGroup,cortexMat,wireMat,particles,enterBrainOverview,depth};

orbit.addEventListener('change',applyDepth);

brainLayer.addEventListener('wheel',e=>{
  if(!window.__leewayBrainIntroActive)return;
  e.preventDefault();e.stopPropagation();
  const off=brainCamera.position.clone().sub(orbit.target);
  const next=clamp(off.length()*Math.exp(e.deltaY*.00115),5.75,42);
  off.setLength(next);brainCamera.position.copy(orbit.target).add(off);orbit.update();applyDepth();
},{passive:false});

const brainTouchPoints=new Map();
let brainPinchStartDistance=0;
let brainPinchStartDepth=0;
function brainTouchDistance(){
  const pts=[...brainTouchPoints.values()];
  if(pts.length<2)return 0;
  const dx=pts[0].x-pts[1].x,dy=pts[0].y-pts[1].y;
  return Math.hypot(dx,dy);
}
function endBrainTouch(pointerId){
  brainTouchPoints.delete(pointerId);
  if(brainTouchPoints.size<2){
    brainPinchStartDistance=0;
    brainPinchStartDepth=0;
    orbit.enabled=true;
  }
}
brainHost.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||!window.__leewayBrainIntroActive)return;
  brainTouchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(brainTouchPoints.size===2){
    brainPinchStartDistance=brainTouchDistance();
    brainPinchStartDepth=depth();
    orbit.enabled=false;
    e.preventDefault();
    e.stopPropagation();
  }
},{capture:true,passive:false});
brainHost.addEventListener('pointermove',e=>{
  if(e.pointerType!=='touch'||!window.__leewayBrainIntroActive||!brainTouchPoints.has(e.pointerId))return;
  brainTouchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(brainTouchPoints.size===2&&brainPinchStartDistance>0){
    const current=brainTouchDistance();
    const ratio=brainPinchStartDistance/Math.max(1,current);
    const next=clamp(brainPinchStartDepth*ratio,5.75,42);
    const off=brainCamera.position.clone().sub(orbit.target).setLength(next);
    brainCamera.position.copy(orbit.target).add(off);
    orbit.update();applyDepth();
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},{capture:true,passive:false});
brainHost.addEventListener('pointerup',e=>endBrainTouch(e.pointerId),{capture:true});
brainHost.addEventListener('pointercancel',e=>endBrainTouch(e.pointerId),{capture:true});

stageEl.addEventListener('wheel',e=>{
  if(window.__leewayBrainIntroActive)return;
  const gc=window.__leewayGraphCamera;
  if(gc && gc.z<=.145 && e.deltaY>0){
    e.preventDefault();e.stopImmediatePropagation();
    if(window.__leewayPublicBackOneLevel)window.__leewayPublicBackOneLevel();
    else enterBrainOverview();
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
  cortexMat.color.set("#010713");
  cortexMat.emissive.set("#00182d");
  cortexMat.emissiveIntensity=.18+Math.max(0,Number(a.brightness??.78)-.35)*.08;
  wireMat.color.copy(accent).multiplyScalar(.34);
  pMat.color.copy(accent.clone().lerp(new THREE.Color("#b9f6ff"),.18));
  runtimeCore.material.color.copy(accent.clone().multiplyScalar(.75));
  runtimeCore.material.emissive.copy(accent.clone().multiplyScalar(.55));
  ring.material.color.copy(accent.clone().multiplyScalar(.72));
  orbShell.material.color.copy(bg).lerp(accent,.025);
  orbShell.material.emissive.copy(accent).multiplyScalar(.10);
  orbWire.material.color.copy(accent).multiplyScalar(.34);
  orbHaloMat.uniforms.uColor.value.copy(accent).multiplyScalar(.42);
  orbHaloMat.uniforms.uStrength.value=.30;
  orbitalGroup.children.forEach((m,i)=>m.material.color.copy(accent).multiplyScalar(i===0?.46:.30));
  key.color.copy(accent).multiplyScalar(.38);
  coreLight.color.copy(accent).multiplyScalar(.56);
  scene.fog.color.copy(bg).multiplyScalar(.72);
  renderer3D.toneMappingExposure=.56+Math.min(1.10,Math.max(.25,Number(a.brightness??.78)))*.12;
}
window.addEventListener("leeway-appearance-change",e=>apply3DAppearance(e.detail||{}));
try{apply3DAppearance(JSON.parse(localStorage.getItem("leeway.brain.appearance.v3")||"null")||{bg:"#010713",accent:"#00b7e8",brightness:.78})}catch{apply3DAppearance({bg:"#010713",accent:"#00b7e8",brightness:.78})}
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
  coreLight.intensity=1.65+Math.sin(t*2.5)*.42;
  cortexMat.emissiveIntensity=.16+Math.sin(t*2)*.045;
  runtimeCore.rotation.x=t*.32;runtimeCore.rotation.y=t*.48;ring.rotation.z=t*.22;
  orbWire.rotation.y=t*.028;orbWire.rotation.x=Math.sin(t*.11)*.04;
  orbitalGroup.rotation.y=t*.018;orbitalGroup.rotation.z=Math.sin(t*.08)*.025;
  renderer3D.render(scene,brainCamera);
}
animateBrain();
