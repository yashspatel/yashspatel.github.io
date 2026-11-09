import { gsap } from 'gsap';
import { getCursorPool } from './cursor-pool.js';

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const variants=['place','align','resize','style'];

// Agents work on components as the visitor scrolls them into view.
export function createVisibleBuilder(elements,motionPreference,{enabled=true,onChange=()=>{}}={}) {
  const pool=getCursorPool();
  let active=enabled,disposed=false,paused=false,lastScan=-1;
  const parts=[...new Set(elements)].map(target=>{
    target.classList.add('viewport-build-target');
    const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
    const texts=[];let node;
    while((node=walker.nextNode())){
      if(node.textContent.trim() && node.parentElement.closest('.viewport-build-target')===target && !node.parentElement.closest('.selection-label,.size-label,svg,button[aria-hidden]'))texts.push({node,original:node.textContent});
    }
    const needsFit=target.matches('[data-build=heading],[data-build=preview],[data-build^=cta],.about-photo,.project-art,.skill-groups>div,.experience-row,.education,.contact-heading');
    const part={target,texts,needsFit,fitted:!needsFit,typed:0,total:texts.reduce((n,t)=>n+t.original.length,0),coverage:[],job:null,bounds:null};
    target.dataset.buildState='pending';
    if(motionPreference.matches){part.coverage=[[0,1]];target.dataset.buildState='built';}
    paint(part);return part;
  });
  function merge(intervals){
    const result=[];
    [...intervals].sort((a,b)=>a[0]-b[0]).forEach(([start,end])=>{
      const previous=result[result.length-1];
      if(previous&&start<=previous[1]+.003)previous[1]=Math.max(previous[1],end);else result.push([start,end]);
    });return result;
  }
  function paint(part){
    part.target.style.pointerEvents=motionPreference.matches||part.coverage.length||part.job?.reveal>.7?'':'none';
    if(motionPreference.matches){part.target.style.maskImage='none';part.target.style.webkitMaskImage='none';return;}
    let live=null;
    if(part.job&&part.bounds){
      const view=[0,1];
      const start=Math.max(view[0],part.job.band[0]),end=Math.min(view[1],part.job.band[1]);
      if(end>start){live=[start,end];if(part.job.reveal>=.999)part.coverage=merge([...part.coverage,live]);}
    }
    const bands=[...part.coverage.flatMap(([a,b])=>[a,b]),0,1];
    if(live)bands.push(...live);
    const endpoints=[...new Set(bands)].sort((a,b)=>a-b);
    const stops=[];
    for(let i=0;i<endpoints.length-1;i++){
      const a=endpoints[i],b=endpoints[i+1],middle=(a+b)/2;
      const built=part.coverage.some(([start,end])=>middle>=start&&middle<=end);
      const inJob=live&&middle>=live[0]&&middle<=live[1];
      const alpha=built?1:inJob?part.job.reveal:0;
      const color=`rgba(0,0,0,${alpha})`;
      stops.push(`${color} ${a*100}%`,`${color} ${b*100}%`);
    }
    const mask=`linear-gradient(to bottom,${stops.join(',')})`;
    part.target.style.maskImage=mask;part.target.style.webkitMaskImage=mask;
  }
  function visible(part){
    const r=part.bounds;
    if(!r||!r.visible||r.width<1||r.height<1||r.bottom<=72||r.top>=innerHeight-65||r.right<=0||r.left>=innerWidth)return null;
    const parent=part.target.parentElement.closest('.viewport-build-target');
    if(parent){
      const container=parts.find(item=>item.target===parent);
      if(container){const middle=clamp(((Math.max(72,r.top)+Math.min(innerHeight-65,r.bottom))/2-container.bounds.top)/container.bounds.height,0,1);if(!container.coverage.some(([a,b])=>middle>=a&&middle<=b))return null;}
    }
    return [0,1];
  }
  function missing(part,band){
    if(!part.fitted)return band;
    if(part.total&&part.typed<part.total)return band;
    let ranges=[band];
    part.coverage.forEach(([a,b])=>{
      ranges=ranges.flatMap(([x,y])=>{
        if(b<=x||a>=y)return [[x,y]];
        const out=[];if(a>x)out.push([x,Math.min(a,y)]);if(b<y)out.push([Math.max(b,x),y]);return out;
      });
    });
    return ranges.filter(([a,b])=>(b-a)*part.bounds.height>3).sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0]||null;
  }
  function rect(part){
    const r=part.bounds;const delta=scrollY-r.scroll;
    return {left:r.left,right:r.right,top:r.top-delta,bottom:r.bottom-delta,width:r.width,height:r.height};
  }
  function write(part,count){
    part.typed=Math.max(part.typed,Math.floor(count));let remaining=part.typed;
    part.texts.forEach(text=>{const next=text.original.slice(0,Math.max(0,remaining));if(text.node.textContent!==next)text.node.textContent=next;remaining-=text.original.length;});
  }
  function position(part,job){
    if(!part.bounds)return;
    const r=rect(part);
    job.cursors.forEach(cursor=>{cursor.element.style.visibility=r.bottom>72&&r.top<innerHeight-65?'visible':'hidden'});
    const top=Math.max(76,r.top+job.band[0]*r.height),bottom=Math.min(innerHeight-69,r.top+job.band[1]*r.height);
    const x=clamp(r.left+14,12,innerWidth-115),right=clamp(r.right-7,20,innerWidth-24);
    if(job.type==='resize'&&job.travel>=.98){
      const box=part.target.getBoundingClientRect();
      job.cursors[0].position(clamp(box.left,4,innerWidth-24),clamp(box.top,76,innerHeight-70));
      job.cursors[1]?.position(clamp(box.right,4,innerWidth-24),clamp(box.bottom,76,innerHeight-70));
      return;
    }
    if(job.type==='type'&&job.travel>=.98){
      const text=part.texts.filter(t=>t.node.textContent.length).slice(-1)[0];
      if(text){const range=document.createRange();range.selectNodeContents(text.node);range.collapse(false);const caret=range.getBoundingClientRect();if(caret.height){job.cursors[0].position(clamp(caret.right+3,8,innerWidth-100),clamp(caret.bottom-18,76,innerHeight-75));return;}}
    }
    const progress=job.travel;
    const bend=Math.sin(progress*Math.PI)*18;
    job.cursors[0].position(clamp(x-26*(1-progress)+bend,4,innerWidth-27),clamp(top+12+13*(1-progress),76,innerHeight-70));
    job.cursors[1]?.position(clamp(right+18*(1-progress),5,innerWidth-24),clamp(bottom-4-25*(1-progress),76,innerHeight-70));
  }
  function release(part,complete=false){
    const job=part.job;if(!job)return;
    if(complete&&job.type==='resize')part.fitted=true;
    job.timeline.kill();pool.release(job.cursors);
    part.job=null;part.target.removeAttribute('data-typing');part.target.removeAttribute('data-selected');part.target.style.removeProperty('filter');
    gsap.set(part.target,{clearProps:'x,y,scale,filter'});
    part.target.dataset.buildState=part.coverage.length===1&&part.coverage[0][0]===0&&part.coverage[0][1]===1?'built':part.coverage.length?'partial':'pending';
    paint(part);onChange();
  }
  function build(part,band){
    const type=!part.fitted?'resize':part.total&&part.typed<part.total?'type':variants[Math.floor(Math.random()*variants.length)];
    const cursors=pool.take(type==='type'?1:2);if(!cursors)return;
    if(type==='resize'&&part.total&&part.typed===0){part.target.style.minHeight=`${part.bounds.height}px`;write(part,0);}
    if(type==='type'){
      part.target.style.minHeight=`${part.bounds.height}px`;
      write(part,part.typed);part.target.dataset.typing='true';
    }
    const job={cursors,band,reveal:0,travel:0,timeline:null,type};part.job=job;
    part.target.dataset.buildState='working';part.target.dataset.task=type;
    part.target.style.setProperty('--selection-color',cursors[0].agent.color);
    cursors.forEach((cursor,i)=>{cursor.element.dataset.task=type;cursor.element.dataset.action=type==='type'?'typing':type==='resize'?'resize':i?'resize':type==='place'?'drag':'select'});
    job.timeline=gsap.timeline({paused:true,onComplete:()=>release(part,true)});
    job.timeline.to(job,{travel:1,duration:.27+Math.random()*.14,ease:'power2.inOut',onUpdate:()=>position(part,job)},0);
    job.timeline.call(()=>{part.target.dataset.selected=cursors[0].agent.id;},[],.23);
    cursors.forEach(cursor=>job.timeline.fromTo(cursor.element.querySelector('.cursor-ripple'),{scale:0,opacity:.6},{scale:1.8,opacity:0,duration:.25,immediateRender:false},.25));
    job.timeline.to(job,{reveal:1,duration:type==='type'?.01:.18,ease:'power2.out',onUpdate:()=>paint(part)},.3);
    if(type==='type'){
      const typing={count:part.typed};
      job.timeline.to(typing,{count:part.total,duration:clamp((part.total-part.typed)/65,.55,4.5),ease:'none',onUpdate:()=>{write(part,typing.count);position(part,job)}},.32);
    }
    if(type==='place'||type==='align')job.timeline.fromTo(part.target,{x:(Math.random()>.5?1:-1)*(type==='place'?65:14),y:type==='place'?28:0},{x:0,y:0,duration:.35,ease:'power2.out',immediateRender:false},.3);
    if(type==='resize')job.timeline.fromTo(part.target,{scaleX:.68,scaleY:.78,transformOrigin:'0 0'},{scaleX:1,scaleY:1,duration:1.1,ease:'power2.inOut',immediateRender:false,onUpdate:()=>position(part,job)},.43);
    if(type==='style')job.timeline.fromTo(part.target,{filter:'brightness(.7)'},{filter:'brightness(1)',duration:.35,immediateRender:false},.35);
    job.timeline.to(job,{travel:1,duration:.45+Math.random()*.28,onUpdate:()=>position(part,job)},.43);
    job.timeline.timeScale(.5).play();position(part,job);onChange();
  }
  parts.forEach(part=>{part.texts=part.texts.filter(t=>t.node.parentElement.closest('.viewport-build-target')===part.target);part.total=part.texts.reduce((n,t)=>n+t.original.length,0);});
  function scan(time){
    if(disposed||time-lastScan<.025)return;lastScan=time;
    // All geometry reads precede mask/selection/cursor writes.
    parts.forEach(part=>{const r=part.target.getBoundingClientRect(),style=getComputedStyle(part.target);part.bounds={left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,scroll:scrollY,visible:style.visibility!=='hidden'&&style.display!=='none'};});
    parts.forEach(part=>{
      const band=visible(part);
      if(part.job){
        if(!band||!active||paused||document.hidden){
          // Retain typing progress until this component returns to view.
          release(part,false);
        }else position(part,part.job);
      }
    });
    if(!active||paused||document.hidden||motionPreference.matches)return;
    parts.forEach(part=>{if(part.job)return;const band=visible(part);if(!band)return;const gap=missing(part,band);if(gap)build(part,gap);});
    onChange();
  }
  function pendingVisible(){return parts.filter(part=>{const band=visible(part);return band&&(part.job||missing(part,band))}).length;}
  function completeAll(){parts.forEach(part=>{if(part.job)release(part,false);part.fitted=true;write(part,part.total);part.coverage=[[0,1]];part.target.dataset.buildState='built';paint(part)});onChange();}
  function reset(){parts.forEach(part=>{if(part.job)release(part,false);part.fitted=!part.needsFit;part.typed=0;part.texts.forEach(t=>t.node.textContent=t.original);part.coverage=[];part.target.dataset.buildState='pending';paint(part)});}
  function onMotion(){if(motionPreference.matches)completeAll();}
  motionPreference.addEventListener('change',onMotion);gsap.ticker.add(scan);
  scan(0);
  function dispose(){disposed=true;gsap.ticker.remove(scan);motionPreference.removeEventListener('change',onMotion);parts.forEach(part=>{if(part.job)release(part,false)})}
  return {activate(){active=true},pause(){paused=true;parts.forEach(part=>{if(part.job)release(part,false)})},resume(){paused=false},completeAll,reset,pendingVisible,activeCount:()=>parts.filter(part=>part.job).length,pendingCount:()=>parts.filter(part=>part.job||part.typed<part.total||!part.coverage.some(([a,b])=>a===0&&b===1)).length,parts,dispose};
}
