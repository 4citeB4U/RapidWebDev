/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_VOICE
TAG: LEEWAY.RAPIDWEBDEV.CANONICAL_VOICE_CLIENT_V1
5WH:
WHAT = Thin browser client of the existing LeeWay Voice Fabric SDK.
WHY = Attempt spoken Agent Lee stories without a second voice implementation or mandatory browser Gemma model.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/voice-fabric-session.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Import canonical Voice Fabric SDK on demand, select Voice One, speak under a current session, and invalidate stale work on interruption.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
(function(root){
  'use strict';
  const sdkUrl='https://4citeb4u.github.io/LeeWay-Voice-Fabric/src/voice-sdk.js';
  let client=null,loading=null,epoch=0;
  async function getClient(){
    if(client)return client;
    if(!loading)loading=import(sdkUrl).then(mod=>{
      if(typeof mod.createLeeWayVoice!=='function')throw new Error('Voice Fabric SDK unavailable.');
      client=mod.createLeeWayVoice();return client;
    }).catch(error=>{loading=null;throw error;});
    return loading;
  }
  async function speak(text){
    if(!String(text||'').trim())return {state:'EMPTY'};
    const turn=++epoch;
    const voice=await getClient();
    if(turn!==epoch)return {state:'SUPERSEDED'};
    await voice.selectVoice('agent-lee-voice-one');
    if(turn!==epoch)return {state:'SUPERSEDED'};
    // No silent alternate speaker. Fail visibly if canonical Voice One cannot speak.
    const result=await voice.speak(String(text),{allowFallback:false});
    if(turn!==epoch)return {state:'SUPERSEDED'};
    return {state:'VOICE_FABRIC_RESPONSE',voicePackageId:'agent-lee-voice-one',provider:'LEEWAY_VOICE_FABRIC',result};
  }
  async function stop(){
    ++epoch;
    if(!client)return {state:'NO_SESSION'};
    try{await client.stop();return {state:'STOP_REQUESTED'};}
    catch(error){return {state:'STOP_FAILED',error:String(error?.message||error)};}
  }
  root.LeeWayPortfolioVoiceSession=Object.freeze({speak,stop,source:sdkUrl});
})(globalThis);
