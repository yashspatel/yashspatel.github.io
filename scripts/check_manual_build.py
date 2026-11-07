from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--disable-webgl'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5173',wait_until='networkidle')
 page.wait_for_timeout(500);assert page.evaluate('scrollY')==0
 assert page.locator('#contact [data-build-state=working]').count()==0
 page.locator('#agent-workspace').evaluate('e=>scrollTo({top:e.offsetTop,behavior:"instant"})')
 page.wait_for_function("document.querySelector('#agent-workspace [data-typing=true]')!==null")
 y=page.evaluate('scrollY');page.wait_for_timeout(450);assert abs(page.evaluate('scrollY')-y)<2
 page.mouse.wheel(0,500);page.wait_for_timeout(200);assert page.evaluate('scrollY')>y+100
 page.locator('#about').evaluate('e=>scrollTo({top:e.offsetTop,behavior:"instant"})')
 page.wait_for_function("document.querySelector('#about [data-typing=true]')!==null")
 assert page.locator('#contact [data-build-state=working]').count()==0
 page.get_by_role('button',name='Pause agents').click()
 assert page.locator('.global-agent-pool [data-busy=true]').count()==0
 page.get_by_role('button',name='Resume agents').click()
 page.wait_for_function("document.querySelector('#about [data-typing=true]')!==null")
 page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(200)
 assert page.locator('.global-agent-pool [data-busy=true]').count()==0
 assert not errors,errors
 print('PASS: free manual scrolling, no autoscroll, typing on arrival, offscreen work waits, pause/resume; no browser errors.')
 b.close()
