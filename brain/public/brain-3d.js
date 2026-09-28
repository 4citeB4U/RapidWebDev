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
brainCamera.position.set(0,0,18.8);
const referenceDistance=18.8;
let overviewDistance=referenceDistance;
let enteringBrain=false;
let depthNavigationActive=false;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

const renderer3D=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer3D.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer3D.setClearColor(0x01050b,0);
renderer3D.toneMapping=THREE.ACESFilmicToneMapping;
renderer3D.toneMappingExposure=.76;
brainHost.appendChild(renderer3D.domElement);
// A canvas has its own CSS dimensions, independent of its WebGL drawing buffer.
// Scope its origin explicitly so generic canvas positioning cannot move the brain.
Object.assign(renderer3D.domElement.style,{
  position:'absolute',inset:'0',left:'0',top:'0',width:'100%',height:'100%',
  transform:'none',margin:'0',display:'block'
});

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
const key=new THREE.DirectionalLight(0x55d6ff,3.8);key.position.set(10,12,18);scene.add(key);
const rim=new THREE.DirectionalLight(0x318eff,3.1);rim.position.set(-14,5,-10);scene.add(rim);
const warm=new THREE.DirectionalLight(0x398aa8,1.4);warm.position.set(-12,3,15);scene.add(warm);

const root=new THREE.Group();scene.add(root);
const hg=new THREE.Group();root.add(hg);
const leftGeo=createBrainHemisphereGeometry(true),rightGeo=createBrainHemisphereGeometry(false);
const cortexMat=new THREE.MeshPhysicalMaterial({
  color:0x010713,emissive:0x001629,emissiveIntensity:.34,roughness:.30,metalness:.17,
  clearcoat:.62,clearcoatRoughness:.17,transparent:true,opacity:.94,depthWrite:true,side:THREE.FrontSide
});
const wireMat=new THREE.MeshBasicMaterial({color:0x00749c,wireframe:true,transparent:true,opacity:.18,blending:THREE.AdditiveBlending});
hg.add(new THREE.Mesh(leftGeo,cortexMat),new THREE.Mesh(rightGeo,cortexMat),new THREE.Mesh(leftGeo,wireMat),new THREE.Mesh(rightGeo,wireMat));

// Surface highlights follow the original sculpted cortex, not a separate sphere.
// A slow travelling band illuminates neighboring nodes like an electrical impulse.
const surfacePositions=[];
for(const geometry of [leftGeo,rightGeo]){
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i+=5){
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    if(Math.abs(x)<.85)continue;
    surfacePositions.push(x*1.008,y*1.008,z*1.008);
  }
}
const surfaceGeometry=new THREE.BufferGeometry();
surfaceGeometry.setAttribute('position',new THREE.Float32BufferAttribute(surfacePositions,3));
const surfaceMaterial=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uTime:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio||1,2)},uColor:{value:new THREE.Color('#43dfff')}},
  vertexShader:`
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vPulse;
    void main(){
      float wave=sin(position.y*.95+position.x*.35+position.z*.22-uTime*.9);
      vPulse=pow(max(0.0,wave),18.0);
      vec4 viewPosition=modelViewMatrix*vec4(position,1.0);
      gl_Position=projectionMatrix*viewPosition;
      gl_PointSize=clamp((2.0+vPulse*2.8)*18.0/-viewPosition.z,1.4,6.0)*uPixelRatio;
    }`,
  fragmentShader:`
    uniform vec3 uColor;
    varying float vPulse;
    void main(){
      float radius=length(gl_PointCoord-.5)*2.0;
      if(radius>1.0)discard;
      float glow=pow(1.0-radius,1.6);
      gl_FragColor=vec4(uColor,glow*(.38+vPulse*.62));
    }`
});
hg.add(new THREE.Points(surfaceGeometry,surfaceMaterial));

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
const normalizedDepth=()=>depth()*referenceDistance/overviewDistance;
let lastReveal=-1;

function applyDepth(){
  const d=depth();
  const reveal=depthNavigationActive?clamp((15.7-normalizedDepth())/7.4,0,1):0;
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
    enteringBrain=false;
    window.__leewayBrainIntroActive=false;
    document.body.classList.add('galaxy-active');
    document.body.classList.remove('brain-intro');
    brainLayer.style.pointerEvents='none';
    window.__leewayPublicBrainEntered?.();
  }
}

function enterBrainOverview(){
  enteringBrain=false;
  depthNavigationActive=false;
  window.__leewayBrainIntroActive=true;
  document.body.classList.remove('galaxy-active');
  document.body.classList.add('brain-intro');
  brainLayer.style.pointerEvents='auto';
  brainCamera.position.set(0,0,overviewDistance);
  orbit.target.set(0,0,0);orbit.update();applyDepth();
  window.__leewayPublicBrainOverview?.();
  // The class change expands the stage. Fit its new bounds synchronously and
  // keep overview distance pinned through subsequent ResizeObserver callbacks.
  resizeBrain();
}
function enterBrain(){
  if(!window.__leewayBrainIntroActive)return;
  depthNavigationActive=true;
  if(reducedMotion.matches){
    brainCamera.position.sub(orbit.target).setLength(8.2*overviewDistance/referenceDistance).add(orbit.target);
    orbit.update();applyDepth();
  }else enteringBrain=true;
}
window.__leewayEnterBrainOverview=enterBrainOverview;
window.__leewayEnterBrain=enterBrain;
window.__leeway3DBrain={scene,camera:brainCamera,renderer:renderer3D,controls:orbit,root,hg,orbShell,orbWire,orbHalo,orbHaloMat,orbitalGroup,cortexMat,wireMat,particles,enterBrainOverview,enterBrain,depth,normalizedDepth};

orbit.addEventListener('change',applyDepth);

brainLayer.addEventListener('wheel',e=>{
  if(!window.__leewayBrainIntroActive)return;
  e.preventDefault();e.stopPropagation();
  enteringBrain=false;
  depthNavigationActive=true;
  const off=brainCamera.position.clone().sub(orbit.target);
  const next=clamp(off.length()*Math.exp(e.deltaY*.00115),5.75*overviewDistance/referenceDistance,42*overviewDistance/referenceDistance);
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
    enteringBrain=false;
    depthNavigationActive=true;
    const next=clamp(brainPinchStartDepth*ratio,5.75*overviewDistance/referenceDistance,42*overviewDistance/referenceDistance);
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
  if(window.__leewayBrainIntroActive||innerWidth<900||document.body.classList.contains('collection-view'))return;
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
  cortexMat.color.set("#092c47");
  cortexMat.emissive.set("#003451");
  cortexMat.emissiveIntensity=.38;
  wireMat.color.copy(accent).multiplyScalar(.78);
  wireMat.opacity=.14;
  surfaceMaterial.uniforms.uColor.value.copy(accent).lerp(new THREE.Color('#8eefff'),.42);
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
  key.color.copy(accent).lerp(new THREE.Color('#b6eaff'),.45);
  coreLight.color.copy(accent).multiplyScalar(.56);
  scene.fog.color.copy(bg).multiplyScalar(.72);
  renderer3D.toneMappingExposure=.95+Math.min(1.10,Math.max(.25,Number(a.brightness??.78)))*.24;
}
window.addEventListener("leeway-appearance-change",e=>apply3DAppearance(e.detail||{}));
try{apply3DAppearance(JSON.parse(localStorage.getItem("leeway.brain.appearance.v3")||"null")||{bg:"#010713",accent:"#00b7e8",brightness:.78})}catch{apply3DAppearance({bg:"#010713",accent:"#00b7e8",brightness:.78})}
function resizeBrain(){
  const r=brainHost.getBoundingClientRect();
  if(r.width<=0||r.height<=0)return;
  const previousDistance=overviewDistance;
  brainCamera.aspect=r.width/r.height;
  const verticalHalfFov=THREE.MathUtils.degToRad(brainCamera.fov/2);
  const horizontalHalfFov=Math.atan(Math.tan(verticalHalfFov)*brainCamera.aspect);
  // Fit the entire outer orbit (radius 6.2), including depth, with 16% margin.
  overviewDistance=6.3/(Math.sin(Math.min(verticalHalfFov,horizontalHalfFov))*.84);
  const offset=brainCamera.position.clone().sub(orbit.target);
  if(window.__leewayBrainIntroActive&&!depthNavigationActive)offset.setLength(overviewDistance);
  else offset.multiplyScalar(overviewDistance/previousDistance);
  brainCamera.position.copy(orbit.target).add(offset);
  orbit.minDistance=5.7*overviewDistance/referenceDistance;
  orbit.maxDistance=50*overviewDistance/referenceDistance;
  scene.fog.density=.019*referenceDistance/overviewDistance;
  brainCamera.updateProjectionMatrix();
  renderer3D.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
  orbit.update();applyDepth();
}
// Layout changes when entering/leaving a universe without a window resize.
const brainResizeObserver=new ResizeObserver(resizeBrain);
brainResizeObserver.observe(brainHost);
window.addEventListener('resize',resizeBrain);resizeBrain();applyDepth();

const clock3D=new THREE.Clock();
let lastFrame=0;
function animateBrain(ts=0){
  requestAnimationFrame(animateBrain);
  if(document.hidden||document.body.classList.contains('galaxy-active'))return;
  if(ts-lastFrame<33)return;
  const frameSeconds=Math.min(.1,(ts-lastFrame)/1000);
  lastFrame=ts;
  if(enteringBrain){
    const off=brainCamera.position.clone().sub(orbit.target);
    off.setLength(Math.max(8.2*overviewDistance/referenceDistance,off.length()*Math.exp(-1.3*frameSeconds)));
    brainCamera.position.copy(orbit.target).add(off);
  }
  orbit.enableDamping=!reducedMotion.matches;
  orbit.update();
  const t=reducedMotion.matches?0:clock3D.getElapsedTime(),breath=1+Math.sin(t*1.6)*.012;
  hg.scale.setScalar(breath);
  coreLight.intensity=1.65+Math.sin(t*2.5)*.42;
  cortexMat.emissiveIntensity=.38+Math.sin(t*1.2)*.035;
  surfaceMaterial.uniforms.uTime.value=t;
  runtimeCore.rotation.x=t*.32;runtimeCore.rotation.y=t*.48;ring.rotation.z=t*.22;
  orbWire.rotation.y=t*.028;orbWire.rotation.x=Math.sin(t*.11)*.04;
  orbitalGroup.rotation.y=t*.018;orbitalGroup.rotation.z=Math.sin(t*.08)*.025;
  renderer3D.render(scene,brainCamera);
}
animateBrain();
