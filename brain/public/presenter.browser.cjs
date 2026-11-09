/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.PRESENTER_SCREEN_CONTEXT_BROWSER_SMOKE
5WH:
WHAT = Exercise the real Digital Brain DOM, showroom conversation, governed navigation and current-screen explanation.
WHY = Prove the new presenter seam in a browser rather than treating unit output as live UI evidence.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/presenter.browser.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-09.
HOW = Use Playwright Chromium against the local static checkout; mock only microphone and Voice Fabric playout, never the Machine Consciousness answer route or screen state.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];
 page.on('pageerror',error=>errors.push(String(error.message||error)));
 try{
  const targetUrl=process.env.LEEWAY_TEST_URL||'http://127.0.0.1:8870/';
  await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof globalThis.LeeWayMachineConsciousnessPublic==='object'&&typeof globalThis.__leewayAgentScreenContext==='function',{timeout:30000});
  await page.evaluate(()=>{
   globalThis.__voiceEvents=[];
   globalThis.LeeWayBrowserListener.prototype.start=async function(){this.active=true;this.ready=true;this.options.onListening?.(true);};
   globalThis.LeeWayBrowserListener.prototype.stop=async function(){this.active=false;this.options.onListening?.(false);};
   globalThis.LeeWayPortfolioVoiceSession={
    prime:async()=>({state:'FAKE_PREPARED'}),
    speak:async text=>{globalThis.__voiceEvents.push({type:'speech.request',text});return{state:'VOICE_FABRIC_RESPONSE',result:{completed:true}};},
    stop:async()=>{globalThis.__voiceEvents.push({type:'speech.stop'});return{state:'STOP_REQUESTED'};}
   };
  });
  await page.locator('#enterBrainBtn').click();
  await page.waitForFunction(()=>!document.body.classList.contains('brain-intro'),{timeout:15000});
  await page.locator('#micBtn').click();
  await page.waitForFunction(()=>document.querySelector('#micBtn')?.dataset?.mode==='listening',{timeout:15000});
  await page.locator('#typeMessage summary').click();
  await page.locator('#agentInput').fill('Welcome me and show me around');
  await page.locator('#agentSend').click();
  await page.waitForFunction(()=>/Welcome in|walk you through/i.test(document.querySelector('#agentText')?.textContent||''),{timeout:10000});
  const welcome=await page.evaluate(()=>({text:document.querySelector('#agentText')?.textContent||'',context:globalThis.__leewayAgentScreenContext(),speechRequests:globalThis.__voiceEvents.filter(x=>x.type==='speech.request').length}));
  assert.match(welcome.text,/Welcome in|walk you through/i);
  assert.equal(welcome.context.page,'LeeWay Digital Brain');
  assert.ok(welcome.speechRequests>0);

  await page.locator('#agentInput').fill('show CORE LEEWAY');
  await page.locator('#agentSend').click();
  await page.waitForFunction(()=>globalThis.__leewayAgentScreenContext()?.categoryLabel==='CORE LEEWAY',{timeout:10000});
  const category=await page.evaluate(()=>globalThis.__leewayAgentScreenContext());
  assert.equal(category.categoryLabel,'CORE LEEWAY');
  assert.ok(category.visibleRecordCount>0);

  await page.locator('#agentBubbleClose').click();
  const project=page.locator('#nodes .node.project').first();
  await project.waitFor({state:'visible',timeout:10000});
  const projectLabel=await project.locator('b').textContent();
  await project.click();
  await page.waitForFunction(()=>Boolean(globalThis.__leewayAgentScreenContext()?.selectedRecord),{timeout:10000});
  const selected=await page.evaluate(()=>globalThis.__leewayAgentScreenContext());
  assert.equal(selected.selectedRecord.label,projectLabel.trim());

  await page.locator('#micBtn').click();
  await page.waitForFunction(()=>document.querySelector('#agentBubble')&&!document.querySelector('#agentBubble').classList.contains('hidden'),{timeout:10000});
  await page.locator('#typeMessage').evaluate(el=>{el.open=true;});
  await page.locator('#agentInput').fill('What am I looking at?');
  await page.locator('#agentSend').click();
  await page.waitForFunction(label=>(document.querySelector('#agentText')?.textContent||'').includes(label),projectLabel.trim(),{timeout:10000});
  const explained=await page.evaluate(()=>({text:document.querySelector('#agentText')?.textContent||'',context:globalThis.__leewayAgentScreenContext()}));
  assert.match(explained.text,new RegExp(projectLabel.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.equal(explained.context.selectedRecord.label,projectLabel.trim());
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({
   class:targetUrl.startsWith('http://127.0.0.1')?'LOCAL_CHROMIUM_UI_EVIDENCE':'DEPLOYED_CHROMIUM_UI_EVIDENCE',
   targetUrl,
   machineConsciousness:'DETERMINISTIC_PUBLIC_PROJECTION_EXECUTED',
   microphone:'MOCKED',
   voicePlayback:'MOCKED',
   navigation:'EXECUTED_INTERNAL_CATEGORY_AND_PROJECT_SELECTION',
   screenContext:'EXECUTED_SELECTED_RECORD_READBACK',
   welcome,wcategory:category.categoryLabel,selected:explained.context.selectedRecord.label,
   explanation:explained.text,speechRequests:welcome.speechRequests+1,
   pageErrors:errors
  },null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
