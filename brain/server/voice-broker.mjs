// Optional local Google voice broker. Node 20+, no packages. Never serves API keys.
// Keep this loopback-only; internet deployment requires application authentication.
import http from 'node:http';
import {pathToFileURL} from 'node:url';
export function createVoiceBroker({key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY,
  origins=(process.env.LEEWAY_VOICE_ORIGINS||'http://127.0.0.1:8080,http://localhost:8080,http://127.0.0.1:8765,https://4citeb4u.github.io,https://rapidwebdevelop.com,https://www.rapidwebdevelop.com').split(','),
  upstream=fetch, designedVoice=process.env.LEEWAY_GOOGLE_VOICE_ID||null}={}) {
  const permitted=new Set(origins),requests=new Map();
  return http.createServer(async(req,res)=>{
    const origin=req.headers.origin;
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    if(origin&&!permitted.has(origin))return json(403,{error:'Origin is not allowed.'});
    if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
    if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Private-Network','true');res.writeHead(204);return res.end();}
    if(req.url==='/health'&&req.method==='GET')return json(200,{ok:true,configured:Boolean(key),provider:'google-gemini',liveModel:'gemini-3.8-live',ttsModel:'gemini-3.8-flash-tts'});
    if(req.method!=='POST'||!['/gemini/live/token','/gemini/tts','/gemini/voice/design'].includes(req.url))return json(404,{error:'Not found.'});
    // A web caller must supply an allowed Origin; command-line local setup remains available.
    if(!origin&&req.headers['sec-fetch-site'])return json(403,{error:'Origin required.'});
    if(!key)return json(503,{error:'Google voice is not configured on this host.'});
    const now=Date.now(),window=requests.get(origin||'local')||[];
    const recent=window.filter(t=>now-t<60000);if(recent.length>=15)return json(429,{error:'Please wait before starting more voice requests.'});
    recent.push(now);requests.set(origin||'local',recent);
    try{
      let body='';for await(const chunk of req){body+=chunk;if(body.length>16000)return json(413,{error:'Request too large.'});}
      const input=JSON.parse(body||'{}');
      const headers={'Content-Type':'application/json','x-goog-api-key':key};
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
      res.on('close',()=>{if(!res.writableEnded)controller.abort();});
      let response;
      try{
        if(req.url==='/gemini/live/token'){
          response=await upstream('https://generativelanguage.googleapis.com/v1beta/auth_tokens',{method:'POST',headers,signal:controller.signal,body:JSON.stringify({uses:1,expireTime:new Date(now+30*60000).toISOString(),newSessionExpireTime:new Date(now+60000).toISOString(),liveConnectConstraints:{model:'models/gemini-3.8-live',config:{responseModalities:['AUDIO']}}})});
          if(!response.ok)return json(502,{error:'Google did not issue a voice token.'});
          const grant=await response.json();if(!grant.name?.startsWith('auth_tokens/'))return json(502,{error:'Unexpected voice-token response.'});
          return json(200,{token:grant.name,model:'gemini-3.8-live',voice:'Charon'});
        }
        if(req.url==='/gemini/voice/design'){
          response=await upstream('https://generativelanguage.googleapis.com/v1beta/voices',{method:'POST',headers,signal:controller.signal,body:JSON.stringify({store:true,voice:{model:'gemini-3.8-flash-tts',type:'prompted',display_name:'Agent Lee Southern Conversation',gender:'male',language_code:'en-US',prompted:{input:'An original adult masculine voice, deep and resonant, with a natural Southern American accent. Lively, warm, confident, conversational and attentive. Clear regular English pronunciation with a gentle Southern cadence, never exaggerated or theatrical. No imitation of an identifiable person.'}}})});
          if(!response.ok)return json(502,{error:'Google voice design is unavailable.'});
          const created=await response.json();if(!created.id?.startsWith('voice_'))return json(502,{error:'Google did not return a designed voice.'});
          designedVoice=created.id;return json(200,{id:created.id,sample_audio:created.sample_audio||null,note:'Voice selected for this broker session. Save its ID as LEEWAY_GOOGLE_VOICE_ID to reuse it after restart. Audition required.'});
        }
        if(typeof input.text!=='string'||!input.text.trim()||input.text.length>8000)return json(400,{error:'Provide between 1 and 8000 characters of speech.'});
        response=await upstream('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers,signal:controller.signal,body:JSON.stringify({model:'gemini-3.8-flash-tts',input:[{type:'user_input',content:[{type:'text',text:input.text,annotations:[{type:'speech_metadata',style:'Lively, warm and conversational, with clear articulation and natural pauses.'}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice:designedVoice||'Charon'}]}})});
        if(!response.ok)return json(502,{error:'Google speech generation is unavailable.'});
        const result=await response.json(),audio=(result.steps||[]).filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='audio').at(-1);
        if(!audio?.data)return json(502,{error:'Google did not return speech audio.'});
        const wav=Buffer.from(audio.data,'base64');
        if(wav.toString('ascii',0,4)!=='RIFF'||wav.toString('ascii',8,12)!=='WAVE')return json(502,{error:'Google returned an unsupported audio format.'});
        res.writeHead(200,{'Content-Type':'audio/wav','Content-Length':wav.length});res.end(wav);

      }finally{clearTimeout(timeout);}
    }catch{if(!res.headersSent)json(502,{error:'Voice service could not complete the request.'});}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const port=Number(process.env.LEEWAY_VOICE_PORT||43118);
  createVoiceBroker().listen(port,'127.0.0.1',()=>console.log(`LeeWay voice broker listening on loopback port ${port}.`));
}
