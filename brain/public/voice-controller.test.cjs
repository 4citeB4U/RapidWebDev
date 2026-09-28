const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function harness(extra={}){
  const context={AbortController,URL,performance,setTimeout,clearTimeout,console,
    speechSynthesis:{cancel(){},getVoices(){return[]},speak(){throw new Error('Stale speech played');}},
    SpeechSynthesisUtterance:class{constructor(text){this.text=text}},...extra};
  vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/voice-controller.js','utf8'),context);
  return {context,controller:new context.LeeWayVoiceController()};
}
test('interrupt invalidates prior turn and aborts downstream request',()=>{
  const {controller}=harness();const first=controller.begin();controller.stop();
  assert.equal(first.signal.aborted,true);assert.equal(controller.current(first.epoch),false);
  const next=controller.begin();assert.equal(controller.current(next.epoch),true);
});
test('missing natural voice never silently substitutes robotic browser speech',async()=>{
  const {controller}=harness();let state='';controller.options.onState=message=>state=message;
  await controller.speak('Read this.',{browser_fallback:{enabled:false}});
  assert.equal(state,'Natural voice is not connected. Read the response below.');
});
test('late TTS response cannot play after Stop, even if fetch ignores abort',async()=>{
  let resolve;const {controller}=harness({fetch:()=>new Promise(r=>resolve=r)});
  const turn=controller.begin();const speaking=controller.speak('old reply',{tts_fallback:{secure_backend_endpoint:'https://voice.example/tts'}},turn.epoch);
  controller.stop();resolve({ok:true,blob:async()=>({type:'audio/wav'})});await speaking;
  assert.equal(controller.audio,null);assert.equal(controller.speaking,false);
});
test('Stop releases playout and is safe to repeat',()=>{
  let paused=0;const {controller}=harness();controller.audio={pause(){paused++},removeAttribute(){},load(){}};
  controller.stop();controller.stop();assert.equal(paused,1);assert.equal(controller.audio,null);
});
test('browser recognition stays on during Stop and rejects permission restart loop',()=>{
  class Recognition{start(){}abort(){}}
  const {controller}=harness({SpeechRecognition:Recognition});controller.startListening();controller.stop();
  assert.equal(controller.listening,true);controller.recognition.onerror({error:'not-allowed'});assert.equal(controller.listening,false);
});
test('live interruption flushes queued audio before subsequent output',()=>{
  const context={performance,console};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/voice-live.js','utf8'),context);
  const live=new context.LeeWayLiveVoice();let stopped=0;live.sources.add({stop(){stopped++}});
  live.receive({serverContent:{interrupted:true,modelTurn:{parts:[{inlineData:{mimeType:'audio/pcm',data:'AA=='}}]}}});
  assert.equal(stopped,1);assert.equal(live.sources.size,0);
});
test('live Stop drops late audio through the old turn boundary',()=>{
  const context={performance,console};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/voice-live.js','utf8'),context);
  const live=new context.LeeWayLiveVoice();let played=0;live.play=()=>played++;
  live.stop();live.receive({serverContent:{modelTurn:{parts:[{inlineData:{mimeType:'audio/pcm',data:'AAA='}}]}}});
  assert.equal(played,0);live.receive({serverContent:{turnComplete:true}});assert.equal(live.mutedTurn,false);
});
test('live Stop rejects a late Gemma tool result',async()=>{
  const context={performance,console};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/voice-live.js','utf8'),context);
  let resolve;const live=new context.LeeWayLiveVoice({onQuestion:()=>new Promise(r=>resolve=r)}),sent=[];
  live.send=message=>sent.push(message);
  live.receive({toolCall:{functionCalls:[{id:'old-call',name:'ask_gemma',args:{question:'Old question'}}]}});
  live.stop();resolve('Old answer');await Promise.resolve();await Promise.resolve();
  assert.equal(sent.some(message=>message.toolResponse),false);
});
