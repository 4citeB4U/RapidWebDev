/* Chatterbox TTS entirely in the visitor's browser. No API keys or localhost. */
(function(root){
  'use strict';
  const REVISION='3cab09af388d3f02bba43443fce88c1f4525ac43';
  const sourceURL=typeof document!=='undefined'?document.currentScript?.src:null;
  const DEFAULT_REFERENCE=sourceURL?new URL('voices/agent-lee-reference.wav?v=638c88b332ec',sourceURL).href:'/brain/public/voices/agent-lee-reference.wav?v=638c88b332ec';
  const WORKER_URL=sourceURL?new URL('chatterbox.worker.js?v=20260928-browser3',sourceURL).href:'/brain/public/chatterbox.worker.js?v=20260928-browser3';
  function aborted(){return new DOMException('Speech was stopped.','AbortError');}
  function chunks(text){
    const words=String(text).replace(/\s+/g,' ').trim().split(' '),result=[];let next='';
    for(const word of words){
      if(next&&(next.length+word.length>180||next.split(' ').length>=24)){result.push(next);next='';}
      next+=(next?' ':'')+word;
      if(next.length>=60&&/[.!?]$/.test(word)){result.push(next);next='';}
    }
    if(next)result.push(next);return result.filter(Boolean);
  }
  class LeeWayBrowserVoice {
    constructor(options={}){
      this.options=options;this.ready=false;this.loading=null;this.epoch=0;this.id=0;
      this.pending=new Map();this.sources=new Set();this.finishPlayback=new Set();this.device=null;this.lifecycle=0;
      this.exaggeration=.25;
    }
    static get download(){return {model:'onnx-community/chatterbox-ONNX',revision:REVISION,webgpuBytes:1499401538,wasmBytes:1548283901,referenceBytes:720078};}
    static chunks(text){return chunks(text);}
    createWorker(){
      if(this.worker)return;
      const worker=this.worker=new Worker(this.options.workerURL||WORKER_URL,{type:'module'});
      worker.onmessage=({data:message})=>{
        const request=this.pending.get(message.id);if(!request)return;
        if(message.type==='progress'){request.progress?.(message.data);return;}
        this.pending.delete(message.id);clearTimeout(request.timer);
        if(message.type==='error')request.reject(new Error(message.data.message));else request.resolve(message.data);
      };
      worker.onerror=event=>{
        for(const request of this.pending.values()){clearTimeout(request.timer);request.reject(new Error(event.message||'Browser voice worker failed. Reload voice to retry.'));}
        this.pending.clear();this.ready=false;worker.terminate();if(this.worker===worker)this.worker=null;
      };
    }
    request(type,data={},progress,transfer=[]){
      this.createWorker();const id=++this.id;
      return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{
          this.pending.delete(id);reject(new Error('Browser voice took too long. Stop and reload voice, or try a shorter reply.'));
          // A stalled session is not left consuming GPU/CPU in the background.
          this.worker?.terminate();this.worker=null;this.ready=false;
          for(const other of this.pending.values()){clearTimeout(other.timer);other.reject(new Error('Voice worker was restarted.'));}
          this.pending.clear();
        },type==='load'?15*60_000:5*60_000);
        this.pending.set(id,{resolve,reject,progress,timer,type});
        this.worker.postMessage({id,type,data,epoch:this.epoch},transfer);
      });
    }
    async audioContext(){
      if(!this.audio||this.audio.state==='closed')this.audio=new (root.AudioContext||root.webkitAudioContext)();
      if(this.audio.state==='suspended')await this.audio.resume();return this.audio;
    }
    // Explicit opt-in entry point: downloads approximately 1.5 GB on the first load.
    async load(onProgress=()=>{}){
      if(this.ready)return {device:this.device};if(this.loading)return this.loading;
      const lifecycle=this.lifecycle;
      this.loading=(async()=>{
        // Resume output in the user gesture before any network/model work.
        await this.audioContext();if(lifecycle!==this.lifecycle)throw aborted();
        onProgress({status:'initiate',file:'Chatterbox voice',total:LeeWayBrowserVoice.download.webgpuBytes});
        const result=await this.request('load',{device:this.options.device},onProgress);if(lifecycle!==this.lifecycle)throw aborted();this.device=result.device;
        onProgress({message:"Preparing Agent Lee's voice reference..."});
        const response=await fetch(DEFAULT_REFERENCE);if(!response.ok)throw new Error('Default voice reference could not be downloaded.');
        const blob=await response.blob();if(lifecycle!==this.lifecycle)throw aborted();
        await this.setReference(blob);if(lifecycle!==this.lifecycle)throw aborted();this.ready=true;
        onProgress({status:'ready',device:this.device});return result;
      })();
      try{return await this.loading;}finally{this.loading=null;}
    }
    // Use an owned/licensed reference. Audio is decoded locally; it is not uploaded.
    async setReference(blob){
      const lifecycle=this.lifecycle;this.stop();
      if(!blob||blob.size>15_000_000)throw new Error('Choose a voice clip smaller than 15 MB.');
      const context=await this.audioContext(),decoded=await context.decodeAudioData(await blob.arrayBuffer());
      if(decoded.duration>30||decoded.duration<1)throw new Error('Choose a clear voice reference between 1 and 30 seconds.');
      const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*24000),24000),source=offline.createBufferSource();
      source.buffer=decoded;source.connect(offline.destination);source.start();const mono=await offline.startRendering();
      if(lifecycle!==this.lifecycle)throw aborted();
      const data=mono.getChannelData(0).slice();await this.request('speaker',{audio:data.buffer},null,[data.buffer]);
    }
    async speak(text,{signal,onState=()=>{}}={}){
      if(!this.ready)throw new Error('Load the browser voice first.');
      if(signal?.aborted)throw aborted();
      this.stop();const epoch=this.epoch;
      const stop=()=>{if(this.epoch===epoch)this.stop();};signal?.addEventListener('abort',stop,{once:true});
      try{
        const parts=chunks(text);if(parts.length>60)throw new Error('This reply is too long for one spoken turn.');
        for(let i=0;i<parts.length;i++){
          if(epoch!==this.epoch||signal?.aborted)throw aborted();
          onState(`Preparing browser voice (${i+1}/${parts.length})...`);
          const result=await this.request('generate',{text:parts[i],exaggeration:this.exaggeration},progress=>{if(epoch===this.epoch&&progress.message)onState(progress.message)});
          if(epoch!==this.epoch||signal?.aborted)throw aborted();
          onState('Speaking. The microphone can interrupt.');
          await this.play(result,epoch);
        }
        if(epoch!==this.epoch)throw aborted();onState('Ready.');
      }finally{signal?.removeEventListener('abort',stop);}
    }
    async play({audio,sampleRate},epoch){
      const context=await this.audioContext();if(epoch!==this.epoch)throw aborted();
      const samples=new Float32Array(audio),buffer=context.createBuffer(1,samples.length,sampleRate);buffer.copyToChannel(samples,0);
      return new Promise((resolve,reject)=>{
        const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);this.sources.add(source);
        let finished=false;
        const finish=()=>{if(finished)return;finished=true;source.onended=null;this.sources.delete(source);this.finishPlayback.delete(finish);source.disconnect();epoch===this.epoch?resolve():reject(aborted());};
        this.finishPlayback.add(finish);source.onended=finish;source.start();
      });
    }
    stop(){
      ++this.epoch;this.worker?.postMessage({type:'stop',epoch:this.epoch});
      for(const source of this.sources){try{source.stop()}catch{}}
      for(const finish of [...this.finishPlayback])finish();this.sources.clear();
      for(const [id,request] of this.pending)if(request.type==='generate'){
        clearTimeout(request.timer);request.reject(aborted());this.pending.delete(id);
      }
    }
    async dispose(){
      ++this.lifecycle;this.stop();this.ready=false;
      // Terminating the worker also releases outstanding inference/model resources.
      this.worker?.terminate();this.worker=null;
      for(const request of this.pending.values()){clearTimeout(request.timer);request.reject(aborted());}this.pending.clear();
      if(this.audio){await this.audio.close().catch(()=>{});this.audio=null;}
    }
  }
  root.LeeWayBrowserVoice=LeeWayBrowserVoice;
})(globalThis);
