figma.showUI(__html__, {width:340,height:340,themeColors:true});
figma.ui.onmessage=async message=>{
  if(message.type!=='import')return;
  let node;
  try {
    const p=message.payload;
    if(typeof p.svg!=='string'||p.svg.length>4*1024*1024||!p.svg.startsWith('<svg ')||/<(?:image|script|foreignObject)\b|\b(?:href|style|on[a-z]+)\s*=|data:|javascript:/i.test(p.svg))throw new Error('Expected vector SVG without images or scripts');
    if(![p.width,p.height].every(n=>Number.isFinite(n)&&n>=1&&n<=4096))throw new Error('Invalid dimensions');
    node=figma.createNodeFromSvg(p.svg);
    node.name=p.name||'Liquid Glass / Vector';
    node.x=figma.viewport.center.x-node.width/2;
    node.y=figma.viewport.center.y-node.height/2;
    node.setPluginData('source','LiquidGlass_For_Figma / editable vector material');
    figma.currentPage.selection=[node];
    figma.viewport.scrollAndZoomIntoView([node]);
    figma.ui.postMessage({type:'result',id:message.id,ok:true});
    figma.notify('矢量玻璃已导入，可编辑图形与渐变');
  }catch(error){
    if(node)node.remove();
    figma.ui.postMessage({type:'result',id:message.id,ok:false,error:String(error.message||error)});
  }
};
