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
  let client=null,loading=null,ready=null,epoch=0,lastVoicePackage=null,voiceCatalog=null,selectedVoicePackageId=null;
  async function getClient(){
    if(client)return client;
    if(!loading)loading=import(sdkUrl).then(mod=>{
      if(typeof mod.createLeeWayVoice!=='function')throw new Error('Voice Fabric SDK unavailable.');
      client=mod.createLeeWayVoice();return client;
    }).catch(error=>{loading=null;throw error;});
    return loading;
  }
  async function canonicalVoicePackage(){
    const response=await fetch(profileUrl,{cache:'no-store'});
    if(!response.ok)throw new Error('Canonical Agent Lee voice profile unavailable.');
    const profile=await response.json();
    if(profile?.authority!=='4citeB4U/LeeWay-Voice-Fabric'||!/^[-a-z0-9_]{3,80}$/i.test(profile.voicePackageId||'')){
      throw new Error('Canonical Agent Lee voice selection invalid.');
    }
    return profile.voicePackageId;
  }
  async function listVoices(){
    const voice=await getClient();
    const result=await voice.listVoices();
    voiceCatalog=(result?.voices||[]).filter(pkg=>pkg?.provider!=='android-tts');
    if(!selectedVoicePackageId)selectedVoicePackageId=await canonicalVoicePackage();
    return voiceCatalog.slice();
  }
  async function selectedVoicePackage(){
    const voices=voiceCatalog||await listVoices();
    const id=selectedVoicePackageId||await canonicalVoicePackage();
    const pkg=voices.find(value=>value?.id===id);
    if(!pkg)throw new Error('Selected LeeWay Voice Fabric package is not in the verified catalog.');
    return pkg;
  }
  async function selectVoice(voicePackageId){
    const id=String(voicePackageId||'').trim();
    const voices=voiceCatalog||await listVoices();
    const pkg=voices.find(value=>value?.id===id);
    if(!pkg)throw new Error('Choose a voice from the LeeWay Voice Fabric catalog.');
    ++epoch;
    if(client)await client.stop().catch(()=>{});
    ready=null;lastVoicePackage=null;
    const result=await (await getClient()).selectVoice(pkg.id);
    if(result?.selectedVoiceId!==pkg.id)throw new Error('Voice Fabric did not confirm the selected speaker.');
    selectedVoicePackageId=pkg.id;
    return pkg;
  }
  function prime(){
    if(ready)return ready;
    const startedAt=performance.now();
    root.LeeWayVoiceMetrics?.record?.('voice-fabric-prepare-start');
    ready=(async()=>{
       const voice=await getClient();
       const pkg=await selectedVoicePackage(),voicePackageId=pkg.id;
      await voice.selectVoice(voicePackageId);
       const preparation=await voice.prepare({provider:pkg.provider,allowFallback:false});
      // Current published profile is authoritative. No unannounced speaker swap.
       if(preparation?.selectedVoiceId!==voicePackageId||['device-speech','android-tts'].includes(preparation?.provider)){
        throw new Error('Voice Fabric changed the Agent Lee speaker; owner qualification required.');
      }
      lastVoicePackage=voicePackageId;
      root.LeeWayVoiceMetrics?.record?.('voice-fabric-prepare-ready',{durationMs:performance.now()-startedAt,voicePackageId});
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
      // Keep the first mouthful short so Voice Fabric can begin playout while
      // the remaining clauses are still being admitted into its stream.
      if(words>=8){chunks.push(buffer);buffer='';words=0;}
    }
    if(buffer)chunks.push(buffer);
    return chunks.length?chunks:[String(text).trim()];
  }
  async function speak(text){
    if(!String(text||'').trim())return {state:'EMPTY'};
    const turn=++epoch;
    const startedAt=performance.now();
    root.LeeWayVoiceMetrics?.record?.('voice-fabric-response-start',{characters:String(text).length});
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
      root.LeeWayVoiceMetrics?.record?.('voice-fabric-stream-start',{durationMs:performance.now()-startedAt});
      if(turn!==epoch){await session.voice.stop();return {state:'SUPERSEDED'};}
      let chunkNumber=0;
      for(const chunk of speechChunks(text)){
        await session.voice.streamChunk(streamId,chunk);
        root.LeeWayVoiceMetrics?.record?.('voice-fabric-stream-chunk',{chunkNumber:++chunkNumber,characters:chunk.length,durationMs:performance.now()-startedAt});
        if(turn!==epoch){await session.voice.stop();return {state:'SUPERSEDED'};}
      }
      const result=await session.voice.streamEnd(streamId);
      root.LeeWayVoiceMetrics?.record?.('voice-fabric-stream-end',{durationMs:performance.now()-startedAt,chunkCount:chunkNumber});
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
  function status(){return {ready:!!ready,voicePackageId:lastVoicePackage||selectedVoicePackageId,authority:'LEEWAY_VOICE_FABRIC',voiceSelectionAuthority:'LEEWAY_VOICE_FABRIC_CATALOG',acousticVerified:false};}
  root.LeeWayPortfolioVoiceSession=Object.freeze({prime,speak,stop,status,listVoices,selectVoice,source:sdkUrl});
})(globalThis);
