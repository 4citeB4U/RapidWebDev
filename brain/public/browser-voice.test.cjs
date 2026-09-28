const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(extra={}){
  class Worker{constructor(){this.messages=[];Worker.instances.push(this)}postMessage(m){this.messages.push(m)}terminate(){this.terminated=true}reply(id,data){this.onmessage({data:{id,type:'complete',data}})}}Worker.instances=[];
  const scope={Worker,DOMException,AbortController,setTimeout,clearTimeout,console,URL,...extra};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/browser-voice.js','utf8'),scope);
  return {Voice:scope.LeeWayBrowserVoice,Worker};
}
test('speaking cannot initiate unsolicited model download',async()=>{
  const {Voice,Worker}=setup(),voice=new Voice();await assert.rejects(voice.speak('Hello.'),/Load the browser voice first/);assert.equal(Worker.instances.length,0);
});
test('Stop suppresses late generated audio even when inference ignores cancellation',async()=>{
  const {Voice}=setup(),voice=new Voice();voice.ready=true;let played=0;voice.play=async()=>played++;
  const speech=voice.speak('Hello there.');const rejection=assert.rejects(speech,{name:'AbortError'});
  const worker=voice.worker,id=worker.messages.find(m=>m.type==='generate').id;
  voice.stop();worker.reply(id,{audio:new ArrayBuffer(4),sampleRate:24000});await rejection;assert.equal(played,0);assert.equal(voice.pending.size,0);
});
test('new turn supersedes pending old speech and still plays its own result',async()=>{
  const {Voice}=setup(),voice=new Voice();voice.ready=true;let played=0;voice.play=async()=>played++;
  const old=voice.speak('Old words.');const oldRejected=assert.rejects(old,{name:'AbortError'});
  const next=voice.speak('New words.');const id=voice.worker.messages.filter(m=>m.type==='generate').at(-1).id;
  voice.worker.reply(id,{audio:new ArrayBuffer(4),sampleRate:24000});await Promise.all([next,oldRejected]);assert.equal(played,1);await voice.dispose();
});
test('AbortSignal interrupts speech and dispose releases worker',async()=>{
  const {Voice}=setup(),voice=new Voice();voice.ready=true;const controller=new AbortController();
  const speech=voice.speak('Hello.',{signal:controller.signal}),rejected=assert.rejects(speech,{name:'AbortError'});controller.abort();await rejected;
  const worker=voice.worker;await voice.dispose();assert.equal(worker.terminated,true);assert.equal(voice.ready,false);
});
test('speech chunking preserves text and bounds inference-sized sections',()=>{
  const {Voice}=setup(),text=Array.from({length:100},(_,i)=>'word'+i).join(' '),parts=Voice.chunks(text);
  assert.equal(parts.join(' '),text);assert.ok(parts.length>1);assert.ok(parts.every(p=>p.length<=180&&p.split(' ').length<=24));
});
test('faster playback preserves pitch, applies pace immediately and releases audio on Stop',async()=>{
  let media,revoked=0;
  class Audio{constructor(url){media=this;this.src=url}play(){return Promise.resolve()}pause(){this.paused=true}removeAttribute(){this.src=''}load(){}}
  const {Voice}=setup({Audio,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++}}),voice=new Voice();
  const playback=voice.play({audio:new Float32Array([0,.2,-.2]).buffer,sampleRate:24000},voice.epoch);
  const rejection=assert.rejects(playback,{name:'AbortError'});
  assert.equal(media.playbackRate,1.1);assert.equal(media.preservesPitch,true);
  voice.setPace(1.2);assert.equal(media.playbackRate,1.2);voice.stop();await rejection;
  assert.equal(media.paused,true);assert.equal(media.src,'');assert.equal(revoked,1);assert.equal(voice.sources.size,0);
});
