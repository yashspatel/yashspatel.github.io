const STORAGE_KEY='yash-portfolio-theme';
export function getTheme(){return document.documentElement.dataset.theme==='light'?'light':'dark'}
export function setTheme(theme,persist=true){
  const next=theme==='light'?'light':'dark';
  document.documentElement.dataset.theme=next;
  document.querySelector('meta[name="theme-color"]').content=next==='light'?'#f0ede7':'#09090b';
  const button=document.querySelector('#lamp-toggle');
  const on=next==='dark';
  document.documentElement.dataset.timeOfDay=on?'night':'day';
  button?.setAttribute('aria-pressed',String(on));
  button?.setAttribute('aria-label',on?'Turn lamp off - switch to daytime':'Turn lamp on - switch to nighttime');
  if(button)button.querySelector('span').textContent=on?'LAMP ON':'LAMP OFF';
  if(persist){try{localStorage.setItem(STORAGE_KEY,next)}catch{/* The toggle still works when browser storage is unavailable. */}}
  window.dispatchEvent(new CustomEvent('portfolio:themechange',{detail:{theme:next}}));
}
export function toggleTheme(){setTheme(getTheme()==='dark'?'light':'dark')}
export function initializeTheme(){
  setTheme(getTheme(),false);
  document.querySelector('#lamp-toggle').addEventListener('click',toggleTheme);
  window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY)setTheme(event.newValue,false)});
}
