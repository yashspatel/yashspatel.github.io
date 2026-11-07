import * as THREE from 'three';

/** Temporary stylized character, manually built using the supplied photos as visual reference.
 * Not a facial scan or an image-to-3D reconstruction. The seated root is the GLB replacement anchor.
 */
export function createVoxelCharacter(factory) {
  const {box} = factory;
  const root = new THREE.Group();
  root.name = 'TemporaryVoxelYash';
  const skin = '#b78060', skinLight = '#cc9672', hair = '#171a22', beard = '#39302d';
  const jacket = '#848795', jacketDark = '#696d7e', shirt = '#222533';
  // Coordinates are relative to the seat, facing -Z toward the monitors.
  box(root,jacket,0,.55,0,.67,.75,.4);
  box(root,shirt,0,.59,-.215,.25,.59,.04);
  for (const side of [-1,1]) {
    box(root,jacketDark,side*.18,.68,-.23,.13,.42,.07).rotation.z = side * -.16;
    box(root,jacketDark,side*.24,.32,-.22,.12,.13,.05);
    box(root,'#262936',side*.18,.02,-.24,.28,.23,.68);
    box(root,'#282b37',side*.18,-.29,-.51,.25,.55,.25);
    box(root,'#d4d6d0',side*.18,-.59,-.59,.29,.13,.43);
    box(root,'#555c75',side*.18,-.56,-.76,.23,.04,.06);
  }
  box(root,skin,0,1.0,-.01,.23,.24,.24);
  const head = new THREE.Group(); head.position.set(0,1.29,-.015); root.add(head);
  // Photo-based proportions: fuller cheeks, narrower chin and clear square frames.
  box(head,skin,0,.075,.005,.54,.45,.49);
  box(head,skin,0,-.205,-.005,.485,.18,.46);
  box(head,skin,0,-.305,-.005,.39,.08,.40);
  box(head,skinLight,0,-.025,-.251,.44,.34,.035);
  for(const side of [-1,1]){
    box(head,'#c18a68',side*.225,-.105,-.235,.07,.16,.08);
    box(head,skin,side*.292,-.015,.005,.075,.17,.12);
    // Beard follows the jaw instead of forming one rectangular black strip.
    box(head,beard,side*.231,-.17,-.225,.052,.21,.12);
    box(head,'#4b3930',side*.19,-.245,-.253,.085,.1,.047);
    box(head,beard,side*.125,-.298,-.237,.11,.075,.06);
    box(head,hair,side*.26,.19,.045,.055,.235,.40);
    const brow=box(head,'#282326',side*.135,.117,-.282,.175,.034,.026);
    brow.rotation.z=side*.07;
    box(head,'#e2c9b2',side*.135,.025,-.28,.095,.041,.022);
    box(head,'#251f22',side*.135,.025,-.299,.038,.041,.018);
    const lensX=side*.14;
    for(const dy of [-.057,.085])box(head,'#c6d2d0',lensX,dy,-.335,.195,.018,.023);
    for(const dx of [-.112,.112])box(head,'#c6d2d0',lensX+dx,.014,-.335,.018,.105,.023);
    for(const dx of [-.103,.103])for(const dy of [-.049,.077])box(head,'#c6d2d0',lensX+dx,dy,-.335,.024,.024,.023);
    box(head,'#d7e1dc',side*.265,.035,-.1,.018,.018,.43);
    box(head,'#dce5df',lensX-side*.048,.06,-.339,.045,.009,.009);
  }
  box(head,'#bf8867',0,-.035,-.29,.075,.185,.085);
  box(head,'#d29d79',0,-.105,-.326,.10,.065,.07);
  box(head,'#cbd5d0',0,.043,-.343,.065,.017,.024);
  // A small smile and close beard reflect the smiling portrait reference.
  box(head,beard,0,-.29,-.242,.27,.105,.065);
  box(head,'#322629',0,-.214,-.286,.235,.065,.028);
  box(head,'#f0dfca',0,-.203,-.306,.164,.025,.012);
  box(head,'#b87964',0,-.245,-.303,.155,.016,.013);
  for(const side of [-1,1])box(head,beard,side*.067,-.171,-.292,.11,.032,.035);
  // Dense, side-swept dark hair; low stepped waves replace the spiky crown.
  box(head,hair,0,.31,.02,.565,.15,.51);
  for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++){
    const swept=Math.max(0,1-Math.abs(x+1)/5);
    const height=.045+swept*.065+(z<0?.025:0)+Math.sin(x*.9+z*.7)*.012;
    box(head,(x+z)%4===0?'#282a32':hair,x*.078,.385+height/2,z*.087-.015,.080,height,.09);
  }
  for(let x=-2;x<=2;x++){
    const fringe=box(head,hair,x*.079,.285-Math.abs(x-1)*.015,-.257,.085,.10,.075);
    fringe.rotation.z=-.12;
  }
  // Cover the rear scalp down to a tapered neckline, visible from the desk camera.
  box(head,hair,0,.135,.252,.55,.37,.055);
  box(head,hair,0,-.065,.244,.49,.12,.055);
  box(head,hair,0,-.145,.232,.41,.065,.045);
  for(const side of [-1,1]){
    box(head,hair,side*.25,.005,.17,.065,.24,.19);
    box(head,'#242731',side*.17,.22,.285,.085,.19,.025);
  }
  // Stepped over-ear headphones wrap around the hair, with padded ear cups.
  const headphones=new THREE.Group();headphones.name='MusicHeadphones';head.add(headphones);
  box(headphones,'#292b3c',0,.615,.035,.52,.085,.17);
  box(headphones,'#a69acb',0,.66,.035,.39,.025,.145);
  for(const side of [-1,1]){
    box(headphones,'#292b3c',side*.285,.54,.035,.12,.19,.17);
    box(headphones,'#292b3c',side*.355,.32,.035,.075,.36,.17);
    box(headphones,'#89869d',side*.369,.145,.035,.08,.17,.105);
    box(headphones,'#171b29',side*.34,-.015,.025,.11,.33,.31);
    box(headphones,'#42455f',side*.415,-.015,.025,.10,.30,.28);
    box(headphones,'#78d9e3',side*.474,-.015,.025,.02,.22,.20,true);
    box(headphones,'#202636',side*.489,-.015,.025,.02,.16,.14);
    for(let bar=0;bar<3;bar++)box(headphones,'#b2a0ee',side*.505,-.05+bar*.045,.025,.015,.018,.035+bar*.025,true);
  }
  factory.batch(headphones);
  // Small voxel music notes gently drift beside the headset.
  const musicNotes=[];
  for(let i=0;i<2;i++){
    const note=new THREE.Group();note.name='MusicNote';root.add(note);
    note.position.set(.58+i*.2,1.66+i*.17,.12);
    box(note,i?'#ad97ed':'#78d9e3',0,0,0,.075,.055,.035,true);
    box(note,i?'#ad97ed':'#78d9e3',.032,.095,0,.025,.19,.035,true);
    box(note,i?'#ad97ed':'#78d9e3',.075,.17,0,.075,.035,.035,true);
    factory.batch(note);musicNotes.push(note);
  }
  const arms = [];
  for(const side of [-1,1]) {
    const arm = new THREE.Group(); root.add(arm);
    arm.position.set(side*.42,.8,-.015);
    box(arm,jacket,0,-.19,-.07,.22,.43,.24);
    const wrist=-side*.13;
    box(arm,jacketDark,wrist*.5,-.12,-.29,.21,.2,.49).rotation.x=.35;
    box(arm,skinLight,wrist,0,-.57,.18,.13,.19);
    for(let i=0;i<4;i++) box(arm,skinLight,wrist-.06+i*.04,0,-.69,.031,.09,.09);
    arms.push(arm);
  }
  factory.batch(root,false);factory.batch(head,false);arms.forEach(arm=>factory.batch(arm,false));
  return {root, head, arms, animate(time) {
    head.rotation.y = Math.sin(time*.35)*.09 + Math.max(0, Math.sin(time*.16)-.8)*.6;
    const beat=time*5.24;
    head.rotation.x = .04 + Math.sin(beat)*.055;
    head.rotation.z = Math.sin(beat*.5)*.045;
    head.position.y=1.29+Math.sin(beat)*.012;
    root.rotation.z=Math.sin(beat*.5)*.012;
    musicNotes.forEach((note,i)=>{note.position.y=1.66+i*.17+Math.sin(time*1.6+i*1.8)*.045;note.rotation.z=Math.sin(time*1.4+i)*.10;});
    arms.forEach((arm,i) => { arm.position.y = .8+Math.sin(time*10+i*2.3)*.009; arm.rotation.x=Math.sin(time*8+i*2)*.015; });
  }};
}
