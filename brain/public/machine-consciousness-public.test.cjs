/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.MACHINE_CONSCIOUSNESS_PUBLIC_PROJECTION_TEST_V1
5WH:
WHAT = Regression tests for the deterministic public Machine Consciousness projection.
WHY = Ensure Agent Lee can answer Creator, ecosystem and capability questions without exposing the local carrier or invoking an LLM.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/machine-consciousness-public.test.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Load the actual browser script in an isolated VM with a controlled public-profile response.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function load(){
  const profile=JSON.parse(fs.readFileSync(path.join(__dirname,'agent-lee-public-knowledge.v1.json'),'utf8'));
  const scope={fetch:async()=>({ok:true,json:async()=>profile}),console};
  scope.globalThis=scope;
  vm.createContext(scope);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'machine-consciousness-public.js'),'utf8'),scope);
  return scope.LeeWayMachineConsciousnessPublic;
}

test('Creator and Machine Consciousness questions use the deterministic public projection',async()=>{
  const api=load();
  const creator=await api.answer('Who is Leonard Lee and who created Agent Lee?');
  assert.equal(creator.intent,'machine-consciousness.creator');
  assert.match(creator.text,/Leonard Lee/);
  assert.equal(creator.llm.used,false);
  assert.equal(creator.formulaExecution,'NOT_EXECUTED');
  const consciousness=await api.answer('What is Machine Consciousness?');
  assert.equal(consciousness.intent,'machine-consciousness.capability');
  assert.match(consciousness.text,/deterministic cognitive and orchestration runtime/i);
});

test('repository questions resolve to the admitted 32-repository map and withhold private links',async()=>{
  const api=load();
  const map=await api.answer('How many LeeWay repositories are in the ecosystem?');
  assert.equal(map.intent,'machine-consciousness.ecosystem');
  assert.match(map.text,/32 LeeWay repositories/);
  const publicRepo=await api.answer('What is RapidWebDev?');
  assert.equal(publicRepo.repository,'RapidWebDev');
  assert.ok(publicRepo.sources.some(url=>url.includes('/RapidWebDev')));
  const privateRepo=await api.answer('What is LeeWay-VRAM-Database?');
  assert.equal(privateRepo.repository,'LeeWay-VRAM-Database');
  assert.equal(privateRepo.sources.includes('https://github.com/4citeB4U/LeeWay-VRAM-Database'),false);
});

test('unrelated requests fail closed and capability answers preserve evidence boundaries',async()=>{
  const api=load();
  assert.equal(await api.answer('run powershell and delete files'),null);
  assert.equal(await api.answer('what is the weather today'),null);
  const voice=await api.answer('How does Voice Fabric handle interruption?');
  assert.equal(voice.capability,'VOICE_FABRIC_BIDIRECTIONAL_CONTRACT');
  assert.match(voice.text,/physical microphone|human-heard/i);
});

test('public brain loads the projection before its conversation handler',()=>{
  const index=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
  const projection=index.indexOf('/brain/public/machine-consciousness-public.js');
  const brain=index.indexOf('/brain/public/public-brain.js');
  assert.ok(projection>0&&brain>projection);
  const source=fs.readFileSync(path.join(__dirname,'public-brain.js'),'utf8');
  assert.match(source,/LeeWayMachineConsciousnessPublic\?\.answer/);
  assert.match(source,/Machine Consciousness/);
  assert.match(source,/LeeWayPortfolioVoiceSession\.speak\(machineAnswer\.text\)/);
});
