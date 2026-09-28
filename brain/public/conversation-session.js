/* Session ownership is separate from response cancellation: Stop is not Mute. */
(function(root){
 class LeeWayConversationSession{
  constructor(options){this.options=options;this.requested=false;this.connecting=false;this.epoch=0;this.state='muted';}
  setState(state){this.state=state;this.options.onState?.(state);}
  toggle(){if(this.requested){this.mute();return Promise.resolve();}this.options.silence();this.requested=true;return this.connect();}
  async connect(){
   if(!this.requested||this.connecting)return;
   const epoch=++this.epoch;this.connecting=true;this.setState('preparing');
   try{
    if(!await this.options.prepare()){if(epoch===this.epoch&&this.requested)this.setState('setup');return;}
    if(epoch!==this.epoch||!this.requested)return;
    await this.options.start();
    if(epoch===this.epoch&&this.requested)this.setState('listening');
   }catch(error){if(epoch===this.epoch){this.mute();this.options.onError?.(error);}}
   finally{if(epoch===this.epoch)this.connecting=false;}
  }
  stopSpeaking(){this.options.silence();this.options.onStopped?.(this.state==='listening');}
  mute(){++this.epoch;this.requested=false;this.connecting=false;this.options.silence();void this.options.stop();this.setState('muted');}
 }
 root.LeeWayConversationSession=LeeWayConversationSession;
})(globalThis);
