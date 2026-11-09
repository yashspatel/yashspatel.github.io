import './builder.css';
import './hybrid.css';
import './readability.css';
import { initializeMotion } from './motion.js';
import { createFallbackScene } from './scene/fallback-scene.js';
import { initializeTheme } from './theme.js';
import { createConstructionScene } from './construction/controller.js';
import { pendingProjects } from './project-data.js';
import { createPageBuilders } from './construction/page-builder.js';
import { createGuidedTour } from './experience/guided-tour.js';

initializeTheme();

const motionPreference = initializeMotion();
document.querySelector('.room-tools').prepend(document.querySelector('#lamp-toggle'));
document.querySelector('.agent-diagram').dataset.build='diagram';
document.querySelector('.preview-tags').dataset.build='preview-tags';
document.querySelector('.collaborator-dots').insertAdjacentHTML('beforeend','<i></i><i></i><i></i><i></i>');
const projectIcons={square:'<rect x="4" y="4" width="24" height="24"/><path d="M4 16h24M16 4v24"/>',route:'<path d="M7 25V9a4 4 0 0 1 8 0v14a4 4 0 0 0 8 0V7"/><path d="m19 11 4-4 4 4M3 21l4 4 4-4"/>',document:'<path d="M7 3h12l6 6v20H7zM19 3v7h6M11 16h10M11 21h7"/>'};
pendingProjects.forEach((project,index)=>{
  const article=document.createElement('article');article.className='project project-pending reveal';
  article.innerHTML=`<div class="pending-icon" aria-hidden="true"><svg viewBox="0 0 32 32">${projectIcons[project.icon]}</svg></div><div class="project-heading"><span>${String(index+3).padStart(2,'0')} / ${project.label}</span></div><h3></h3><p></p><span class="pending-state">DETAILS COMING SOON</span>`;
  article.querySelector('h3').textContent=project.title;article.querySelector('p').textContent=project.description;
  document.querySelector('#additional-projects').append(article);
});

const pageBuilders=createPageBuilders(motionPreference);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal:not(.page-build-target)').forEach(element => observer.observe(element));
document.documentElement.classList.add('js-ready');

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  mobileNav.hidden = isOpen;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

const projectNotes = {
  support: {
    title: 'JEV-Based Customer Support Automation',
    content: '<p>A support workflow built around TypeSafe AI’s JEV decision and classification model, using customer intent to connect each inquiry with the right department.</p><h3>How it works</h3><ul><li>Classifies inquiries into hierarchical categories and subcategories.</li><li>Uses calibrated probabilities to apply confidence thresholds to routing decisions.</li><li>Recommends replies using the context of past conversations.</li></ul><h3>Results reported in my resume</h3><p>80% fewer manual ticket assignments and 85% faster first response.</p><h3>Building blocks</h3><p>Python, FastAPI, TypeSafe JEV, PostgreSQL, and Pydantic.</p>'
  },
  job: {
    title: 'Job Pilot',
    content: '<p>A full-stack AI job-search agent designed to bring discovery, resume matching, and application tracking into a single workflow.</p><h3>How it works</h3><ul><li>Discovers jobs and ranks them against uploaded resumes using TF-IDF and cosine similarity.</li><li>Tracks applications so the search stays organized.</li><li>Uses AI agents with search memory to provide job-specific guidance.</li></ul><h3>Building blocks</h3><p>Python, FastAPI, React, SQLite, OAuth2, OpenAI API, and Tailwind CSS.</p><p>This is a project overview; a public live demo is not linked yet.</p>'
  }
};
const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('.detail-button').forEach(button => {
  button.addEventListener('click', () => {
    const note = projectNotes[button.dataset.project];
    document.querySelector('#dialog-title').textContent = note.title;
    document.querySelector('#dialog-content').innerHTML = note.content;
    dialogTrigger = button;
    dialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
} });
dialog.addEventListener('close', () => dialogTrigger?.focus());

document.querySelector('#copy-email').addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('yashsanjaykumarpatel@gmail.com');
    button.innerHTML = 'COPIED <span>✓</span>';
    status.textContent = 'Email address copied to clipboard.';
    setTimeout(() => { button.innerHTML = 'COPY EMAIL <span>⧉</span>'; }, 2500);
  } catch {
    status.textContent = 'Copy unavailable. Please select the email address or use the email link.';
    button.textContent = 'SELECT EMAIL ABOVE';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
const construction=createConstructionScene(document.querySelector('.build-stage'),motionPreference,{defer:true});
createGuidedTour(construction,pageBuilders,motionPreference);
import('./scene/workspace-scene.js').then(({createWorkspaceScene})=>{
  createWorkspaceScene(document.querySelector('#workspace-canvas'),motionPreference);
}).catch(()=>{
  document.body.classList.remove('before-canvas','portal-covering');
  document.querySelector('.screen-portal')?.remove();
  document.querySelector('.cinema-viewport').dataset.sceneState='fallback';
  document.querySelector('.scene-loading').classList.add('loaded');
  document.querySelector('#motion-toggle').hidden=true;
  createFallbackScene(motionPreference);
});
