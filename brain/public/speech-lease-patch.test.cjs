const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const scope={performance,DOMException,AbortController,Event,setTimeout,clearTimeout,URL,console};scope.globalThis=scope;vm.createContext(scope);
 for(const file of ['browser-voice.js','speech-pipeline.js','speech-lease-patch.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),scope);
 const voice=new scope.LeeWayBrowserVoice();voice.ready=true;return {scope,voice,Stream:scope.LeeWaySpeechStream};
}
test('pause and resume preserve live media instead of invalidating the voice epoch',async()=>{
 const {voice}=setup();let pauses=0,plays=0;const media={paused:false,pause(){this.paused=true;pauses++},async play(){this.paused=false;plays++}};
 const source={media,stop(){}};voice.sources.add(source);const epoch=voice.epoch,handles=voice.pausePlayback();assert.equal(handles.length,1);assert.equal(voice.epoch,epoch);await voice.resumePlayback(handles);assert.equal(voice.epoch,epoch);assert.equal(pauses,1);assert.equal(plays,1);
});
test('inserted speech does not stop an existing paused source or advance epoch',async()=>{
 const {voice,Stream}=setup();const epoch=voice.epoch,played=[];voice.request=async(type,data)=>({text:data.text,timings:{}});voice.play=async result=>played.push(result.text);
 const s=new Stream();s.push('Side chat words are spoken through the same mouth.');s.end();await voice.speakInsertedStream(s);assert.equal(voice.epoch,epoch);assert.deepEqual(played,['Side chat words are spoken through the same mouth.']);
});
test('beforePlay gate prevents a prepared main segment from entering playout until lease returns',async()=>{
 const {voice,Stream}=setup();const s=new Stream();let release,played=false;voice.request=async()=>({timings:{}});voice.play=async()=>{played=true};
 s.push('Main task speech waits for the speech lease before playback begins.');s.end();
 const gate=new Promise(r=>release=r),run=voice.speakStream(s,{beforePlay:()=>gate});await new Promise(r=>setImmediate(r));assert.equal(played,false);release();await run;assert.equal(played,true);
});
