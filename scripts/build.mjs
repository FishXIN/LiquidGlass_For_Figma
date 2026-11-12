import {mkdir,rm,cp,writeFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const file of ['index.html','favicon.svg','src'])await cp(file,'dist/'+file,{recursive:true});
await writeFile('dist/.nojekyll','');
execFileSync('zip',['-q','-r','dist/figma-plugin.zip','figma-plugin','scripts/bridge.mjs','scripts/validate-svg.mjs','package.json','CONNECT_FIGMA.md','LICENSE','Start-Bridge.command','Start-Bridge.cmd']);
console.log('Built static site → dist/');
