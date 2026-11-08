/* Prepared Voice One introduction: no inference or model download required. */
(function(root){
 class LeeWayWelcomePlayer {
  constructor(){this.epoch=0;this.media=null;this.finish=null;this.pace=1.1;}
  stop(){++this.epoch;this.finish?.();}
  setPace(value){this.pace=value;if(this.media)this.media.playbackRate=value;}
  play(signal){
   this.stop();if(signal?.aborted)return Promise.reject(new DOMException('Stopped','AbortError'));
   const epoch=this.epoch,media=this.media=new root.Audio('/brain/public/voices/agent-lee-welcome.mp3?v=20260928-guide1');media.playbackRate=this.pace;media.preservesPitch=true;
   return new Promise((resolve,reject)=>{
    let finished=false;const stop=()=>this.stop();
    const finish=error=>{if(finished)return;finished=true;signal?.removeEventListener('abort',stop);media.onended=null;media.onerror=null;media.onplaying=null;media.pause();media.removeAttribute('src');media.load();if(this.media===media)this.media=null;if(this.finish===finish)this.finish=null;if(epoch!==this.epoch)reject(new DOMException('Stopped','AbortError'));else if(error)reject(error);else{if(typeof root.CustomEvent==='function'&&root.dispatchEvent)root.dispatchEvent(new root.CustomEvent('leeway-intro-complete'));resolve();}};
    this.finish=finish;signal?.addEventListener('abort',stop,{once:true});media.onended=()=>finish();media.onerror=()=>finish(new Error('The introduction could not load. Please try again.'));media.onplaying=()=>{root.LeeWayVoiceMetrics?.record('introduction-playback-start');if(typeof root.CustomEvent==='function'&&root.dispatchEvent)root.dispatchEvent(new root.CustomEvent('leeway-intro-start'));};media.play().catch(finish);
   });
  }
 }
 root.LeeWayWelcomePlayer=LeeWayWelcomePlayer;
})(globalThis);
