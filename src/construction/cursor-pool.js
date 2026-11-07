import { gsap } from 'gsap';
import { agents,shuffled } from './agents.js';
import { createVirtualCursor } from './virtual-cursor.js';

let shared;
export function getCursorPool(){
  if(shared)return shared;
  const layer=document.createElement('div');layer.className='global-agent-pool cursor-layer';layer.setAttribute('aria-hidden','true');
  document.body.append(layer);
  const cursors=agents.map(agent=>({...createVirtualCursor(agent,layer),agent,busy:false}));
  cursors.forEach(cursor=>gsap.set(cursor.element,{autoAlpha:0}));
  shared={
    take(count=2){
      const limit=innerWidth<=700?12:18;
      if(cursors.filter(cursor=>cursor.busy).length+count>limit)return null;
      const free=shuffled(cursors.filter(cursor=>!cursor.busy));
      if(free.length<count)return null;
      const selected=free.slice(0,count);selected.forEach(cursor=>{cursor.busy=true;cursor.element.dataset.busy='true';gsap.set(cursor.element,{autoAlpha:1})});
      return selected;
    },
    release(selected){selected.forEach(cursor=>{cursor.busy=false;cursor.element.dataset.busy='false';cursor.element.removeAttribute('data-task');gsap.set(cursor.element,{autoAlpha:0})})},
    total:agents.length,
    activeCount:()=>cursors.filter(cursor=>cursor.busy).length,
  };
  return shared;
}
