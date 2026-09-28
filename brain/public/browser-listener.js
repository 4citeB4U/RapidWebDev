/* Browser-only microphone capture, immediate speech interruption, local Whisper. */
(() => {
  class LeeWayBrowserListener {
    constructor(options={}){this.options=options;this.epoch=0;this.sequence=0;this.pending=new Map();this.active=false;this.ready=false;}
    async load(){
      if(this.ready)return;
      if(this.loading)return this.loading;
      this.worker ||= new Worker('/brain/public/listener.worker.js?v=20260928-browser4',{type:'module'});
      this.worker.onmessage=({data})=>{
        if(data.type==='progress'){this.options.onProgress?.(data.progress);return;}
        const task=this.pending.get(data.id);if(!task)return;
        this.pending.delete(data.id);clearTimeout(task.timer);
        if(data.type==='error')task.reject(new Error(data.error));else task.resolve(data);
      };
      this.worker.onerror=()=>{for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(new Error('Local speech worker could not load.'));}this.pending.clear();this.ready=false;this.worker?.terminate();this.worker=null;};
      this.loading=this.request({type:'load'}).then(()=>{this.ready=true}).finally(()=>{this.loading=null});
      return this.loading;
    }
    request(message,transfer=[]){return new Promise((resolve,reject)=>{const id=++this.sequence;const timer=setTimeout(()=>{this.worker?.terminate();this.worker=null;this.ready=false;for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(new Error('Speech recognition took too long. Reload the voice models.'));}this.pending.clear();},message.type==='load'?300000:120000);this.pending.set(id,{resolve,reject,timer});try{this.worker.postMessage({...message,id},transfer)}catch(error){clearTimeout(timer);this.pending.delete(id);reject(error)}});}
    async start(){
      if(this.active)return;
      const epoch=++this.epoch;
      // Request microphone permission from the original click, independently of model downloads.
      if(epoch!==this.epoch)return;
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
      if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;
      const settings=stream.getAudioTracks()[0]?.getSettings?.()||{};
      this.options.onMetric?.('microphone-start',{sampleRate:settings.sampleRate,echoCancellation:settings.echoCancellation,noiseSuppression:settings.noiseSuppression});
      try{
        const audio=new AudioContext({sampleRate:16000});this.audio=audio;await audio.resume();
        if(epoch!==this.epoch)return;
        await audio.audioWorklet.addModule('/brain/public/voice-capture-worklet.js');
        if(epoch!==this.epoch)return;
        this.input=this.audio.createMediaStreamSource(stream);
        this.capture=new AudioWorkletNode(this.audio,'leeway-capture');
        this.resetUtterance();this.noise=.002;this.active=true;
        this.capture.port.onmessage=event=>{if(this.active&&epoch===this.epoch)this.consume(new Int16Array(event.data));};
        this.input.connect(this.capture);this.capture.connect(this.audio.destination);
        this.options.onListening?.(true);this.options.onState?.(this.ready?'Listening on this device. You can interrupt me.':'Microphone is on. Preparing local speech recognition...');
        // Never block microphone capture on Chatterbox, Gemma, or recognition loading.
        void this.load().then(()=>{if(this.active&&epoch===this.epoch)this.options.onState?.('Listening on this device. You can interrupt me.');}).catch(async error=>{if(epoch===this.epoch){await this.stop();this.options.onState?.('Speech recognition failed: '+error.message);}});
        stream.getAudioTracks().forEach(track=>track.onended=()=>void this.stop());
      }catch(error){if(epoch===this.epoch){await this.stop();throw error;}}
    }
    resetUtterance(){this.preRoll=[];this.frames=[];this.voiced=0;this.silence=0;this.inSpeech=false;}
    consume(frame){
      let energy=0;const samples=new Float32Array(frame.length);
      for(let i=0;i<frame.length;i++){samples[i]=frame[i]/32768;energy+=samples[i]*samples[i];}
      const rms=Math.sqrt(energy/frame.length),speech=rms>Math.max(.012,this.noise*3.5);
      if(!this.inSpeech){
        this.preRoll.push(samples);if(this.preRoll.length>15)this.preRoll.shift();
        this.voiced=speech?this.voiced+1:0;
        if(!speech)this.noise=this.noise*.98+rms*.02;
        if(this.voiced>=6){
          this.inSpeech=true;this.frames=this.preRoll.slice();this.preRoll=[];this.utterance=(this.utterance||0)+1;
          this.options.onSpeech?.();this.options.onState?.('Listening...');
        }
        return;
      }
      this.frames.push(samples);this.silence=speech?0:this.silence+1;
      if(this.silence>=35||this.frames.length>=750){
        const frames=this.frames,epoch=this.epoch,utterance=this.utterance;this.options.onMetric?.('speech-endpoint',{audioMs:frames.length*20,silenceMs:this.silence*20});this.resetUtterance();
        if(frames.length<15)return;
        const audio=new Float32Array(frames.length*320);frames.forEach((f,i)=>audio.set(f,i*320));
        // At most one queued newer utterance: avoid an unbounded audio backlog.
        this.waitingClip={audio,epoch,utterance};void this.transcribeNext();
      }
    }
    async transcribeNext(){
      if(this.transcribing||!this.waitingClip)return;
      this.transcribing=true;const {audio,epoch,utterance}=this.waitingClip;this.waitingClip=null;
      this.options.onState?.('Understanding your speech on this device...');
      try{
        await this.load();if(!this.active||epoch!==this.epoch||utterance!==this.utterance)return;
        const start=performance.now();this.options.onMetric?.('transcription-start');
        const result=await this.request({type:'transcribe',audio:audio.buffer},[audio.buffer]);
        this.options.onMetric?.('transcription-complete',{durationMs:performance.now()-start});
        if(this.active&&epoch===this.epoch&&utterance===this.utterance&&result.text.trim())this.options.onTranscript?.(result.text.trim());
      }catch(error){if(epoch===this.epoch){this.options.onState?.(error.message);await this.stop();}}
      finally{this.transcribing=false;if(this.active&&this.waitingClip)void this.transcribeNext();}
    }
    cancelUtterance(){this.utterance=(this.utterance||0)+1;this.waitingClip=null;this.resetUtterance();}
    async stop(){
      ++this.epoch;this.active=false;this.waitingClip=null;this.options.onMetric?.('microphone-stop');
      this.input?.disconnect();this.capture?.disconnect();this.input=null;this.capture=null;
      this.stream?.getTracks().forEach(track=>{track.onended=null;track.stop()});this.stream=null;
      const audio=this.audio;this.audio=null;
      this.resetUtterance();this.options.onListening?.(false);
      if(audio)await audio.close().catch(()=>{});
    }
    async dispose(){await this.stop();this.worker?.terminate();this.worker=null;this.ready=false;for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(new DOMException('Closed','AbortError'));}this.pending.clear();}
  }
  window.LeeWayBrowserListener=LeeWayBrowserListener;
})();
