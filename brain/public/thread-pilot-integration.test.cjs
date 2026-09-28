const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const root=fs.readFileSync(__dirname+'/../../index.html','utf8'),brain=fs.readFileSync(__dirname+'/public-brain.js','utf8');
test('live Digital Brain loads thread workplane and speech lease patch before public brain',()=>{
 const speech=root.indexOf('/brain/public/speech-lease-patch.js'),work=root.indexOf('/brain/public/thread-workplane.js'),app=root.indexOf('/brain/public/public-brain.js');
 assert.ok(speech>0&&work>speech&&app>work);
});
test('live Digital Brain exposes main and side thread controls',()=>{
 for(const id of ['agentThreadSelect','agentNewSide','agentThreadStatus'])assert.ok(root.includes('id="'+id+'"'),id);
});
test('public brain routes Gemma through governed workplane and no longer cancels Gemma on speech onset',()=>{
 assert.ok(brain.includes("threadWorkplane.submit(thread.id,text"));
 assert.ok(brain.includes("speechArbiter.pauseCurrent()"));
 const listener=brain.slice(brain.indexOf('const browserListener='),brain.indexOf('const voiceDownloadFiles='));
 assert.equal(listener.includes('browserGemma?.cancel()'),false);
});
test('side chat route has explicit source identity and one shared Gemma resource',()=>{
 assert.ok(brain.includes("requestedThreadId==='AUTO_SIDE'"));
 assert.ok(brain.includes("resource:'gemma'"));
 assert.ok(brain.includes("recordChat('Agent Lee · '+threadDisplay(thread)"));
});
