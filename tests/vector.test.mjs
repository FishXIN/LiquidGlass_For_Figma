import test from 'node:test';import assert from 'node:assert/strict';
import {glassVector,vectorizeRegion} from '../src/vector.js';import {validVectorSVG} from '../scripts/validate-svg.mjs';
const params={width:360,height:250,radius:52,x:600,y:400,light:225,highlight:.85,scope:'glass',vectorDetail:'editable'};
test('uniform and linear backgrounds remain compact editable gradients',()=>{
assert.equal(vectorizeRegion(()=>[100,130,160],100,100).count,1);
const r=vectorizeRegion((x,y)=>[x*2,x*2,x*2],100,100);
assert.equal(r.count,1);assert.match(r.definitions,/<linearGradient/);
});
test('complex detail is bounded and finer option contains more shapes',()=>{
const sample=(x,y)=>[Math.sin(x*.3)*120+128,Math.cos(y*.3)*120+128,160];
const simple=glassVector(params,sample,sample),fine=glassVector({...params,vectorDetail:'detailed'},sample,sample);
assert.ok(simple.vectorNodes<=275);assert.ok(fine.vectorNodes>simple.vectorNodes);assert.ok(fine.vectorNodes<=1043);
});
test('export contains only vectors, separate named layers and correct dimensions',()=>{
const o=glassVector(params,(x,y)=>[x/2,y/2,150],()=>[20,40,60]);
assert.equal(o.width,416);assert.equal(o.height,306);assert.ok(validVectorSVG(o.svg));
assert.doesNotMatch(o.svg,/<image|base64|data:image|<filter|foreignObject|<script|NaN|Infinity/);
for(const id of ['Soft-shadow','Glass-colors','Edge-highlight'])assert.ok(o.svg.includes(`id="${id}"`));
const scene=glassVector({...params,scope:'scene'},()=>[50,60,70],()=>[10,20,30]);assert.equal(scene.width,1200);assert.ok(scene.svg.includes('Background-colors'));
});
test('bridge rejects raster, remote and executable payloads',()=>{
for(const svg of ['<svg ><image/></svg>','<svg ><script/></svg>','<svg ><rect fill="url(https://evil)"/></svg>','<svg ><rect onload="x"/></svg>','<svg ><foreignObject/></svg>'])assert.equal(validVectorSVG(svg),false);
});
