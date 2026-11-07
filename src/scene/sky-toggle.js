import { getTheme,toggleTheme } from '../theme.js';

export function createSkyToggle(){
  const button=document.createElement('button');button.className='pixel-sky-toggle';
  button.innerHTML=`<svg class="pixel-moon" viewBox="0 0 32 32" aria-hidden="true"><path fill="#d9e6ff" d="M12 3h9v3h-6v3h-3v12h3v3h9v-3h3v6h-6v3H12v-3H6v-6H3V12h3V6h6z"/><path fill="#a5bde5" d="M6 18h3v6h6v3h6v3h-9v-3H6z"/><path fill="#a8dfe9" d="M25 4h3v3h3v3h-3v3h-3v-3h-3V7h3z"/></svg><svg class="pixel-sun" viewBox="0 0 32 32" aria-hidden="true"><path fill="#f6c45e" d="M11 8h10v3h3v10h-3v3H11v-3H8V11h3z"/><path fill="#ffe59a" d="M11 11h10v10H11z"/><path fill="#e7ad4b" d="M14 1h4v4h-4zm0 26h4v4h-4zM1 14h4v4H1zm26 0h4v4h-4zM4 4h4v4H4zm20 0h4v4h-4zM4 24h4v4H4zm20 0h4v4h-4z"/></svg>`;
  document.querySelector('main').append(button);
  function sync(){const night=getTheme()==='dark';button.dataset.mode=night?'night':'day';button.setAttribute('aria-label',night?'Switch to day mode':'Switch to night mode');}
  button.addEventListener('click',toggleTheme);window.addEventListener('portfolio:themechange',sync);sync();
  return {update(progress){button.hidden=progress>=.19;button.style.opacity=String(Math.max(0,Math.min(1,(.19-progress)/.06)));},dispose(){button.removeEventListener('click',toggleTheme);window.removeEventListener('portfolio:themechange',sync);button.remove()}};
}
