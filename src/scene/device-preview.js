// One aperture definition drives both the monitor pixels and projected HTML.
export function getDevicePreview(width=innerWidth,height=innerHeight){
  const mode=width<=700?'mobile':width<=1100?'tablet':'desktop';
  if(mode==='desktop')return {mode,width:1.72,height:1.08,y:0};
  const ratio=width/height;
  if(mode==='mobile')return {mode,width:1.5*ratio,height:1.5,y:0};
  const h=Math.min(.86,1.4/ratio);
  return {mode,width:h*ratio,height:h,y:-.025};
}

export function drawDevicePreview(ctx,device,width,height){
  const w=device.width/1.72*768,h=device.height/1.08*480;
  const x=(768-w)/2,y=240-device.y/1.08*480-h/2;
  ctx.fillStyle='#0d1322';ctx.fillRect(0,0,768,480);
  ctx.fillStyle='#192238';ctx.fillRect(0,0,768,35);
  ctx.fillStyle='#87dbd7';ctx.font='bold 12px monospace';
  ctx.fillText('YASH / RESPONSIVE INSPECTOR',18,23);
  ctx.fillStyle='#c6b2fa';ctx.font='10px monospace';
  ctx.fillText(`${device.mode.toUpperCase()}  ${width} x ${height}`,495,23);
  ctx.fillStyle='#8293af';ctx.font='9px monospace';ctx.fillText('LAYOUT / LIVE',12,65);
  ['<portfolio>','  display: grid','  width: 100%','  responsive: on','</portfolio>'].forEach((line,i)=>ctx.fillText(line,12,90+i*19));
  ctx.fillStyle='#39445e';ctx.fillRect(x-7,y-7,w+14,h+14);
  ctx.fillStyle='#09090b';ctx.fillRect(x,y,w,h);
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const unit=w/300;
  ctx.translate(x,y);ctx.scale(unit,unit);
  ctx.strokeStyle='#272731';ctx.lineWidth=1;ctx.strokeRect(12,43,276,h/unit-55);
  ctx.fillStyle='#e8e8ee';ctx.font='bold 13px monospace';ctx.fillText('YASH.',24,29);
  ctx.fillStyle='#a4a4b7';ctx.font='7px monospace';ctx.fillText('MENU +',236,28);
  ctx.fillStyle='#a68de8';ctx.font='7px monospace';ctx.fillText('AI ENGINEER / LIVE BUILD',24,72);
  ctx.fillStyle='#f2f2f5';ctx.font='bold 28px sans-serif';
  ['BUILDING','INTELLIGENT','EXPERIENCES.'].forEach((line,i)=>ctx.fillText(line,24,112+i*32));
  ctx.fillStyle='#a1a4b5';ctx.font='9px monospace';ctx.fillText('Agents. Tools. Real-world impact.',24,214);
  ctx.fillStyle='#ef4444';ctx.fillRect(24,239,115,29);ctx.fillStyle='#fff';ctx.font='9px sans-serif';ctx.fillText('Explore Projects',35,257);
  ctx.fillStyle='#17171f';ctx.fillRect(24,293,252,150);
  ctx.strokeStyle='#655989';ctx.strokeRect(24,293,252,150);
  ctx.fillStyle='#b9a0ef';ctx.font='9px monospace';ctx.fillText('SPLITWISE / MCP SERVER',37,315);
  for(let i=0;i<3;i++){ctx.fillStyle=['#8bc4dc','#b69bea','#8cd6b0'][i];ctx.fillRect(42+i*76,349,50,35);if(i<2){ctx.fillStyle='#55576e';ctx.fillRect(92+i*76,365,26,2);}}
  ctx.fillStyle='#9f91c5';ctx.fillRect(176,191,5,17);ctx.font='7px monospace';ctx.fillText('Designer / building',187,202);
  ctx.restore();
  ctx.fillStyle='#6dd9b5';ctx.fillRect(16,452,5,5);ctx.fillStyle='#8396b4';ctx.font='9px monospace';ctx.fillText('AGENTS BUILDING FOR THIS DEVICE',28,459);
}
