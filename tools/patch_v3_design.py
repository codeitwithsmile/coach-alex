#!/usr/bin/env python3
"""Refonte visuelle (v3) : retire les emojis, nouveaux gabarits du rail, de l'accueil et des en-têtes."""
import pathlib, re, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
s = p.read_text(encoding='utf-8')
n = 0
def rep(old, new, count=1):
    global s, n
    c = s.count(old)
    if c != count: sys.exit(f'ERREUR: {c} occurrence(s) (attendu {count}) pour:\n{old[:150]}')
    s = s.replace(old, new); n += 1

# ---- Icônes (dossier / document) ----
rep('''// ---------- ÉCHAPPEMENT HTML ----------''', '''// ---------- ICÔNES ----------
const ICON_FOLDER = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
const ICON_DOC = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h5M10 17h5"/></svg>';

// ---------- ÉCHAPPEMENT HTML ----------''')

# ---- Accueil ----
rep('''    <div style="width:100%;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;position:relative;">
      <button class="btn btn-primary" style="position:fixed;top:16px;right:16px;" onclick="openConnexionChoice()">Connexion</button>
      <img src="${LOGO_SRC}" style="width:150px;height:150px;object-fit:contain;border-radius:16px;margin-bottom:14px;">
      <h1 style="margin:0">Coach Alex</h1>
    </div>''', '''    <div class="landing">
      <img src="${LOGO_SRC}" alt="Coach sportif Alex">
      <h1>Gestion Client</h1>
      <p class="sub">Coach sportif Alex — coaching à domicile</p>
      <button class="btn btn-primary" onclick="openConnexionChoice()">Se connecter</button>
    </div>''')
rep('''    <h3>Connexion</h3>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
      <button class="btn btn-primary" onclick="closeModal();showCoach()">👤 Coach Alex</button>
      <button class="btn btn-secondary" onclick="closeModal();showClientSpace()">🧑‍🤝‍🧑 Espace Client</button>''',
'''    <h3>Se connecter</h3>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
      <button class="btn btn-primary" onclick="closeModal();showCoach()">Espace coach</button>
      <button class="btn btn-secondary" onclick="closeModal();showClientSpace()">Espace client</button>''')

# ---- Espace client : entrée ----
rep('''  document.getElementById('app').innerHTML = `<div class="main" id="main" style="max-width:640px;margin:0 auto;width:100%;padding:20px;"></div>`;''',
    '''  document.getElementById('app').innerHTML = `<div class="main client-space" id="main" style="max-width:680px;margin:0 auto;width:100%;"></div>`;''')
rep('''    <div style="text-align:center;margin:16px 0"><img src="${LOGO_SRC}" style="width:80px;height:80px;object-fit:contain;border-radius:12px"></div>
    <div class="card">
      <h2>Espace Client</h2>
      <button class="btn btn-primary" style="width:100%;margin-bottom:10px" onclick="startClientQuestionnaire()">+ Nouveau client</button>
      <button class="btn btn-secondary" style="width:100%" onclick="renderClientProfileList()">Consulter mon profil</button>
    </div>
    <div style="text-align:center;margin-top:16px"><button class="btn btn-secondary btn-sm" onclick="showLanding()">← Retour</button></div>''',
'''    <div style="display:flex;align-items:center;gap:12px;margin:8px 0 20px"><img src="${LOGO_SRC}" style="width:48px;height:48px;object-fit:contain"><div><h1 style="margin:0;font-size:22px">Espace client</h1><div class="empty">Coach sportif Alex</div></div></div>
    <div class="card">
      <h2>Nouveau client</h2>
      <p class="empty">Remplissez le questionnaire de bilan initial et demandez un premier rendez-vous.</p>
      <div class="modalbtns" style="justify-content:flex-start"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Commencer le questionnaire</button></div>
    </div>
    <div class="card">
      <h2>Déjà client</h2>
      <p class="empty">Retrouvez votre suivi, votre planning et votre programme d\\u2019entraînement.</p>
      <div class="modalbtns" style="justify-content:flex-start"><button class="btn btn-secondary" onclick="renderClientProfileList()">Consulter mon profil</button></div>
    </div>
    <div style="margin-top:16px"><button class="btn btn-secondary btn-sm" onclick="showLanding()">Retour à l\\u2019accueil</button></div>''')
rep('''      <h2>Sélectionnez votre profil</h2>
      ${validated.length? validated.map(c=>`<div class="clientitem" style="border:1px solid var(--border);border-radius:10px;margin-bottom:8px" onclick="openClientProfileView('${c.id}')">${clientName(c)}</div>`).join('') : '<div class="empty">Aucun profil disponible pour le moment.</div>'}
    </div>
    <div style="text-align:center;margin-top:14px"><button class="btn btn-secondary btn-sm" onclick="renderClientEntry()">← Retour</button></div>''',
'''      <h2>Sélectionnez votre profil</h2>
      ${validated.length? validated.map(c=>`<div class="seance-row" style="cursor:pointer" onclick="openClientProfileView('${c.id}')"><b>${clientName(c)}</b><span class="empty">${c.objectif||''}</span></div>`).join('') : '<div class="empty">Aucun profil disponible pour le moment. Votre coach doit d\\u2019abord valider votre bilan.</div>'}
    </div>
    <div style="margin-top:14px"><button class="btn btn-secondary btn-sm" onclick="renderClientEntry()">Retour</button></div>''')
rep('''    <div class="card">
      <h1 style="margin:0 0 4px">${clientName(c)}</h1>
      <p class="empty">${c.objectif||''}</p>
    </div>
    <div class="tabs">''', '''    <div class="page-head">
      <div><h1>${clientName(c)}</h1><div class="meta">${c.objectif?`<span>${c.objectif}</span>`:''}</div></div>
      <button class="btn btn-secondary btn-sm" onclick="renderClientProfileList()">Changer de profil</button>
    </div>
    <div class="tabs">''')
rep('''    <div id="clienttabcontent"></div>
    <div style="text-align:center;margin-top:16px"><button class="btn btn-secondary btn-sm" onclick="renderClientProfileList()">← Retour à la liste</button></div>''',
    '''    <div id="clienttabcontent"></div>''')
rep('''      <h2>🎖️ Niveau ${levelInfo.currentLevel}</h2>
      <p>${levelInfo.points} points</p>''', '''      <h2>Niveau ${levelInfo.currentLevel} <span class="badge">${levelInfo.points} points</span></h2>''')
rep('''onclick="switchClientTab('lecons')">📖 Ouvrir mes enseignements</button>''', '''onclick="switchClientTab('lecons')">Ouvrir mes enseignements</button>''')
rep('''<p>🎁 ${currentNiveauCfg.recompenseTexte}</p>''', '''<p>Récompense : ${currentNiveauCfg.recompenseTexte}</p>''')
rep('''<div style="margin-top:6px">🏋️ <b>${ent.nom}</b>''', '''<div style="margin-top:6px"><b>${ent.nom}</b>''')
rep('''<div class="badge ok">✅ Aucun paiement en retard</div>''', '''<div class="badge ok">Aucun paiement en retard</div>''', 3)
rep('''      <h2>Paiements en retard</h2>
      <span class="badge ${unpaid.retard.length?'warn':'ok'}">${unpaid.retard.length}</span>
    </div>''', '''      <h2>Paiements en retard <span class="badge ${unpaid.retard.length?'warn':'ok'}">${unpaid.retard.length}</span></h2>
    </div>''')
rep('''      <p class="empty">⚠️ En raison des déplacements du coach à domicile, un battement de 30 minutes est nécessaire entre la fin d'une séance et le début de la suivante.</p>''',
    '''      <p class="note">Le coach se déplace à domicile : 30 minutes séparent la fin d\\u2019une séance et le début de la suivante.</p>''')
rep('''<div class="badge ok">✅ Demande envoyée, en attente de validation par votre coach.</div>''', '''<div class="badge ok">Demande envoyée, en attente de validation par votre coach.</div>''')
rep('''      <h2>🍽️ Mes recettes</h2>
      <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">+ Nouvelle recette</button>''',
    '''      <h2>Mes recettes <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></h2>''')
rep('''      <h2>🥗 ${ed?'Modifier un aliment':'Ajouter un aliment'}</h2>''', '''      <h2>${ed?'Modifier un aliment':'Ajouter un aliment'}</h2>''')
rep('''      <h2>🍽️ Recettes</h2>
      <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">+ Nouvelle recette</button>''',
    '''      <h2>Recettes <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></h2>''')
rep('''produitNom:'🍽️ '+r.nom''', '''produitNom:'Recette : '+r.nom''')
rep('''<div class="badge warn">🕐 En attente de validation de votre coach</div>''', '''<div class="badge warn">En attente de validation de votre coach</div>''')
rep('''>📖 Voir la leçon</button>''', '''>Voir la leçon</button>''')

# ---- Rail latéral coach ----
rep('''  app.innerHTML = `
  <div class="sidebar">
    <div class="brand" onclick="goHome()">
      <img src="${LOGO_SRC}" alt="Coach Alex">
      <span>Coach Alex</span>
      ${pendingCount>0?`<span class="badge warn" style="margin-left:4px">⚠️ ${pendingCount}</span>`:''}
    </div>
    <button class="btn btn-primary newclient" onclick="openNewClientModal()">+ Nouveau client</button>
    <div class="clientlist">
      ${S.clients.map(c=>`<div class="clientitem ${c.id===S.currentId?'active':''}" onclick="selectClient('${c.id}')">
        <div>${bilanMap[c.id] && !bilanMap[c.id].valide ? '🕐 ' : ''}${clientName(c)}</div><div class="obj">${c.objectif||''}</div>
      </div>`).join('') || '<div class="empty">Aucun client</div>'}
    </div>
    <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="showLanding()">Quitter</button>
  </div>
  <div class="main" id="main"></div>
  `;''', '''  app.innerHTML = `
  <aside class="sidebar">
    <div class="side-top">
      <div class="brand" onclick="goHome()" title="Tableau de bord">
        <img src="${LOGO_SRC}" alt="">
        <div class="brand-text"><span class="brand-name">Gestion Client</span><span class="brand-sub">Coach Alex</span></div>
        ${pendingCount>0?`<span class="count" title="${pendingCount} élément(s) à traiter">${pendingCount}</span>`:''}
      </div>
      <button class="btn btn-primary btn-sm newclient" onclick="openNewClientModal()">Nouveau client</button>
    </div>
    <div class="side-label"><span>Clients</span><span>${S.clients.length}</span></div>
    <div class="clientlist">
      ${S.clients.map(c=>`<div class="clientitem ${c.id===S.currentId?'active':''}" onclick="selectClient('${c.id}')">
        <div><div class="ci-name">${clientName(c)}</div><div class="obj">${c.objectif||''}</div></div>${bilanMap[c.id] && !bilanMap[c.id].valide ? '<span class="dot" title="Bilan à valider"></span>' : ''}
      </div>`).join('') || '<div class="empty">Aucun client pour le moment</div>'}
    </div>
    <div class="side-foot"><button class="btn btn-secondary btn-sm" onclick="showLanding()">Quitter l\\u2019espace coach</button></div>
  </aside>
  <div class="main" id="main"></div>
  `;''')

# ---- Onglets coach ----
rep('''      <div class="tab ${S.homeTab==='diet'?'active':''}" onclick="switchHomeTab('diet')">Calcul diét</div>''',
    '''      <div class="tab ${S.homeTab==='diet'?'active':''}" onclick="switchHomeTab('diet')">Calcul diététique</div>''')
rep('''      <h2>🧮 Calcul diét</h2>
      <p class="empty">Outil libre, sans lien avec un client précis.</p>''', '''      <h2>Calcul diététique</h2>
      <p class="empty">Outil libre, sans lien avec un client précis.</p>''')

# ---- Planning ----
rep('''      <h2>🏋️ Séances d'entraînement réalisées</h2>''', '''      <h2>Entraînements réalisés par les clients</h2>''')
rep('''      <h2>⚠️ Entraînements à préparer</h2>''', '''      <h2>Entraînements à préparer</h2>''')
rep('''<div class="badge ok">✅ Tout est prêt</div>''', '''<div class="badge ok">Tout est prêt</div>''')
rep('''      <h2>📩 Demandes de premier rendez-vous</h2>''', '''      <h2>Demandes de premier rendez-vous</h2>''')
rep('''${cl&&cl.telephone?'· 📞 '+cl.telephone:''}</b>
          <div>Type''', '''${cl&&cl.telephone?'<span class="empty"> · '+cl.telephone+'</span>':''}</b>
          <div>Type''')
rep('''      <h2>📩 Demandes de pause / résiliation</h2>''', '''      <h2>Demandes de pause ou de résiliation</h2>''')
rep('''${cl&&cl.telephone?'· 📞 '+cl.telephone:''} — ${r.type''', '''${cl&&cl.telephone?'<span class="empty"> · '+cl.telephone+'</span>':''} — ${r.type''')
rep('''      <h2>📩 Demandes de séance en attente</h2>''', '''      <h2>Demandes de séance en attente</h2>''')
rep('''      <h2>📅 Planning de la semaine</h2>
      <p class="empty">⚠️ Du fait de la nature des coachings à domicile, il y a 30 minutes d'indisponibilité entre la fin d'une séance et le début d'une prochaine pour les trajets 😉</p>''',
    '''      <h2>Planning de la semaine</h2>
      <p class="note">30 minutes de trajet sont réservées entre deux séances à domicile.</p>''')
rep('''<span class="badge plan">📅 Évolution programmée</span>''', '''<span class="badge plan">Évolution programmée</span>''')
rep('''      <h2>🚫 Indisponibilités</h2>
      <button class="btn btn-primary btn-sm" onclick="openAddIndispo()">+ Ajouter une indisponibilité</button>''',
    '''      <h2>Indisponibilités <button class="btn btn-secondary btn-sm" onclick="openAddIndispo()">Ajouter</button></h2>''')

# ---- Tableau de bord ----
rep('''      <h2>⚠️ Paiements en retard</h2>''', '''      <h2>Paiements en retard</h2>''')
rep('''      <h2>🕓 Paiements à venir</h2>''', '''      <h2>Paiements à venir</h2>''')
rep('''      <h2>📊 Récapitulatif d'activité (${monthLabel(currentKey)})</h2>''', '''      <h2>Activité de ${monthLabel(currentKey).toLowerCase()}</h2>''')
rep('''      <h2>💾 Sauvegarde</h2>''', '''      <h2>Sauvegarde</h2>''')
rep('''      <h2>📈 Récapitulatif des mois précédents</h2>''', '''      <h2>Mois précédents</h2>''')

# ---- Fiche client (coach) ----
rep('''    <div class="card">
      <h1>${clientName(c)}</h1>
      <p><b>Objectif :</b> ${c.objectif||'—'} &nbsp;|&nbsp; <b>Créé le :</b> ${fmtDate(c.dateCreation)}${c.email?` &nbsp;|&nbsp; <b>Email :</b> ${c.email}`:''}${c.telephone?` &nbsp;|&nbsp; <b>Tél :</b> ${c.telephone}`:''}</p>
      <button class="btn btn-danger btn-sm" onclick="confirmDeleteClient()">Supprimer le client</button>
    </div>''', '''    <div class="page-head">
      <div>
        <h1>${clientName(c)}</h1>
        <div class="meta">${c.objectif?`<span>${c.objectif}</span>`:''}<span>Client depuis le ${fmtDate(c.dateCreation)}</span>${c.email?`<span>${c.email}</span>`:''}${c.telephone?`<span>${c.telephone}</span>`:''}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="confirmDeleteClient()">Supprimer le client</button>
    </div>''')
rep('''<div class="badge warn" style="display:block;margin-bottom:10px;padding:10px">🕐 En attente de validation — ce client s'est inscrit lui-même, vérifiez ses réponses puis validez.<br><button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="validateBilan()">Valider le bilan</button></div>''',
    '''<div class="badge warn" style="display:block;margin-bottom:10px;padding:10px"><span>Ce client s\\u2019est inscrit lui-même : vérifiez ses réponses, puis validez son bilan pour lui ouvrir l\\u2019espace client.</span><button class="btn btn-primary btn-sm" onclick="validateBilan()">Valider le bilan</button></div>''')
rep('''<span class=\\"badge plan\\">📅 Programmée</span>''', '''<span class=\\"badge plan\\">Programmée</span>''')
rep('''      <h2>Évolution mensuelle</h2>
      <button class="btn btn-primary btn-sm" onclick="openEvoModal()">+ Ajouter une évolution</button>''',
    '''      <h2>Évolution mensuelle <button class="btn btn-primary btn-sm" onclick="openEvoModal()">Ajouter une évolution</button></h2>''')

# ---- Mouvements / cycles ----
rep('''${m.ressourceId?' · 📖':''}''', '''${m.ressourceId?' <span class="tag">leçon liée</span>':''}''')
rep('''${mv.surchargeProgressive?' 📈':''} · ${mv.chargeDepart} kg''', '''${mv.surchargeProgressive?' <span class="tag">progressif</span>':''} · ${mv.chargeDepart} kg''')
rep('''${mv.chargeActuelle} kg${mv.surchargeProgressive?' 📈':''}''', '''${mv.chargeActuelle} kg${mv.surchargeProgressive?' <span class="tag">progressif</span>':''}''')
rep('''      <h2>Bibliothèque de cycles</h2>
      <button class="btn btn-primary btn-sm" onclick="startNewCycleTemplate()">+ Nouveau modèle</button>''',
    '''      <h2>Bibliothèque de cycles <button class="btn btn-primary btn-sm" onclick="startNewCycleTemplate()">Nouveau modèle</button></h2>''')
rep('''        <h2>${t.nom} <button class="btn btn-danger btn-sm" style="float:right" onclick="askDelete('deleteCycleTemplate','${t.id}','Supprimer ce modèle de cycle ?')">Supprimer</button> <button class="btn btn-secondary btn-sm" style="float:right;margin-right:8px" onclick="editCycleTemplate('${t.id}')">Modifier</button></h2>''',
    '''        <h2>${t.nom} <span style="margin-left:auto;display:inline-flex;gap:6px"><button class="btn btn-secondary btn-sm" onclick="editCycleTemplate('${t.id}')">Modifier</button><button class="btn btn-danger btn-sm" onclick="askDelete('deleteCycleTemplate','${t.id}','Supprimer ce modèle de cycle ?')">Supprimer</button></span></h2>''')
rep('''>${editing?'Enregistrer les modifications':'+ Ajouter'}</button>''', '''>${editing?'Enregistrer les modifications':'Ajouter'}</button>''')
rep('''<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="openAddMouvementModal(${i})">+ Ajouter un mouvement</button>''', '''<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="openAddMouvementModal(${i})">Ajouter un mouvement</button>''')
rep('''<button class="btn btn-secondary btn-sm" onclick="addEntrainementToBuilder()">+ Ajouter un entraînement au cycle</button>''', '''<button class="btn btn-secondary btn-sm" onclick="addEntrainementToBuilder()">Ajouter un entraînement au cycle</button>''')
rep('''${ent.valide?'<span class="badge ok">✅ Validé</span>':'<span class="badge warn">🕐 En attente</span>'}''', '''${ent.valide?'<span class="badge ok">Validé</span>':'<span class="badge warn">À valider</span>'}''')

# ---- Enseignements ----
rep('''      <h2>📚 Mes enseignements</h2>''', '''      <h2>Mes enseignements</h2>''')
rep('''        <button class="btn btn-secondary btn-sm" onclick="openNewLeconDossier()">+ Nouveau dossier</button>
        <button class="btn btn-primary btn-sm" onclick="openLeconRessourceModal()">+ Nouvelle ressource</button>''',
    '''        <button class="btn btn-secondary btn-sm" onclick="openNewLeconDossier()">Nouveau dossier</button>
        <button class="btn btn-primary btn-sm" onclick="openLeconRessourceModal()">Nouvelle ressource</button>''')
rep('''">${n.type==='dossier'?'📁':'📄'} ${n.nom}</span>
          <span><button''', '''">${n.type==='dossier'?ICON_FOLDER:ICON_DOC}${n.nom}</span>
          <span><button''')
rep('''      <h2>📚 Enseignements</h2>''', '''      <h2>Enseignements</h2>''')
rep('''<span>${n.type==='dossier'?'📁':'📄'} ${n.nom}</span></div>`)''', '''<span>${n.type==='dossier'?ICON_FOLDER:ICON_DOC}${n.nom}</span></div>`)''')
rep('''  return `<div class="empty"><span style="cursor:pointer" onclick="${navFnPrefix}Root()">Racine</span>${path.map((p,i)=>` / <span style="cursor:pointer" onclick="${navFnPrefix}To(${i})">${p.nom}</span>`).join('')}</div>`;''',
    '''  return `<div class="empty"><span style="cursor:pointer;text-decoration:underline" onclick="${navFnPrefix}Root()">Tous les enseignements</span>${path.map((p,i)=>` / <span style="cursor:pointer;text-decoration:underline" onclick="${navFnPrefix}To(${i})">${p.nom}</span>`).join('')}</div>`;''')

# ---- Challenges / niveaux ----
rep('''      <h2>🏆 Challenges</h2>
      <button class="btn btn-primary btn-sm" onclick="openNewChallenge()">+ Nouveau challenge</button>''',
    '''      <h2>Challenges <button class="btn btn-primary btn-sm" onclick="openNewChallenge()">Nouveau challenge</button></h2>''')
rep('''${p.statut==='reussi'?'✅ Réussi':'❌ Échec'}''', '''${p.statut==='reussi'?'Réussi':'Non réussi'}''')
rep('''      <h2>🏆 Challenges en cours</h2>''', '''      <h2>Challenges en cours</h2>''')
rep('''${mine.statut==='reussi'?'✅ Réussi':'❌ Échec déclaré'}''', '''${mine.statut==='reussi'?'Réussi':'Non réussi'}''')
rep('''<div class="empty">✅ ${cl?clientName(cl):'?'}</div>''', '''<div class="empty">${cl?clientName(cl):'?'}</div>''')
rep('''      <h2>🎖️ Niveaux</h2>''', '''      <h2>Niveaux</h2>''')
rep('''<button class="btn btn-primary btn-sm" onclick="openNiveauModal()">+ Nouveau niveau</button>''', '''<button class="btn btn-primary btn-sm" onclick="openNiveauModal()">Nouveau niveau</button>''')
rep('''<p>🎁 ${nv.recompenseTexte}</p>''', '''<p>Récompense : ${nv.recompenseTexte}</p>''')

# ---- Séances ----
rep('''    if(p.offert) payBadge = '<span class="badge ok">🎁 Offerte</span>';
    else payBadge = p.paiement?`<span class="badge ok">✅ Payé (${p.tarif} €)</span>`:`<span class="badge warn">⚠️ Non payé (${p.tarif} €)</span>`;''',
    '''    if(p.offert) payBadge = '<span class="badge ok">Offerte</span>';
    else payBadge = p.paiement?`<span class="badge ok">Payée · ${p.tarif} €</span>`:`<span class="badge warn">Non payée · ${p.tarif} €</span>`;''')
rep('''    actions = `<span class="badge lock">🔒 Séance payée — verrouillée</span> <button''', '''    actions = `<span class="badge lock">Payée, verrouillée</span> <button''')
rep('''`<div>🏋️ Entraînement prévu : <b>${p.entrainementNom}</b> ${p.entrainementValide?'<span class="badge ok">✅ Validé</span>':''}</div>`''',
    '''`<div class="empty">Entraînement prévu : <b>${p.entrainementNom}</b> ${p.entrainementValide?'<span class="badge ok">Validé</span>':''}</div>`''')
rep('''  return `<div class="seance-row" style="flex-direction:column;align-items:stretch">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <b>${fmtDate(p.date)} ${p.heure?('· '+p.heure+' – '+heureFin(p.heure,p.formule)):''} — ${head}</b>
      <span>${statutBadge} ${payBadge}</span>
    </div>
    ${p.resume?`<div>${p.resume}</div>`:''}
    ${p.notes?`<div class="empty">${p.notes}</div>`:''}
    ${entrainementInfo}
    ${validerBtn}
    <div>${actions}</div>
  </div>`;''', '''  return `<div class="seance-row" style="flex-direction:column;align-items:stretch">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <b>${fmtDate(p.date)} ${p.heure?('· '+p.heure+' – '+heureFin(p.heure,p.formule)):''} — ${head}</b>
      <span>${statutBadge} ${payBadge}</span>
    </div>
    ${p.resume?`<div>${p.resume}</div>`:''}
    ${p.notes?`<div class="empty">${p.notes}</div>`:''}
    ${entrainementInfo}
    ${validerBtn}
    <div class="row-actions">${actions}</div>
  </div>`;''')
rep('''  let head = p.type==='sans' ? 'Sans coach' : (p.formule==='express'?'Coaching Express — 60 €':'Coaching Classique — 90 €');''',
    '''  let head = p.type==='sans' ? 'Sans coach' : (p.formule==='express'?'Coaching Express':'Coaching Classique');''')
rep('''<span class="badge lock">🔒 Paiement validé — verrouillé</span>''', '''<span class="badge lock">Payée, verrouillée</span>''')
rep('''<span class="badge lock">Annulée — montant non comptabilisé</span>''', '''<span class="badge lock">Annulée, non comptabilisée</span>''', 2)

# ---- Suivi ----
rep('''      ${stopped ? `<p class="badge lock">Suivi arrêté/en pause depuis le ${fmtDate(cfg.segments[cfg.segments.length-1].end)}</p>
                   <button''', '''      ${stopped ? `<p><span class="badge lock">En pause depuis le ${fmtDate(cfg.segments[cfg.segments.length-1].end)}</span></p>
                   <button''')

# ---- Recettes : titres ----
rep('''    <h3 style="margin-top:14px">Ingrédients</h3>''', '''    <label>Ingrédients</label>''')
rep('''    <h3 style="margin-top:10px">Ingrédients</h3>''', '''    <label>Ingrédients</label>''')

# ---- Filet de sécurité : tout emoji restant est retiré ----
before = s
s = re.sub(r'[\U0001F300-\U0001FAFF☀-➿⭐️‍]+ ?', '', s)
removed = len(re.findall(r'[\U0001F300-\U0001FAFF☀-➿]', before))
p.write_text(s, encoding='utf-8')
print('OK —', n, 'gabarits modifiés ;', removed, 'emoji(s) restant(s) retiré(s) automatiquement')
