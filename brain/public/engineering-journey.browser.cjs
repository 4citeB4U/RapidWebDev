/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.ENGINEERING_JOURNEY_BROWSER_SMOKE
5WH:
WHAT = Exercise the actual public portfolio DOM and one-click engineering conversation in Chromium.
WHY = Verify source-integrated UI routing separately from physical microphone, acoustic and cognitive claims.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/engineering-journey.browser.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Serve PR checkout locally, stub only microphone and remote speech for structural checks, and inspect real browser DOM/flows.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e.message||e)));
 try{
  await page.goto('http://127.0.0.1:8870/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof globalThis.LeeWayIntroStory==='object'&&typeof globalThis.LeeWayEngineeringJourney==='object'&&typeof globalThis.LeeWayPortfolioVoiceSession==='object',{timeout:30000});
  await page.evaluate(()=>{
   globalThis.__voiceEvents=[];
   // Structural test only. Genuine ASR, permission, TTS provider, audio and cognition NOT executed here.
   globalThis.LeeWayBrowserListener.prototype.start=async function(){this.active=true;this.ready=true;this.options.onListening?.(true);};
   globalThis.LeeWayBrowserListener.prototype.stop=async function(){this.active=false;this.options.onListening?.(false);};
   globalThis.LeeWayPortfolioVoiceSession={
    prime:async()=>({state:'FAKE_PREPARED'}),
    speak:async text=>{globalThis.__voiceEvents.push({type:'speech.request',text});return{state:'VOICE_FABRIC_RESPONSE',result:{completed:true}};},
    stop:async()=>{globalThis.__voiceEvents.push({type:'speech.stop'});return{state:'STOP_REQUESTED'};}
   };
  });
  await page.locator('#introStoryTalk').click();
  await page.waitForFunction(()=>document.querySelector('#agentText')?.textContent?.includes('Before LeeWay had a Runtime'),{timeout:10000});
  const first=await page.evaluate(()=>({
   micMode:document.querySelector('#micBtn')?.dataset?.mode,
   sources:document.querySelectorAll('#agentEvidenceList a').length,
   story:document.querySelector('#agentText')?.textContent||'',
   speechRequests:globalThis.__voiceEvents.filter(x=>x.type==='speech.request').length,
   introHidden:document.querySelector('#introStoryGlass')?.classList.contains('story-complete')||false
  }));
  assert.equal(first.micMode,'listening');
  assert.equal(first.introHidden,true);
  assert.ok(first.sources>0);
  assert.ok(first.speechRequests>0);
  await page.locator('#typeMessage summary').click();
  await page.locator('#agentInput').fill('continue');
  await page.locator('#agentSend').click();
  await page.waitForFunction(()=>document.querySelector('#agentText')?.textContent?.includes('The work did not arrive fully formed'),{timeout:10000});
  const second=await page.evaluate(()=>({mode:document.querySelector('#micBtn').dataset.mode,speechRequests:globalThis.__voiceEvents.filter(x=>x.type==='speech.request').length}));
  assert.equal(second.mode,'listening');
  assert.ok(second.speechRequests>=2);
  await page.locator('#agentEndVoice').click();
  await page.waitForFunction(()=>document.querySelector('#micBtn')?.dataset?.mode==='muted');
  const result={
    class:'STRUCTURAL_CHROMIUM_ONLY',publicMachineConsciousness:'NOT_EXECUTED',physicalMicrophone:'MOCKED',
    audioPlayback:'MOCKED',humanHearing:'NOT_EXECUTED',scenario:'one-click entry, story answer, citations, follow-up without second mic click, mute',
    initial:{mode:first.micMode,sources:first.sources,speechRequests:first.speechRequests},
    continued:second,muted:true,
    pageErrors:errors
  };
  fs.writeFileSync('engineering-journey-browser-structural.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
