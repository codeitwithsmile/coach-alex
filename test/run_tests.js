// Tests de bout en bout du fichier unique, avec une fausse base en mémoire (API type Firestore).
// Usage : node test/run_tests.js   (après python3 tools/build_single.py)
const fs = require('fs'), path = require('path');
const { JSDOM } = require(path.join(__dirname, 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'coach-alex.html'), 'utf8');

function makeFakeDb() {
  const store = {}; let seq = 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const col = n => (store[n] = store[n] || {});
  const snap = (n, pred) => ({ docs: Object.entries(col(n)).filter(([, v]) => pred(v)).map(([id, v]) => ({ id, data: () => clone(v) })) });
  const docRef = (n, id) => ({
    get: async () => ({ exists: id in col(n), id, data: () => (id in col(n) ? clone(col(n)[id]) : undefined) }),
    set: async o => { col(n)[id] = clone(o); },
    update: async o => { if (!(id in col(n))) throw new Error('update: doc absent ' + n + '/' + id); Object.assign(col(n)[id], clone(o)); },
    delete: async () => { delete col(n)[id]; },
  });
  const query = (n, pred) => ({
    get: async () => snap(n, pred),
    where: (f, op, v) => query(n, d => pred(d) && d[f] === v),
    orderBy: f => ({ get: async () => { const s = snap(n, pred); s.docs.sort((a, b) => String(a.data()[f]).localeCompare(String(b.data()[f]))); return s; } }),
  });
  return {
    store, reads: { n: 0 },
    doc: p => { const [n, id] = p.split('/'); return docRef(n, id); },
    collection: n => ({ ...query(n, () => true), add: async o => { const id = 'id' + (++seq); col(n)[id] = clone(o); return { id }; }, doc: id => docRef(n, id) }),
  };
}

let failures = 0, passed = 0;
function ok(cond, label) { if (cond) { passed++; } else { failures++; console.log('  ✗ ÉCHEC :', label); } }
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));

(async () => {
  const fake = makeFakeDb(); const saved = []; const warns = []; const errors = [];
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.claude = { use: async n => (n === 'db' ? fake : n === 'downloads' ? { save: async r => { saved.push(r); return { status: 'saved' }; } } : null) };
      w.console.warn = (...a) => warns.push(a.join(' '));
      w.console.error = (...a) => errors.push(a.map(x => (x && x.stack) || String(x)).join(' '));
    },
  });
  const w = dom.window, d = w.document, ev = c => w.eval(c);
  const set = (id, v) => { const el = d.getElementById(id); if (!el) throw new Error('champ absent : ' + id); el.value = v; };
  const toasts = () => [...d.querySelectorAll('.toast')].map(t => t.textContent);
  await tick(20);

  // --- démarrage ---
  ok(d.getElementById('app').innerHTML.includes('Se connecter') && d.getElementById('app').innerHTML.includes('Les formules'), 'site public affiché');
  // --- code coach : première utilisation ---
  w.renderAuth('coach'); await tick(40);
  ok(!!d.getElementById('setup-code'), 'première ouverture : création du code coach');
  set('setup-code','111111'); set('setup-code2','111111'); await w.saveCoachSetup(); await tick(10);
  ok(d.getElementById('auth-error').textContent.includes('évident'), 'code trop évident refusé');
  set('setup-code','482913'); set('setup-code2','482913'); await w.saveCoachSetup(); await tick(80);
  ok(fake.store.settings && fake.store.settings.auth && fake.store.settings.auth.coachHash && !JSON.stringify(fake.store.settings.auth).includes('482913'), 'code coach stocké haché, jamais en clair');
  ok(!!d.querySelector('.tabbar'), 'espace coach ouvert après création du code');
  ok(warns.length === 0, 'aucune action verrouillée inconnue : ' + warns.join(' | '));

  // --- tout gestionnaire inline pointe vers une fonction définie ---
  const js = fs.readFileSync(path.join(__dirname, '..', 'src', 'split', 'app.js'), 'utf8');
  const names = new Set(); let m; const re = /on(?:click|input|change)="(?:closeModal\(\);)?([A-Za-z_]\w*)\(/g;
  while ((m = re.exec(js))) names.add(m[1]);
  const missing = [...names].filter(n => typeof w[n] !== 'function');
  ok(names.size > 100 && missing.length === 0, 'gestionnaires inline tous définis (' + names.size + ') ; manquants : ' + missing.join(','));
  const decl = {}; js.replace(/^(?:async )?function (\w+)/gm, (_, n) => { decl[n] = (decl[n] || 0) + 1; });
  ok(Object.values(decl).every(c => c === 1), 'aucune fonction déclarée en double');

  // --- règles pures ---
  ok(ev("addMonthsClamped('2026-01-31',1)") === '2026-02-28' && ev("addMonthsClamped('2026-01-31',2)") === '2026-03-31', 'fin de mois : 31/01 → 28/02 → 31/03');
  ok(ev("addMonthsClamped('2028-01-30',1)") === '2028-02-29', 'année bissextile');
  let per = ev("computePeriods({segments:[{start:'2026-08-10',end:null}]},'2026-11-11')");
  ok(per.length === 4 && per[0].end === '2026-09-10' && per[3].start === '2026-11-10', 'périodes glissantes 10/08 → 10/09 …');
  per = ev("computePeriods({segments:[{start:'2026-08-10',end:'2026-09-25'}]},'2026-11-11')");
  ok(per.length === 2 && per[1].end === '2026-09-25' && per[1].tronquee, 'pause : dernière période tronquée, pas de renouvellement');
  per = ev("computePeriods({segments:[{start:'2026-08-10',end:'2026-09-10'}]},'2026-11-11')");
  ok(per.length === 1, 'pause le jour du renouvellement : pas de nouvelle période');
  const cnt = ev(`(function(){const p=computePeriods({segments:[{start:'2026-08-10',end:null}]},'2026-11-11');
    const pr=[{clientId:'c',type:'avec',paiement:true,statut:'faite',date:'2026-09-10'},{clientId:'c',type:'avec',paiement:true,statut:'annulee',date:'2026-08-20'},{clientId:'c',type:'avec',paiement:false,statut:'faite',date:'2026-08-21'},{clientId:'x',type:'avec',paiement:true,statut:'faite',date:'2026-08-21'}];
    return [countPaidSessions(pr,'c',p[0]),countPaidSessions(pr,'c',p[1])];})()`);
  ok(cnt[0] === 0 && cnt[1] === 1, 'séance du jour charnière comptée une seule fois ; annulée/impayée/autre client exclues');
  ok(JSON.stringify(ev('[0,2,3,4,5,9].map(suiviTarif)')) === '[89,89,62,36,0,0]', 'tarif dégressif du suivi');
  ok(ev("calcDiet({poids:'80',taille:'',age:30,genre:'homme',niveau:'leger'})") === null, 'calcul diét refusé si taille manquante');
  const diet = ev("calcDiet({poids:'80',taille:'180',age:30,genre:'homme',niveau:'leger'})");
  ok(diet.maintienSans === Math.round(1780 * 1.2) && diet.maintienAvec === Math.round(1780 * 1.375) && diet.proteines === 144 && diet.regimeAvec === Math.round(1780 * 1.375 - 400), 'calcul diét inchangé (Mifflin-St Jeor)');
  ok(ev(`unesc(esc('a<b>"c"&d'))`) === 'a<b>"c"&d', 'échappement réversible');

  // --- création client par le coach, avec un nom piégeux ---
  await w.showCoach();
  w.openNewClientModal();
  const NASTY = 'Jean "Le <b>Roc</b>" & Co';
  set('q-prenom', ''); set('q-nom', '');
  await w.wizardNext();
  ok(ev('S.wizardStep') === 0, 'prénom/nom exigés dès la première étape');
  set('q-prenom', NASTY); set('q-nom', "D'Artagnan"); set('q-objectif', 'perte <i>de</i> poids');
  await w.wizardNext();
  w.wizardPrev();
  ok(d.getElementById('q-prenom').value === NASTY, 'retour arrière : le champ réaffiche le texte exact');
  await w.wizardNext();
  set('q-genre', 'homme'); set('q-dateNaissance', '1990-05-15'); set('q-taille', '180'); set('q-poids', '80'); set('q-adresseCoaching', '1 rue "du" Port');
  for (let i = 0; i < 6; i++) await w.wizardNext();
  await tick(30);
  const clients = Object.entries(fake.store.clients || {});
  ok(clients.length === 1 && clients[0][1].prenom === NASTY, 'client enregistré en texte brut dans la base');
  const cid = clients[0][0];
  ok(/^\d{6}$/.test(clients[0][1].accessCode||''), 'client créé par le coach : code d\'accès à 6 chiffres généré');
  const ccode = clients[0][1].accessCode;
  ok(fake.store.bilans[cid].valide === true && fake.store.bilans[cid].maintienSans > 0, 'bilan créé, validé, avec calcul');
  ok(!d.querySelector('#main h1 b') && !d.querySelector('#main i') && d.querySelector('#main h1').textContent.includes(NASTY), 'nom affiché tel quel, sans HTML injecté');

  // --- bilan : le type de plan survit à un enregistrement ---
  w.switchTab('planningAlim'); await tick(20);
  set('pa-typeplan', 'regime_avec'); await w.saveTypePlan(); await tick(10);
  w.switchTab('bilan'); await tick(10);
  ok(d.getElementById('tabcontent').textContent.includes('1 rue "du" Port'), 'bilan en lecture : adresse avec guillemets affichée entière');
  w.openBilanGeneral(); await tick(5);
  ok(d.getElementById('b-adresseCoaching').value === '1 rue "du" Port', 'champ avec guillemets réaffiché entier dans la fenêtre');
  set('b-notes', 'note <script>x</script>'); await w.saveBilan(); await tick(10);
  ok(fake.store.bilans[cid].typePlan === 'regime_avec', 'enregistrer le bilan conserve le type de plan');
  ok(fake.store.bilans[cid].notes === 'note <script>x</script>' && !d.querySelector('#tabcontent script'), 'notes stockées brutes, jamais exécutées');

  // --- séances : double-clic, chevauchement ---
  const day = n => { const x = new Date(); x.setDate(x.getDate() + n); return ev('toLocalISO')(x); };
  w.switchTab('seance'); await tick(20);
  w.openNewSeanceModal(); set('s-date', day(3)); set('s-type', 'avec'); set('s-formule', 'express'); set('s-heure', '10:00');
  await Promise.all([w.createSeance(), w.createSeance(), w.createSeance()]); await tick(20);
  ok(Object.keys(fake.store.programmes).length === 1, 'triple clic = une seule séance');
  w.openNewSeanceModal(); set('s-date', day(3)); set('s-type', 'avec'); set('s-formule', 'express'); set('s-heure', '11:15');
  await w.createSeance(); w.closeModal(); await tick(10);
  ok(Object.keys(fake.store.programmes).length === 1 && toasts().some(t => t.includes('30 min')), 'séance refusée sans 30 min de trajet');

  // --- cycle, attribution, validation en séance par le coach ---
  await fake.collection('cycles_bib').add({ nom: 'Cycle A', entrainements: [
    { nom: 'Haut', mouvements: [{ nom: 'Développé couché', series: 6, repsCible: 12, repsSeuilBas: 8, chargeDepart: 50, chargeActuelle: 50, surchargeProgressive: true, augmentation: 2.5 }, { nom: 'Gainage', series: 3, repsCible: 0, repsSeuilBas: 0, chargeDepart: 0, chargeActuelle: 0, surchargeProgressive: false, augmentation: 0, tempsWork: '60' }] },
    { nom: 'Bas', mouvements: [{ nom: 'Squat', series: 5, repsCible: 5, repsSeuilBas: 3, chargeDepart: 80, chargeActuelle: 100, surchargeProgressive: true, augmentation: 5 }] }] });
  const tplId = Object.keys(fake.store.cycles_bib)[0];
  await tick(10);
  w.switchTab('entrainement'); await tick(20);
  ev('S.homeTab'); // no-op
  await w.assignCycleToClient(tplId); await tick(20);
  const attrId = Object.keys(fake.store.attributions)[0];
  await w.bulkValidateAttribution(attrId); await tick(20);
  w.switchTab('seance'); await tick(20);
  w.openNewSeanceModal(); set('s-date', day(5)); set('s-type', 'avec'); set('s-formule', 'classique'); set('s-heure', '14:00');
  await w.createSeance(); await tick(20);
  const seanceId = Object.entries(fake.store.programmes).find(([, p]) => p.attributionId)[0];
  ok(!d.getElementById('tabcontent').innerHTML.includes('Valider l\'entraînement moi-même'), 'séance future : pas encore de validation d\'entraînement');
  await w.markSeanceFaite(seanceId); await tick(30);
  ok(d.getElementById('tabcontent').innerHTML.includes('Valider l\'entraînement moi-même'), 'séance faite : bouton « Valider l\'entraînement moi-même » visible');
  await w.openValiderEntrainementSeance(seanceId); await tick(10);
  await w.confirmValiderEntrainementSeance(); await tick(10);
  ok(Object.keys(fake.store.entrainement_logs || {}).length === 0, 'répétitions vides : validation bloquée (pas de baisse de charge silencieuse)');
  set('cv-reps-0', '10');
  await Promise.all([w.confirmValiderEntrainementSeance(), w.confirmValiderEntrainementSeance()]); await tick(20);
  let attr = fake.store.attributions[attrId];
  ok(Object.keys(fake.store.entrainement_logs).length === 1, 'un seul journal malgré le double clic');
  ok(attr.entrainements[0].mouvements[0].chargeActuelle === 52.5 && attr.currentEntrainementIndex === 1 && attr.entrainements[0].valide === false, 'surcharge +2,5 kg, séquence avancée, revalidation demandée');
  ok(fake.store.programmes[seanceId].entrainementValide === true, 'séance marquée « entraînement validé »');
  const log0 = Object.values(fake.store.entrainement_logs)[0];
  ok(log0.resultats[1].repsMin === null, 'mouvement sans surcharge : répétitions facultatives');

  // --- espace client : entraînement en autonomie ---
  w.logout(); await tick(20);
  w.renderAuth('client'); await tick(60);
  for(let i=0;i<5;i++){ set('auth-code','000000'); await w.submitAuth(); await tick(10); }
  ok(d.getElementById('auth-error').textContent.includes('30 secondes'), 'verrouillage après 5 codes faux');
  set('auth-code', ccode); await w.submitAuth(); await tick(10);
  ok(d.getElementById('auth-error').textContent.includes('Réessayez'), 'bon code refusé pendant le verrouillage');
  ev('AUTH.lockedUntil=0');
  set('auth-code', ccode); await w.submitAuth(); await tick(80);
  ok(d.getElementById('main').innerHTML.includes('Niveau') && !d.querySelector('#main b b'), 'profil client affiché');
  fake.store.attributions[attrId].entrainements[1].mouvements[0].chargeActuelle = 100; // simule des séances précédentes
  w.switchClientTab('entrainement'); await tick(20);
  await w.renderClientEntrainementDetail(); await tick(10);
  await w.submitEntrainementLog(); await tick(10);
  ok(Object.keys(fake.store.entrainement_logs).length === 1, 'client : répétitions vides refusées');
  set('log-reps-0', '2'); // sous le seuil 3 → moyenne(80,100)=90
  const p1 = w.submitEntrainementLog(); const p2 = w.submitEntrainementLog(); await Promise.all([p1, p2]); await tick(20);
  await w.submitEntrainementLog().catch(() => {}); await tick(20);
  attr = fake.store.attributions[attrId];
  ok(Object.keys(fake.store.entrainement_logs).length === 2, 'client : une seule validation enregistrée');
  ok(attr.entrainements[1].mouvements[0].chargeActuelle === 90 && attr.entrainements[1].mouvements[0].chargeDepart === 90 && attr.currentEntrainementIndex === 0, 'sous le seuil : charge = moyenne(départ, actuelle), séquence bouclée');
  // demande de séance à une date passée
  w.switchClientTab('plus','demande'); await tick(40);
  set('dm-date', day(-1)); set('dm-heure', '10:00'); await w.envoyerDemande(); await tick(10);
  ok(Object.keys(fake.store.demandes || {}).length === 0, 'demande à une date passée refusée');
  set('dm-date', day(7)); set('dm-heure', '18:00'); await w.envoyerDemande(); await tick(10);
  ok(Object.keys(fake.store.demandes || {}).length === 1, 'demande valide enregistrée');
  // journal alimentaire + recette
  w.switchClientTab('planningAlim'); await tick(20);
  await w.seedProduitsBib(); await tick(30);
  ok(Object.keys(fake.store.produits_bib).length === 32, 'liste de départ : 32 aliments');
  w.openRecetteBuilder(); set('rc-nom', 'Bol "maison"'); set('rc-guide', 'Mélanger');
  set('rc-ing-select', Object.keys(fake.store.produits_bib)[0]); set('rc-ing-qte', '150'); w.addRecetteIngredient();
  ok(d.getElementById('rc-nom').value === 'Bol "maison"', 'recette : le nom saisi survit à l\'ajout d\'un ingrédient');
  await w.saveRecette(); await tick(20);
  const rid = Object.keys(fake.store.recettes)[0];
  ok(fake.store.recettes[rid].nom === 'Bol "maison"' && Math.round(fake.store.recettes[rid].kcal) === Math.round(165 * 1.5), 'recette enregistrée avec ses totaux');
  await w.logRecetteToJournal(rid); await tick(20);
  ok(!d.getElementById('main').innerHTML.includes('null g'), 'journal : pas de « null g »');

  // --- suivi mensuel côté coach ---
  await w.showCoach(); await tick(20); w.selectClient(cid); await tick(40);
  w.switchTab('suivi'); await tick(20);
  const back = n => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() - n); return ev('toLocalISO')(x); };
  set('sv-debut', back(2)); await w.startSuivi(); await tick(40);
  const sv = Object.keys(fake.store.suivis || {});
  ok(sv.length === 3 && sv.every(k => k.startsWith(cid + '_')), 'suivi : 3 périodes générées depuis 2 mois (' + sv.length + ')');
  // --- tableau de bord : périodes générées sans ouvrir l'onglet Suivi ---
  delete fake.store.suivis; await tick(1);
  ev('S.currentId=null'); await fake.collection('suivi_config').doc(cid).set(fake.store.suivi_config[cid]); // rien ne change, simple relecture
  w.goHome(); await tick(120);
  ok(Object.keys(fake.store.suivis || {}).length === 3 && d.getElementById('hometabcontent').innerHTML.includes('Suivi mensuel'), 'journée : périodes recréées et impayé de suivi listé dans À faire');
  // sauvegarde
  await w.exportBackup(); await tick(20);
  const bk = saved[0] && JSON.parse(saved[0].data);
  ok(bk && bk.collections.clients[0].prenom === NASTY && /\.json$/.test(saved[0].filename), 'sauvegarde JSON téléchargée, texte brut');
  // onglet aliments coach
  w.switchHomeTab('aliments'); await tick(80);
  const pid = Object.keys(fake.store.produits_bib)[0];
  await w.renderAlimentsTab(pid); await tick(20);
  set('al-kcal100', '170'); await w.saveProduitCoach(pid); await tick(20);
  ok(fake.store.produits_bib[pid].kcal100 === 170, 'coach : aliment modifié');
  await w.deleteProduit(pid); await tick(20);
  ok(!(pid in fake.store.produits_bib), 'coach : aliment supprimé');
  // modèle de cycle : noms conservés
  w.switchHomeTab('bibcycles'); await tick(60);
  await w.startNewCycleTemplate(); set('cb-template-nom', 'PPL "A"'); set('ent-nom-0', 'Push'); w.addEntrainementToBuilder();
  ok(d.getElementById('cb-template-nom').value === 'PPL "A"' && d.getElementById('ent-nom-0').value === 'Push', 'modèle de cycle : noms conservés après ajout');
  await w.saveCycle(); await tick(20);
  ok(Object.values(fake.store.cycles_bib).some(c => c.nom === 'PPL "A"' && c.entrainements.length === 2), 'modèle de cycle enregistré');

  // --- suppression complète du client ---
  await fake.collection('demandes_rdv').add({ clientId: cid, statut: 'attente' });
  await fake.collection('lecons_vues').doc(cid + '_x').set({ clientId: cid, leconId: 'x' });
  w.selectClient(cid); await tick(60);
  await w.deleteClient(); await tick(120);
  const leftovers = Object.entries(fake.store).filter(([n, docs]) => Object.entries(docs).some(([id, v]) => v.clientId === cid || id === cid)).map(([n]) => n);
  ok(leftovers.length === 0, 'suppression client : plus aucune donnée orpheline (' + leftovers.join(',') + ')');
  ok(!d.querySelector('.tabbar .count'), 'compteur à traiter remis à zéro après suppression');

  ok(errors.length === 0, 'aucune erreur JavaScript : ' + errors.slice(0, 3).join(' || ').slice(0, 600));
  console.log(`\n${passed} réussis, ${failures} échec(s)`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('ERREUR DE TEST', e); process.exit(2); });
