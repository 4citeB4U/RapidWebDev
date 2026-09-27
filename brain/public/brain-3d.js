import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stageEl=document.getElementById('stage');
const brainLayer=document.getElementById('brainUniverseLayer');
const brainHost=document.getElementById('brain3DCanvas');
if(!stageEl||!brainLayer||!brainHost) throw new Error('LEEWAY_3D_BRAIN_HOST_MISSING');

window.__leewayBrainIntroActive=true;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x040812,0.017);
const brainCamera=new THREE.PerspectiveCamera(46,1,.1,1000);
brainCamera.position.set(0,.65,18.8);

const renderer3D=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer3D.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer3D.setClearColor(0x040812,0);
renderer3D.toneMapping=THREE.ACESFilmicToneMapping;
renderer3D.toneMappingExposure=1.16;
brainHost.appendChild(renderer3D.domElement);

const orbit=new OrbitControls(brainCamera,renderer3D.domElement);
orbit.enableDamping=true;
orbit.dampingFactor=.055;
orbit.enableZoom=true;
orbit.zoomSpeed=.72;
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

scene.add(new THREE.AmbientLight(0x0b2545,2.7));
const key=new THREE.DirectionalLight(0x00f0ff,3.9);key.position.set(16,22,18);scene.add(key);
const rim=new THREE.DirectionalLight(0x8a2be2,3.1);rim.position.set(-18,-12,-16);scene.add(rim);
const warm=new THREE.DirectionalLight(0xff8a16,1.0);warm.position.set(-12,3,15);scene.add(warm);

const root=new THREE.Group();scene.add(root);
const hg=new THREE.Group();root.add(hg);
const leftGeo=createBrainHemisphereGeometry(true),rightGeo=createBrainHemisphereGeometry(false);
const cortexMat=new THREE.MeshPhysicalMaterial({
  color:0x051d36,emissive:0x003d66,emissiveIntensity:.82,roughness:.32,metalness:.12,
  clearcoat:.5,clearcoatRoughness:.2,transparent:true,opacity:.57,depthWrite:false,side:THREE.DoubleSide
});
const wireMat=new THREE.MeshBasicMaterial({color:0x00b4d8,wireframe:true,transparent:true,opacity:.30,blending:THREE.AdditiveBlending});
hg.add(new THREE.Mesh(leftGeo,cortexMat),new THREE.Mesh(rightGeo,cortexMat),new THREE.Mesh(leftGeo,wireMat),new THREE.Mesh(rightGeo,wireMat));

const coreLight=new THREE.PointLight(0x50e6ff,4.0,16);root.add(coreLight);
const runtimeCore=new THREE.Mesh(
  new THREE.IcosahedronGeometry(.54,2),
  new THREE.MeshPhysicalMaterial({color:0x50e6ff,emissive:0x00b8d4,emissiveIntensity:2.0,transparent:true,opacity:.76,roughness:.2})
);root.add(runtimeCore);
const ring=new THREE.Mesh(
  new THREE.TorusGeometry(1.02,.022,12,96),
  new THREE.MeshBasicMaterial({color:0x50e6ff,transparent:true,opacity:.48,blending:THREE.AdditiveBlending})
);ring.rotation.x=Math.PI/2;root.add(ring);

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
  document.documentElement.style.setProperty('--brain-shell-alpha',String(1-late*.96));
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
window.__leeway3DBrain={scene,camera:brainCamera,renderer:renderer3D,controls:orbit,root,enterBrainOverview,depth};

orbit.addEventListener('change',applyDepth);

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
  renderer3D.render(scene,brainCamera);
}
animateBrain();
