/* Shared LeeWay turn-interruption authority. Acoustic speech belongs to Voice Fabric. */
(function(root){
  'use strict';
  class LeeWayVoiceController {
    constructor(options={}){
      this.options=options;this.epoch=0;this.controller=new AbortController();
      this.listening=false;this.speaking=false;this.history=[];
    }
    state(message){this.options.onState?.(message);}
    current(epoch){return epoch===this.epoch&&!this.controller.signal.aborted;}
    begin(){this.stop();return {epoch:this.epoch,signal:this.controller.signal};}
    stop(){
      ++this.epoch;this.controller.abort();this.controller=new AbortController();
      this.speaking=false;this.options.onCancel?.();
      this.state(this.listening?'Stopped. Listening...':'Stopped.');
    }
    remember(role,text){this.history.push({role,content:String(text).slice(0,6000)});this.history=this.history.slice(-12);}
    startListening(){
      this.state('LeeWay Voice Fabric owns speech input. Use the governed microphone control.');
      return false;
    }
    endListening(){this.listening=false;this.options.onListening?.(false);}
    dispose(){this.endListening();this.stop();}
  }
  root.LeeWayVoiceController=LeeWayVoiceController;
})(globalThis);
