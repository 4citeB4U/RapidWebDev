const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/public-brain.js','utf8');
const toggle=source.slice(source.indexOf('async function toggleMic()'),source.indexOf('async function startTour()'));
test('first activation waits for the microphone path and does not inject a duplicate welcome',async()=>{
 let resolveMic,welcome=0,opened=0;
 const conversationSession={requested:false,toggle(){this.requested=!this.requested;return this.requested?new Promise(r=>resolveMic=r):Promise.resolve()}};
 const scope={conversationSession,openAgentBubble(){opened++},voiceController:{epoch:1,controller:{signal:{}}},playWelcome(){welcome++;return Promise.resolve()}};
 vm.createContext(scope);vm.runInContext(toggle,scope);
 const pending=scope.toggleMic();assert.equal(welcome,0);assert.equal(opened,1);
 await scope.toggleMic();assert.equal(welcome,0);assert.equal(conversationSession.requested,false);
 resolveMic();await pending;
});
