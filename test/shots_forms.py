import asyncio, pathlib, json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
src=(ROOT/'test'/'shots_demo.py').read_text()
ns={'ROOT':ROOT,'json':json}; exec(src[src.index('ops=[]'):src.index('async def main')], ns); FAKE=ns['FAKE']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width':390,'height':844}); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(FAKE)
        await pg.goto((ROOT/'src'/'coach-alex.html').as_uri()); await pg.wait_for_timeout(400)
        await pg.evaluate("showCoach()"); await pg.wait_for_timeout(600)
        await pg.evaluate("selectClient('cl_nahia','bilan')"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=str(ROOT/'out'/'v9_bilan.png'))
        await pg.evaluate("openBilanSection('Activité professionnelle')"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(ROOT/'out'/'v9_bilan_modal.png'))
        await pg.evaluate("closeModal();openBilanGeneral()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(ROOT/'out'/'v9_bilan_general.png'))
        await pg.evaluate("closeModal();switchHomeTab('diet')"); await pg.wait_for_timeout(500)
        await pg.fill('#dt-age','36'); await pg.fill('#dt-poids','74'); await pg.fill('#dt-taille','168'); await pg.evaluate("runDietTool()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(ROOT/'out'/'v9_diet.png'))
        await pg.evaluate("switchHomeTab('plus')"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=str(ROOT/'out'/'v9_plus.png'))
        await pg.evaluate("showLanding()"); await pg.wait_for_timeout(200); await pg.evaluate("startClientQuestionnaire()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(ROOT/'out'/'v9_wiz1.png'))
        await pg.fill('#q-prenom','Test'); await pg.fill('#q-nom','Test'); await pg.evaluate("wizardNext()"); await pg.wait_for_timeout(200); await pg.evaluate("wizardNext()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(ROOT/'out'/'v9_wiz3.png'))
        await pg.evaluate("wizardNext()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(ROOT/'out'/'v9_wiz4.png'))
        print('erreurs:',errs); await b.close()
asyncio.run(main())
