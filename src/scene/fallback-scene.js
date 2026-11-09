// A lightweight scroll-linked zoom remains available without a graphics context.
export function createFallbackScene(motionPreference){
  const viewport=document.querySelector('.cinema-viewport');
  const picture=viewport.querySelector('.workspace-fallback');
  const destination=document.querySelector('#agent-workspace');
  viewport.dataset.sceneState='fallback';viewport.dataset.renderer='2d';
  document.querySelector('.scene-loading').classList.add('loaded');
  let frame=0;
  function render(){
    frame=0;
    const landing=destination.getBoundingClientRect().top+scrollY;
    const progress=Math.min(1,Math.max(0,scrollY/Math.max(1,landing)));
    const moving=!motionPreference.matches;
    const zoom=Math.max(0,(progress-.3)/.7);
    picture.style.transformOrigin='58% 45%';
    picture.style.transform=`scale(${moving?1+zoom*3:1})`;
    viewport.style.opacity=String(moving?1-Math.max(0,(progress-.88)/.12):.48);
    document.body.classList.toggle('before-canvas',moving&&progress<1);
    viewport.dataset.fallbackProgress=progress.toFixed(3);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(render)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);motionPreference.addEventListener('change',schedule);render();
  function dispose(){cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);motionPreference.removeEventListener('change',schedule)}
  if(import.meta.hot)import.meta.hot.dispose(dispose);
  return {dispose};
}
