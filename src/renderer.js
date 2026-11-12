import {clamp, roundedDistance, svgFromPNG} from './geometry.js';
export const W = 1200, H = 800;
const canvas = (w, h) => Object.assign(document.createElement('canvas'), {width:w, height:h});
export class Renderer {
  constructor(stage) { this.stage = stage; this.bg = canvas(W,H); this.soft = canvas(W,H); this.patch = canvas(1,1); this.cacheKey = ''; this.demo(); }
  demo() {
    const c = this.bg.getContext('2d');
    const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#e1e9f1');g.addColorStop(.5,'#c9d4e2');g.addColorStop(1,'#7f98ad');c.fillStyle=g;c.fillRect(0,0,W,H);
    for(const [x,y,r,color] of [[220,180,460,'#69c9ea'],[960,220,490,'#8a7bf1'],[610,650,500,'#f6bcae'],[1000,800,320,'#e9e4b2']]) {
      const a=c.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color);a.addColorStop(1,color+'00');c.fillStyle=a;c.fillRect(0,0,W,H);
    }
    c.save();c.translate(600,400);c.rotate(-.35);
    for(let i=0;i<7;i++){c.beginPath();c.ellipse(0,(i-3)*98,850,180,0,0,Math.PI*2);c.strokeStyle=`rgba(255,255,255,${.08+i*.025})`;c.lineWidth=28;c.stroke();}c.restore();this.cacheKey='';
  }
  setImage(image) {
    const c=this.bg.getContext('2d'); const s=Math.max(W/image.width,H/image.height);c.clearRect(0,0,W,H);c.drawImage(image,(W-image.width*s)/2,(H-image.height*s)/2,image.width*s,image.height*s);this.cacheKey='';
  }
  render(p) {
    const key=String(p.blur);
    if(key!==this.cacheKey){const c=this.soft.getContext('2d'),pad=72,extended=canvas(W+pad*2,H+pad*2),ec=extended.getContext('2d');ec.drawImage(this.bg,pad,pad);ec.drawImage(this.bg,0,0,1,H,0,pad,pad,H);ec.drawImage(this.bg,W-1,0,1,H,W+pad,pad,pad,H);ec.drawImage(extended,0,pad,W+pad*2,1,0,0,W+pad*2,pad);ec.drawImage(extended,0,H+pad-1,W+pad*2,1,0,H+pad,W+pad*2,pad);c.clearRect(0,0,W,H);c.filter=`blur(${p.blur}px)`;c.drawImage(extended,-pad,-pad);c.filter='none';this.pixels=c.getImageData(0,0,W,H).data;this.cacheKey=key;}
    const w=p.width,h=p.height,r=Math.min(p.radius,w/2,h/2),pad=28;
    this.patch.width=w+pad*2;this.patch.height=h+pad*2;
    const ctx=this.patch.getContext('2d');
    ctx.shadowColor='rgba(21,30,58,.28)';ctx.shadowBlur=22;ctx.shadowOffsetY=10;ctx.fillStyle='rgba(20,30,50,.10)';ctx.beginPath();ctx.roundRect(pad,pad,w,h,r);ctx.fill();ctx.shadowColor='transparent';
    const layer=canvas(w,h),lc=layer.getContext('2d'),out=lc.createImageData(w,h),src=this.pixels;
    const angle=p.light*Math.PI/180,lx=Math.cos(angle),ly=Math.sin(angle),bezel=Math.min(p.edge,w/2,h/2);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const d=roundedDistance(x+.5,y+.5,w,h,r);if(d>.5)continue;
      const nx=roundedDistance(x+1,y+.5,w,h,r)-roundedDistance(x,y+.5,w,h,r);
      const ny=roundedDistance(x+.5,y+1,w,h,r)-roundedDistance(x+.5,y,w,h,r);
      const t=clamp(1+d/bezel,0,1),bend=Math.sin(t*Math.PI*.5)*p.refraction;
      const sx=clamp(Math.round(p.x-w/2+x-nx*bend),0,W-1),sy=clamp(Math.round(p.y-h/2+y-ny*bend),0,H-1),si=(sy*W+sx)*4,oi=(y*w+x)*4;
      const rim=Math.pow(clamp(1+d/2.8,0,1),2),light=clamp((nx*lx+ny*ly)*.5+.5,0,1);
      const shine=rim*(.15+light*.8)*p.highlight;
      for(let k=0;k<3;k++){let v=src[si+k]*(1-p.tint)+255*p.tint;v=v*(1-shine)+255*shine;out.data[oi+k]=v;}
      out.data[oi+3]=Math.round(clamp(.5-d,0,1)*255);
    }
    lc.putImageData(out,0,0);ctx.drawImage(layer,pad,pad);
    const stage=this.stage.getContext('2d');stage.clearRect(0,0,W,H);stage.drawImage(this.bg,0,0);stage.drawImage(this.patch,Math.round(p.x-w/2-pad),Math.round(p.y-h/2-pad));
  }
  export(p) {
    this.render(p);const source=p.scope==='scene'?this.stage:this.patch;
    const scale=p.scale;const out=canvas(source.width*scale,source.height*scale);out.getContext('2d').drawImage(source,0,0,out.width,out.height);
    const png=out.toDataURL('image/png');return {svg:svgFromPNG(png,source.width,source.height),png,width:source.width,height:source.height,pixelWidth:out.width,pixelHeight:out.height};
  }
}
