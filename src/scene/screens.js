import * as THREE from 'three';
import { getDevicePreview,drawDevicePreview } from './device-preview.js';

export function createScreens(){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=480;
  const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;
  const sideCanvas=document.createElement('canvas');sideCanvas.width=960;sideCanvas.height=420;
  const side=sideCanvas.getContext('2d');
  const sideTexture=new THREE.CanvasTexture(sideCanvas);sideTexture.colorSpace=THREE.SRGBColorSpace;sideTexture.magFilter=THREE.NearestFilter;
  let taskProgress=0,lastTask=-1,lastWorkflow=-1,lastSize='';
  function drawBrief(){
    ctx.fillStyle='#0d1322';ctx.fillRect(0,0,768,480);ctx.fillStyle='#182136';ctx.fillRect(0,0,768,41);
    ['#f18a9a','#e0c37b','#7cceab'].forEach((color,i)=>{ctx.fillStyle=color;ctx.fillRect(17+i*18,16,8,8)});
    ctx.fillStyle='#adb9d5';ctx.font='12px monospace';ctx.fillText('YASH / AI ENGINEER — AGENT WORKSPACE',104,26);
    ctx.fillStyle='#e1e5f1';ctx.font='bold 24px monospace';ctx.fillText('One idea. Eighteen agents.',37,87);
    ctx.fillStyle='#75849e';ctx.font='12px monospace';ctx.fillText('Your direction. Their collaboration.',38,110);
    ctx.fillStyle='#1e293d';ctx.fillRect(35,137,698,130);ctx.fillStyle='#97bde5';ctx.font='bold 11px monospace';ctx.fillText('YASH / AI ENGINEER',53,160);
    ctx.font='15px monospace';ctx.fillStyle='#d9dfed';
    const prompt='Build my portfolo and make it live!';
    let line='',row=0;
    prompt.split(' ').forEach(word=>{if(ctx.measureText(line+word).width>625){ctx.fillText(line,53,189+row*23);line='';row++;}line+=word+' ';});ctx.fillText(line,53,189+row*23);
    const sent=taskProgress>=.36;ctx.fillStyle=sent?'#2b5b4b':'#9c82bd';ctx.fillRect(571,228,143,25);ctx.fillStyle='#e7eaf4';ctx.font='11px monospace';ctx.fillText(sent?'TASK SENT ✓':'SEND TASK ↗',587,245);
    if(taskProgress>=.39){
      ctx.fillStyle='#99dbbb';ctx.font='bold 11px monospace';ctx.fillText('AI AGENT',39,300);
      ctx.fillStyle='#b5c0d6';ctx.font='13px monospace';ctx.fillText('On it. Eighteen agents, one shared canvas.',39,321);
      const roles=['Architect','Designer','Developer','AI Agent','Research','ML Engineer','Content','QA','Layout','Systems','Frontend','Backend','Accessibility','Integration','Motion','Tools','Data','Review'];
      const colors=['#a78bfa','#f38bab','#79a8f5','#80d4a0','#f2b177','#6ad2dd'];
      roles.forEach((role,i)=>{const x=39+(i%6)*117,y=339+Math.floor(i/6)*29;ctx.fillStyle='#1d293d';ctx.fillRect(x,y,108,23);ctx.fillStyle=colors[i%6];ctx.fillRect(x+7,y+9,4,4);ctx.font='8px monospace';ctx.fillText(role,x+17,y+15)});
    }
    ctx.fillStyle=taskProgress>=.51?'#ef4444':'#24334b';ctx.fillRect(0,440,768,40);ctx.fillStyle='#d4deef';ctx.font='12px monospace';ctx.fillText(taskProgress>=.51?'OPENING THE LIVE CANVAS →':'IDEA → BRIEF → AGENTS → SOMETHING USEFUL',39,465);
    const device=getDevicePreview();
    if(device.mode!=='desktop')drawDevicePreview(ctx,device,innerWidth,innerHeight);
    texture.needsUpdate=true;
  }
  function drawWorkflow(time,still){
    const w=960,h=420;
    side.fillStyle='#0d1524';side.fillRect(0,0,w,h);
    side.strokeStyle='#253249';side.lineWidth=1;
    for(let x=20;x<w;x+=28){side.beginPath();side.moveTo(x,80);side.lineTo(x,h-32);side.stroke();}
    for(let y=92;y<h;y+=28){side.beginPath();side.moveTo(20,y);side.lineTo(w-20,y);side.stroke();}
    side.fillStyle='#c1cee7';side.font='bold 21px monospace';side.fillText('AGENT WORKFLOW',31,39);
    side.fillStyle='#7fddc1';side.font='13px monospace';side.fillText('● LIVE / DATA IN TRANSIT',620,38);
    side.fillStyle='#6f85a5';side.font='12px monospace';side.fillText('A thought becomes a connected system.',32,64);
    const nodes=['INPUT','PLANNER','TOOLS','BUILD','REVIEW'];
    const sub=['brief','reason','execute','compose','validate'];
    const colors=['#8bb4eb','#b69cea','#7dd7b6','#e4b885','#82d7e4'];
    const xs=[38,222,406,590,774],y=178,nw=116,nh=98;
    for(let i=0;i<4;i++){
      const start=xs[i]+nw,end=xs[i+1],cy=y+nh/2;
      side.strokeStyle='#4c6385';side.lineWidth=3;side.beginPath();side.moveTo(start,cy);side.lineTo(end,cy);side.stroke();
      side.fillStyle=colors[i+1];side.beginPath();side.moveTo(end-8,cy-5);side.lineTo(end,cy);side.lineTo(end-8,cy+5);side.fill();
      for(let packet=0;packet<2;packet++){
        const phase=still?.4:((time*.48+i*.19+packet*.5)%1);
        const x=start+(end-start)*phase;
        side.shadowColor=colors[i];side.shadowBlur=13;side.fillStyle=colors[i];side.fillRect(x-5,cy-4,10,8);side.shadowBlur=0;
      }
    }
    // The lower feedback edge returns review context to the planner.
    side.strokeStyle='#426276';side.lineWidth=2;side.beginPath();side.moveTo(xs[4]+nw/2,y+nh);side.lineTo(xs[4]+nw/2,337);side.lineTo(xs[1]+nw/2,337);side.lineTo(xs[1]+nw/2,y+nh);side.stroke();
    const feedback=still?.4:(time*.14)%1;
    side.fillStyle='#89d5d0';side.shadowColor='#89d5d0';side.shadowBlur=10;side.fillRect(xs[4]+nw/2-feedback*(xs[4]-xs[1])-5,333,10,8);side.shadowBlur=0;
    nodes.forEach((name,i)=>{
      const pulse=still?.35:(Math.sin(time*2-i*.9)+1)/2;
      side.fillStyle='#152238';side.fillRect(xs[i],y,nw,nh);side.strokeStyle=colors[i];side.globalAlpha=.5+pulse*.5;side.lineWidth=2;side.strokeRect(xs[i],y,nw,nh);side.globalAlpha=1;
      side.fillStyle=colors[i];side.font='bold 19px monospace';side.fillText(name,xs[i]+12,y+43);
      side.fillStyle='#7892b2';side.font='12px monospace';side.fillText(sub[i],xs[i]+12,y+70);
      side.fillStyle=colors[i];side.fillRect(xs[i]+9,y-20,5,5);
    });
    side.fillStyle='#7a92b3';side.font='11px monospace';side.fillText('CONTEXT / FEEDBACK LOOP',392,363);
    side.fillStyle='#839bbd';side.font='12px monospace';side.fillText('5 NODES  /  CONNECTED EDGES  /  CONTINUOUS HANDOFF',32,398);
    sideTexture.needsUpdate=true;
  }
  function update(time,still=false){
    const size=`${innerWidth}x${innerHeight}`;
    if(lastTask<0||Math.abs(taskProgress-lastTask)>.012||size!==lastSize){drawBrief();lastTask=taskProgress;lastSize=size;}
    const tick=still?0:Math.floor(time*(innerWidth<=700?12:20));
    if(tick!==lastWorkflow){drawWorkflow(still?0:time,still);lastWorkflow=tick;}
  }
  update(0,true);
  return {texture,sideTexture,update,setTaskProgress(value){taskProgress=value},dispose(){texture.dispose();sideTexture.dispose()}};
}
