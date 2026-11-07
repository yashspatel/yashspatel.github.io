import * as THREE from 'three';

export function createIntersection(parent,factory){
  const {box,batch}=factory;
  const root=new THREE.Group();root.name='MainIntersection';parent.add(root);
  const street=new THREE.Group();root.add(street);
  const center=7.5,ground=-16.43;
  // The hero building sits on the northwest corner of these two main roads.
  for(const [start,end] of [[-12,4.6],[10.4,27]]){
    for(const z of [4.1,10.9])box(street,'#596273',(start+end)/2,ground+.06,z,end-start,.12,.65);
    for(const x of [4.1,10.9])box(street,'#596273',x,ground+.06,(start+end)/2,.65,.12,end-start);
  }
  for(let i=0;i<8;i++)for(const edge of [3.25,11.75]){
    box(street,'#c0c6c6',5.05+i*.7,ground+.04,edge,.36,.025,1.05);
    box(street,'#c0c6c6',edge,ground+.04,5.05+i*.7,1.05,.025,.36);
  }
  for(const edge of [2.3,12.7]){
    box(street,'#a5adb6',edge,ground+.035,7.5,.1,.025,5.2);
    box(street,'#a5adb6',7.5,ground+.035,edge,5.2,.025,.1);
  }
  const signals=[];
  function signal(x,z,axis,rotation){
    const pole=new THREE.Group();pole.position.set(x,ground,z);pole.rotation.y=rotation;street.add(pole);
    box(pole,'#6b7687',0,1.5,0,.085,3,.085);
    box(pole,'#1b2331',0,2.75,0,.33,.86,.23);
    const bulbs=[];
    for(let i=0;i<3;i++){
      const bulb=new THREE.Mesh(factory.unit,new THREE.MeshBasicMaterial({color:'#19212b',toneMapped:false}));
      bulb.position.set(0,3.02-i*.26,.135);bulb.scale.set(.17,.17,.035);pole.add(bulb);bulbs.push(bulb);
      box(pole,'#121a25',0,3.13-i*.26,.14,.26,.045,.2);
    }
    // Keep signal bulbs outside static batching because their color changes.
    bulbs.forEach(bulb=>{pole.remove(bulb);const holder=new THREE.Group();holder.position.copy(pole.position);holder.rotation.copy(pole.rotation);holder.add(bulb);root.add(holder)});
    signals.push({axis,bulbs});
  }
  signal(3.8,3.8,'x',Math.PI/2);signal(11.2,11.2,'x',-Math.PI/2);
  signal(11.2,3.8,'z',0);signal(3.8,11.2,'z',Math.PI);
  batch(street);
  const lanes=[],cars=[];
  function makeCar(color,index){
    const car=new THREE.Group();car.name='FlowingCar';root.add(car);
    box(car,color,0,.37,0,.92,.4,1.85);
    box(car,color,0,.69,-.1,.8,.3,.95);
    box(car,'#9bb8cd',0,.72,.41,.73,.23,.035);
    box(car,'#6b8ba5',0,.72,-.6,.73,.23,.035);
    for(const side of [-1,1]){
      box(car,'#87aabd',side*.407,.72,-.08,.025,.22,.75);
      for(const z of [-.6,.6])box(car,'#111822',side*.47,.22,z,.15,.32,.32);
      box(car,'#e6ebc2',side*.3,.4,.94,.19,.11,.025,true);
      box(car,'#df666f',side*.3,.4,-.94,.19,.1,.025,true);
    }
    if(index%5===0)box(car,'#eadb9d',0,.91,-.08,.3,.1,.22);
    batch(car);cars.push(car);return car;
  }
  const colors=['#b96c75','#7896b6','#d0b17c','#729e94','#9190b8','#bdc5cb'];
  for(const axis of ['x','z'])for(const direction of [-1,1]){
    const lane={axis,direction,cars:[]};
    for(let i=0;i<2;i++){
      const car=makeCar(colors[(cars.length)%colors.length],cars.length);
      car.rotation.y=axis==='x'?direction*Math.PI/2:direction===1?0:Math.PI;
      lane.cars.push({car,s:[-24,22][i]});
    }
    lanes.push(lane);
  }
  const walkers=[];
  const corners=[[3.8,3.8],[11.2,3.8],[11.2,11.2],[3.8,11.2]];
  function pedestrian(index,crossing){
    const person=new THREE.Group();person.name='VoxelPedestrian';root.add(person);
    const shirt=['#b79bdf','#80b8af','#d1a073','#769dc5'][index%4];
    box(person,shirt,0,.64,0,.28,.4,.22);
    box(person,'#d1a283',0,.99,0,.25,.25,.24);
    box(person,'#252638',0,1.13,.025,.27,.08,.25);
    const limbs=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.085,.44,0);person.add(leg);
      box(leg,'#333b51',0,-.21,0,.12,.42,.13);box(leg,'#bfc6cf',0,-.4,.035,.13,.1,.2);batch(leg);limbs.push(leg);
      const arm=new THREE.Group();arm.position.set(side*.2,.8,0);person.add(arm);
      box(arm,shirt,0,-.14,0,.1,.3,.12);box(arm,'#d1a283',0,-.31,0,.1,.09,.11);batch(arm);limbs.push(arm);
    }
    batch(person,false);walkers.push({person,limbs,index,crossing,progress:0,edge:index%4});
  }
  const sidewalkRoutes=[
    {x:0,z:4.1,axis:'x',half:2.7},{x:15,z:4.1,axis:'x',half:4.4},
    {x:-15,z:4.1,axis:'x',half:4.4},{x:0,z:-5.25,axis:'x',half:4.4},
    {x:15,z:-5.25,axis:'x',half:4.4},{x:-15,z:-5.25,axis:'x',half:4.4},
    {x:0,z:20.25,axis:'x',half:4.4},{x:-15,z:20.25,axis:'x',half:4.4},
    {x:15,z:20.25,axis:'x',half:4.4},{x:-5.25,z:15,axis:'z',half:4.4},
    {x:-5.25,z:-15,axis:'z',half:4.4},{x:20.25,z:-15,axis:'z',half:4.4},
    {x:-20.25,z:0,axis:'z',half:4.4},{x:20.25,z:15,axis:'z',half:4.4},
  ];
  for(let i=0;i<16;i++)pedestrian(i,i<2);
  let previous=null,phase='x-green';
  function animate(time,still=false){
    const dt=previous===null?0:Math.min(Math.max(time-previous,0),.08);previous=time;
    const t=time%30;
    phase=t<9?'x-green':t<11?'x-amber':t<12?'all-red':t<21?'z-green':t<23?'z-amber':'pedestrians';
    root.userData.phase=phase;
    signals.forEach(({axis,bulbs})=>{
      const active=phase===`${axis}-green`?2:phase===`${axis}-amber`?1:0;
      bulbs.forEach((bulb,i)=>bulb.material.color.set(i===active?['#ff5b62','#ffd276','#79e1a0'][i]:'#18212a'));
    });
    lanes.forEach(lane=>{
      let ahead=Infinity;
      lane.cars.sort((a,b)=>b.s-a.s).forEach(item=>{
        if(!still){
          let next=item.s+dt*3.8;
          if(phase!==`${lane.axis}-green`&&item.s<=-5.2)next=Math.min(next,-5.2);
          next=Math.min(next,ahead-3.2);
          if(next>60){item.s=-60;}else{item.s=next;ahead=next;}
        }
        const along=center+item.s*lane.direction;
        // Right-hand lanes: opposing directions stay on separate tracks.
        const across=center+(lane.axis==='x'?-lane.direction:lane.direction)*1.25;
        item.car.position.set(lane.axis==='x'?along:across,ground,lane.axis==='z'?along:across);
      });
    });
    walkers.forEach(walker=>{
      const {person,index,limbs,crossing}=walker;
      const cycle=Math.floor(time/30);
      let moving=!crossing||walker.progress>0||(phase==='pedestrians'&&t<24&&walker.startedCycle!==cycle);
      if(crossing){
        if(!still&&moving){walker.startedCycle=cycle;walker.progress+=dt*.18;}
        if(walker.progress>=1){walker.progress=0;walker.edge=(walker.edge+1)%4;moving=false;}
        const a=corners[walker.edge],b=corners[(walker.edge+1)%4];
        person.position.set(THREE.MathUtils.lerp(a[0],b[0],walker.progress),ground+.1,THREE.MathUtils.lerp(a[1],b[1],walker.progress));
        person.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);
      }else{
        const route=sidewalkRoutes[index-2];
        const phase=(time*.75+index*2.1)%(4*route.half),forward=phase<2*route.half;
        const distance=forward?-route.half+phase:3*route.half-phase;
        person.position.set(route.x+(route.axis==='x'?distance:0),ground+.1,route.z+(route.axis==='z'?distance:0));
        person.rotation.y=route.axis==='x'?(forward?Math.PI/2:-Math.PI/2):(forward?0:Math.PI);
      }
      limbs.forEach((limb,i)=>{limb.rotation.x=still||!moving?0:Math.sin(time*7+index+i%2*Math.PI)*.35});
    });
  }
  animate(0,true);
  return {root,cars,walkers,animate};
}
