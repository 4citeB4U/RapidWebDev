(function(root){
 root.LeeWayStopIntent=text=>{
  const q=String(text).toLowerCase().replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();
  return /^(?:(?:hey|okay|please|agent lee) )*(?:stop|quiet|pause|interrupt)(?: (?:talking|speaking|please|now|for a minute))*$/.test(q)||/^(?:hey ){1,}hey$/.test(q)||/^(?:hold (?:up|on)|wait)(?: (?:please|a second|a minute|wait))*$/.test(q);
 };
 if(typeof document==='undefined')return;
 const list=document.querySelector('#chatHistoryList'),count=document.querySelector('#chatCount');
 root.recordChat=(role,text)=>{
  if(!String(text).trim())return;
  const item=document.createElement('li'),label=document.createElement('strong'),body=document.createElement('p');
  label.textContent=role;body.textContent=String(text).slice(0,12000);item.append(label,body);list.append(item);
  while(list.children.length>100)list.firstElementChild.remove();count.textContent=String(list.children.length);
 };
 document.querySelector('#clearChatHistory').onclick=()=>{list.replaceChildren();count.textContent='0';};
 function transient(id,balloon,delay){
  const node=document.querySelector(id),box=document.querySelector(balloon);let timer;
  const hide=()=>{if(id==='#agentText'&&/speaking|introducing/i.test(document.querySelector('#agentState').textContent)){timer=setTimeout(hide,1500);return;}box.classList.add('bubble-resting');};
  new MutationObserver(()=>{clearTimeout(timer);box.classList.remove('hidden','bubble-resting');timer=setTimeout(hide,delay);}).observe(node,{childList:true,subtree:true,characterData:true});
 }
 transient('#agentText','.lee-balloon',12000);transient('#agentTranscript','#userBalloon',7000);
})(globalThis);
