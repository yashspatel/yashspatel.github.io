import * as THREE from 'three';
import { createBoxFactory } from './geometry.js';
import { createVoxelCharacter } from './voxel-character.js';
import { createScreens } from './screens.js';
import { getDevicePreview } from './device-preview.js';
import { sceneConfig } from './config.js';
import { createBuildingExterior } from './building-exterior.js';

export function createWorkspace(scene, mobile) {
  const factory=createBoxFactory(), {box,batch}=factory;
  const room=new THREE.Group(); room.name='VoxelWorkspace'; scene.add(room);
  const architecture=new THREE.Group();room.add(architecture);
  const props=new THREE.Group();room.add(props);
  const screens=createScreens();
  const emissive=[];
  // A little cutaway room, with stepped trim and individual floorboards.
  box(architecture,'floorEdge',0,-.22,0,7.6,.45,6.2);
  box(architecture,'floor',0,.015,0,7.3,.06,5.9);
  for(let x=-7;x<=7;x++)for(let z=-3;z<=3;z++) {
    box(architecture,(x+z)%3===0?'#272b44':'#23273e',x*.48,.058,z*.82+(x%2)*.2,.465,.025,.795);
  }
  box(architecture,'wall',0,2,-2.95,7.6,4.3,.2);
  box(architecture,'wall',-3.7,2,0,.2,4.3,6.1);
  box(architecture,'wallEdge',0,.2,-2.8,7.3,.23,.12);
  box(architecture,'wallEdge',-3.55,.2,0,.12,.23,5.9);
  box(architecture,'wallEdge',0,4.15,-2.84,7.6,.11,.18);
  box(architecture,'wallEdge',-3.6,4.15,0,.18,.11,6.1);
  box(architecture,'violet',-.4,.18,-2.72,6.2,.025,.025,true);
  box(architecture,'cyan',-3.48,.18,0,.025,.025,5.6,true);

  // A physical LED pixel sign: raised square glyphs on a framed metal panel.
  const wallSign=new THREE.Group();wallSign.name='YashWallDecor';
  wallSign.position.set(-3.49,2.93,.55);wallSign.rotation.y=Math.PI/2;props.add(wallSign);
  box(wallSign,'metal',0,0,-.055,3.7,1.52,.09);
  box(wallSign,'black',0,0,.002,3.56,1.38,.04);
  box(wallSign,'#232940',0,0,.025,3.42,1.24,.015);
  for(const x of [-1.76,1.76])for(const y of [-.67,.67])box(wallSign,'silver',x,y,.025,.045,.045,.018);
  const pixelGlyphs={
    A:['01110','10001','10001','11111','10001','10001','10001'],
    Y:['10001','10001','01010','00100','00100','00100','00100'],
    S:['01111','10000','10000','01110','00001','00001','11110'],
    H:['10001','10001','10001','11111','10001','10001','10001'],
    E:['11111','10000','10000','11110','10000','10000','11111'],
    R:['11110','10001','10001','11110','10100','10010','10001'],
    I:['11111','00100','00100','00100','00100','00100','11111'],
    N:['10001','11001','11001','10101','10011','10011','10001'],
    G:['01110','10001','10000','10111','10001','10001','01110'],
    '.':['00000','00000','00000','00000','00000','00110','00110'],
    ' ':['00000','00000','00000','00000','00000','00000','00000'],
  };
  function pixelLettering(text,y,pitch,color){
    const width=(text.length*6-1)*pitch;
    [...text].forEach((letter,index)=>pixelGlyphs[letter].forEach((row,line)=>[...row].forEach((pixel,column)=>{
      if(pixel==='1')box(wallSign,color,-width/2+(index*6+column+.5)*pitch,y+(3-line)*pitch,.055,pitch*.82,pitch*.82,.035,true);
    })));
  }
  pixelLettering('YASH HERE...',.22,.044,'violet');
  pixelLettering('AI ENGINEER',-.22,.031,'cyan');
  // A small power indicator and a concealed lead make it part of the desk setup.
  box(wallSign,'greenLight',1.52,-.52,.05,.045,.045,.022,true);
  box(wallSign,'metal',-.07,-.52,.035,1.5,.012,.012);
  box(wallSign,'black',1.69,-.98,-.065,.025,.5,.025);

  const exterior=createBuildingExterior(room,factory);
  // Wall shelves, a voxel neon monogram, and a little framed poster.
  box(props,'wood',-1.85,3.22,-2.55,2.45,.13,.52);
  for(let i=0;i<8;i++)box(props,['blue','paper','violet','terra','green'][i%5],-2.75+i*.18,3.46+(i%3)*.035,-2.52,.13,.35+(i%3)*.07,.24);
  box(props,'black',-2.65,2.3,-2.69,.8,.95,.09);
  box(props,'#c9c7c2',-2.65,2.3,-2.63,.69,.84,.04);
  // Pixel mountain on the print, modeled in actual relief.
  for(let x=-3;x<=3;x++)for(let y=0;y<4-Math.abs(x);y++)box(props,y>1?'#7b799b':'#476376',-2.65+x*.075,2.04+y*.09,-2.59,.077,.092,.025);
  box(props,'yellow',-2.47,2.53,-2.59,.11,.11,.025);
  const glyphs=['10001101110','01010101001','00100101110','00100101000','00100101000'];
  glyphs.forEach((row,y)=>[...row].forEach((pixel,x)=>{if(pixel==='1')box(props,'cyan',-1.55+x*.095,2.65-y*.095,-2.64,.071,.071,.04,true)}));

  // Wide desk with visible wood layers, metal legs, drawers, and cable tray.
  box(props,'wood',-.05,1.52,-.5,4.35,.17,1.65);
  box(props,'woodTop',-.05,1.62,-.5,4.4,.055,1.69);
  box(props,'dark',-.05,1.48,-.5,4.24,.035,1.55);
  for(const x of [-1.98,1.9]) {
    for(const z of [-1.12,.12])box(props,'metal',x,.77,z,.1,1.45,.1);
    box(props,'dark',x,.09,-.5,.27,.09,1.55);
    box(props,'metal',x,.35,-.5,.065,.07,1.3);
  }
  box(props,'dark',-.1,1.35,-1.02,2.6,.12,.28);
  box(props,'#4b4d64',1.35,1.0,-.65,.7,.9,.88);
  for(let i=0;i<3;i++) {
    box(props,'#55586e',1.35,.73+i*.27,-.18,.65,.24,.04);
    box(props,'silver',1.35,.76+i*.27,-.15,.22,.025,.025);
  }
  box(props,'#171c31',-.35,1.663,-.12,1.95,.025,.65);
  box(props,'cyan',-.35,1.665,.21,1.94,.008,.012,true);

  function monitor(x,y,z,width,height,texture,rotation=0) {
    const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;props.add(group);
    box(group,'dark',0,0,0,width+.13,height+.13,.1);
    box(group,'metal',0,-height/2-.07,.025,width+.06,.025,.05);
    box(group,'metal',0,-height/2-.22,-.025,.08,.36,.09);
    box(group,'dark',0,-height/2-.39,.05,.58,.055,.31);
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
    screen.position.z=.057;group.add(screen);
    box(group,'cyan',width/2-.06,-height/2-.04,.06,.025,.012,.008,true);
    return group;
  }
  const mainMonitor=monitor(.45,2.42,-.98,1.72,1.08,screens.texture,-.06);
  monitor(-1.24,2.31,-.87,1.4,.78,screens.sideTexture,.22);

  // Separate pixel phone simulator beside the character; its screen is the mobile portal.
  const phone=new THREE.Group();phone.name='MobileSimulator';phone.position.set(1.38,2.65,.48);room.add(phone);
  const phoneFrame=new THREE.Mesh(new THREE.BoxGeometry(1,1,.11),new THREE.MeshStandardMaterial({color:'#252a42',roughness:.65}));phone.add(phoneFrame);
  const phoneScreen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:screens.phoneTexture,toneMapped:false}));phoneScreen.position.z=.057;phone.add(phoneScreen);
  const phoneCamera=new THREE.Mesh(new THREE.BoxGeometry(.12,.025,.01),new THREE.MeshBasicMaterial({color:'#070913'}));phoneCamera.position.z=.064;phone.add(phoneCamera);
  function resizeDevice(){
    const device=getDevicePreview();phone.visible=device.mode==='mobile';
    if(phone.visible){phoneFrame.scale.set(device.width+.10,device.height+.15,1);phoneScreen.scale.set(device.width,device.height,1);phoneCamera.position.y=device.height/2+.035;}
  }
  resizeDevice();
  const portalTarget=new THREE.Group();room.add(portalTarget);
  function syncPortalTarget(){
    const target=innerWidth<=700?phone:mainMonitor;
    portalTarget.position.copy(target.position);portalTarget.quaternion.copy(target.quaternion);
  }
  syncPortalTarget();

  // Keyboard, individual keys, mouse, notebook, mug, and a tiny desk speaker.
  box(props,'black',-.38,1.71,-.02,.98,.055,.33);
  for(let row=0;row<4;row++)for(let col=0;col<14;col++){
    box(props,(col+row)%11===0?'cyan':(col+row)%7===0?'violet':'#8b92a9',-.825+col*.068,1.746,-.14+row*.073,.052,.02,.055,(col+row)%11===0);
  }
  box(props,'silver',-.38,1.75,.145,.38,.025,.04);
  box(props,'#7b8198',.47,1.72,.01,.16,.09,.25);
  box(props,'cyan',.47,1.77,-.035,.015,.012,.065,true);
  box(props,'blue',-1.55,1.68,.02,.4,.05,.4);
  box(props,'paper',-1.55,1.72,.02,.36,.025,.36);
  box(props,'yellow',-1.49,1.74,.02,.025,.015,.24).rotation.y=.3;
  const mug=new THREE.Group();mug.name='DeskMug';mug.position.set(1.36,1.66,-.08);props.add(mug);
  box(mug,'paper',0,.025,0,.21,.05,.21);
  box(mug,'paper',0,.18,0,.24,.27,.24);
  box(mug,'#332b31',0,.319,0,.185,.012,.185);
  for(const side of [-1,1]){
    box(mug,'paper',side*.112,.33,0,.025,.025,.245);
    box(mug,'paper',0,.33,side*.112,.2,.025,.025);
  }
  box(mug,'paper',.18,.26,0,.14,.045,.065);
  box(mug,'paper',.18,.095,0,.14,.045,.065);
  box(mug,'paper',.24,.177,0,.045,.21,.065);
  box(mug,'#7194a4',0,.17,.125,.09,.07,.012);
  const steam=new THREE.Group();steam.name='HotDrinkSteam';steam.position.set(1.36,2.01,-.08);room.add(steam);
  const steamGeometry=new THREE.BoxGeometry(.032,.065,.032);
  const steamPuffs=Array.from({length:12},(_,i)=>{
    const material=new THREE.MeshBasicMaterial({color:'#e4e8ee',transparent:true,opacity:0,depthWrite:false,toneMapped:false});
    const puff=new THREE.Mesh(steamGeometry,material);puff.name='SteamPixel';steam.add(puff);return puff;
  });
  box(props,'dark',1.68,1.87,-1.07,.25,.42,.21);
  box(props,'metal',1.68,1.88,-.956,.14,.2,.02);
  box(props,'cyan',1.68,1.74,-.942,.06,.015,.009,true);

  // RGB PC tower; fans are voxel rings rather than high-poly cylinders.
  box(props,'black',2.65,.95,-.1,.75,1.8,1.05);
  box(props,'metal',2.65,1.87,-.1,.79,.055,1.1);
  box(props,'metal',2.65,.06,-.1,.79,.09,1.1);
  box(props,'#1d2439',3.037,.97,-.1,.018,1.62,.93);
  for(let i=0;i<3;i++) {
    const cy=.45+i*.49;
    for(let j=0;j<16;j++) {
      const angle=j/16*Math.PI*2;
      const color=['cyan','violet','blue'][(j+i)%3];
      box(props,color,2.65+Math.cos(angle)*.21,cy+Math.sin(angle)*.21,.44,.065,.065,.025,true);
    }
    box(props,'metal',2.65,cy,.452,.14,.14,.035);
  }
  for(let i=0;i<6;i++)box(props,i%2?'violet':'cyan',3.052,.55+i*.15,-.22,.012,.05,.64,true);
  box(props,'cyan',2.9,1.9,.17,.08,.012,.08,true);

  function plant(x,y,z,size=1) {
    box(props,'terra',x,y+.16*size,z,.36*size,.32*size,.36*size);
    box(props,'#76544f',x,y+.33*size,z,.3*size,.035*size,.3*size);
    box(props,'green',x,y+.65*size,z,.055*size,.65*size,.055*size);
    for(let i=0;i<7;i++) {
      const a=i*2.4, r=.15+(i%2)*.05;
      const leaf=box(props,i%2?'greenLight':'green',x+Math.cos(a)*r*size,y+(.47+i*.075)*size,z+Math.sin(a)*r*size,.25*size,.1*size,.15*size);
      leaf.rotation.set(Math.sin(a)*.5,a,Math.cos(a)*.5);
    }
  }
  plant(-1.9,1.65,-1.02,.8); plant(-2.95,.08,-1.65,1.65); plant(-.65,3.3,-2.5,.65);
  // Side table with books and a warm, stepped lamp to balance the cool monitor light.
  box(props,'wood',-2.9,.74,1.2,.73,.12,.7);
  for(const x of [-3.17,-2.65])for(const z of [.95,1.45])box(props,'metal',x,.38,z,.055,.7,.055);
  for(let i=0;i<3;i++)box(props,['blue','terra','paper'][i],-2.9,.85+i*.08,1.2,.5,.065,.42);
  const lamp=new THREE.Group();lamp.name='ThemeLamp';room.add(lamp);
  box(lamp,'yellow',-2.87,1.21,1.2,.07,.5,.07);
  box(lamp,'#e0baa4',-2.87,1.44,1.2,.45,.2,.4);
  const lampGlow=box(lamp,'#efc8a0',-2.87,1.32,1.2,.38,.035,.34,true);

  // Chair: five-foot base, caster pixels, padded seat and tall back with cyan piping.
  const chair=new THREE.Group(); chair.position.set(-.55,0,.98);room.add(chair);
  box(chair,'metal',0,.46,0,.1,.65,.1);
  for(let i=0;i<5;i++) {
    const leg=new THREE.Group();leg.rotation.y=i/5*Math.PI*2;chair.add(leg);
    box(leg,'metal',0,.16,.28,.09,.07,.6);
    box(leg,'black',0,.11,.55,.14,.14,.12);
  }
  box(chair,'chair',0,.88,-.02,.88,.18,.78);
  box(chair,'fabric',0,.985,-.09,.68,.055,.6);
  box(chair,'chair',0,1.43,.37,.85,1.13,.2);
  box(chair,'black',0,1.5,.485,.65,.9,.045);
  box(chair,'fabric',0,2.06,.33,.6,.22,.25);
  for(const side of [-1,1]) {
    box(chair,'cyan',side*.39,1.5,.485,.025,.92,.025,true);
    box(chair,'metal',side*.46,1.1,.04,.06,.4,.07);
    box(chair,'chair',side*.46,1.29,-.025,.15,.08,.45);
  }
  const character=createVoxelCharacter(factory);
  const characterAnchor=new THREE.Group();characterAnchor.position.set(...sceneConfig.character.position);room.add(characterAnchor);
  characterAnchor.add(character.root);

  // One shadow-casting light; the other lights are inexpensive atmosphere and monitor spill.
  const ambient=new THREE.HemisphereLight(0xabb6ed,0x302234,1.5);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xbdc7ff,3.1);key.position.set(4,8,5);key.target.position.set(0,1,0);
  key.castShadow=!mobile&&sceneConfig.shadows;
  key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;
  key.shadow.normalBias=.035;key.shadow.bias=-.0005;key.shadow.camera.far=25;scene.add(key,key.target);
  const screenLight=new THREE.PointLight(0x80dff6,8,5,2);screenLight.position.set(.3,2.5,-.3);scene.add(screenLight);
  const rgb=new THREE.PointLight(0x8866ff,8,5,2);rgb.position.set(2.8,1.4,1);scene.add(rgb);
  const warm=new THREE.PointLight(0xffbc86,5,4,2);warm.position.set(-2.8,1.5,1.2);scene.add(warm);
  const back=new THREE.PointLight(0x6b69ff,7,6,2);back.position.set(-1.7,2.7,-2);scene.add(back);
  batch(architecture);batch(props);batch(chair);
  // Character and chair stay articulated; static details above are merged by material.
  let mixer=null, externalRoot=null, disposed=false;
  if(sceneConfig.character.url) {
    import('three/addons/loaders/GLTFLoader.js').then(async ({GLTFLoader})=>{
      const gltf=await new GLTFLoader().loadAsync(sceneConfig.character.url);
      if(disposed){gltf.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.()});return;}
      externalRoot=gltf.scene;externalRoot.scale.setScalar(sceneConfig.character.scale);externalRoot.rotation.set(...sceneConfig.character.rotation);
      characterAnchor.add(externalRoot);character.root.visible=false;
      externalRoot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
      if(gltf.animations.length){mixer=new THREE.AnimationMixer(externalRoot);const clip=THREE.AnimationClip.findByName(gltf.animations,sceneConfig.character.animation)||gltf.animations[0];mixer.clipAction(clip).play();}
    }).catch(()=>{document.querySelector('#scene-loading-text').textContent='CUSTOM MODEL UNAVAILABLE / VOXEL CHARACTER ACTIVE'});
  }
  return {room,mainMonitor,portalTarget,resizeDevice(){resizeDevice();syncPortalTarget()},character,screenLight,screens,lamp,lampGlow,ambient,key,warm,exterior,
    animate(time,delta,still=false) {
      steamPuffs.forEach((puff,i)=>{
        const phase=((still?0:time*.24)+i/steamPuffs.length)%1;
        puff.position.set(Math.sin(phase*6+i*.8)*(.014+phase*.035)+(i%3-1)*.035,.025+phase*.48,Math.cos(phase*4+i)*.022);
        puff.scale.setScalar(.65+phase*.65);
        puff.material.opacity=Math.sin(phase*Math.PI)*.27;
      });
      if(!still){character.animate(time);chair.rotation.y=Math.sin(time*.45)*.008;mixer?.update(delta);}
      if(exterior.root.visible)exterior.traffic.animate(time,still);
      screens.update(time,still);rgb.intensity=still?8:8+Math.sin(time*.75)*.6;screenLight.intensity=still?8:8+Math.sin(time*.5)*.25;
    },
    dispose(){disposed=true;screens.dispose();mixer?.stopAllAction();if(mixer&&externalRoot)mixer.uncacheRoot(externalRoot);factory.unit.dispose();}
  };
}
