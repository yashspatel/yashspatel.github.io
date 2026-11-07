import * as THREE from 'three';
import { gsap } from 'gsap';
import { getTheme } from '../theme.js';

export function createLampTheme(scene,workspace,renderer,render,motionPreference) {
  const state={mix:getTheme()==='light'?1:0};
  const backgroundDark=new THREE.Color('#0c0d16'),backgroundLight=new THREE.Color('#eeeae2');
  const skyDark=new THREE.Color(0xabb6ed),skyLight=new THREE.Color('#fff2dd');
  const groundDark=new THREE.Color(0x302234),groundLight=new THREE.Color('#9890a4');
  const lightColors={'1a1c30':'#d2cfdb','292b47':'#b4afc2','22243c':'#bdb7c7','151625':'#b6acbd','272b44':'#c6bfce','23273e':'#beb6c9','11131e':'#353d50','090b13':'#2c3443'};
  const materials=new Map();
  workspace.room.traverse(object=>{
    if(!object.isMesh)return;
    const entries=Array.isArray(object.material)?object.material:[object.material];
    entries.forEach(material=>{
      if(!material.color||material.map||material.emissive?.getHex()||materials.has(material))return;
      const original=material.color.clone();
      const target=lightColors[original.getHexString()]?new THREE.Color(lightColors[original.getHexString()]):original.clone().lerp(backgroundLight,.1);
      materials.set(material,{original,target});
    });
  });
  function apply(){
    workspace.dayMix=state.mix;
    scene.background.copy(backgroundDark).lerp(backgroundLight,state.mix);scene.fog.color.copy(scene.background);
    renderer.setClearColor(scene.background);
    workspace.ambient.color.copy(skyDark).lerp(skyLight,state.mix);
    workspace.ambient.groundColor.copy(groundDark).lerp(groundLight,state.mix);
    workspace.ambient.intensity=THREE.MathUtils.lerp(1.5,2.2,state.mix);
    workspace.warm.intensity=(1-state.mix)*8;
    workspace.lampGlow.material.emissiveIntensity=(1-state.mix)*2.2;
    workspace.lampGlow.material.color.set(state.mix<.5?'#efc8a0':'#726778');
    materials.forEach(({original,target},material)=>material.color.copy(original).lerp(target,state.mix));
    workspace.exterior.nightWindows.visible=state.mix<.5;workspace.exterior.dayWindows.visible=state.mix>=.5;
    document.querySelector('.cinema-viewport').dataset.window=state.mix<.5?'night':'day';
    document.querySelector('.cinema-viewport').dataset.lamp=state.mix<.5?'on':'off';
    render(0);
  }
  let tween;
  function onChange(){
    tween?.kill();
    tween=gsap.to(state,{mix:getTheme()==='light'?1:0,duration:motionPreference.matches?0:.7,ease:'power2.inOut',onUpdate:apply});
  }
  window.addEventListener('portfolio:themechange',onChange);apply();
  return{dispose(){tween?.kill();window.removeEventListener('portfolio:themechange',onChange)}};
}
