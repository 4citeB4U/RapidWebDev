/* Native audio Gemini Live client. Only short-lived broker tokens reach this file.
 * Protocol: https://ai.google.dev/api/live
 * No inferred acoustic claims: automatic server VAD owns voice interruption.
 */
(function (root) {
  'use strict';
  const SYSTEM = "You are Agent Lee, LeeWay's AI project guide. Speak plain English with natural conversational phrasing. Answer the actual question in two to four short sentences unless detail is requested. Do not rhyme, use poetic speeches, or recite a slogan. Use only the supplied public project evidence for LeeWay facts. Say when a fact is unknown. A listed URL is not proof a service works. Never claim a tool action happened without a tool result. Listen when the user interrupts; stop immediately when asked to stop. You are an AI assistant with a synthetic voice, not a human.";
  class LeeWayLiveVoice {
    constructor(options = {}) {
      this.options = options; this.epoch = 0; this.sources = new Set();
      this.nextPlay = 0; this.connected = false; this.mutedTurn = false;
      this.ledger = []; this.outputText = '';
    }
    state(text) { this.options.onState?.(text); }
    send(message) {
      if (this.socket?.readyState === 1) this.socket.send(JSON.stringify(message));
    }
    flush(reason = 'interrupted') {
      for (const source of this.sources) { try { source.stop(); } catch {} }
      this.sources.clear(); this.nextPlay = this.audio?.currentTime || 0;
      this.ledger.push({event: reason, at: performance.now()});
      this.ledger = this.ledger.slice(-100);
    }
    // Deterministically suppress the entire current response, including late packets.
    stop() {
      this.toolEpoch=(this.toolEpoch||0)+1;this.mutedTurn = true; this.flush('stop');
      this.options.onInterrupt?.();
      this.send({realtimeInput: {text: 'Stop speaking now. Wait silently for my next request.'}});
      this.state('Stopped. Microphone still listening.');
    }
    async connect(config, context = {}) {
      await this.close(); const epoch = ++this.epoch;
      this.state('Connecting natural voice...');
      try {
        const grant = await this.options.getToken(config);
        if (epoch !== this.epoch) return false;
        const token = grant?.token || grant?.name || grant?.access_token;
        if (typeof token !== 'string' || !token.startsWith('auth_tokens/')) throw new Error('A short-lived voice token is unavailable.');
        // Request capture only after a broker has actually provided a token.
        const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
        if (epoch !== this.epoch) { stream.getTracks().forEach(t=>t.stop()); return false; }
        this.stream = stream;
        this.audio = new AudioContext({sampleRate:16000}); await this.audio.resume();
        await this.audio.audioWorklet.addModule('/brain/public/voice-capture-worklet.js');
        if (epoch !== this.epoch) return false;
        const socket = this.socket = new WebSocket('wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token='+encodeURIComponent(token));
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new Error('Voice connection timed out.')),12000);
          const fail=()=>{clearTimeout(timer);reject(new Error('Natural voice connection failed.'));};
          socket.onopen=()=>this.send({setup:{
            model:'models/'+String(grant.model||config.model||'gemini-3.8-live').replace(/^models\//,''),
            generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:grant.voice||config.voice_name||'Puck'}}}},
            systemInstruction:{parts:[{text:SYSTEM+' Speak with a deep, lively masculine voice and a gentle Southern American accent; keep pronunciation clear and avoid caricature. Gemini is the voice interface only. For EVERY substantive question, call ask_gemma and speak its answer faithfully. Never substitute your own reasoning or invent a response if Gemma is unavailable. Navigation requests also go to ask_gemma. Brief greetings and stop acknowledgments may be handled directly.\nPublic project context: '+JSON.stringify(context)}]},
            tools:[{functionDeclarations:[{name:'ask_gemma',description:'Ask the local Gemma 4 reasoning authority or perform requested Digital Brain navigation. Required for every substantive question.',parameters:{type:'OBJECT',properties:{question:{type:'STRING'}},required:['question']}}]}],
            inputAudioTranscription:{},outputAudioTranscription:{},
            realtimeInputConfig:{automaticActivityDetection:{disabled:false},activityHandling:'START_OF_ACTIVITY_INTERRUPTS'}
          }});
          socket.onerror=fail; socket.onclose=fail;
          // Chain Blob decoding to preserve protocol ordering.
          let incoming=Promise.resolve();
          socket.onmessage=event=>{incoming=incoming.then(async()=>{
            if(epoch!==this.epoch)return;
            const message=JSON.parse(typeof event.data==='string'?event.data:await event.data.text());
            if(message.setupComplete){clearTimeout(timer);resolve();return;}
            if(message.error){fail();return;}
            this.receive(message);
          }).catch(()=>{this.state('Voice data could not be read. Reconnect the microphone.');void this.close();});};
        });
        if(epoch!==this.epoch)return false;
        this.connected=true;
        socket.onclose=()=>{if(epoch===this.epoch){void this.close();this.state('Voice disconnected. Turn the microphone on to reconnect.');}};
        socket.onerror=()=>this.state('Voice connection interrupted.');
        this.capture=this.audio.createMediaStreamSource(this.stream);
        this.processor=new AudioWorkletNode(this.audio,'leeway-capture');
        this.processor.port.onmessage=event=>{
          if(epoch!==this.epoch||!this.connected)return;
          if(socket.bufferedAmount>64000){this.state('Voice connection too slow. Reconnect to continue.');void this.close();return;}
          const bytes=new Uint8Array(event.data);let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
          this.send({realtimeInput:{audio:{data:btoa(binary),mimeType:'audio/pcm;rate=16000'}}});
        };
        this.capture.connect(this.processor);
        // The worklet outputs silence; connecting it keeps capture processing active.
        this.processor.connect(this.audio.destination);
        this.state('Natural voice connected. You can interrupt while I speak.');return true;
      } catch(error) {
        if(epoch===this.epoch){await this.close();this.state(error.message||'Natural voice unavailable.');}
        throw error;
      }
    }
    receive(message) {
      if(message.toolCallCancellation){this.toolEpoch=(this.toolEpoch||0)+1;this.options.onInterrupt?.();}
      if(message.toolCall){
        const epoch=this.epoch,toolEpoch=this.toolEpoch||0;
        for(const call of message.toolCall.functionCalls||[])Promise.resolve(this.options.onQuestion?.(call.args?.question||''))
          .then(answer=>{if(epoch===this.epoch&&toolEpoch===(this.toolEpoch||0))this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{answer:answer||'Local Gemma 4 is unavailable. I cannot provide a grounded answer right now.'}}]}});})
          .catch(()=>{if(epoch===this.epoch&&toolEpoch===(this.toolEpoch||0))this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{error:'Local reasoning is unavailable.'}}]}});});
      }
      const content=message.serverContent;if(!content)return;
      if(content.interrupted){this.toolEpoch=(this.toolEpoch||0)+1;this.flush('server-interrupted');this.mutedTurn=false;this.outputText='';this.options.onInterrupt?.();this.state('Listening...');return;}
      if(content.inputTranscription?.text){this.options.onTranscript?.(content.inputTranscription.text);}
      if(!this.mutedTurn){
        if(content.outputTranscription?.text){this.outputText+=content.outputTranscription.text;this.options.onOutput?.(this.outputText);}
        for(const part of content.modelTurn?.parts||[])if(part.inlineData?.mimeType?.startsWith('audio/pcm'))this.play(part.inlineData);
      }
      if(content.turnComplete){this.mutedTurn=false;this.outputText='';if(!this.sources.size)this.state('Listening...');}
    }
    play(data) {
      if(!this.audio||this.mutedTurn)return;
      const rate=Number(data.mimeType.match(/rate=(\d+)/)?.[1]||24000);
      const binary=atob(data.data),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      if(bytes.length%2)return;
      const view=new DataView(bytes.buffer),buffer=this.audio.createBuffer(1,bytes.length/2,rate),channel=buffer.getChannelData(0);
      for(let i=0;i<channel.length;i++)channel[i]=view.getInt16(i*2,true)/32768;
      // Bound playout backlog rather than silently building an uninterruptible queue.
      if(this.nextPlay-this.audio.currentTime>10){this.stop();this.state('Voice paused because playback fell behind.');return;}
      const source=this.audio.createBufferSource();source.buffer=buffer;source.connect(this.audio.destination);
      const start=Math.max(this.nextPlay,this.audio.currentTime);this.nextPlay=start+buffer.duration;this.sources.add(source);
      this.ledger.push({event:'audio-queued',duration:buffer.duration,start,at:performance.now()});this.ledger=this.ledger.slice(-100);
      source.onended=()=>{this.sources.delete(source);if(!this.sources.size&&this.connected)this.state('Listening...');};
      source.start(start);this.state('Speaking. Microphone is listening.');
    }
    say(text) {
      if(!this.connected)return false;
      if(this.sources.size){this.mutedTurn=true;this.flush('new-text-turn');}
      this.send({realtimeInput:{text}});return true;
    }
    async close() {
      ++this.epoch;this.connected=false;this.flush('closed');
      if(this.socket){this.socket.onclose=null;try{this.socket.close();}catch{}this.socket=null;}
      this.processor?.disconnect();this.capture?.disconnect();this.processor=null;this.capture=null;
      this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
      if(this.audio){await this.audio.close().catch(()=>{});this.audio=null;}
      this.options.onClose?.();
    }
  }
  root.LeeWayLiveVoice=LeeWayLiveVoice;
})(globalThis);
