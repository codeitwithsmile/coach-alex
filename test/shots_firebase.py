import asyncio, os
from playwright.async_api import async_playwright
FAKE = r"""
window.COACH_ALEX_CONFIG = {coachEmail:'alex@exemple.fr', firebase:{projectId:'x'}};
(function(){
  const store={}; const col=n=>(store[n]=store[n]||{}); const clone=o=>JSON.parse(JSON.stringify(o===undefined?null:o));
  const docRef=(n,id)=>({get:async()=>({exists:id in col(n),id,data:()=>id in col(n)?clone(col(n)[id]):undefined}),set:async o=>{col(n)[id]=clone(o)},update:async o=>{Object.assign(col(n)[id]||(col(n)[id]={}),clone(o))},delete:async()=>{delete col(n)[id]}});
  const q=(n,pred)=>({get:async()=>({docs:Object.entries(col(n)).filter(([,v])=>pred(v)).map(([id,v])=>({id,data:()=>clone(v)}))}),where:(f,op,v)=>q(n,d=>pred(d)&&d[f]===v),orderBy:()=>q(n,pred)});
  const fs={settings(){},doc:p=>{const i=p.indexOf('/');return docRef(p.slice(0,i),p.slice(i+1))},collection:n=>({...q(n,()=>true),add:async o=>{const id='i'+Math.random();col(n)[id]=clone(o);return {id}},doc:id=>docRef(n,id)})};
  let current=null; const ls=[];
  const auth={get currentUser(){return current},useDeviceLanguage(){},async setPersistence(){},onAuthStateChanged(l){ls.push(l);setTimeout(()=>l(current),0);return()=>{}},
    async signInWithEmailAndPassword(e,p){ if(p!=='bon'){const er=new Error('x');er.code='auth/invalid-credential';throw er;} current={uid:'u1',email:e}; return {user:current}; },
    async createUserWithEmailAndPassword(e,p){ current={uid:'u2',email:e}; return {user:current}; }, async signOut(){current=null}, async sendPasswordResetEmail(){}};
  window.firebase={apps:[],initializeApp(){this.apps.push({})},firestore:()=>fs,auth:()=>auth}; window.firebase.auth.Auth={Persistence:{LOCAL:'l',SESSION:'s'}};
})();
"""
async def main():
    html=open('firebase/public/index.html',encoding='utf-8').read()
    import re; html=re.sub(r'<script src="[^"]+"></script>\n','',html)
    open('out/fb_test.html','w',encoding='utf-8').write(html)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx=await b.new_context(viewport={'width':390,'height':760},device_scale_factor=2)
        await ctx.add_init_script(FAKE)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath('out/fb_test.html')); await pg.wait_for_timeout(600)
        await pg.evaluate("renderAuth('coach')"); await pg.wait_for_timeout(200)
        await pg.fill('#auth-email','alex@exemple.fr'); await pg.fill('#auth-pass','mauvais'); await pg.evaluate("submitAuth()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path='out/fb_coach.png')
        await pg.evaluate("renderAuth('client')"); await pg.wait_for_timeout(200); await pg.screenshot(path='out/fb_client.png')
        await pg.evaluate("AUTH.fbMode='signup';renderAuthBody()"); await pg.wait_for_timeout(200); await pg.screenshot(path='out/fb_signup.png')
        print('erreurs',errs)
        await b.close()
asyncio.run(main())
