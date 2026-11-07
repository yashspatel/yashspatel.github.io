from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(args=['--enable-unsafe-swiftshader']);context=b.new_context(viewport={'width':1200,'height':900},has_touch=True);page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5173',wait_until='networkidle');page.wait_for_function("document.querySelector('.cinema-viewport').dataset.sceneState==='ready'")
 moon=page.get_by_role('button',name='Switch to day mode');assert moon.is_visible();moon.click()
 page.wait_for_function("document.querySelector('.cinema-viewport').dataset.lamp==='off'")
 assert page.locator('html').get_attribute('data-theme')=='light'
 assert page.get_by_role('button',name='Switch to night mode').is_visible()
 page.evaluate("async()=>{const {sceneConfig}=await import('/src/scene/config.js');sceneConfig.maxPixelRatio=.65;window.dispatchEvent(new Event('resize'))}")
 page.screenshot(path='artifacts/pixel-sun-city.png')
 page.get_by_role('button',name='Switch to night mode').focus();page.keyboard.press('Enter')
 page.wait_for_function("document.querySelector('.cinema-viewport').dataset.lamp==='on'")
 page.locator('#agent-workspace').evaluate('e=>scrollTo({top:e.offsetTop*.4/.7,behavior:"instant"})');page.wait_for_timeout(250)
 assert page.locator('.pixel-sky-toggle').is_hidden()
 page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(250)
 assert page.get_by_role('button',name='Switch to day mode').is_visible()
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(200)
 page.get_by_role('button',name='Switch to day mode').tap()
 assert page.locator('html').get_attribute('data-theme')=='light'
 page.reload(wait_until='networkidle');page.wait_for_function("document.querySelector('.cinema-viewport').dataset.sceneState==='ready'")
 assert page.get_by_role('button',name='Switch to night mode').is_visible()
 assert not errors,errors
 print('PASS: pixel sky toggle mouse/keyboard/touch, lamp sync, day/night icons, persistence, fade inside and reverse; no browser errors.')
 b.close()
