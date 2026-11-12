import asyncio, os
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath('src/coach-alex-local.html')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        print('landing', 'Se connecter' in await pg.inner_html('#app'))
        await pg.evaluate("renderAuth('coach')"); await pg.wait_for_timeout(200)
        await pg.fill('#setup-code','482913'); await pg.fill('#setup-code2','482913')
        await pg.evaluate("saveCoachSetup()"); await pg.wait_for_timeout(500)
        print('coach ouvert', bool(await pg.query_selector('.tabbar')))
        await pg.evaluate("switchHomeTab('compta')"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='out/local_compta.png')
        print('bouton démo', 'loadDemoData' in await pg.inner_html('#app'))
        await pg.evaluate("loadDemoData()"); await pg.wait_for_timeout(1500)
        await pg.evaluate("switchHomeTab('clients')"); await pg.wait_for_timeout(400)
        html=await pg.inner_html('#app'); print('clients', 'Nahia' in html, 'Peio' in html)
        await pg.screenshot(path='out/local_clients.png')
        # rechargement : persistance
        await pg.reload(); await pg.wait_for_timeout(800)
        print('session persistée', bool(await pg.query_selector('.tabbar')))
        await pg.evaluate("switchHomeTab('journee')"); await pg.wait_for_timeout(400)
        await pg.screenshot(path='out/local_journee.png')
        size=await pg.evaluate("localStorage.getItem('coachalex.db').length")
        print('taille base locale', size)
        # export
        async with pg.expect_download() as dl: await pg.evaluate("exportBackup()")
        d=await dl.value; print('export', d.suggested_filename)
        print('erreurs', errs)
        await b.close()
asyncio.run(main())
