import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page()
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto('file://'+os.path.abspath('src/coach-alex-local.html')); await pg.wait_for_timeout(500)
        await pg.evaluate("renderAuth('coach')"); await pg.wait_for_timeout(200)
        await pg.fill('#setup-code','482913'); await pg.fill('#setup-code2','482913'); await pg.evaluate("saveCoachSetup()"); await pg.wait_for_timeout(400)
        await pg.evaluate("switchHomeTab('compta')"); await pg.wait_for_timeout(300)
        await pg.set_input_files('#import-backup-file', os.path.abspath('out/coach-alex-exemples.json')); await pg.wait_for_timeout(1500)
        await pg.evaluate("switchHomeTab('clients')"); await pg.wait_for_timeout(300)
        h=await pg.inner_html('#app'); print('Nahia' in h and 'Peio' in h, await pg.evaluate("S.clients.length"))
        await b.close()
asyncio.run(main())
