const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('a failed runtime load destroys the partial worker so retry uses a fresh runtime',async()=>{
 class Worker{constructor(){Worker.instances.push(this)}postMessage(message){this.message=message}terminate(){this.terminated=true}}Worker.instances=[];
 const scope={Worker,URL,DOMException,isSecureContext:true,navigator:{gpu:{requestAdapter:async()=>({})}}};vm.createContext(scope);
 const source=fs.readFileSync(__dirname+'/gemma-browser.js','utf8').replace('export const LeeWayBrowserGemma','const LeeWayBrowserGemma').replace('import.meta.url',JSON.stringify('https://example.test/gemma-browser.js'));vm.runInContext(source,scope);
 const api=scope.LeeWayBrowserGemma,first=api.load();await new Promise(resolve=>setImmediate(resolve));
 const one=Worker.instances[0];one.onmessage({data:{id:one.message.id,type:'error',message:'network error',ready:false}});
 await assert.rejects(first,/network error/);assert.equal(one.terminated,true);assert.equal(api.state,'idle');
 const second=api.load();await new Promise(resolve=>setImmediate(resolve));const two=Worker.instances[1];assert.notEqual(one,two);two.onmessage({data:{id:two.message.id,type:'done',value:{name:'Gemma'}}});await second;assert.equal(api.state,'ready');api.unload();
});
