import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const code=await readFile(new URL('../figma-plugin/code.js',import.meta.url),'utf8');
test('Figma plugin imports image at logical dimensions and confirms only after creating layer',async()=>{
const messages=[];let node;const figma={showUI(){},ui:{postMessage:m=>messages.push(m)},createImage(bytes){assert.equal(bytes.length,3);return{hash:'image-hash'};},createRectangle(){return node={resize(w,h){this.width=w;this.height=h;},setPluginData(){},remove(){this.removed=true;}};},viewport:{center:{x:600,y:400},scrollAndZoomIntoView(){}},currentPage:{},notify(){}};
vm.runInNewContext(code,{figma,__html__:'',Uint8Array});await figma.ui.onmessage({type:'import',id:'one',payload:{bytes:[1,2,3],width:416,height:306,name:'Glass'}});
assert.equal(node.width,416);assert.equal(node.height,306);assert.equal(node.x,392);assert.equal(node.fills[0].imageHash,'image-hash');assert.equal(figma.currentPage.selection[0],node);assert.equal(messages[0].ok,true);
});
test('Figma plugin reports image decoding errors instead of success',async()=>{const messages=[];const figma={showUI(){},ui:{postMessage:m=>messages.push(m)},createImage(){throw new Error('Cannot decode PNG');}};vm.runInNewContext(code,{figma,__html__:'',Uint8Array});await figma.ui.onmessage({type:'import',id:'bad',payload:{bytes:[0],width:100,height:100}});assert.equal(messages[0].ok,false);assert.match(messages[0].error,/decode/);});
