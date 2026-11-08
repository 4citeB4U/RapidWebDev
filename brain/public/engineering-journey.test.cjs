/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.ENGINEERING_JOURNEY_TEST_V1
5WH:
WHAT = Regression tests for deterministic source-grounded Agent Lee engineering narration.
WHY = Prevent unsupported story claims, LLM substitution, and accidental takeover of unrelated questions.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/engineering-journey.test.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Exercise the actual public script in an isolated Node VM without host/network access.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function load(){
  const scope={};vm.createContext(scope);
  vm.runInContext(fs.readFileSync(__dirname+'/engineering-journey.js','utf8'),scope);
  return scope.LeeWayEngineeringJourney;
}
test('engineering story uses first-party sources and no model or execution claims',()=>{
  const j=load();
  for(const [question,chapter] of [
    ['Why did you create LeeWay?','purpose'],
    ['What is the engineering methodology?','engineering'],
    ['Why keep redesigning?','iteration'],
    ['Explain the Formula','formula'],
    ['What is Machine Consciousness?','consciousness'],
    ['Tell me about Voice Fabric','voice'],
    ['What is Device Bridge?','devices'],
    ['What is the future of LeeWay?','next']
  ]){
    const a=j.answer(question);
    assert.equal(a.chapter,chapter,question);
    assert.equal(a.llm.used,false);
    assert.equal(a.formulaExecution,'NOT_EXECUTED');
    assert.equal(a.providerExecution,'NOT_EXECUTED');
    assert.equal(a.evidenceClass,'CURATED_PUBLIC_SOURCE_NARRATION');
    assert.ok(a.text.length>100);
    assert.ok(a.sources.length>0);
    for(const url of a.sources)assert.match(url,/^https:\/\/github\.com\/4citeB4U\//);
  }
});
test('story can proceed one chapter at a time and reset without leaking across page refresh',()=>{
  const j=load();
  assert.equal(j.answer('Tell me the story').chapter,'purpose');
  assert.equal(j.answer('continue the story').chapter,'iteration');
  assert.equal(j.answer('next chapter').chapter,'engineering');
  assert.equal(j.answer('previous chapter').chapter,'iteration');
  j.reset();
  assert.equal(j.answer('go on').chapter,'purpose');
});
test('ordinary unrelated requests do not get fictional answers',()=>{
  const j=load();
  for(const question of ['run powershell','delete local files','what is the weather','', 'x'.repeat(601)]){
    assert.equal(j.answer(question),null);
  }
});
test('published chapters are bounded and do not claim production acceptance',()=>{
  const j=load();
  assert.equal(j.chapters.length,8);
  const text=j.chapters.map(c=>c.title).join(' ');
  assert.match(text,/method|journey|machine|voice/i);
});

test('existing Digital Brain loads story and canonical speech client before main application',()=>{
  const index=fs.readFileSync(__dirname+'/../../index.html','utf8');
  const narrative=index.indexOf('/brain/public/engineering-journey.js');
  const speaker=index.indexOf('/brain/public/voice-fabric-session.js');
  const app=index.indexOf('/brain/public/public-brain.js');
  assert.ok(narrative>0&&speaker>narrative&&app>speaker);
  const brain=fs.readFileSync(__dirname+'/public-brain.js','utf8');
  const story=brain.indexOf('LeeWayEngineeringJourney?.answer(text)');
  const models=brain.indexOf('LeeWayEcosystemFabric;',story);
  assert.ok(story>0&&models>story,'documented story is resolved before model-dependent chat');
  assert.ok(brain.includes('LeeWayPortfolioVoiceSession.speak(narrative.text)'));
  assert.ok(brain.includes('LeeWayPortfolioVoiceSession?.stop()'));
});
test('canonical Voice Fabric client is source-only, fail-closed, and syntactically valid',()=>{
  const source=fs.readFileSync(__dirname+'/voice-fabric-session.js','utf8');
  assert.doesNotThrow(()=>new vm.Script(source));
  assert.match(source,/LeeWay-Voice-Fabric\/src\/voice-sdk\.js/);
  assert.match(source,/selectVoice\('agent-lee-voice-one'\)/);
  assert.match(source,/allowFallback:false/);
  assert.match(source,/client\.stop\(\)/);
  assert.doesNotMatch(source,/speechSynthesis|C:\\\\|E:\\\\|Gemma|Gemini|openai/i);
});
