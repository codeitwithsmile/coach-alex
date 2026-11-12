#!/usr/bin/env python3
"""v9 : mode hors ligne (base dans localStorage), restauration d'une sauvegarde, données de démo."""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
js = p.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global js
    if js.count(old) != count:
        print('ATTENDU %d, TROUVÉ %d :\n%s' % (count, js.count(old), old[:160])); sys.exit(1)
    js = js.replace(old, new)

# 1. Base locale (même API que la base Claude), après makeSafeDb
rep("let db=null;\n", r"""// Base hors ligne : tout est gardé dans le navigateur de l'appareil (localStorage), même API que la base Claude.
const LOCAL_DB_KEY = 'coachalex.db';
let LOCAL_MODE = false;
const DEMO_OPS = null; // remplacé par les données de démo dans la version hors ligne
function makeLocalDb(){
  if(typeof localStorage === 'undefined') return null;
  let store = {};
  try{ store = JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '{}') || {}; }catch(e){ store = {}; }
  const persist = () => { try{ localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(store)); }catch(e){ toast('Mémoire du navigateur pleine : impossible d’enregistrer'); throw e; } };
  const clone = o => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const col = n => (store[n] = store[n] || {});
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const cmp = (a, b) => { if(a == null && b == null) return 0; if(a == null) return -1; if(b == null) return 1; if(typeof a === 'number' && typeof b === 'number') return a - b; return String(a).localeCompare(String(b)); };
  const match = (d, f, op, v) => { const x = d[f]; switch(op){
    case '==': return x === v; case '!=': return x !== v;
    case '<': return cmp(x, v) < 0; case '<=': return cmp(x, v) <= 0; case '>': return cmp(x, v) > 0; case '>=': return cmp(x, v) >= 0;
    case 'in': return Array.isArray(v) && v.includes(x); case 'array-contains': return Array.isArray(x) && x.includes(v);
    default: return false; } };
  const snap = (n, preds, order) => {
    const docs = Object.entries(col(n)).filter(([, d]) => preds.every(p => p(d))).map(([id, d]) => ({ id, data: () => clone(d) }));
    if(order){ docs.sort((a, b) => { const r = cmp(a.data()[order.f], b.data()[order.f]); return order.dir === 'desc' ? -r : r; }); }
    return { docs };
  };
  const docRef = (n, id) => ({
    get: async () => ({ exists: id in col(n), id, data: () => (id in col(n) ? clone(col(n)[id]) : undefined) }),
    set: async o => { col(n)[id] = clone(o); persist(); },
    update: async o => { if(!(id in col(n))) throw new Error('Document absent : ' + n + '/' + id); Object.assign(col(n)[id], clone(o)); persist(); },
    delete: async () => { delete col(n)[id]; persist(); }
  });
  const query = (n, preds, order) => ({
    get: async () => snap(n, preds, order),
    where: (f, op, v) => query(n, [...preds, d => match(d, f, op, v)], order),
    orderBy: (f, dir) => query(n, preds, { f, dir: dir || 'asc' })
  });
  return {
    doc: path => { const i = String(path).indexOf('/'); return docRef(path.slice(0, i), path.slice(i + 1)); },
    collection: n => ({ ...query(n, [], null), add: async o => { const id = genId(); col(n)[id] = clone(o); persist(); return { id }; }, doc: id => docRef(n, id) })
  };
}
function hasClaudeApi(){ return typeof claude !== 'undefined' && claude && typeof claude.use === 'function'; }

let db=null;
""")

# 2. Démarrage : base Claude si disponible, sinon base locale
rep("""  let raw=null;
  try{ raw = await claude.use("db"); }catch(e){ raw=null; }
  db = raw ? makeSafeDb(raw) : null;
  if(!db){
    document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Le stockage n\\'est pas disponible dans cette vue. Rouvrez la page depuis claude.ai.</div>';
    return;
  }
""", """  let raw=null;
  if(hasClaudeApi()){ try{ raw = await claude.use("db"); }catch(e){ raw=null; } }
  if(!raw){ raw = makeLocalDb(); LOCAL_MODE = !!raw; }
  db = raw ? makeSafeDb(raw) : null;
  if(!db){
    document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Le stockage n\\'est pas disponible dans ce navigateur.</div>';
    return;
  }
""")

# 3. Sauvegarde : téléchargement direct hors de Claude ; restauration ; données de démo
rep("""async function exportBackup(){
  let downloads=null;
  try{ downloads = await claude.use('downloads'); }catch(e){ downloads=null; }
  if(!downloads){ toast('Sauvegarde indisponible dans cette vue.'); return; }
  const out = {application:'Coach Alex · Gestion Client', exporteLe:new Date().toISOString(), collections:{}};
  for(const name of ALL_COLLECTIONS){
    const snap = await db.collection(name).get();
    out.collections[name] = snap.docs.map(d=>({id:d.id, ...unescDeep(d.data())}));
  }
  try{
    await downloads.save({filename:'coach-alex-sauvegarde-'+todayStr()+'.json', data:JSON.stringify(out,null,1)});
    toast('Sauvegarde téléchargée');
  }catch(e){
    toast(e && e.code==='declined' ? 'Sauvegarde annulée' : 'Sauvegarde impossible pour le moment');
  }
}
""", """async function exportBackup(){
  let downloads=null;
  if(hasClaudeApi()){ try{ downloads = await claude.use('downloads'); }catch(e){ downloads=null; } }
  const out = {application:'Coach Alex · Gestion Client', exporteLe:new Date().toISOString(), collections:{}};
  for(const name of ALL_COLLECTIONS){
    const snap = await db.collection(name).get();
    out.collections[name] = snap.docs.map(d=>({id:d.id, ...unescDeep(d.data())}));
  }
  const filename = 'coach-alex-sauvegarde-'+todayStr()+'.json', data = JSON.stringify(out,null,1);
  if(!downloads){
    try{
      const url = URL.createObjectURL(new Blob([data], {type:'application/json'}));
      const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
      toast('Sauvegarde téléchargée');
    }catch(e){ toast('Sauvegarde impossible dans ce navigateur'); }
    return;
  }
  try{
    await downloads.save({filename, data});
    toast('Sauvegarde téléchargée');
  }catch(e){
    toast(e && e.code==='declined' ? 'Sauvegarde annulée' : 'Sauvegarde impossible pour le moment');
  }
}
function openImportBackup(){ const i=document.getElementById('import-backup-file'); if(i) i.click(); }
async function importBackup(input){
  const f = input && input.files && input.files[0]; if(!f) return; input.value='';
  let data=null;
  try{ data = JSON.parse(await f.text()); }catch(e){ toast('Fichier illisible'); return; }
  if(!data || !data.collections){ toast('Ce fichier n\\u2019est pas une sauvegarde Coach Alex'); return; }
  const total = Object.values(data.collections).reduce((a,c)=>a+(Array.isArray(c)?c.length:0),0);
  if(!confirm('Restaurer '+total+' éléments ? Les éléments déjà présents avec le même identifiant seront remplacés.')) return;
  let done=0;
  for(const [name,docs] of Object.entries(data.collections)){
    if(!ALL_COLLECTIONS.includes(name) || !Array.isArray(docs)) continue;
    for(const d of docs){ const {id, ...rest} = d; if(!id) continue; await db.doc(name+'/'+id).set(rest); done++; }
  }
  toast(done+' éléments restaurés');
  S.site = await loadSiteSettings(); await loadClients(); render();
}
async function loadDemoData(){
  if(!DEMO_OPS || !DEMO_OPS.length){ toast('Pas de données de démo dans cette version'); return; }
  if(!confirm('Ajouter les clients de démonstration (Nahia et Peio) avec leurs séances, bilans et entraînements ?')) return;
  let n=0;
  for(const op of DEMO_OPS){ if(op.op==='set' && op.path && op.data){ await db.doc(op.path).set(op.data); n++; } }
  toast(n+' éléments de démo ajoutés');
  S.site = await loadSiteSettings(); await loadClients(); render();
}
function backupCardHtml(){
  const demo = LOCAL_MODE && DEMO_OPS && DEMO_OPS.length && !(S.clients||[]).length;
  return `<div class="card">
      <h2>Sauvegarde</h2>
      ${LOCAL_MODE ? `<p class="note">Version hors ligne : les données sont gardées dans ce navigateur, sur cet appareil uniquement. Elles disparaissent si vous effacez les données du navigateur. Faites une sauvegarde régulièrement.</p>` : ''}
      <p class="empty">Télécharge toutes les données (clients, bilans, séances, suivis, entraînements, alimentation…) dans un fichier. Les vidéos ne sont pas incluses.</p>
      <div class="chips">
        <button class="btn btn-secondary btn-sm" onclick="exportBackup()">Télécharger une sauvegarde</button>
        <button class="btn btn-light btn-sm" onclick="openImportBackup()">Restaurer une sauvegarde</button>
        ${demo ? `<button class="btn btn-light btn-sm" onclick="loadDemoData()">Charger les données de démo</button>` : ''}
      </div>
      <input type="file" id="import-backup-file" accept="application/json,.json" style="display:none" onchange="importBackup(this)">
    </div>`;
}
""")

rep("""    <div class="card">
      <h2>Sauvegarde</h2>
      <p class="empty">Télécharge toutes les données (clients, bilans, séances, suivis, entraînements, alimentation…) dans un fichier. À faire régulièrement. Les vidéos ne sont pas incluses.</p>
      <button class="btn btn-secondary btn-sm" onclick="exportBackup()">Télécharger une sauvegarde</button>
    </div>
""", """    ${backupCardHtml()}
""")

# 4. Upload vidéo : message clair hors de Claude
rep("""      const assets = await claude.use('assets');
      if(!assets){ toast("Upload vidéo indisponible ici"); }""",
    """      const assets = hasClaudeApi() ? await claude.use('assets') : null;
      if(!assets){ toast("Vidéos indisponibles dans la version hors ligne"); }""")

# 5. Indicateur dans Plus
rep("""    <div class="page-head"><h1>Plus</h1></div>
    ${groups.map(""", """    <div class="page-head"><h1>Plus</h1></div>
    ${LOCAL_MODE ? `<p class="note">Version hors ligne : données sur cet appareil uniquement (sauvegarde dans Compta).</p>` : ''}
    ${groups.map(""")

# 6. Verrou anti double-clic
rep("'regenerateClientCode','openChangeCycle'];", "'regenerateClientCode','openChangeCycle','importBackup','loadDemoData'];")

p.write_text(js, encoding='utf-8')
print('patch v9 appliqué')
