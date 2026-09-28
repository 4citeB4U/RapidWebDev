import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceBroker} from './voice-broker.mjs';
async function serve(options,run){const server=createVoiceBroker(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await run('http://127.0.0.1:'+server.address().port)}finally{await new Promise(r=>server.close(r))}}
test('missing Google key fails visibly and does not call upstream',()=>serve({key:'',upstream:()=>{throw Error('must not call')}},async url=>{
  const health=await fetch(url+'/health').then(r=>r.json());assert.equal(health.configured,false);
  assert.equal((await fetch(url+'/gemini/live/token',{method:'POST',body:'{}'})).status,503);
}));
test('unapproved origin cannot create tokens or voices',()=>serve({key:'test-only',upstream:()=>{throw Error('must not call')}},async url=>{
  const r=await fetch(url+'/gemini/voice/design',{method:'POST',headers:{Origin:'https://untrusted.example'},body:'{}'});assert.equal(r.status,403);
}));
test('TTS keeps transcript verbatim, style separate, and returns WAV without double wrapping',async()=>{
  const wav=Buffer.alloc(44);wav.write('RIFF');wav.write('WAVE',8);
  await serve({key:'test-only',designedVoice:'voice_test',upstream:async(url,options)=>{
    assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/interactions');const body=JSON.parse(options.body);
    assert.equal(body.input[0].content[0].text,'Hello.');assert.equal(body.generation_config.speech_config[0].voice,'voice_test');
    assert.ok(body.input[0].content[0].annotations[0].style);
    return {ok:true,json:async()=>({steps:[{type:'model_output',content:[{type:'audio',data:wav.toString('base64')}]}]})};
  }},async url=>{const response=await fetch(url+'/gemini/tts',{method:'POST',body:JSON.stringify({text:'Hello.'})});assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),wav)});
});
test('native voice token response excludes the server key and constrains model',()=>serve({key:'test-server-key',upstream:async(url,options)=>{
  assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/auth_tokens');const body=JSON.parse(options.body);assert.equal(body.uses,1);assert.equal(body.liveConnectConstraints.model,'models/gemini-3.8-live');
  return {ok:true,json:async()=>({name:'auth_tokens/test-ephemeral'})};
}},async url=>{const r=await fetch(url+'/gemini/live/token',{method:'POST',body:'{}'});const text=await r.text();assert.equal(text.includes('test-server-key'),false);assert.equal(JSON.parse(text).token,'auth_tokens/test-ephemeral')}));
