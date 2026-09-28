const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 class Audio{constructor(src){this.src=src;Audio.instances.push(this)}play(){return Promise.resolve()}pause(){this.paused=true}removeAttribute(){this.src=''}load(){}}Audio.instances=[];
 const scope={Audio,DOMException};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/welcome-player.js','utf8'),scope);return {player:new scope.LeeWayWelcomePlayer(),Audio};
}
test('prepared introduction plays without model loading and preserves pitch',async()=>{
 const {player,Audio}=setup(),task=player.play();const audio=Audio.instances[0];assert.match(audio.src,/agent-lee-welcome\.mp3/);assert.equal(audio.playbackRate,1.1);assert.equal(audio.preservesPitch,true);audio.onended();await task;assert.equal(player.media,null);
});
test('an interruption silences and releases the introduction immediately',async()=>{
 const {player,Audio}=setup(),control=new AbortController(),task=player.play(control.signal);const rejection=assert.rejects(task,{name:'AbortError'});control.abort();await rejection;assert.equal(Audio.instances[0].paused,true);assert.equal(Audio.instances[0].src,'');
});
