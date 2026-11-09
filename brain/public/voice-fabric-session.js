/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_VOICE
TAG: LEEWAY.RAPIDWEBDEV.CANONICAL_VOICE_CLIENT_V1
5WH:
WHAT = Thin browser client for canonical LeeWay Voice Fabric speech, preparation and interruption.
WHY = Speak Agent Lee's documented story without creating a second TTS engine or silently substituting a speaker.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/voice-fabric-session.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Import the existing Voice Fabric SDK, resolve its active Agent Lee profile, prepare once per session, and fail closed on interrupted or unqualified speech.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
(function(root){
  'use strict';
  const sdkUrl='https://4citeb4u.github.io/LeeWay-Voice-Fabric/src/voice-sdk.js';
  const profileUrl='https://raw.githubusercontent.com/4citeB4U/LeeWay-Voice-Fabric/main/profiles/agent-lee-active-voice.v1.json';
  let client=null,loading=null,ready=null,epoch=0,lastVoicePackage=null;
  async function getClient(){
    if(client)return client;
    if(!loading)loading=import(sdkUrl).then(mod=>{
      if(typeof mod.createLeeWayVoice!=='function')throw new Error('Voice Fabric SDK unavailable.');
      client=mod.createLeeWayVoice();return client;
    }).catch(error=>{loading=null;throw error;});
    return loading;
  }
  async function activeVoicePackage(){
    const response=await fetch(profileUrl,{cache:'no-store'});
    if(!response.ok)throw new Error('Canonical Agent Lee voice profile unavailable.');
    const profile=await response.json();
    if(profile?.authority!=='4citeB4U/LeeWay-Voice-Fabric'||!/^[-a-z0-9_]{3,80}$/i.test(profile.voicePackageId||'')){
      throw new Error('Canonical Agent Lee voice selection invalid.');
    }
    return profile.voicePackageId;
  }
  function prime(){
    if(ready)return ready;
    ready=(async()=>{
      const voice=await getClient();
      const voicePackageId=await activeVoicePackage();
      await voice.selectVoice(voicePackageId);
      const preparation=await voice.prepare();
      // Current published profile is authoritative. No unannounced speaker swap.
      if(preparation?.selectedVoiceId!==voicePackageId){
        throw new Error('Voice Fabric changed the Agent Lee speaker; owner qualification required.');
      }
      lastVoicePackage=voicePackageId;
      return {voice,voicePackageId,preparation};
    })().catch(error=>{ready=null;lastVoicePackage=null;throw error;});
    return ready;
  }
  function speechChunks(text){
    const sentences=String(text).trim().match(/[^.!?]+[.!?]+(?:\s+|$)|.+$/g)||[];
    const chunks=[];let buffer='';let words=0;
    for(const sentence of sentences){
      const value=sentence.trim();if(!value)continue;
      buffer=buffer?buffer+' '+value:value;words+=value.split(/\s+/).length;
      if(words>=12){chunks.push(buffer);buffer='';words=0;}
    }
    if(buffer)chunks.push(buffer);
    return chunks.length?chunks:[String(text).trim()];
  }
  async function speak(text){
    if(!String(text||'').trim())return {state:'EMPTY'};
    const turn=++epoch;
    try{
      const session=await prime();
      if(turn!==epoch)return {state:'SUPERSEDED'};
      // One mouth: end previous playout before a new answer begins.
      await session.voice.stop();
      if(turn!==epoch)return {state:'SUPERSEDED'};
      // Stream through the canonical Voice Fabric bridge so its existing speech
      // queue can begin playout before the entire answer has finished waiting.
      // The same stream is cancellable by Voice Fabric stop(), which is the
      // interruption boundary used by the local microphone VAD.
      const streamId=await session.voice.streamStart();
      if(turn!==epoch){await session.voice.stop();return {state:'SUPERSEDED'};}
      for(const chunk of speechChunks(text)){
        await session.voice.streamChunk(streamId,chunk);
        if(turn!==epoch){await session.voice.stop();return {state:'SUPERSEDED'};}
      }
      const result=await session.voice.streamEnd(streamId);
      if(turn!==epoch)return {state:'SUPERSEDED'};
      if(result?.selectedVoiceId!==session.voicePackageId||result?.completed!==true){
        throw new Error('Voice Fabric did not confirm completion with its selected speaker.');
      }
      return {state:'VOICE_FABRIC_RESPONSE',voicePackageId:session.voicePackageId,provider:'LEEWAY_VOICE_FABRIC',result};
    }catch(error){
      if(turn!==epoch)return {state:'SUPERSEDED'};
      throw error;
    }
  }
  async function stop(){
    ++epoch;
    if(!client)return {state:'NO_SESSION'};
    try{await client.stop();return {state:'STOP_REQUESTED'};}
    catch(error){return {state:'STOP_FAILED',error:String(error?.message||error)};}
  }
  function status(){return {ready:!!ready,voicePackageId:lastVoicePackage,authority:'LEEWAY_VOICE_FABRIC',acousticVerified:false};}
  root.LeeWayPortfolioVoiceSession=Object.freeze({prime,speak,stop,status,source:sdkUrl});
})(globalThis);
