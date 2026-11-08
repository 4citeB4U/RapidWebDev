/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.CORE_RECONCILIATION_TEST
5WH:
WHAT = Test exact identity/core grouping, evidence matching and spoken tour source.
WHY = Prevent stale repository/authority placement and repeated unrelated evidence.
WHO = Creator/Human Authority; RapidWebDev outside contributors.
WHERE = brain/public/leeway-core-portfolio.test.cjs.
WHEN = 2026-11-08.
HOW = Run actual static catalog in a no-network Node VM and test the current source wiring.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/leeway-core-portfolio.js','utf8');
const record=JSON.parse(fs.readFileSync(__dirname+'/leeway-core-reconciliation.v1.json','utf8'));
function create(){
 const box={URL,fetch:async uri=>({ok:uri==='/brain/public/leeway-core-reconciliation.v1.json',json:async()=>record})};
 vm.createContext(box);vm.runInContext(source,box);
 return box.LeeWayCorePortfolio;
}
test('original 17 are all accounted for, with one non-canonical optional legacy bridge',()=>{
 assert.equal(record.historical17.length,17);
 assert.equal(record.historical17.filter(x=>x.scope==='CORE').length,10);
 assert.equal(record.historical17.filter(x=>x.scope==='DIRECT').length,6);
 assert.equal(record.historical17.filter(x=>x.scope==='OPTIONAL').length,1);
 assert.equal(new Set(record.historical17.map(x=>x.name.toLowerCase())).size,17);
 assert.equal(record.historical17.find(x=>x.name==='Leeway-Digital-Employment-Center').sourceState,'REPOSITORY_UNRESOLVED');
 assert.equal(record.historical17.find(x=>x.name==='LEEWAY-BRIDGE-').scope,'OPTIONAL');
});
test('current Standards core is distinct from historical 17 scope',()=>{
 assert.equal(record.currentStandardsRegistrySpine.length,10);
 assert.equal(record.currentStandardsRegistrySpine.find(x=>x.name==='Machine-Consciousness').status,'ACTIVE_ENGINEERING_CORE');
 assert.equal(record.currentStandardsRegistrySpine.find(x=>x.name==='LeeWay-Continuum').status,'ACTIVE_ENGINEERING_CORE');
 assert.equal(record.additionalPublicSystemSummaries.find(x=>x.name==='Machine-Consciousness').verification,'PUBLIC_SOURCE_ONLY');
});
test('core reconciliation preserves wider portfolio while withholding private URLs and preventing duplicates',async()=>{
 const c=create();await c.load();
 const result=c.enrich([
  {repo_name:'LeeWay-Standards',id:'repo::LeeWay-Standards',kind:'project',label:'Standards',repo_url:'https://github.com/4citeB4U/LeeWay-Standards'},
  {repo_name:'Leeway-Runtime-Fabric',id:'repo::Leeway-Runtime-Fabric',kind:'project',repo_url:'https://github.com/4citeB4U/Leeway-Runtime-Fabric'},
  {repo_name:'OtherPublicProject',id:'repo::OtherPublicProject',kind:'project',evidence_state:'LIVE',repo_url:'https://github.com/4citeB4U/OtherPublicProject'},
  {id:'estate::original-design',kind:'project',repo_name:null,label:'Original design exhibit'},
  {id:'estate::historic-concept',kind:'project',repo_name:null,label:'Historic concept exhibit'}
 ]);
 const keys=result.map(x=>x.id);
 assert.equal(keys.length,new Set(keys).size);
 assert.equal(result.filter(x=>x.core_scope==='CORE').length,10);
 const rt=result.find(x=>x.core_repo_name==='Leeway-Runtime-Fabric');
 assert.equal(rt.repo_url,null);assert.equal(rt.repo_name,null);
 const unknown=result.find(x=>x.id==='repo::OtherPublicProject');
 assert.equal(unknown.evidence_state,'PUBLIC WEBSITE LINK · RUNTIME UNVERIFIED');
 assert.ok(result.some(x=>x.core_repo_name==='Machine-Consciousness'));
 assert.ok(result.some(x=>x.id==='estate::original-design'));
 assert.ok(result.some(x=>x.id==='estate::historic-concept'));
 assert.equal(result.find(x=>x.core_repo_name==='LeeWay-Voice-Fabric').live_url,'https://4citeb4u.github.io/LeeWay-Voice-Fabric/');
 assert.equal(result.find(x=>x.core_repo_name==='RapidWebDev').live_url,'https://rapidwebdevelop.com/');
});
test('evidence links are exact repository relations, not shared-word fallback or fake execution',async()=>{
 const c=create();await c.load();
 const src=c.evidenceFor({repo_name:'LeeWay-Standards',repo_url:'https://github.com/4citeB4U/LeeWay-Standards'});
 assert.equal(src.length,2);
 assert.ok(src.every(x=>x.claim.includes('NOT_')||x.claim.includes('NOT')));
 assert.equal(c.evidenceFor({repo_name:'Leeway-Runtime-Fabric',repo_url:null}).length,0);
 assert.equal(c.evidenceFor({repo_name:'Anything',repo_url:'https://evil.example/redirect'}).length,0);
 assert.equal(c.evidenceFor({repo_name:'Anything',repo_url:'https://github.com/otherOrg/Anything'}).length,0);
});
test('tour covers genuine engineering spine and real selected speaker, never a timer',async()=>{
 const c=create();await c.load();
 const tour=c.tour();
 assert.ok(tour.length>=9);
 assert.equal(tour[0].repoName,'LeeWay-Standards');
 assert.ok(tour.some(x=>x.repoName==='Machine-Consciousness'));
 assert.equal(tour[1].repoName,'LeeWay-Engineering');
 assert.ok(tour.some(x=>x.repoName==='Leeway-Runtime-Fabric'));
 const brain=fs.readFileSync(__dirname+'/public-brain.js','utf8');
 const start=brain.indexOf('async function startTour()');
 const end=brain.indexOf('function fit()',start);
 const tourSource=brain.slice(start,end);
 assert.match(tourSource,/conversationSession\.toggle\(\)/);
 assert.match(tourSource,/LeeWayCorePortfolio\?\.tour\(\)/);
 assert.match(tourSource,/await speakFromFabric\(chapter\.text,chapter\.title\)/);
 assert.doesNotMatch(tourSource,/setTimeout\(/);
 assert.match(brain,/function relevantEvidence\(x\)/);
 assert.doesNotMatch(brain,/if\(!rows\.length&&\["Scientific Research"/);
 assert.doesNotMatch(brain,/Running project experience preserved as public execution evidence/);
});
