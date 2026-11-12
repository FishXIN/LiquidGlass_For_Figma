/** Editable SVG shapes and smooth color washes. Photographic detail is simplified. */
const clamp = v => Math.max(0, Math.min(255, v));
const n = v => Number(v.toFixed(3));
const color = a => `rgb(${a.map(v => Math.round(clamp(v))).join(',')})`;
export function vectorizeRegion(sample, width, height, {tolerance=16,maxDepth=4,prefix='v'}={}) {
  const defs=[],shapes=[];let count=0;
  function tile(x,y,w,h,depth) {
    const a=sample(x,y),b=sample(x+w,y),c=sample(x,y+h),d=sample(x+w,y+h);
    const middle=a.map((v,k)=>(v+b[k]+c[k]+d[k])/4);
    const dx=a.map((v,k)=>(b[k]+d[k]-v-c[k])/2),dy=a.map((v,k)=>(c[k]+d[k]-v-b[k])/2);
    const dot=(v,u)=>v.reduce((sum,q,k)=>sum+q*u[k],0);
    const angle=Math.atan2(2*dot(dx,dy),dot(dx,dx)-dot(dy,dy))/2;
    const ux=Math.cos(angle),uy=Math.sin(angle),extent=(Math.abs(ux)+Math.abs(uy))/2;
    const slope=dx.map((v,k)=>v*ux+dy[k]*uy);
    let error=0;
    for(const sy of [0,.25,.5,.75,1])for(const sx of [0,.25,.5,.75,1]) {
      const actual=sample(x+w*sx,y+h*sy);
      for(let k=0;k<3;k++)error=Math.max(error,Math.abs(actual[k]-clamp(middle[k]+slope[k]*((sx-.5)*ux+(sy-.5)*uy))));
    }
    if(error>tolerance) {
      // A smooth color field is deliberately preferable to tracing photo pixels.
      // Each wash is an editable radial gradient; overlapping fades avoid seams.
      const grid=maxDepth>4?5:3;
      const base=sample(width/2,height/2);
      shapes.push(`<rect width="${width}" height="${height}" fill="${color(base)}"/>`);count++;
      for(let row=0;row<grid;row++)for(let col=0;col<grid;col++) {
        const cx=(col+.5)*width/grid,cy=(row+.5)*height/grid;
        const rgb=[0,0,0];
        for(const oy of [-.25,0,.25])for(const ox of [-.25,0,.25]) {
          const v=sample(cx+ox*width/grid,cy+oy*height/grid);
          for(let k=0;k<3;k++)rgb[k]+=v[k]/9;
        }
        const id=`${prefix}-${count++}`,radius=Math.hypot(width/grid,height/grid)*1.05;
        defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n(cx)}" cy="${n(cy)}" r="${n(radius)}"><stop stop-color="${color(rgb)}" stop-opacity=".85"/><stop offset=".5" stop-color="${color(rgb)}" stop-opacity=".5"/><stop offset="1" stop-color="${color(rgb)}" stop-opacity="0"/></radialGradient>`);
        shapes.push(`<rect width="${width}" height="${height}" fill="url(#${id})"/>`);
      }
      return;
    }
    const id=`${prefix}-${count++}`;
    const start=middle.map((v,k)=>v-slope[k]*extent),end=middle.map((v,k)=>v+slope[k]*extent);
    const fill=Math.max(...slope.map(Math.abs))<1?color(middle):`url(#${id})`;
    if(fill.startsWith('url'))defs.push(`<linearGradient id="${id}" x1="${n(.5-ux*extent)}" y1="${n(.5-uy*extent)}" x2="${n(.5+ux*extent)}" y2="${n(.5+uy*extent)}"><stop stop-color="${color(start)}"/><stop offset="1" stop-color="${color(end)}"/></linearGradient>`);
    // Small overlap avoids antialias seams in adjacent opaque regions.
    shapes.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w+.15)}" height="${n(h+.15)}" fill="${fill}"/>`);
  }
  tile(0,0,width,height,0);
  return {definitions:defs.join('\n'),shapes:shapes.join('\n'),count};
}
export function glassVector(p,sampleGlass,sampleBackground) {
  const options=p.vectorDetail==='detailed'?{tolerance:8,maxDepth:5}:{tolerance:16,maxDepth:4};
  const w=p.width,h=p.height,r=Math.min(p.radius,w/2,h/2),pad=28;
  const scene=p.scope==='scene',width=scene?1200:w+pad*2,height=scene?800:h+pad*2;
  const x=scene?p.x-w/2:pad,y=scene?p.y-h/2:pad;
  const body=vectorizeRegion(sampleGlass,w,h,{...options,prefix:'body'});
  const background=scene?vectorizeRegion(sampleBackground,width,height,{...options,prefix:'bg'}):null;
  const angle=p.light*Math.PI/180,ux=Math.cos(angle),uy=Math.sin(angle);
  const shadows=Array.from({length:18},(_,i)=>{
    const t=i*1.25;
    return `<rect x="${-t}" y="${9-t}" width="${w+t*2}" height="${h+t*2}" rx="${r+t}" fill="#152039" fill-opacity="${n(.005+i*.00045)}"/>`;
  }).reverse().join('\n');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<title>LiquidGlass_For_Figma — editable vector material</title>
<desc>Editable shapes and gradients. No raster images. Photographic details are simplified.</desc>
<defs>
${body.definitions}
${background?.definitions||''}
<clipPath id="glass-clip"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
<clipPath id="canvas-clip"><rect width="${width}" height="${height}"/></clipPath>
<linearGradient id="rim" x1="${n(.5+ux*.5)}" y1="${n(.5+uy*.5)}" x2="${n(.5-ux*.5)}" y2="${n(.5-uy*.5)}"><stop stop-color="#fff" stop-opacity="${n(p.highlight)}"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="${n(p.highlight*.35)}"/></linearGradient>
</defs>
<g id="Material" clip-path="url(#canvas-clip)">
${background?`<g id="Background-colors">${background.shapes}</g>`:''}
<g transform="translate(${n(x)} ${n(y)})">
<g id="Soft-shadow">${shadows}</g>
<g id="Glass-colors" clip-path="url(#glass-clip)">${body.shapes}</g>
<rect id="Edge-highlight" x=".75" y=".75" width="${w-1.5}" height="${h-1.5}" rx="${Math.max(0,r-.75)}" fill="none" stroke="url(#rim)" stroke-width="1.5"/>
</g></g></svg>`;
  return {svg,width,height,vectorNodes:body.count+(background?.count||0)+19};
}
