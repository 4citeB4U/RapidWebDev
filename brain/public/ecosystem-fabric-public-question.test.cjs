const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('ecosystem fabric binds the bounded Runtime Fabric public question route',()=>{
  const source=fs.readFileSync(path.join(__dirname,'ecosystem-fabric.js'),'utf8');
  assert.match(source,/publicQuestion:'https:\/\/leeway-runtime-fabric\.fly\.dev\/agent-lee\/public-question'/);
  assert.match(source,/async function publicQuestion\(question/);
  assert.match(source,/publicQuestion,render/);
  const implementation=source.match(/async function publicQuestion\([\s\S]*?\n  }\r?\n  root\.LeeWayEcosystemFabric/);
  assert.ok(implementation);
  assert.doesNotMatch(implementation[0],/SOURCES\.runtime\.chat/);
});
