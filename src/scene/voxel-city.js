import * as THREE from 'three';

// Seeded blocks keep the skyline stable on resize and reverse travel.
export function createVoxelCity(root,nightWindows,dayWindows,factory){
  const groups=new Map(),matrix=new THREE.Matrix4(),geometry=factory.unit.clone();let count=0;
  function instance(parent,color,x,y,z,w,h,d,glow=false){
    const key=`${parent.uuid}:${color}:${glow}`;
    if(!groups.has(key))groups.set(key,{parent,material:factory.material(color,glow),items:[]});
    groups.get(key).items.push([x,y,z,w,h,d]);
  }
  const noise=(a,b,c=0)=>{const n=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return n-Math.floor(n)};
  instance(root,'#182031',0,-16.7,0,2000,.25,2000);
  // Roads recede in every direction instead of ending at a display platform.
  for(let i=-10;i<=10;i++){
    instance(root,'#252e41',i*15+7.5,-16.5,0,i===0?5.5:3.5,.04,400);
    instance(root,'#252e41',0,-16.49,i*15+7.5,400,.04,i===0?5.5:3.5);
    for(let j=-15;j<=15;j++){
      instance(root,'#707b8b',i*15+7.5,-16.46,j*12,.09,.025,2);
      instance(root,'#707b8b',j*12,-16.45,i*15+7.5,2,.025,.09);
    }
  }
  // Walkable sidewalk segments between junctions on the surrounding blocks.
  for(let gx=-3;gx<=3;gx++)for(let gz=-3;gz<=3;gz++){
    for(const side of [-1,1]){
      const z=gz*15+7.5+side*(gz===0?3.4:2.25);
      const x=gx*15+7.5+side*(gx===0?3.4:2.25);
      instance(root,'#596273',gx*15,-16.37,z,10.5,.12,.65);
      instance(root,'#596273',x,-16.37,gz*15,.65,.12,10.5);
    }
  }
  for(let gx=-9;gx<=9;gx++)for(let gz=-9;gz<=9;gz++){
    const x=gx*15,z=gz*15,distance=Math.hypot(x,z);
    if(distance<13||distance>145)continue;
    // Keep the entry approach clear while surrounding it with city blocks.
    if(x>0&&z>=0&&Math.abs(z-x*.65)<12)continue;
    const w=5+noise(gx,gz)*4,d=5+noise(gz,gx,2)*4;
    const height=7+noise(gx,gz,1)*(distance<40?12:27);
    const color=['#26334a','#30394e','#344056','#29354c'][Math.floor(noise(gx,gz,4)*4)];
    instance(root,color,x,-16.5+height/2,z,w,height,d);
    instance(root,'#4a566d',x,-16.5+height,z,w+.35,.2,d+.35);
    if(noise(gx,gz,5)>.6)instance(root,'#45516b',x+.8,-16.1+height,z,.9,.7,1.2);
    const rows=Math.min(distance<65?8:4,Math.floor(height/2.5)),cols=distance<65?3:2;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const y=-15+row*(height-2)/rows,offset=(col-(cols-1)/2)*1.5;
      const lit=noise(gx*4+col,gz*8+row,6)>.4;
      const shade=lit?(noise(gx,gz,row)>.5?'#b3b5b2':'#b6a183'):'#23334b';
      instance(nightWindows,shade,x+offset,y,z+d/2+.025,.6,.85,.025,lit);
      instance(dayWindows,'#7895ac',x+offset,y,z+d/2+.025,.6,.85,.025);
      instance(nightWindows,shade,x+w/2+.025,y,z+offset,.025,.85,.6,lit);
      instance(dayWindows,'#7895ac',x+w/2+.025,y,z+offset,.025,.85,.6);
    }
    count++;
  }
  groups.forEach(({parent,material,items})=>{
    const mesh=new THREE.InstancedMesh(geometry,material,items.length);mesh.name='VoxelCityBlockInstances';
    items.forEach(([x,y,z,w,h,d],i)=>{matrix.makeScale(w,h,d);matrix.setPosition(x,y,z);mesh.setMatrixAt(i,matrix)});
    mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=false;parent.add(mesh);
  });
  root.userData.cityBuildingCount=count;
}
