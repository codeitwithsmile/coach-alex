const LOGO_SRC = "assets/logo.png";
const HERO_SRC = "assets/hero.jpg";
const ABOUT_SRC = "assets/about.jpg";
const EXPRESS_PRICE=60, CLASSIQUE_PRICE=90;

// ---------- QUESTIONNAIRE / CALCUL DIET ----------
const QFIELDS = [
  {key:'genre', label:'Genre', type:'select', section:'Profil général', options:[['homme','Homme'],['femme','Femme']]},
  {key:'dateNaissance', label:'Date de naissance', type:'date', section:'Profil général'},
  {key:'taille', label:'Taille (cm)', type:'number', section:'Profil général'},
  {key:'poids', label:'Poids (kg)', type:'number', section:'Profil général'},
  {key:'tourTaille', label:'Tour de taille (cm)', type:'number', section:'Profil général'},
  {key:'tourHanches', label:'Tour de hanches (cm)', type:'number', section:'Profil général'},
  {key:'tourCuisse', label:'Tour de cuisse (cm)', type:'number', section:'Profil général'},
  {key:'tourBras', label:'Tour de bras (cm)', type:'number', section:'Profil général'},
  {key:'estimationKilos', label:'Si perte de poids : estimation des kilos à perdre', type:'text', section:'Profil général'},
  {key:'adresseCoaching', label:'Adresse du lieu de coaching', type:'text', section:'Profil général'},
  {key:'typeActivitePro', label:"Votre métier, et s'il est plutôt assis, debout ou physique", type:'text', section:'Activité professionnelle'},
  {key:'intensiteActivitePro', label:"Intensité physique du travail", type:'scale', section:'Activité professionnelle'},
  {key:'horairesTravail', label:'Horaires de travail', type:'text', section:'Activité professionnelle'},
  {key:'fatigueTravail', label:'Fatigue en fin de journée', type:'scale', section:'Activité professionnelle'},
  {key:'particularitesHormonales', label:'Particularités hormonales', type:'text', section:'Santé'},
  {key:'contreIndicationsAlimentaires', label:'Contre-indications alimentaires', type:'text', section:'Santé'},
  {key:'contreIndicationsActivite', label:"Contre-indications pour l'activité physique", type:'text', section:'Santé'},
  {key:'allergies', label:'Allergies', type:'text', section:'Santé'},
  {key:'problemesCycle', label:'Problèmes liés au cycle menstruel', type:'yesno', section:'Santé'},
  {key:'grossesse', label:'Grossesse, allaitement, post-partum', type:'yesno', section:'Santé'},
  {key:'alcool', label:"Consommation d'alcool", type:'text', section:'Santé'},
  {key:'tabac', label:'Consommation de tabac', type:'yesno', section:'Santé'},
  {key:'drogues', label:'Consommation de drogues', type:'yesno', section:'Santé'},
  {key:'autresPrecisionsSante', label:'Autres précisions', type:'text', section:'Santé'},
  {key:'passif', label:'Passif (surpoids, sport, trouble alimentaire...)', type:'textarea', section:'Passé et contexte émotionnel'},
  {key:'dejaCoach', label:'Déjà suivi par un coach sportif ? Quand/comment/pourquoi', type:'textarea', section:'Passé et contexte émotionnel'},
  {key:'problemeAlimentaire', label:'Problème alimentaire actuel ou passé', type:'textarea', section:'Passé et contexte émotionnel'},
  {key:'situationEmotionnelle', label:'Situation émotionnelle actuelle', type:'textarea', section:'Passé et contexte émotionnel'},
  {key:'reactionStress', label:'Sensibilité au stress', type:'scale', section:'Passé et contexte émotionnel'},
  {key:'enfants', label:'Des enfants ?', type:'yesno', section:'Passé et contexte émotionnel'},
  {key:'niveauActivite', label:"Niveau d'activité (pour le calcul diététique)", type:'select', section:'Sport et activité physique', options:[['sedentaire','Sédentaire (sans entraînement)'],['leger','Légèrement actif (avec entraînement)'],['actif','Actif (travail éprouvant + entraînement intense)']]},
  {key:'activitesSportivesActuelles', label:'Activités sportives actuelles', type:'text', section:'Sport et activité physique'},
  {key:'pretAjouterActivite', label:'Prêt(e) à ajouter une activité ?', type:'yesno', section:'Sport et activité physique'},
  {key:'tempsDisponible', label:'Temps disponible pour cette activité', type:'text', section:'Sport et activité physique'},
  {key:'motivationSport', label:'Motivation pour le sport', type:'scale', section:'Sport et activité physique'},
  {key:'toleranceDifficulte', label:'Tolérance à la difficulté et à la faim', type:'scale', section:'Sport et activité physique'},
  {key:'sommeil', label:'Qualité et durée moyenne du sommeil', type:'text', section:'Mode de vie / habitudes'},
  {key:'nombreRepas', label:'Nombre de repas par jour et régularité', type:'text', section:'Mode de vie / habitudes'},
  {key:'quiCuisine', label:'Qui cuisine / temps disponible pour cuisiner', type:'text', section:'Mode de vie / habitudes'},
  {key:'budgetAlimentaire', label:'Budget alimentaire', type:'text', section:'Mode de vie / habitudes'},
  {key:'regimesEssayes', label:'Régimes déjà essayés (résultats/ressenti)', type:'textarea', section:'Mode de vie / habitudes'},
  {key:'alimentsRefuses', label:"Aliments non aimés ou refusés", type:'text', section:'Mode de vie / habitudes'},
  {key:'consommationEau', label:"Consommation d'eau quotidienne", type:'text', section:'Mode de vie / habitudes'},
  {key:'frequenceSocial', label:'Fréquence des activités sociales', type:'text', section:'Mode de vie / habitudes'},
  {key:'niveauMotivation', label:'Motivation aujourd\u2019hui', type:'scale10', section:'Mode de vie / habitudes'},
  {key:'entourage', label:'Entourage : soutien ou frein au changement', type:'text', section:'Mode de vie / habitudes'},
];
const QSECTIONS_ORDER = ['Profil général','Activité professionnelle','Santé','Passé et contexte émotionnel','Sport et activité physique','Mode de vie / habitudes'];
function qFieldHtml(f, value){
  value = (value===undefined||value===null) ? '' : value;
  const id = 'q-'+f.key;
  if(f.type==='select'){
    const opts = f.key==='niveauActivite' ? NIVEAU_OPTIONS : f.options;
    return `<label>${f.label}</label>${segSelect(id, opts, value||(f.key==='niveauActivite'?'':''))}${f.key==='niveauActivite'?`<p class="note" style="margin-top:6px">${NIVEAU_HELP}</p>`:''}`;
  }
  if(f.type==='scale' || f.type==='scale10'){
    const max = f.type==='scale10'?10:5; const cur = parseInt(value,10);
    return `<label>${f.label}</label><div class="scale ${max===10?'ten':''}" role="radiogroup" aria-label="${f.label}">${[...Array(max)].map((_,i)=>`<button type="button" role="radio" aria-checked="${cur===i+1}" class="${cur===i+1?'active':''}" onclick="pickScale('${id}',${i+1},this)">${i+1}</button>`).join('')}</div><div class="scale-ends"><span>${max===10?'Pas du tout':'Faible'}</span><span>${max===10?'Au maximum':'Fort'}</span></div><input type="hidden" id="${id}" value="${value}">`;
  }
  if(f.type==='yesno'){
    const v = String(value).trim(); const isYes = /^oui/i.test(v), isNo = /^non/i.test(v);
    const detail = (isYes||isNo) ? v.replace(/^(oui|non)[\s,:.-]*/i,'') : (v? v : '');
    return `<label>${f.label}</label><div class="yesno" role="radiogroup" aria-label="${f.label}">
      <button type="button" role="radio" aria-checked="${isNo}" class="${isNo?'active':''}" onclick="pickYesNo('${id}','Non',this)">Non</button>
      <button type="button" role="radio" aria-checked="${isYes}" class="${isYes?'active':''}" onclick="pickYesNo('${id}','Oui',this)">Oui</button>
    </div><input type="text" id="${id}-detail" placeholder="Précision (optionnel)" value="${detail}" style="margin-top:6px"><input type="hidden" id="${id}" value="${isYes?'Oui':(isNo?'Non':'')}">`;
  }
  if(f.type==='textarea') return `<label for="${id}">${f.label}</label><textarea id="${id}" rows="3">${value}</textarea>`;
  if(f.type==='number'){
    const unit = /\(cm\)/.test(f.label) ? 'cm' : (/\(kg\)/.test(f.label) ? 'kg' : '');
    const label = f.label.replace(/ \((cm|kg)\)/,'');
    return `<label for="${id}">${label}</label>${unit? unitInput(id, unit, value, {decimal:true}) : `<input type="text" inputmode="decimal" id="${id}" value="${value}">`}`;
  }
  if(f.type==='date') return `<label for="${id}">${f.label}</label><input type="date" id="${id}" value="${value}">`;
  return `<label for="${id}">${f.label}</label><input type="text" id="${id}" value="${value}">`;
}
// Champ numérique avec unité intégrée (kg, cm, ans…)
function unitInput(id, unit, value, opts){
  opts=opts||{};
  return `<div class="field"><input type="text" inputmode="${opts.decimal?'decimal':'numeric'}" id="${id}" value="${value===undefined||value===null?'':value}" ${opts.placeholder?`placeholder="${opts.placeholder}"`:''}><span class="unit">${unit}</span></div>`;
}
// Choix à 2–4 options en boutons (remplace les listes déroulantes courtes)
function segSelect(id, options, value){
  return `<div class="segsel" role="radiogroup">${options.map(([v,l])=>`<button type="button" role="radio" aria-checked="${value===v}" class="${value===v?'active':''}" onclick="pickScale('${id}','${v}',this)">${l}</button>`).join('')}</div><input type="hidden" id="${id}" value="${value||''}">`;
}
const NIVEAU_OPTIONS = [['sedentaire','Sédentaire'],['leger','Légèrement actif'],['actif','Actif']];
const NIVEAU_HELP = 'Sédentaire : sans entraînement. Légèrement actif : avec entraînement. Actif : travail éprouvant et entraînement intense.';
function pickScale(id, v, btn){
  const inp=document.getElementById(id); if(inp) inp.value=String(v);
  const g=btn.parentElement; [...g.children].forEach(b=>{ b.classList.toggle('active', b===btn); b.setAttribute('aria-checked', b===btn?'true':'false'); });
}
function pickYesNo(id, v, btn){
  const inp=document.getElementById(id); if(inp) inp.value=v;
  const g=btn.parentElement; [...g.children].forEach(b=>{ b.classList.toggle('active', b===btn); b.setAttribute('aria-checked', b===btn?'true':'false'); });
}
// Valeur d'un champ du questionnaire (oui/non + précision fusionnés)
function qVal(key){
  const f = QFIELDS.find(x=>x.key===key); const id='q-'+key;
  if(!document.getElementById(id)) return undefined;
  if(f && f.type==='yesno'){ const base=val(id); const det=val(id+'-detail').trim(); return base ? (det? base+', '+det : base) : det; }
  return val(id);
}
function qDisplay(f, v){
  if(v===undefined||v===null||String(v).trim()==='') return '';
  if(f.type==='select'){ const o=f.options.find(x=>x[0]===v); return o?o[1]:v; }
  if(f.type==='scale') return v+' / 5';
  if(f.type==='scale10') return v+' / 10';
  return String(v);
}
const MULT = {sedentaire:1.2, leger:1.375, actif:1.55};
const DIET_RATIOS = {
  homme:{sedentaire:{p:1.6,l:1.1}, leger:{p:1.8,l:1.2}, actif:{p:2,l:1.3}},
  femme:{sedentaire:{p:1.4,l:1}, leger:{p:1.6,l:1.1}, actif:{p:1.8,l:1.2}}
};
function ageFromBirthdate(d){
  if(!d) return 0;
  const today = new Date(); const bd = new Date(d+'T00:00:00');
  let age = today.getFullYear()-bd.getFullYear();
  const m = today.getMonth()-bd.getMonth();
  if(m<0 || (m===0 && today.getDate()<bd.getDate())) age--;
  return age;
}
function calcDiet(inp){
  const poids=parseFloat(inp.poids)||0, taille=parseFloat(inp.taille)||0, age=parseFloat(inp.age)||0;
  if(!(poids>0 && taille>0 && age>0)) return null;
  const genre = inp.genre==='femme'?'femme':'homme';
  const niveau = ['sedentaire','leger','actif'].includes(inp.niveau)?inp.niveau:'sedentaire';
  const bmr = genre==='homme' ? (10*poids+6.25*taille-5*age+5) : (10*poids+6.25*taille-5*age-161);
  let sansKey, avecKey;
  if(niveau==='actif'){ sansKey='leger'; avecKey='actif'; } else { sansKey='sedentaire'; avecKey='leger'; }
  const sansMet = bmr*MULT[sansKey], avecMet = bmr*MULT[avecKey];
  const r = DIET_RATIOS[genre][niveau];
  return {
    proteines: Math.round(r.p*poids), lipides: Math.round(r.l*poids),
    regimeAvec: Math.round(avecMet-400), regimeSans: Math.round(sansMet-400),
    maintienAvec: Math.round(avecMet), maintienSans: Math.round(sansMet),
    priseMasseAvec: Math.round(avecMet+200)
  };
}
const DIET_MISSING_MSG = 'Renseignez le genre, la date de naissance (ou l\u2019âge), le poids et la taille pour lancer le calcul.';
function dietResultHtml(d){
  if(!d) return `<div class="empty">${DIET_MISSING_MSG}</div>`;
  return `<div class="grid">
    <div class="stat"><div class="n">${d.proteines}g</div><div class="l">Protéines</div></div>
    <div class="stat"><div class="n">${d.lipides}g</div><div class="l">Lipides</div></div>
    <div class="stat"><div class="n">${d.regimeAvec}</div><div class="l">Régime · avec entr.</div></div>
    <div class="stat"><div class="n">${d.regimeSans}</div><div class="l">Régime · sans entr.</div></div>
    <div class="stat"><div class="n">${d.maintienAvec}</div><div class="l">Maintien · avec entr.</div></div>
    <div class="stat"><div class="n">${d.maintienSans}</div><div class="l">Maintien · sans entr.</div></div>
    <div class="stat"><div class="n">${d.priseMasseAvec}</div><div class="l">Prise de masse · avec entr.</div></div>
  </div>`;
}
function euro(n){return n.toFixed(0)+" €";}
function pad2(n){return String(n).padStart(2,'0');}
function toLocalISO(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function todayStr(){return toLocalISO(new Date());}
function fmtDate(s){if(!s)return"";const [y,m,d]=s.split("-");return d+"/"+m+"/"+y;}

// ---------- ICÔNES ----------
const ICON_FOLDER = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
const ICON_DOC = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h5M10 17h5"/></svg>';

const ICONS = {
  journee:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  planning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  clients:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></svg>',
  training:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M6 8v8M18 8v8M3 10v4M21 10v4"/></svg>',
  food:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 6v3h3v9"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  prev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  next:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
};
Object.assign(ICONS, {
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>',
  userplus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg>',
  euro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6a7 7 0 0 0-11 1.5A7 7 0 0 0 7 16.5 7 7 0 0 0 18 18M4 10h9M4 14h9"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 12l3-4M8 12a4 4 0 0 1 8 0"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM4 19a2 2 0 0 1 2-2h12"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-5 4 3 4-6"/></svg>',
  cycle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M3 7v5h5M21 17v-5h-5"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/></svg>'
});
// Vignette d'icône colorée (listes, en-têtes)
function ico(name, tone, size){ return `<span class="ic ${tone||''} ${size||''}">${ICONS[name]||''}</span>`; }
function initials(c){ return ((c.prenom||'')[0]||'')+((c.nom||'')[0]||''); }
const DAYSHORT=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
const DAYLONG=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function fmtDayLong(ds){ const d=new Date(ds+'T00:00:00'); return DAYLONG[d.getDay()]+' '+d.getDate(); }
function fmtDayShort(ds){ const d=new Date(ds+'T00:00:00'); return DAYSHORT[d.getDay()]+' '+d.getDate(); }
function fmtMonthYear(ds){ const [y,m]=ds.split('-'); return MONTHNAMES[parseInt(m,10)-1]+' '+y; }
function dureeLabel(formule){ return formule==='express'?'1 h':'2 h'; }
function formuleLabel(formule){ return formule==='express'?'Express':'Classique'; }

// ---------- ÉCHAPPEMENT HTML ----------
// Règle unique : tout texte présent en mémoire est déjà « prêt pour innerHTML ».
// Les textes sont échappés à la lecture (base : escDeep ; champs : val) et
// dé-échappés à l'écriture en base (unescDeep). La base contient donc toujours le texte brut.
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function unesc(s){ return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&'); }
function mapDeep(v, f){
  if(typeof v==='string') return f(v);
  if(Array.isArray(v)) return v.map(x=>mapDeep(x,f));
  if(v && typeof v==='object'){ const o={}; for(const k in v) o[k]=mapDeep(v[k],f); return o; }
  return v;
}
function escDeep(v){ return mapDeep(v, esc); }
function unescDeep(v){ return mapDeep(v, unesc); }

// Enveloppe autour de la base Claude : échappement, et cache de 30 s sur les lectures de
// collections entières (vidé à chaque écriture dans la collection concernée).
function makeSafeDb(raw){
  const cache = {}; const TTL = 30000;
  const invalidate = path => { delete cache[String(path).split('/')[0]]; };
  const exists = s => (typeof s.exists==='function' ? !!s.exists() : !!s.exists);
  const snapDoc = s => ({exists: exists(s), id: s.id, data: () => escDeep(s.data())});
  const snapQuery = s => ({docs: s.docs.map(d=>({id:d.id, data:()=>escDeep(d.data())}))});
  const write = async (path, fn) => { invalidate(path); try{ return await fn(); } finally{ invalidate(path); } };
  const wrapDoc = (ref, path) => ({
    get: async () => snapDoc(await ref.get()),
    set: o => write(path, () => ref.set(unescDeep(o))),
    update: o => write(path, () => ref.update(unescDeep(o))),
    delete: () => write(path, () => ref.delete())
  });
  const wrapQuery = q => ({
    get: async () => snapQuery(await q.get()),
    where: (...a) => wrapQuery(q.where(...a)),
    orderBy: (...a) => wrapQuery(q.orderBy(...a))
  });
  return {
    doc: path => wrapDoc(raw.doc(path), path),
    collection: name => {
      const c = raw.collection(name);
      return {
        get: async () => {
          const hit = cache[name];
          if(hit && Date.now()-hit.t < TTL) return snapQuery(await hit.p);
          const entry = {t:Date.now(), p:c.get()};
          cache[name] = entry;
          try{ return snapQuery(await entry.p); }
          catch(e){ if(cache[name]===entry) delete cache[name]; throw e; }
        },
        where: (...a) => wrapQuery(c.where(...a)),
        orderBy: (...a) => wrapQuery(c.orderBy(...a)),
        add: o => write(name, () => c.add(unescDeep(o))),
        doc: id => wrapDoc(c.doc(id), name+'/'+id)
      };
    }
  };
}

// Base hors ligne : tout est gardé dans le navigateur de l'appareil (localStorage), même API que la base Claude.
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
// Mode Firebase : la page est servie par Firebase Hosting avec un fichier config.js qui définit
// window.COACH_ALEX_CONFIG = { coachEmail, firebase:{...} }. Firestore (compat) expose la même API
// que la base Claude (doc/collection/where/orderBy/get/set/update/delete/add), donc makeSafeDb s'y branche tel quel.
let FIREBASE_MODE = false;
const FB = {auth:null, fs:null, user:null, role:null, clientId:null};
function fbConfig(){ return (typeof window !== 'undefined' && window.COACH_ALEX_CONFIG && window.COACH_ALEX_CONFIG.firebase) ? window.COACH_ALEX_CONFIG : null; }
function fbCoachEmail(){ const c = fbConfig(); return c && c.coachEmail ? String(c.coachEmail).trim().toLowerCase() : ''; }
function isCoachRole(){ return !FIREBASE_MODE || FB.role === 'coach'; }
function fbInit(){
  const cfg = fbConfig();
  if(!cfg || typeof firebase === 'undefined' || !firebase.initializeApp) return null;
  try{
    if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg.firebase);
    FB.fs = firebase.firestore();
    try{ FB.fs.settings({ignoreUndefinedProperties:true}); }catch(e){}
    FB.auth = firebase.auth();
    try{ FB.auth.useDeviceLanguage(); }catch(e){}
    FIREBASE_MODE = true;
    return FB.fs;
  }catch(e){ console.error('Firebase', e); return null; }
}
function fbWaitAuth(){
  return new Promise(resolve => { const off = FB.auth.onAuthStateChanged(u => { FB.user = u || null; off(); resolve(u || null); }); });
}
async function fbResolveRole(){
  FB.role = null; FB.clientId = null;
  const u = FB.auth.currentUser; if(!u) return null;
  const email = (u.email || '').toLowerCase();
  if(email && email === fbCoachEmail()){ FB.role = 'coach'; return 'coach'; }
  const link = await db.doc('users/'+u.uid).get();
  if(link.exists && link.data().clientId){ FB.role = 'client'; FB.clientId = link.data().clientId; return 'client'; }
  FB.role = 'pending'; return 'pending';
}
function fbErrorMessage(e){
  const code = (e && e.code) || '';
  const map = {
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-login-credentials': 'E-mail ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
    'auth/weak-password': 'Mot de passe trop court : 8 caractères minimum.',
    'auth/too-many-requests': 'Trop d’essais. Réessayez dans quelques minutes.',
    'auth/network-request-failed': 'Pas de connexion. Vérifiez votre réseau.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet e-mail : connectez-vous avec votre mot de passe.',
    'auth/unauthorized-domain': 'Ce domaine n\u2019est pas autorisé dans Firebase (Authentication → Domaines autorisés).',
    'permission-denied': 'Accès refusé.'
  };
  return map[code] || 'Une erreur est survenue. Réessayez.';
}

function hasClaudeApi(){ return typeof claude !== 'undefined' && claude && typeof claude.use === 'function'; }

let db=null;
let S={view:'landing',clients:[],currentId:null,tab:'suivi',homeTab:'journee',planDay:null,clientsSearch:'',clientsFilter:'all',clientTab:'accueil',weekOffset:0,seanceWeekOffset:0,bilan:null,evolutions:[],programmes:[],suiviConfig:null,suivis:[],ready:false,wizardStep:0,wizardData:{},wizardMode:'coach'};

function applyTheme(){
  let t='auto'; try{ t = localStorage.getItem('coachalex.theme') || 'auto'; }catch(e){}
  const root = document.documentElement;
  if(t==='auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  return t;
}
function setTheme(t){ try{ localStorage.setItem('coachalex.theme', t); }catch(e){} applyTheme(); if(S.view==='client' && S.currentClientObj) renderClientProfileArea(); else if(S.view==='coach') render(); }
async function boot(){
  applyTheme();
  document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;width:100%">Chargement…</div>';
  let raw=null;
  raw = fbInit();
  if(!raw && hasClaudeApi()){ try{ raw = await claude.use("db"); }catch(e){ raw=null; } }
  if(!raw){ raw = makeLocalDb(); LOCAL_MODE = !!raw; }
  db = raw ? makeSafeDb(raw) : null;
  if(!db){
    document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Le stockage n\'est pas disponible dans ce navigateur.</div>';
    return;
  }
  if(FIREBASE_MODE){
    try{ S.site = await loadSiteSettings(); }catch(e){ console.error(e); S.site = Object.assign({}, SITE_DEFAULTS); }
    await fbWaitAuth();
    let role = null;
    try{ role = await fbResolveRole(); }catch(e){ console.error(e); }
    if(role==='coach'){ await showCoach(); return; }
    if(role==='client'){ const ok = await fbOpenClient(); if(ok) return; }
    if(role==='pending'){ renderAuth('client'); return; }
    renderLanding(); return;
  }
  const sess = readSession();
  if(sess && sess.role==='coach'){ showCoach(); return; }
  if(sess && sess.role==='client' && sess.clientId){ const ok = await openClientProfileView(sess.clientId, true); if(ok) return; clearSession(); }
  renderLanding();
}
function showLanding(){ S.view='landing'; renderLanding(); }
async function showCoach(){ S.view='coach'; S.homeTab=S.homeTab||'journee'; await loadClients(); render(); }
function showClientSpace(){ S.view='client'; renderClientSpace(); }
async function logout(){
  clearSession(); S.currentId=null; S.currentClientObj=null; S.homeTab='journee';
  if(FIREBASE_MODE){ try{ await FB.auth.signOut(); }catch(e){} FB.user=null; FB.role=null; FB.clientId=null; }
  showLanding();
}
// Ouvre l'espace du client relié au compte connecté (mode Firebase).
async function fbOpenClient(){
  const id = FB.clientId; if(!id) return false;
  const bilan = await db.doc('bilans/'+id).get();
  if(!bilan.exists || bilan.data().valide===false){
    renderAuth('client'); showAuthError('Votre bilan n\u2019a pas encore été validé par votre coach. Réessayez après son appel.'); return true;
  }
  return await openClientProfileView(id, true);
}

// ---------- SESSION (mémorisée sur l'appareil) ----------
const SESSION_KEY = 'coachalex.session';
function readSession(){
  try{ const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function writeSession(obj, remember){
  try{ sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj)); if(remember) localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); else localStorage.removeItem(SESSION_KEY); }catch(e){}
}
function clearSession(){ try{ sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); }catch(e){} }

// ---------- CODES D'ACCÈS ----------
async function sha256(str){
  try{
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ let h=0; for(const ch of str){ h=((h<<5)-h+ch.charCodeAt(0))|0; } return 'x'+Math.abs(h).toString(16); }
}
function randomCode(){
  let code='';
  try{ const a=new Uint32Array(6); crypto.getRandomValues(a); code = Array.from(a).map(n=>String(n%10)).join(''); }
  catch(e){ code = String(Math.floor(100000+Math.random()*900000)); }
  if(/^(\d)\1{5}$/.test(code) || code==='123456') return randomCode();
  return code;
}
function fmtCode(code){ return code ? String(code).replace(/(\d{3})(\d{3})/, '$1 $2') : ''; }
async function loadAuth(){ const d = await db.doc('settings/auth').get(); return d.exists ? d.data() : null; }
async function loadSiteSettings(){
  const d = await db.doc('settings/site').get();
  return Object.assign({}, SITE_DEFAULTS, d.exists ? d.data() : {});
}
const SITE_DEFAULTS = {
  accroche: 'Reprendre confiance en vous, physiquement et mentalement.',
  sousTitre: 'Coaching sportif à domicile, à Bayonne et autour. Je viens chez vous avec le matériel, je construis votre programme et je vous accompagne sur l\u2019alimentation.',
  zone: 'Bayonne',
  bio: 'J\u2019aide les personnes à reprendre confiance en elles, physiquement et mentalement, à se dépasser et à réussir là où elles ont échoué avant.\n\nPour qui ? Tout le monde, avec une spécialité : perte de poids, débutants, renforcement, prise de masse musculaire.',
  specialites: 'Perte de poids, Débutants, Renforcement, Prise de masse',
  communes: 'Bayonne, Anglet, Biarritz, Ustaritz, Saint-Pierre-d\u2019Irube, Mouguerre',
  faq: 'Faut-il du matériel ?|Non. Je viens avec ce qu\u2019il faut : haltères, élastiques, tapis. Un peu de place dans le salon suffit.\nJe n\u2019ai jamais fait de sport, est-ce pour moi ?|Oui. Les débutants sont l\u2019une de mes spécialités : on part de votre niveau, avec des charges qui progressent à votre rythme.\nComment se passe le paiement ?|Chaque séance se règle après la séance. Le suivi mensuel se règle au début de chaque période, et devient moins cher à mesure que vous faites des séances.\nQue contient le suivi mensuel ?|Votre programme d\u2019entraînement pour vous entraîner seul, vos objectifs alimentaires recalculés à chaque pesée, mes enseignements et les challenges, le tout sur votre téléphone.',
  telephone: '', email: '', instagram: ''
};
async function ensureClientCode(clientId){
  const doc = await db.doc('clients/'+clientId).get();
  const c = doc.data()||{};
  if(c.accessCode){ if(FIREBASE_MODE) await ensureCodeDoc(c.accessCode, clientId); return c.accessCode; }
  const all = (await db.collection('clients').get()).docs.map(d=>d.data().accessCode).filter(Boolean);
  let code = randomCode(); while(all.includes(code)) code = randomCode();
  await db.doc('clients/'+clientId).update({accessCode:code});
  if(FIREBASE_MODE) await ensureCodeDoc(code, clientId);
  return code;
}
// En mode Firebase, un document codes/{code} = {clientId} permet au client de relier son compte en toute sécurité.
async function ensureCodeDoc(code, clientId){
  const d = await db.doc('codes/'+code).get();
  if(!d.exists || d.data().clientId!==clientId) await db.doc('codes/'+code).set({clientId, createdAt:todayStr()});
}
async function regenerateClientCode(clientId){
  const old = (S.clients.find(x=>x.id===clientId)||{}).accessCode;
  await db.doc('clients/'+clientId).update({accessCode:null});
  if(FIREBASE_MODE && old){ try{ await db.doc('codes/'+old).delete(); }catch(e){} }
  const code = await ensureClientCode(clientId);
  const c = S.clients.find(x=>x.id===clientId); if(c) c.accessCode = code;
  toast('Nouveau code généré');
  openClientActions();
}

// ---------- AUTHENTIFICATION ----------
let AUTH = {role:'client', fails:0, lockedUntil:0, remember:true};
function renderAuth(role){
  S.view='auth';
  if(role) AUTH.role = role;
  AUTH.fails = 0;
  document.getElementById('app').innerHTML = `
    <div class="auth">
      <a class="auth-back" onclick="showLanding()">${ICONS.back}Accueil</a>
      <div class="auth-box">
        <img src="${LOGO_SRC}" alt="" class="auth-logo">
        <div class="seg" role="tablist" aria-label="Type de compte">
          <button role="tab" aria-selected="${AUTH.role==='client'}" class="${AUTH.role==='client'?'active':''}" onclick="renderAuth('client')">Client</button>
          <button role="tab" aria-selected="${AUTH.role==='coach'}" class="${AUTH.role==='coach'?'active':''}" onclick="renderAuth('coach')">Coach</button>
        </div>
        <div id="auth-body"></div>
      </div>
    </div>`;
  renderAuthBody();
}
async function renderAuthBody(){
  const el = document.getElementById('auth-body');
  if(FIREBASE_MODE){ renderFbAuthBody(el); return; }
  if(AUTH.role==='coach'){
    const auth = await loadAuth();
    if(!auth){ renderCoachSetup(el); return; }
  }
  const isCoach = AUTH.role==='coach';
  el.innerHTML = `
    <h1 class="auth-title">${isCoach?'Espace coach':'Espace client'}</h1>
    <p class="auth-sub">${isCoach?'Saisissez votre code coach à 6 chiffres.':'Saisissez le code à 6 chiffres remis par votre coach.'}</p>
    <form onsubmit="event.preventDefault();submitAuth()" novalidate>
      <label for="auth-code">Code d\u2019accès</label>
      ${codeInputHtml('auth-code')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <label class="checkline" style="margin-top:14px"><input type="checkbox" id="auth-remember" ${AUTH.remember?'checked':''}> Rester connecté sur cet appareil</label>
      <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Se connecter</button>
    </form>
    ${isCoach ? '' : `<p class="auth-help">Pas encore de code ? <button class="link" onclick="startClientQuestionnaire()">Devenir client</button> ou demandez-le à votre coach.</p>`}
  `;
  setupCodeInput('auth-code', submitAuth);
}
function codeInputHtml(id){
  return `<div class="codefield"><input id="${id}" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="7" placeholder="000 000" aria-describedby="auth-error" autofocus></div>`;
}
function setupCodeInput(id, onComplete){
  const inp = document.getElementById(id); if(!inp) return;
  inp.addEventListener('input', ()=>{
    const digits = inp.value.replace(/\D/g,'').slice(0,6);
    inp.value = fmtCode(digits.length===6 ? digits : digits.padEnd(0)).trim() || digits;
    if(digits.length===6 && onComplete) onComplete();
  });
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} }, 50);
}
function codeValue(id){ const el=document.getElementById(id); return el ? (el.value||'').replace(/\D/g,'') : ''; }
function showAuthError(msg){ const e=document.getElementById('auth-error'); if(e) e.textContent = msg; }
async function submitAuth(){
  if(FIREBASE_MODE){ await fbLogin(); return; }
  if(!document.getElementById('auth-code')) return; // déjà soumis (saisie automatique au 6e chiffre)
  const now = Date.now();
  if(now < AUTH.lockedUntil){ showAuthError('Trop d\u2019essais. Réessayez dans '+Math.ceil((AUTH.lockedUntil-now)/1000)+' s.'); return; }
  const code = codeValue('auth-code');
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  const remember = !!(document.getElementById('auth-remember')||{}).checked; AUTH.remember = remember;
  try{
    if(AUTH.role==='coach'){
      const auth = await loadAuth();
      const h = await sha256((auth.salt||'')+code);
      if(auth && h===auth.coachHash){ writeSession({role:'coach', at:now}, remember); AUTH.fails=0; await showCoach(); return; }
    } else {
      const snap = await db.collection('clients').where('accessCode','==',code).get();
      if(snap.docs.length){
        const id = snap.docs[0].id;
        const bilan = await db.doc('bilans/'+id).get();
        if(!bilan.exists || bilan.data().valide===false){ showAuthError('Votre bilan n\u2019a pas encore été validé par votre coach.'); return; }
        writeSession({role:'client', clientId:id, at:now}, remember); AUTH.fails=0;
        await openClientProfileView(id); return;
      }
    }
    AUTH.fails++;
    if(AUTH.fails>=5){ AUTH.lockedUntil = Date.now()+30000; AUTH.fails=0; showAuthError('Trop d\u2019essais. Réessayez dans 30 secondes.'); }
    else showAuthError('Code incorrect. '+(5-AUTH.fails)+' essai'+(5-AUTH.fails>1?'s':'')+' restant'+(5-AUTH.fails>1?'s':'')+'.');
    const inp=document.getElementById('auth-code'); if(inp){ inp.focus(); try{ inp.select(); }catch(e){} }
  } finally { if(btn) btn.disabled = false; }
}
// ---- Mire Firebase ----
function fbField(id, label, type, extra){
  return `<label for="${id}">${label}</label><div class="field"><input id="${id}" type="${type}" ${extra||''}></div>`;
}
function renderFbAuthBody(el){
  const isCoach = AUTH.role==='coach';
  const mode = AUTH.fbMode || 'login'; // login | signup | code
  if(isCoach || mode==='login'){
    el.innerHTML = `
      <h1 class="auth-title">${isCoach?'Espace coach':'Espace client'}</h1>
      <p class="auth-sub">${isCoach?'Connectez-vous avec votre compte Google, ou avec votre e-mail et votre mot de passe.':'Connectez-vous avec votre compte Google, ou avec l’e-mail et le mot de passe de votre compte.'}</p>
      <button type="button" class="btn btn-light btn-block" onclick="fbGoogle()">Continuer avec Google</button>
      <div class="auth-or"><span>ou avec un e-mail</span></div>
      <form onsubmit="event.preventDefault();submitAuth()" novalidate>
        ${fbField('auth-email','E-mail','email','autocomplete="email" inputmode="email" autofocus')}
        ${fbField('auth-pass','Mot de passe','password','autocomplete="current-password"')}
        <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
        <label class="checkline" style="margin-top:14px"><input type="checkbox" id="auth-remember" ${AUTH.remember?'checked':''}> Rester connecté sur cet appareil</label>
        <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Se connecter</button>
      </form>
      <p class="auth-help"><button class="link" onclick="fbForgotPassword()">Mot de passe oublié ?</button></p>
      ${isCoach ? '' : `<p class="auth-help">Première connexion ? <button class="link" onclick="AUTH.fbMode='signup';renderAuthBody()">Créer mon compte</button><br>Pas encore client ? <button class="link" onclick="startClientQuestionnaire()">Faire mon bilan</button></p>`}`;
    return;
  }
  if(mode==='signup'){
    el.innerHTML = `
      <h1 class="auth-title">Créer mon compte</h1>
      <p class="auth-sub">Votre coach vous a remis un code à 6 chiffres. Saisissez-le, puis continuez avec Google ou choisissez un e-mail et un mot de passe.</p>
      <form onsubmit="event.preventDefault();fbSignup()" novalidate>
        <label for="auth-code">Code remis par votre coach</label>
        ${codeInputHtml('auth-code')}
        <button type="button" class="btn btn-light btn-block" style="margin-top:14px" onclick="fbGoogle()">Continuer avec Google</button>
        <div class="auth-or"><span>ou avec un e-mail</span></div>
        ${fbField('auth-email','E-mail','email','autocomplete="email" inputmode="email"')}
        ${fbField('auth-pass','Mot de passe (8 caractères minimum)','password','autocomplete="new-password"')}
        <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
        <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Créer mon compte</button>
      </form>
      <p class="auth-help">Déjà un compte ? <button class="link" onclick="AUTH.fbMode='login';renderAuthBody()">Se connecter</button></p>`;
    setupCodeInput('auth-code', null);
    return;
  }
  // mode 'code' : compte connecté mais pas encore relié à une fiche client
  el.innerHTML = `
    <h1 class="auth-title">Votre code</h1>
    <p class="auth-sub">Connecté en tant que ${esc((FB.user&&FB.user.email)||'')}. Saisissez le code à 6 chiffres remis par votre coach pour ouvrir votre espace.</p>
    <form onsubmit="event.preventDefault();fbLinkCode()" novalidate>
      <label for="auth-code">Code remis par votre coach</label>
      ${codeInputHtml('auth-code')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Ouvrir mon espace</button>
    </form>
    <p class="auth-help"><button class="link" onclick="logout()">Utiliser un autre compte</button></p>`;
  setupCodeInput('auth-code', fbLinkCode);
}
function fbCreds(){
  const email = ((document.getElementById('auth-email')||{}).value||'').trim();
  const pass = (document.getElementById('auth-pass')||{}).value||'';
  return {email, pass};
}
async function fbSetPersistence(remember){
  try{ await FB.auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION); }catch(e){}
}
async function fbAfterLogin(){
  const role = await fbResolveRole();
  if(AUTH.role==='coach'){
    if(role!=='coach'){ await FB.auth.signOut(); showAuthError('Ce compte n’est pas le compte coach.'); return; }
    await showCoach(); return;
  }
  if(role==='coach'){ await showCoach(); return; }
  if(role==='client'){ await fbOpenClient(); return; }
  AUTH.fbMode = 'code'; renderAuthBody();
}
async function fbLogin(){
  const {email, pass} = fbCreds();
  if(!email || !pass){ showAuthError('Saisissez votre e-mail et votre mot de passe.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  const remember = !!(document.getElementById('auth-remember')||{}).checked; AUTH.remember = remember;
  try{
    await fbSetPersistence(remember);
    await FB.auth.signInWithEmailAndPassword(email, pass);
    FB.user = FB.auth.currentUser;
    await fbAfterLogin();
  }catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbSignup(){
  const {email, pass} = fbCreds(); const code = codeValue('auth-code');
  if(!email){ showAuthError('Saisissez votre e-mail.'); return; }
  if(pass.length<8){ showAuthError('Mot de passe trop court : 8 caractères minimum.'); return; }
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  try{
    await fbSetPersistence(true);
    await FB.auth.createUserWithEmailAndPassword(email, pass);
    FB.user = FB.auth.currentUser;
    const ok = await fbLinkWithCode(code);
    if(!ok) return;
    await fbAfterLogin();
  }catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbLinkCode(){
  const code = codeValue('auth-code');
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  try{ const ok = await fbLinkWithCode(code); if(ok) await fbAfterLogin(); }
  catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbLinkWithCode(code){
  const u = FB.auth.currentUser; if(!u){ showAuthError('Connectez-vous d’abord.'); return false; }
  let codeDoc = null;
  try{ codeDoc = await db.doc('codes/'+code).get(); }catch(e){ codeDoc = null; }
  if(!codeDoc || !codeDoc.exists){ showAuthError('Code inconnu. Vérifiez-le avec votre coach.'); return false; }
  const clientId = codeDoc.data().clientId;
  try{
    await db.doc('users/'+u.uid).set({clientId, code, email:(u.email||'').toLowerCase(), createdAt:todayStr()});
  }catch(e){ console.error(e); showAuthError('Impossible de relier ce code. Demandez un nouveau code à votre coach.'); return false; }
  return true;
}
async function fbGoogle(){
  const btn = document.querySelector('.auth-box button[onclick="fbGoogle()"]'); if(btn) btn.disabled = true;
  try{
    const provider = new firebase.auth.GoogleAuthProvider();
    try{ provider.setCustomParameters({prompt:'select_account'}); }catch(e){}
    await fbSetPersistence(AUTH.remember!==false);
    try{ await FB.auth.signInWithPopup(provider); }
    catch(e){
      if(e && (e.code==='auth/popup-blocked' || e.code==='auth/operation-not-supported-in-this-environment')){ await FB.auth.signInWithRedirect(provider); return; }
      if(e && (e.code==='auth/popup-closed-by-user' || e.code==='auth/cancelled-popup-request')) return;
      throw e;
    }
    FB.user = FB.auth.currentUser;
    // Sur l'écran « Créer mon compte », un code déjà saisi relie directement la fiche.
    const codeEl = document.getElementById('auth-code');
    const code = codeEl ? codeValue('auth-code') : '';
    if(AUTH.role!=='coach' && code.length===6){ const ok = await fbLinkWithCode(code); if(!ok) return; }
    await fbAfterLogin();
  }catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbForgotPassword(){
  const {email} = fbCreds();
  if(!email){ showAuthError('Saisissez votre e-mail, puis cliquez sur « Mot de passe oublié ».'); return; }
  try{ await FB.auth.sendPasswordResetEmail(email); toast('E-mail envoyé : suivez le lien pour choisir un nouveau mot de passe'); }
  catch(e){ showAuthError(fbErrorMessage(e)); }
}
function renderCoachSetup(el){
  el.innerHTML = `
    <h1 class="auth-title">Créer votre code coach</h1>
    <p class="auth-sub">Première utilisation : choisissez un code à 6 chiffres. Il vous sera demandé pour ouvrir l\u2019espace coach.</p>
    <form onsubmit="event.preventDefault();saveCoachSetup()" novalidate>
      <label for="setup-code">Nouveau code</label>${codeInputHtml('setup-code')}
      <label for="setup-code2">Confirmez le code</label>${codeInputHtml('setup-code2').replace('autofocus','')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:16px">Enregistrer et entrer</button>
    </form>`;
  setupCodeInput('setup-code', ()=>document.getElementById('setup-code2').focus());
  setupCodeInput('setup-code2', null);
}
function weakCode(code){ return /^(\d)\1{5}$/.test(code) || ['123456','654321','000000','111111'].includes(code); }
async function saveCoachSetup(){
  const a = codeValue('setup-code'), b = codeValue('setup-code2');
  if(a.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  if(weakCode(a)){ showAuthError('Choisissez un code moins évident.'); return; }
  if(a!==b){ showAuthError('Les deux codes ne correspondent pas.'); return; }
  const salt = randomCode()+randomCode();
  await db.doc('settings/auth').set({salt, coachHash: await sha256(salt+a), createdAt: todayStr()});
  writeSession({role:'coach', at:Date.now()}, true);
  toast('Code coach enregistré');
  await showCoach();
}
async function fbCoachResetPassword(){
  const email = (FB.user&&FB.user.email)||'';
  if(!email) return;
  try{ await FB.auth.sendPasswordResetEmail(email); toast('E-mail envoyé à '+email); }catch(e){ toast(fbErrorMessage(e)); }
}
function openChangeCoachCode(){
  openModal(`<h3>Changer le code coach</h3>
    <label for="cc-old">Code actuel</label>${codeInputHtml('cc-old')}
    <label for="cc-new">Nouveau code</label>${codeInputHtml('cc-new').replace('autofocus','')}
    <div id="auth-error" class="auth-error" role="alert"></div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveNewCoachCode()">Enregistrer</button></div>`);
  setupCodeInput('cc-old', ()=>document.getElementById('cc-new').focus()); setupCodeInput('cc-new', null);
}
async function saveNewCoachCode(){
  const auth = await loadAuth(); const old=codeValue('cc-old'), nw=codeValue('cc-new');
  if(!auth || (await sha256((auth.salt||'')+old))!==auth.coachHash){ showAuthError('Code actuel incorrect.'); return; }
  if(nw.length!==6 || weakCode(nw)){ showAuthError('Choisissez un nouveau code à 6 chiffres, moins évident.'); return; }
  const salt = randomCode()+randomCode();
  await db.doc('settings/auth').set({salt, coachHash: await sha256(salt+nw), createdAt: auth.createdAt||todayStr(), updatedAt: todayStr()});
  closeModal(); toast('Code coach modifié');
}

function renderLanding(){
  const site = S.site || SITE_DEFAULTS;
  const contact = [site.telephone, site.email, site.instagram?('@'+site.instagram.replace(/^@/,'')):''].filter(Boolean);
  const specs = (site.specialites||'').split(',').map(x=>x.trim()).filter(Boolean);
  const bioHtml = (site.bio||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${x}</p>`).join('');
  const communes = (site.communes||'').split(',').map(x=>x.trim()).filter(Boolean);
  const faq = (site.faq||'').split(/\n+/).map(l=>l.split('|')).filter(x=>x.length===2 && x[0].trim() && x[1].trim()).map(x=>[x[0].trim(), x[1].trim()]);
  document.getElementById('app').innerHTML = `
  <div class="site">
    <header class="site-nav dark">
      <a class="site-brand" onclick="showLanding()"><img src="${LOGO_SRC}" alt=""><span>Coach sportif Alex</span></a>
      <nav><a onclick="renderAuth('client')">Se connecter</a><button class="btn btn-primary btn-sm" onclick="startClientQuestionnaire()">Devenir client</button></nav>
    </header>
    <section class="site-hero photo">
      <img class="site-hero-img" src="${HERO_SRC}" alt="Alex, coach sportif, bras croisés dans une salle de sport">
      <div class="site-hero-text">
        <span class="site-kicker">Coach sportif à domicile · ${site.zone}</span>
        <h1>${site.accroche}</h1>
        <p class="site-lead">${site.sousTitre}</p>
        <div class="site-cta"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Faire mon bilan gratuit</button><button class="btn btn-light" onclick="document.getElementById('formules').scrollIntoView({behavior:'smooth'})">Voir les formules</button></div>
      </div>
    </section>
    ${specs.length? `<section class="site-band"><div class="site-wrap"><span class="lbl">Pour qui ?</span><span class="who">Tout le monde, avec une spécialité :</span><div class="site-specs">${specs.map(x=>`<span>${x}</span>`).join('')}</div></div></section>`:''}
    <section class="site-section">
      <div class="site-wrap">
        <h2>Comment ça se passe</h2>
        <ol class="site-timeline">
          <li>
            <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg></span>
            <div><span class="step">Étape 1</span><h3>Votre bilan</h3><p>Un questionnaire sur votre objectif, votre santé, votre rythme de vie et votre alimentation. Puis un premier rendez-vous, chez vous ou par téléphone.</p><span class="meta">Gratuit · 10 minutes</span></div>
          </li>
          <li>
            <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 15h8M8 13v4M16 13v4"/></svg></span>
            <div><span class="step">Étape 2</span><h3>Vos séances, chez vous</h3><p>Je viens avec le matériel. Chaque séance suit votre programme, construit pour vous et ajusté à chaque passage.</p><span class="meta">Express 1 h · Classique 2 h</span></div>
          </li>
          <li>
            <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/><path d="M10 12l2 2 3-4" /></svg></span>
            <div><span class="step">Étape 3</span><h3>Votre suivi au quotidien</h3><p>Entre les séances, vous avez sur votre téléphone votre programme pour vous entraîner seul, vos objectifs alimentaires et mes enseignements.</p><span class="meta">Suivi mensuel</span></div>
          </li>
        </ol>
      </div>
    </section>
    <section class="site-section alt" id="formules">
      <div class="site-wrap">
        <h2>Les formules</h2>
        <div class="site-pricing">
          <div class="site-price"><span class="name">Séance Express</span><span class="amount">${EXPRESS_PRICE} €</span><span class="desc">45 à 60 minutes chez vous. Idéale pour garder le rythme.</span></div>
          <div class="site-price featured"><span class="name">Séance Classique</span><span class="amount">${CLASSIQUE_PRICE} €</span><span class="desc">1 h 30 à 2 h chez vous. Le temps de travailler en profondeur.</span></div>
          <div class="site-price"><span class="name">Suivi mensuel</span><span class="amount">89 €<small>/mois</small></span><span class="desc">Programme, alimentation, enseignements et suivi au quotidien. Dégressif selon vos séances : 62 € avec 3 séances, 36 € avec 4, offert à partir de 5.</span></div>
        </div>
      </div>
    </section>
    <section class="site-section">
      <div class="site-wrap site-about">
        <img src="${ABOUT_SRC}" alt="Alex avec des pattes d\u2019ours, pendant une séance de boxe">
        <div><h2>Pourquoi je suis coach</h2>${bioHtml}<div class="site-cta"><button class="btn btn-primary" onclick="startClientQuestionnaire()">On commence ?</button></div></div>
      </div>
    </section>
    <section class="site-section alt">
      <div class="site-wrap">
        <h2>Ce que comprend l\u2019accompagnement</h2>
        <div class="site-features">
          <div><h3>Un programme à vous</h3><p>Des cycles d\u2019entraînement numérotés, des charges qui progressent automatiquement, validées par moi avant chaque séance.</p></div>
          <div><h3>L\u2019alimentation sans régime</h3><p>Vos besoins calculés et recalculés à chaque pesée, un journal simple à tenir, des recettes partagées.</p></div>
          <div><h3>Comprendre pour durer</h3><p>Des leçons courtes sur le corps, l\u2019entraînement, la nutrition et le mental, à lire à votre rythme.</p></div>
          <div><h3>Des challenges entre clients</h3><p>Des défis mensuels et des niveaux à franchir pour garder la motivation sur la durée.</p></div>
        </div>
      </div>
    </section>
    ${faq.length? `<section class="site-section">
      <div class="site-wrap">
        <h2>Vos questions</h2>
        <div class="site-faq">${faq.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
      </div>
    </section>`:''}
    ${communes.length? `<section class="site-section alt">
      <div class="site-wrap">
        <h2>Où je me déplace</h2>
        <p class="site-lead">À domicile, autour de ${site.zone}. 30 minutes de trajet sont prévues entre deux séances.</p>
        <div class="site-communes">${communes.map(x=>`<span>${x}</span>`).join('')}</div>
      </div>
    </section>`:''}
    <section class="site-section" id="contact">
      <div class="site-wrap">
        <h2>Faire le premier pas</h2>
        <p class="site-lead">Remplissez votre bilan en quelques minutes, je vous rappelle pour fixer un premier rendez-vous.</p>
        <div class="site-cta"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Faire mon bilan gratuit</button></div>
        ${contact.length? `<p class="site-contact">${contact.join(' · ')}</p>` : ''}
      </div>
    </section>
    <footer class="site-foot"><span>Coach sportif Alex · ${site.zone}</span><a onclick="renderAuth('coach')">Espace coach</a></footer>
  </div>`;
}
function openConnexionChoice(){ renderAuth('client'); }
function renderClientSpace(){
  document.getElementById('app').innerHTML = `<div class="shell"><main class="main client-space" id="main" style="max-width:680px;margin:0 auto"></main></div>`;
  renderClientEntry();
}
function renderClientEntry(){ renderAuth('client'); }
async function renderClientProfileList(){ renderAuth('client'); }
async function openClientProfileView(id, silent){
  const doc = await db.doc('clients/'+id).get();
  if(!doc.exists){ if(!silent) toast('Client introuvable'); return false; }
  S.view='client';
  S.currentClientObj = {id:doc.id, ...doc.data()};
  S.currentId = id;
  S.clientTab = 'accueil'; S.clientPlusView = null;
  S.clientWeekOffset = 0;
  await loadClientData(id);
  renderClientProfileArea();
  return true;
}
function renderClientProfileArea(){
  const c = S.currentClientObj;
  const t = S.clientTab;
  document.getElementById('app').innerHTML = `
  <div class="shell">
    <nav class="tabbar" aria-label="Navigation">
      <div class="brandmini"><img src="${LOGO_SRC}" alt="">${c.prenom}</div>
      <a class="${t==='accueil'?'active':''}" onclick="switchClientTab('accueil')">${ICONS.home}Accueil</a>
      <a class="${t==='entrainement'?'active':''}" onclick="switchClientTab('entrainement')">${ICONS.training}Entraînement</a>
      <a class="${t==='planningAlim'?'active':''}" onclick="switchClientTab('planningAlim')">${ICONS.food}Alimentation</a>
      <a class="${t==='plus'?'active':''}" onclick="switchClientTab('plus')">${ICONS.plus}Plus</a>
    </nav>
    <main class="main" id="main"><div id="clienttabcontent"></div></main>
  </div>`;
  renderClientTabContent();
}
function switchClientTab(t, sub){ S.clientTab=t; S.clientPlusView=sub||null; S.leconsPath=[]; renderClientProfileArea(); }
function renderClientTabContent(){
  const el = document.getElementById('clienttabcontent');
  const c = S.currentClientObj;
  if(!el || !c) return;
  const heads = {entrainement:'Mon entraînement', planningAlim:'Mon alimentation'};
  if(S.clientTab==='entrainement'){ el.innerHTML = `<div class="page-head"><h1>${heads.entrainement}</h1></div><div id="clientsub"></div>`; return renderClientEntrainement(document.getElementById('clientsub'), c); }
  if(S.clientTab==='planningAlim'){ el.innerHTML = `<div class="page-head"><h1>${heads.planningAlim}</h1></div><div id="clientsub"></div>`; return renderClientPlanningAlim(document.getElementById('clientsub'), c); }
  if(S.clientTab==='plus') return renderClientPlus(el, c);
  return renderClientHome(el, c);
}
function renderClientPlus(el, c){
  const v = S.clientPlusView;
  const views = {suivi:['Mon suivi', renderClientMergedProfil], demande:['Demander une séance', renderClientDemande], lecons:['Enseignements', renderClientLecons], challenges:['Challenges', renderClientChallenges]};
  if(v && views[v]){
    el.innerHTML = `<a class="backlink" onclick="switchClientTab('plus')">${ICONS.back}Plus</a><h1>${views[v][0]}</h1><div id="clientsub"></div>`;
    return views[v][1](document.getElementById('clientsub'), c);
  }
  el.innerHTML = `
    <div class="page-head"><h1>Plus</h1></div>
    <div class="menu">
      <div class="item" onclick="switchClientTab('plus','suivi')">${ico('chart','orange')}<span class="body"><span class="title">Mon suivi</span><span class="sub">Poids, niveau, historique, paiements</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','demande')">${ico('planning','blue')}<span class="body"><span class="title">Demander une séance</span><span class="sub">Voir les créneaux libres de la semaine</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','lecons')">${ico('book','green')}<span class="body"><span class="title">Enseignements</span><span class="sub">Les leçons du coach</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','challenges')">${ico('trophy','orange')}<span class="body"><span class="title">Challenges</span><span class="sub">En cours et classements</span></span>${ICONS.chev}</div>
    </div>
    <div class="card"><h2>Affichage</h2>${themeChoicesHtml()}</div>
    <div class="menu"><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;
}
async function renderClientHome(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [attr, levelInfo, entries, challenges, participations] = await Promise.all([loadActiveAttribution(c.id), computeClientLevel(c.id), loadJournalForClient(c.id), loadAllChallenges(), loadAllParticipations()]);
  if(S.clientTab!=='accueil' || !document.getElementById('clienttabcontent')) return;
  const today = todayStr();
  const d0 = new Date();
  const next = S.programmes.filter(p=>p.type==='avec' && p.statut==='prevue' && p.date>=today).sort((a,b)=>(a.date+(a.heure||'')).localeCompare(b.date+(b.heure||'')))[0];
  const ent = attr ? attr.entrainements[attr.currentEntrainementIndex] : null;
  const nextLevelPts = levelInfo.nextNiveau ? levelInfo.nextNiveau.niveau*POINTS_PAR_NIVEAU : null;
  const prevPts = levelInfo.currentLevel*POINTS_PAR_NIVEAU;
  const pct = nextLevelPts ? Math.min(100, Math.round(100*(levelInfo.points-prevPts)/Math.max(1,nextLevelPts-prevPts))) : 100;
  const lecons = S.leconsAllCache || await loadAllLecons(); S.leconsAllCache = lecons;
  const req = levelInfo.nextNiveau && levelInfo.nextNiveau.leconRequiseId && !levelInfo.vuesSet.has(levelInfo.nextNiveau.leconRequiseId) ? lecons.find(l=>l.id===levelInfo.nextNiveau.leconRequiseId) : null;
  const typePlan=(S.bilan||{}).typePlan; const ds=currentDietSource();
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcalT = kcalField ? (parseFloat(ds[kcalField])||0) : null;
  const protT = parseFloat(ds.proteines)||0, lipT = parseFloat(ds.lipides)||0;
  const t = journalDayTotals(entries.filter(e=>e.date===today));
  const bar = (v,max,cls) => `<span class="bar"><span class="${cls||''}" style="width:${max>0?Math.min(100,Math.round(100*v/max)):0}%"></span></span>`;
  const actifs = challenges.filter(ch=>(ch.clientsCible==='all' || ch.clientsCible.includes(c.id)) && ch.dateFin>=today && ch.dateDebut<=today);
  const pay = await loadPaiementSettings();
  const unpaidHome = unpaidForClient(c.id, S.programmes, S.suivis);
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${DAYLONG[d0.getDay()]} ${d0.getDate()} ${MONTHNAMES[d0.getMonth()].toLowerCase()}</span><h1>Bonjour ${c.prenom}</h1></div>
      <button class="btn btn-secondary btn-sm" onclick="switchClientTab('plus','suivi')"><span class="count" style="margin:0 6px 0 0;background:var(--orange)">${levelInfo.currentLevel}</span>Niveau ${levelInfo.currentLevel}</button></div>
    <section class="section">
      <div class="section-head"><h2>${ico('planning','orange','sm')}Ma prochaine séance</h2></div>
      ${next? `<div class="row ${next.date===today?'now':''}" style="cursor:default"><span class="tile ${next.date===today?'orange':''}"><b>${next.heure}</b><small>${next.date===today?'ce soir':fmtDayShort(next.date)}</small></span><span class="body"><span class="title">Avec Alex, chez vous</span><span class="sub">${formuleLabel(next.formule)} · ${dureeLabel(next.formule)}${next.entrainementNom?' · '+next.entrainementNom:''}</span></span></div>` : '<div class="card"><div class="empty">Aucune séance prévue pour le moment.</div></div>'}
      <button class="link" onclick="switchClientTab('plus','demande')">Demander une séance</button>
    </section>
    ${clientPayCardHtml(unpaidHome, pay)}
    <section class="section">
      <div class="section-head"><h2>${ico('training','blue','sm')}Mon entraînement</h2></div>
      <div class="card">
        ${ent ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:700">${ent.nom}</span><span class="note">${ent.valide? 'À faire seul'+(S.bilan&&S.bilan.genre==='femme'?'e':'')+' · '+ent.mouvements.length+' exercices' : 'En attente de validation du coach'}</span></span>${ent.valide?`<button class="btn btn-dark btn-sm" onclick="switchClientTab('entrainement');setTimeout(renderClientEntrainementDetail,50)">Commencer</button>`:''}</div>` : '<div class="empty">Votre coach ne vous a pas encore attribué de programme.</div>'}
        <div style="display:flex;gap:8px;align-items:center;margin-top:12px">${bar(levelInfo.points-prevPts, nextLevelPts?nextLevelPts-prevPts:1)}<span class="note" style="white-space:nowrap">${levelInfo.points} pts${nextLevelPts? (levelInfo.points>=nextLevelPts ? ' · leçon à lire' : ' / '+nextLevelPts) : ''}</span></div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>${ico('food','green','sm')}Mon alimentation aujourd\u2019hui</h2><button class="link" onclick="switchClientTab('planningAlim')">Ajouter</button></div>
      <div class="card">
        ${kcalT!==null? `<div class="barline"><div class="lbl"><span>Calories</span><span><b style="color:var(--text)">${Math.round(t.kcal)}</b> / ${kcalT} · reste ${Math.max(0,Math.round(kcalT-t.kcal))}</span></div>${bar(t.kcal,kcalT)}</div>` : '<p class="note">Votre coach n\u2019a pas encore défini votre plan calorique.</p>'}
        ${protT? `<div class="barline"><div class="lbl"><span>Protéines</span><span><b style="color:var(--text)">${Math.round(t.proteines)} g</b> / ${protT} g</span></div>${bar(t.proteines,protT,'green')}</div>`:''}
        ${lipT? `<div class="barline"><div class="lbl"><span>Lipides</span><span><b style="color:var(--text)">${Math.round(t.lipides)} g</b> / ${lipT} g</span></div>${bar(t.lipides,lipT,'blue')}</div>`:''}
      </div>
    </section>
    ${req? `<div class="list"><div class="item" onclick="clientViewRessource('${req.id}')">${ico('book','blue')}<span class="body"><span class="title">À lire : « ${req.nom} »</span><span class="sub">Débloque le niveau ${levelInfo.nextNiveau.niveau}</span></span>${ICONS.chev}</div></div>`:''}
    ${actifs.length? `<div class="list">${actifs.map(ch=>{ const mine=participations.find(p=>p.challengeId===ch.id && p.clientId===c.id); return `<div class="item" onclick="switchClientTab('plus','challenges')">${ico('trophy','orange')}<span class="body"><span class="title">Challenge « ${ch.nom} »</span><span class="sub">Jusqu\u2019au ${fmtDate(ch.dateFin)}</span></span><span class="side">${mine?(mine.statut==='reussi'?'<span class="badge ok">Réussi</span>':'<span class="badge lock">Non réussi</span>'):'<span class="badge plan">En cours</span>'}</span></div>`; }).join('')}</div>`:''}
  `;
}
async function renderClientMergedProfil(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  await ensurePeriodDocs(c.id);
  const levelInfo = await computeClientLevel(c.id);
  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);
  const pay = await loadPaiementSettings();
  const bilan = S.bilan;
  const today = todayStr();
  const pastEvolutions = S.evolutions.filter(e=>e.date<=today);
  const latestPoids = pastEvolutions.length? pastEvolutions[0].poids : (bilan?bilan.poids:null);
  const latestMesures = pastEvolutions.length? mesuresStr(pastEvolutions[0].mesures) : (bilan?mesuresStr(bilan.mesures):'–');
  const latestDietSource = currentDietSource();

  const points = [];
  if(bilan) points.push({date:bilan.date, poids:parseFloat(bilan.poids)});
  S.evolutions.forEach(ev=>points.push({date:ev.date, poids:parseFloat(ev.poids)}));
  points.sort((a,b)=>a.date.localeCompare(b.date));

  const upcoming = S.programmes.filter(p=>p.statut!=='annulee' && p.date>=today).sort((a,b)=>(a.date+(a.heure||'')).localeCompare(b.date+(b.heure||'')));
  const pastSeances = S.programmes.filter(p=>p.statut!=='annulee' && (p.date<today || p.statut==='faite')).sort((a,b)=>b.date.localeCompare(a.date));
  const suiviHistory = S.suivis.filter(s=>!s.annule).sort((a,b)=>b.periodeDebut.localeCompare(a.periodeDebut));
  const unpaidAll = [...unpaid.retard, ...unpaid.avenir];
  const suiviActive = S.suiviConfig && S.suiviConfig.segments && S.suiviConfig.segments.length && !S.suiviConfig.segments[S.suiviConfig.segments.length-1].end;
  const upcomingAttrIds = [...new Set(upcoming.filter(p=>p.attributionId).map(p=>p.attributionId))];
  const upcomingAttrDocs = await Promise.all(upcomingAttrIds.map(id=>db.doc('attributions/'+id).get()));
  const upcomingCycleMap = {}; upcomingAttrDocs.forEach(d=>{ if(d.exists) upcomingCycleMap[d.id] = {id:d.id, ...d.data()}; });

  const currentNiveauCfg = levelInfo.niveaux.find(n=>n.niveau===levelInfo.currentLevel);
  el.innerHTML = `
    <div class="card">
      <h2>Niveau ${levelInfo.currentLevel} <span class="badge">${levelInfo.points} points</span></h2>
      ${levelInfo.nextNiveau? `
        <p class="empty">Prochain niveau : ${levelInfo.nextNiveau.niveau*POINTS_PAR_NIVEAU} points${levelInfo.nextNiveau.leconRequiseId?' + une leçon à ouvrir':''}</p>
        ${levelInfo.nextNiveau.leconRequiseId && !levelInfo.vuesSet.has(levelInfo.nextNiveau.leconRequiseId) ? `<button class="btn btn-secondary btn-sm" onclick="switchClientTab('lecons')">Ouvrir mes enseignements</button>` : ''}
      ` : '<p class="empty">Niveau maximum atteint</p>'}
      ${currentNiveauCfg && currentNiveauCfg.recompenseTexte? `<p>Récompense : ${currentNiveauCfg.recompenseTexte}</p>` : ''}
    </div>
    <div class="card">
      <h2>État actuel</h2>
      <p>Poids le plus récent : ${latestPoids?latestPoids+' kg':'–'}</p>
      <p>Mesures les plus récentes : ${latestMesures||'–'}</p>
      ${latestDietSource && latestDietSource.proteines ? dietResultHtml(latestDietSource) : ''}
    </div>
    <div class="card">
      <h2>Courbe de poids</h2>
      ${points.length>=1? svgWeightChart(points) : '<div class="empty">Pas assez de données</div>'}
    </div>
    <div class="card">
      <h2>Mon planning</h2>
      ${upcoming.length? upcoming.map(p=>{
        const label = p.type==='avec' ? (p.formule==='express'?'Coaching Express':'Coaching Classique') : 'Séance libre (sans coach)';
        const horaire = p.type==='avec' ? (p.heure||'')+' – '+heureFin(p.heure,p.formule) : '';
        let detail='';
        if(p.attributionId && upcomingCycleMap[p.attributionId]){
          const ent = upcomingCycleMap[p.attributionId].entrainements[p.entrainementIndex];
          if(ent) detail = `<div style="margin-top:6px"><b>${ent.nom}</b>${ent.mouvements.map(mv=>`<div class="empty">${mv.nom} · ${mvSpec(mv)}${mv.tempo?' · tempo '+mv.tempo:''}${mv.tempsRecup?' · récup '+mv.tempsRecup+' s':''}</div>`).join('')}</div>`;
        }
        return `<div class="seance-row" style="flex-direction:column;align-items:stretch">
          <div style="display:flex;justify-content:space-between"><span>${fmtDate(p.date)} ${horaire?('à '+horaire):''} · ${label}</span><span>${p.type==='avec'?euro(p.tarif):''}</span></div>
          ${detail}
        </div>`;
      }).join('') : '<div class="empty">Aucun rendez-vous à venir</div>'}
    </div>
    <div class="card">
      <h2>Historique de mes séances et mes suivis</h2>
      ${pastSeances.map(p=>{
        const label = p.type==='avec' ? (p.formule==='express'?'Coaching Express':'Coaching Classique') : 'Séance libre (sans coach)';
        const horaire = p.type==='avec' && p.heure ? '· '+p.heure+' – '+heureFin(p.heure,p.formule) : '';
        return `<div class="seance-row"><span>${fmtDate(p.date)} ${horaire} · ${label}</span><span>${p.type==='avec'?euro(p.tarif):''}</span></div>`;
      }).join('')}
      ${suiviHistory.map(s=>`<div class="seance-row"><span>Suivi ${fmtDate(s.periodeDebut)} → ${fmtDate(s.periodeFin)}</span><span>${s.tarif===0?'Gratuit':euro(s.tarif)}</span></div>`).join('')}
      ${(!pastSeances.length && !suiviHistory.length)? '<div class="empty">Aucun historique</div>' : ''}
    </div>
    <div class="card">
      <h2>À régulariser</h2>
      ${unpaidAll.length? unpaidAll.map(u=>`<div class="seance-row" style="flex-direction:column;align-items:stretch;gap:2px"><div style="display:flex;justify-content:space-between;gap:10px"><span>${u.label}${u.date>today?' <span class="badge plan">À venir</span>':''}</span><b style="white-space:nowrap">${euro(u.montant)}</b></div>${payButtonsHtml(u, pay)}</div>`).join('')+payOtherNoteHtml(pay) : '<div class="badge ok">Aucun paiement en retard</div>'}
    </div>
    ${suiviActive ? `<div class="card" style="text-align:center">
      <button class="btn btn-danger" onclick="openPauseResiliation()">Pause ou résiliation de mon suivi</button>
    </div>` : ''}
  `;
}
function openPauseResiliation(){
  openModal(`
    <h3>Pause ou résiliation du suivi</h3>
    <label>Que souhaitez-vous faire ?</label>
    <select id="pr-type">
      <option value="pause">Mettre mon suivi en pause</option>
      <option value="resiliation">Résilier mon suivi</option>
    </select>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="confirmPauseResiliation()">Continuer</button></div>
  `);
}
function confirmPauseResiliation(){
  const type = val('pr-type');
  openModal(`
    <h3>Confirmation</h3>
    <p>Êtes-vous sûr(e) de vouloir ${type==='pause'?'mettre votre suivi en pause':'résilier votre suivi'} ? Votre coach en sera informé et vous contactera pour confirmer.</p>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="askDispoResiliation('${type}')">Oui, continuer</button></div>
  `);
}
function askDispoResiliation(type){
  openModal(`
    <h3>Vos disponibilités téléphoniques</h3>
    <p>Pour que votre coach puisse vous joindre et confirmer avec vous.</p>
    <label>Disponibilités</label><textarea id="pr-dispo" rows="2"></textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="sendResiliationDemande('${type}')">Envoyer</button></div>
  `);
}
async function sendResiliationDemande(type){
  const dispo = val('pr-dispo');
  await db.collection('demandes_resiliation').add({clientId:S.currentClientObj.id, type, disponibilites:dispo, statut:'attente', createdAt:todayStr()});
  closeModal();
  toast('Demande envoyée à votre coach');
}
function changeClientWeek(delta){ S.clientWeekOffset=(S.clientWeekOffset||0)+delta; renderClientTabContent(); }
async function renderClientDemande(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allIndispos] = await Promise.all([loadAllProgrammes(), loadAllIndispos()]);
  const weekStart = startOfWeek(S.clientWeekOffset||0);
  const weekDays=[...Array(7)].map((_,i)=>addDays(weekStart,i));
  el.innerHTML = `
    <div class="card">
      <h2>Disponibilités de la semaine</h2>
      <p class="note">Le coach se déplace à domicile : 30 minutes séparent la fin d\u2019une séance et le début de la suivante.</p>
      <div class="week-nav">
        <button class="btn btn-secondary btn-sm" onclick="changeClientWeek(-1)">Semaine précédente</button>
        <b>${fmtDate(isoDate(weekStart))} · ${fmtDate(isoDate(addDays(weekStart,6)))}</b>
        <button class="btn btn-secondary btn-sm" onclick="changeClientWeek(1)">Semaine suivante</button>
      </div>
      ${weekDays.map(d=>{
        const ds=isoDate(d);
        const dow=d.getDay();
        const sessions = allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee');
        const indispos = allIndispos.filter(i=>(i.type==='ponctuelle'&&i.date===ds)||(i.type==='recurrente'&&Number(i.jourSemaine)===dow));
        const hasContent = sessions.length || indispos.length;
        return `<div class="day-block"><div class="day-title">${DAYNAMES[(d.getDay()+6)%7]} ${fmtDate(ds)}</div>
          ${sessions.map(s=>{
            const mine = s.clientId===c.id;
            return `<div class="seance-row"><span>${s.heure||''} – ${heureFin(s.heure,s.formule)}</span>${mine?'<span class="badge plan">Votre séance</span>':'<span class="badge lock">Séance réservée</span>'}</div>`;
          }).join('')}
          ${indispos.map(i=>`<div class="seance-row"><span>${i.heureDebut}–${i.heureFin}</span><span class="badge lock">Indisponible</span></div>`).join('')}
          ${hasContent? '' : '<div class="empty">Aucune séance</div>'}
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <h2>Demander une séance</h2>
      <label>Date</label><input type="date" id="dm-date" value="${todayStr()}">
      <label>Formule</label>
      <select id="dm-formule">
        <option value="express">Coaching Express 60 € - 45 à 60 min</option>
        <option value="classique">Coaching Classique 90 € - 90 à 120 min</option>
      </select>
      <label>Heure de début souhaitée (entre 9h et 22h)</label><input type="time" id="dm-heure">
      <div class="modalbtns"><button class="btn btn-primary" onclick="envoyerDemande()">Envoyer la demande</button></div>
      <div id="dm-msg" style="margin-top:10px"></div>
    </div>
  `;
}
async function envoyerDemande(){
  const date=val('dm-date'), heure=val('dm-heure'), formule=val('dm-formule');
  if(!date || date<todayStr()){ document.getElementById('dm-msg').innerHTML = `<div class="badge warn">Choisissez une date à partir d\u2019aujourd\u2019hui.</div>`; return; }
  const [allProg, allIndispos] = await Promise.all([loadAllProgrammes(), loadAllIndispos()]);
  const check = checkSlotAvailable(date, heure, formule, null, allProg, allIndispos);
  if(!check.ok){ document.getElementById('dm-msg').innerHTML = `<div class="badge warn">${check.reason}</div>`; return; }
  const data = {clientId:S.currentClientObj.id, date, heureDebut:heure, formule, statut:'attente', createdAt:todayStr()};
  const attr = await loadActiveAttribution(S.currentClientObj.id);
  if(attr){
    const ent = attr.entrainements[attr.currentEntrainementIndex];
    data.attributionId = attr.id; data.entrainementIndex = attr.currentEntrainementIndex; data.entrainementNom = ent.nom;
  }
  await db.collection('demandes').add(data);
  document.getElementById('dm-msg').innerHTML = `<div class="badge ok">Demande envoyée, en attente de validation par votre coach.</div>`;
}
async function renderClientPlanningAlim(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [produits, entries, recettes] = await Promise.all([loadAllProduitsBib(), loadJournalForClient(c.id), loadAllRecettes()]);
  S.produitsBibCache = produits;
  S.recettesCache = recettes;
  const today = todayStr();
  const todayEntries = entries.filter(e=>e.date===today);
  const typePlan = (S.bilan||{}).typePlan;
  const d = currentDietSource();
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcalTarget = kcalField ? (parseFloat(d[kcalField])||0) : null;
  const protTarget = parseFloat(d.proteines)||0;
  const lipTarget = parseFloat(d.lipides)||0;
  const t = journalDayTotals(todayEntries);
  const byDay = {};
  entries.filter(e=>e.date!==today).forEach(e=>{ (byDay[e.date]=byDay[e.date]||[]).push(e); });
  const pastDates = Object.keys(byDay).sort().reverse();
  el.innerHTML = `
    <div class="card">
      <h2>Aujourd'hui</h2>
      ${kcalTarget!==null? `
        <div class="grid">
          <div class="stat"><div class="n">${Math.round(t.kcal)} / ${kcalTarget}</div><div class="l">Kcal (reste ${Math.round(kcalTarget-t.kcal)})</div></div>
          <div class="stat"><div class="n">${Math.round(t.proteines)} / ${protTarget}g</div><div class="l">Protéines (reste ${Math.round(protTarget-t.proteines)}g)</div></div>
          <div class="stat"><div class="n">${Math.round(t.lipides)} / ${lipTarget}g</div><div class="l">Lipides (reste ${Math.round(lipTarget-t.lipides)}g)</div></div>
        </div>
      ` : '<div class="empty">Votre coach n\u2019a pas encore défini de plan alimentaire.</div>'}
    </div>
    <details class="card fold" ${todayEntries.length?'':'open'}>
      <summary>Ajouter un aliment</summary>
      <label>Rechercher un produit</label>
      <input id="ja-search" placeholder="Nom ou marque..." oninput="filterProduitsList()">
      <div class="formrow">
        <div><label>Catégorie</label><select id="ja-filter-categorie" onchange="filterProduitsList()"><option value="">Toutes</option>${FOOD_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div><label>Trier par</label><select id="ja-sort" onchange="filterProduitsList()">
          <option value="alpha">Alphabétique</option>
          <option value="kcal_asc">Calories croissantes (100g)</option>
          <option value="prot_ratio">Meilleur ratio protéines/calories</option>
        </select></div>
      </div>
      <div id="ja-produits-list" style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;padding:6px;margin-top:8px"></div>
      <div id="ja-selected" class="empty" style="margin-top:6px"></div>
      ${produits.length===0?`<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="seedProduitsBib()">Charger une liste de départ (aliments courants · valeurs estimées, à vérifier)</button>`:''}
      <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="toggleJaNewProduit()">Produit introuvable ? Le créer</button>
      <div id="ja-new-fields" style="display:none">
        <div class="formrow">
          <div><label>Nom</label><input id="ja-nom"></div>
          <div><label>Marque</label><input id="ja-marque"></div>
        </div>
        <label>Catégorie</label><select id="ja-categorie">${FOOD_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
        <div class="formrow">
          <div><label>Kcal /100g</label><input type="number" id="ja-kcal100"></div>
          <div><label>Protéines /100g</label><input type="number" id="ja-prot100"></div>
          <div><label>Lipides /100g</label><input type="number" id="ja-lip100"></div>
          <div><label>Glucides /100g</label><input type="number" id="ja-gluc100"></div>
        </div>
      </div>
      <label>Quantité (g)</label><input type="number" id="ja-quantite" value="100">
      <div class="modalbtns"><button class="btn btn-primary" onclick="addJournalEntry()">Ajouter</button></div>
    </details>
    <details class="card fold">
      <summary>Mes recettes (${recettes.length})</summary>
      ${recettes.length? recettes.map(r=>`<div class="seance-row" style="cursor:pointer" onclick="viewRecette('${r.id}')"><span>${r.nom}</span><span class="empty">${Math.round(r.kcal)} kcal</span></div>`).join('') : '<div class="empty">Aucune recette enregistrée</div>'}
      <div class="modalbtns"><button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></div>
    </details>
    <div class="card">
      <h2>Mes entrées du jour</h2>
      ${todayEntries.length? todayEntries.map(e=>`<div class="seance-row"><span>${e.produitNom}${e.quantiteG!==null?' · '+e.quantiteG+' g':''} (${Math.round(e.kcal)} kcal, ${Math.round(e.proteines)}g prot, ${Math.round(e.lipides)}g lip)</span><span>${e.recetteId?`<button class="btn btn-secondary btn-sm" onclick="viewRecette('${e.recetteId}')">Détail</button> `:''}${e.quantiteG!==null?`<button class="btn btn-secondary btn-sm" onclick="openEditJournalEntry('${e.id}')">Modifier</button> `:''}<button class="btn btn-danger btn-sm" onclick="askDelete('deleteJournalEntry','${e.id}','Supprimer cette entrée ?')">Supprimer</button></span></div>`).join('') : '<div class="empty">Rien ajouté aujourd\u2019hui</div>'}
    </div>
    <details class="card fold">
      <summary>Jours précédents (${pastDates.length})</summary>
      ${pastDates.length? pastDates.map(d=>{
        const dt = journalDayTotals(byDay[d]);
        return `<div class="seance-row" style="flex-direction:column;align-items:stretch;cursor:pointer" onclick="toggleJournalDetail('${d}')">
          <div style="display:flex;justify-content:space-between"><span>${fmtDate(d)}</span><span>${Math.round(dt.kcal)} kcal · ${Math.round(dt.proteines)}g prot · ${Math.round(dt.lipides)}g lip</span></div>
          <div id="jd-${d}" style="display:none;margin-top:6px">${byDay[d].map(e=>`<div class="empty">${e.produitNom}${qteStr(e)}</div>`).join('')}</div>
        </div>`;
      }).join('') : '<div class="empty">Aucun historique</div>'}
    </details>
  `;
  S.jaSelectedProduitId = null;
  filterProduitsList();
}
function filterProduitsList(){
  const search = (val('ja-search')||'').toLowerCase();
  const cat = val('ja-filter-categorie');
  const sort = val('ja-sort');
  let list = (S.produitsBibCache||[]).filter(p=>{
    if(cat && p.categorie!==cat) return false;
    if(search && !(p.nom.toLowerCase().includes(search) || (p.marque||'').toLowerCase().includes(search))) return false;
    return true;
  });
  if(sort==='kcal_asc') list.sort((a,b)=>(a.kcal100||0)-(b.kcal100||0));
  else if(sort==='prot_ratio') list.sort((a,b)=>((b.proteines100||0)/(b.kcal100||1))-((a.proteines100||0)/(a.kcal100||1)));
  else list.sort((a,b)=>a.nom.localeCompare(b.nom));
  document.getElementById('ja-produits-list').innerHTML = list.length? list.map(p=>`<div class="seance-row" style="cursor:pointer" onclick="selectJaProduit('${p.id}')"><span>${p.nom}${p.marque?' ('+p.marque+')':''}${p.categorie?' · '+p.categorie:''}</span><span class="empty">${p.kcal100||0} kcal · ${p.proteines100||0}g P · ${p.lipides100||0}g L · ${p.glucides100||0}g G <span style="opacity:.6">(/100g)</span></span></div>`).join('') : '<div class="empty">Aucun résultat</div>';
}
function selectJaProduit(id){
  S.jaSelectedProduitId = id;
  const p = (S.produitsBibCache||[]).find(x=>x.id===id);
  document.getElementById('ja-selected').innerHTML = p? `Sélectionné : <b>${p.nom}</b>` : '';
}
function toggleJaNewProduit(){
  const el = document.getElementById('ja-new-fields');
  el.style.display = el.style.display==='none'?'block':'none';
}
async function seedProduitsBib(){
  // Valeurs pour 100g · estimations générales, à vérifier avant diffusion si la précision est importante
  const liste = [
    ['Blanc de poulet','','Viande/Poisson/Œufs',165,31,3.6,0],
    ['Steak haché 5%','','Viande/Poisson/Œufs',137,21,5,0],
    ['Saumon','','Viande/Poisson/Œufs',208,20,13,0],
    ['Thon au naturel','','Viande/Poisson/Œufs',116,26,1,0],
    ['Œuf entier','','Viande/Poisson/Œufs',155,13,11,1.1],
    ['Jambon blanc','','Viande/Poisson/Œufs',107,20,3,0.5],
    ['Riz blanc cuit','','Féculents',130,2.7,0.3,28],
    ['Riz complet cuit','','Féculents',123,2.6,1,25],
    ['Pâtes cuites','','Féculents',131,5,1.1,25],
    ['Pomme de terre','','Féculents',77,2,0.1,17],
    ['Patate douce','','Féculents',86,1.6,0.1,20],
    ['Pain complet','','Féculents',247,9,3.4,41],
    ['Avoine (flocons)','','Féculents',389,17,7,66],
    ['Quinoa cuit','','Féculents',120,4.4,1.9,21],
    ['Lentilles cuites','','Légumineuses',116,9,0.4,20],
    ['Pois chiches cuits','','Légumineuses',164,8.9,2.6,27],
    ['Haricots rouges cuits','','Légumineuses',127,8.7,0.5,23],
    ['Lait demi-écrémé','','Produits laitiers',46,3.3,1.5,4.8],
    ['Yaourt nature','','Produits laitiers',61,3.5,3.3,4.7],
    ['Fromage blanc 0%','','Produits laitiers',45,8,0.2,4],
    ['Skyr','','Produits laitiers',63,11,0.2,4],
    ['Emmental','','Produits laitiers',380,28,29,0.5],
    ['Brocoli','','Légumes',34,2.8,0.4,7],
    ['Haricots verts','','Légumes',31,1.8,0.1,7],
    ['Carotte','','Légumes',41,0.9,0.2,10],
    ['Tomate','','Légumes',18,0.9,0.2,3.9],
    ['Épinards','','Légumes',23,2.9,0.4,3.6],
    ['Banane','','Fruits',89,1.1,0.3,23],
    ['Pomme','','Fruits',52,0.3,0.2,14],
    ['Amandes','','Oléagineux',579,21,50,22],
    ['Huile d\u2019olive','','Matières grasses',884,0,100,0],
    ['Beurre de cacahuète','','Oléagineux',588,25,50,20]
  ];
  await Promise.all(liste.map(([nom,marque,categorie,kcal,prot,lip,gluc])=>db.collection('produits_bib').add({nom, marque, categorie, kcal100:kcal, proteines100:prot, lipides100:lip, glucides100:gluc})));
  toast('Liste de départ ajoutée'); refreshAlimView();
}
async function addJournalEntry(){
  const produitId = S.jaSelectedProduitId;
  const quantite = parseFloat(val('ja-quantite'))||0;
  if(quantite<=0){ toast('Quantité invalide'); return; }
  let produitNom, kcal100, prot100, lip100, gluc100;
  if(produitId){
    const p = (S.produitsBibCache||[]).find(x=>x.id===produitId);
    if(!p) return;
    produitNom = p.nom + (p.marque?' ('+p.marque+')':'');
    kcal100=parseFloat(p.kcal100)||0; prot100=parseFloat(p.proteines100)||0; lip100=parseFloat(p.lipides100)||0; gluc100=parseFloat(p.glucides100)||0;
  } else {
    const nom = val('ja-nom'); const marque = val('ja-marque'); const categorie = val('ja-categorie');
    if(!nom){ toast('Sélectionnez un produit ou créez-en un nouveau'); return; }
    kcal100 = parseFloat(val('ja-kcal100'))||0; prot100 = parseFloat(val('ja-prot100'))||0; lip100 = parseFloat(val('ja-lip100'))||0; gluc100 = parseFloat(val('ja-gluc100'))||0;
    await db.collection('produits_bib').add({nom, marque, categorie, kcal100, proteines100:prot100, lipides100:lip100, glucides100:gluc100});
    produitNom = nom + (marque?' ('+marque+')':'');
  }
  const kcal = kcal100*quantite/100, proteines = prot100*quantite/100, lipides = lip100*quantite/100;
  await db.collection('journal_alimentaire').add({
    clientId: S.currentClientObj.id, date:todayStr(), produitNom, quantiteG:quantite,
    kcal100, proteines100:prot100, lipides100:lip100,
    kcal, proteines, lipides, createdAt:todayStr()
  });
  toast('Ajouté'); renderClientTabContent();
}
async function openEditJournalEntry(id){
  const doc = await db.doc('journal_alimentaire/'+id).get();
  const e = {id:doc.id, ...doc.data()};
  openModal(`
    <h3>Modifier l'entrée</h3>
    <p>${e.produitNom}</p>
    <label>Quantité (g)</label><input type="number" id="jae-quantite" value="${e.quantiteG}">
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveJournalEntryEdit('${id}')">Enregistrer</button></div>
  `);
}
async function saveJournalEntryEdit(id){
  const quantite = parseFloat(val('jae-quantite'))||0;
  const doc = await db.doc('journal_alimentaire/'+id).get();
  const e = doc.data();
  const kcal = (e.kcal100||0)*quantite/100, proteines=(e.proteines100||0)*quantite/100, lipides=(e.lipides100||0)*quantite/100;
  await db.doc('journal_alimentaire/'+id).update({quantiteG:quantite, kcal, proteines, lipides});
  closeModal(); toast('Modifié'); renderClientTabContent();
}
async function deleteJournalEntry(id){
  await db.doc('journal_alimentaire/'+id).delete();
  renderClientTabContent();
}
// ---- ALIMENTS & RECETTES (vue coach) ----
function refreshAlimView(){ if(S.view==='client') renderClientTabContent(); else renderAlimentsTab(); }
async function renderAlimentsTab(editId){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [produits, recettes] = await Promise.all([loadAllProduitsBib(), loadAllRecettes()]);
  if(S.homeTab!=='aliments' || !document.getElementById('hometabcontent')) return;
  S.produitsBibCache = produits; S.recettesCache = recettes;
  const ed = editId ? produits.find(p=>p.id===editId) : null;
  const v = k => (ed && ed[k]!==undefined && ed[k]!==null) ? ed[k] : '';
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>${ed?'Modifier un aliment':'Ajouter un aliment'}</h2>
      <p class="empty">Bibliothèque partagée avec les clients (ils peuvent aussi y ajouter des produits). Les entrées déjà saisies dans les journaux ne sont pas modifiées.</p>
      <div class="formrow">
        <div><label>Nom</label><input id="al-nom" value="${v('nom')}"></div>
        <div><label>Marque</label><input id="al-marque" value="${v('marque')}"></div>
      </div>
      <label>Catégorie</label><select id="al-categorie">${FOOD_CATEGORIES.map(c=>`<option value="${c}" ${ed&&ed.categorie===c?'selected':''}>${c}</option>`).join('')}</select>
      <div class="formrow">
        <div><label>Kcal /100g</label><input type="number" step="0.1" id="al-kcal100" value="${v('kcal100')}"></div>
        <div><label>Protéines /100g</label><input type="number" step="0.1" id="al-prot100" value="${v('proteines100')}"></div>
        <div><label>Lipides /100g</label><input type="number" step="0.1" id="al-lip100" value="${v('lipides100')}"></div>
        <div><label>Glucides /100g</label><input type="number" step="0.1" id="al-gluc100" value="${v('glucides100')}"></div>
      </div>
      <div class="modalbtns">
        ${ed?`<button class="btn btn-secondary" onclick="renderAlimentsTab()">Annuler</button>`:''}
        <button class="btn btn-primary" onclick="saveProduitCoach(${ed?`'${ed.id}'`:'null'})">${ed?'Enregistrer les modifications':'+ Ajouter'}</button>
      </div>
    </div>
    <div class="card">
      <h2>Bibliothèque d\u2019aliments (${produits.length})</h2>
      ${produits.length===0?`<button class="btn btn-secondary btn-sm" onclick="seedProduitsBib()">Charger une liste de départ (aliments courants · valeurs estimées, à vérifier)</button>`:''}
      <input id="al-search" placeholder="Rechercher un nom ou une marque..." oninput="filterAlimentsCoach()">
      <div id="al-list" style="margin-top:8px"></div>
    </div>
    <div class="card">
      <h2>Recettes <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></h2>
      <div style="margin-top:10px">
      ${recettes.length? recettes.map(r=>`<div class="seance-row" style="cursor:pointer" onclick="viewRecette('${r.id}')"><span>${r.nom}</span><span class="empty">${Math.round(r.kcal)} kcal</span></div>`).join('') : '<div class="empty">Aucune recette enregistrée</div>'}
      </div>
    </div>
  `;
  filterAlimentsCoach();
}
function filterAlimentsCoach(){
  const box = document.getElementById('al-list'); if(!box) return;
  const search = (val('al-search')||'').toLowerCase();
  const list = (S.produitsBibCache||[]).filter(p=>!search || (p.nom||'').toLowerCase().includes(search) || (p.marque||'').toLowerCase().includes(search))
    .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
  box.innerHTML = list.length ? list.map(p=>`<div class="seance-row"><span>${p.nom}${p.marque?' ('+p.marque+')':''}${p.categorie?' · '+p.categorie:''}<br><span class="empty">${p.kcal100||0} kcal · ${p.proteines100||0}g P · ${p.lipides100||0}g L · ${p.glucides100||0}g G (/100g)</span></span>
    <span><button class="btn btn-secondary btn-sm" onclick="renderAlimentsTab('${p.id}')">Modifier</button> <button class="btn btn-danger btn-sm" onclick="askDelete('deleteProduit','${p.id}','Supprimer cet aliment ?')">Supprimer</button></span></div>`).join('') : '<div class="empty">Aucun aliment</div>';
}
async function saveProduitCoach(editId){
  const nom = val('al-nom').trim();
  if(!nom){ toast('Nom requis'); return; }
  const data = {nom, marque:val('al-marque').trim(), categorie:val('al-categorie'),
    kcal100:parseFloat(val('al-kcal100'))||0, proteines100:parseFloat(val('al-prot100'))||0, lipides100:parseFloat(val('al-lip100'))||0, glucides100:parseFloat(val('al-gluc100'))||0};
  if(editId){ await db.doc('produits_bib/'+editId).update(data); toast('Aliment modifié'); }
  else { await db.collection('produits_bib').add(data); toast('Aliment ajouté'); }
  renderAlimentsTab();
}
async function deleteProduit(id){
  await db.doc('produits_bib/'+id).delete();
  renderAlimentsTab();
}
// Modale de confirmation générique pour les suppressions.
function askDelete(fnName, id, label){
  openModal(`<h3>${label}</h3><p class="empty">Cette action est définitive.</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="closeModal();${fnName}('${id}')">Supprimer</button></div>`);
}
async function loadAllRecettes(){
  const snap = await db.collection('recettes').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
function computeRecetteTotals(ingredients){
  return ingredients.reduce((acc,ing)=>({kcal:acc.kcal+(ing.kcal100*ing.quantiteG/100), proteines:acc.proteines+(ing.prot100*ing.quantiteG/100), lipides:acc.lipides+(ing.lip100*ing.quantiteG/100)}), {kcal:0,proteines:0,lipides:0});
}
function openRecetteBuilder(editId){
  const r = editId ? (S.recettesCache||[]).find(x=>x.id===editId) : null;
  S.recetteBuilder = r ? {id:r.id, nom:r.nom, guide:r.guide||'', ingredients:JSON.parse(JSON.stringify(r.ingredients||[]))} : {id:null, nom:'', guide:'', ingredients:[]};
  renderRecetteBuilder();
}
function renderRecetteBuilder(){
  const b = S.recetteBuilder;
  const totals = computeRecetteTotals(b.ingredients);
  openModal(`
    <h3>${b.id?'Modifier':'Nouvelle'} recette</h3>
    <label>Nom</label><input id="rc-nom" value="${b.nom}">
    <label>Guide de préparation / conseils</label><textarea id="rc-guide" rows="4">${b.guide}</textarea>
    <label>Ingrédients</label>
    ${b.ingredients.map((ing,i)=>`<div class="seance-row"><span>${ing.nom} · ${ing.quantiteG} g</span><button class="btn btn-danger btn-sm" onclick="removeRecetteIngredient(${i})">Retirer</button></div>`).join('')}
    <div class="formrow">
      <div style="flex:2"><select id="rc-ing-select">${(S.produitsBibCache||[]).map(p=>`<option value="${p.id}">${p.nom}</option>`).join('')}</select></div>
      <div><input type="number" id="rc-ing-qte" placeholder="g" style="width:80px"></div>
      <div><button class="btn btn-secondary" onclick="addRecetteIngredient()">Ajouter</button></div>
    </div>
    <div class="empty" style="margin-top:10px">Total : ${Math.round(totals.kcal)} kcal · ${Math.round(totals.proteines)}g prot · ${Math.round(totals.lipides)}g lip</div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveRecette()">Enregistrer</button></div>
  `);
}
function captureRecetteBuilder(){
  if(S.recetteBuilder && document.getElementById('rc-nom')){ S.recetteBuilder.nom=val('rc-nom'); S.recetteBuilder.guide=val('rc-guide'); }
}
function addRecetteIngredient(){
  captureRecetteBuilder();
  const pid = val('rc-ing-select');
  const qte = parseFloat(val('rc-ing-qte'))||0;
  const p = (S.produitsBibCache||[]).find(x=>x.id===pid);
  if(!p || qte<=0){ toast('Choisissez un produit et une quantité'); return; }
  S.recetteBuilder.ingredients.push({produitId:p.id, nom:p.nom, quantiteG:qte, kcal100:p.kcal100||0, prot100:p.proteines100||0, lip100:p.lipides100||0});
  renderRecetteBuilder();
}
function removeRecetteIngredient(i){
  captureRecetteBuilder();
  S.recetteBuilder.ingredients.splice(i,1);
  renderRecetteBuilder();
}
async function saveRecette(){
  const nom = val('rc-nom'); const guide = val('rc-guide');
  if(!nom){ toast('Nom requis'); return; }
  const totals = computeRecetteTotals(S.recetteBuilder.ingredients);
  const data = {nom, guide, ingredients:S.recetteBuilder.ingredients, kcal:totals.kcal, proteines:totals.proteines, lipides:totals.lipides};
  if(S.recetteBuilder.id){ await db.doc('recettes/'+S.recetteBuilder.id).update(data); }
  else{ await db.collection('recettes').add({...data, createdAt:todayStr()}); }
  closeModal(); toast('Recette enregistrée'); refreshAlimView();
}
function viewRecette(id){
  const r = (S.recettesCache||[]).find(x=>x.id===id);
  if(!r) return;
  openModal(`
    <h3>${r.nom}</h3>
    <div class="empty">${Math.round(r.kcal)} kcal · ${Math.round(r.proteines)}g prot · ${Math.round(r.lipides)}g lip (total de la recette)</div>
    ${r.guide?`<p style="white-space:pre-wrap;margin-top:10px">${r.guide}</p>`:''}
    <label>Ingrédients</label>
    ${r.ingredients.map(i=>`<div class="empty">${i.nom} · ${i.quantiteG} g</div>`).join('')}
    <div class="modalbtns">
      <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
      <button class="btn btn-secondary" onclick="openRecetteBuilder('${id}')">Modifier</button>
      <button class="btn btn-danger" onclick="askDelete('deleteRecette','${id}','Supprimer cette recette ?')">Supprimer</button>
      ${S.view==='client'?`<button class="btn btn-primary" onclick="logRecetteToJournal('${id}')">Ajouter à mon journal</button>`:''}
    </div>
  `);
}
async function deleteRecette(id){
  await db.doc('recettes/'+id).delete();
  closeModal(); refreshAlimView();
}
async function logRecetteToJournal(id){
  const r = (S.recettesCache||[]).find(x=>x.id===id);
  if(!r) return;
  await db.collection('journal_alimentaire').add({
    clientId: S.currentClientObj.id, date:todayStr(), produitNom:'Recette : '+r.nom, quantiteG:null,
    kcal100:null, proteines100:null, lipides100:null, recetteId:r.id,
    kcal:r.kcal, proteines:r.proteines, lipides:r.lipides, createdAt:todayStr()
  });
  closeModal(); toast('Ajouté à votre journal'); renderClientTabContent();
}
async function loadActiveAttribution(clientId){
  const snap = await db.collection('attributions').where('clientId','==',clientId).get();
  const all = snap.docs.map(d=>({id:d.id,...d.data()}));
  return all.find(a=>a.active) || null;
}
async function loadAllAttributionsForClient(clientId){
  const snap = await db.collection('attributions').where('clientId','==',clientId).get();
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
}
async function renderClientEntrainement(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const attr = await loadActiveAttribution(c.id);
  if(!attr){ el.innerHTML = '<div class="card"><div class="empty">Aucun programme d\'entraînement disponible pour le moment.</div></div>'; return; }
  const idx = attr.currentEntrainementIndex;
  const ent = attr.entrainements[idx];
  S.clientCurrentAttributionId = attr.id; S.clientCurrentEntIdx = idx;
  el.innerHTML = `
    <div class="card">
      <h2>Mon programme (${attr.cycleNom})</h2>
      <p>Prochain entraînement : <b>${ent.nom}</b></p>
      ${ent.valide ? `<button class="btn btn-primary" onclick="renderClientEntrainementDetail()">Commencer cet entraînement</button>`
                    : `<div class="badge warn">En attente de validation de votre coach</div>`}
    </div>
  `;
}
async function renderClientEntrainementDetail(){
  const doc = await db.doc('attributions/'+S.clientCurrentAttributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const ent = attr.entrainements[S.clientCurrentEntIdx];
  if(!S.leconsAllCache) S.leconsAllCache = await loadAllLecons();
  (document.getElementById('clientsub')||document.getElementById('clienttabcontent')).innerHTML = `
    <div class="card">
      <h2>${ent.nom}</h2>
      ${ent.mouvements.map((mv,i)=>`
        <div class="card" style="background:var(--bg)">
          <b>${mv.nom}</b> ${mv.groupeMusculaire?'('+mv.groupeMusculaire+(mv.typeTravail?' · '+mv.typeTravail:'')+')':''}
          <p>${mvSpec(mv)}${mv.tempo?' · tempo '+mv.tempo:''}${mv.tempsRecup?' · récupération '+mv.tempsRecup+' s':''}</p>
          ${mv.ressourceId?`<button class="btn btn-secondary btn-sm" onclick="clientViewRessource('${mv.ressourceId}')">Voir la leçon</button>`:''}
          <label>Répétitions minimales réalisées</label><div class="stepper"><button type="button" aria-label="Moins" onclick="stepInput('log-reps-${i}',-1)">−</button><input type="text" inputmode="numeric" id="log-reps-${i}" placeholder="–"><button type="button" aria-label="Plus" onclick="stepInput('log-reps-${i}',1)">+</button></div>
          <label>Commentaire</label><textarea id="log-comment-${i}" rows="1"></textarea>
        </div>
      `).join('')}
      <div class="modalbtns"><button class="btn btn-secondary" onclick="switchClientTab('entrainement')">Annuler</button><button class="btn btn-primary" onclick="submitEntrainementLog()">J\u2019ai terminé</button></div>
    </div>
  `;
}
// Lit les répétitions saisies. Champ vide = « non renseigné » (null), jamais 0.
// Obligatoire pour les mouvements en surcharge progressive (la charge suivante en dépend).
function stepInput(id, delta){ const el=document.getElementById(id); if(!el) return; const v=parseInt(el.value,10); el.value = String(Math.max(0,(isNaN(v)?0:v)+delta)); }
function readRepsResults(ent, repsPrefix, commentPrefix){
  const out=[];
  for(let i=0;i<ent.mouvements.length;i++){
    const mv = ent.mouvements[i];
    const rawv = val(repsPrefix+i).trim();
    const reps = rawv==='' ? null : parseInt(rawv,10);
    if(reps!==null && (isNaN(reps) || reps<0)){ toast('Répétitions invalides pour : '+mv.nom); return null; }
    if(mv.surchargeProgressive && reps===null){ toast('Indiquez les répétitions réalisées pour : '+mv.nom); return null; }
    out.push({mouvementIndex:i, nom:mv.nom, repsMin:reps, commentaire:val(commentPrefix+i)});
  }
  return out;
}
// « 6×12 · 20 kg » ou « 3 × 45 s » pour un exercice chronométré ; la charge n'apparaît que si elle est > 0.
function mvSpec(mv, chargeKey){
  const charge = parseFloat(mv[chargeKey||'chargeActuelle'])||0;
  const t = parseInt(mv.tempsWork,10);
  let base = (t>0 && !(parseInt(mv.repsCible,10)>0)) ? `${mv.series} × ${t} s` : `${mv.series}×${mv.repsCible}`;
  if(charge>0) base += ` · ${charge} kg`;
  return base;
}
function repsStr(r){ return (typeof r.repsMin==='number' && !isNaN(r.repsMin)) ? r.repsMin+' répétitions min' : 'répétitions non renseignées'; }
async function processEntrainementLog(clientId, attributionId, entIdx, entNom, resultats, seanceId){
  await db.collection('entrainement_logs').add({
    clientId, attributionId, entrainementIndex:entIdx, entrainementNom:entNom, seanceId: seanceId||null,
    date:todayStr(), resultats, vu:false, createdAt:todayStr()
  });
  const doc = await db.doc('attributions/'+attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const ent = attr.entrainements[entIdx];
  let chargeChanged = false;
  resultats.forEach(r=>{
    const mv = ent.mouvements[r.mouvementIndex];
    if(mv && mv.surchargeProgressive && typeof r.repsMin==='number' && !isNaN(r.repsMin)){
      chargeChanged = true;
      if(r.repsMin <= mv.repsSeuilBas){
        const nouvelleCharge = Math.round(((mv.chargeDepart + mv.chargeActuelle)/2)*10)/10;
        mv.chargeDepart = nouvelleCharge; mv.chargeActuelle = nouvelleCharge;
      } else {
        mv.chargeActuelle = Math.round((mv.chargeActuelle + (mv.augmentation||0))*10)/10;
      }
    }
  });
  if(chargeChanged) ent.valide = false;
  attr.currentEntrainementIndex = (entIdx+1) % attr.entrainements.length;
  await db.doc('attributions/'+attributionId).update({entrainements:attr.entrainements, currentEntrainementIndex:attr.currentEntrainementIndex});
}
async function submitEntrainementLog(){
  const doc = await db.doc('attributions/'+S.clientCurrentAttributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const entIdx = S.clientCurrentEntIdx;
  const ent = attr.entrainements[entIdx];
  if(!attr.active || attr.currentEntrainementIndex!==entIdx || !ent || !ent.valide){
    toast('Cet entraînement a déjà été enregistré ou n\u2019est plus disponible.');
    switchClientTab('entrainement'); return;
  }
  const resultats = readRepsResults(ent, 'log-reps-', 'log-comment-');
  if(!resultats) return;
  await processEntrainementLog(S.currentClientObj.id, attr.id, entIdx, ent.nom, resultats, null);
  toast('Entraînement validé, bravo !');
  switchClientTab('accueil');
}
async function loadClients(){
  const snap = await db.collection('clients').orderBy('nom').get();
  S.clients = snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadClientData(id){
  const [bilanDoc, evoSnap, progSnap, cfgDoc, suiviSnap] = await Promise.all([
    db.doc('bilans/'+id).get(),
    db.collection('evolutions').where('clientId','==',id).get(),
    db.collection('programmes').where('clientId','==',id).get(),
    db.doc('suivi_config/'+id).get(),
    db.collection('suivis').where('clientId','==',id).get(),
  ]);
  S.bilan = bilanDoc.exists ? bilanDoc.data() : null;
  S.evolutions = evoSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.date.localeCompare(a.date));
  S.programmes = progSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.date+((b.heure)||'')).localeCompare(a.date+((a.heure)||'')));
  S.suiviConfig = cfgDoc.exists ? cfgDoc.data() : null;
  S.suivis = suiviSnap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllProgrammes(){
  if(FIREBASE_MODE && FB.role==='client'){
    const snap = await db.collection('programmes').where('clientId','==',FB.clientId).get();
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  const snap = await db.collection('programmes').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllSuivis(){
  const snap = await db.collection('suivis').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllEvolutions(){
  const snap = await db.collection('evolutions').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllSuiviConfigs(){
  const snap = await db.collection('suivi_config').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllIndispos(){
  const snap = await db.collection('indisponibilites').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllBilans(){
  const snap = await db.collection('bilans').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllDemandes(){
  const snap = await db.collection('demandes').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllDemandesRdv(){
  const snap = await db.collection('demandes_rdv').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllDemandesResiliation(){
  const snap = await db.collection('demandes_resiliation').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllEntrainementLogs(){
  const snap = await db.collection('entrainement_logs').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllAttributions(){
  const snap = await db.collection('attributions').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
const MONTHNAMES=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
function monthKey(dateStr){return dateStr.slice(0,7);}
function monthLabel(key){const [y,m]=key.split('-');return MONTHNAMES[parseInt(m,10)-1]+' '+y;}
function monthBounds(key){const [y,m]=key.split('-').map(Number); const start=y+'-'+pad2(m)+'-01'; const lastDay=new Date(y,m,0).getDate(); const end=y+'-'+pad2(m)+'-'+pad2(lastDay); return {start,end};}
function statsForMonth(key, allProg, allSuivis){
  const {start,end}=monthBounds(key);
  const prog = allProg.filter(p=>p.type==='avec' && p.date>=start && p.date<=end && p.statut!=='annulee');
  const prevues = prog.filter(p=>p.statut==='prevue').length;
  const realisees = prog.filter(p=>p.statut==='faite').length;
  const offertes = prog.filter(p=>p.offert).length;
  const expressReg = prog.filter(p=>p.formule==='express' && p.paiement).reduce((s,p)=>s+p.tarif,0);
  const classiqueReg = prog.filter(p=>p.formule==='classique' && p.paiement).reduce((s,p)=>s+p.tarif,0);
  const suivisInMonth = allSuivis.filter(s=>s.periodeDebut>=start && s.periodeDebut<=end && !s.annule);
  const suiviReg = suivisInMonth.filter(s=>s.paiement).reduce((s2,s)=>s2+s.tarif,0);
  return {prevues, realisees, offertes, expressReg, classiqueReg, suiviReg, total:expressReg+classiqueReg+suiviReg};
}
function suivisEnCoursCount(key, allConfigs){
  const {start,end}=monthBounds(key);
  let count=0;
  allConfigs.forEach(cfg=>{
    const active=(cfg.segments||[]).some(seg=>{const segEnd=seg.end||'9999-12-31';return seg.start<=end && segEnd>=start;});
    if(active) count++;
  });
  return count;
}
function allActivityMonths(allProg, allSuivis){
  const set=new Set();
  allProg.forEach(p=>{ if(p.type==='avec') set.add(monthKey(p.date)); });
  allSuivis.forEach(s=>set.add(monthKey(s.periodeDebut)));
  set.add(monthKey(todayStr()));
  return Array.from(set).sort().reverse();
}

function toast(msg){
  const t=document.createElement('div'); t.className='toast'; t.textContent=unesc(msg);
  document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
}
function openModal(html){
  document.getElementById('modalroot').innerHTML = '<div class="modalbg" id="mbg"><div class="modal">'+html+'</div></div>';
  document.getElementById('mbg').addEventListener('click',e=>{if(e.target.id==='mbg')closeModal();});
}
function closeModal(){document.getElementById('modalroot').innerHTML='';}

// ---------- date/period helpers ----------
function startOfWeek(offset){
  const d=new Date(); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day+offset*7); d.setHours(0,0,0,0); return d;
}
function isoDate(d){return toLocalISO(d);}
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}
const DAYNAMES=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

// Date de début + k mois, au même quantième ; si le mois est trop court, dernier jour du mois
// (31/01 → 28/02 → 31/03), toujours calculé depuis la date de départ pour ne pas dériver.
function addMonthsClamped(startStr, k){
  const [y,m,d] = startStr.split('-').map(Number);
  const first = new Date(y, m-1+k, 1);
  const last = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
  return toLocalISO(new Date(first.getFullYear(), first.getMonth(), Math.min(d,last)));
}
// Périodes [start, end[ ; « tronquee » = arrêtée par une pause/annulation (fin incluse).
function computePeriods(config, upToStr){
  if(!config || !config.segments) return [];
  const periods=[]; const upTo = upToStr || todayStr();
  for(const seg of config.segments){
    if(!seg.start) continue;
    for(let k=0; k<1200; k++){
      const start = addMonthsClamped(seg.start, k);
      if(start > upTo) break;
      if(seg.end && (start > seg.end || (k>0 && start === seg.end))) break;
      const next = addMonthsClamped(seg.start, k+1);
      const tronquee = !!(seg.end && next >= seg.end);
      periods.push({start, end: tronquee ? seg.end : next, tronquee});
    }
  }
  return periods;
}
function suiviTarif(n){ if(n>=5)return 0; if(n===4)return 36; if(n===3)return 62; return 89; }
function inPeriod(date, p){ return date>=p.start && (date<p.end || (p.tronquee && date<=p.end)); }
// Séances avec coach payées ou offertes, non annulées, dans la période.
function countPaidSessions(programmes, clientId, p){
  return programmes.filter(pr=>pr.clientId===clientId && pr.type==='avec' && pr.paiement && pr.statut!=='annulee' && inPeriod(pr.date, p)).length;
}
// Crée / met à jour les périodes de suivi d'un client (les périodes payées ou annulées sont figées).
async function syncSuiviDocs(clientId, cfg, programmes, suivis){
  for(const p of computePeriods(cfg)){
    const id = clientId+'_'+p.start;
    const existing = suivis.find(x=>x.id===id);
    const nb = countPaidSessions(programmes, clientId, p);
    const tarif = suiviTarif(nb);
    if(!existing){
      const rec = {clientId, periodeDebut:p.start, periodeFin:p.end, nbSeances:nb, tarif, paiement:false, annule:false};
      await db.collection('suivis').doc(id).set(rec);
      suivis.push({id, ...rec});
    } else if(!existing.paiement && !existing.annule){
      if(existing.nbSeances!==nb || existing.tarif!==tarif || existing.periodeFin!==p.end){
        await db.collection('suivis').doc(id).update({nbSeances:nb, tarif, periodeFin:p.end});
        existing.nbSeances=nb; existing.tarif=tarif; existing.periodeFin=p.end;
      }
    }
  }
}
async function ensurePeriodDocs(clientId){
  if(S.suiviConfig) await syncSuiviDocs(clientId, S.suiviConfig, S.programmes, S.suivis);
}

function unpaidForClient(clientId, programmes, suivis){
  const retard=[], avenir=[]; const today=todayStr();
  programmes.filter(p=>p.clientId===clientId && p.type==='avec' && !p.paiement && p.statut!=='annulee').forEach(p=>{
    const item={type:'seance', id:p.id, label:(p.formule==='express'?'Coaching Express':'Coaching Classique')+' du '+fmtDate(p.date)+(p.heure?' à '+p.heure:''), montant:p.tarif, date:p.date, clientId, declare:!!p.paiementDeclare, declareAt:p.paiementDeclareAt||null};
    (p.date<=today?retard:avenir).push(item);
  });
  suivis.filter(s=>s.clientId===clientId && !s.paiement && s.tarif>0 && !s.annule).forEach(s=>{
    const item={type:'suivi', id:s.id, label:'Suivi mensuel du '+fmtDate(s.periodeDebut)+' au '+fmtDate(s.periodeFin), montant:s.tarif, date:s.periodeDebut, clientId, declare:!!s.paiementDeclare, declareAt:s.paiementDeclareAt||null};
    (s.periodeDebut<=today?retard:avenir).push(item);
  });
  return {retard, avenir};
}

// ---------- PAIEMENT EN UN CLIC ----------
// settings/paiement = {paypalMe, lydia, note} (jamais de coordonnées bancaires). Le client paie via le lien, puis déclare « J'ai payé » ;
// le coach confirme (il reçoit de toute façon la notification de PayPal / de sa banque).
const PAIEMENT_DEFAULTS = {paypalMe:'', lydia:'', note:''};
async function loadPaiementSettings(){
  if(S.paiement) return S.paiement;
  try{ const d = await db.doc('settings/paiement').get(); S.paiement = Object.assign({}, PAIEMENT_DEFAULTS, d.exists ? d.data() : {}); }
  catch(e){ S.paiement = Object.assign({}, PAIEMENT_DEFAULTS); }
  return S.paiement;
}
function paypalHandle(v){ return String(v||'').trim().replace(/^https?:\/\//i,'').replace(/^(www\.)?paypal\.me\//i,'').replace(/^@/,'').replace(/[\/?#].*$/,''); }
function paypalUrl(handle, montant){ const h = paypalHandle(handle); return h ? 'https://www.paypal.me/'+encodeURIComponent(h)+'/'+Number(montant).toFixed(2)+'EUR' : ''; }
function payButtonsHtml(item, pay){
  const url = paypalUrl(pay.paypalMe, item.montant);
  if(item.declare) return `<p class="note" style="margin-top:6px;color:var(--green)">Paiement envoyé le ${fmtDate(item.declareAt||todayStr())} · en attente de confirmation par votre coach</p>`;
  return `<div class="chips" style="margin-top:8px">
      ${url ? `<a class="btn btn-primary btn-sm" href="${url}" target="_blank" rel="noopener">Payer ${euro(item.montant)} avec PayPal</a>` : ''}
      <button class="btn btn-secondary btn-sm" onclick="declarePaiement('${item.type}','${item.id}')">J’ai payé</button>
    </div>`;
}
function payOtherNoteHtml(pay){
  const other = [pay.lydia ? 'Lydia : '+pay.lydia : '', pay.note||''].filter(Boolean).join(' · ');
  if(other) return `<p class="note" style="margin-top:10px">${other}${other.endsWith('.')?'':'.'} Après un paiement par ce moyen, touchez « J’ai payé ».</p>`;
  return paypalHandle(pay.paypalMe) ? '' : '<p class="note" style="margin-top:10px">Réglez directement auprès de votre coach, puis touchez « J’ai payé ».</p>';
}
async function declarePaiement(type, id){
  if(!confirm('Confirmer que vous avez envoyé le paiement ? Votre coach le validera de son côté.')) return;
  const path = (type==='suivi' ? 'suivis/' : 'programmes/')+id;
  await db.doc(path).update({paiementDeclare:true, paiementDeclareAt:todayStr()});
  const list = type==='suivi' ? S.suivis : S.programmes;
  const it = (list||[]).find(x=>x.id===id); if(it){ it.paiementDeclare=true; it.paiementDeclareAt=todayStr(); }
  toast('Merci, votre coach va confirmer');
  renderClientProfileArea();
}
function clientPayCardHtml(unpaid, pay){
  const items = [...unpaid.retard, ...unpaid.avenir.filter(i=>i.type==='suivi')];
  if(!items.length) return '';
  const total = unpaid.retard.reduce((a,i)=>a+i.montant,0);
  return `<section class="section">
      <div class="section-head"><h2>${ico('euro','orange','sm')}À régler</h2>${total>0?`<span class="badge warn">${euro(total)}</span>`:''}</div>
      <div class="card">${items.map(i=>`<div class="seance-row" style="flex-direction:column;align-items:stretch;gap:2px"><div style="display:flex;justify-content:space-between;gap:10px"><span>${i.label}</span><b style="white-space:nowrap">${euro(i.montant)}</b></div>${payButtonsHtml(i, pay)}</div>`).join('')}${payOtherNoteHtml(pay)}</div>
    </section>`;
}
function openPaiementSettings(){
  const pay = S.paiement || PAIEMENT_DEFAULTS;
  openModal(`<h3>Moyens de paiement</h3>
    <p class="note">Affichés aux clients sur leurs séances et suivis à régler. Le bouton PayPal pré-remplit le montant. Le paiement se fait chez PayPal ou Lydia : l’application ne demande ni ne conserve aucune coordonnée bancaire, ni la vôtre ni celle des clients.</p>
    <label for="pay-paypal">Lien PayPal.Me (identifiant ou adresse)</label><div class="field"><input id="pay-paypal" value="${pay.paypalMe||''}" placeholder="coachalex"></div>
    <label for="pay-lydia">Lydia (identifiant public, facultatif)</label><div class="field"><input id="pay-lydia" value="${pay.lydia||''}" placeholder="coachalex"></div>
    <label for="pay-note">Consigne (facultatif)</label><div class="field"><input id="pay-note" value="${pay.note||''}" placeholder="Espèces acceptées en fin de séance"></div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="savePaiementSettings()">Enregistrer</button></div>`);
}
async function savePaiementSettings(){
  const data = {paypalMe:paypalHandle(val('pay-paypal')), lydia:val('pay-lydia').trim(), note:val('pay-note').trim()};
  if(/\bFR\d{2}[ \d]{10,}/i.test(data.note+' '+data.lydia)){ toast('Pas de RIB ni d’IBAN dans l’application : utilisez PayPal ou Lydia'); return; }
  await db.doc('settings/paiement').set(data);
  S.paiement = Object.assign({}, PAIEMENT_DEFAULTS, data);
  closeModal(); toast('Moyens de paiement enregistrés'); renderCompta();
}

// ---------- RENDER ----------
function clientName(c){return c.prenom+' '+c.nom;}
function attrNeedsValidation(a){
  const ent = a.active && a.entrainements && a.entrainements[a.currentEntrainementIndex];
  return !!ent && !ent.valide;
}

async function render(){
  const app=document.getElementById('app');
  const current = S.clients.find(c=>c.id===S.currentId);
  const pendingCount = await countPending();
  const plusTabs = ['plus','bibmouvements','bibcycles','aliments','lecons','challenges','niveaux','diet','compta','site','securite','affichage'];
  const act = current ? 'clients' : (plusTabs.includes(S.homeTab) ? 'plus' : S.homeTab);
  app.innerHTML = `
  <div class="shell">
    <nav class="tabbar" aria-label="Navigation principale">
      <div class="brandmini"><img src="${LOGO_SRC}" alt="">Gestion Client</div>
      <a class="${act==='journee'?'active':''}" onclick="switchHomeTab('journee')">${ICONS.journee}Journée${pendingCount>0?`<span class="count">${pendingCount}</span>`:''}</a>
      <a class="${act==='planning'?'active':''}" onclick="switchHomeTab('planning')">${ICONS.planning}Planning</a>
      <a class="${act==='clients'?'active':''}" onclick="switchHomeTab('clients')">${ICONS.clients}Clients</a>
      <a class="${act==='plus'?'active':''}" onclick="switchHomeTab('plus')">${ICONS.plus}Plus</a>
    </nav>
    <main class="main" id="main"></main>
  </div>`;
  if(current) renderClientPage(current); else renderHomeArea();
}
async function countPending(){
  const [allBilans, allDemandes, allRdv, allResil, allLogs, allAttrs] = await Promise.all([loadAllBilans(), loadAllDemandes(), loadAllDemandesRdv(), loadAllDemandesResiliation(), loadAllEntrainementLogs(), loadAllAttributions()]);
  return allBilans.filter(b=>!b.valide).length + allDemandes.filter(d=>d.statut==='attente').length + allRdv.filter(d=>d.statut==='attente').length
    + allResil.filter(d=>d.statut==='attente').length + allLogs.filter(l=>!l.vu).length + allAttrs.filter(attrNeedsValidation).length;
}
function renderHomeArea(){
  const main=document.getElementById('main');
  const t = S.homeTab;
  const sub = {bibmouvements:'Mouvements', bibcycles:'Cycles', aliments:'Aliments et recettes', lecons:'Mes enseignements', challenges:'Challenges', niveaux:'Niveaux', diet:'Calcul diététique', compta:'Compta', site:'Mon site', securite:'Sécurité', affichage:'Affichage'};
  if(sub[t]){
    main.innerHTML = `<a class="backlink" onclick="switchHomeTab('plus')">${ICONS.back}Plus</a><h1>${sub[t]}</h1><div id="hometabcontent"></div>`;
    if(t==='diet') renderDietTool();
    else if(t==='bibmouvements') renderBibMouvementsTab();
    else if(t==='bibcycles') renderBibCyclesTab();
    else if(t==='aliments') renderAlimentsTab();
    else if(t==='lecons') renderLeconsTab();
    else if(t==='challenges') renderChallengesTab();
    else if(t==='niveaux') renderNiveauxTab();
    else if(t==='compta') renderCompta();
    else if(t==='site') renderSiteSettings();
    else if(t==='securite') renderSecurite();
    else if(t==='affichage') renderAffichage();
    return;
  }
  main.innerHTML = '<div id="hometabcontent"></div>';
  if(t==='planning') renderPlanningTab();
  else if(t==='clients') renderClientsTab();
  else if(t==='plus') renderPlusTab();
  else renderJournee();
}
function switchHomeTab(t){ S.homeTab=t; S.currentId=null; S.leconsPath=[]; S.cycleBuilder=null; render(); }
// ---- TIME SLOT HELPERS ----
function timeToMin(t){ if(!t) return null; const [h,m]=t.split(':').map(Number); return h*60+m; }
function seanceDureeMin(formule){ return formule==='express'?60:120; }
function heureFin(heureDebut, formule){
  if(!heureDebut) return '';
  const end = timeToMin(heureDebut)+seanceDureeMin(formule);
  return String(Math.floor(end/60)).padStart(2,'0')+':'+String(end%60).padStart(2,'0');
}
const PROGRESSION_METHODS = {
  '6x12': {label:"6×12 (jusqu'à 8)", series:6, repsCible:12, repsSeuilBas:8},
  '5x5': {label:"5×5 (jusqu'à 3)", series:5, repsCible:5, repsSeuilBas:3},
  'perso': {label:'Personnalisé', series:null, repsCible:null, repsSeuilBas:null}
};
const TYPE_PLAN_KCAL_FIELD = {
  prise_masse: 'priseMasseAvec', regime_sans: 'regimeSans', regime_avec: 'regimeAvec',
  maintien_sans: 'maintienSans', maintien_avec: 'maintienAvec'
};
const TYPE_PLAN_LABELS = {
  prise_masse: 'Prise de masse', regime_sans: 'Régime (sans entraînement)', regime_avec: 'Régime (avec entraînement)',
  maintien_sans: 'Maintien (sans entraînement)', maintien_avec: 'Maintien (avec entraînement)'
};
const FOOD_CATEGORIES = ['Viande/Poisson/Œufs','Produits laitiers','Féculents','Légumes','Fruits','Matières grasses','Légumineuses','Oléagineux','Sucres/Snacks','Boissons','Compléments','Plats préparés','Autre'];
function rangesOverlap(aStart,aEnd,bStart,bEnd){ return aStart<bEnd && bStart<aEnd; }
function checkSlotAvailable(date, heureDebut, formule, excludeId, allProg, allIndispos){
  if(!heureDebut) return {ok:false, reason:"L'heure de début est obligatoire."};
  const startMin = timeToMin(heureDebut);
  const duree = seanceDureeMin(formule);
  const endMin = startMin+duree;
  if(startMin < 9*60) return {ok:false, reason:'Le coaching est possible entre 9h et 22h.'};
  if(endMin > 22*60) return {ok:false, reason:'Ce créneau dépasse 22h · choisissez une heure plus tôt.'};
  const others = allProg.filter(p=>p.type==='avec' && p.date===date && p.statut!=='annulee' && p.id!==excludeId && p.heure);
  for(const o of others){
    const oStart=timeToMin(o.heure), oEnd=oStart+seanceDureeMin(o.formule);
    if(startMin < oEnd+30 && oStart < endMin+30) return {ok:false, reason:'Ce créneau chevauche une séance déjà réservée (30 min de trajet nécessaires).'};
  }
  const dow = new Date(date+'T00:00:00').getDay();
  for(const ind of allIndispos){
    let applies = (ind.type==='ponctuelle' && ind.date===date) || (ind.type==='recurrente' && Number(ind.jourSemaine)===dow);
    if(!applies) continue;
    const iStart=timeToMin(ind.heureDebut), iEnd=timeToMin(ind.heureFin);
    if(startMin < iEnd && iStart < endMin) return {ok:false, reason:'Ce créneau est indisponible'+(ind.motif?(' ('+ind.motif+')'):'')+'.'};
  }
  return {ok:true};
}

// ---- PLANNING TAB ----
async function renderPlanningTab(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allEvo, allIndispos, allBilans, allDemandes, allAttrs] = await Promise.all([loadAllProgrammes(), loadAllEvolutions(), loadAllIndispos(), loadAllBilans(), loadAllDemandes(), loadAllAttributions()]);
  if(S.homeTab!=='planning' || !document.getElementById('hometabcontent')) return;
  S.indisposCache = allIndispos;
  const bilanMap = {}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const needAttr = {}; allAttrs.filter(attrNeedsValidation).forEach(a=>{ needAttr[a.clientId]=a; });
  const clOf = id => S.clients.find(c=>c.id===id);
  const today = todayStr();
  const weekStart = startOfWeek(S.weekOffset);
  const days = [...Array(7)].map((_,i)=>isoDate(addDays(weekStart,i)));
  const pending = allDemandes.filter(d=>d.statut==='attente');
  const dayHas = ds => allProg.some(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee');
  const dayReq = ds => pending.some(d=>d.date===ds);
  const sel = (S.planDay && days.includes(S.planDay)) ? S.planDay : (days.includes(today) ? today : days[0]);
  const shown = [sel];
  const sections = shown.map(ds=>{
    const dow = new Date(ds+'T00:00:00').getDay();
    const sessions = allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
    const reqs = pending.filter(d=>d.date===ds);
    const evos = allEvo.filter(e=>e.date===ds && (ds>today || !(parseFloat(e.poids)>0)));
    const ind = allIndispos.filter(i=>(i.type==='ponctuelle'&&i.date===ds)||(i.type==='recurrente'&&Number(i.jourSemaine)===dow));

    const entries = [
      ...sessions.map(p=>({t:p.heure||'', h:seanceRowHtml(p, clOf(p.clientId), {now:ds===today && p.statut==='prevue', tile:(ds===today && p.statut==='prevue')?'orange':'', needsValidation:!!(p.attributionId && needAttr[p.clientId]), lieu:(bilanMap[p.clientId]||{}).adresseCoaching})})),
      ...reqs.map(dm=>({t:dm.heureDebut, h:demandeRowHtml(dm, clOf(dm.clientId))})),
      ...ind.map(i=>({t:i.heureDebut, h:`<div class="row-muted"><span class="t">${i.heureDebut}</span><span>${i.motif||'Indisponible'} jusqu\u2019à ${i.heureFin}</span></div>`})),
      ...evos.map(e=>{ const cl=clOf(e.clientId); return {t:'00:00', h:`<div class="row-muted"><span class="t">–</span><span>Pesée programmée · ${cl?clientName(cl):'?'}</span></div>`}; })
    ].sort((a,b)=>a.t.localeCompare(b.t));
    return `<section class="section"><div class="section-head"><h2>${ico('journee','orange','sm')}${ds===today?'Aujourd\u2019hui':fmtDayLong(ds)}</h2><span class="note">${sessions.length? sessions.length+' séance'+(sessions.length>1?'s':'') : 'libre'}</span></div>${entries.length? entries.map(e=>e.h).join('') : '<div class="card"><div class="empty">Rien de prévu ce jour-là.</div></div>'}</section>`;
  }).join('');
  const others = days.filter(ds=>ds!==sel).map(ds=>{
    const sessions = allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
    const reqs = pending.filter(d=>d.date===ds);
    return [...sessions.map(p=>{ const cl=clOf(p.clientId); return `<div class="item" onclick="selectPlanDay('${ds}')"><span class="when"><b>${fmtDayShort(ds)}</b><small>${p.heure}</small></span><span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${formuleLabel(p.formule)}${p.entrainementNom?' · '+p.entrainementNom:''}</span></span>${p.statut==='faite'?'<span class="badge ok">Faite</span>':''}${ICONS.chev}</div>`; }),
            ...reqs.map(dm=>{ const cl=clOf(dm.clientId); return `<div class="item" onclick="selectPlanDay('${ds}')"><span class="when blue"><b>${fmtDayShort(ds)}</b><small>${dm.heureDebut}</small></span><span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">Demande · ${formuleLabel(dm.formule)}</span></span><span class="badge plan">À traiter</span></div>`; })].join('');
  }).join('');
  const recurrents = allIndispos.filter(i=>i.type==='recurrente').map(i=>JOURS_FULL[Number(i.jourSemaine)]+' '+i.heureDebut+'–'+i.heureFin+(i.motif?' ('+i.motif+')':''));
  const ponct = allIndispos.filter(i=>i.type==='ponctuelle' && i.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2).map(i=>(i.motif||'Indisponible')+' le '+fmtDate(i.date));
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${fmtMonthYear(days[0])}</span><h1>Planning</h1></div><div class="actions"><button class="btn btn-primary btn-sm" onclick="openNewSeanceChooser()">Nouvelle séance</button></div></div>
    <div class="weekcal">
      <div class="nav"><button aria-label="Semaine précédente" onclick="changeHomeWeek(-1)">${ICONS.prev}</button><span>Semaine du ${new Date(days[0]+'T00:00:00').getDate()} au ${new Date(days[6]+'T00:00:00').getDate()}</span><button aria-label="Semaine suivante" onclick="changeHomeWeek(1)">${ICONS.next}</button></div>
      <div class="days">${days.map(ds=>{ const d=new Date(ds+'T00:00:00'); const n=allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').length; return `<button class="day ${sel===ds?'sel':''} ${ds===today?'today':''}" onclick="selectPlanDay('${ds}')"><small>${DAYSHORT[d.getDay()].replace('.','')}</small><span class="n">${d.getDate()}</span><span class="m ${dayReq(ds)?'req':(n?'on':'')}" title="${n} séance(s)"></span></button>`; }).join('')}</div>
      <div class="legend"><span><i class="on"></i>séance</span><span><i class="req"></i>demande à traiter</span><span><i class="today"></i>aujourd\u2019hui</span></div>
    </div>
    ${sections}
    <section class="section"><div class="section-head"><h2>${ico('planning','blue','sm')}Le reste de la semaine</h2></div>${others? `<div class="list">${others}</div>` : '<div class="card"><div class="empty">Rien d\u2019autre cette semaine.</div></div>'}</section>
    <div class="section" style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:0 2px">
      <span class="note">${[...recurrents, ...ponct].join(' · ') || 'Aucune indisponibilité enregistrée'}</span>
      <button class="link" style="white-space:nowrap" onclick="openIndisposModal()">Indisponibilités</button>
    </div>`;
}
const JOURS_FULL=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function openNewSeanceChooser(){
  if(!S.clients.length){ toast('Créez d\u2019abord un client'); return; }
  openModal(`<h3>Nouvelle séance</h3><label>Pour quel client ?</label><select id="ns-client">${S.clients.map(c=>`<option value="${c.id}">${clientName(c)}</option>`).join('')}</select>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="closeModal();selectClient(val('ns-client'),'seance')">Continuer</button></div>`);
}
function openIndisposModal(){
  const all = S.indisposCache||[];
  openModal(`<h3>Indisponibilités</h3>
    ${all.length? all.map(i=>`<div class="seance-row"><span>${i.type==='ponctuelle'?fmtDate(i.date):JOURS_FULL[Number(i.jourSemaine)]+' (chaque semaine)'} · ${i.heureDebut}–${i.heureFin}${i.motif?' · '+i.motif:''}</span><button class="btn btn-danger btn-sm" onclick="closeModal();askDelete('deleteIndispo','${i.id}','Supprimer cette indisponibilité ?')">Supprimer</button></div>`).join('') : '<div class="empty">Aucune indisponibilité enregistrée</div>'}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Fermer</button><button class="btn btn-primary" onclick="openAddIndispo()">Ajouter</button></div>`);
}
function openAddIndispo(){
  openModal(`
    <h3>Ajouter une indisponibilité</h3>
    <label>Type</label>
    <select id="ind-type" onchange="toggleIndispoType()">
      <option value="ponctuelle">Ponctuelle (une date précise)</option>
      <option value="recurrente">Récurrente (chaque semaine)</option>
    </select>
    <div id="ind-ponctuelle-block"><label>Date</label><input type="date" id="ind-date" value="${todayStr()}"></div>
    <div id="ind-recurrente-block" style="display:none">
      <label>Jour de la semaine</label>
      <select id="ind-jour">
        <option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option>
        <option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option><option value="0">Dimanche</option>
      </select>
    </div>
    <div class="formrow">
      <div><label>De</label><input type="time" id="ind-debut" value="12:00"></div>
      <div><label>À</label><input type="time" id="ind-fin" value="14:00"></div>
    </div>
    <label>Motif (optionnel)</label><input id="ind-motif">
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveIndispo()">Ajouter</button></div>
  `);
}
function toggleIndispoType(){
  const t=val('ind-type');
  document.getElementById('ind-ponctuelle-block').style.display = t==='ponctuelle'?'block':'none';
  document.getElementById('ind-recurrente-block').style.display = t==='recurrente'?'block':'none';
}
async function saveIndispo(){
  const type=val('ind-type'), heureDebut=val('ind-debut'), heureFin=val('ind-fin'), motif=val('ind-motif');
  if(!heureDebut||!heureFin||timeToMin(heureFin)<=timeToMin(heureDebut)){ toast('Plage horaire invalide'); return; }
  const allProg = await loadAllProgrammes();
  const todayS = todayStr();
  let conflict=null;
  if(type==='ponctuelle'){
    const date=val('ind-date');
    conflict = allProg.find(p=>p.type==='avec' && p.statut!=='annulee' && p.date===date && p.heure && rangesOverlap(timeToMin(p.heure), timeToMin(p.heure)+seanceDureeMin(p.formule), timeToMin(heureDebut), timeToMin(heureFin)));
  } else {
    const jour=parseInt(val('ind-jour'),10);
    conflict = allProg.find(p=>{
      if(p.type!=='avec'||p.statut==='annulee'||!p.heure||p.date<todayS) return false;
      if(new Date(p.date+'T00:00:00').getDay()!==jour) return false;
      return rangesOverlap(timeToMin(p.heure), timeToMin(p.heure)+seanceDureeMin(p.formule), timeToMin(heureDebut), timeToMin(heureFin));
    });
  }
  if(conflict){
    const cl = S.clients.find(c=>c.id===conflict.clientId);
    toast('Impossible : séance avec '+(cl?clientName(cl):'un client')+' le '+fmtDate(conflict.date)+' à '+conflict.heure+' sur ce créneau.');
    return;
  }
  const data = type==='ponctuelle' ? {type, date:val('ind-date'), heureDebut, heureFin, motif} : {type, jourSemaine:val('ind-jour'), heureDebut, heureFin, motif};
  await db.collection('indisponibilites').add(data);
  closeModal(); renderPlanningTab();
}
async function deleteIndispo(id){
  await db.doc('indisponibilites/'+id).delete();
  renderPlanningTab();
}
async function accepterDemande(id){
  const allDemandes = await loadAllDemandes();
  const dm = allDemandes.find(x=>x.id===id);
  if(!dm){ toast('Demande introuvable'); return; }
  const [allProg, allIndispos] = await Promise.all([loadAllProgrammes(), loadAllIndispos()]);
  const check = checkSlotAvailable(dm.date, dm.heureDebut, dm.formule, null, allProg, allIndispos);
  if(!check.ok){ toast('Créneau indisponible : '+check.reason); return; }
  await db.collection('programmes').add({
    clientId:dm.clientId, date:dm.date, resume:'', notes:'', type:'avec', statut:'prevue',
    formule:dm.formule, tarif: dm.formule==='express'?EXPRESS_PRICE:CLASSIQUE_PRICE,
    offert:false, paiement:false, heure:dm.heureDebut,
    attributionId: dm.attributionId||null, entrainementIndex: (dm.entrainementIndex!==undefined?dm.entrainementIndex:null), entrainementNom: dm.entrainementNom||null, entrainementValide:false
  });
  await db.doc('demandes/'+id).update({statut:'acceptee'});
  toast('Séance créée'); renderPlanningTab();
}
async function refuserDemande(id){
  await db.doc('demandes/'+id).update({statut:'refusee'});
  toast('Demande refusée'); renderPlanningTab();
}
async function traiterRdv(id){
  await db.doc('demandes_rdv/'+id).update({statut:'traite'});
  toast('Marqué comme traité'); renderPlanningTab();
}
async function traiterResiliation(id){
  await db.doc('demandes_resiliation/'+id).update({statut:'traite'});
  toast('Marqué comme traité'); renderPlanningTab();
}
async function marquerLogVu(id){
  await db.doc('entrainement_logs/'+id).update({vu:true});
  renderPlanningTab();
}

function goHome(){ S.currentId=null; S.homeTab='journee'; render(); }
function selectClient(id, tab){
  S.currentId=id; S.tab=tab||'suivi';
  loadClientData(id).then(render);
}
// ---- JOURNÉE ----
function seanceRowHtml(p, cl, opts){
  opts = opts||{};
  const tile = p.statut==='faite' ? 'green' : (opts.tile||'');
  let state='';
  if(p.statut==='faite') state = p.paiement ? '<span class="badge ok">Fait</span>' : '<span class="badge warn">À encaisser</span>';
  else if(p.statut==='prevue' && opts.needsValidation) state = '<span class="badge warn">À préparer</span>';
  else if(p.statut==='prevue' && p.entrainementNom) state = '<span class="badge lock">Prévue</span>';
  const sub = [formuleLabel(p.formule), opts.lieu, p.entrainementNom].filter(Boolean).join(' · ');
  return `<div class="row ${opts.now?'now':''}" onclick="selectClient('${p.clientId}','seance')">
    <span class="tile ${tile}"><b>${p.heure||'–'}</b><small>${dureeLabel(p.formule)}</small></span>
    <span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${sub}</span></span>
    <span class="side">${state}</span>
  </div>`;
}
function demandeRowHtml(dm, cl){
  return `<div class="row request">
    <span class="tile blue"><b>${dm.heureDebut}</b><small>${dureeLabel(dm.formule)}</small></span>
    <span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${formuleLabel(dm.formule)} · ${fmtDate(dm.date)} · demande de séance</span></span>
    <span class="side"><span class="badge plan">Demande</span></span>
    <span class="actions"><button class="btn btn-secondary" onclick="refuserDemande('${dm.id}')">Refuser</button><button class="btn btn-primary" onclick="accepterDemande('${dm.id}')">Accepter</button></span>
  </div>`;
}
async function renderJournee(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allBilans, allDemandes, allRdv, allResil, allLogs, allAttrs, allSuivis, allConfigs, allIndispos] = await Promise.all([
    loadAllProgrammes(), loadAllBilans(), loadAllDemandes(), loadAllDemandesRdv(), loadAllDemandesResiliation(), loadAllEntrainementLogs(), loadAllAttributions(), loadAllSuivis(), loadAllSuiviConfigs(), loadAllIndispos()]);
  if(S.homeTab!=='journee' || !document.getElementById('hometabcontent')) return;
  for(const cfg of allConfigs){ if(S.clients.some(c=>c.id===cfg.id)) await syncSuiviDocs(cfg.id, cfg, allProg.filter(p=>p.clientId===cfg.id), allSuivis); }
  const today = todayStr();
  const bilanMap={}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const clOf = id => S.clients.find(c=>c.id===id);
  const needAttr = {}; allAttrs.filter(attrNeedsValidation).forEach(a=>{ needAttr[a.clientId]=a; });
  const todays = allProg.filter(p=>p.type==='avec' && p.date===today && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
  const nowMin = (()=>{ const d=new Date(); return d.getHours()*60+d.getMinutes(); })();
  const nextIdx = todays.findIndex(p=>p.statut==='prevue' && timeToMin(p.heure)+seanceDureeMin(p.formule) >= nowMin);
  const dow = new Date(today+'T00:00:00').getDay();
  const indToday = allIndispos.filter(i=>(i.type==='ponctuelle'&&i.date===today)||(i.type==='recurrente'&&Number(i.jourSemaine)===dow));

  // À faire
  const todo=[];
  allBilans.filter(b=>!b.valide).forEach(b=>{ const cl=clOf(b.id); if(cl) todo.push({dot:'blue', icon:'userplus', title:'Valider le bilan de '+cl.prenom, sub:'Inscription à vérifier', onclick:`selectClient('${b.id}','bilan')`}); });
  allRdv.filter(r=>r.statut==='attente').forEach(r=>{ const cl=clOf(r.clientId); todo.push({dot:'blue', icon:'phone', title:(cl?cl.prenom:'?')+' demande un premier rendez-vous', sub:(r.type==='reel'?'En personne':'Par téléphone')+(r.disponibilites?' · '+r.disponibilites:'')+(cl&&cl.telephone?' · '+cl.telephone:''), action:`<button class="btn btn-secondary btn-sm" onclick="traiterRdv('${r.id}')">Traité</button>`}); });
  allResil.filter(r=>r.statut==='attente').forEach(r=>{ const cl=clOf(r.clientId); todo.push({dot:'blue', icon:'pause', title:(cl?cl.prenom:'?')+(r.type==='pause'?' demande une pause':' veut résilier'), sub:'À rappeler'+(r.disponibilites?' : '+r.disponibilites:'')+(cl&&cl.telephone?' · '+cl.telephone:''), action:`<button class="btn btn-secondary btn-sm" onclick="traiterResiliation('${r.id}')">Traité</button>`}); });
  const demandes = allDemandes.filter(d=>d.statut==='attente').sort((a,b)=>a.date.localeCompare(b.date));
  allLogs.filter(l=>!l.vu).sort((a,b)=>b.date.localeCompare(a.date)).forEach(l=>{ const cl=clOf(l.clientId); todo.push({dot:'green', icon:'check', title:(cl?cl.prenom:'?')+' a fait « '+l.entrainementNom+' »', sub:fmtDayShort(l.date)+' · '+l.resultats.map(r=>r.nom.split(' ')[0]+' '+(typeof r.repsMin==='number'?r.repsMin:'ok')).join(' · ')+(l.resultats.some(r=>r.commentaire)?' · « '+l.resultats.filter(r=>r.commentaire).map(r=>r.commentaire).join(' / ')+' »':''), action:`<button class="btn btn-secondary btn-sm" onclick="marquerLogVu('${l.id}')">Vu</button>`}); });
  Object.values(needAttr).forEach(a=>{ const cl=clOf(a.clientId); if(cl) todo.push({dot:'orange', icon:'training', title:'Vérifier les charges de '+cl.prenom, sub:a.entrainements[a.currentEntrainementIndex].nom+' · prochain entraînement', onclick:`selectClient('${a.clientId}','entrainement')`}); });
  S.clients.forEach(c=>{
    const u=unpaidForClient(c.id, allProg, allSuivis);
    const all=[...u.retard, ...u.avenir];
    all.filter(i=>i.declare).forEach(i=>todo.push({dot:'green', icon:'euro', title:c.prenom+' dit avoir payé '+euro(i.montant), sub:i.label+(i.declareAt?' · envoyé le '+fmtDate(i.declareAt):''), action:`<button class="btn btn-secondary btn-sm" onclick="confirmPaiement('${i.type}','${i.id}')">Confirmer</button>`}));
    const rest=u.retard.filter(i=>!i.declare); const tot=rest.reduce((x,i)=>x+i.montant,0);
    if(tot>0) todo.push({dot:'orange', icon:'euro', title:euro(tot)+' à encaisser · '+c.prenom, sub:rest.map(i=>i.label).join(' + '), onclick:`selectClient('${c.id}','suivi')`});
  });

  const curKey = monthKey(today); const st = statsForMonth(curKey, allProg, allSuivis);
  const upcoming = allProg.filter(p=>p.type==='avec' && p.statut==='prevue' && p.date>=today).length;
  const d = new Date();
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${DAYLONG[d.getDay()]} ${d.getDate()} ${MONTHNAMES[d.getMonth()].toLowerCase()}</span><h1>Ma journée</h1></div><span class="avatar" aria-hidden="true">A</span></div>
    <section class="section">
      <div class="section-head"><h2>${ico('journee','orange','sm')}${todays.length? (todays.length+' séance'+(todays.length>1?'s':'')+' aujourd\u2019hui') : 'Aucune séance aujourd\u2019hui'}</h2><button class="link" onclick="switchHomeTab('planning')">Planning</button></div>
      ${todays.map((p,i)=>seanceRowHtml(p, clOf(p.clientId), {now:i===nextIdx, tile:i===nextIdx?'orange':'', needsValidation:!!(p.attributionId && needAttr[p.clientId]), lieu:(bilanMap[p.clientId]||{}).adresseCoaching})).join('')}
      ${indToday.map(i=>`<div class="row-muted"><span class="t">${i.heureDebut}</span><span>${i.motif||'Indisponible'} jusqu\u2019à ${i.heureFin}</span></div>`).join('')}
    </section>
    ${demandes.length? `<section class="section"><div class="section-head"><h2>${ico('bell','blue','sm')}Demandes de séance</h2></div>${demandes.map(dm=>demandeRowHtml(dm, clOf(dm.clientId))).join('')}</section>`:''}
    <section class="section">
      <div class="section-head"><h2>${ico('flag','orange','sm')}À faire</h2></div>
      ${todo.length? `<div class="list">${todo.map((t,i)=>`<div class="item ${t.onclick?'':'static'} ${i>=4&&!S.todoAll?'hid':''}" ${t.onclick?`onclick="${t.onclick}"`:''}>${ico(t.icon||'bell', t.dot)}<span class="body"><span class="title">${t.title}</span><span class="sub">${t.sub}</span></span>${t.action?`<span class="side">${t.action}</span>`:ICONS.chev}</div>`).join('')}${todo.length>4&&!S.todoAll?`<button class="item morebtn" onclick="S.todoAll=true;renderJournee()">${todo.length-4===1?'Voir le dernier':'Voir les '+(todo.length-4)+' autres'}</button>`:''}</div>` : '<div class="card"><div class="empty">Rien à traiter. Belle journée.</div></div>'}
    </section>
    <section class="section" style="display:flex;justify-content:space-between;align-items:center;padding:0 2px">
      <span class="note">${monthLabel(curKey)} : <b style="color:var(--text)">${euro(st.total)}</b> encaissés · ${upcoming} séance${upcoming>1?'s':''} à venir</span>
      <button class="link" onclick="switchHomeTab('compta')">Compta</button>
    </section>`;
}

// ---- COMPTA (ancien tableau de bord) ----
async function renderCompta(){
  await loadPaiementSettings();
  const main=document.getElementById('hometabcontent');
  main.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allSuivis, allEvo, allConfigs] = await Promise.all([
    loadAllProgrammes(), loadAllSuivis(), loadAllEvolutions(), loadAllSuiviConfigs()
  ]);

  // périodes de suivi à jour pour tous les clients (sinon des impayés manquent)
  for(const cfg of allConfigs){
    if(S.clients.some(c=>c.id===cfg.id)) await syncSuiviDocs(cfg.id, cfg, allProg.filter(p=>p.clientId===cfg.id), allSuivis);
  }

  // unpaid across all clients, split retard/à venir
  let retardRows=[], avenirRows=[];
  S.clients.forEach(c=>{
    const items = unpaidForClient(c.id, allProg, allSuivis);
    items.retard.forEach(it=>retardRows.push({...it, clientName:clientName(c)}));
    items.avenir.forEach(it=>avenirRows.push({...it, clientName:clientName(c)}));
  });

  // monthly recap
  const currentKey = monthKey(todayStr());
  const curStats = statsForMonth(currentKey, allProg, allSuivis);
  const curSuivisEnCours = suivisEnCoursCount(currentKey, allConfigs);
  const historyKeys = allActivityMonths(allProg, allSuivis).filter(k=>k!==currentKey);

  const main2 = document.getElementById('hometabcontent');
  main2.innerHTML = `
    <div class="card">
      <h2>Paiements en retard</h2>
      ${retardRows.length ? retardRows.map(u=>`<div class="seance-row"><span>${u.clientName} · ${u.label}</span><span>${euro(u.montant)}</span><button class="btn btn-secondary btn-sm" onclick="selectClient('${u.clientId}')">Voir</button></div>`).join('') : '<div class="badge ok">Aucun paiement en retard</div>'}
    </div>
    <div class="card">
      <h2>Paiements à venir</h2>
      ${avenirRows.length ? avenirRows.map(u=>`<div class="seance-row"><span>${u.clientName} · ${u.label}</span><span>${euro(u.montant)}</span><button class="btn btn-secondary btn-sm" onclick="selectClient('${u.clientId}')">Voir</button></div>`).join('') : '<div class="empty">Aucun paiement à venir</div>'}
    </div>

    <div class="card">
      <h2>Activité de ${monthLabel(currentKey).toLowerCase()}</h2>
      <div class="grid">
        <div class="stat"><div class="n">${curStats.prevues}</div><div class="l">Séances prévues</div></div>
        <div class="stat"><div class="n">${curStats.realisees}</div><div class="l">Séances réalisées</div></div>
        <div class="stat"><div class="n">${curStats.offertes}</div><div class="l">Séances offertes</div></div>
        <div class="stat"><div class="n">${curSuivisEnCours}</div><div class="l">Suivis en cours</div></div>
        <div class="stat"><div class="n">${euro(curStats.expressReg)}</div><div class="l">Coaching Express réglé</div></div>
        <div class="stat"><div class="n">${euro(curStats.classiqueReg)}</div><div class="l">Coaching Classique réglé</div></div>
        <div class="stat"><div class="n">${euro(curStats.suiviReg)}</div><div class="l">Suivi réglé</div></div>
        <div class="stat"><div class="n">${euro(curStats.total)}</div><div class="l">Total compta</div></div>
      </div>
    </div>

    <div class="card">
      <h2>Moyens de paiement</h2>
      <p class="note">${(S.paiement&&S.paiement.paypalMe) ? 'PayPal.Me : '+esc(S.paiement.paypalMe)+(S.paiement.lydia?' · Lydia : '+esc(S.paiement.lydia):'') : 'Aucun moyen de paiement configuré : les clients voient seulement « J’ai payé ».'} Aucune coordonnée bancaire n’est stockée.</p>
      <button class="btn btn-secondary btn-sm" onclick="openPaiementSettings()">Modifier</button>
    </div>
    ${backupCardHtml()}
    <div class="card">
      <h2>Mois précédents</h2>
      ${historyKeys.length? historyKeys.map(k=>{
        const st=statsForMonth(k, allProg, allSuivis);
        return `<div class="seance-row" style="flex-direction:column;align-items:stretch">
          <b>${monthLabel(k)}</b>
          <div class="grid">
            <div class="stat"><div class="n">${st.realisees}</div><div class="l">Séances réalisées</div></div>
            <div class="stat"><div class="n">${st.offertes}</div><div class="l">Séances offertes</div></div>
            <div class="stat"><div class="n">${euro(st.expressReg)}</div><div class="l">Express réglé</div></div>
            <div class="stat"><div class="n">${euro(st.classiqueReg)}</div><div class="l">Classique réglé</div></div>
            <div class="stat"><div class="n">${euro(st.suiviReg)}</div><div class="l">Suivi réglé</div></div>
            <div class="stat"><div class="n">${euro(st.total)}</div><div class="l">Total compta</div></div>
          </div>
        </div>`;
      }).join('') : '<div class="empty">Aucun mois précédent</div>'}
    </div>
  `;
}
const ALL_COLLECTIONS = ['settings','clients','bilans','evolutions','programmes','suivi_config','suivis','indisponibilites','demandes','demandes_rdv','demandes_resiliation','mouvements_bib','cycles_bib','attributions','entrainement_logs','produits_bib','journal_alimentaire','recettes','challenges','challenge_participations','niveaux_config','lecons','lecons_vues'];
async function exportBackup(){
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
  if(!data || !data.collections){ toast('Ce fichier n\u2019est pas une sauvegarde Coach Alex'); return; }
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
function changeHomeWeek(delta){ S.weekOffset+=delta; S.planDay=null; renderPlanningTab(); }
function selectPlanDay(ds){ S.planDay=ds; renderPlanningTab(); }
function renderDietTool(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = `
    <div class="card">
      <p class="note" style="margin-bottom:4px">Outil libre, sans lien avec un client. Formule de Mifflin-St Jeor.</p>
      <label>Genre</label>${segSelect('dt-genre', [['homme','Homme'],['femme','Femme']], 'homme')}
      <div class="formrow">
        <div><label for="dt-age">Âge</label>${unitInput('dt-age','ans','')}</div>
        <div><label for="dt-poids">Poids</label>${unitInput('dt-poids','kg','',{decimal:true})}</div>
        <div><label for="dt-taille">Taille</label>${unitInput('dt-taille','cm','')}</div>
      </div>
      <label>Niveau d\u2019activité</label>${segSelect('dt-niveau', NIVEAU_OPTIONS, 'sedentaire')}
      <p class="note" style="margin-top:6px">${NIVEAU_HELP}</p>
      <div class="modalbtns"><button class="btn btn-primary" onclick="runDietTool()">Calculer</button></div>
      <div id="dt-result" style="margin-top:16px"></div>
    </div>
  `;
}
function runDietTool(){
  const d = calcDiet({genre:val('dt-genre'), age:val('dt-age'), poids:val('dt-poids'), taille:val('dt-taille'), niveau:val('dt-niveau')});
  document.getElementById('dt-result').innerHTML = dietResultHtml(d);
}

// ---- CLIENTS ----
async function renderClientsTab(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allBilans, allProg, allSuivis, allConfigs, allEvo] = await Promise.all([loadAllBilans(), loadAllProgrammes(), loadAllSuivis(), loadAllSuiviConfigs(), loadAllEvolutions()]);
  if(S.homeTab!=='clients' || !document.getElementById('hometabcontent')) return;
  const bilanMap={}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const today=todayStr();
  const q = (S.clientsSearch||'').toLowerCase();
  const activeIds = new Set(allConfigs.filter(cfg=>(cfg.segments||[]).some(sg=>!sg.end)).map(cfg=>cfg.id));
  const list = S.clients.filter(c=>{
    if(q && !clientName(c).toLowerCase().includes(q)) return false;
    if(S.clientsFilter==='avalider') return bilanMap[c.id] && bilanMap[c.id].valide===false;
    if(S.clientsFilter==='suivi') return activeIds.has(c.id);
    return true;
  });
  const nbAV = S.clients.filter(c=>bilanMap[c.id] && bilanMap[c.id].valide===false).length;
  el.innerHTML = `
    <div class="page-head"><h1>Clients</h1><div class="actions"><button class="btn btn-primary btn-sm" onclick="openNewClientModal()">Nouveau client</button></div></div>
    <label style="margin:0 0 10px"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Rechercher un client</span><input type="search" id="cl-search" placeholder="Rechercher" value="${S.clientsSearch||''}" oninput="S.clientsSearch=this.value;renderClientsList()" style="margin:0"></label>
    <div class="chips">
      <button class="chip ${S.clientsFilter==='all'?'active':''}" onclick="S.clientsFilter='all';renderClientsTab()">Tous · ${S.clients.length}</button>
      <button class="chip ${S.clientsFilter==='avalider'?'active':''}" onclick="S.clientsFilter='avalider';renderClientsTab()">À valider · ${nbAV}</button>
      <button class="chip ${S.clientsFilter==='suivi'?'active':''}" onclick="S.clientsFilter='suivi';renderClientsTab()">Suivi actif · ${activeIds.size}</button>
    </div>
    <div id="clients-list"></div>
    <section class="section">
      <div class="section-head"><h2>Inscrire un nouveau client</h2></div>
      <div class="card">
        <p class="note">Vous remplissez le bilan avec le client, ou vous lui tendez le téléphone : il répond seul au questionnaire et vous validez ensuite.</p>
        <div class="modalbtns" style="justify-content:stretch"><button class="btn btn-secondary" style="flex:1" onclick="openNewClientModal()">Je remplis</button><button class="btn btn-secondary" style="flex:1" onclick="showClientSpace();startClientQuestionnaire()">Le client remplit</button></div>
      </div>
    </section>`;
  S.clientsCtx = {bilanMap, allProg, allSuivis, allEvo, activeIds};
  renderClientsList();
}
function renderClientsList(){
  const box=document.getElementById('clients-list'); if(!box || !S.clientsCtx) return;
  const {bilanMap, allProg, allSuivis, allEvo, activeIds} = S.clientsCtx;
  const q=(S.clientsSearch||'').toLowerCase(); const today=todayStr();
  const list = S.clients.filter(c=>{
    if(q && !clientName(c).toLowerCase().includes(q)) return false;
    if(S.clientsFilter==='avalider') return bilanMap[c.id] && bilanMap[c.id].valide===false;
    if(S.clientsFilter==='suivi') return activeIds.has(c.id);
    return true;
  });
  box.innerHTML = list.length? `<div class="list">${list.map(c=>{
    const b=bilanMap[c.id]||{}; const pending=b.valide===false;
    const evos=allEvo.filter(e=>e.clientId===c.id && e.date<=today && parseFloat(e.poids)>0).sort((a,b2)=>b2.date.localeCompare(a.date));
    const poids = evos.length? parseFloat(evos[0].poids) : parseFloat(b.poids);
    const delta = (evos.length && parseFloat(b.poids)>0) ? (poids-parseFloat(b.poids)) : null;
    const next = allProg.filter(p=>p.clientId===c.id && p.type==='avec' && p.statut==='prevue' && p.date>=today).sort((a,b2)=>(a.date+a.heure).localeCompare(b2.date+b2.heure))[0];
    const due = unpaidForClient(c.id, allProg, allSuivis).retard.reduce((x,i)=>x+i.montant,0);
    const l2 = [c.objectif, poids>0? poids+' kg'+(delta!==null?' ('+(delta>0?'+':'')+delta.toFixed(1).replace('.',',')+')':'') : null].filter(Boolean).join(' · ');
    const l3 = next ? ('Prochaine séance '+(next.date===today?'aujourd\u2019hui':fmtDayShort(next.date))+' '+next.heure) : (pending?'Inscrit le '+fmtDate(c.dateCreation):'Aucune séance prévue');
    return `<div class="item" onclick="selectClient('${c.id}')"><span class="avatar ${pending?'blue':''}" aria-hidden="true">${initials(c)}</span>
      <span class="body"><span class="title" style="font-size:15px">${clientName(c)}</span>${l2?`<span class="sub" style="font-size:13px">${l2}</span>`:''}<span class="sub">${l3}</span></span>
      <span class="side">${pending?'<span class="badge plan">Bilan à valider</span>':(due>0?`<span class="badge warn">${euro(due)} dus</span>`:'')}</span></div>`;
  }).join('')}</div>` : '<div class="card"><div class="empty">Aucun client ne correspond.</div></div>';
}

// ---- PLUS ----
function renderPlusTab(){
  const el=document.getElementById('hometabcontent');
  const groups=[
    ['Préparer les entraînements', [['bibcycles','Cycles','Modèles à attribuer','cycle','orange'],['bibmouvements','Mouvements','Bibliothèque et fiches','training','orange']]],
    ['Pour les clients', [['lecons','Enseignements','Dossiers, leçons, vidéos','book','blue'],['aliments','Aliments et recettes','','food','green'],['challenges','Challenges','','trophy','blue'],['niveaux','Niveaux','Paliers et récompenses','flag','green']]],
    ['Gestion', [['compta','Compta','Paiements, mois, sauvegarde','euro','orange'],['diet','Calcul diététique','Outil libre','calc','green'],['site','Mon site','Page d\u2019accueil, contact','globe','blue'],['securite','Sécurité','Codes d\u2019accès','lock','blue'],['affichage','Affichage','Clair / sombre','sun','orange']]]
  ];
  el.innerHTML = `
    <div class="page-head"><h1>Plus</h1></div>
    ${LOCAL_MODE ? `<p class="note">Version hors ligne : données sur cet appareil uniquement (sauvegarde dans Compta).</p>` : ''}
    ${groups.map(([title,items])=>`<div class="section-head"><h2>${title}</h2></div><div class="tiles">${items.map(([k,t,sub,icn,tone])=>`<button class="tile-btn" onclick="switchHomeTab('${k}')">${ico(icn,tone)}<span class="t">${t}</span>${sub?`<span class="s">${sub}</span>`:''}</button>`).join('')}</div>`).join('')}
    <div class="menu" style="margin-top:6px"><div class="item" onclick="showLanding()"><span class="body"><span class="title">Voir le site public</span></span>${ICONS.chev}</div><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;
}
// ---- AFFICHAGE ----
function themeChoicesHtml(){
  const cur = applyTheme();
  return `<div class="chips">${[['auto','Automatique'],['light','Clair'],['dark','Sombre']].map(([k,l])=>`<button class="chip ${cur===k?'active':''}" onclick="setTheme('${k}')">${l}</button>`).join('')}</div><p class="note">« Automatique » suit le réglage de votre téléphone. Le site public reste toujours clair.</p>`;
}
function renderAffichage(){
  document.getElementById('hometabcontent').innerHTML = `<div class="card"><h2>Thème</h2>${themeChoicesHtml()}</div>`;
}

// ---- MON SITE / SÉCURITÉ ----
function renderSiteSettings(){
  const el=document.getElementById('hometabcontent'); const site=S.site||SITE_DEFAULTS;
  el.innerHTML = `
    <div class="card">
      <p class="note">Ces textes apparaissent sur la page d\u2019accueil publique. Les tarifs viennent de l\u2019application.</p>
      <label>Accroche</label><input id="st-accroche" value="${site.accroche}">
      <label>Sous-titre</label><textarea id="st-sousTitre" rows="2">${site.sousTitre}</textarea>
      <label>Zone</label><input id="st-zone" value="${site.zone}">
      <label>Spécialités (séparées par des virgules)</label><input id="st-specialites" value="${site.specialites||''}">
      <label>Pourquoi je suis coach (un paragraphe par ligne)</label><textarea id="st-bio" rows="6">${site.bio}</textarea>
      <div class="formrow"><div><label>Téléphone</label><input id="st-telephone" value="${site.telephone||''}"></div><div><label>Email</label><input id="st-email" value="${site.email||''}"></div></div>
      <label>Instagram (sans @)</label><input id="st-instagram" value="${site.instagram||''}">
      <label>Communes desservies (séparées par des virgules)</label><input id="st-communes" value="${site.communes||''}">
      <label>Questions fréquentes (une par ligne : question | réponse)</label><textarea id="st-faq" rows="8">${site.faq||''}</textarea>
      <div class="modalbtns"><button class="btn btn-secondary" onclick="showLanding()">Voir le site</button><button class="btn btn-primary" onclick="saveSiteSettings()">Enregistrer</button></div>
    </div>`;
}
async function saveSiteSettings(){
  const data = {accroche:val('st-accroche').trim(), sousTitre:val('st-sousTitre').trim(), zone:val('st-zone').trim(), bio:val('st-bio').trim(), specialites:val('st-specialites').trim(), communes:val('st-communes').trim(), faq:val('st-faq').trim(), telephone:val('st-telephone').trim(), email:val('st-email').trim(), instagram:val('st-instagram').trim().replace(/^@/,'')};
  for(const k of Object.keys(data)) if(!data[k] && SITE_DEFAULTS[k]) data[k]=SITE_DEFAULTS[k];
  await db.doc('settings/site').set(data);
  S.site = Object.assign({}, SITE_DEFAULTS, data);
  toast('Site mis à jour');
}
async function renderSecurite(){
  const el=document.getElementById('hometabcontent');
  const clients = S.clients;
  el.innerHTML = `
    ${FIREBASE_MODE ? `<div class="card">
      <h2>Compte coach</h2>
      <p class="note">Connecté avec ${esc((FB.user&&FB.user.email)||'')}. Les données sont protégées côté serveur : seul ce compte peut tout lire et modifier, chaque client ne voit que son propre espace.</p>
      <button class="btn btn-secondary" onclick="fbCoachResetPassword()">Changer mon mot de passe</button>
    </div>` : `<div class="card">
      <h2>Code coach</h2>
      <p class="note">Demandé pour ouvrir l\u2019espace coach. Il protège l\u2019écran de votre téléphone, pas les données elles-mêmes.</p>
      <button class="btn btn-secondary" onclick="openChangeCoachCode()">Changer le code</button>
    </div>`}
    <div class="card">
      <h2>Codes clients</h2>
      <p class="note">${FIREBASE_MODE ? 'Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Avec ce code, il crée son compte (e-mail et mot de passe) depuis la page d\u2019accueil et accède à son espace de chez lui. Vous le retrouvez dans sa fiche (bouton Actions).' : 'Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Vous le retrouvez dans sa fiche (bouton Actions) pour le lui transmettre ou le changer.'}</p>
      ${clients.length? `<div class="list" style="margin:0">${clients.map(c=>`<div class="item" onclick="selectClient('${c.id}')"><span class="body"><span class="title">${clientName(c)}</span><span class="sub">${c.accessCode? 'Code : '+fmtCode(c.accessCode) : 'Pas encore de code'}</span></span>${ICONS.chev}</div>`).join('')}</div>` : '<div class="empty">Aucun client</div>'}
    </div>`;
}

// ---- NEW CLIENT MODAL ----
function openNewClientModal(){
  S.wizardStep = 0; S.wizardData = {}; S.wizardMode = 'coach';
  renderWizardStep();
}
function startClientQuestionnaire(){
  S.wizardStep = 0; S.wizardData = {}; S.wizardMode = 'client';
  if(!document.getElementById('main') || S.view!=='client'){ S.view='client'; document.getElementById('app').innerHTML = `<div class="shell"><main class="main client-space" id="main" style="max-width:680px;margin:0 auto"></main></div>`; }
  renderWizardStep();
}
function wizardTotalSteps(){ return QSECTIONS_ORDER.length+1+(S.wizardMode==='client'?1:0); }
function renderWizardStep(){
  const totalSteps = wizardTotalSteps();
  const isIdentity = S.wizardStep===0;
  const isRdvStep = S.wizardMode==='client' && S.wizardStep===totalSteps-1;
  const sectionTitle = isIdentity ? 'Identité' : (isRdvStep ? 'Premier rendez-vous' : QSECTIONS_ORDER[S.wizardStep-1]);
  let fieldsHtml;
  if(isIdentity){
    fieldsHtml = `
      <div class="formrow"><div><label for="q-prenom">Prénom</label><input id="q-prenom" autocomplete="given-name" value="${S.wizardData.prenom||''}"></div><div><label for="q-nom">Nom</label><input id="q-nom" autocomplete="family-name" value="${S.wizardData.nom||''}"></div></div>
      <label for="q-email">Email</label><input type="email" inputmode="email" autocomplete="email" id="q-email" value="${S.wizardData.email||''}">
      <label for="q-telephone">Téléphone</label><input type="tel" inputmode="tel" autocomplete="tel" id="q-telephone" value="${S.wizardData.telephone||''}">
      <label for="q-objectif">Votre objectif</label><input id="q-objectif" placeholder="Perte de poids, prise de masse, recomposition, remise en forme…" value="${S.wizardData.objectif||''}">
    `;
  } else if(isRdvStep){
    fieldsHtml = `
      <label>Type de premier rendez-vous souhaité</label>
      <select id="q-rdvType">
        <option value="reel" ${S.wizardData.rdvType==='reel'?'selected':''}>En personne</option>
        <option value="telephonique" ${S.wizardData.rdvType==='telephonique'?'selected':''}>Téléphonique</option>
      </select>
      <label>Vos disponibilités</label><textarea id="q-rdvDispo" rows="2">${S.wizardData.rdvDispo||''}</textarea>
    `;
  } else {
    fieldsHtml = sectionFieldsHtml(sectionTitle, S.wizardData);
  }
  const isLast = S.wizardStep===totalSteps-1;
  const cancelBtn = S.wizardStep>0 ? '<button class="btn btn-secondary" onclick="wizardPrev()">Précédent</button>'
    : (S.wizardMode==='coach' ? '<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>' : '<button class="btn btn-secondary" onclick="showLanding()">Annuler</button>');
  const intro = {
    'Identité':'Pour vous joindre et vous envoyer vos documents.',
    'Profil général':'Les bases pour calculer vos besoins.',
    'Activité professionnelle':'Votre travail compte dans la fatigue et les besoins.',
    'Santé':'Répondez simplement ; rien n\u2019est partagé.',
    'Passé et contexte émotionnel':'Ce qui a déjà été tenté, et où vous en êtes.',
    'Sport et activité physique':'Votre pratique actuelle et le temps disponible.',
    'Mode de vie / habitudes':'Sommeil, repas, budget, entourage.',
    'Premier rendez-vous':'Comment et quand vous rencontrer.'
  }[sectionTitle]||'';
  const pct = Math.round(100*(S.wizardStep)/totalSteps);
  const body = `
    <div class="wiz-head">
      <span class="note">Étape ${S.wizardStep+1} sur ${totalSteps}</span>
      <span class="bar"><span style="width:${pct}%"></span></span>
      <h3 style="margin:10px 0 2px">${sectionTitle}</h3>
      ${intro?`<p class="note">${intro}</p>`:''}
    </div>
    <div class="wiz-fields">${fieldsHtml}</div>
    <div class="modalbtns">
      ${cancelBtn}
      <button class="btn btn-primary" onclick="wizardNext()">${isLast?(S.wizardMode==='coach'?'Créer le client':'Envoyer mon bilan'):'Continuer'}</button>
    </div>
  `;
  if(S.wizardMode==='coach') openModal(body);
  else document.getElementById('main').innerHTML = `<div class="card wiz" style="margin-top:38px">${body}</div>`;
  const first = document.querySelector('.wiz-fields input:not([type=hidden]), .wiz-fields select, .wiz-fields textarea'); if(first && S.wizardStep===0) setTimeout(()=>{ try{ first.focus(); }catch(e){} },60);
}
// Champs d'une section, avec les paires courtes sur deux colonnes
function sectionFieldsHtml(section, data, exclude){
  const fields = QFIELDS.filter(f=>f.section===section && !(exclude||[]).includes(f.key));
  const pairs = {taille:'poids', tourTaille:'tourHanches', tourCuisse:'tourBras'};
  const out=[]; const done=new Set();
  for(const f of fields){
    if(done.has(f.key)) continue;
    const partner = pairs[f.key] ? fields.find(x=>x.key===pairs[f.key]) : null;
    if(partner){ out.push(`<div class="formrow"><div>${qFieldHtml(f, data[f.key])}</div><div>${qFieldHtml(partner, data[partner.key])}</div></div>`); done.add(partner.key); }
    else out.push(qFieldHtml(f, data[f.key]));
    done.add(f.key);
  }
  return out.join('');
}
function wizardCaptureStep(){
  const totalSteps = wizardTotalSteps();
  const isIdentity = S.wizardStep===0;
  const isRdvStep = S.wizardMode==='client' && S.wizardStep===totalSteps-1;
  if(isIdentity){
    S.wizardData.prenom = val('q-prenom'); S.wizardData.nom = val('q-nom'); S.wizardData.email = val('q-email'); S.wizardData.telephone = val('q-telephone'); S.wizardData.objectif = val('q-objectif');
  } else if(isRdvStep){
    S.wizardData.rdvType = val('q-rdvType'); S.wizardData.rdvDispo = val('q-rdvDispo');
  } else {
    const sectionTitle = QSECTIONS_ORDER[S.wizardStep-1];
    QFIELDS.filter(f=>f.section===sectionTitle).forEach(f=>{ const v=qVal(f.key); if(v!==undefined) S.wizardData[f.key] = v; });
  }
}
function wizardPrev(){ wizardCaptureStep(); S.wizardStep--; renderWizardStep(); }
async function wizardNext(){
  wizardCaptureStep();
  if(S.wizardStep===0 && (!(S.wizardData.prenom||'').trim() || !(S.wizardData.nom||'').trim())){ toast('Prénom et nom requis'); return; }
  const totalSteps = wizardTotalSteps();
  if(S.wizardStep < totalSteps-1){ S.wizardStep++; renderWizardStep(); return; }
  const d = S.wizardData;
  if(!d.prenom || !d.nom){ toast('Prénom et nom requis'); S.wizardStep=0; renderWizardStep(); return; }
  const ref = await db.collection('clients').add({prenom:d.prenom.trim(), nom:d.nom.trim(), email:(d.email||'').trim(), telephone:(d.telephone||'').trim(), objectif:(d.objectif||'').trim(), dateCreation:todayStr()});
  const diet = calcDiet({poids:d.poids, taille:d.taille, age:ageFromBirthdate(d.dateNaissance), genre:d.genre, niveau:d.niveauActivite});
  const bilan = {date:todayStr(), maj:todayStr(), notes:'', valide: S.wizardMode==='coach',
    mesures:{tourTaille:d.tourTaille, tourHanches:d.tourHanches, tourCuisse:d.tourCuisse, tourBras:d.tourBras},
    ...(diet||{})
  };
  QFIELDS.forEach(f=>{ if(!['tourTaille','tourHanches','tourCuisse','tourBras'].includes(f.key)) bilan[f.key]=d[f.key]; });
  await db.doc('bilans/'+ref.id).set(bilan);
  if(S.wizardMode==='coach'){
    closeModal();
    await ensureClientCode(ref.id);
    await loadClients();
    selectClient(ref.id, 'bilan');
  } else {
    await db.collection('demandes_rdv').add({clientId:ref.id, type:d.rdvType||'reel', disponibilites:d.rdvDispo||'', statut:'attente', createdAt:todayStr()});
    document.getElementById('main').innerHTML = `
      <div class="card" style="text-align:center">
        <h2>Merci !</h2>
        <p>Votre dossier a bien été transmis à votre coach. Il vous contactera pour le premier rendez-vous et vous remettra votre code d\u2019accès à l\u2019espace client.</p>
        <button class="btn btn-primary" onclick="showLanding()">Retour à l\u2019accueil</button>
      </div>
    `;
  }
}

function confirmDeleteClient(){
  const c = S.clients.find(x=>x.id===S.currentId);
  openModal(`
    <h3>Supprimer ${clientName(c)} ?</h3>
    <p>Cette action supprimera définitivement toutes les données associées :</p>
    <ul><li>Bilan initial et évolutions</li><li>Séances, suivi mensuel et paiements associés</li><li>Cycle attribué et historique d\u2019entraînement</li><li>Journal alimentaire</li><li>Demandes en attente, challenges et leçons vues</li></ul>
    <div class="modalbtns">
      <button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
      <button class="btn btn-danger" onclick="deleteClient()">Supprimer définitivement</button>
    </div>
  `);
}
async function deleteClient(){
  const id=S.currentId;
  const cols=['evolutions','programmes','suivis','attributions','entrainement_logs','journal_alimentaire','demandes','demandes_rdv','demandes_resiliation','challenge_participations','lecons_vues'];
  const snaps = await Promise.all(cols.map(c=>db.collection(c).where('clientId','==',id).get()));
  const dels=[];
  snaps.forEach((snap,i)=>snap.docs.forEach(d=>dels.push(db.doc(cols[i]+'/'+d.id).delete())));
  await Promise.all([...dels, db.doc('bilans/'+id).delete(), db.doc('suivi_config/'+id).delete()]);
  if(FIREBASE_MODE){
    const c = S.clients.find(x=>x.id===id);
    if(c && c.accessCode){ try{ await db.doc('codes/'+c.accessCode).delete(); }catch(e){} }
    try{ const us = await db.collection('users').where('clientId','==',id).get(); await Promise.all(us.docs.map(d=>db.doc('users/'+d.id).delete())); }catch(e){}
  }
  await db.doc('clients/'+id).delete();
  closeModal(); toast('Client supprimé');
  S.currentId=null; S.homeTab='clients'; await loadClients(); render();
}

// ---- CLIENT PAGE ----
function renderClientPage(c){
  const main=document.getElementById('main');
  const tabs=[['suivi','Suivi'],['entrainement','Entraînement'],['planningAlim','Alimentation'],['seance','Séances'],['bilan','Bilan']];
  const b=S.bilan||{};
  const age = b.dateNaissance ? ageFromBirthdate(b.dateNaissance)+' ans' : null;
  const since = c.dateCreation ? 'client depuis '+fmtMonthYear(c.dateCreation).toLowerCase() : null;
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin:38px 0 10px" class="clienthead-top"><a class="backlink" style="margin:0" onclick="switchHomeTab('clients')">${ICONS.back}Clients</a><button class="btn btn-secondary btn-sm" onclick="openClientActions()">Actions</button></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <span class="avatar lg ${b.valide===false?'blue':''}" aria-hidden="true">${initials(c)}</span>
      <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h1 style="margin:0;font-size:24px">${clientName(c)}</h1><span class="note">${[age, c.objectif, since].filter(Boolean).join(' · ')}</span></div>
    </div>
    ${b.valide===false?`<div class="badge plan" style="display:block;margin-bottom:12px;padding:10px"><span>Ce client s\u2019est inscrit lui-même : vérifiez son bilan puis validez-le pour lui ouvrir l\u2019espace client.</span><button class="btn btn-primary btn-sm" onclick="validateBilan()">Valider le bilan</button></div>`:''}
    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t[0]?'active':''}" data-tab="${t[0]}" onclick="switchTab('${t[0]}')">${t[1]}</div>`).join('')}</div>
    <div id="tabcontent"></div>
  `;
  renderTab();
}
function openClientActions(){
  const c = S.clients.find(x=>x.id===S.currentId);
  openModal(`<h3>${clientName(c)}</h3>
    <div class="menu" style="margin:0">
      ${c.telephone?`<div class="item static"><span class="body"><span class="title">${c.telephone}</span><span class="sub">Téléphone</span></span></div>`:''}
      ${c.email?`<div class="item static"><span class="body"><span class="title">${c.email}</span><span class="sub">Email</span></span></div>`:''}
      <div class="item" onclick="closeModal();switchTab('seance')"><span class="body"><span class="title">Planifier une séance</span></span>${ICONS.chev}</div>
      <div class="item" onclick="closeModal();openEvoModal()"><span class="body"><span class="title">Nouvelle pesée</span></span>${ICONS.chev}</div>
      <div class="item static"><span class="body"><span class="title">${c.accessCode? 'Code d\u2019accès : '+fmtCode(c.accessCode) : 'Pas encore de code d\u2019accès'}</span><span class="sub">${c.accessCode? 'À transmettre au client pour son espace' : (S.bilan&&S.bilan.valide===false ? 'Généré à la validation du bilan' : 'Générez-en un')}</span></span><span class="side"><button class="btn btn-secondary btn-sm" onclick="regenerateClientCode('${c.id}')">${c.accessCode?'Changer':'Générer'}</button></span></div>
    </div>
    <div class="modalbtns"><button class="btn btn-danger" onclick="closeModal();confirmDeleteClient()">Supprimer le client</button><button class="btn btn-secondary" onclick="closeModal()">Fermer</button></div>`);
}
function switchTab(t){
  S.tab=t;
  document.querySelectorAll('#main .tabs .tab').forEach(el=>{ el.classList.toggle('active', el.dataset.tab===t); });
  renderTab();
}
async function renderTab(){
  const c = S.clients.find(x=>x.id===S.currentId);
  const el = document.getElementById('tabcontent');
  if(!el || !c) return;
  const tab = S.tab;
  try{
    if(tab==='bilan') return renderBilan(el,c);
    if(tab==='seance') return await renderSeance(el,c);
    if(tab==='entrainement') return await renderEntrainement(el,c);
    if(tab==='planningAlim') return await renderPlanningAlimentaire(el,c);
    return await renderClientSuivi(el,c);
  }catch(e){
    console.error('renderTab', tab, e);
    if(S.tab===tab && document.getElementById('tabcontent')) el.innerHTML = `<div class="card"><h2>Cet onglet n\u2019a pas pu s\u2019afficher</h2><p class="note">${esc(String(e && e.message || e))}</p><button class="btn btn-secondary btn-sm" onclick="renderTab()">Réessayer</button></div>`;
  }
}
function weightSummary(){
  const bilan=S.bilan||{}; const today=todayStr();
  const past = (S.evolutions||[]).filter(e=>e.date<=today && parseFloat(e.poids)>0).sort((a,b)=>b.date.localeCompare(a.date));
  const start = parseFloat(bilan.poids)||null;
  const current = past.length? parseFloat(past[0].poids) : start;
  const currentDate = past.length? past[0].date : bilan.date;
  const points=[]; if(start) points.push({date:bilan.date, poids:start});
  (S.evolutions||[]).forEach(ev=>{ if(parseFloat(ev.poids)>0) points.push({date:ev.date, poids:parseFloat(ev.poids)}); });
  points.sort((a,b)=>a.date.localeCompare(b.date));
  return {start, current, currentDate, delta:(start&&current)?current-start:null, points, latest:past[0]||null, future:(S.evolutions||[]).filter(e=>e.date>today)};
}
async function renderClientSuivi(el,c){
  await ensurePeriodDocs(c.id);
  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);
  const w = weightSummary();
  const bilan=S.bilan||{};
  const d = currentDietSource();
  const typePlan = bilan.typePlan;
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcal = kcalField ? (parseFloat(d[kcalField])||0) : null;
  const mes = w.latest ? w.latest.mesures : bilan.mesures;
  const mesTxt = [];
  if(bilan.mesures && mes){ if(bilan.mesures.tourTaille && mes.tourTaille) mesTxt.push('taille '+bilan.mesures.tourTaille+' → '+mes.tourTaille+' cm'); if(bilan.mesures.tourHanches && mes.tourHanches) mesTxt.push('hanches '+bilan.mesures.tourHanches+' → '+mes.tourHanches+' cm'); }
  const fmtKg = n => (n%1===0? String(n) : n.toFixed(1).replace('.',',')) ;
  el.innerHTML = `
    <div class="card">
      <h2>${ico('scale','orange','sm')}Poids et mesures <button class="btn btn-secondary btn-sm" onclick="openEvoModal()">Nouvelle pesée</button></h2>
      ${w.current? `<div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:10px">
        <div style="display:flex;flex-direction:column"><span style="font-size:30px;font-weight:800;letter-spacing:-0.02em;line-height:1">${fmtKg(w.current)} kg</span><span class="note" style="margin-top:4px">${w.currentDate===todayStr()?'aujourd\u2019hui':'le '+fmtDate(w.currentDate)}</span></div>
        ${w.delta!==null && w.points.length>1? `<div style="display:flex;flex-direction:column;padding-bottom:2px"><span style="font-size:15px;font-weight:700;color:${w.delta<0?'var(--green)':'var(--orange-dark)'}">${w.delta>0?'+':''}${fmtKg(w.delta)} kg</span><span class="note">depuis le bilan du ${fmtDate(bilan.date)}</span></div>`:''}
      </div>` : '<div class="empty">Aucun poids enregistré. Renseignez-le dans le Bilan.</div>'}
      ${w.points.length>1? svgWeightChart(w.points) : ''}
      ${mesTxt.length || w.future.length ? `<p class="note" style="margin-top:8px">${[...mesTxt, ...w.future.map(f=>'prochaine pesée le '+fmtDate(f.date))].join(' · ')}</p>`:''}
    </div>
    ${(unpaid.retard.length||unpaid.avenir.length)? `<div class="list">${[...unpaid.retard, ...unpaid.avenir].map(u=>`<div class="item static"><span class="body"><span class="title">${u.label}</span><span class="sub">${u.date>todayStr()?'À venir':'À encaisser'} · ${euro(u.montant)}</span></span><span class="side">${u.date>todayStr()?'':(u.type==='seance'?`<button class="btn btn-primary btn-sm" onclick="markSeancePaidById('${u.id}')">Encaisser</button>`:`<button class="btn btn-primary btn-sm" onclick="markSuiviPaid('${u.id}')">Encaisser</button>`)}</span></div>`).join('')}</div>` : '<div class="card"><span class="badge ok">Aucun paiement en attente</span></div>'}
    <div id="suivi-mensuel"></div>
    ${(S.evolutions||[]).length? `<details class="card fold"><summary>Toutes les pesées (${S.evolutions.length})</summary>${S.evolutions.map(e=>`<div class="seance-row"><span>${fmtDate(e.date)} ${e.date>todayStr()?'<span class="badge plan">Programmée</span>':''} ${e.poids?'· '+e.poids+' kg':''} ${e.mesures&&mesuresStr(e.mesures)!=='–'?'· '+mesuresStr(e.mesures):''} ${e.notes?'· '+e.notes:''}</span><span><button class="btn btn-secondary btn-sm" onclick="openEvoModal('${e.id}')">Modifier</button> <button class="btn btn-danger btn-sm" onclick="confirmDeleteEvo('${e.id}')">Supprimer</button></span></div>`).join('')}</details>`:''}
  `;
  renderSuivi(document.getElementById('suivi-mensuel'), c);
}
async function markSeancePaidById(id){ await markSeancePaid(id); }
async function confirmPaiement(type, id){
  if(type==='suivi') await db.doc('suivis/'+id).update({paiement:true, paiementDeclare:false});
  else await db.doc('programmes/'+id).update({paiement:true, paiementDeclare:false});
  toast('Paiement confirmé'); renderJournee();
}
// ---- PROFIL ----

function svgWeightChart(points){
  const w=600,h=150,pad=44;
  points = points.filter(p=>!isNaN(p.poids) && p.poids>0);
  if(!points.length) return '<div class="empty">Pas encore de pesée</div>';
  const weights=points.map(p=>p.poids);
  const min=Math.min(...weights)-1, max=Math.max(...weights)+1;
  const xstep=(w-2*pad)/Math.max(points.length-1,1);
  const y=v=>h-pad-((v-min)/(max-min||1))*(h-2*pad);
  const pts=points.map((p,i)=>[pad+i*xstep, y(p.poids)]);
  const path=pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return `<div class="card-x"><svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:600px">
    <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="var(--border)"/>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" stroke="var(--border)"/>
    <path d="${path}" fill="none" stroke="var(--orange)" stroke-width="3"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--orange)"/><text x="${p[0]}" y="${p[1]-10}" font-size="15" font-weight="600" text-anchor="middle" fill="var(--text)">${String(points[i].poids).replace('.',',')}</text>`).join('')}
    ${pts.map((p,i)=>i%Math.ceil(points.length/6||1)===0?`<text x="${p[0]}" y="${h-pad+18}" font-size="13" text-anchor="middle" fill="var(--muted)">${fmtDayShort(points[i].date)} ${MONTHNAMES[parseInt(points[i].date.slice(5,7),10)-1].slice(0,4).toLowerCase()}</text>`:'').join('')}
  </svg></div>`;
}

// ---- BILAN ----
function renderBilan(el,c){
  const b=S.bilan||{};
  const age = b.dateNaissance ? ageFromBirthdate(b.dateNaissance)+' ans' : '';
  const dl = (rows) => `<dl class="dl">${rows.filter(r=>r[1]).map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`;
  const m = b.mesures||{};
  const generalRows = [['Date du bilan', b.date?fmtDate(b.date):''], ['Genre', b.genre==='femme'?'Femme':(b.genre==='homme'?'Homme':'')], ['Naissance', b.dateNaissance? fmtDate(b.dateNaissance)+(age?' · '+age:'') : ''],
    ['Poids', b.poids? b.poids+' kg':''], ['Taille', b.taille? b.taille+' cm':''], ['Activité', ({sedentaire:'Sédentaire',leger:'Légèrement actif',actif:'Actif'})[b.niveauActivite]||''],
    ['Mesures', mesuresStr(m)!=='–'?mesuresStr(m):''], ['Objectif chiffré', b.estimationKilos||''], ['Adresse de coaching', b.adresseCoaching||''], ['Notes du coach', b.notes||'']];
  const sections = QSECTIONS_ORDER.filter(sec=>sec!=='Profil général').map(sec=>{
    const fields = QFIELDS.filter(f=>f.section===sec);
    const rows = fields.map(f=>[f.label.replace(/ \(1 à \d+\)/,''), qDisplay(f, b[f.key])]);
    const filled = rows.filter(r=>r[1]).length;
    return `<details class="card fold" ${filled?'':''}><summary><span>${sec}</span><span class="side"><span class="note">${filled}/${fields.length}</span><button class="btn btn-secondary btn-sm" onclick="event.preventDefault();openBilanSection('${sec}')">Modifier</button></span></summary>${filled? dl(rows) : '<div class="empty">Rien de renseigné pour l\u2019instant.</div>'}</details>`;
  }).join('');
  el.innerHTML = `
    <div class="card">
      <h2 style="flex-wrap:nowrap">${ico('user','blue','sm')}Bilan initial <button class="btn btn-secondary btn-sm" onclick="openBilanGeneral()">Modifier</button></h2>
      ${b.maj?`<p class="note" style="margin:-4px 0 10px">Mis à jour le ${fmtDate(b.maj)}</p>`:''}
      ${generalRows.some(r=>r[1]) ? dl(generalRows) : '<div class="empty">Aucun bilan enregistré.</div>'}
    </div>
    <div class="card">
      <h2>${ico('calc','green','sm')}Résultats caloriques <button class="btn btn-secondary btn-sm" onclick="openBilanCalories()">Modifier</button></h2>
      ${b.proteines ? dietResultHtml(b) : '<div class="empty">Pas encore calculés. Renseignez genre, naissance, poids, taille, puis « Modifier » › Recalculer.</div>'}
    </div>
    ${sections}`;
}
function openBilanGeneral(){
  const b=S.bilan||{};
  openModal(`<h3>Bilan initial</h3>
    <label>Genre</label>${segSelect('b-genre', [['homme','Homme'],['femme','Femme']], b.genre||'homme')}
    <div class="formrow"><div><label for="b-date">Date du bilan</label><input type="date" id="b-date" value="${b.date||todayStr()}"></div><div><label for="b-dateNaissance">Date de naissance</label><input type="date" id="b-dateNaissance" value="${b.dateNaissance||''}"></div></div>
    <div class="formrow"><div><label for="b-poids">Poids</label>${unitInput('b-poids','kg',b.poids,{decimal:true})}</div><div><label for="b-taille">Taille</label>${unitInput('b-taille','cm',b.taille)}</div></div>
    <label>Niveau d\u2019activité</label>${segSelect('b-niveauActivite', NIVEAU_OPTIONS, b.niveauActivite||'sedentaire')}
    <p class="note" style="margin-top:6px">${NIVEAU_HELP}</p>
    <label>Mesures (cm)</label>${mesuresFields('b', b.mesures)}
    <label for="b-estimationKilos">Objectif chiffré (ex. 5 kg à perdre)</label><input id="b-estimationKilos" value="${b.estimationKilos||''}">
    <label for="b-adresseCoaching">Adresse de coaching</label><input id="b-adresseCoaching" autocomplete="street-address" value="${b.adresseCoaching||''}">
    <label for="b-notes">Notes du coach</label><textarea id="b-notes" rows="3">${b.notes||''}</textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanGeneral()">Enregistrer</button></div>`);
}
async function saveBilan(){ return saveBilanGeneral(); }
async function saveBilanGeneral(){
  const b=S.bilan||{};
  const data = {...b, date:val('b-date'), genre:val('b-genre'), dateNaissance:val('b-dateNaissance'), poids:val('b-poids'), taille:val('b-taille'),
    niveauActivite:val('b-niveauActivite'), estimationKilos:val('b-estimationKilos'), adresseCoaching:val('b-adresseCoaching'), mesures:readMesuresFields('b'), notes:val('b-notes'), maj:todayStr(), valide: b.valide!==false, typePlan: b.typePlan||null};
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Bilan enregistré'); renderTab();
}
function openBilanCalories(){
  const b=S.bilan||{};
  openModal(`<h3>Résultats caloriques</h3>
    <p class="note">Calculés avec Mifflin-St Jeor depuis le bilan. Vous pouvez les ajuster à la main.</p>
    <div class="modalbtns" style="justify-content:flex-start;margin:0 0 6px"><button class="btn btn-secondary btn-sm" onclick="recalcBilan()">Recalculer depuis le bilan</button></div>
    <div class="formrow"><div><label>Protéines (g)</label><input type="number" id="b-proteines" value="${b.proteines||''}"></div><div><label>Lipides (g)</label><input type="number" id="b-lipides" value="${b.lipides||''}"></div></div>
    <div class="formrow"><div><label>Régime, avec entraînement</label><input type="number" id="b-regimeAvec" value="${b.regimeAvec||''}"></div><div><label>Régime, sans</label><input type="number" id="b-regimeSans" value="${b.regimeSans||''}"></div></div>
    <div class="formrow"><div><label>Maintien, avec entraînement</label><input type="number" id="b-maintienAvec" value="${b.maintienAvec||''}"></div><div><label>Maintien, sans</label><input type="number" id="b-maintienSans" value="${b.maintienSans||''}"></div></div>
    <label>Prise de masse, avec entraînement</label><input type="number" id="b-priseMasseAvec" value="${b.priseMasseAvec||''}">
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanCalories()">Enregistrer</button></div>`);
}
async function saveBilanCalories(){
  const b=S.bilan||{};
  const data = {...b, proteines:val('b-proteines'), lipides:val('b-lipides'), regimeAvec:val('b-regimeAvec'), regimeSans:val('b-regimeSans'), maintienAvec:val('b-maintienAvec'), maintienSans:val('b-maintienSans'), priseMasseAvec:val('b-priseMasseAvec'), maj:todayStr(), valide: b.valide!==false};
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Résultats enregistrés'); renderTab();
}
function openBilanSection(sec){
  const b=S.bilan||{};
  openModal(`<h3>${sec}</h3><div class="wiz-fields">${sectionFieldsHtml(sec, b)}</div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanSection('${sec}')">Enregistrer</button></div>`);
}
async function saveBilanSection(sec){
  const b=S.bilan||{}; const data={...b, maj:todayStr(), valide: b.valide!==false};
  QFIELDS.filter(f=>f.section===sec).forEach(f=>{ const v=qVal(f.key); if(v!==undefined) data[f.key]=v; });
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Enregistré'); renderTab();
}
function recalcBilan(){
  const b=S.bilan||{};
  const d = calcDiet({genre:b.genre, age:ageFromBirthdate(b.dateNaissance), poids:b.poids, taille:b.taille, niveau:b.niveauActivite});
  if(!d){ toast(DIET_MISSING_MSG); return; }
  for(const k of ['proteines','lipides','regimeAvec','regimeSans','maintienAvec','maintienSans','priseMasseAvec']){ const e=document.getElementById('b-'+k); if(e) e.value=d[k]; }
}
async function validateBilan(){
  await db.doc('bilans/'+S.currentId).update({valide:true});
  S.bilan = {...S.bilan, valide:true};
  const code = await ensureClientCode(S.currentId);
  const c = S.clients.find(x=>x.id===S.currentId); if(c) c.accessCode = code;
  openModal(`<h3>Bilan validé</h3><p>${c?clientName(c):'Le client'} peut maintenant ouvrir son espace avec ce code :</p>
    <div class="codeshow">${fmtCode(code)}</div>
    <p class="note">${FIREBASE_MODE ? 'Transmettez-le lui : avec ce code, il crée son compte depuis « Se connecter » sur le site. Vous le retrouverez dans sa fiche, bouton Actions.' : 'Transmettez-le lui (SMS, en main propre). Vous le retrouverez dans sa fiche, bouton Actions.'}</p>
    <div class="modalbtns"><button class="btn btn-primary" onclick="closeModal();render()">Fermer</button></div>`);
}
function val(id){ const el=document.getElementById(id); if(!el) return ''; let v=el.value; if(el.getAttribute('inputmode')==='decimal' || el.getAttribute('inputmode')==='numeric') v=v.replace(',','.').trim(); return esc(v); }
function mesuresStr(o){
  if(!o) return '–';
  const parts=[];
  if(o.tourTaille) parts.push('Taille: '+o.tourTaille+'cm');
  if(o.tourHanches) parts.push('Hanches: '+o.tourHanches+'cm');
  if(o.tourCuisse) parts.push('Cuisse: '+o.tourCuisse+'cm');
  if(o.tourBras) parts.push('Bras: '+o.tourBras+'cm');
  return parts.length? parts.join(' · ') : '–';
}
function mesuresFields(prefix,o){
  o=o||{};
  return `<div class="formrow">
    <div><label>Tour de taille</label>${unitInput(prefix+'-tourTaille','cm',o.tourTaille,{decimal:true})}</div>
    <div><label>Tour de hanches</label>${unitInput(prefix+'-tourHanches','cm',o.tourHanches,{decimal:true})}</div>
  </div>
  <div class="formrow">
    <div><label>Tour de cuisse</label>${unitInput(prefix+'-tourCuisse','cm',o.tourCuisse,{decimal:true})}</div>
    <div><label>Tour de bras</label>${unitInput(prefix+'-tourBras','cm',o.tourBras,{decimal:true})}</div>
  </div>`;
}
function readMesuresFields(prefix){
  return {
    tourTaille: val(prefix+'-tourTaille'), tourHanches: val(prefix+'-tourHanches'),
    tourCuisse: val(prefix+'-tourCuisse'), tourBras: val(prefix+'-tourBras')
  };
}

// ---- EVOLUTION ----

function openEvoModal(id){
  const e = id? S.evolutions.find(x=>x.id===id) : {};
  openModal(`
    <h3>${id?'Modifier':'Nouvelle'} évolution</h3>
    <label>Date</label><input type="date" id="e-date" value="${e.date||todayStr()}">
    <label for="e-poids">Poids</label>${unitInput('e-poids','kg',e.poids,{decimal:true})}
    <label>Mesures</label>
    ${mesuresFields('e',e.mesures)}
    <label>Notes</label><textarea id="e-notes" rows="2">${e.notes||''}</textarea>
    <h3 style="margin-top:18px">Résultats caloriques</h3>
    <button class="btn btn-secondary btn-sm" onclick="recalcEvo()">Recalculer (à partir du bilan + poids actuel)</button>
    <div class="formrow" style="margin-top:12px">
      <div><label>Protéines (g)</label><input type="number" id="e-proteines" value="${e.proteines||''}"></div>
      <div><label>Lipides (g)</label><input type="number" id="e-lipides" value="${e.lipides||''}"></div>
    </div>
    <div class="formrow">
      <div><label>Régime · avec entr.</label><input type="number" id="e-regimeAvec" value="${e.regimeAvec||''}"></div>
      <div><label>Régime · sans entr.</label><input type="number" id="e-regimeSans" value="${e.regimeSans||''}"></div>
    </div>
    <div class="formrow">
      <div><label>Maintien · avec entr.</label><input type="number" id="e-maintienAvec" value="${e.maintienAvec||''}"></div>
      <div><label>Maintien · sans entr.</label><input type="number" id="e-maintienSans" value="${e.maintienSans||''}"></div>
    </div>
    <label>Prise de masse · avec entr.</label><input type="number" id="e-priseMasseAvec" value="${e.priseMasseAvec||''}">
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveEvo('${id||''}')">Enregistrer</button></div>
  `);
}
function recalcEvo(){
  const b = S.bilan||{};
  const d = calcDiet({genre:b.genre, age:ageFromBirthdate(b.dateNaissance), taille:b.taille, niveau:b.niveauActivite, poids:val('e-poids')});
  if(!d){ toast('Calcul impossible : vérifiez le poids saisi ici, et la date de naissance et la taille dans le Bilan.'); return; }
  document.getElementById('e-proteines').value=d.proteines;
  document.getElementById('e-lipides').value=d.lipides;
  document.getElementById('e-regimeAvec').value=d.regimeAvec;
  document.getElementById('e-regimeSans').value=d.regimeSans;
  document.getElementById('e-maintienAvec').value=d.maintienAvec;
  document.getElementById('e-maintienSans').value=d.maintienSans;
  document.getElementById('e-priseMasseAvec').value=d.priseMasseAvec;
}
async function saveEvo(id){
  const data={clientId:S.currentId, date:val('e-date'), poids:val('e-poids'), mesures:readMesuresFields('e'), notes:val('e-notes'),
    proteines:val('e-proteines'), lipides:val('e-lipides'),
    regimeAvec:val('e-regimeAvec'), regimeSans:val('e-regimeSans'), maintienAvec:val('e-maintienAvec'), maintienSans:val('e-maintienSans'), priseMasseAvec:val('e-priseMasseAvec')};
  if(id){ await db.doc('evolutions/'+id).update(data); }
  else{ await db.collection('evolutions').add(data); }
  closeModal(); await loadClientData(S.currentId); renderTab(); toast('Enregistré avec succès');
}
function confirmDeleteEvo(id){
  openModal(`<h3>Supprimer cette évolution ?</h3><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="deleteEvo('${id}')">Supprimer</button></div>`);
}
async function deleteEvo(id){ await db.doc('evolutions/'+id).delete(); closeModal(); await loadClientData(S.currentId); renderTab(); }

// ---- ENTRAINEMENT (cycles, mouvements, surcharge progressive) ----
async function loadAllMouvementsBib(){
  const snap = await db.collection('mouvements_bib').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllCyclesBib(){
  const snap = await db.collection('cycles_bib').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function renderBibMouvementsTab(editId){
  const el = document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [bib, allLecons] = await Promise.all([loadAllMouvementsBib(), loadAllLecons()]);
  const ressources = flattenRessourcesList(allLecons);
  const editing = editId ? bib.find(m=>m.id===editId) : null;
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>Bibliothèque de mouvements</h2>
      <div class="formrow">
        <div><label>Nom</label><input id="bib-nom" placeholder="Développé couché" value="${editing?editing.nom:''}"></div>
        <div><label>Groupe musculaire</label><input id="bib-groupe" placeholder="Pectoraux" value="${editing?(editing.groupeMusculaire||''):''}"></div>
        <div><label>Type de travail</label><input id="bib-type" placeholder="Force, hypertrophie..." value="${editing?(editing.typeTravail||''):''}"></div>
      </div>
      <label>Leçon liée (optionnel)</label>
      <select id="bib-ressource">
        <option value="">-- Aucune --</option>
        ${ressources.map(r=>`<option value="${r.id}" ${editing&&editing.ressourceId===r.id?'selected':''}>${r.label}</option>`).join('')}
      </select>
      <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="addMouvementBibGlobal(${editing?`'${editing.id}'`:'null'})">${editing?'Enregistrer les modifications':'Ajouter'}</button>
      ${editing?`<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="renderBibMouvementsTab()">Annuler</button>`:''}
    </div>
    <div class="card">
      ${bib.length===0?`<button class="btn btn-secondary btn-sm" onclick="seedMouvementsBib()">Charger une liste de départ (24 mouvements classiques · à vérifier)</button>`:''}
      ${bib.some(m=>!m.ressourceId)?`<button class="btn btn-secondary btn-sm" style="margin-top:6px" onclick="seedMouvementsLecons()">Générer les fiches d'exécution (débutant) et les relier automatiquement</button>`:''}
      ${bib.length? bib.map(m=>`<div class="seance-row"><span>${m.nom} · ${m.groupeMusculaire||'–'}${m.typeTravail?' · '+m.typeTravail:''}${m.ressourceId?' <span class="tag">leçon liée</span>':''}</span><span><button class="btn btn-secondary btn-sm" onclick="renderBibMouvementsTab('${m.id}')">Modifier</button> <button class="btn btn-danger btn-sm" onclick="askDelete('deleteMouvementBib','${m.id}','Supprimer ce mouvement ?')">Supprimer</button></span></div>`).join('') : '<div class="empty">Bibliothèque vide</div>'}
    </div>
  `;
}
async function addMouvementBibGlobal(editId){
  const nom=val('bib-nom'), groupe=val('bib-groupe'), type=val('bib-type'), ressourceId=val('bib-ressource')||null;
  if(!nom){ toast('Nom requis'); return; }
  if(editId){
    await db.doc('mouvements_bib/'+editId).update({nom, groupeMusculaire:groupe, typeTravail:type, ressourceId});
    toast('Mouvement modifié');
  } else {
    await db.collection('mouvements_bib').add({nom, groupeMusculaire:groupe, typeTravail:type, ressourceId});
    toast('Ajouté à la bibliothèque');
  }
  renderBibMouvementsTab();
}
async function deleteMouvementBib(id){
  await db.doc('mouvements_bib/'+id).delete();
  renderBibMouvementsTab();
}
async function seedMouvementsBib(){
  const liste = [
    ['Développé couché','Pectoraux','Force'],['Développé incliné haltères','Pectoraux','Hypertrophie'],
    ['Squat','Quadriceps/Fessiers','Force'],['Presse à cuisses','Quadriceps','Hypertrophie'],
    ['Soulevé de terre','Chaîne postérieure','Force'],['Soulevé de terre roumain','Ischio-jambiers','Hypertrophie'],
    ['Tractions','Dos/Biceps','Force'],['Rowing barre','Dos','Hypertrophie'],['Tirage vertical','Dos','Hypertrophie'],
    ['Développé militaire','Épaules','Force'],['Élévations latérales','Épaules','Hypertrophie'],
    ['Curl biceps barre','Biceps','Hypertrophie'],['Extension triceps poulie','Triceps','Hypertrophie'],
    ['Dips','Pectoraux/Triceps','Hypertrophie'],['Fentes','Quadriceps/Fessiers','Hypertrophie'],
    ['Hip thrust','Fessiers','Hypertrophie'],['Leg curl','Ischio-jambiers','Hypertrophie'],
    ['Mollets debout','Mollets','Hypertrophie'],['Gainage (planche)','Sangle abdominale','Endurance'],
    ['Crunch','Abdominaux','Hypertrophie'],['Rowing unilatéral haltère','Dos','Hypertrophie'],
    ['Pull-over','Dos/Pectoraux','Hypertrophie'],['Shrugs','Trapèzes','Hypertrophie'],['Gainage latéral','Obliques','Endurance']
  ];
  await Promise.all(liste.map(([nom,groupe,type])=>db.collection('mouvements_bib').add({nom, groupeMusculaire:groupe, typeTravail:type, ressourceId:null})));
  toast('Mouvements de départ ajoutés'); renderBibMouvementsTab();
}
async function seedMouvementsLecons(){
  const guides = [
    ['Développé couché', `Allongé sur le banc, les pieds bien à plat au sol, les omoplates resserrées et abaissées (comme pour les ranger dans les poches arrière). La barre descend lentement vers le bas de la poitrine, coudes à environ 45° du buste (pas collés, pas totalement écartés). Inspirez en descendant, expirez en poussant. Gardez les fesses au contact du banc.\n\nErreur fréquente : laisser les coudes partir trop haut (vers les épaules), ce qui stresse l'articulation. Commencez léger pour sentir le bon trajet avant d'ajouter du poids.`],
    ['Développé incliné haltères', `Banc incliné à 30-45°. Haltères de part et d'autre de la poitrine haute, coudes légèrement en dessous du niveau des mains au départ. Poussez vers le haut et légèrement vers l'intérieur sans que les haltères ne se touchent au sommet. Contrôlez la descente, ne laissez pas les coudes partir trop bas (risque d'épaule).\n\nErreur fréquente : incliner le banc trop haut (au-delà de 45°), ce qui transforme l'exercice en travail d'épaules plutôt que de pectoraux.`],
    ['Squat', `Barre posée sur le haut du dos (trapèzes), pieds largeur d'épaules, pointes légèrement vers l'extérieur. Descendez en poussant les hanches vers l'arrière puis en pliant les genoux, dos droit, regard devant. Descendez au moins jusqu'à cuisses parallèles au sol si la mobilité le permet. Les genoux suivent l'axe des pieds, sans partir vers l'intérieur.\n\nErreur fréquente : relever le buste trop tôt en remontant, ce qui bascule la charge sur le bas du dos. Commencez sans charge pour maîtriser le mouvement.`],
    ['Presse à cuisses', `Dos et tête bien calés contre le dossier, pieds écartés largeur d'épaules sur le plateau, légèrement bas pour cibler les quadriceps. Descendez jusqu'à un angle de 90° aux genoux sans décoller le bas du dos du dossier. Poussez sans verrouiller complètement les genoux en haut.\n\nErreur fréquente : descendre trop bas en décollant le bassin, ce qui stresse le bas du dos inutilement.`],
    ['Soulevé de terre', `Barre proche des tibias, pieds largeur de hanches. Saisissez la barre, dos plat, poitrine fière, hanches plus hautes que les genoux. Poussez le sol avec les jambes en gardant la barre collée au corps tout le long du trajet, jusqu'à l'extension complète des hanches.\n\nErreur fréquente : arrondir le bas du dos pendant la traction · c'est l'erreur la plus risquée sur ce mouvement. Réduisez la charge tant que le dos n'est pas parfaitement plat.`],
    ['Soulevé de terre roumain', `Barre tenue à hauteur de cuisses, genoux légèrement fléchis et fixes. Poussez les hanches vers l'arrière en gardant le dos plat, la barre glisse le long des cuisses jusqu'à sentir un étirement net des ischio-jambiers (mi-tibia environ). Remontez en poussant les hanches vers l'avant.\n\nErreur fréquente : plier davantage les genoux en descendant, ce qui transforme le mouvement en squat et retire le travail des ischio-jambiers.`],
    ['Tractions', `Prise en pronation (paumes vers l'avant), un peu plus large que les épaules. Partez bras tendus, tirez en amenant le menton au-dessus de la barre en engageant le dos (omoplates vers le bas) plutôt que seulement les bras. Redescendez en contrôlant, bras complètement tendus.\n\nErreur fréquente : se balancer avec les jambes pour s'aider (kipping) · tant que le mouvement strict n'est pas maîtrisé, mieux vaut une aide élastique.`],
    ['Rowing barre', `Buste penché vers l'avant à environ 45°, dos plat, genoux légèrement fléchis. Tirez la barre vers le bas du ventre en amenant les coudes vers l'arrière, omoplates resserrées en haut du mouvement. Redescendez en contrôlant sans arrondir le dos.\n\nErreur fréquente : se redresser à chaque répétition pour "aider" avec les lombaires · gardez l'angle du buste fixe tout du long.`],
    ['Tirage vertical', `Assis, cuisses bloquées sous les cales. Saisissez la barre un peu plus large que les épaules. Tirez vers le haut de la poitrine en amenant les coudes vers le bas et l'arrière, sans pencher excessivement le buste en arrière. Remontez en contrôlant jusqu'à extension complète des bras.\n\nErreur fréquente : tirer la barre derrière la nuque · à éviter, c'est une position à risque pour les épaules.`],
    ['Développé militaire', `Debout ou assis, barre au niveau des clavicules, prise un peu plus large que les épaules. Poussez la barre verticalement au-dessus de la tête en gainant bien le ventre et les fessiers pour éviter de cambrer le bas du dos. Redescendez jusqu'aux clavicules en contrôlant.\n\nErreur fréquente : cambrer excessivement le dos pour aider la poussée · réduisez la charge si c'est nécessaire pour garder le tronc gainé.`],
    ['Élévations latérales', `Haltères le long du corps, léger fléchissement des coudes maintenu tout du long. Levez les bras sur le côté jusqu'à hauteur d'épaules environ, petit doigt légèrement plus haut que le pouce. Redescendez lentement sans à-coup.\n\nErreur fréquente : utiliser l'élan du buste pour lancer les haltères · mouvement lent et contrôlé, charge légère au départ.`],
    ['Curl biceps barre', `Debout, barre tenue en supination (paumes vers le haut), coudes proches du corps et fixes. Fléchissez les bras en amenant la barre vers les épaules sans bouger les coudes vers l'avant ni balancer le buste. Redescendez en contrôlant jusqu'à extension complète.\n\nErreur fréquente : utiliser le dos et les hanches pour lancer la barre (triche excessive) · gardez le buste stable.`],
    ['Extension triceps poulie', `Debout face à la poulie haute, coudes collés au corps et fixes près des côtes. Poussez la barre ou la corde vers le bas jusqu'à extension complète des bras, sans décoller les coudes vers l'avant. Remontez en contrôlant.\n\nErreur fréquente : laisser les coudes s'écarter du corps, ce qui transfère le travail vers les épaules.`],
    ['Dips', `Bras tendus en appui sur les barres parallèles, buste légèrement penché vers l'avant pour cibler les pectoraux (buste droit pour cibler davantage les triceps). Descendez jusqu'à un angle de 90° au coude environ, sans aller trop bas si vous manquez de mobilité d'épaule. Remontez jusqu'à extension complète sans verrouiller brutalement.\n\nErreur fréquente : descendre trop bas trop tôt · limitez l'amplitude tant que les épaules ne sont pas assez mobiles et fortes.`],
    ['Fentes', `Un pas en avant, descendez jusqu'à ce que les deux genoux forment un angle proche de 90°, genou arrière proche du sol sans le toucher brutalement. Le genou avant reste aligné avec le pied, ne part pas vers l'intérieur. Remontez en poussant sur le talon avant.\n\nErreur fréquente : que le genou avant dépasse largement la pointe du pied de façon excessive et déséquilibrée · gardez le buste droit et le pas suffisamment long.`],
    ['Hip thrust', `Haut du dos appuyé sur un banc, barre posée sur le bassin (avec protection), pieds à plat au sol largeur de hanches. Poussez les hanches vers le haut jusqu'à ce que le corps forme une ligne droite genoux-hanches-épaules, en contractant fort les fessiers en haut. Redescendez en contrôlant sans que les hanches touchent le sol.\n\nErreur fréquente : cambrer excessivement le bas du dos en haut du mouvement au lieu de contracter les fessiers · gardez le menton rentré et le gainage actif.`],
    ['Leg curl', `Allongé ou assis selon la machine, coussinet positionné juste au-dessus des talons. Fléchissez les genoux pour amener le coussinet vers les fessiers, en gardant les hanches au contact du support. Redescendez en contrôlant sans claquer la charge.\n\nErreur fréquente : décoller les hanches pour aider le mouvement · gardez le bassin stable tout du long.`],
    ['Mollets debout', `Debout sur une plateforme surélevée, avant-pieds posés, talons dans le vide. Montez le plus haut possible sur la pointe des pieds, puis descendez en laissant les talons aller sous le niveau de la plateforme pour un étirement complet. Mouvement lent et contrôlé, sans rebond.\n\nErreur fréquente : faire des petits mouvements rapides sans amplitude complète · ralentissez et allez chercher l'étirement en bas.`],
    ['Gainage (planche)', `En appui sur les avant-bras et les pointes de pieds, corps aligné des talons à la tête comme une planche rigide. Contractez le ventre et les fessiers, respirez normalement sans bloquer. Ne laissez ni les hanches monter (fesses en l'air) ni descendre (dos cambré).\n\nErreur fréquente : laisser le bassin s'affaisser au fil des secondes par fatigue · mieux vaut arrêter la série qu'une mauvaise position prolongée.`],
    ['Crunch', `Allongé, genoux fléchis, pieds à plat. Mains légèrement en soutien derrière la tête sans tirer sur la nuque. Enroulez le haut du dos vers l'avant en contractant les abdominaux, sans chercher à s'asseoir complètement. Redescendez en contrôlant.\n\nErreur fréquente : tirer sur la tête avec les mains pour "aider" · laissez les abdominaux faire le travail, amplitude courte mais contrôlée.`],
    ['Rowing unilatéral haltère', `Un genou et une main en appui sur un banc, dos plat et parallèle au sol. L'autre bras tire l'haltère vers la hanche en amenant le coude vers l'arrière, omoplate resserrée en haut. Redescendez en contrôlant jusqu'à extension complète du bras.\n\nErreur fréquente : faire pivoter le buste pour aider le mouvement · gardez les épaules parallèles au sol tout du long.`],
    ['Pull-over', `Allongé perpendiculairement à un banc (ou dessus, selon préférence), haltère tenu à deux mains au-dessus de la poitrine, bras légèrement fléchis et fixes. Descendez l'haltère en arc de cercle derrière la tête jusqu'à sentir un étirement de la cage thoracique, puis remontez par le même trajet.\n\nErreur fréquente : plier davantage les coudes en descendant, ce qui transforme le mouvement en exercice de triceps plutôt que de dos/pectoraux.`],
    ['Shrugs', `Debout, haltères ou barre le long du corps, bras tendus. Haussez les épaules le plus haut possible en ligne droite verticale (pas de rotation des épaules), tenez une seconde en haut, puis redescendez en contrôlant.\n\nErreur fréquente : faire rouler les épaules en cercle · le mouvement est uniquement vertical, haut puis bas.`],
    ['Gainage latéral', `En appui sur un avant-bras et le côté du pied, corps aligné des pieds à la tête, hanche décollée du sol. Contractez les obliques pour maintenir la ligne droite, sans laisser le bassin tomber vers le sol. Respirez normalement.\n\nErreur fréquente : laisser les hanches s'affaisser ou partir vers l'arrière · le corps doit rester une ligne droite vue de face.`]
  ];
  const ref = await db.collection('lecons').add({nom:'Exécution des mouvements', parentId:null, type:'dossier', createdAt:todayStr()});
  const createdIds = {};
  for(const [nom, texte] of guides){
    const leconRef = await db.collection('lecons').add({nom, parentId:ref.id, type:'ressource', texte, videoAssetId:null, createdAt:todayStr()});
    createdIds[nom] = leconRef.id;
  }
  const bib = await loadAllMouvementsBib();
  await Promise.all(bib.filter(m=>!m.ressourceId && createdIds[m.nom]).map(m=>db.doc('mouvements_bib/'+m.id).update({ressourceId:createdIds[m.nom]})));
  toast('Fiches d\u2019exécution créées et reliées'); renderBibMouvementsTab();
}
async function renderBibCyclesTab(){
  const el = document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const templates = await loadAllCyclesBib();
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>Bibliothèque de cycles <button class="btn btn-primary btn-sm" onclick="startNewCycleTemplate()">Nouveau modèle</button></h2>
    </div>
    ${templates.length? templates.map(t=>`
      <div class="card">
        <h2>${t.nom} <span style="margin-left:auto;display:inline-flex;gap:6px"><button class="btn btn-secondary btn-sm" onclick="editCycleTemplate('${t.id}')">Modifier</button><button class="btn btn-danger btn-sm" onclick="askDelete('deleteCycleTemplate','${t.id}','Supprimer ce modèle de cycle ?')">Supprimer</button></span></h2>
        ${t.entrainements.map(ent=>`<div style="margin-bottom:8px"><b>${ent.nom}</b>${ent.mouvements.map(mv=>`<div class="seance-row"><span>${mv.nom} · ${mvSpec(mv,'chargeDepart')}${mv.surchargeProgressive?' <span class="tag">progressif</span>':''}</span></div>`).join('')}</div>`).join('')}
      </div>
    `).join('') : '<div class="card"><div class="empty">Aucun modèle enregistré</div></div>'}
  `;
}
async function deleteCycleTemplate(id){
  await db.doc('cycles_bib/'+id).delete();
  renderBibCyclesTab();
}

// ---- MES ENSEIGNEMENTS (leçons, vidéos, arborescence libre) ----
async function loadAllLecons(){
  const snap = await db.collection('lecons').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
function buildLeconsChildren(all, parentId){
  return all.filter(n=>n.parentId===parentId).sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
}
function leconsBreadcrumbHtml(navFnPrefix){
  const path = S.leconsPath||[];
  return `<div class="empty"><span style="cursor:pointer;text-decoration:underline" onclick="${navFnPrefix}Root()">Tous les enseignements</span>${path.map((p,i)=>` / <span style="cursor:pointer;text-decoration:underline" onclick="${navFnPrefix}To(${i})">${p.nom}</span>`).join('')}</div>`;
}
async function renderLeconsTab(){
  if(!S.leconsPath) S.leconsPath = [];
  const el = document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const all = await loadAllLecons();
  S.leconsAllCache = all;
  const parentId = S.leconsPath.length? S.leconsPath[S.leconsPath.length-1].id : null;
  const children = buildLeconsChildren(all, parentId);
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>Mes enseignements</h2>
      ${leconsBreadcrumbHtml('lecons')}
      <div class="modalbtns" style="margin-top:10px">
        <button class="btn btn-secondary btn-sm" onclick="openNewLeconDossier()">Nouveau dossier</button>
        <button class="btn btn-primary btn-sm" onclick="openLeconRessourceModal()">Nouvelle ressource</button>
      </div>
      ${(!parentId && all.length===0)?`<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="seedLecons()">Charger la bibliothèque des 5 piliers (51 leçons)</button>`:''}
    </div>
    <div class="card">
      ${children.length? children.map(n=>`
        <div class="seance-row">
          <span style="cursor:pointer" onclick="${n.type==='dossier'?`leconsOpen('${n.id}')`:`leconsViewRessource('${n.id}')`}">${n.type==='dossier'?ICON_FOLDER:ICON_DOC}${n.nom}</span>
          <span><button class="btn btn-secondary btn-sm" onclick="${n.type==='dossier'?`openEditLeconDossier('${n.id}')`:`openLeconRessourceModal('${n.id}')`}">Modifier</button> <button class="btn btn-danger btn-sm" onclick="confirmDeleteLecon('${n.id}')">Supprimer</button></span>
        </div>
      `).join('') : '<div class="empty">Vide</div>'}
    </div>
  `;
}
function leconsOpen(id){
  const n = (S.leconsAllCache||[]).find(x=>x.id===id);
  S.leconsPath.push({id, nom: n?n.nom:''});
  renderLeconsTab();
}
function leconsRoot(){ S.leconsPath=[]; renderLeconsTab(); }
function leconsTo(idx){ S.leconsPath = S.leconsPath.slice(0, idx+1); renderLeconsTab(); }
function openNewLeconDossier(){
  openModal(`<h3>Nouveau dossier</h3><label>Nom</label><input id="lc-dossier-nom"><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveLeconDossier()">Créer</button></div>`);
}
function openEditLeconDossier(id){
  const n = (S.leconsAllCache||[]).find(x=>x.id===id);
  openModal(`<h3>Modifier le dossier</h3><label>Nom</label><input id="lc-dossier-nom" value="${n?n.nom:''}"><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveLeconDossier('${id}')">Enregistrer</button></div>`);
}
async function saveLeconDossier(editId){
  const nom = val('lc-dossier-nom');
  if(!nom){ toast('Nom requis'); return; }
  if(editId){ await db.doc('lecons/'+editId).update({nom}); }
  else {
    const parentId = S.leconsPath.length? S.leconsPath[S.leconsPath.length-1].id : null;
    await db.collection('lecons').add({nom, parentId, type:'dossier', createdAt:todayStr()});
  }
  closeModal(); renderLeconsTab();
}
function openLeconRessourceModal(editId){
  const n = editId ? (S.leconsAllCache||[]).find(x=>x.id===editId) : null;
  openModal(`
    <h3>${n?'Modifier':'Nouvelle'} ressource</h3>
    <label>Titre</label><input id="lc-res-nom" value="${n?n.nom:''}">
    <label>Texte</label><textarea id="lc-res-texte" rows="6">${n?(n.texte||''):''}</textarea>
    <label>Vidéo (optionnel, 20 Mo max)</label>
    ${n&&n.videoAssetId?`<div><video src="/_blob/${n.videoAssetId}" controls style="max-width:100%"></video><br><button class="btn btn-danger btn-sm" onclick="removeLeconVideo('${n.id}')">Retirer la vidéo</button></div>`:''}
    <input type="file" id="lc-res-video" accept="video/mp4,video/webm">
    <div id="lc-res-upload-status" class="empty" style="margin-top:6px"></div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveLeconRessource(${n?`'${n.id}'`:'null'})">Enregistrer</button></div>
  `);
}
async function saveLeconRessource(editId){
  const nom = val('lc-res-nom');
  const texte = val('lc-res-texte');
  if(!nom){ toast('Titre requis'); return; }
  const fileInput = document.getElementById('lc-res-video');
  const existing = editId ? (S.leconsAllCache||[]).find(x=>x.id===editId) : null;
  let videoAssetId = existing ? existing.videoAssetId : null;
  if(fileInput && fileInput.files && fileInput.files[0]){
    const statusEl = document.getElementById('lc-res-upload-status');
    statusEl.textContent = "Envoi de la vidéo...";
    try{
      const assets = hasClaudeApi() ? await claude.use('assets') : null;
      if(!assets){ toast("Vidéos indisponibles dans la version hors ligne"); }
      else {
        const res = await assets.upload(fileInput.files[0]);
        videoAssetId = res.id;
      }
    } catch(e){ toast("Échec de l'upload vidéo"); }
  }
  const data = {nom, texte, videoAssetId: videoAssetId||null, type:'ressource'};
  if(editId){ await db.doc('lecons/'+editId).update(data); }
  else {
    const parentId = S.leconsPath.length? S.leconsPath[S.leconsPath.length-1].id : null;
    await db.collection('lecons').add({...data, parentId, createdAt:todayStr()});
  }
  closeModal(); toast('Enregistré'); renderLeconsTab();
}
async function removeLeconVideo(id){
  await db.doc('lecons/'+id).update({videoAssetId:null});
  closeModal(); renderLeconsTab();
}
function leconsViewRessource(id){
  const n = (S.leconsAllCache||[]).find(x=>x.id===id);
  if(!n) return;
  openModal(`
    <h3>${n.nom}</h3>
    ${n.videoAssetId?`<video src="/_blob/${n.videoAssetId}" controls style="max-width:100%;border-radius:8px"></video>`:''}
    ${n.texte?`<p style="white-space:pre-wrap;margin-top:10px">${n.texte}</p>`:''}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Fermer</button></div>
  `);
}
function confirmDeleteLecon(id){
  openModal(`<h3>Supprimer cet élément ?</h3><p>Si c'est un dossier, tout son contenu sera supprimé aussi.</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="deleteLeconCascade('${id}')">Supprimer</button></div>`);
}
async function deleteLeconCascade(id){
  const all = await loadAllLecons();
  const toDelete = [id];
  function collect(pid){ all.filter(n=>n.parentId===pid).forEach(n=>{ toDelete.push(n.id); collect(n.id); }); }
  collect(id);
  await Promise.all(toDelete.map(did=>db.doc('lecons/'+did).delete()));
  closeModal(); renderLeconsTab();
}
async function seedLecons(){
  const data = [
    {dossier:'Physiologie & système nerveux', lecons:[
      {nom:'Le système nerveux et la neuroplasticité', texte:`Un mouvement commence dans le cerveau : décision, signal nerveux, contraction musculaire. Un effort difficile fatigue les terminaisons nerveuses ; pendant la récupération, le cerveau crée de nouvelles connexions spécifiques à ce mouvement · plus un muscle a de terminaisons actives, plus son recrutement est précis et puissant. C'est pourquoi les premières semaines de pratique apportent des gains de force rapides sans gain de masse visible : le système nerveux s'adapte avant les fibres musculaires.\n\nRéférence : Sale (1988), Medicine & Science in Sports & Exercise.`},
      {nom:'Le principe de la musculation', texte:`Construire suppose d'abord de détruire : chaque séance crée des micro-lésions qui signalent au corps la nécessité de s'adapter (surcompensation). La tension mécanique sur le muscle est aujourd'hui identifiée comme le facteur dominant de cette adaptation, devant les dommages musculaires eux-mêmes. Ce processus se produit pendant la récupération, pas pendant l'effort.\n\nRéférence : Schoenfeld (2010), Journal of Strength and Conditioning Research.`},
      {nom:'Les hormones : testostérone, cortisol, insuline', texte:`La testostérone favorise la synthèse protéique et la croissance musculaire. Le cortisol (hormone du stress) dégrade le muscle en cas de stress chronique ou de récupération insuffisante. L'insuline régule le stockage des nutriments · bien gérée, elle est anabolique ; mal gérée, elle favorise le stockage graisseux.\n\nRéférence : Kraemer & Ratamess (2005), Sports Medicine.`},
      {nom:'Cellules musculaires et graisseuses : vidage, pas transformation', texte:`Impossible biologiquement : le muscle ne se transforme jamais en graisse. Ce sont deux types cellulaires distincts qui se vident ou se remplissent, sans jamais se convertir l'un en l'autre. C'est pourquoi une reprise après une pause est toujours plus rapide qu'un premier démarrage : l'infrastructure cellulaire reste en place.\n\nRéférence : Arner & Spalding (2010).`},
      {nom:'Inflammation et courbatures', texte:`L'inflammation est une réponse immunitaire normale qui signale les zones à réparer. Les courbatures (DOMS) apparaissent 24 à 72h après l'effort et reflètent la nouveauté du stimulus, pas son efficacité · un pratiquant confirmé peut avoir une séance très productive sans aucune courbature.\n\nRéférence : Cheung et al. (2003), Sports Medicine.`},
      {nom:'La lipolyse', texte:`La lipolyse mobilise les graisses stockées en continu, mais c'est le bilan calorique négatif maintenu dans la durée qui conditionne la perte de masse grasse réelle. Perdre du poids est un état de stress neurobiologique pour le cerveau (programmé pour stocker) · d'où fringales, fatigue et pensées obsédantes autour de la nourriture en période de restriction. Comprendre cela, c'est arrêter de se juger et commencer à gérer.`},
      {nom:"L'hydratation", texte:`L'eau représente environ 75% de la masse musculaire. Une déshydratation de 2% du poids corporel suffit à mesurer une baisse de performance physique et cognitive. Attendre la sensation de soif, c'est déjà être en déficit.`},
      {nom:"L'axe intestin-cerveau", texte:`L'intestin communique en permanence avec le cerveau via le nerf vague · on l'appelle parfois le "deuxième cerveau". Le microbiome intestinal influence la production de précurseurs de neurotransmetteurs (notamment la sérotonine, via le tryptophane) et la récupération musculaire. Une alimentation ultra-transformée appauvrit ce microbiome.\n\nRéférence : Cryan et al. (2019), Physiological Reviews.`},
      {nom:'Le cycle féminin et l\u2019entraînement', texte:`Le corps féminin fonctionne en système cyclique. En phase folliculaire (début de cycle), les œstrogènes favorisent force et récupération · période idéale pour les séances intenses. En phase lutéale, la température corporelle augmente, la fatigue s'installe plus vite et les besoins caloriques augmentent légèrement.`},
      {nom:'Contraception hormonale et impact physique', texte:`Certaines pilules combinées augmentent la SHBG, réduisant la testostérone biodisponible · avec un impact possible sur la libido, la masse musculaire et la motivation. D'autres méthodes suppriment l'ovulation et, avec elle, les bénéfices de la phase folliculaire sur la force.`}
    ]},
    {dossier:'Psychologie du sport', lecons:[
      {nom:'Connaître ses limites pour s\u2019en approcher sans les franchir', texte:`Le progrès se situe à la frontière de la limite · pas en-deçà, pas au-delà. S'entraîner trop en dessous de ses capacités ne génère pas d'adaptation ; les dépasser chroniquement génère surentraînement, blessures et épuisement du système nerveux central. L'objectif est de trouver cette zone de tension optimale · inconfortable mais gérable · et de la déplacer progressivement.\n\nRéférence : Meeusen et al. (2013), European Journal of Sport Science.`},
      {nom:'Le rôle de la volonté', texte:`La construction musculaire et nerveuse est pilotée par le cerveau. L'étude de Guang Yue montre que des participants ayant uniquement visualisé mentalement un mouvement ont progressé en force sans aucun entraînement physique. Cette étude porte sur un mouvement isolé et ne se généralise pas mécaniquement à toute la musculation · mais elle illustre un principe central : un cerveau pleinement impliqué dans l'effort construit plus efficacement qu'un cerveau qui exécute mécaniquement.\n\nRéférence : Yue & Cole (1992), Journal of Neurophysiology (gain de force de 22% par imagerie mentale seule).`},
      {nom:"Les sensations : mauvais indicateur d'effort, bon pour l'implication", texte:`Brûlure, "pompe", courbatures sont souvent prises pour preuve d'un bon entraînement · c'est une erreur. Les zones peu innervées (ischio-jambiers, dos profond) génèrent peu de sensations même sous forte charge. L'absence de sensation n'est pas un mauvais signe. En revanche, les sensations aident le cerveau à se connecter au muscle et à améliorer son recrutement : un outil de connexion, pas un critère de jugement.\n\nRéférence : Calatayud et al. (2016), European Journal of Applied Physiology.`},
      {nom:'La vraie différence entre réussite et échec : régularité et temps long', texte:`Les transformations visibles prennent 6 mois à 2 ans de pratique régulière. La majorité des abandons se produisent dans les 3 premiers mois · juste avant l'apparition des premiers résultats significatifs. Ce n'est pas l'intensité qui différencie ceux qui réussissent, c'est la régularité sur la durée : une séance moyenne chaque semaine pendant 3 ans surpasse n'importe quelle séance parfaite pratiquée sporadiquement.\n\nRéférence : Garber et al. (2011), Medicine & Science in Sports & Exercise.`},
      {nom:'Réactions hormonales et psychologiques au sport', texte:`Adrénaline et noradrénaline augmentent l'éveil pendant l'effort ; les endorphines réduisent la perception de la douleur et génèrent l'euphorie post-effort ; la dopamine renforce la motivation par le circuit de la récompense · en partie ce qui crée l'attachement à la pratique. Le sport régulier réduit le cortisol chronique et améliore la sensibilité à l'insuline. C'est pourquoi arrêter le sport après une pratique régulière peut générer de vrais symptômes de manque.`},
      {nom:'Sport, santé mentale et handicap', texte:`Le sport est aujourd'hui reconnu comme traitement à part entière de la dépression légère à modérée, avec une efficacité comparable à certains antidépresseurs dans plusieurs études. Il réduit l'anxiété, améliore le sommeil, renforce l'estime de soi. Dans le contexte du handicap, il joue un rôle supplémentaire d'ancrage corporel et de lien social.\n\nRéférence : Blumenthal et al. (2007), Psychosomatic Medicine.`},
      {nom:'Plateaux et identité athlétique', texte:`Un plateau n'est pas un échec · c'est une adaptation réussie : le corps a optimisé sa réponse au stimulus actuel. La solution n'est jamais de paniquer ni de tout changer radicalement, mais d'ajuster intelligemment les variables. Se définir comme "quelqu'un qui s'entraîne" est l'un des meilleurs prédicteurs de régularité à long terme · mais ça peut aussi devenir un piège si la pratique bascule dans la dépendance (entraînement compulsif, incapacité à récupérer sans culpabilité, pratique maintenue malgré la blessure).`},
      {nom:'Le dysmorphisme musculaire', texte:`La bigorexie est le pendant de l'anorexie dans l'univers de la musculation : une perception déformée de son propre corps, toujours perçu comme insuffisant. Elle touche surtout les hommes et est fortement corrélée à l'exposition aux corps "idéaux" des réseaux sociaux. Apprendre à voir son corps avec objectivité · ni complaisance, ni sévérité excessive · est une compétence qui s'entraîne autant que le squat.\n\nRéférence : Pope et al. (1997), Psychosomatics.`},
      {nom:'L\u2019effet placebo dans le sport', texte:`Le placebo n'est pas une illusion mais un mécanisme neurobiologique réel : la conviction de progresser active des réponses physiologiques mesurables (tolérance à la douleur, mobilisation énergétique, coordination motrice). Puisque c'est le cerveau qui contrôle l'effort et la perception de la limite, l'impliquer positivement améliore objectivement les résultats. Ce n'est pas de la pensée magique · c'est de la neurologie appliquée.`}
    ]},
    {dossier:'Les mensonges des réseaux sociaux', lecons:[
      {nom:'La représentation des corps', texte:`Ce que vous voyez sur les réseaux n'est pas la réalité · c'est une construction : photos choisies parmi des dizaines de prises, cadrage, éclairage, retouches. Mais le facteur le plus sous-estimé reste le dopage : un nombre significatif de créateurs de contenu fitness utilisent stéroïdes anabolisants, peptides ou autres substances sans jamais le révéler. Le corps visé naturellement est parfois biologiquement inaccessible sans aide chimique. Comparer ses résultats à ces standards, c'est se battre contre une réalité falsifiée.`},
      {nom:'La course au contenu et à la complexification inutile', texte:`L'algorithme récompense la régularité et le sensationnalisme, pas la pertinence. Pour être vu, un créateur doit surprendre · donc complexifier, contredire, dramatiser. Le contenu finit par être guidé non par ce qui est vrai ou utile, mais par ce qui génère de l'engagement : d'où l'inflation de "techniques secrètes" et de contradictions permanentes qui créent confusion et dépendance informationnelle. La vérité de la musculation est simple. C'est son exécution qui est difficile.`}
    ]},
    {dossier:'Nutrition fondamentale', lecons:[
      {nom:"L'origine du découpage alimentaire actuel", texte:`Le modèle "3 repas par jour" n'est pas une vérité biologique mais une construction sociale née de l'industrialisation : les horaires d'usine ont imposé des rythmes alimentaires collectifs. Ce découpage rigide nous coupe de nos signaux de faim naturels et pousse à manger par habitude plutôt que par besoin réel.`},
      {nom:"L'alimentation industrielle n'est pas conçue pour nourrir", texte:`Elle est conçue pour se vendre. Trois leviers principaux · sucre, sel, graisses · sont dosés pour atteindre le "bliss point" : la combinaison qui maximise le plaisir et réduit la satiété. Le résultat est une alimentation hyper-palatable, hyper-calorique et pauvre en micronutriments. Ce n'est pas un accident, c'est un modèle économique.\n\nRéférence : Moss (2013), "Salt Sugar Fat".`},
      {nom:"La perte de nutriments depuis l'hyper-industrialisation", texte:`Les pratiques agricoles intensives ont réduit la densité nutritionnelle des fruits, légumes et céréales (baisses mesurées en magnésium, zinc, fer, vitamines C et B). Manger "équilibré" au sens moderne ne garantit plus les apports qu'on lui prêtait il y a 70 ans.\n\nRéférence : Davis et al. (2004), Journal of the American College of Nutrition.`},
      {nom:'Les calories et le calcul des besoins', texte:`Une calorie est une unité d'énergie, ni bonne ni mauvaise en soi. Le bilan calorique reste le facteur déterminant de la prise ou perte de poids. La formule de Mifflin-St Jeor (utilisée dans le Calcul diét) est aujourd'hui la plus fiable pour estimer le métabolisme de base. Les calories ne sont cependant pas équivalentes en effets hormonaux et en satiété · la qualité compte autant que la quantité.\n\nRéférence : Mifflin et al. (1990).`},
      {nom:'Assimilation et timing nutritionnel', texte:`La vitesse de digestion dépend des autres aliments, de la muqueuse intestinale et du microbiome. La fenêtre anabolique post-entraînement existe mais sa pertinence dépend du contexte : large (2-4h) si vous avez mangé avant l'effort, plus urgente si vous vous entraînez à jeun. Ce qui compte avant tout, c'est la répartition des protéines sur toute la journée.\n\nRéférence : Schoenfeld & Aragon (2013).`},
      {nom:'Macronutrition : protéines, lipides, glucides, fibres', texte:`Protéines : briques de reconstruction (1,6 à 2,2g/kg en musculation). Glucides : carburant préférentiel de l'effort intense · les supprimer nuit à la performance. Lipides : essentiels à la production hormonale (testostérone, œstrogènes). Fibres : régulent la glycémie et nourrissent le microbiome. Aucun macronutriment n'est l'ennemi.`},
      {nom:'La qualité des protéines selon leur origine', texte:`Le score DIAAS mesure la qualité réelle d'une protéine. Les protéines animales sont complètes et hautement assimilables. La plupart des protéines végétales sont incomplètes · la complémentation (riz + légumineuses) comble ce manque. La whey est rapide d'absorption (post-training), la caséine est lente (avant le sommeil).`},
      {nom:'La micronutrition, le socle invisible', texte:`Vitamines et minéraux ne fournissent pas d'énergie mais conditionnent tout le reste : magnésium (contraction musculaire), zinc et vitamine D (synthèse hormonale), fer (transport d'oxygène), vitamines B (système nerveux). Un déficit modéré peut impacter la performance sans être identifié clairement.`},
      {nom:'Les compléments alimentaires', texte:`Ils complètent une base alimentaire solide, ils ne la remplacent pas. Les plus documentés : créatine monohydrate, whey protéine, vitamine D3, oméga-3, magnésium. Le reste nécessite une lecture critique · c'est un marché de plusieurs milliards d'euros avec des standards de preuve très inégaux.`},
      {nom:'Insuline, sensibilité et pics glycémiques', texte:`Un pic glycémique brutal provoque une forte réponse insulinique suivie d'une chute rapide (hypoglycémie réactionnelle) : fatigue, irritabilité, fringales. Ce cycle répété détériore la sensibilité à l'insuline. Stabiliser la glycémie via des aliments à index glycémique bas est l'une des interventions les plus impactantes.`},
      {nom:'Les régimes végétarien et végétalien', texte:`Compatibles avec la musculation si bien construits. Carences les plus fréquentes en végétalien : vitamine B12 (seule strictement inévitable sans complémentation), vitamine D, fer, zinc, oméga-3 EPA/DHA, calcium · toutes évitables avec une alimentation pensée.`},
      {nom:'Les régimes populaires, contextualisés honnêtement', texte:`Cétogène, jeûne intermittent, carnivore : chacun peut fonctionner pour certains profils et échouer pour d'autres. Aucun régime n'est universellement supérieur · ce qui fonctionne sur le long terme, c'est ce qui est tenable.`},
      {nom:"L'addictologie alimentaire", texte:`La nourriture ultra-transformée peut générer des comportements addictifs au sens clinique : perte de contrôle, consommation compulsive, tolérance croissante. Les mécanismes neurobiologiques sont les mêmes que pour les addictions aux substances. "Manger mieux" n'est donc pas qu'une question de volonté.`},
      {nom:"L'orthorexie", texte:`L'obsession de manger "sainement" peut devenir une fin en soi, source d'anxiété et de rigidité sociale · fréquente dans les milieux fitness. La frontière avec une discipline alimentaire saine se situe dans la flexibilité : tolérer les écarts sans culpabilité et garder une vie sociale normale.`},
      {nom:'L\u2019impact de la nutrition sur la santé mentale', texte:`La sérotonine cérébrale est synthétisée à partir du tryptophane, apporté par l'alimentation. Les oméga-3 ont montré des effets antidépresseurs dans plusieurs études. Une alimentation ultra-transformée est associée à un risque accru de dépression et d'anxiété.\n\nRéférence : Jacka et al. (2017), BMC Medicine (essai SMILES).`}
    ]},
    {dossier:'Méthodologie d\u2019entraînement', lecons:[
      {nom:'Force, hypertrophie, endurance : trois logiques distinctes', texte:`Force (charges max, 1-5 reps) : développe surtout le système nerveux, la capacité à recruter un maximum d'unités motrices. Hypertrophie (charges modérées, 6-15 reps) : maximise le temps sous tension. Endurance musculaire (charges légères, 15+ reps) : développe la résistance à la fatigue. Ces méthodes ne sont pas exclusives · les combiner produit souvent de meilleurs résultats.`},
      {nom:'Exercices à prédominance nerveuse vs musculaire', texte:`Les mouvements polyarticulaires lourds (squat, soulevé de terre, développé couché) sollicitent surtout le système nerveux central. Les exercices d'isolation ciblent la fatigue musculaire locale. Les exercices nerveux doivent être placés en premier dans une séance (système nerveux frais), les exercices musculaires ensuite.\n\nRéférence : Simão et al. (2012), Sports Medicine.`},
      {nom:"Groupes musculaires : l'isolation complète n'existe pas", texte:`Anatomiquement impossible d'isoler totalement un muscle · les insertions et la stabilisation passive impliquent toujours plusieurs structures. Ex : le curl biceps implique avant-bras et deltoïdes antérieurs. Connaître ces chevauchements évite de sur-solliciter involontairement un muscle entre deux séances censées le laisser récupérer.`},
      {nom:'La "triche" dans les mouvements', texte:`Impliquer d'autres muscles ou utiliser l'élan n'est pas toujours une faute. Pour la plupart des pratiquants, la triche contrôlée permet de manipuler des charges plus lourdes (stimulant davantage le système nerveux) et libère l'attention pour se concentrer sur les sensations. La seule limite réelle : la sécurité des articulations et de la colonne.`},
      {nom:'La surcharge progressive', texte:`Principe fondamental : le stimulus doit continuer d'augmenter pour que le progrès continue. Protocole : définir une fourchette de répétitions, partir avec une charge permettant d'atteindre le maximum de la fourchette, augmenter progressivement jusqu'à ne plus dépasser le minimum · puis repartir avec une charge intermédiaire entre le départ et le maximum atteint. C'est exactement la logique automatisée dans votre suivi de cycles.`},
      {nom:'La périodisation', texte:`Planifier l'entraînement sur plusieurs semaines/mois en faisant varier intentionnellement intensité, volume et objectifs · évite stagnation et surentraînement. Penser son entraînement sur 3 à 12 mois plutôt que séance par séance distingue une progression continue d'un éternel recommencement.`},
      {nom:'Changer les stimulus', texte:`Le corps s'adapte vite à un stimulus répété. La base recommandée : garder les mêmes exercices environ 3 mois (le temps de maîtriser le mouvement et progresser en charge), puis changer. Trop tôt empêche la progression technique ; trop tard installe le plateau.`},
      {nom:'Le temps de repos entre les séries', texte:`Temps courts (30-60s) : pertinents pour l'endurance musculaire. Pour l'hypertrophie, 2-3 minutes est l'optimum actuel. Pour la force maximale, 3-5 minutes pour une récupération nerveuse complète.\n\nRéférence : Schoenfeld et al. (2016), Journal of Strength and Conditioning Research.`},
      {nom:'Le cardio', texte:`Son excès est l'ennemi, pas sa pratique modérée : il améliore la santé cardiovasculaire, accélère la récupération et contribue au déficit calorique sans dégrader le muscle si les protéines sont suffisantes. LISS préférable en prise de masse (minimise l'interférence), HIIT plus efficace en temps mais plus coûteux en récupération.`},
      {nom:'Mobilité et flexibilité', texte:`Deux choses distinctes qui conditionnent toutes deux la longévité : la mobilité est la capacité à bouger activement dans l'amplitude complète, la flexibilité est la longueur passive du muscle. Un manque de mobilité de cheville compromet la profondeur du squat ; un manque de mobilité thoracique surcharge les lombaires.`},
      {nom:"Les différents types d'entraînement", texte:`Supersets (deux exercices enchaînés sans repos) augmentent la densité ; drop sets (réduire la charge à l'échec) maximisent le volume en peu de temps ; rest-pause permet de dépasser l'échec momentané ; occlusion vasculaire (BFR) stimule l'hypertrophie avec des charges légères. Chacun a ses indications et ses limites.`}
    ]},
    {dossier:'Récupération & longévité', lecons:[
      {nom:'Le sommeil et la récupération', texte:`C'est pendant le sommeil profond que la sécrétion de GH (hormone de croissance) atteint son pic, que la synthèse protéique s'intensifie, et que les apprentissages moteurs de la séance s'ancrent. Dormir 6h au lieu de 8 pendant une semaine réduit significativement la testostérone et augmente le cortisol. Aucun protocole d'entraînement ni aucun complément ne compense un sommeil insuffisant · la récupération n'est pas l'absence d'entraînement, c'est la moitié du travail.\n\nRéférence : Leproult & Van Cauter (2011), JAMA.`},
      {nom:'La prévention des blessures', texte:`La blessure est le seul vrai obstacle irréversible à la progression · un plateau se surmonte, une déchirure tendineuse peut changer une pratique pour des années. Trois piliers : l'échauffement progressif, le travail de gainage/stabilisation des zones vulnérables (lombaires, épaules, genoux), et l'écoute de la douleur (distinguer l'inconfort normal de l'effort du signal d'alarme articulaire ou tendineux). L'ego en salle est le premier facteur de risque.\n\nRéférence : Lauersen et al. (2014), British Journal of Sports Medicine.`},
      {nom:'Le désentraînement et la reprise', texte:`Arrêter de s'entraîner ne fait pas "fondre" le muscle · les cellules se dégonflent, elles ne disparaissent pas. La force décline après 2-3 semaines d'inactivité complète, la masse visible après 3-4 semaines. La mémoire musculaire (noyaux myogènes conservés) permet une reprise bien plus rapide qu'un premier démarrage · mais le système nerveux et les tendons doivent se réadapter progressivement : vouloir retrouver son niveau immédiatement est l'erreur classique à la reprise.\n\nRéférence : Bruusgaard et al. (2010), PNAS.`},
      {nom:"L'entraînement selon l'âge", texte:`Le déclin de la testostérone commence dès 30 ans (environ -1%/an), pas brutalement à 40 ans. La sarcopénie suit la même logique : -3 à -8% de masse musculaire par décennie dès la trentaine, qui s'accélère après 60 ans. Adaptations nécessaires après 40 ans : plus de récupération entre les séances, amplitudes sécurisées, volume d'entraînement maintenu élevé, apports protéiques renforcés. La musculation reste l'intervention la plus efficace connue contre le vieillissement musculaire.\n\nRéférence : Peterson et al. (2011), Ageing Research Reviews.`}
    ]}
  ];
  for(const section of data){
    const ref = await db.collection('lecons').add({nom:section.dossier, parentId:null, type:'dossier', createdAt:todayStr()});
    for(const l of section.lecons){
      await db.collection('lecons').add({nom:l.nom, parentId:ref.id, type:'ressource', texte:l.texte, videoAssetId:null, createdAt:todayStr()});
    }
  }
  toast('Bibliothèque des 5 piliers intégrée (51 leçons)');
  renderLeconsTab();
}
function flattenRessourcesList(all){
  function labelOf(n){
    let parts=[n.nom]; let p=n.parentId;
    while(p){ const parent=all.find(x=>x.id===p); if(!parent) break; parts.unshift(parent.nom); p=parent.parentId; }
    return parts.join(' / ');
  }
  return all.filter(n=>n.type==='ressource').map(n=>({id:n.id, label:labelOf(n)}));
}

// ---- CLIENT-FACING: Mes enseignements (lecture seule) ----
async function renderClientLecons(el, c){
  if(!S.leconsPath) S.leconsPath = [];
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const all = await loadAllLecons();
  S.leconsAllCache = all;
  const parentId = S.leconsPath.length? S.leconsPath[S.leconsPath.length-1].id : null;
  const children = buildLeconsChildren(all, parentId);
  el.innerHTML = `
    <div class="card">
      <h2>Enseignements</h2>
      ${leconsBreadcrumbHtml('clientLecons')}
    </div>
    <div class="card">
      ${children.length? children.map(n=>`<div class="seance-row" style="cursor:pointer" onclick="${n.type==='dossier'?`clientLeconsOpen('${n.id}')`:`clientViewRessource('${n.id}')`}"><span>${n.type==='dossier'?ICON_FOLDER:ICON_DOC}${n.nom}</span></div>`).join('') : '<div class="empty">Vide</div>'}
    </div>
  `;
}
function clientLeconsOpen(id){
  const n = (S.leconsAllCache||[]).find(x=>x.id===id);
  S.leconsPath.push({id, nom: n?n.nom:''});
  renderClientTabContent();
}
function clientLeconsRoot(){ S.leconsPath=[]; renderClientTabContent(); }
function clientLeconsTo(idx){ S.leconsPath = S.leconsPath.slice(0, idx+1); renderClientTabContent(); }

// ---- CHALLENGES ----
async function loadAllChallenges(){
  const snap = await db.collection('challenges').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadAllParticipations(){
  if(FIREBASE_MODE && FB.role==='client'){
    const snap = await db.collection('challenge_participations').where('clientId','==',FB.clientId).get();
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  const snap = await db.collection('challenge_participations').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function renderChallengesTab(){
  const el = document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [challenges, participations] = await Promise.all([loadAllChallenges(), loadAllParticipations()]);
  const today = todayStr();
  const sorted = challenges.sort((a,b)=>b.dateDebut.localeCompare(a.dateDebut));
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>Challenges <button class="btn btn-primary btn-sm" onclick="openNewChallenge()">Nouveau challenge</button></h2>
    </div>
    ${sorted.length? sorted.map(ch=>{
      const parts = participations.filter(p=>p.challengeId===ch.id);
      const termine = ch.dateFin < today;
      const cibleLabel = ch.clientsCible==='all' ? 'Tous les clients' : ch.clientsCible.map(id=>{ const cl=S.clients.find(c=>c.id===id); return cl?clientName(cl):'?'; }).join(', ');
      return `<div class="card">
        <h2>${ch.nom} ${termine?'<span class="badge lock">Terminé</span>':'<span class="badge plan">En cours</span>'}</h2>
        <p class="empty">${fmtDate(ch.dateDebut)} → ${fmtDate(ch.dateFin)} · ${cibleLabel}</p>
        ${ch.description?`<p>${ch.description}</p>`:''}
        <div style="margin-top:8px">
          ${parts.length? parts.map(p=>{ const cl=S.clients.find(c=>c.id===p.clientId); return `<div class="empty">${cl?clientName(cl):'?'} · ${p.statut==='reussi'?'Réussi':'Non réussi'}</div>`; }).join('') : '<div class="empty">Aucune déclaration pour le moment</div>'}
        </div>
        <button class="btn btn-danger btn-sm" style="margin-top:8px" onclick="askDelete('deleteChallenge','${ch.id}','Supprimer ce challenge ?')">Supprimer</button>
      </div>`;
    }).join('') : '<div class="card"><div class="empty">Aucun challenge créé</div></div>'}
  `;
}
function openNewChallenge(){
  openModal(`
    <h3>Nouveau challenge</h3>
    <label>Nom</label><input id="ch-nom" placeholder="0 sucre rapide">
    <label>Description</label><textarea id="ch-description" rows="2"></textarea>
    <div class="formrow">
      <div><label>Date de début</label><input type="date" id="ch-debut" value="${todayStr()}"></div>
      <div><label>Date de fin</label><input type="date" id="ch-fin"></div>
    </div>
    <label>Participants</label>
    <select id="ch-cible" onchange="toggleChCibleClients()">
      <option value="all">Tous les clients</option>
      <option value="select">Sélectionner des clients</option>
    </select>
    <div id="ch-clients-block" style="display:none;max-height:160px;overflow-y:auto;margin-top:8px">
      ${S.clients.map(c=>`<div class="checkline"><input type="checkbox" id="ch-cl-${c.id}"><label style="margin:0">${clientName(c)}</label></div>`).join('')}
    </div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveChallenge()">Créer</button></div>
  `);
}
function toggleChCibleClients(){
  document.getElementById('ch-clients-block').style.display = val('ch-cible')==='select'?'block':'none';
}
async function saveChallenge(){
  const nom = val('ch-nom'), description = val('ch-description'), dateDebut = val('ch-debut'), dateFin = val('ch-fin');
  if(!nom || !dateFin){ toast('Nom et date de fin requis'); return; }
  let clientsCible = 'all';
  if(val('ch-cible')==='select'){
    clientsCible = S.clients.filter(c=>document.getElementById('ch-cl-'+c.id) && document.getElementById('ch-cl-'+c.id).checked).map(c=>c.id);
  }
  await db.collection('challenges').add({nom, description, dateDebut, dateFin, clientsCible, createdAt:todayStr()});
  closeModal(); toast('Challenge créé'); renderChallengesTab();
}
async function deleteChallenge(id){
  const parts = await db.collection('challenge_participations').where('challengeId','==',id).get();
  await Promise.all(parts.docs.map(d=>db.doc('challenge_participations/'+d.id).delete()));
  await db.doc('challenges/'+id).delete();
  renderChallengesTab();
}
async function renderClientChallenges(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [challenges, participations] = await Promise.all([loadAllChallenges(), loadAllParticipations()]);
  const today = todayStr();
  const eligible = challenges.filter(ch=>ch.clientsCible==='all' || ch.clientsCible.includes(c.id));
  const actifs = eligible.filter(ch=>ch.dateFin>=today).sort((a,b)=>a.dateFin.localeCompare(b.dateFin));
  const termines = eligible.filter(ch=>ch.dateFin<today).sort((a,b)=>b.dateFin.localeCompare(a.dateFin));
  el.innerHTML = `
    <div class="card">
      <h2>Challenges en cours</h2>
      ${actifs.length? actifs.map(ch=>{
        const mine = participations.find(p=>p.challengeId===ch.id && p.clientId===c.id);
        return `<div class="card" style="background:var(--bg)">
          <b>${ch.nom}</b> <span class="empty">(${fmtDate(ch.dateDebut)} → ${fmtDate(ch.dateFin)})</span>
          ${ch.description?`<p>${ch.description}</p>`:''}
          ${mine? `<div class="badge ${mine.statut==='reussi'?'ok':'warn'}">${mine.statut==='reussi'?'Réussi':'Non réussi'}</div>`
                : `<div class="modalbtns"><button class="btn btn-primary btn-sm" onclick="declareChallenge('${ch.id}','reussi')">Je l'ai réussi</button><button class="btn btn-secondary btn-sm" onclick="declareChallenge('${ch.id}','echec')">Pas réussi</button></div>`}
        </div>`;
      }).join('') : '<div class="empty">Aucun challenge en cours</div>'}
    </div>
    <div class="card">
      <h2>Challenges terminés · classement</h2>
      ${termines.length? termines.map(ch=>{
        const reussis = participations.filter(p=>p.challengeId===ch.id && p.statut==='reussi');
        return `<div class="card" style="background:var(--bg)">
          <b>${ch.nom}</b>
          ${reussis.length? reussis.map(p=>{ const cl=S.clients.find(x=>x.id===p.clientId); return `<div class="empty">${cl?clientName(cl):'?'}</div>`; }).join('') : '<div class="empty">Personne n\u2019a validé ce challenge</div>'}
        </div>`;
      }).join('') : '<div class="empty">Aucun challenge terminé</div>'}
    </div>
  `;
}
async function declareChallenge(challengeId, statut){
  await db.doc('challenge_participations/'+challengeId+'_'+S.currentClientObj.id).set({challengeId, clientId:S.currentClientObj.id, statut, declaredAt:todayStr()});
  toast('Déclaration enregistrée'); renderClientTabContent();
}

// ---- NIVEAUX (points, paliers, leçons requises, récompenses) ----
const POINTS_PAR_ENTRAINEMENT = 10;
const POINTS_PAR_NIVEAU = 100;
async function loadAllNiveauxConfig(){
  const snap = await db.collection('niveaux_config').get();
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.niveau-b.niveau);
}
async function loadLeconsVuesForClient(clientId){
  const snap = await db.collection('lecons_vues').where('clientId','==',clientId).get();
  return snap.docs.map(d=>d.data());
}
function clientViewRessource(id){
  leconsViewRessource(id);
  if(S.currentClientObj){
    db.doc('lecons_vues/'+S.currentClientObj.id+'_'+id).set({clientId:S.currentClientObj.id, leconId:id, vuAt:todayStr()});
  }
}
async function computeClientLevel(clientId){
  const [logsSnap, niveaux, vues] = await Promise.all([
    db.collection('entrainement_logs').where('clientId','==',clientId).get(),
    loadAllNiveauxConfig(),
    loadLeconsVuesForClient(clientId)
  ]);
  const points = logsSnap.docs.length * POINTS_PAR_ENTRAINEMENT;
  const vuesSet = new Set(vues.map(v=>v.leconId));
  let currentLevel = 0;
  for(const nv of niveaux){
    const seuil = nv.niveau * POINTS_PAR_NIVEAU;
    if(points>=seuil && (!nv.leconRequiseId || vuesSet.has(nv.leconRequiseId))){ currentLevel = nv.niveau; }
    else break;
  }
  const nextNiveau = niveaux.find(n=>n.niveau===currentLevel+1) || null;
  return {points, currentLevel, niveaux, nextNiveau, vuesSet};
}
async function renderNiveauxTab(){
  const el = document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [niveaux, allLecons] = await Promise.all([loadAllNiveauxConfig(), loadAllLecons()]);
  const ressources = flattenRessourcesList(allLecons);
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>Niveaux</h2>
      <p class="empty">Chaque entraînement validé rapporte ${POINTS_PAR_ENTRAINEMENT} points. ${POINTS_PAR_NIVEAU} points sont nécessaires par niveau, en plus d'avoir ouvert la leçon requise si une est définie.</p>
      <button class="btn btn-primary btn-sm" onclick="openNiveauModal()">Nouveau niveau</button>
    </div>
    ${niveaux.length? niveaux.map(nv=>`
      <div class="card">
        <h2>Niveau ${nv.niveau} <span class="empty">(${nv.niveau*POINTS_PAR_NIVEAU} points)</span></h2>
        <p>Leçon requise : ${nv.leconRequiseId ? ((ressources.find(r=>r.id===nv.leconRequiseId)||{}).label||'–') : 'Aucune'}</p>
        ${nv.recompenseTexte?`<p>Récompense : ${nv.recompenseTexte}</p>`:''}
        <button class="btn btn-secondary btn-sm" onclick="openNiveauModal('${nv.id}')">Modifier</button>
        <button class="btn btn-danger btn-sm" onclick="askDelete('deleteNiveau','${nv.id}','Supprimer ce niveau ?')">Supprimer</button>
      </div>
    `).join('') : '<div class="card"><div class="empty">Aucun niveau configuré</div></div>'}
  `;
}
async function openNiveauModal(editId){
  const [niveaux, allLecons] = await Promise.all([loadAllNiveauxConfig(), loadAllLecons()]);
  const nv = editId ? niveaux.find(x=>x.id===editId) : null;
  const ressources = flattenRessourcesList(allLecons);
  openModal(`
    <h3>${nv?'Modifier':'Nouveau'} niveau</h3>
    <label>Numéro de niveau</label><input type="number" id="nv-numero" value="${nv?nv.niveau:''}">
    <label>Leçon requise (optionnel)</label>
    <select id="nv-lecon"><option value="">Aucune</option>${ressources.map(r=>`<option value="${r.id}" ${nv&&nv.leconRequiseId===r.id?'selected':''}>${r.label}</option>`).join('')}</select>
    <label>Récompense (texte libre)</label><textarea id="nv-recompense" rows="2">${nv?(nv.recompenseTexte||''):''}</textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveNiveau(${nv?`'${nv.id}'`:'null'})">Enregistrer</button></div>
  `);
}
async function saveNiveau(editId){
  const niveau = parseInt(val('nv-numero')||'0',10);
  const leconRequiseId = val('nv-lecon')||null;
  const recompenseTexte = val('nv-recompense');
  if(!niveau || niveau<1){ toast('Numéro de niveau invalide'); return; }
  if(editId){ await db.doc('niveaux_config/'+editId).update({niveau, leconRequiseId, recompenseTexte}); }
  else{ await db.collection('niveaux_config').add({niveau, leconRequiseId, recompenseTexte}); }
  closeModal(); toast('Enregistré'); renderNiveauxTab();
}
async function deleteNiveau(id){
  await db.doc('niveaux_config/'+id).delete();
  renderNiveauxTab();
}

// ---- PLANNING ALIMENTAIRE ----
async function loadAllProduitsBib(){
  const snap = await db.collection('produits_bib').get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function loadJournalForClient(clientId){
  const snap = await db.collection('journal_alimentaire').where('clientId','==',clientId).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
function currentDietSource(){
  const bilan = S.bilan||{};
  const today = todayStr();
  const withDiet = (S.evolutions||[]).filter(e=>e.date<=today && e.proteines).sort((a,b)=>b.date.localeCompare(a.date));
  return withDiet.length ? withDiet[0] : bilan;
}
function qteStr(e){ return (e.quantiteG===null || e.quantiteG===undefined) ? '' : ' · '+e.quantiteG+' g'; }
function journalDayTotals(dayEntries){
  return dayEntries.reduce((acc,e)=>({kcal:acc.kcal+(e.kcal||0), proteines:acc.proteines+(e.proteines||0), lipides:acc.lipides+(e.lipides||0)}), {kcal:0,proteines:0,lipides:0});
}
function toggleJournalDetail(d){
  const el = document.getElementById('jd-'+d);
  if(el) el.style.display = el.style.display==='none'?'block':'none';
}
function ciblesCardHtml(){
  const bilan=S.bilan||{}; const d=currentDietSource(); const typePlan=bilan.typePlan;
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcal = kcalField ? (parseFloat(d[kcalField])||0) : null;
  if(!(d && d.proteines)) return '<div class="card"><h2>Cibles du jour</h2><div class="empty">Pas encore de calcul : lancez-le depuis le Bilan.</div></div>';
  return `<div class="card"><h2>${ico('target','green','sm')}Cibles du jour</h2><div class="grid">
      <div class="stat"><span class="n">${kcal!==null? kcal : '–'}</span><span class="l">kcal${kcal===null?' (choisir un plan)':''}</span></div>
      <div class="stat"><span class="n">${d.proteines} g</span><span class="l">protéines</span></div>
      <div class="stat"><span class="n">${d.lipides} g</span><span class="l">lipides</span></div>
    </div><p class="note" style="margin-top:8px">${d===bilan?'Calculées au bilan':'Recalculées à la pesée du '+fmtDate(d.date)}.</p></div>`;
}
async function renderPlanningAlimentaire(el,c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const entries = await loadJournalForClient(c.id);
  const b = S.bilan||{};
  const byDay = {};
  entries.forEach(e=>{ (byDay[e.date]=byDay[e.date]||[]).push(e); });
  const days = Object.keys(byDay).sort().reverse();
  el.innerHTML = `
    ${ciblesCardHtml()}
    <div class="card">
      <h2>Type de plan alimentaire</h2>
      <select id="pa-typeplan">
        <option value="">-- Non défini --</option>
        ${Object.entries(TYPE_PLAN_LABELS).map(([k,l])=>`<option value="${k}" ${b.typePlan===k?'selected':''}>${l}</option>`).join('')}
      </select>
      <div class="modalbtns"><button class="btn btn-primary btn-sm" onclick="saveTypePlan()">Enregistrer</button></div>
    </div>
    <div class="card">
      <h2>Journal du client</h2>
      ${days.length? days.map(d=>{
        const t = journalDayTotals(byDay[d]);
        return `<div class="seance-row" style="flex-direction:column;align-items:stretch;cursor:pointer" onclick="toggleJournalDetail('${d}')">
          <div style="display:flex;justify-content:space-between"><span>${fmtDate(d)}</span><span>${Math.round(t.kcal)} kcal · ${Math.round(t.proteines)}g prot · ${Math.round(t.lipides)}g lip</span></div>
          <div id="jd-${d}" style="display:none;margin-top:6px">${byDay[d].map(e=>`<div class="empty">${e.produitNom}${qteStr(e)} (${Math.round(e.kcal)} kcal)</div>`).join('')}</div>
        </div>`;
      }).join('') : '<div class="empty">Aucune entrée</div>'}
    </div>
  `;
}
async function saveTypePlan(){
  const typePlan = val('pa-typeplan');
  await db.doc('bilans/'+S.currentId).update({typePlan: typePlan||null});
  S.bilan = {...S.bilan, typePlan: typePlan||null};
  toast('Enregistré'); renderTab();
}

async function renderEntrainement(el,c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [bib, bibCycles, allAttr, logsSnap] = await Promise.all([
    loadAllMouvementsBib(),
    loadAllCyclesBib(),
    loadAllAttributionsForClient(c.id),
    db.collection('entrainement_logs').where('clientId','==',c.id).get()
  ]);
  S.bibCache = bib;
  const attribution = allAttr.find(a=>a.active) || null;
  const pastAttributions = allAttr.filter(a=>!a.active);
  const logs = logsSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.date.localeCompare(a.date));
  const cycleSelectHtml = `
    <div class="formrow">
      <div style="flex:2"><select id="attr-cycle-select">${bibCycles.length?bibCycles.map(t=>`<option value="${t.id}">${t.nom}</option>`).join(''):'<option value="">Aucun modèle · créez-en un dans l\'onglet Cycles</option>'}</select></div>
      <div><button class="btn ${attribution?'btn-secondary':'btn-primary'}" onclick="assignCycleToClient(val('attr-cycle-select'))">${attribution?'Changer de cycle':'Attribuer'}</button></div>
    </div>
  `;
  el.innerHTML = `
    <div class="card">
      <h2>${ico('training','orange','sm')}Programme</h2>
      ${attribution? `
        <p><b>${attribution.cycleNom}</b> <span class="note">· ${attribution.entrainements.length} entraînements en boucle</span></p>
        <div class="row-actions" style="margin-bottom:6px"><button class="btn btn-secondary btn-sm" onclick="bulkValidateAttribution('${attribution.id}')">Tout valider</button><button class="btn btn-secondary btn-sm" onclick="openChangeCycle()">Changer de cycle</button></div>
        ${attribution.entrainements.map((ent,i)=>`
          <details class="card fold" ${i===attribution.currentEntrainementIndex?'open':''}>
            <summary><span>${i+1}. ${ent.nom}</span><span class="side">${i===attribution.currentEntrainementIndex?'<span class="badge plan">Prochain</span>':''}${ent.valide?'<span class="badge ok">Validé</span>':'<span class="badge warn">À valider</span>'}</span></summary>
            ${ent.mouvements.map(mv=>`<div class="empty">${mv.nom} · ${mvSpec(mv)}${mv.surchargeProgressive?' <span class="tag">progressif</span>':''}</div>`).join('')}
            <button class="btn ${ent.valide?'btn-secondary':'btn-primary'} btn-sm" style="margin-top:8px" onclick="openValidateEntrainementAttr('${attribution.id}',${i})">${ent.valide?'Modifier les charges':'Valider'}</button>
          </details>
        `).join('')}
      ` : `
        <p class="empty">Aucun cycle attribué.</p>
        ${cycleSelectHtml}
      `}
    </div>
    ${logs.length? `<details class="card fold"><summary>Entraînements réalisés (${logs.length})</summary>
      ${logs.map(l=>`<div class="seance-row" style="flex-direction:column;align-items:stretch"><b>${fmtDate(l.date)} · ${l.entrainementNom}${l.seanceId?'':' <span class="tag">seul</span>'}</b><span class="note">${l.resultats.map(r=>r.nom+' : '+(typeof r.repsMin==='number'?r.repsMin:'fait')+(r.commentaire?' (« '+r.commentaire+' »)':'')).join(' · ')}</span></div>`).join('')}
    </details>` : ''}
    ${pastAttributions.length? `<div class="card"><h2>Cycles précédents</h2>${pastAttributions.map(a=>`<div class="seance-row"><span>${a.cycleNom}</span></div>`).join('')}</div>` : ''}
  `;
}
async function openChangeCycle(){
  const bibCycles = await loadAllCyclesBib();
  openModal(`<h3>Changer de cycle</h3><p class="note">Le cycle actuel sera archivé ; le nouveau repart au premier entraînement, avec ses charges de départ.</p>
    <label>Modèle</label><select id="attr-cycle-select">${bibCycles.map(t=>`<option value="${t.id}">${t.nom}</option>`).join('')}</select>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="closeModal();assignCycleToClient(val('attr-cycle-select'))">Attribuer</button></div>`);
}
async function assignCycleToClient(cycleBibId){
  if(!cycleBibId){ toast('Sélectionnez un modèle'); return; }
  const bib = await loadAllCyclesBib();
  const tpl = bib.find(t=>t.id===cycleBibId);
  if(!tpl) return;
  const existing = await loadActiveAttribution(S.currentId);
  if(existing) await db.doc('attributions/'+existing.id).update({active:false});
  const entrainements = JSON.parse(JSON.stringify(tpl.entrainements)).map(ent=>({
    nom: ent.nom,
    valide: false,
    mouvements: ent.mouvements.map(mv=>({...mv, chargeActuelle: mv.chargeDepart}))
  }));
  await db.collection('attributions').add({clientId:S.currentId, cycleBibId, cycleNom:tpl.nom, entrainements, currentEntrainementIndex:0, active:true, createdAt:todayStr()});
  toast('Cycle attribué'); renderTab();
}
async function bulkValidateAttribution(attributionId){
  const doc = await db.doc('attributions/'+attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  attr.entrainements.forEach(ent=>ent.valide=true);
  await db.doc('attributions/'+attributionId).update({entrainements:attr.entrainements});
  toast('Tous les entraînements validés'); renderTab();
}
async function openValidateEntrainementAttr(attributionId, entIdx){
  const doc = await db.doc('attributions/'+attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const ent = attr.entrainements[entIdx];
  S.validateCtx = {attributionId, entIdx};
  openModal(`
    <h3>Valider : ${ent.nom}</h3>
    ${ent.mouvements.map((mv,i)=>`
      <div style="border-bottom:1px solid var(--border);padding:8px 0">
        <b>${mv.nom}</b> · ${mvSpec(mv)}${mv.surchargeProgressive?' (seuil '+mv.repsSeuilBas+')':''}
        <label>Charge (kg)</label><input type="number" step="0.5" id="va-charge-${i}" value="${mv.chargeActuelle}">
      </div>
    `).join('')}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="confirmValidateEntrainementAttr()">Valider cet entraînement</button></div>
  `);
}
async function confirmValidateEntrainementAttr(){
  const {attributionId, entIdx} = S.validateCtx;
  const doc = await db.doc('attributions/'+attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const ent = attr.entrainements[entIdx];
  ent.mouvements.forEach((mv,i)=>{ const v=val('va-charge-'+i); if(v!==null) mv.chargeActuelle = parseFloat(v)||mv.chargeActuelle; });
  ent.valide = true;
  await db.doc('attributions/'+attributionId).update({entrainements:attr.entrainements});
  closeModal(); toast('Entraînement validé'); renderTab();
}
async function startNewCycleTemplate(){
  S.cycleBuilder = {id:null, nom:'Nouveau modèle', entrainements:[{nom:'Entraînement 1', mouvements:[]}]};
  S.bibCache = await loadAllMouvementsBib();
  renderCycleBuilder();
}
async function editCycleTemplate(id){
  const t = (await loadAllCyclesBib()).find(x=>x.id===id);
  if(!t) return;
  S.cycleBuilder = {id, nom:t.nom, entrainements:JSON.parse(JSON.stringify(t.entrainements))};
  S.bibCache = await loadAllMouvementsBib();
  renderCycleBuilder();
}
function captureCycleBuilder(){
  const b = S.cycleBuilder;
  if(!b || !document.getElementById('cb-template-nom')) return;
  b.nom = val('cb-template-nom');
  b.entrainements.forEach((ent,i)=>{ if(document.getElementById('ent-nom-'+i)) ent.nom = val('ent-nom-'+i); });
}
function addEntrainementToBuilder(){
  captureCycleBuilder();
  S.cycleBuilder.entrainements.push({nom:'Entraînement '+(S.cycleBuilder.entrainements.length+1), mouvements:[]});
  renderCycleBuilder();
}
function removeEntrainementFromBuilder(idx){
  captureCycleBuilder();
  S.cycleBuilder.entrainements.splice(idx,1);
  renderCycleBuilder();
}
function removeMouvementFromBuilder(entIdx, mvIdx){
  captureCycleBuilder();
  S.cycleBuilder.entrainements[entIdx].mouvements.splice(mvIdx,1);
  renderCycleBuilder();
}
function updateEntrainementNom(idx){
  S.cycleBuilder.entrainements[idx].nom = val('ent-nom-'+idx);
}
function renderCycleBuilder(){
  const el = document.getElementById('hometabcontent');
  const b = S.cycleBuilder;
  el.innerHTML = `
    <div class="card">
      <h2>${b.id?'Modifier le modèle':'Nouveau modèle de cycle'}</h2>
      <label>Nom du modèle</label><input id="cb-template-nom" value="${b.nom||''}">
      ${b.entrainements.map((ent,i)=>`
        <div class="card" style="background:var(--bg)">
          <label>Nom de l'entraînement (numéro ${i+1} dans la séquence)</label><input id="ent-nom-${i}" value="${ent.nom}" onchange="updateEntrainementNom(${i})">
          ${ent.mouvements.map((mv,j)=>`
            <div class="seance-row"><span>${mv.nom} · ${mvSpec(mv,'chargeDepart')}${mv.surchargeProgressive?' (seuil '+mv.repsSeuilBas+')':''}${mv.tempo?' · tempo '+mv.tempo:''}${mv.tempsRecup?' · récup '+mv.tempsRecup+' s':''}</span>
            <button class="btn btn-danger btn-sm" onclick="removeMouvementFromBuilder(${i},${j})">Retirer</button></div>
          `).join('')}
          <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="openAddMouvementModal(${i})">Ajouter un mouvement</button>
          ${b.entrainements.length>1?`<div style="margin-top:8px"><button class="btn btn-danger btn-sm" onclick="removeEntrainementFromBuilder(${i})">Supprimer cet entraînement</button></div>`:''}
        </div>
      `).join('')}
      <button class="btn btn-secondary btn-sm" onclick="addEntrainementToBuilder()">Ajouter un entraînement au cycle</button>
      <div class="modalbtns">
        <button class="btn btn-secondary" onclick="renderBibCyclesTab()">Annuler</button>
        <button class="btn btn-primary" onclick="saveCycle()">${b.id?'Enregistrer les modifications':'Enregistrer le modèle'}</button>
      </div>
    </div>
  `;
}
function openAddMouvementModal(entIdx){
  const bib = S.bibCache || [];
  openModal(`
    <h3>Ajouter un mouvement</h3>
    <label>Mouvement (bibliothèque)</label>
    <select id="mv-bib" onchange="onMvBibChange()">
      <option value="">-- Nouveau mouvement --</option>
      ${bib.map(m=>`<option value="${m.id}">${m.nom} (${m.groupeMusculaire||''})</option>`).join('')}
    </select>
    <div id="mv-new-fields">
      <label>Nom du mouvement</label><input id="mv-nom">
      <label>Groupe musculaire</label><input id="mv-groupe">
      <label>Type de travail</label><input id="mv-type" placeholder="cardio-vasculaire, force, explosivité, hypertrophie sarcoplasmique...">
    </div>
    <div class="checkline"><input type="checkbox" id="mv-surcharge" onchange="toggleMvSurcharge()"><label style="margin:0">Surcharge progressive</label></div>
    <div id="mv-methode-block" style="display:none">
      <label>Méthode</label>
      <select id="mv-methode" onchange="onMvMethodeChange()">
        <option value="6x12">6×12 (jusqu'à 8)</option>
        <option value="5x5">5×5 (jusqu'à 3)</option>
        <option value="perso">Personnalisé</option>
      </select>
      <label>Augmentation de charge par séance (kg)</label><input type="number" step="0.5" id="mv-augmentation" value="2.5">
    </div>
    <div class="formrow">
      <div><label>Séries</label><input type="number" id="mv-series" value="4"></div>
      <div><label>Répétitions cible</label><input type="number" id="mv-repsCible" value="10"></div>
      <div><label>Seuil bas (répétitions)</label><input type="number" id="mv-repsSeuilBas"></div>
    </div>
    <div class="formrow">
      <div><label>Charge de départ (kg)</label><input type="number" step="0.5" id="mv-charge" value="0"></div>
      <div><label>Temps (sec, si chronométré)</label><input type="number" id="mv-temps"></div>
    </div>
    <div class="formrow">
      <div><label>Tempo</label><input id="mv-tempo" placeholder="ex: 2-0-2-0"></div>
      <div><label>Récupération (sec)</label><input type="number" id="mv-recup" value="60"></div>
    </div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="confirmAddMouvement(${entIdx})">Ajouter</button></div>
  `);
}
function onMvBibChange(){
  const id = val('mv-bib');
  document.getElementById('mv-new-fields').style.display = id ? 'none':'block';
}
function toggleMvSurcharge(){
  document.getElementById('mv-methode-block').style.display = document.getElementById('mv-surcharge').checked ? 'block':'none';
}
function onMvMethodeChange(){
  const m = val('mv-methode');
  if(m==='perso') return;
  const p = PROGRESSION_METHODS[m];
  document.getElementById('mv-series').value = p.series;
  document.getElementById('mv-repsCible').value = p.repsCible;
  document.getElementById('mv-repsSeuilBas').value = p.repsSeuilBas;
}
async function confirmAddMouvement(entIdx){
  const bibId = val('mv-bib');
  let nom, groupe, type, ressourceId=null;
  if(bibId){
    const m = S.bibCache.find(x=>x.id===bibId);
    nom=m.nom; groupe=m.groupeMusculaire; type=m.typeTravail; ressourceId=m.ressourceId||null;
  } else {
    nom=val('mv-nom'); groupe=val('mv-groupe'); type=val('mv-type');
    if(!nom){ toast('Nom du mouvement requis'); return; }
    const ref = await db.collection('mouvements_bib').add({nom, groupeMusculaire:groupe, typeTravail:type, ressourceId:null});
    S.bibCache.push({id:ref.id, nom, groupeMusculaire:groupe, typeTravail:type, ressourceId:null});
  }
  const surcharge = document.getElementById('mv-surcharge').checked;
  const charge = parseFloat(val('mv-charge'))||0;
  const mv = {
    nom, groupeMusculaire:groupe, typeTravail:type, ressourceId,
    series: parseInt(val('mv-series')||'0',10), repsCible: parseInt(val('mv-repsCible')||'0',10), repsSeuilBas: parseInt(val('mv-repsSeuilBas')||'0',10),
    chargeDepart: charge, chargeActuelle: charge,
    tempsWork: val('mv-temps'), tempo: val('mv-tempo'), tempsRecup: val('mv-recup'),
    surchargeProgressive: surcharge, methode: surcharge?val('mv-methode'):null,
    augmentation: surcharge?(parseFloat(val('mv-augmentation'))||0):0
  };
  captureCycleBuilder();
  S.cycleBuilder.entrainements[entIdx].mouvements.push(mv);
  closeModal();
  renderCycleBuilder();
}
async function saveCycle(){
  captureCycleBuilder();
  const b = S.cycleBuilder;
  const nom = (b.nom||'').trim() || 'Modèle sans nom';
  if(b.id){
    await db.doc('cycles_bib/'+b.id).update({nom, entrainements:b.entrainements});
    toast('Modèle modifié');
  } else {
    await db.collection('cycles_bib').add({nom, entrainements:b.entrainements, createdAt:todayStr()});
    toast('Modèle enregistré');
  }
  S.cycleBuilder=null; renderBibCyclesTab();
}

// ---- SEANCE ----
async function renderSeance(el,c){
  const visibles = S.programmes.filter(p=>p.statut!=='annulee');
  const today = todayStr();
  const future = visibles.filter(p=>p.date>=today && p.statut==='prevue').sort((a,b)=>(a.date+(a.heure||'')).localeCompare(b.date+(b.heure||'')));
  const past = visibles.filter(p=>!(p.date>=today && p.statut==='prevue'));
  el.innerHTML = `
    <div class="section-head"><h2>${ico('planning','orange','sm')}À venir</h2><button class="btn btn-primary btn-sm" onclick="openNewSeanceModal()">Planifier une séance</button></div>
    ${future.length? `<div class="card">${future.map(p=>seanceCard(p)).join('')}</div>` : '<div class="card"><div class="empty">Aucune séance prévue.</div></div>'}
    ${past.length? `<div class="section-head"><h2>${ico('check','green','sm')}Passées</h2></div><div class="card">${past.slice(0,8).map(p=>seanceCard(p)).join('')}${past.length>8?`<details class="fold" style="margin-top:8px"><summary>${past.length-8} séances plus anciennes</summary>${past.slice(8).map(p=>seanceCard(p)).join('')}</details>`:''}</div>` : ''}
  `;
}
function openNewSeanceModal(){
  openModal(`<h3>Nouvelle séance</h3>${seanceForm()}`);
  toggleFormule();
}
function changeSeanceWeek(d){ S.seanceWeekOffset+=d; renderTab(); }

function seanceForm(){
  return `
    <label>Type de séance</label>
    <select id="s-type" onchange="toggleFormule()">
      <option value="avec">Avec coach, à domicile</option>
      <option value="sans">Sans coach</option>
    </select>
    <div class="formrow">
      <div><label>Date</label><input type="date" id="s-date" value="${todayStr()}"></div>
      <div id="s-heure-block"><label>Heure de début</label><input type="time" id="s-heure"></div>
    </div>
    <div id="s-avec-block">
      <label>Formule</label>
      <select id="s-formule">
        <option value="express">Express · ${EXPRESS_PRICE} € · 45 à 60 min</option>
        <option value="classique">Classique · ${CLASSIQUE_PRICE} € · 1 h 30 à 2 h</option>
      </select>
      <p class="note" style="margin-top:6px">Entre 9 h et 22 h, 30 min de trajet entre deux séances.</p>
    </div>
    <label>Résumé (optionnel)</label><input id="s-resume">
    <label>Notes (optionnel)</label><textarea id="s-notes" rows="2"></textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="createSeance()">Enregistrer</button></div>
  `;
}
function toggleFormule(){
  const type=val('s-type');
  const b=document.getElementById('s-avec-block'); if(b) b.style.display = type==='avec'?'block':'none';
  const h=document.getElementById('s-heure-block'); if(h) h.style.display = type==='avec'?'block':'none';
}
async function createSeance(){
  const type=val('s-type');
  const date=val('s-date');
  if(!date){toast('Date requise');return;}
  let data={clientId:S.currentId, date, resume:val('s-resume'), notes:val('s-notes'), type, statut:'prevue',
    attributionId:null, entrainementIndex:null, entrainementNom:null, entrainementValide:false};
  if(type==='sans'){
    data.formule=null; data.tarif=0; data.paiement=false; data.offert=false; data.heure=null;
  } else {
    const formule=val('s-formule');
    const heure=val('s-heure');
    const [allProg, allIndispos] = await Promise.all([loadAllProgrammes(), loadAllIndispos()]);
    const check = checkSlotAvailable(date, heure, formule, null, allProg, allIndispos);
    if(!check.ok){ toast(check.reason); return; }
    data.formule=formule; data.tarif = formule==='express'?EXPRESS_PRICE:CLASSIQUE_PRICE;
    data.offert=false; data.paiement=false;
    data.heure=heure;
    const attr = await loadActiveAttribution(S.currentId);
    if(attr){
      const ent = attr.entrainements[attr.currentEntrainementIndex];
      data.attributionId = attr.id; data.entrainementIndex = attr.currentEntrainementIndex; data.entrainementNom = ent.nom;
    }
  }
  await db.collection('programmes').add(data);
  closeModal(); await loadClientData(S.currentId); renderTab(); toast('Séance enregistrée');
}
function seanceCard(p){
  const locked = p.type==='avec' && p.paiement;
  const isAnnulee = p.statut==='annulee';
  let head = p.type==='sans' ? 'Sans coach' : (p.formule==='express'?'Coaching Express':'Coaching Classique');
  let payBadge = '';
  if(p.type==='avec'){
    if(p.offert) payBadge = '<span class="badge ok">Offerte</span>';
    else payBadge = p.paiement?`<span class="badge ok">Payée · ${p.tarif} €</span>`:`<span class="badge warn">${p.tarif} € à encaisser</span>`;
  }
  let statutBadge = isAnnulee?'<span class="badge lock">Annulée</span>':(p.statut==='prevue'?'':'<span class="badge ok">Faite</span>');
  let actions;
  if(isAnnulee){
    actions = '<span class="badge lock">Annulée, non comptabilisée</span>';
  } else if(locked){
    actions = `<button class="btn btn-secondary btn-sm" onclick="confirmCancelSeanceLocked('${p.id}')">Annuler</button>`;
  } else {
    actions = `
        ${p.statut==='prevue' ? `<button class="btn btn-primary btn-sm" onclick="markSeanceFaite('${p.id}')">Séance faite</button>` : ''}
        ${p.type==='avec' && !p.paiement && p.statut!=='prevue' ? `<button class="btn btn-primary btn-sm" onclick="markSeancePaid('${p.id}')">Encaisser</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="openSeanceMore('${p.id}')">Plus</button>
      `;
  }
  const entrainementInfo = p.entrainementNom ? `<div class="empty">Entraînement prévu : <b>${p.entrainementNom}</b> ${p.entrainementValide?'<span class="badge ok">Validé</span>':''}</div>` : '';
  const validerBtn = (p.type==='avec' && p.attributionId && !p.entrainementValide && !isAnnulee && (p.statut==='faite' || p.date<=todayStr())) ? `<div style="margin-top:6px"><button class="btn btn-primary btn-sm" onclick="openValiderEntrainementSeance('${p.id}')">Valider l'entraînement moi-même</button></div>` : '';
  return `<div class="seance-row" style="flex-direction:column;align-items:stretch">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <b>${fmtDate(p.date)} ${p.heure?('· '+p.heure+' – '+heureFin(p.heure,p.formule)):''} · ${head}</b>
      <span>${statutBadge} ${payBadge}</span>
    </div>
    ${p.resume?`<div>${p.resume}</div>`:''}
    ${p.notes?`<div class="empty">${p.notes}</div>`:''}
    ${entrainementInfo}
    ${validerBtn}
    <div class="row-actions">${actions}</div>
  </div>`;
}
async function markSeancePaid(id){
  await db.doc('programmes/'+id).update({paiement:true});
  await loadClientData(S.currentId); renderTab(); toast('Paiement validé');
}
async function markSeanceOfferte(id){
  await db.doc('programmes/'+id).update({offert:true, paiement:true, tarif:0});
  await loadClientData(S.currentId); renderTab(); toast('Séance marquée offerte');
}
async function markSeanceFaite(id){
  await db.doc('programmes/'+id).update({statut:'faite'});
  await loadClientData(S.currentId); renderTab();
}
async function cancelSeance(id){
  await db.doc('programmes/'+id).update({statut:'annulee'});
  await loadClientData(S.currentId); renderTab();
}
function confirmCancelSeanceLocked(id){
  openModal(`<h3>Annuler cette séance ?</h3><p>À utiliser en cas d'erreur de saisie : le montant ne sera plus comptabilisé, la séance reste conservée avec le statut « Annulée ».</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Retour</button><button class="btn btn-danger" onclick="cancelSeanceConfirmed('${id}')">Confirmer l'annulation</button></div>`);
}
async function cancelSeanceConfirmed(id){
  await db.doc('programmes/'+id).update({statut:'annulee'});
  closeModal(); await loadClientData(S.currentId); renderTab();
}
function confirmDeleteSeance(id){
  openModal(`<h3>Supprimer cette séance ?</h3><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="deleteSeance('${id}')">Supprimer</button></div>`);
}
async function deleteSeance(id){ await db.doc('programmes/'+id).delete(); closeModal(); await loadClientData(S.currentId); renderTab(); }
function openSeanceMore(id){
  const p = S.programmes.find(x=>x.id===id); if(!p) return;
  openModal(`<h3>${fmtDate(p.date)}${p.heure?' · '+p.heure:''}</h3>
    <div class="menu" style="margin:0">
      ${p.type==='avec' && !p.paiement ? `<div class="item" onclick="closeModal();markSeancePaid('${id}')"><span class="body"><span class="title">Encaisser ${p.tarif} €</span></span>${ICONS.chev}</div><div class="item" onclick="closeModal();markSeanceOfferte('${id}')"><span class="body"><span class="title">Offrir la séance</span><span class="sub">Compte comme une séance, tarif 0 €</span></span>${ICONS.chev}</div>`:''}
      ${p.statut==='prevue' ? `<div class="item" onclick="closeModal();markSeanceFaite('${id}')"><span class="body"><span class="title">Marquer comme faite</span></span>${ICONS.chev}</div>`:''}
      <div class="item" onclick="closeModal();openEditSeance('${id}')"><span class="body"><span class="title">Modifier</span><span class="sub">Date, heure, formule, notes</span></span>${ICONS.chev}</div>
      <div class="item" onclick="closeModal();cancelSeance('${id}')"><span class="body"><span class="title">Annuler la séance</span><span class="sub">Conservée, montant non comptabilisé</span></span>${ICONS.chev}</div>
      <div class="item" onclick="closeModal();confirmDeleteSeance('${id}')"><span class="body"><span class="title" style="color:var(--red)">Supprimer</span></span>${ICONS.chev}</div>
    </div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Fermer</button></div>`);
}
function openEditSeance(id){
  const p = S.programmes.find(x=>x.id===id);
  openModal(`
    <h3>Modifier la séance</h3>
    <label>Date</label><input type="date" id="es-date" value="${p.date}">
    <label>Résumé</label><input id="es-resume" value="${p.resume||''}">
    <label>Notes</label><textarea id="es-notes" rows="2">${p.notes||''}</textarea>
    ${p.type==='avec'?`
    <label>Formule</label>
    <select id="es-formule">
      <option value="express" ${p.formule==='express'?'selected':''}>Coaching Express 60 € - 45 à 60 min</option>
      <option value="classique" ${p.formule==='classique'?'selected':''}>Coaching Classique 90 € - 90 à 120 min</option>
    </select>
    <label>Heure de début (obligatoire, entre 9h et 22h)</label><input type="time" id="es-heure" value="${p.heure||''}">
    `:''}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveEditSeance('${id}')">Enregistrer</button></div>
  `);
}
async function saveEditSeance(id){
  const p = S.programmes.find(x=>x.id===id);
  let data={date:val('es-date'), resume:val('es-resume'), notes:val('es-notes')};
  if(p.type==='avec'){
    const formule=val('es-formule');
    const heure=val('es-heure');
    const [allProg, allIndispos] = await Promise.all([loadAllProgrammes(), loadAllIndispos()]);
    const check = checkSlotAvailable(data.date, heure, formule, id, allProg, allIndispos);
    if(!check.ok){ toast(check.reason); return; }
    data.formule=formule; data.heure=heure; data.tarif = formule==='express'?EXPRESS_PRICE:CLASSIQUE_PRICE;
    data.paiement=false; data.offert=false;
  }
  await db.doc('programmes/'+id).update(data);
  closeModal(); await loadClientData(S.currentId); renderTab(); toast('Enregistré avec succès');
}
async function openValiderEntrainementSeance(seanceId){
  const p = S.programmes.find(x=>x.id===seanceId);
  if(!p || !p.attributionId) return;
  const doc = await db.doc('attributions/'+p.attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const entIdx = attr.currentEntrainementIndex;
  const ent = attr.entrainements[entIdx];
  if(!ent.valide){ toast("Cet entraînement n'est pas encore validé pour le client."); return; }
  S.coachValidateCtx = {seanceId, attributionId:attr.id, entIdx, entNom:ent.nom, clientId:p.clientId};
  openModal(`
    <h3>Valider : ${ent.nom}</h3>
    ${ent.mouvements.map((mv,i)=>`
      <div style="border-bottom:1px solid var(--border);padding:8px 0">
        <b>${mv.nom}</b> · ${mvSpec(mv)}
        <label>Répétitions minimales réalisées</label><input type="number" id="cv-reps-${i}">
        <label>Commentaire</label><input id="cv-comment-${i}">
      </div>
    `).join('')}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="confirmValiderEntrainementSeance()">Valider</button></div>
  `);
}
async function confirmValiderEntrainementSeance(){
  const ctx = S.coachValidateCtx;
  const doc = await db.doc('attributions/'+ctx.attributionId).get();
  const attr = {id:doc.id, ...doc.data()};
  const ent = attr.entrainements[ctx.entIdx];
  if(!ent || attr.currentEntrainementIndex!==ctx.entIdx){ closeModal(); toast('Cet entraînement a déjà été validé.'); await loadClientData(S.currentId); renderTab(); return; }
  const resultats = readRepsResults(ent, 'cv-reps-', 'cv-comment-');
  if(!resultats) return;
  await processEntrainementLog(ctx.clientId, ctx.attributionId, ctx.entIdx, ctx.entNom, resultats, ctx.seanceId);
  await db.doc('programmes/'+ctx.seanceId).update({entrainementValide:true, entrainementNom:ctx.entNom, entrainementIndex:ctx.entIdx});
  closeModal(); await loadClientData(S.currentId); renderTab(); toast('Entraînement validé');
}

// ---- SUIVI ----
async function renderSuivi(el,c){
  const cfg = S.suiviConfig;
  if(!cfg){
    el.innerHTML = `<div class="card"><h2>Suivi mensuel</h2><p class="note">Pas de suivi mensuel pour ce client. Démarrez-le pour facturer les périodes glissantes.</p>
      <label>Date de début du suivi</label><input type="date" id="sv-debut" value="${todayStr()}">
      <div class="modalbtns"><button class="btn btn-primary" onclick="startSuivi()">Démarrer</button></div>
    </div>`;
    return;
  }
  const periods = computePeriods(cfg);
  await ensurePeriodDocs(c.id);
  const rows = periods.map(p=>{
    const id=c.id+'_'+p.start;
    return S.suivis.find(s=>s.id===id) || {id, periodeDebut:p.start, periodeFin:p.end, nbSeances:0, tarif:89, paiement:false, annule:false};
  }).filter(p=>!p.annule).sort((a,b)=>b.periodeDebut.localeCompare(a.periodeDebut));
  const current = rows[0];
  const history = rows.slice(1);
  const stopped = cfg.segments && cfg.segments.length && cfg.segments[cfg.segments.length-1].end;

  function periodStatusHtml(p, isCurrent){
    if(p.annule) return '<span class="badge lock">Annulée, non comptabilisée</span>';
    if(p.paiement) return `<span class="badge ok">Payée</span>`;
    if(p.tarif===0) return `<span class="badge ok">Offerte</span>`;
    return `<button class="btn btn-primary btn-sm" onclick="markSuiviPaid('${p.id}')">Encaisser</button> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSuivi('${p.id}')">Annuler</button>`;
  }

  el.innerHTML = `
    <div class="card">
      <h2>${ico('cycle','blue','sm')}Suivi mensuel ${stopped?`<span class="badge lock">En pause depuis le ${fmtDate(cfg.segments[cfg.segments.length-1].end)}</span>`:'<span class="badge ok">Actif</span>'}</h2>
      ${current && !stopped ? `<div class="seance-row"><span><b>Période en cours</b> · ${fmtDate(current.periodeDebut)} → ${fmtDate(current.periodeFin)}<br><span class="note">${current.nbSeances} séance${current.nbSeances>1?'s':''} payée${current.nbSeances>1?'s':''} · ${current.tarif===0?'gratuit':euro(current.tarif)}</span></span><span>${periodStatusHtml(current, true)}</span></div>` : ''}
      <div class="row-actions" style="margin-top:10px">${stopped ? `<button class="btn btn-primary btn-sm" onclick="openRestartSuivi()">Redémarrer le suivi</button>` : `<button class="btn btn-secondary btn-sm" onclick="pauseSuivi()">Mettre en pause</button><button class="btn btn-danger btn-sm" onclick="confirmCancelEnCours()">Annuler la période en cours</button>`}</div>
      ${history.length? `<details class="fold" style="margin-top:12px"><summary>Périodes précédentes (${history.length})</summary>${history.map(h=>`
        <div class="seance-row"><span>${fmtDate(h.periodeDebut)} → ${fmtDate(h.periodeFin)} · ${h.nbSeances} séance${h.nbSeances>1?'s':''} payée${h.nbSeances>1?'s':''}</span>
        <span>${h.tarif===0&&!h.annule?'Gratuit':euro(h.tarif)} ${periodStatusHtml(h,false)}</span></div>`).join('')}</details>`:''}
    </div>
  `;
}
async function startSuivi(){
  const debut = val('sv-debut');
  const cfg = {segments:[{start:debut, end:null}]};
  await db.doc('suivi_config/'+S.currentId).set(cfg);
  S.suiviConfig = cfg; renderTab(); toast('Suivi démarré');
}
async function pauseSuivi(){
  const cfg = {...S.suiviConfig, segments:[...S.suiviConfig.segments]};
  cfg.segments[cfg.segments.length-1] = {...cfg.segments[cfg.segments.length-1], end: todayStr()};
  await db.doc('suivi_config/'+S.currentId).update({segments:cfg.segments});
  S.suiviConfig = cfg; renderTab(); toast('Suivi mis en pause');
}
function confirmCancelEnCours(){
  openModal(`<h3>Annuler le suivi en cours ?</h3><p>La période en cours ne sera pas facturée au client, et le suivi ne se renouvellera plus automatiquement. Vous pourrez le redémarrer plus tard.</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Retour</button><button class="btn btn-danger" onclick="cancelSuiviEnCours()">Confirmer l'annulation</button></div>`);
}
async function cancelSuiviEnCours(){
  const cfg = {...S.suiviConfig, segments:[...S.suiviConfig.segments]};
  const todayS = todayStr();
  cfg.segments[cfg.segments.length-1] = {...cfg.segments[cfg.segments.length-1], end: todayS};
  await db.doc('suivi_config/'+S.currentId).update({segments:cfg.segments});
  S.suiviConfig = cfg;
  const periods = computePeriods(cfg);
  if(periods.length){
    const last = periods[periods.length-1];
    const id = S.currentId+'_'+last.start;
    const paidCount = countPaidSessions(S.programmes, S.currentId, last);
    const rec = {clientId:S.currentId, periodeDebut:last.start, periodeFin:last.end, nbSeances:paidCount, tarif:suiviTarif(paidCount), paiement:false, annule:true};
    await db.collection('suivis').doc(id).set(rec);
    const idx = S.suivis.findIndex(s=>s.id===id);
    if(idx>=0) S.suivis[idx]={id,...rec}; else S.suivis.push({id,...rec});
  }
  closeModal(); renderTab(); toast('Suivi annulé');
}
function openRestartSuivi(){
  openModal(`<h3>Redémarrer le suivi</h3><label>Date de début</label><input type="date" id="sv-restart" value="${todayStr()}"><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="restartSuivi()">Redémarrer</button></div>`);
}
async function restartSuivi(){
  const date = val('sv-restart');
  const cfg = {...S.suiviConfig, segments:[...S.suiviConfig.segments, {start:date, end:null}]};
  await db.doc('suivi_config/'+S.currentId).update({segments:cfg.segments});
  S.suiviConfig = cfg; closeModal(); renderTab(); toast('Suivi redémarré');
}
async function markSuiviPaid(id){
  await db.doc('suivis/'+id).update({paiement:true});
  const s = S.suivis.find(x=>x.id===id); if(s) s.paiement=true;
  renderTab(); toast('Paiement validé');
}
function confirmCancelSuivi(id){
  openModal(`<h3>Annuler cette période de suivi ?</h3><p>Elle sera marquée annulée et ne sera plus due (utile en cas d'erreur lors de la création).</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Retour</button><button class="btn btn-danger" onclick="cancelSuiviPeriod('${id}')">Annuler la période</button></div>`);
}
async function cancelSuiviPeriod(id){
  await db.doc('suivis/'+id).update({annule:true});
  const s = S.suivis.find(x=>x.id===id); if(s) s.annule=true;
  closeModal(); renderTab();
}

// ---------- ANTI DOUBLE-CLIC / ERREURS ----------
// Chaque action qui écrit en base est verrouillée pendant son exécution : un second clic est ignoré.
// En cas d'erreur (réseau, base), l'utilisateur est prévenu au lieu d'un écran figé.
const LOCKED_ACTIONS = ['wizardNext','createSeance','saveEditSeance','envoyerDemande','accepterDemande','refuserDemande','traiterRdv','traiterResiliation','marquerLogVu',
  'submitEntrainementLog','confirmValiderEntrainementSeance','confirmValidateEntrainementAttr','bulkValidateAttribution','assignCycleToClient','saveCycle','confirmAddMouvement',
  'addJournalEntry','saveJournalEntryEdit','deleteJournalEntry','logRecetteToJournal','saveRecette','deleteRecette','saveProduitCoach','deleteProduit','seedProduitsBib',
  'saveEvo','deleteEvo','saveBilan','saveBilanGeneral','saveBilanCalories','saveBilanSection','validateBilan','saveTypePlan','saveIndispo','deleteIndispo','saveChallenge','deleteChallenge','declareChallenge','saveNiveau','deleteNiveau',
  'saveLeconDossier','saveLeconRessource','removeLeconVideo','deleteLeconCascade','seedLecons','seedMouvementsBib','seedMouvementsLecons','addMouvementBibGlobal','deleteMouvementBib','deleteCycleTemplate',
  'markSeancePaid','markSeanceOfferte','markSeanceFaite','cancelSeance','cancelSeanceConfirmed','deleteSeance','startSuivi','pauseSuivi','cancelSuiviEnCours','restartSuivi','markSuiviPaid','cancelSuiviPeriod',
  'sendResiliationDemande','deleteClient','exportBackup','markSeancePaidById','submitAuth','saveCoachSetup','saveNewCoachCode','saveSiteSettings','regenerateClientCode','openChangeCycle','importBackup','loadDemoData','fbLogin','fbSignup','fbLinkCode','fbForgotPassword','fbCoachResetPassword','fbGoogle','declarePaiement','confirmPaiement','savePaiementSettings'];
LOCKED_ACTIONS.forEach(name=>{
  const fn = window[name];
  if(typeof fn!=='function'){ console.warn('Action inconnue :', name); return; }
  let busy=false;
  window[name] = async function(...args){
    if(busy) return;
    busy=true;
    try{ return await fn.apply(this,args); }
    catch(e){ console.error(name, e); toast('Une erreur est survenue. Vérifiez votre connexion puis réessayez.'); }
    finally{ busy=false; }
  };
});

boot();
