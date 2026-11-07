import { gsap } from 'gsap';

export function createVirtualCursor(agent,stage) {
  const element=document.createElement('div');
  element.className='virtual-cursor';element.dataset.agent=agent.id;
  element.style.setProperty('--agent-color',agent.color);
  element.setAttribute('aria-hidden','true');
  element.innerHTML=`<svg viewBox="0 0 24 30" width="22" height="28"><path d="M2 2 21 18l-9 1-5 8z" fill="currentColor" stroke="#09090b" stroke-width="1.5" stroke-linejoin="round"/></svg><span class="cursor-label">${agent.name}</span><i class="cursor-ripple"></i>`;
  stage.append(element);
  const beam=document.createElement('span');
  beam.className='agent-ibeam';
  beam.innerHTML='<svg viewBox="0 0 16 26" width="16" height="26"><path d="M3 3h10M8 3v20M3 23h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  element.append(beam);
  const state={x:0,y:0};
  const setX=gsap.quickSetter(element,'x','px'),setY=gsap.quickSetter(element,'y','px');
  function paint(){setX(state.x);setY(state.y)}
  function position(x,y){state.x=x;state.y=y;element.classList.toggle('cursor-label-left',x>innerWidth-135);paint()}
  return {element,state,paint,position,dispose(){element.remove()}};
}
