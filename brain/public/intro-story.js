/* LeeWay Digital Brain opening: glass story plate -> Voice One prepared narration -> brain reveal. */
(function(root){
  'use strict';
  const glass=document.querySelector('#introStoryGlass');
  if(!glass)return;
  const scroll=document.querySelector('#introStoryScroll');
  const begin=document.querySelector('#introStoryBegin');
  const skip=document.querySelector('#introStorySkip');
  const status=document.querySelector('#introStoryStatus');
  const audio=new Audio('/brain/public/voices/agent-lee-welcome.mp3?v=20260928-guide1');
  audio.preload='auto';audio.playbackRate=1.1;audio.preservesPitch=true;
  let started=false,finished=false,timer=null;
  const finish=()=>{
    if(finished)return;finished=true;clearTimeout(timer);
    glass.classList.add('story-complete');
    document.body.classList.remove('story-intro');
    root.dispatchEvent(new CustomEvent('leeway-story-intro-complete'));
    setTimeout(()=>glass.remove(),1100);
  };
  const start=async()=>{
    if(started)return;started=true;
    begin.disabled=true;begin.textContent='Agent Lee is reading…';
    status.textContent='Voice One · prepared narration · no model download';
    glass.classList.add('story-running');
    requestAnimationFrame(()=>scroll.classList.add('scrolling'));
    try{
      await audio.play();
      audio.onended=finish;
      timer=setTimeout(finish,26000);
    }catch(error){
      status.textContent='Narration was blocked by browser autoplay. Story continues visually.';
      timer=setTimeout(finish,21000);
    }
  };
  begin.addEventListener('click',start);
  skip.addEventListener('click',()=>{audio.pause();finish();});
  audio.addEventListener('error',()=>{status.textContent='Prepared narration unavailable. Story continues visually.';timer=setTimeout(finish,21000);});
  root.LeeWayIntroStory={start,finish};
})(globalThis);
