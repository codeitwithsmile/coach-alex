import asyncio, pathlib, json, re
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
src=(ROOT/'test'/'shots_demo.py').read_text()
FAKE = src[src.index('ops=[]'):src.index('async def main')]
ns={'ROOT':ROOT,'json':json}; exec(FAKE, ns); FAKE=ns['FAKE']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for name,vp in (('mobile',{'width':390,'height':844}),('desktop',{'width':1280,'height':900})):
            ctx = await b.new_context(viewport=vp); pg = await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script(FAKE)
            await pg.goto((ROOT/'src'/'coach-alex.html').as_uri()); await pg.wait_for_timeout(500)
            await pg.screenshot(path=str(ROOT/'out'/f'v5_{name}_site.png'), full_page=True)
            await pg.evaluate("renderAuth('client')"); await pg.wait_for_timeout(300)
            await pg.fill('#auth-code','000000'); await pg.click('#auth-submit'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=str(ROOT/'out'/f'v5_{name}_auth_client_err.png'))
            await pg.evaluate("renderAuth('coach')"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=str(ROOT/'out'/f'v5_{name}_auth_coach_setup.png'))
            print(name,'erreurs:',errs); await ctx.close()
        await b.close()
asyncio.run(main())
