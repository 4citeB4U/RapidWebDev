/* Shared interrupt authority for browser STT, TTS, and LLM requests. */
(function(root){
  'use strict';
  class LeeWayVoiceController {
    constructor(options={}){
      this.options=options;this.epoch=0;this.controller=new AbortController();
      this.listening=false;this.audio=null;this.audioURL=null;this.speaking=false;
      this.history=[];this.restartTimer=null;this.pending='';this.endpointTimer=null;
    }
    state(message){this.options.onState?.(message);}
    current(epoch){return epoch===this.epoch&&!this.controller.signal.aborted;}
    begin(){this.stop();return {epoch:this.epoch,signal:this.controller.signal};}
    stop(){
      ++this.epoch;this.controller.abort();this.controller=new AbortController();
      clearTimeout(this.endpointTimer);this.pending='';
      if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load?.();this.audio=null;}
      if(this.audioURL){URL.revokeObjectURL(this.audioURL);this.audioURL=null;}
      root.speechSynthesis?.cancel();this.speaking=false;
      this.options.onCancel?.();
      this.state(this.listening?'Stopped. Listening...':'Stopped.');
    }
    remember(role,text){this.history.push({role,content:String(text).slice(0,6000)});this.history=this.history.slice(-12);}
    async speak(text,config={},epoch=this.epoch){
      if(!text||!this.current(epoch))return;
      const endpoint=config.tts_fallback?.secure_backend_endpoint||config.secure_backend_endpoint;
      if(endpoint){
        try{
          const url=new URL(endpoint,root.location?.href);
          if(url.protocol!=='https:'&&url.hostname!=='127.0.0.1'&&url.hostname!=='localhost')throw new Error('Voice endpoint must use HTTPS.');
          this.state('Preparing natural voice...');
          const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},signal:this.controller.signal,body:JSON.stringify({text,voice:config.tts_fallback?.voice_name||'Iapetus'})});
          if(!response.ok)throw new Error('Voice service unavailable.');
          const blob=await response.blob();if(!this.current(epoch))return;
          if(!blob.type.startsWith('audio/'))throw new Error('Voice service did not return audio.');
          this.audioURL=URL.createObjectURL(blob);const audio=this.audio=new Audio(this.audioURL);this.speaking=true;
          audio.onended=()=>{if(!this.current(epoch))return;URL.revokeObjectURL(this.audioURL);this.audioURL=null;this.audio=null;this.speaking=false;this.state(this.listening?'Listening...':'Ready.');};
          await audio.play();if(this.current(epoch))this.state('Speaking. Say stop or use Stop.');return;
        }catch(error){if(!this.current(epoch)||error.name==='AbortError')return;}
      }
      if(config.browser_fallback?.enabled!==true){this.state('Natural voice is not connected. Read the response below.');return;}
      if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){this.state('Voice output unavailable. Read the response below.');return;}
      const utterance=new SpeechSynthesisUtterance(text),voices=root.speechSynthesis.getVoices();
      utterance.voice=voices.find(v=>/^en/i.test(v.lang)&&/natural|neural|online/i.test(v.name))||voices.find(v=>/^en/i.test(v.lang))||null;
      utterance.lang='en-US';utterance.rate=1;utterance.pitch=1;
      utterance.onstart=()=>{if(!this.current(epoch)){root.speechSynthesis.cancel();return;}this.speaking=true;this.state('Browser voice fallback. Say stop or use Stop.');};
      utterance.onend=utterance.onerror=()=>{if(this.current(epoch)){this.speaking=false;this.state(this.listening?'Listening (browser voice fallback).':'Ready (browser voice fallback).');}};
      root.speechSynthesis.speak(utterance);
    }
    startListening(){
      if(this.listening)return true;
      const Recognition=root.SpeechRecognition||root.webkitSpeechRecognition;
      if(!Recognition){this.state('Browser speech input unavailable. Type a message instead.');return false;}
      this.listening=true;const recognition=this.recognition=new Recognition();
      recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=true;
      recognition.onstart=()=>{this.options.onListening?.(true);this.state('Listening through browser speech input. Natural voice is not connected.');};
      recognition.onresult=event=>{
        let final='',interim='';for(let i=event.resultIndex;i<event.results.length;i++){
          if(event.results[i].isFinal)final+=' '+event.results[i][0].transcript;else interim+=' '+event.results[i][0].transcript;
        }
        const heard=(final||interim).trim();if(!heard)return;
        // First transcript suppresses sound and invalidates all pending LLM/TTS work.
        if(!this.userSpeaking){this.stop();this.userSpeaking=true;}
        this.options.onTranscript?.((this.pending+' '+heard).trim());
        clearTimeout(this.endpointTimer);
        if(final){this.pending+=' '+final.trim();this.endpointTimer=setTimeout(()=>{
          const text=this.pending.trim();this.pending='';this.userSpeaking=false;
          if(text)this.options.onCommand?.(text);
        },650);}
      };
      recognition.onerror=event=>{
        if(['not-allowed','service-not-allowed','audio-capture'].includes(event.error)){this.endListening();this.state('Microphone unavailable. Check browser permission or type a message.');}
        else this.state('Speech input interrupted. Waiting to reconnect...');
      };
      recognition.onend=()=>{if(this.listening)this.restartTimer=setTimeout(()=>{if(this.listening)try{recognition.start();}catch{this.endListening();this.state('Microphone stopped. Turn it on to reconnect.');}},350);};
      try{recognition.start();return true;}catch{this.endListening();this.state('Microphone could not start.');return false;}
    }
    endListening(){this.listening=false;this.userSpeaking=false;clearTimeout(this.restartTimer);clearTimeout(this.endpointTimer);this.pending='';if(this.recognition){this.recognition.onend=null;try{this.recognition.abort();}catch{}this.recognition=null;}this.options.onListening?.(false);}
    dispose(){this.endListening();this.stop();}
  }
  root.LeeWayVoiceController=LeeWayVoiceController;
})(globalThis);
