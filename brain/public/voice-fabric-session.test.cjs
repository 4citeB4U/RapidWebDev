const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync(__dirname+'/voice-fabric-session.js','utf8');

test('public speech session exposes LeeWay Voice Fabric voice inventory and selection',()=>{
  assert.match(source,/voice\.listVoices\(\)/);
  assert.match(source,/selectVoice\(pkg\.id\)/);
  assert.match(source,/voiceSelectionAuthority:'LEEWAY_VOICE_FABRIC_CATALOG'/);
  assert.match(source,/allowFallback:false/);
});

test('public speech session rejects device speech and browser speech synthesis',()=>{
  assert.match(source,/\['device-speech','android-tts'\]/);
  assert.doesNotMatch(source,/speechSynthesis|SpeechRecognition|webkitSpeechRecognition/);
});
