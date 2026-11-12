figma.showUI(__html__, {width:340,height:340,themeColors:true});
figma.ui.onmessage=async message=>{
  if(message.type!=='import')return;
  let node;
  try{
    const p=message.payload;
    if(!Array.isArray(p.bytes)||p.bytes.length>24*1024*1024||![p.width,p.height].every(n=>Number.isFinite(n)&&n>=1&&n<=4096))throw new Error('Invalid image');
    const image=figma.createImage(new Uint8Array(p.bytes));
    node=figma.createRectangle();node.name=p.name||'Liquid Glass';node.resize(p.width,p.height);
    node.fills=[{type:'IMAGE',imageHash:image.hash,scaleMode:'FILL'}];
    node.x=figma.viewport.center.x-p.width/2;node.y=figma.viewport.center.y-p.height/2;
    node.setPluginData('source','LiquidGlass_For_Figma / static baked material');
    figma.currentPage.selection=[node];figma.viewport.scrollAndZoomIntoView([node]);
    figma.ui.postMessage({type:'result',id:message.id,ok:true});figma.notify('玻璃素材已导入');
  }catch(error){if(node)node.remove();figma.ui.postMessage({type:'result',id:message.id,ok:false,error:String(error.message||error)});}
};
