/* Full-screen LeeWay opening gate. The Digital Brain continues loading behind it. */
(function(){
 const gate=document.querySelector('#leewayIntroGate'),copy=window.LeeWayIntroCopy;
 if(!gate||!copy)return;
 const q=s=>gate.querySelector(s),begin=q('#introBegin'),enter=q('#introEnter'),skip=q('#introSkip');
 const runtime=q('#introRuntime'),transcript=q('#introTranscriptText'),stack=q('#introStack'),evidence=q('#introEvidence');
 q('#introTitle').textContent=copy.title;q('#introEyebrow').textContent=copy.eyebrow;q('#introPermission').textContent=copy.permission;transcript.textContent=copy.text;
 copy.evidence.forEach(label=>{const span=document.createElement('span');span.textContent=label;evidence.appendChild(span)});
 copy.stack.forEach(([name,why])=>{const item=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');b.textContent=name;s.textContent=why;item.append(b,s);stack.appendChild(item)});
 q('#introService').textContent=copy.service;
 const email=q('#introEmail');email.href='mailto:'+copy.contact.email+'?subject='+encodeURIComponent('Rapid Web Develop / LeeWay inquiry');email.textContent=copy.contact.email;
 const github=q('#introGithub');github.href=copy.contact.githubUrl;
 q('#introSeriesTitle').textContent=copy.series.title;q('#introSeriesState').textContent=copy.series.state;
 copy.series.days.forEach(day=>{const li=document.createElement('li');li.textContent=day;q('#introSeriesDays').appendChild(li)});
 q('#introPocketTitle').textContent=copy.pocket.title;q('#introPocketState').textContent=copy.pocket.state;q('#introPocketMessage').textContent=copy.pocket.message;
 let started=false,completed=false;
 const brainReady=()=>!document.querySelector('#projectCount')?.textContent.includes('—')&&!!document.querySelector('#brain3DCanvas canvas');
 const refresh=()=>{const mic=document.querySelector('#micBtn')?.dataset.mode||'muted';runtime.textContent='Brain '+(brainReady()?'ready':'loading')+' · Microphone '+(mic==='listening'?'allowed / listening':mic==='preparing'?'permission requested':mic==='setup'?'unavailable or denied':'not requested')+' · Full AI optional';if(brainReady()&&(completed||!started))enter.disabled=false};
 const timer=setInterval(refresh,500);refresh();
 addEventListener('leeway-intro-complete',()=>{completed=true;enter.disabled=!brainReady();q('#introAgentStatus').textContent='Introduction complete · Digital Brain ready when loading finishes.';refresh()});
 begin.addEventListener('click',()=>{if(started)return;started=true;begin.disabled=true;q('#introAgentStatus').textContent='Agent Lee is introducing the LeeWay public working estate.';const mic=document.querySelector('#micBtn');if(mic)mic.click();else{q('#introAgentStatus').textContent='Voice controls are still loading. You can read the introduction below.';enter.disabled=!brainReady();}refresh()});
 const close=()=>{clearInterval(timer);gate.classList.add('intro-gate-hidden');gate.setAttribute('aria-hidden','true')};
 enter.addEventListener('click',close);
 skip.addEventListener('click',()=>{document.querySelector('#agentStop')?.click();completed=true;close()});
 addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
