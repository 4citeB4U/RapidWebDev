/* Additive pilot patch: pause/resume plus non-destructive inserted speech. */
(function(root){
 'use strict';
 const Voice=root.LeeWayBrowserVoice,Stream=root.LeeWaySpeechStream,metrics=root.LeeWayVoiceMetrics;
 if(!Voice||!Stream||!metrics)return;
 const aborted=()=>new DOMException('Speech was stopped.','AbortError');
 Voice.prototype.pausePlayback=function(){
  const paused=[];
  for(const source of this.sources||[]){
   if(!source?.media)continue;
   if(source.leewayPaused){paused.push(source);continue;}
   if(!source.media.paused){source.media.pause();source.leewayPaused=true;paused.push(source);}
  }
  metrics.record('playback-pause',{count:paused.length});return paused;
 };
 Voice.prototype.resumePlayback=async function(handles){
  const all=[...(this.sources||[])],selected=handles?.length?handles:all.filter(source=>source.leewayPaused);
  let resumed=0;
  for(const source of selected){
   if(!all.includes(source)||!source?.media||!source.leewayPaused)continue;
   source.leewayPaused=false;await source.media.play();resumed++;
  }
  metrics.record('playback-resume',{count:resumed});return resumed;
 };
 async function streamSpeech(voice,stream,{signal,onState=()=>{},onRendered=()=>{},beforePlay=async()=>{},inserted=false}={}){
  if(!voice.ready)throw new Error('Load the browser voice first.');
  if(signal?.aborted)throw aborted();
  const epoch=voice.epoch,iterator=stream[Symbol.asyncIterator]();let number=0;
  const valid=()=>{if(epoch!==voice.epoch||signal?.aborted)throw aborted();};
  const prepare=async()=>{
   const item=await iterator.next();valid();if(item.done)return null;
   if(++number>60)throw new Error('This reply is too long for one spoken turn.');
   const segment=number,start=performance.now();metrics.record(inserted?'tts-insert-start':'tts-start',{segment});
   const result=await voice.request('generate',{text:item.value,exaggeration:voice.exaggeration},p=>{if(epoch===voice.epoch&&p.message&&!voice.sources.size)onState(p.message)});
   valid();metrics.record(inserted?'tts-insert-ready':'tts-ready',{segment,durationMs:performance.now()-start,...result.timings});return {result,text:item.value,segment};
  };
  const settled=()=>prepare().then(value=>({value}),error=>({error}));let pending=settled();
  try{
   for(;;){
    const item=await pending;if(item.error)throw item.error;valid();if(!item.value)break;
    pending=settled();await beforePlay(item.value);valid();onState('Speaking. The microphone can interrupt.');
    metrics.record(inserted?'playback-insert-request':'playback-request',{segment:item.value.segment});
    await voice.play(item.value.result,epoch);valid();onRendered(item.value.text);metrics.record(inserted?'segment-insert-rendered':'segment-rendered',{segment:item.value.segment});
   }
   onState('Ready.');
  }finally{stream.dispose?.();}
 }
 Voice.prototype.speakStream=async function(stream,options={}){
  this.stop();const epoch=this.epoch;this.activeStream=stream;
  const stop=()=>{stream.fail?.(aborted());if(epoch===this.epoch)this.stop();};options.signal?.addEventListener('abort',stop,{once:true});
  try{return await streamSpeech(this,stream,options)}
  catch(error){stream.fail?.(error);if(epoch===this.epoch)this.stop();throw error}
  finally{options.signal?.removeEventListener('abort',stop);if(this.activeStream===stream)this.activeStream=null}
 };
 Voice.prototype.speakInsertedStream=async function(stream,options={}){
  try{return await streamSpeech(this,stream,{...options,inserted:true})}
  catch(error){stream.fail?.(error);throw error}
 };
})(globalThis);
