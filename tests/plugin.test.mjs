import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const code=await readFile(new URL('../figma-plugin/code.js',import.meta.url),'utf8');
test('Figma adapter creates an SVG frame, not an image fill',async()=>{
const messages=[];let node,imported;
const figma={showUI(){},ui:{postMessage:m=>messages.push(m)},createNodeFromSvg(svg){imported=svg;return node={width:416,height:306,children:[{type:'VECTOR'}],setPluginData(){},remove(){}};},viewport:{center:{x:600,y:400},scrollAndZoomIntoView(){}},currentPage:{},notify(){}};
vm.runInNewContext(code,{figma,__html__:''});
const svg='<svg xmlns="http://www.w3.org/2000/svg"><rect width="416" height="306"/></svg>';
await figma.ui.onmessage({type:'import',id:'one',payload:{svg,width:416,height:306}});
assert.equal(imported,svg);assert.equal(node.x,392);assert.equal(figma.currentPage.selection[0],node);assert.equal(messages[0].ok,true);
});
test('Figma adapter rejects embedded images',async()=>{
const messages=[];const figma={showUI(){},ui:{postMessage:m=>messages.push(m)},createNodeFromSvg(){throw new Error('Should not be called');}};
vm.runInNewContext(code,{figma,__html__:''});await figma.ui.onmessage({type:'import',id:'bad',payload:{svg:'<svg ><image/></svg>',width:100,height:100}});
assert.equal(messages[0].ok,false);assert.match(messages[0].error,/vector SVG/);
});
