// Accept only the small vector vocabulary emitted by this project.
export function validVectorSVG(svg) {
  if(typeof svg!=='string'||svg.length>4*1024*1024||!svg.startsWith('<svg ')||!svg.endsWith('</svg>'))return false;
  if(/<!|<\?|\b(?:href|style|on[a-z]+)\s*=|data:|javascript:/i.test(svg))return false;
  if(/url\(\s*[^#]/i.test(svg))return false;
  const allowed=new Set(['svg','title','desc','defs','linearGradient','radialGradient','stop','clipPath','g','rect']);
  return [...svg.matchAll(/<\/?([\w:-]+)/g)].every(match=>allowed.has(match[1]));
}
