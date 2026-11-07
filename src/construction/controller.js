import { gsap } from 'gsap';
import { createVisibleBuilder } from './visible-builder.js';
import { getCursorPool } from './cursor-pool.js';

export function createConstructionScene(stage,motionPreference,options={}){
  const hero=stage.closest('.build-hero'),pool=getCursorPool();
  const status=stage.querySelector('#construction-status'),count=stage.querySelector('#agent-count');
  const skip=stage.querySelector('#skip-intro'),pause=stage.querySelector('#pause-intro'),replay=stage.querySelector('#replay-intro');
  const progress=hero.querySelector('.build-progress span');
  const targets=[...stage.querySelectorAll('[data-build]')];
  let started=false,userPaused=false,disposed=false,notified=false,engine;
  let previousPending=-1;
  function refresh(){
    if(!engine||!started||disposed)return;
    const pending=engine.pendingVisible();
    const next=pending?'running':'complete';
    if(hero.dataset.construction!==next)hero.dataset.construction=next;
    document.body.classList.toggle('construction-running',!!pending&&!userPaused);
    const statusText=userPaused?'BUILD PAUSED':pending?'BUILDING WHAT’S IN VIEW':'CANVAS COMPLETE.';
    if(status.textContent!==statusText)status.textContent=statusText;
    const countText=`${pool.activeCount()} ACTIVE / ${pool.total} AGENTS`;
    if(count.textContent!==countText)count.textContent=countText;
    hero.dataset.visiblePending=String(pending);
    progress.style.transform=`scaleX(${1-pending/Math.max(1,targets.length)})`;
    skip.hidden=!pending;pause.hidden=!pending;replay.hidden=!!pending||motionPreference.matches;
    if(pending!==previousPending){
      gsap.set(stage.querySelector('.build-tools'),{autoAlpha:pending?1:0});
      gsap.set(stage.querySelector('.design-guides'),{opacity:pending ? .6 : 0});previousPending=pending;
    }
    if(!pending&&!notified){notified=true;options.onComplete?.('visible-complete');}
  }
  engine=createVisibleBuilder(targets,motionPreference,{enabled:false,onChange:refresh});
  function start(){
    if(disposed)return;started=true;userPaused=false;
    hero.dataset.construction='running';hero.dataset.completedBy='';hero.dataset.cursorCount=String(pool.total);
    hero.style.setProperty('--hero-accent','#ef4444');
    engine.activate();engine.resume();refresh();
  }
  function finish(reason='skipped'){
    started=true;hero.dataset.completedBy=reason;engine.activate();
    if(['skipped','reduced-motion'].includes(reason))engine.completeAll();
    engine.resume();refresh();
  }
  function skipIntro(){finish('skipped');stage.querySelector('[data-build="cta-primary"]').focus({preventScroll:true})}
  function pauseIntro(){userPaused=!userPaused;userPaused?engine.pause():engine.resume();pause.textContent=userPaused?'Resume':'Pause';pause.setAttribute('aria-label',userPaused?'Resume introduction':'Pause introduction');refresh()}
  function replayIntro(){window.scrollTo({top:hero.getBoundingClientRect().top+scrollY,behavior:'instant'});notified=false;engine.reset();start()}
  skip.addEventListener('click',skipIntro);pause.addEventListener('click',pauseIntro);replay.addEventListener('click',replayIntro);
  if(motionPreference.matches)finish('reduced-motion');
  else if(options.defer){hero.dataset.construction='waiting';status.textContent='18 AGENTS READY. SCROLL TO ENTER.';count.textContent='SCROLL AT YOUR PACE';skip.hidden=false;pause.hidden=true;replay.hidden=true;gsap.set(stage.querySelector('.build-tools'),{autoAlpha:0});}
  else start();
  function dispose(){disposed=true;engine.dispose();skip.removeEventListener('click',skipIntro);pause.removeEventListener('click',pauseIntro);replay.removeEventListener('click',replayIntro);document.body.classList.remove('construction-running')}
  if(import.meta.hot)import.meta.hot.dispose(dispose);
  return {start,finish,dispose,state:()=>hero.dataset.construction,pause(){userPaused=true;engine.pause();refresh()},resume(){userPaused=false;engine.resume();refresh()}};
}
