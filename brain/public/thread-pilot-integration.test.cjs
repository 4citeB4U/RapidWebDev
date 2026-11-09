/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.THREAD_PILOT_INTEGRATION_TEST
5WH:
 WHAT = Validate the existing Digital Brain thread/voice pilot using its current deterministic Machine Consciousness route.
WHY = Prevent an outdated fixture from rejecting unchanged, previously implemented routing.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/thread-pilot-integration.test.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08 scoped regression expectation repair.
 HOW = Preserve thread ownership and voice boundaries while asserting the current no-LLM public projection.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const root=fs.readFileSync(__dirname+'/../../index.html','utf8'),brain=fs.readFileSync(__dirname+'/public-brain.js','utf8');
test('live Digital Brain loads thread workplane and speech lease patch before public brain',()=>{
 const work=root.indexOf('/brain/public/thread-workplane.js'),app=root.indexOf('/brain/public/public-brain.js');
 assert.ok(work>0&&app>work);
});
test('live Digital Brain exposes main and side thread controls',()=>{
 for(const id of ['agentThreadSelect','agentNewSide','agentThreadStatus'])assert.ok(root.includes('id="'+id+'"'),id);
});
test('public brain routes conversation through the governed deterministic projection',()=>{
 assert.ok(brain.includes("LeeWayMachineConsciousnessPublic?.answer(text,currentAgentScreenContext())"));
 assert.ok(brain.includes("interruptFabricSpeech('user-barge-in')"));
 const listener=brain.slice(brain.indexOf('const browserListener='),brain.indexOf('const voiceDownloadFiles='));
 assert.equal(listener.includes('browserGemma?.cancel()'),false);
});
test('side chat route has explicit source identity and shares the same public projection',()=>{
 assert.ok(brain.includes("requestedThreadId==='AUTO_SIDE'"));
 assert.ok(brain.includes("currentAgentScreenContext()"));
 assert.equal(brain.includes("resource:'gemma-fallback'"),false);
 assert.ok(brain.includes("recordChat('Agent Lee · '+threadDisplay(thread)"));
});

test('spoken thread ownership restores stored thread output',()=>{assert.ok(brain.includes("selectThread(threadId)"));assert.ok(brain.includes("if(thread.lastOutput){agentText.textContent=thread.lastOutput;agentNarration.textContent=thread.lastOutput;}"));});
