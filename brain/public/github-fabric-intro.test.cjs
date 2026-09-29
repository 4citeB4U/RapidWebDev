const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const index=read('index.html');
const css=read('brain/public/experience.css');
const fabric=read('brain/public/ecosystem-fabric.js');
const intro=read('brain/public/intro-story.js');
const runtime=JSON.parse(read('brain/agent-lee-runtime-config.json'));
const voice=JSON.parse(read('brain/agent-lee-voice.json'));

assert(index.includes('class="story-intro brain-intro"'));
assert(index.includes('id="introStoryGlass"'));
assert(index.includes('id="introStoryScroll"'));
assert(index.includes('id="introStoryBegin"'));
assert(index.includes('/brain/public/ecosystem-fabric.js?v=20260929-fabric1'));
assert(index.includes('/brain/public/intro-story.js?v=20260929-story1'));
assert(css.includes('.intro-story-glass'));
assert(css.includes('@keyframes introStoryRoll'));
assert(css.includes('body.story-intro #agentLee'));
assert(intro.includes("agent-lee-welcome.mp3"));
assert(intro.includes("document.body.classList.remove('story-intro')"));

for(const repo of ['LeeWay-Voice-Fabric','Leeway-Runtime-Fabric','LeeWay-Agent-Skills','Leeway-formula-live']){
  assert(fabric.includes(repo),repo+' missing from fabric projection');
}
assert(fabric.includes('https://leeway-runtime-fabric.fly.dev/v1/chat/completions'));
assert.strictEqual(runtime.reasoning.primary_provider,'leeway-runtime-fabric');
assert.strictEqual(runtime.reasoning.no_required_browser_model_download,true);
assert.strictEqual(runtime.identity_policy,'SINGLE_BRAIN_SINGLE_AGENT_IDENTITY');
assert.strictEqual(voice.voice_authority,'4citeB4U/LeeWay-Voice-Fabric');
assert.strictEqual(voice.automatic_model_download,false);
console.log('PASS github-fabric intro architecture contract');
