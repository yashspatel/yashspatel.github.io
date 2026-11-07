import { gsap } from 'gsap';

// Manual scrolling drives the camera and activates construction; no scroll capture.
export function createGuidedTour(construction,pageBuilders,motionPreference) {
  const controls=document.querySelector('.journey-controls');
  const button=document.querySelector('#tour-toggle');
  const stop=document.querySelector('#tour-stop');
  const status=document.querySelector('#journey-status');
  const destination=document.querySelector('#agent-workspace');
  let paused=false,disposed=false;
  pageBuilders.activate();
  stop.hidden=true;
  function paint(){
    controls.dataset.state=paused?'paused':'manual';
    controls.setAttribute('aria-label','Agent animation controls');
    button.textContent=paused?'Resume agents':'Pause agents';
    button.setAttribute('aria-label',button.textContent);
    button.disabled=motionPreference.matches;
    status.textContent=motionPreference.matches?'EXPLORE AT YOUR PACE':paused?'AGENTS PAUSED':'SCROLL TO BUILD';
  }
  function pause(){paused=true;construction.pause();pageBuilders.pause();paint();}
  function resume(){paused=false;construction.resume();pageBuilders.resume();paint();}
  function toggle(){paused?resume():pause();}
  function checkBuild(){
    if(disposed)return;
    document.body.classList.toggle('portfolio-entered',destination.getBoundingClientRect().top<=2);
    if(construction.state()==='waiting'&&destination.getBoundingClientRect().top<=2){
      construction.start();if(paused)construction.pause();
    }
  }
  function onMotion(){if(motionPreference.matches){construction.finish('reduced-motion');pageBuilders.completeAll();}paint();}
  button.addEventListener('click',toggle);
  window.addEventListener('scroll',checkBuild,{passive:true});
  motionPreference.addEventListener('change',onMotion);
  gsap.ticker.add(checkBuild);checkBuild();paint();
  function dispose(){disposed=true;gsap.ticker.remove(checkBuild);button.removeEventListener('click',toggle);window.removeEventListener('scroll',checkBuild);motionPreference.removeEventListener('change',onMotion);}
  if(import.meta.hot)import.meta.hot.dispose(dispose);
  return{pause,resume,dispose};
}
