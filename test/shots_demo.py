import asyncio, pathlib, json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
ops=[]
for f in sorted((ROOT/'out').glob('demo_ops_*.json')): ops+=json.loads(f.read_text(encoding='utf-8'))
store={}
for o in ops:
    n,i=o['path'].split('/'); store.setdefault(n,{})[i]=o['data']
FAKE = "window.__STORE="+json.dumps(store,ensure_ascii=False)+";" + r"""
(()=>{const store=window.__STORE;let seq=0;const clone=o=>JSON.parse(JSON.stringify(o));const col=n=>(store[n]=store[n]||{});
const snap=(n,pred)=>({docs:Object.entries(col(n)).filter(([,v])=>pred(v)).map(([id,v])=>({id,data:()=>clone(v)}))});
const docRef=(n,id)=>({get:async()=>({exists:id in col(n),id,data:()=>(id in col(n)?clone(col(n)[id]):undefined)}),set:async o=>{col(n)[id]=clone(o)},update:async o=>{Object.assign(col(n)[id],clone(o))},delete:async()=>{delete col(n)[id]}});
const query=(n,pred)=>({get:async()=>snap(n,pred),where:(f,op,v)=>query(n,d=>pred(d)&&d[f]===v),orderBy:f=>({get:async()=>{const s=snap(n,pred);s.docs.sort((a,b)=>String(a.data()[f]).localeCompare(String(b.data()[f])));return s}})});
const db={doc:p=>{const [n,id]=p.split('/');return docRef(n,id)},collection:n=>({...query(n,()=>true),add:async o=>{const id='id'+(++seq);col(n)[id]=clone(o);return{id}},doc:id=>docRef(n,id)})};
window.claude={use:async n=>n==='db'?db:null};})();
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for name,vp,scheme in (('mobile',{'width':390,'height':844},'light'),('desktop',{'width':1280,'height':900},'light')):
            ctx = await b.new_context(viewport=vp, color_scheme=scheme); pg = await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script(FAKE)
            await pg.goto((ROOT/'src'/'coach-alex.html').as_uri()); await pg.wait_for_timeout(300)
            await pg.evaluate("showCoach()"); await pg.wait_for_timeout(700)
            full = name=='desktop'
            shots=[('journee',None),('planning',"switchHomeTab('planning')"),('clients',"switchHomeTab('clients')"),('plus',"switchHomeTab('plus')"),('compta',"switchHomeTab('compta')"),('bibcycles',"switchHomeTab('bibcycles')"),('lecons',"switchHomeTab('lecons')"),('aliments',"switchHomeTab('aliments')")]
            for n,js in shots:
                if js: await pg.evaluate(js)
                await pg.wait_for_timeout(600); await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_{n}.png'), full_page=full)
            await pg.evaluate("selectClient('cl_nahia')"); await pg.wait_for_timeout(700)
            for tab in ('suivi','entrainement','planningAlim','seance','bilan'):
                await pg.evaluate(f"switchTab('{tab}')"); await pg.wait_for_timeout(500)
                await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_c_{tab}.png'), full_page=full)
            await pg.evaluate("selectClient('cl_peio','bilan')"); await pg.wait_for_timeout(600); await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_peio.png'), full_page=full)
            await pg.evaluate("showClientSpace()"); await pg.evaluate("openClientProfileView('cl_nahia')"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_cs_accueil.png'), full_page=full)
            for tab,sub in (('entrainement',None),('planningAlim',None),('plus',None),('plus','suivi'),('plus','demande'),('plus','lecons'),('plus','challenges')):
                await pg.evaluate(f"switchClientTab('{tab}'{','+repr(sub) if sub else ''})"); await pg.wait_for_timeout(600)
                await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_cs_{tab}{'_'+sub if sub else ''}.png'), full_page=full)
            await pg.evaluate("switchClientTab('entrainement')"); await pg.wait_for_timeout(400); await pg.evaluate("renderClientEntrainementDetail()"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=str(ROOT/'out'/f'v4_{name}_cs_detail.png'), full_page=full)
            print(name,'erreurs:',errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
