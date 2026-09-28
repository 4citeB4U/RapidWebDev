const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(options={}){
  const scope={performance,window:{},DOMException,Float32Array,Int16Array};vm.createContext(scope);
  vm.runInContext(fs.readFileSync(__dirname+'/browser-listener.js','utf8'),scope);
  const listener=new scope.window.LeeWayBrowserListener(options);listener.resetUtterance();listener.noise=.002;listener.load=async()=>{listener.ready=true};return listener;
}
test('speech interrupts before transcription and ignores short noise',()=>{
  let interrupted=0;const listener=setup({onSpeech:()=>interrupted++});
  const speech=new Int16Array(320).fill(2000),quiet=new Int16Array(320);
  for(let i=0;i<5;i++)listener.consume(speech);listener.consume(quiet);assert.equal(interrupted,0);
  for(let i=0;i<6;i++)listener.consume(speech);assert.equal(interrupted,1);
});
test('explicit Stop discards a delayed transcript and queued speech',async()=>{
  let delivered=0,complete;const listener=setup({onTranscript:()=>delivered++});listener.active=true;listener.utterance=1;
  listener.request=()=>new Promise(resolve=>complete=resolve);
  listener.waitingClip={audio:new Float32Array(320),epoch:listener.epoch,utterance:1};
  const pending=listener.transcribeNext();await new Promise(r=>setImmediate(r));listener.cancelUtterance();complete({text:'Old request'});await pending;
  assert.equal(delivered,0);assert.equal(listener.waitingClip,null);
});
test('new speech suppresses old transcription but delivers its own turn',async()=>{
  const delivered=[];let complete;const listener=setup({onTranscript:t=>delivered.push(t)});listener.active=true;listener.utterance=1;
  listener.request=()=>new Promise(resolve=>complete=resolve);
  listener.waitingClip={audio:new Float32Array(320),epoch:0,utterance:1};const old=listener.transcribeNext();await new Promise(r=>setImmediate(r));
  listener.utterance=2;complete({text:'Old'});await old;
  listener.waitingClip={audio:new Float32Array(320),epoch:0,utterance:2};const next=listener.transcribeNext();await new Promise(r=>setImmediate(r));complete({text:'New'});await next;
  assert.deepEqual(delivered,['New']);
});

test('first click opens microphone before recognition finishes loading',async()=>{
 let stopped=0,modelLoads=0;const track={stop(){stopped++},getSettings:()=>({})};
 class AudioContext{constructor(){this.audioWorklet={addModule:async()=>{}};this.destination={}}async resume(){}async close(){}createMediaStreamSource(){return {connect(){},disconnect(){}}}}
 class AudioWorkletNode{constructor(){this.port={}}connect(){}disconnect(){}}
 const scope={performance,window:{},DOMException,Float32Array,Int16Array,AudioContext,AudioWorkletNode,navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]})}}};
 vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/browser-listener.js','utf8'),scope);
 const listener=new scope.window.LeeWayBrowserListener();listener.load=()=>{modelLoads++;return new Promise(()=>{})};
 await listener.start();assert.equal(listener.active,true);assert.equal(listener.ready,false);assert.equal(modelLoads,1);await listener.stop();assert.equal(listener.active,false);assert.equal(stopped,1);
});
test('mute while browser permission is pending releases the eventual microphone',async()=>{
 let grant,stopped=0;const track={stop(){stopped++}};const scope={performance,window:{},DOMException,Float32Array,Int16Array,navigator:{mediaDevices:{getUserMedia:()=>new Promise(r=>grant=r)}}};
 vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/browser-listener.js','utf8'),scope);const listener=new scope.window.LeeWayBrowserListener();listener.load=()=>{throw new Error('should not load')};
 const starting=listener.start();await listener.stop();grant({getTracks:()=>[track]});await starting;assert.equal(stopped,1);assert.equal(listener.active,false);
});
