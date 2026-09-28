const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(extra={}){const scope={AbortController,DOMException,setTimeout,clearTimeout,Date,...extra};scope.globalThis=scope;vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/thread-workplane.js','utf8'),scope);return scope}
test('creates one main thread, side threads, and exactly eight governed hand slots by default',()=>{
 const s=setup(),w=new s.LeeWayThreadWorkplane();assert.equal(w.mainThread.kind,'main');assert.equal(w.hands.length,8);const side=w.createSideThread();assert.equal(side.parentThreadId,w.mainThread.id);assert.equal(w.listThreads().length,2);
});
test('serializes the shared Gemma resource without cancelling the main job and prioritizes queued side work next',async()=>{
 const s=setup(),w=new s.LeeWayThreadWorkplane(),side=w.createSideThread(),order=[],release=[];
 const runner=name=>()=>new Promise(resolve=>{order.push(name);release.push(resolve)});
 const a=w.submit(w.mainThread.id,'main',runner('main'),{resource:'gemma',priority:50});
 const b=w.submit(w.mainThread.id,'main-2',async()=>order.push('main-2'),{resource:'gemma',priority:50});
 const c=w.submit(side.id,'side',async()=>order.push('side'),{resource:'gemma',priority:80});
 await new Promise(r=>setImmediate(r));assert.deepEqual(order,['main']);assert.equal(a.work.status,'RUNNING');assert.equal(c.work.status,'QUEUED');
 release.shift()();await a.promise;await new Promise(r=>setImmediate(r));assert.equal(order[1],'side');await c.promise;await b.promise;assert.deepEqual(order,['main','side','main-2']);
});
test('different resources can occupy different hands concurrently',async()=>{
 const s=setup(),w=new s.LeeWayThreadWorkplane(),release=[];const side=w.createSideThread();
 const a=w.submit(w.mainThread.id,'a',()=>new Promise(r=>release.push(r)),{resource:'gemma'});
 const b=w.submit(side.id,'b',()=>new Promise(r=>release.push(r)),{resource:'research'});
 await new Promise(r=>setImmediate(r));assert.equal(w.hands.filter(h=>h.status==='RUNNING').length,2);release.splice(0).forEach(r=>r());await Promise.all([a.promise,b.promise]);
});
test('navigation language identifies main and side sources deterministically',()=>{
 const s=setup(),w=new s.LeeWayThreadWorkplane(),side=w.createSideThread();
 assert.equal(s.LeeWayThreadNavigationPhrase(null,w.mainThread),'Main task update.');
 assert.match(s.LeeWayThreadNavigationPhrase(w.mainThread,side),/side chat/i);
 w.mainThread.status='COMPLETED';assert.match(s.LeeWayThreadNavigationPhrase(side,w.mainThread),/main task completed/i);
});
test('speech arbiter pauses one mouth for a side thread, announces source, then resumes main',async()=>{
 const log=[],voice={ready:true,pausePlayback(){log.push('pause');return ['main-audio']},async resumePlayback(h){log.push('resume:'+h.join(','))},stop(){log.push('stop')},
  async speakInsertedStream(stream,{onState}={}){for await(const text of stream){log.push('insert:'+text);onState?.(text)}},
  async speakStream(stream,{beforePlay,onRendered}={}){for await(const text of stream){await beforePlay?.();log.push('main:'+text);onRendered?.(text)}}};
 const s=setup(),w=new s.LeeWayThreadWorkplane(),side=w.createSideThread(),focused=[],a=new s.LeeWaySpeechLeaseArbiter(voice,{onThread:t=>focused.push(t.id)}),mainStream={done:false,[Symbol.asyncIterator](){return this},async next(){if(this.done)return {done:true};this.done=true;await new Promise(r=>setTimeout(r,20));return {value:'main words',done:false}}},
 sideStream={done:false,[Symbol.asyncIterator](){return this},async next(){if(this.done)return {done:true};this.done=true;return {value:'side words',done:false}}};
 const main=a.speak(w.mainThread,mainStream);await new Promise(r=>setTimeout(r,1));const branch=a.speak(side,sideStream);await branch;await main;
 assert.ok(log.some(x=>x==='pause'));assert.ok(log.some(x=>/insert:The side chat has new information/i.test(x)));assert.ok(log.some(x=>/insert:Back on the main task/i.test(x)||/insert:The main task completed/i.test(x)));assert.ok(log.some(x=>x.startsWith('resume:')));assert.deepEqual(focused,[w.mainThread.id,side.id,w.mainThread.id]);
});
