import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createWorkspace } from './workspace.js';
import { applyCameraPath } from './camera-path.js';
import { sceneConfig } from './config.js';
import { createScreenPortal } from './screen-portal.js';
import { createLampTheme } from './lamp-theme.js';
import { toggleTheme,getTheme } from '../theme.js';
import { createSkyToggle } from './sky-toggle.js';

gsap.registerPlugin(ScrollTrigger);

export function createWorkspaceScene(canvas,motionPreference) {
  const viewport=document.querySelector('.cinema-viewport');
  const loading=document.querySelector('.scene-loading');
  const loadingText=document.querySelector('#scene-loading-text');
  const motionButton=document.querySelector('#motion-toggle');
  const destination=document.querySelector('#agent-workspace');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'})}
  catch{viewport.dataset.sceneState='fallback';loading.classList.add('loaded');motionButton.hidden=true;return;}
  renderer.setClearColor(0x0c0d16);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=innerWidth>700&&sceneConfig.shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#0c0d16');scene.fog=new THREE.FogExp2('#0c0d16',.018);
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.025,400);
  let mobile=innerWidth<=700;
  const workspace=createWorkspace(scene,mobile);
  const portal=createScreenPortal(workspace.portalTarget,camera);
  const skyToggle=createSkyToggle();
  const outsideDay=new THREE.Color('#b4d9ed'),outsideNight=new THREE.Color('#0c0d16'),insideDay=new THREE.Color('#eeeae2'),skyColor=new THREE.Color();
  const pointer=new THREE.Vector2(),smoothedPointer=new THREE.Vector2();
  const lampPointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();
  const driver={progress:0};
  let clock=0,previous=0,paused=false,pausedProgress=0,lost=false,disposed=false,frames=0;
  let tween,landing=innerHeight*2;
  function measureLanding(){landing=destination.getBoundingClientRect().top+scrollY;return landing}
  function update(){
    const p=driver.progress;
    viewport.style.opacity=String(motionPreference.matches ? .48 : 1-THREE.MathUtils.smoothstep(p,.696,.6995));
    document.body.style.setProperty('--monitor-approach',String(THREE.MathUtils.smoothstep(p,.48,.57)));
    document.body.classList.toggle('inside-screen',p>=.698);
    document.body.classList.toggle('before-canvas',p<.6995&&!motionPreference.matches);
    canvas.dataset.progress=p.toFixed(4);
    workspace.screens.setTaskProgress(p);
    if(p>=.6995||paused||motionPreference.matches)portal.hide();
    syncLoop();
  }
  function render(delta=0){
    if(disposed||lost)return;
    const still=paused||motionPreference.matches;
    if(!still)clock+=delta;
    const p=motionPreference.matches?0:paused?pausedProgress:driver.progress;
    smoothedPointer.lerp(pointer,still?1:1-Math.exp(-delta*4));
    applyCameraPath(camera,p,mobile,smoothedPointer,still);
    skyToggle.update(p);
    const dayMix=workspace.dayMix??(getTheme()==='light'?1:0);
    skyColor.copy(outsideDay).lerp(insideDay,THREE.MathUtils.smoothstep(p,.23,.36));
    scene.background.copy(outsideNight).lerp(skyColor,dayMix);scene.fog.color.copy(scene.background);
    workspace.exterior.update(p);scene.fog.density=THREE.MathUtils.lerp(.011,.018,THREE.MathUtils.smoothstep(p,.23,.36));
    portal.alignCamera(p,!still);workspace.mainMonitor.scale.x=workspace.portalTarget.scale.x;portal.update(p,!still);
    workspace.animate(clock,delta,still);renderer.render(scene,camera);frames++;
    canvas.dataset.frames=String(frames);canvas.dataset.camera=camera.position.toArray().map(v=>v.toFixed(3)).join(',');
  }
  function animate(now){
    if(motionPreference.matches){render(0);syncLoop();return;}
    const delta=previous?Math.min((now-previous)/1000,.05):.016;previous=now;render(delta);
  }
  function syncLoop(){
    if(disposed||lost)return;
    motionButton.disabled=motionPreference.matches;
    const active=!document.hidden&&!paused&&!motionPreference.matches&&driver.progress<.6995;
    renderer.setAnimationLoop(active?animate:null);if(!active)previous=0;
  }
  function measure(){
    mobile=innerWidth<=700;workspace.resizeDevice();measureLanding();
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?sceneConfig.mobilePixelRatio:sceneConfig.maxPixelRatio));
    renderer.setSize(innerWidth,innerHeight,false);renderer.shadowMap.needsUpdate=true;
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();portal.resize();
    update();render(0);
  }
  function setupScroll(){
    tween?.scrollTrigger?.kill();tween?.kill();measureLanding();driver.progress=0;
    tween=gsap.to(driver,{progress:.7,ease:'none',scrollTrigger:{start:0,end:measureLanding,scrub:true,invalidateOnRefresh:true,onRefresh:measureLanding},onUpdate:update});
    ScrollTrigger.refresh();driver.progress=Math.min(.7,scrollY/Math.max(1,landing)*.7);update();
  }
  function toggle(){
    if(!paused)pausedProgress=driver.progress;paused=!paused;
    motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',`${paused?'Play':'Pause'} scene animation`);
    motionButton.textContent=paused?'▷':'Ⅱ';update();render(0);syncLoop();
  }
  function lampHit(event){
    if(lost||driver.progress>.4||event.target.closest('a,button,dialog,.delegation-copy,.section'))return false;
    lampPointer.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2);
    camera.updateMatrixWorld();workspace.lamp.updateWorldMatrix(true,true);raycaster.setFromCamera(lampPointer,camera);
    return raycaster.intersectObject(workspace.lamp,true).length>0;
  }
  function onPointer(event){document.body.classList.toggle('lamp-hover',lampHit(event));if(!mobile&&!paused&&!motionPreference.matches)pointer.set(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1)}
  function onLampClick(event){if(lampHit(event))toggleTheme()}
  function onMotion(){setupScroll();measure();syncLoop()}
  function visibility(){previous=0;syncLoop()}
  function onLost(event){event.preventDefault();lost=true;renderer.setAnimationLoop(null);portal.hide();document.body.classList.remove('before-canvas');viewport.dataset.sceneState='fallback';}
  function onRestored(){lost=false;viewport.dataset.sceneState='ready';measure();syncLoop()}
  window.addEventListener('resize',measure);window.addEventListener('pointermove',onPointer,{passive:true});window.addEventListener('click',onLampClick);
  document.addEventListener('visibilitychange',visibility);motionPreference.addEventListener('change',onMotion);
  motionButton.addEventListener('click',toggle);canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
  measure();setupScroll();render(0);
  const lampTheme=createLampTheme(scene,workspace,renderer,render,motionPreference);
  viewport.dataset.sceneState='ready';viewport.dataset.character=sceneConfig.character.url?'custom':'temporary-voxel';
  loadingText.textContent='WORKSPACE READY';loading.classList.add('loaded');syncLoop();
  document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
  function dispose(){
    disposed=true;renderer.setAnimationLoop(null);tween?.scrollTrigger?.kill();tween?.kill();lampTheme.dispose();
    window.removeEventListener('resize',measure);window.removeEventListener('pointermove',onPointer);window.removeEventListener('click',onLampClick);
    document.removeEventListener('visibilitychange',visibility);motionPreference.removeEventListener('change',onMotion);motionButton.removeEventListener('click',toggle);
    canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
    skyToggle.dispose();portal.dispose();workspace.dispose();const textures=new Set();
    scene.traverse(object=>{object.geometry?.dispose();if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value)});material.dispose()})});
    textures.forEach(texture=>texture.dispose());renderer.dispose();
  }
  if(import.meta.hot)import.meta.hot.dispose(dispose);
  return{dispose};
}
