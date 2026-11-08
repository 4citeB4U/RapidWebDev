/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_STORY
TAG: LEEWAY.RAPIDWEBDEV.INTRO_STORY
5WH:
WHAT = Preserve the prepared opening while offering an explicit, interactive microphone conversation entry.
WHY = Visitors should start a hands-free engineering journey without repeatedly touching microphone controls.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/intro-story.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08 scoped extension; previous intro intact.
HOW = Dispatch one bounded event only after a real Talk with Agent Lee click.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
(function(root){
  'use strict';
  const glass=document.querySelector('#introStoryGlass');
  if(!glass)return;
  const scroll=document.querySelector('#introStoryScroll');
  const begin=document.querySelector('#introStoryBegin');
  const talk=document.querySelector('#introStoryTalk');
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
  // User gesture starts the existing microphone session; this page never auto-opens a microphone.
  talk?.addEventListener('click',()=>{
    audio.pause();finish();
    root.dispatchEvent(new CustomEvent('leeway-start-engineering-conversation'));
  });
  skip.addEventListener('click',()=>{audio.pause();finish();});
  audio.addEventListener('error',()=>{status.textContent='Prepared narration unavailable. Story continues visually.';timer=setTimeout(finish,21000);});
  root.LeeWayIntroStory={start,finish};
})(globalThis);
