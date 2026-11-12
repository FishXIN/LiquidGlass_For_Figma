import http from 'node:http';
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function createBridge({token=randomBytes(18).toString('hex'),origin=process.env.GLASS_SITE_ORIGIN||'https://fishxin.github.io',now=()=>Date.now()}={}) {
  const jobs=new Map();let heartbeat=0;
  const server=http.createServer(async(req,res)=>{
    const requestOrigin=req.headers.origin;
    const allowed=!requestOrigin||requestOrigin==='null'||requestOrigin===origin||/^https:\/\/([a-z0-9-]+\.)?figma\.com$/.test(requestOrigin)||/^http:\/\/(localhost|127\.0\.0\.1):5173$/.test(requestOrigin);
    if(!allowed){res.writeHead(403);res.end();return;}
    res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
    if(requestOrigin)res.setHeader('Access-Control-Allow-Origin',requestOrigin);
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Private-Network','true');
    const reply=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
    const provided=Buffer.from(req.headers.authorization||''),expected=Buffer.from('Bearer '+token);
    if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return reply(401,{error:'配对码不正确'});
    for(const [id,job] of jobs)if(now()-job.created>300000)jobs.delete(id);
    try{
      const url=new URL(req.url,'http://127.0.0.1');
      if(req.method==='GET'&&url.pathname==='/status')return reply(200,{pluginOnline:heartbeat>0&&now()-heartbeat<6000});
      if(req.method==='GET'&&url.pathname==='/plugin/poll'){
        heartbeat=now();const job=[...jobs.values()].find(j=>j.status==='pending');
        if(job){job.status='delivered';return reply(200,{job:{id:job.id,...job.payload}});}return reply(200,{job:null});
      }
      if(req.method==='GET'&&url.pathname.startsWith('/jobs/')){const j=jobs.get(url.pathname.split('/')[2]);return j?reply(200,{status:j.status,error:j.error}):reply(404,{error:'任务已过期'});}
      if(req.method==='POST'){
        let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>24*1024*1024){reply(413,{error:'素材超过 24 MB，请使用 1× 导出'});return;}chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks).toString());
        if(url.pathname==='/jobs'){
          if(!heartbeat||now()-heartbeat>=6000)return reply(409,{error:'Figma 插件未连接'});
          if(jobs.size>=20)return reply(429,{error:'任务过多，请稍后重试'});
          if(typeof body.png!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.png)||![body.width,body.height].every(n=>Number.isFinite(n)&&n>=1&&n<=4096))return reply(400,{error:'无效素材'});
          const id=randomUUID();jobs.set(id,{id,created:now(),status:'pending',payload:{png:body.png,width:body.width,height:body.height,name:String(body.name||'Liquid Glass').slice(0,100)}});return reply(201,{id});
        }
        if(url.pathname==='/plugin/ack'){
          const job=jobs.get(body.id);if(!job)return reply(404,{error:'任务不存在'});job.status=body.ok?'done':'error';job.error=body.ok?undefined:String(body.error||'Import failed').slice(0,300);delete job.payload;return reply(200,{ok:true});
        }
      }
      reply(404,{error:'Not found'});
    }catch{if(!res.headersSent)reply(400,{error:'无效请求'});}
  });
  return {server,token};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const {server,token}=createBridge();server.on('error',error=>{console.error('连接服务无法启动：',error.message);process.exitCode=1;});server.listen(3847,'127.0.0.1',()=>console.log('\nLiquidGlass_For_Figma 本地连接服务\n地址 http://127.0.0.1:3847\n配对码 '+token+'\n请将配对码粘贴到网站和 Figma 插件。按 Ctrl+C 停止。\n'));}
