import { createVisibleBuilder } from './visible-builder.js';

export function createPageBuilders(motionPreference){
  document.querySelectorAll('.section .reveal').forEach(element=>{element.classList.add('visible');element.classList.remove('reveal')});
  const selectors=[
    '.section-eyebrow','.about-copy h2','.about-copy>p','.about-copy>.text-link','.about-photo',
    '.work .section-heading','.project-art','.project>.project-heading','.project>h3','.project>p','.project>.tags',
    '.pending-icon','.pending-state','.project-note','.skills-layout>h2','.skill-groups>div',
    '.experience>h2','.experience-row','.education','.contact-heading','.contact-bottom','.contact-socials',
  ].join(',');
  const engine=createVisibleBuilder(document.querySelectorAll(selectors),motionPreference,{enabled:false});
  if(import.meta.hot)import.meta.hot.dispose(engine.dispose);
  return engine;
}
