// Honor the device preference while letting visitors explicitly opt into motion.
export function initializeMotion(){
  const system=matchMedia('(prefers-reduced-motion: reduce)');
  let choice=null;try{choice=localStorage.getItem('yash-motion')}catch{}
  const preference=new EventTarget();
  function refresh(){
    preference.matches=choice==='full'?false:choice==='reduced'?true:system.matches;
    document.documentElement.dataset.motion=preference.matches?'reduced':'full';
  }
  refresh();
  const button=document.createElement('button');button.id='motion-preference';button.type='button';
  function paint(){button.textContent=preference.matches?'Enable animations':'Reduce motion';button.setAttribute('aria-label',button.textContent);button.classList.toggle('motion-opt-in',preference.matches)}
  button.addEventListener('click',()=>{choice=preference.matches?'full':'reduced';try{localStorage.setItem('yash-motion',choice)}catch{}location.reload()});
  document.querySelector('.journey-controls').append(button);paint();
  system.addEventListener('change',()=>{refresh();paint();preference.dispatchEvent(new Event('change'))});
  return preference;
}
