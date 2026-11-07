import * as THREE from 'three';
import { createVoxelCity } from './voxel-city.js';
import { createIntersection } from './intersection.js';

export function createBuildingExterior(room,factory){
  const {box,batch}=factory;
  const root=new THREE.Group();root.name='BuildingExterior';room.add(root);
  const building=new THREE.Group();root.add(building);
  const nightWindows=new THREE.Group(),dayWindows=new THREE.Group();root.add(nightWindows,dayWindows);
  // The unchanged room occupies the top floor. The camera enters its open window.
  box(building,'#30394e',0,-8.1,-.03,7.8,16.1,6.3);
  box(building,'#20283b',0,-16.3,0,8.3,.45,6.8);
  for(let floor=0;floor<5;floor++){
    const y=-1.6-floor*3.05;
    box(building,'#566078',0,y-1.25,3.2,8,.18,.25);
    for(let col=0;col<3;col++){
      const x=-2.5+col*2.5;
      box(building,'#141d2c',x,y,3.19,1.65,1.75,.12);
      const lit=(floor+col)%3!==0;
      box(nightWindows,lit?'#e2b582':'#223651',x,y,3.265,1.4,1.5,.015,lit);
      box(dayWindows,'#688aa8',x,y,3.265,1.4,1.5,.015);
      box(building,'#3f4d65',x,y,3.29,.045,1.62,.05);
      box(building,'#3f4d65',x,y,3.29,1.52,.045,.05);
      box(building,'#657084',x,y-.88,3.35,1.85,.12,.4);
    }
    for(let col=0;col<3;col++){
      const z=-2+col*2;
      box(building,'#182332',3.94,y,z,.04,1.7,1.2);
      box(nightWindows,'#759eab',3.97,y,z,.015,1.4,1,true);
      box(dayWindows,'#7193ad',3.97,y,z,.015,1.4,1);
    }
  }
  // Top floor repeats the same three-window rhythm and dimensions below it.
  box(building,'#354057',0,2.05,3.08,7.8,4.25,.24);
  for(let col=0;col<3;col++){
    const x=-2.5+col*2.5;
    box(building,'#141d2c',x,2.8,3.19,1.65,1.75,.12);
    box(nightWindows,col===1?'#e2b582':'#759eab',x,2.8,3.265,1.4,1.5,.015,true);
    box(dayWindows,'#688aa8',x,2.8,3.265,1.4,1.5,.015);
    box(building,'#3f4d65',x,2.8,3.29,.045,1.62,.05);
    box(building,'#3f4d65',x,2.8,3.29,1.52,.045,.05);
    box(building,'#657084',x,1.92,3.35,1.85,.12,.4);
  }
  for(const z of [-1.875,1.875])box(building,'#354057',3.82,2.05,z,.24,4.25,2.55);
  box(building,'#354057',3.82,.925,0,.24,2.05,1.2);
  box(building,'#354057',3.82,3.9125,0,.24,.525,1.2);
  // Two closed windows flank the working-room entry window on the right side.
  for(const z of [-2,2]){
    box(building,'#182332',3.94,2.8,z,.04,1.7,1.2);
    box(nightWindows,'#759eab',3.97,2.8,z,.015,1.4,1,true);
    box(dayWindows,'#7193ad',3.97,2.8,z,.015,1.4,1);
  }
  for(const z of [-.6,.6])box(building,'#3f4d65',3.98,2.8,z,.08,1.7,.055);
  for(const y of [1.95,3.65])box(building,'#3f4d65',3.98,y,0,.08,.055,1.2);
  box(building,'#657084',4.1,1.9,0,.3,.1,1.35);
  const sash=new THREE.Group();sash.name='TopFloorWindowSash';sash.position.set(4.015,2.8,-.55);root.add(sash);
  for(const z of [0,1.1])box(sash,'#53647e',0,0,z,.05,1.6,.045);
  for(const y of [-.8,.8])box(sash,'#53647e',0,y,.55,.05,.045,1.1);
  box(sash,'#53647e',0,0,.55,.045,1.6,.035);
  box(sash,'#53647e',0,0,.55,.045,.035,1.1);
  box(sash,'silver',-.045,-.1,1.01,.045,.16,.035);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.55),new THREE.MeshBasicMaterial({color:'#94c9e2',transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));
  glass.position.set(.005,0,.55);glass.rotation.y=Math.PI/2;sash.add(glass);batch(sash);
  box(building,'#283248',0,4.3,0,8.3,.26,6.8);
  box(building,'#56627a',0,4.48,0,8.55,.12,7.05);
  for(const x of [-3.85,3.85])box(building,'#68758a',x,4.7,0,.14,.42,6.9);
  box(building,'#657087',-1.9,4.85,-1.2,1.3,.65,1.35);
  for(let i=0;i<6;i++)box(building,'#303a4b',-2.38+i*.19,5.19,-1.2,.08,.025,1.08);
  box(building,'#75859a',2.5,5.5,-1.6,.07,2.05,.07);
  box(building,'#75859a',2.5,6.2,-1.6,1.15,.055,.055);
  box(building,'#e58e8e',2.5,6.55,-1.6,.09,.09,.09,true);
  createVoxelCity(root,nightWindows,dayWindows,factory);
  const traffic=createIntersection(root,factory);
  batch(building);batch(nightWindows);batch(dayWindows);
  root.traverse(o=>{if(o.isMesh){o.castShadow=false;}});
  return {root,nightWindows,dayWindows,traffic,update(progress){root.visible=progress<.36;sash.rotation.y=-Math.PI*.56*THREE.MathUtils.smoothstep(progress,.16,.285);}};
}
