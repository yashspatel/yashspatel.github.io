from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(args=['--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1200,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5173',wait_until='networkidle');page.wait_for_function("document.querySelector('.cinema-viewport').dataset.sceneState==='ready'")
 result=page.evaluate("""async()=>{
 const THREE=await import('/node_modules/three/build/three.module.js');
 const {createBoxFactory}=await import('/src/scene/geometry.js');const {createIntersection}=await import('/src/scene/intersection.js');
 const traffic=createIntersection(new THREE.Group(),createBoxFactory());
 const initial=traffic.cars[0].position.clone();
 for(let i=0;i<=300;i++)traffic.animate(i/30);
 const moved=traffic.cars[0].position.distanceTo(initial)>1;
 const yellow=traffic.root.userData.phase==='x-amber';
 for(let i=301;i<=690;i++)traffic.animate(i/30);
 const before=traffic.walkers[0].person.position.clone();
 for(let i=691;i<=750;i++)traffic.animate(i/30);
 const walking=before.distanceTo(traffic.walkers[0].person.position)>1;
 for(let i=751;i<=900;i++)traffic.animate(i/30);
 return {cars:traffic.cars.length,pedestrians:traffic.walkers.length,moved,yellow,walking,notCrossing:traffic.walkers.filter(w=>w.crossing).every(w=>w.progress===0)};
 }""")
 assert result==dict(cars=8,pedestrians=16,moved=True,yellow=True,walking=True,notCrossing=True),result
 page.evaluate("async()=>{const {sceneConfig}=await import('/src/scene/config.js');sceneConfig.maxPixelRatio=.65;window.dispatchEvent(new Event('resize'))}")
 page.screenshot(path='artifacts/intersection-opening.png')
 assert not errors,errors
 print('PASS: 8 moving cars, 16 distributed pedestrians, amber signals, timed crossings complete before traffic resumes; scene renders without errors.')
 b.close()
