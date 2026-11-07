import * as THREE from 'three';
import { getDevicePreview } from './device-preview.js';

// Project the real next section onto the monitor, then flatten it into the page.
// The duplicate is inert; the original remains the accessible, interactive content.
export function createScreenPortal(monitor,camera) {
  const source=document.querySelector('#agent-workspace');
  const portal=document.createElement('div');
  portal.className='screen-portal';portal.setAttribute('aria-hidden','true');portal.inert=true;
  function copyCanvas(){
    const copy=source.cloneNode(true);
    copy.removeAttribute('id');copy.removeAttribute('aria-labelledby');copy.classList.add('portal-work');
    copy.querySelectorAll('.virtual-cursor').forEach(element=>element.remove());
    copy.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
    copy.querySelectorAll('a,button').forEach(element=>element.setAttribute('tabindex','-1'));
    copy.querySelectorAll('[data-project]').forEach(element=>element.removeAttribute('data-project'));
    copy.querySelectorAll('.reveal').forEach(element=>element.classList.add('visible'));
    return copy;
  }
  let preview=copyCanvas();
  portal.append(preview);document.querySelector('main').append(portal);
  // Reverse scrolling shows the current completed site, not the original empty canvas.
  const mirror=new MutationObserver(()=>{const next=copyCanvas();preview.replaceWith(next);preview=next;});
  mirror.observe(source,{attributes:true,attributeFilter:['data-construction']});
  const local=[[-.86,.54,.061],[.86,.54,.061],[.86,-.54,.061],[-.86,-.54,.061]];
  const projected=local.map(()=>new THREE.Vector3());
  const corners=local.map(()=>({x:0,y:0}));
  const flat=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];
  let width=innerWidth,height=innerHeight,device=getDevicePreview();
  const center=new THREE.Vector3(),normal=new THREE.Vector3(),landingPosition=new THREE.Vector3();
  const landingCamera=new THREE.PerspectiveCamera();
  function resize(){width=innerWidth;height=innerHeight;device=getDevicePreview(width,height);
    const halfW=device.width/2,halfH=device.height/2;
    [[-halfW,halfH+device.y,.061],[halfW,halfH+device.y,.061],[halfW,-halfH+device.y,.061],[-halfW,-halfH+device.y,.061]].forEach((point,i)=>{local[i]=point});
    portal.dataset.device=device.mode;
    portal.dataset.previewAspect=String(device.width/device.height);
    portal.style.width=`${width}px`;portal.style.height=`${height}px`;}
  function hide(){portal.style.visibility='hidden';document.body.classList.remove('portal-covering');}
  function alignCamera(progress,enabled) {
    const approach=enabled?THREE.MathUtils.smoothstep(progress,.59,.68)*(1-THREE.MathUtils.smoothstep(progress,.9,.97)):0;
    // Match the screen's aspect to the device during the close-up, so the landing
    // has the same proportions on a portrait phone and a widescreen monitor.
    monitor.scale.x=device.mode==='desktop'?THREE.MathUtils.lerp(1,(width/height)/(1.72/1.08),approach):1;
    monitor.updateWorldMatrix(true,false);
    if(!enabled||progress<.59||progress>.7)return;
    center.set(0,device.y,.061).applyMatrix4(monitor.matrixWorld);
    normal.set(0,0,1).transformDirection(monitor.matrixWorld);
    const distance=(device.height/2)/Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    landingPosition.copy(center).addScaledVector(normal,distance);
    landingCamera.position.copy(landingPosition);landingCamera.lookAt(center);
    camera.position.lerp(landingPosition,approach);
    camera.quaternion.slerp(landingCamera.quaternion,approach);
    camera.updateMatrixWorld();
  }
  function update(progress,enabled) {
    if(!enabled||progress<.55||progress>=.6995){hide();return;}
    camera.updateMatrixWorld();monitor.updateWorldMatrix(true,false);
    const flatten=THREE.MathUtils.smoothstep(progress,.68,.696);
    local.forEach((point,i)=>{
      projected[i].fromArray(point).applyMatrix4(monitor.matrixWorld).project(camera);
      corners[i].x=THREE.MathUtils.lerp((projected[i].x+1)*width/2,flat[i].x*width,flatten);
      corners[i].y=THREE.MathUtils.lerp((1-projected[i].y)*height/2,flat[i].y*height,flatten);
    });
    // Homography maps the viewport rectangle to the four perspective screen corners.
    const [a,b,c,d]=corners;
    const dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x;
    const dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y;
    const denominator=dx1*dy2-dx2*dy1;
    const g=Math.abs(denominator)<1e-8?0:(dx3*dy2-dx2*dy3)/denominator;
    const h=Math.abs(denominator)<1e-8?0:(dx1*dy3-dx3*dy1)/denominator;
    const matrix=[(b.x-a.x+g*b.x)/width,(b.y-a.y+g*b.y)/width,0,g/width,
      (d.x-a.x+h*d.x)/height,(d.y-a.y+h*d.y)/height,0,h/height,
      0,0,1,0,a.x,a.y,0,1];
    portal.style.transform=`matrix3d(${matrix.join(',')})`;
    portal.style.opacity=String(THREE.MathUtils.smoothstep(progress,.55,.585));
    portal.style.visibility='visible';
    document.body.classList.add('portal-covering');
    portal.dataset.flatten=flatten.toFixed(4);
  }
  resize();
  return {alignCamera,update,resize,hide,dispose(){mirror.disconnect();hide();portal.remove()}};
}
