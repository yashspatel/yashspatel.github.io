import * as THREE from 'three';

// One continuous, reversible camera track: room → shoulder → monitor → room.
const exteriorTrack=[
  {p:0,position:[34,10,23],target:[0,-6.5,0],fov:46},
  {p:.11,position:[21,7,12],target:[.4,-1.8,.2],fov:42},
  {p:.21,position:[10,4.1,1.6],target:[3.82,2.8,0],fov:43},
  {p:.28,position:[5.1,2.8,0],target:[-.4,2.2,-.4],fov:45},
  {p:.34,position:[2.7,2.85,0],target:[-.2,2,-.7],fov:47},
  {p:.4,position:[1.9,3.1,2.8],target:[-.25,2.14,-.8],fov:44},
];
const desktop=[
  ...exteriorTrack,
  {p:.45,position:[1.9,3.1,2.8],target:[-.25,2.14,-.8],fov:42},
  {p:.59,position:[.67,2.64,.72],target:[.45,2.42,-.97],fov:42},
  {p:.7,position:[.37,2.42,.49],target:[.45,2.42,-.97],fov:48},
  {p:.9,position:[.37,2.42,.49],target:[.45,2.42,-.97],fov:48},
  {p:1,position:[9.8,7.2,11],target:[-.2,1.9,0],fov:40},
];
const mobile=desktop.map(key=>({...key}));
mobile[0]={p:0,position:[46,9,16],target:[0,-6.5,0],fov:49};
mobile[1]={p:.11,position:[29,6,9],target:[0,-1.8,0],fov:49};
mobile[2]={p:.21,position:[13,3.8,1.8],target:[3.82,2.8,0],fov:49};
mobile[3]={p:.28,position:[5.6,2.8,0],target:[-.4,2.2,-.4],fov:52};
mobile[5]={p:.4,position:[2.8,4.1,9.5],target:[.1,2.1,.1],fov:48};
mobile[6]={p:.45,position:[2.8,4.1,9.5],target:[.1,2.1,.1],fov:48};
mobile.splice(7,0,{p:.53,position:[2.8,4.1,9.5],target:[.1,2.1,.1],fov:48});
mobile[8]={p:.59,position:[1.38,2.8,3.1],target:[1.38,2.65,.48],fov:48};
const tablet=desktop.map(key=>({...key}));
tablet[0]={p:0,position:[39,11,21],target:[0,-6.5,0],fov:46};
tablet[1]={p:.11,position:[25,7,11],target:[0,-1.8,0],fov:46};
const pos=new THREE.Vector3(),look=new THREE.Vector3(),endPos=new THREE.Vector3(),endLook=new THREE.Vector3();
export function applyCameraPath(camera,progress,isMobile,pointer,still=false) {
  const path=isMobile?mobile:innerWidth<=1100?tablet:desktop;
  const p=THREE.MathUtils.clamp(progress,0,1);
  let i=path.findIndex((key,index)=>index<path.length-1&&p<=path[index+1].p);
  if(i<0)i=path.length-2;
  const a=path[i],b=path[i+1];
  let t=THREE.MathUtils.clamp((p-a.p)/(b.p-a.p),0,1);
  t=t*t*(3-2*t);
  pos.fromArray(a.position).lerp(endPos.fromArray(b.position),t);
  look.fromArray(a.target).lerp(endLook.fromArray(b.target),t);
  const parallax=still||isMobile?0:(1-THREE.MathUtils.smoothstep(p,.3,.6))*.14;
  pos.x+=pointer.x*parallax;pos.y-=pointer.y*parallax*.5;
  camera.position.copy(pos);camera.lookAt(look);
  const fov=THREE.MathUtils.lerp(a.fov,b.fov,t);
  if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix()}
}
