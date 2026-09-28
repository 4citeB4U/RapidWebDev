const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/preparation-policy.js','utf8'),scope);
const {assess}=scope.LeeWayPreparationPolicy;
test('low browser quota blocks optional model download, retaining guide guidance',()=>{const result=assess({quota:1e9,usage:9e8,bytes:2e9});assert.equal(result.ok,false);assert.match(result.message,/spoken guide/);});
test('completed cache does not require a second full-model storage allocation',()=>{assert.equal(assess({quota:3e9,usage:2.9e9,bytes:2e9,cached:2e9}).ok,true);});
test('unknown quota is not advertised as sufficient space',()=>{assert.equal(assess({bytes:2e9}).ok,false);});
test('storage estimate includes download headroom',()=>{assert.equal(assess({quota:2.1e9,usage:0,bytes:2e9}).ok,false);assert.equal(assess({quota:2.4e9,usage:0,bytes:2e9}).ok,true);});
test('Gemma does not start a network fetch when browser storage is inadequate',async()=>{
 const code=fs.readFileSync(__dirname+'/gemma-browser-worker.js','utf8');let fetched=0;
 const runtime={navigator:{storage:{getDirectory:async()=>({getFileHandle:async()=>({getFile:async()=>({size:0})})}),estimate:async()=>({quota:100,usage:0})}},fetch:async()=>{fetched++},postMessage(){}};
 vm.createContext(runtime);vm.runInContext(code,runtime);await assert.rejects(vm.runInContext('modelSource(1)',runtime),/Not enough browser storage/);assert.equal(fetched,0);
});
