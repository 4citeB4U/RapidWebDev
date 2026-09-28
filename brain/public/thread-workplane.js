/* LeeWay governed thread/workplane + one-mouth speech lease pilot. */
(function(root){
 'use strict';
 const now=()=>Date.now();
 const safe=s=>String(s||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,48);
 class LeeWayThreadWorkplane{
  constructor({maxHands=8,onState=()=>{}}={}){
   this.maxHands=Math.max(1,Math.min(8,Number(maxHands)||8));this.onState=onState;
   this.sequence=0;this.threadSequence=0;this.workSequence=0;this.queue=[];this.activeResources=new Set();
   this.hands=Array.from({length:this.maxHands},(_,i)=>({id:'HAND-'+String(i+1).padStart(2,'0'),status:'AVAILABLE',workId:null,threadId:null,resource:null}));
   this.threads=new Map();this.mainThread=this._createThread('main',null,'Main task');this.selectedThreadId=this.mainThread.id;
  }
  _id(prefix,n){return 'LW-'+prefix+'-'+String(n).padStart(4,'0')}
  _createThread(kind,parentThreadId,label){
   const defaultLabel=(kind==='main'?'Main task ':'Side chat ')+this.threadSequence;
   const thread={id:this._id('THREAD',++this.threadSequence),kind,parentThreadId:parentThreadId||null,label:label||defaultLabel,status:'IDLE',history:[],createdAt:now(),updatedAt:now(),lastWorkId:null,lastOutput:'',activeWork:0};
   this.threads.set(thread.id,thread);this._emit('THREAD_CREATED',thread);return thread;
  }
  createSideThread({parentThreadId=this.mainThread.id,label}={}){const n=[...this.threads.values()].filter(t=>t.kind==='side').length+1;return this._createThread('side',parentThreadId,label||('Side chat '+n))}
  getThread(id){return this.threads.get(id)||null}
  listThreads(){return [...this.threads.values()].map(t=>({...t,history:[...t.history]}))}
  selectThread(id){if(!this.threads.has(id))throw new Error('Unknown thread');this.selectedThreadId=id;this._emit('THREAD_SELECTED',this.threads.get(id));return this.threads.get(id)}
  remember(threadId,role,text){
   const thread=this.getThread(threadId);if(!thread)throw new Error('Unknown thread');
   const content=String(text||'').slice(0,12000);if(!content.trim())return;
   thread.history.push({role,content,at:now()});thread.history=thread.history.slice(-24);thread.updatedAt=now();this._emit('THREAD_MEMORY',thread);
  }
  submit(threadId,objective,runner,{resource='gemma',priority}={}){
   const thread=this.getThread(threadId);if(!thread)throw new Error('Unknown thread');
   const controller=new AbortController(),work={
    id:this._id('WORK',++this.workSequence),threadId,objective:String(objective||''),runner,resource:safe(resource)||'default',
    priority:Number.isFinite(priority)?priority:(thread.kind==='side'?80:50),sequence:++this.sequence,controller,signal:controller.signal,
    status:'QUEUED',handId:null,createdAt:now(),startedAt:null,completedAt:null
   };
   thread.status='QUEUED';thread.lastWorkId=work.id;thread.updatedAt=now();this.queue.push(work);this._sortQueue();this._emit('WORK_QUEUED',work);
   const promise=new Promise((resolve,reject)=>{work.resolve=resolve;work.reject=reject});
   this._pump();return {work,promise};
  }
  cancelWork(workId){
   const queuedIndex=this.queue.findIndex(w=>w.id===workId);
   if(queuedIndex>=0){const [work]=this.queue.splice(queuedIndex,1);work.status='CANCELLED';work.controller.abort();work.reject?.(new DOMException('Cancelled','AbortError'));this._syncThread(work.threadId);this._emit('WORK_CANCELLED',work);return true;}
   const hand=this.hands.find(h=>h.workId===workId);if(!hand)return false;const work=hand._work;work.status='CANCEL_REQUESTED';work.controller.abort();this._emit('WORK_CANCEL_REQUESTED',work);return true;
  }
  _sortQueue(){this.queue.sort((a,b)=>b.priority-a.priority||a.sequence-b.sequence)}
  _freeHand(){return this.hands.find(h=>h.status==='AVAILABLE')||null}
  _pump(){
   let progress=true;
   while(progress){
    progress=false;const hand=this._freeHand();if(!hand)return;
    const index=this.queue.findIndex(w=>!this.activeResources.has(w.resource));if(index<0)return;
    const [work]=this.queue.splice(index,1);this._start(work,hand);progress=true;
   }
  }
  _start(work,hand){
   const thread=this.getThread(work.threadId);this.activeResources.add(work.resource);
   hand.status='RUNNING';hand.workId=work.id;hand.threadId=work.threadId;hand.resource=work.resource;hand._work=work;work.handId=hand.id;work.status='RUNNING';work.startedAt=now();
   thread.status='RUNNING';thread.activeWork++;thread.updatedAt=now();this._emit('WORK_RUNNING',work);
   Promise.resolve().then(()=>work.runner(work,thread)).then(result=>{
    work.status='COMPLETED';work.completedAt=now();thread.lastOutput=typeof result==='string'?result:thread.lastOutput;work.resolve?.(result);this._emit('WORK_COMPLETED',work);
   },error=>{
    work.status=error?.name==='AbortError'?'CANCELLED':'FAILED';work.completedAt=now();work.reject?.(error);this._emit(work.status==='FAILED'?'WORK_FAILED':'WORK_CANCELLED',work);
   }).finally(()=>{
    thread.activeWork=Math.max(0,thread.activeWork-1);this.activeResources.delete(work.resource);
    hand.status='AVAILABLE';hand.workId=hand.threadId=hand.resource=null;hand._work=null;this._syncThread(thread.id);this._pump();
   });
  }
  _syncThread(threadId){
   const thread=this.getThread(threadId);if(!thread)return;
   const queued=this.queue.some(w=>w.threadId===threadId),running=this.hands.some(h=>h.threadId===threadId&&h.status==='RUNNING');
   thread.status=running?'RUNNING':queued?'QUEUED':thread.lastWorkId?'COMPLETED':'IDLE';thread.updatedAt=now();this._emit('THREAD_STATE',thread);
  }
  snapshot(){
   return {maxHands:this.maxHands,selectedThreadId:this.selectedThreadId,threads:this.listThreads(),hands:this.hands.map(h=>({id:h.id,status:h.status,workId:h.workId,threadId:h.threadId,resource:h.resource})),queue:this.queue.map(w=>({id:w.id,threadId:w.threadId,resource:w.resource,priority:w.priority,status:w.status}))};
  }
  _emit(type,value){try{this.onState({type,value,snapshot:()=>this.snapshot()})}catch{}}
 }
 function navigationPhrase(from,to){
  if(!to)return '';
  if(!from)return to.kind==='main'?'Main task update.':'On the side chat—here is what I found.';
  if(from.id===to.id)return '';
  if(to.kind==='main')return to.status==='COMPLETED'?'The main task completed while we were on the side chat. Here is the result.':'Back on the main task—here is what changed.';
  return from.kind==='main'?'The side chat has new information.':'Switching to the other side chat.';
 }
 function oneTextStream(text){
  let done=false;return {[Symbol.asyncIterator](){return this},async next(){if(done)return {done:true};done=true;return {value:text,done:false}},fail(){done=true},dispose(){}};
 }
 class LeeWaySpeechLeaseArbiter{
  constructor(voice,{onNavigation=()=>{},onState=()=>{}}={}){this.voice=voice;this.onNavigation=onNavigation;this.onState=onState;this.active=null;this.waiters=new Set();}
  _activate(record){this.active=record||null;for(const wake of [...this.waiters])wake();this.waiters.clear();}
  async waitFor(threadId,signal){
   while(this.active&&this.active.thread.id!==threadId){
    if(signal?.aborted)throw new DOMException('Speech was stopped.','AbortError');
    await new Promise((resolve,reject)=>{
     const wake=()=>{signal?.removeEventListener('abort',abort);resolve()};const abort=()=>{this.waiters.delete(wake);reject(new DOMException('Speech was stopped.','AbortError'))};
     this.waiters.add(wake);signal?.addEventListener('abort',abort,{once:true});
    });
   }
  }
  async _sayNavigation(text,signal){
   if(!text||!this.voice?.ready)return;this.onNavigation(text);this.onState(text);
   await this.voice.speakInsertedStream(oneTextStream(text),{signal,onState:this.onState});
  }
  pauseCurrent(){const handles=this.voice?.pausePlayback?.()||[];this.onState(handles.length?'Speech paused. Work continues.':'Speech held. Work continues.');return handles}
  async resumeCurrent(){await this.voice?.resumePlayback?.();this.onState('Speech resumed.')}
  cancelSpeech(){this.voice?.stop?.();this._activate(null);this.onState('Speech stopped. Work state is preserved.')}
  async speak(thread,stream,{signal,onState=()=>{},onRendered=()=>{}}={}){
   if(!thread||!stream)return;
   const previous=this.active;
   if(previous?.thread.id===thread.id){await previous.done.catch(()=>{});return this.speak(thread,stream,{signal,onState,onRendered});}
   if(!previous){
    let resolveDone,rejectDone;const done=new Promise((r,j)=>{resolveDone=r;rejectDone=j});done.catch(()=>{});
    const record={thread,done,resolveDone,rejectDone};this._activate(record);
    try{
     await this._sayNavigation(navigationPhrase(null,thread),signal);
     await this.voice.speakStream(stream,{signal,onState,beforePlay:()=>this.waitFor(thread.id,signal),onRendered});
     resolveDone();
    }catch(error){rejectDone(error);throw error}
    finally{if(this.active===record)this._activate(null)}
    return;
   }
   const paused=this.voice.pausePlayback?.()||[];
   let resolveDone,rejectDone;const done=new Promise((r,j)=>{resolveDone=r;rejectDone=j});done.catch(()=>{});
   const record={thread,done,resolveDone,rejectDone};this._activate(record);
   try{
    await this._sayNavigation(navigationPhrase(previous.thread,thread),signal);
    await this.voice.speakInsertedStream(stream,{signal,onState,beforePlay:()=>this.waitFor(thread.id,signal),onRendered});
    resolveDone();
   }catch(error){rejectDone(error);throw error}
   finally{
    if(this.active===record){
     try{await this._sayNavigation(navigationPhrase(thread,previous.thread),signal)}catch{}
     this._activate(previous);try{await this.voice.resumePlayback?.(paused)}catch{}
    }
   }
  }
 }
 root.LeeWayThreadWorkplane=LeeWayThreadWorkplane;
 root.LeeWaySpeechLeaseArbiter=LeeWaySpeechLeaseArbiter;
 root.LeeWayThreadNavigationPhrase=navigationPhrase;
})(globalThis);
