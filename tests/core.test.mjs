import test from 'node:test';import assert from 'node:assert/strict';import {roundedDistance,svgFromPNG} from '../src/geometry.js';import {createBridge} from '../scripts/bridge.mjs';
test('rounded rectangle has correct inside, edge and rounded corner distances',()=>{assert.ok(roundedDistance(50,50,100,100,20)<0);assert.equal(roundedDistance(50,0,100,100,20),0);assert.ok(roundedDistance(0,0,100,100,20)>0);assert.equal(roundedDistance(0,0,100,100,0),0);assert.ok(Number.isFinite(roundedDistance(0,0,100,80,1000)));});
test('SVG is self-contained and rejects untrusted URLs / invalid dimensions',()=>{const svg=svgFromPNG('data:image/png;base64,YQ==',100,80);assert.ok(svg.includes('viewBox="0 0 100 80"'));assert.ok(!svg.includes('<filter'));assert.throws(()=>svgFromPNG('https://example.com/x',100,80));assert.throws(()=>svgFromPNG('data:image/png;base64,YQ==',NaN,80));});
test('bridge authenticates, checks origins, delivers once and waits for Figma acknowledgement',async()=>{const {server}=createBridge({token:'test-secret'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const headers={Authorization:'Bearer test-secret','Content-Type':'application/json'};try{
assert.equal((await fetch(base+'/status')).status,401);
assert.equal((await fetch(base+'/status',{headers:{...headers,Origin:'https://evil.example'}})).status,403);
assert.equal((await fetch(base+'/status',{headers:{...headers,Origin:'https://fishxin.github.io'}})).status,200);
assert.equal((await fetch(base+'/jobs',{method:'POST',headers,body:'{}'})).status,409);
await fetch(base+'/plugin/poll',{headers});
assert.equal((await fetch(base+'/jobs',{method:'POST',headers,body:JSON.stringify({png:'http://evil',width:1,height:1})})).status,400);
const posted=await fetch(base+'/jobs',{method:'POST',headers,body:JSON.stringify({png:'data:image/png;base64,YQ==',width:100,height:80})});assert.equal(posted.status,201);const {id}=await posted.json();
const poll=await(await fetch(base+'/plugin/poll',{headers})).json();assert.equal(poll.job.id,id);
const state=await(await fetch(base+'/jobs/'+id,{headers})).json();assert.equal(state.status,'delivered');
assert.equal((await(await fetch(base+'/plugin/poll',{headers})).json()).job,null);
await fetch(base+'/plugin/ack',{method:'POST',headers,body:JSON.stringify({id,ok:true})});assert.equal((await(await fetch(base+'/jobs/'+id,{headers})).json()).status,'done');
}finally{await new Promise(r=>server.close(r));}});
