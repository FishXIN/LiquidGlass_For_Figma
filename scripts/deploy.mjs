import {execFileSync} from 'node:child_process';
import {mkdtemp,cp,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';
const run=(args,cwd=process.cwd())=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','inherit']}).trim();
execFileSync(process.execPath,['--test','tests/core.test.mjs','tests/plugin.test.mjs','tests/vector.test.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
const remote=run(['remote','get-url','origin']),target=await mkdtemp(join(tmpdir(),'liquidglass-pages-'));
try{
  const exists=run(['ls-remote','--heads',remote,'gh-pages']);
  if(exists){run(['clone','--depth=1','--single-branch','--branch','gh-pages',remote,target]);run(['rm','-rf','--ignore-unmatch','.'],target);}
  else {run(['init','-b','gh-pages'],target);run(['remote','add','origin',remote],target);}
  for(const key of ['user.name','user.email']){const value=run(['config','--get',key]);run(['config',key,value],target);}
  for(const item of await readdir('dist'))await cp(join('dist',item),join(target,item),{recursive:true});
  run(['add','-A'],target);
  if(run(['status','--porcelain'],target)){run(['commit','-m','Publish LiquidGlass_For_Figma static site'],target);run(['push','origin','gh-pages'],target);}
  console.log('Published gh-pages. Enable GitHub Pages: gh-pages / (root).');
}finally{await rm(target,{recursive:true,force:true});}
