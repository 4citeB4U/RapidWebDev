/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.MOBILE_VOICE_RESET_BROWSER_AUDIT
5WH:
WHAT = Reproduce the Agent Lee mobile microphone reset report in Android and iPhone browser profiles.
WHY = Distinguish a real document reload/crash from a visibility, permission or conversation-session transition.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/mobile-voice.browser.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-09.
HOW = Exercise the deployed page with Playwright mobile emulation and record navigation, crash, console, request and session evidence without claiming physical handset proof.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
'use strict';
const assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 const targetUrl=process.env.LEEWAY_TEST_URL||'https://rapidwebdevelop.com/';
 const waitMs=Number(process.env.MOBILE_AUDIT_WAIT_MS||45000);
 const cases=[['android',devices['Pixel 7']],['iphone',devices['iPhone 13']]];
 const results=[];
 try{
  for(const [name,device] of cases){
   const context=await browser.newContext({...device,permissions:['microphone']});
   const page=await context.newPage();
   const events={navigation:[],pageErrors:[],console:[],failedRequests:[],crashes:[],heavyAudioRequests:[]};
   page.on('framenavigated',frame=>{if(frame===page.mainFrame())events.navigation.push(frame.url());});
   page.on('pageerror',error=>events.pageErrors.push(String(error.message||error)));
   page.on('console',message=>{if(['error','warning'].includes(message.type()))events.console.push(message.type()+': '+message.text());});
   page.on('requestfailed',request=>events.failedRequests.push(request.url()+' :: '+(request.failure()?.errorText||'unknown')));
   page.on('request',request=>{if(/listener\.worker\.js|voice-capture-worklet\.js/.test(request.url()))events.heavyAudioRequests.push(request.url());});
   page.on('crash',()=>events.crashes.push('page-crash'));
   try{
    const auditUrl=new URL('?mobile-audit=20261109-'+name,targetUrl).href;
    await page.goto(auditUrl,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>typeof globalThis.__leewayAgentScreenContext==='function'&&document.querySelector('#micBtn'),{timeout:30000});
    await page.waitForSelector('#agentVoiceSelect',{state:'attached',timeout:30000});
    assert.equal(await page.locator('#agentStartupStatus').count(),0,name+' removed fabric status chip still present');
    const before=await page.evaluate(()=>({href:location.href,visibility:document.visibilityState,ready:document.readyState,mode:document.querySelector('#micBtn')?.dataset.mode,entries:performance.getEntriesByType('navigation').length}));
    await page.locator('#micBtn').click();
    await page.waitForTimeout(waitMs);
   await page.locator('#typeMessage').evaluate(node=>{node.open=true;});
   await page.locator('#agentInput').fill('Hello Agent Lee');
   await page.locator('#agentSend').click();
   await page.waitForFunction(()=>/Good to hear you|engineering journey/i.test(document.querySelector('#agentText')?.textContent||''),{timeout:15000});
   const message=await page.evaluate(()=>({text:document.querySelector('#agentText')?.textContent||'',navigationCount:performance.getEntriesByType('navigation').length,userText:document.querySelector('#agentTranscript')?.textContent||'',sendType:document.querySelector('#agentSend')?.type||''}));
   assert.equal(message.navigationCount,1,name+' message submission reloaded the page');
   assert.match(message.text,/Good to hear you|engineering journey/i,name+' addressed greeting did not resolve');
    const after=await page.evaluate(()=>({href:location.href,visibility:document.visibilityState,ready:document.readyState,mode:document.querySelector('#micBtn')?.dataset.mode,state:document.querySelector('#agentState')?.textContent||'',bubble:!document.querySelector('#agentBubble')?.classList.contains('hidden'),voiceSelected:document.querySelector('#agentVoiceSelect')?.value||'',voiceOptions:document.querySelectorAll('#agentVoiceSelect option').length,voiceStatus:document.querySelector('#agentVoiceStatus')?.textContent||'',entries:performance.getEntriesByType('navigation').length,context:globalThis.__leewayAgentScreenContext?.()}));
    assert.notEqual(after.voiceSelected,'android-installed-english',name+' selected a device voice');
    results.push({device:name,before,message,after,events});
    assert.equal(events.crashes.length,0,name+' mobile page crashed');
   }catch(error){
    results.push({device:name,error:String(error.message||error),events});
   }finally{await context.close();}
  }
  const compact=results.map(result=>({device:result.device,before:result.before,after:result.after,error:result.error||null,navigationCount:result.events?.navigation?.length||0,pageErrors:result.events?.pageErrors||[],failedRequests:result.events?.failedRequests||[],heavyAudioRequests:result.events?.heavyAudioRequests||[],crashes:result.events?.crashes||[],consoleWarnings:result.events?.console||[]}));
  console.log(JSON.stringify({class:'MOBILE_BROWSER_EMULATION_EVIDENCE',targetUrl,waitMs,physicalHandset:'NOT_TESTED',results:compact},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
