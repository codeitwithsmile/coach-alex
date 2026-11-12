#!/usr/bin/env python3
"""Jeu de données de démonstration (clients fictifs) → out/demo_ops_*.json, à écrire dans la base de l'artefact.
Toutes les dates sont relatives à aujourd'hui, les montants et règles suivent app.js."""
import json, datetime as dt, pathlib
TODAY = dt.date(2026, 11, 11)
d = lambda days: (TODAY + dt.timedelta(days=days)).isoformat()
out = pathlib.Path(__file__).resolve().parent.parent / 'out'
ops = []
def doc(path, data): ops.append({'op': 'set', 'path': path, 'data': data})

def calc(poids, taille, age, genre, niveau):
    bmr = 10*poids + 6.25*taille - 5*age + (5 if genre == 'homme' else -161)
    mult = {'sedentaire': 1.2, 'leger': 1.375, 'actif': 1.55}
    ratios = {'homme': {'sedentaire': (1.6, 1.1), 'leger': (1.8, 1.2), 'actif': (2, 1.3)}, 'femme': {'sedentaire': (1.4, 1), 'leger': (1.6, 1.1), 'actif': (1.8, 1.2)}}
    sk, ak = ('leger', 'actif') if niveau == 'actif' else ('sedentaire', 'leger')
    sans, avec = bmr*mult[sk], bmr*mult[ak]; p, l = ratios[genre][niveau]
    r = lambda x: int(round(x))
    return dict(proteines=r(p*poids), lipides=r(l*poids), regimeAvec=r(avec-400), regimeSans=r(sans-400), maintienAvec=r(avec), maintienSans=r(sans), priseMasseAvec=r(avec+200))

# ---------- Cliente 1 : Nahia Iturralde (suivie depuis 3 mois) ----------
C1 = 'cl_nahia'
doc(f'clients/{C1}', dict(prenom='Nahia', nom='Iturralde', email='nahia.iturralde@example.com', telephone='06 12 34 56 78', objectif='Recomposition corporelle', dateCreation=d(-93)))
b = dict(date=d(-93), maj=d(-93), notes='Très motivée, disponible en soirée. Attention au genou droit (ancienne entorse).', valide=True, typePlan='regime_avec',
    genre='femme', dateNaissance='1990-04-22', taille='168', poids='74', niveauActivite='leger', estimationKilos='5 à 6 kg', adresseCoaching='12 chemin Harismendi, Ustaritz',
    mesures=dict(tourTaille='82', tourHanches='102', tourCuisse='60', tourBras='29'),
    typeActivitePro='Infirmière libérale, debout et en voiture', intensiteActivitePro='3', horairesTravail='Variables, tournées tôt le matin', fatigueTravail='4',
    particularitesHormonales='Aucune', contreIndicationsAlimentaires='Aucune', contreIndicationsActivite='Genou droit : éviter les impacts', allergies='Aucune', problemesCycle='Non', grossesse='Non',
    alcool='1 à 2 verres le week-end', tabac='Non', drogues='Non', autresPrecisionsSante='',
    passif='Surpoids après la 2e grossesse ; course à pied occasionnelle', dejaCoach='Non', problemeAlimentaire='Grignotage le soir après les tournées', situationEmotionnelle='Stable, période chargée au travail', reactionStress='3', enfants='Oui, deux (6 et 9 ans)',
    activitesSportivesActuelles='Marche, un peu de course', pretAjouterActivite='Oui, 2 à 3 fois par semaine', tempsDisponible='45 min à 1 h, le soir', motivationSport='4', toleranceDifficulte='4',
    sommeil='6 h 30 en moyenne, réveils fréquents', nombreRepas='3 repas, pas toujours réguliers', quiCuisine='Moi, 20 min le soir', budgetAlimentaire='Confortable', regimesEssayes='Jeûne intermittent (abandonné au bout d\'un mois)', alimentsRefuses='Abats, fruits de mer', consommationEau='1,5 L', frequenceSocial='1 fois par semaine', niveauMotivation='8', entourage='Conjoint soutenant')
b.update({k: str(v) for k, v in calc(74, 168, 36, 'femme', 'leger').items()})
doc(f'bilans/{C1}', b)
for days, poids, m, note in ((-62, 72.8, ('80', '101', '59.5', '29'), 'Bonne régularité, moins de grignotage'), (-32, 71.6, ('78.5', '100', '59', '29.5'), 'Sommeil amélioré'), (-1, 70.4, ('77', '99', '58.5', '30'), 'Genou OK, charges en hausse')):
    e = dict(clientId=C1, date=d(days), poids=str(poids), mesures=dict(zip(('tourTaille', 'tourHanches', 'tourCuisse', 'tourBras'), m)), notes=note)
    e.update({k: str(v) for k, v in calc(poids, 168, 36, 'femme', 'leger').items()})
    doc(f'evolutions/evo_nahia_{abs(days)}', e)
doc(f'evolutions/evo_nahia_next', dict(clientId=C1, date=d(29), poids='', mesures=dict(tourTaille='', tourHanches='', tourCuisse='', tourBras=''), notes='Pesée mensuelle programmée'))

# Bibliothèque de mouvements et modèle de cycle
MV = [('mv_squat', 'Squat goblet', 'Quadriceps/Fessiers', 'Hypertrophie'), ('mv_rdl', 'Soulevé de terre roumain haltères', 'Ischio-jambiers', 'Hypertrophie'), ('mv_pompes', 'Pompes', 'Pectoraux/Triceps', 'Hypertrophie'),
      ('mv_rowing', 'Rowing unilatéral haltère', 'Dos', 'Hypertrophie'), ('mv_hip', 'Hip thrust', 'Fessiers', 'Hypertrophie'), ('mv_dev', 'Développé haltères assis', 'Épaules', 'Hypertrophie'),
      ('mv_fentes', 'Fentes arrière', 'Quadriceps/Fessiers', 'Hypertrophie'), ('mv_gainage', 'Gainage (planche)', 'Sangle abdominale', 'Endurance')]
for i, (mid, nom, grp, typ) in enumerate(MV):
    doc(f'mouvements_bib/{mid}', dict(nom=nom, groupeMusculaire=grp, typeTravail=typ, ressourceId='lec_exec_squat' if mid == 'mv_squat' else ('lec_exec_hip' if mid == 'mv_hip' else None)))
def mv(mid, series, reps, seuil, charge, surcharge=True, aug=2.0, recup='90', tempo='2-0-1-0', temps=''):
    m = next(x for x in MV if x[0] == mid)
    return dict(nom=m[1], groupeMusculaire=m[2], typeTravail=m[3], ressourceId='lec_exec_squat' if mid == 'mv_squat' else ('lec_exec_hip' if mid == 'mv_hip' else None),
                series=series, repsCible=reps, repsSeuilBas=seuil, chargeDepart=charge, chargeActuelle=charge, tempsWork=temps, tempo=tempo, tempsRecup=recup,
                surchargeProgressive=surcharge, methode='6x12' if surcharge else None, augmentation=aug if surcharge else 0)
ents = [dict(nom='Jour 1 · Jambes et fessiers', mouvements=[mv('mv_squat', 6, 12, 8, 12), mv('mv_rdl', 6, 12, 8, 16), mv('mv_hip', 6, 12, 8, 30, aug=2.5), mv('mv_gainage', 3, 0, 0, 0, False, recup='60', tempo='', temps='45')]),
        dict(nom='Jour 2 · Haut du corps', mouvements=[mv('mv_pompes', 6, 12, 8, 0, False, recup='75'), mv('mv_rowing', 6, 12, 8, 10), mv('mv_dev', 6, 12, 8, 6, aug=1.0)]),
        dict(nom='Jour 3 · Full body', mouvements=[mv('mv_fentes', 6, 12, 8, 8), mv('mv_rowing', 6, 12, 8, 10), mv('mv_squat', 6, 12, 8, 12), mv('mv_gainage', 3, 0, 0, 0, False, recup='60', tempo='', temps='60')])]
doc('cycles_bib/cyc_fullbody', dict(nom='Débutante · 3 jours', entrainements=ents, createdAt=d(-90)))
# Attribution (copie indépendante, charges ayant progressé)
import copy
att = copy.deepcopy(ents)
for e in att: e['valide'] = True
att[0]['mouvements'][0].update(chargeActuelle=20, chargeDepart=12); att[0]['mouvements'][1].update(chargeActuelle=24); att[0]['mouvements'][2].update(chargeActuelle=42.5)
att[1]['mouvements'][1].update(chargeActuelle=14); att[1]['mouvements'][2].update(chargeActuelle=9)
att[2]['mouvements'][0].update(chargeActuelle=14); att[2]['mouvements'][1].update(chargeActuelle=14); att[2]['mouvements'][2].update(chargeActuelle=20, chargeDepart=12)
att[1]['valide'] = False  # prochain entraînement : charge modifiée après la dernière séance → à revalider
doc('attributions/att_nahia', dict(clientId=C1, cycleBibId='cyc_fullbody', cycleNom='Débutante · 3 jours', entrainements=att, currentEntrainementIndex=1, active=True, createdAt=d(-88)))

# Séances avec coach (1 classique / semaine le mardi 18h30, 1 express un samedi sur deux à 10h) et journaux d'entraînement
seances = []
k = 0
for w in range(13, -3, -1):  # 13 semaines passées → 2 à venir
    day = TODAY - dt.timedelta(days=(TODAY.weekday() - 1) + 7*w)  # mardi
    sat = day + dt.timedelta(days=4)
    for date, formule, heure in ((day, 'classique', '18:30'),) + (((sat, 'express', '10:00'),) if w % 2 == 0 else ()):
        if date < TODAY - dt.timedelta(days=92): continue
        k += 1
        past = date < TODAY
        entIdx = k % 3
        s = dict(clientId=C1, date=date.isoformat(), heure=heure, type='avec', formule=formule, tarif=60 if formule == 'express' else 90,
                 statut='faite' if past else 'prevue', paiement=past, offert=False, resume='', notes='',
                 attributionId='att_nahia', entrainementIndex=entIdx, entrainementNom=att[entIdx]['nom'], entrainementValide=past)
        if past and k == 1: s.update(offert=True, tarif=0, resume='Séance découverte offerte')
        if past and date >= TODAY - dt.timedelta(days=6): s.update(paiement=False)  # dernière séance : règlement en attente
        if date == day and w == 3: s.update(statut='annulee', notes='Reportée : garde d\'enfants', paiement=False)
        seances.append(s)
for i, s in enumerate(seances): doc(f'programmes/se_nahia_{i:02d}', s)
logs = []
for i, s in enumerate([s for s in seances if s['statut'] == 'faite']):
    ent = att[s['entrainementIndex']]
    res = [dict(mouvementIndex=j, nom=m['nom'], repsMin=(None if not m['surchargeProgressive'] else max(8, 12 - (i % 3))), commentaire=('Dernière série dure' if j == 0 and i % 4 == 0 else '')) for j, m in enumerate(ent['mouvements'])]
    logs.append(dict(clientId=C1, attributionId='att_nahia', entrainementIndex=s['entrainementIndex'], entrainementNom=ent['nom'], seanceId=f'se_nahia_{seances.index(s):02d}', date=s['date'], resultats=res, vu=True, createdAt=s['date']))
# séances en autonomie (jeudis), la dernière non encore vue par le coach
for w in (8, 6, 4, 2, 0):
    day = TODAY - dt.timedelta(days=(TODAY.weekday() - 3) + 7*w)
    if day >= TODAY: day -= dt.timedelta(days=7)
    ent = att[2]
    logs.append(dict(clientId=C1, attributionId='att_nahia', entrainementIndex=2, entrainementNom=ent['nom'], seanceId=None, date=day.isoformat(),
                     resultats=[dict(mouvementIndex=j, nom=m['nom'], repsMin=(None if not m['surchargeProgressive'] else 10), commentaire=('Fait à la maison, genou OK' if j == 0 else '')) for j, m in enumerate(ent['mouvements'])], vu=(w != 0), createdAt=day.isoformat()))
logs.sort(key=lambda l: l['date'])
for i, l in enumerate(logs): doc(f'entrainement_logs/log_nahia_{i:02d}', l)

# Suivi mensuel depuis le 10 août : périodes 10/08→10/09, 10/09→10/10, 10/10→10/11 (payées), 10/11→10/12 (en cours, due)
doc(f'suivi_config/{C1}', dict(segments=[dict(start='2026-08-10', end=None)]))
def paid_in(start, end):
    return sum(1 for s in seances if s['type'] == 'avec' and s['paiement'] and s['statut'] != 'annulee' and start <= s['date'] < end)
tarif = lambda n: 0 if n >= 5 else {4: 36, 3: 62}.get(n, 89)
for start, end, paid in (('2026-08-10', '2026-09-10', True), ('2026-09-10', '2026-10-10', True), ('2026-10-10', '2026-11-10', True), ('2026-11-10', '2026-12-10', False)):
    n = paid_in(start, end)
    doc(f'suivis/{C1}_{start}', dict(clientId=C1, periodeDebut=start, periodeFin=end, nbSeances=n, tarif=tarif(n), paiement=paid, annule=False))

# Indisponibilités, demande de séance en attente
doc('indisponibilites/ind_lundi', dict(type='recurrente', jourSemaine='1', heureDebut='12:00', heureFin='14:00', motif='Pause déjeuner'))
doc('indisponibilites/ind_ponct', dict(type='ponctuelle', date=d(9), heureDebut='09:00', heureFin='22:00', motif='Formation'))
doc('demandes/dem_nahia_1', dict(clientId=C1, date=d(10), heureDebut='19:00', formule='express', statut='attente', createdAt=d(0), attributionId='att_nahia', entrainementIndex=1, entrainementNom=att[1]['nom']))

# Enseignements
doc('lecons/lec_nutrition', dict(nom='Nutrition fondamentale', parentId=None, type='dossier', createdAt=d(-90)))
doc('lecons/lec_calories', dict(nom='Les calories et le calcul des besoins', parentId='lec_nutrition', type='ressource', videoAssetId=None, createdAt=d(-90), texte='Une calorie est une unité d\'énergie, ni bonne ni mauvaise en soi. Le bilan calorique reste le facteur déterminant de la prise ou de la perte de poids. Les besoins affichés dans votre profil sont estimés avec la formule de Mifflin-St Jeor, puis ajustés à chaque pesée.\n\nCe qui compte : la moyenne sur la semaine, pas la perfection chaque jour.'))
doc('lecons/lec_proteines', dict(nom='Les protéines : combien et quand', parentId='lec_nutrition', type='ressource', videoAssetId=None, createdAt=d(-90), texte='Visez l\'objectif de protéines de votre profil, réparti sur 3 à 4 prises dans la journée. Une source par repas suffit : œufs, poisson, volaille, laitages, légumineuses. Le timing précis autour de la séance compte moins que le total de la journée.'))
doc('lecons/lec_sommeil', dict(nom='Le sommeil, moitié du travail', parentId='lec_nutrition', type='ressource', videoAssetId=None, createdAt=d(-90), texte='C\'est pendant le sommeil profond que la récupération musculaire et l\'ancrage des apprentissages moteurs se font. Une semaine à 6 h au lieu de 8 fait grimper le cortisol et augmente les fringales du soir. Priorité à une heure de coucher régulière.'))
doc('lecons/lec_exec', dict(nom='Exécution des mouvements', parentId=None, type='dossier', createdAt=d(-90)))
doc('lecons/lec_exec_squat', dict(nom='Squat goblet', parentId='lec_exec', type='ressource', videoAssetId=None, createdAt=d(-90), texte='Haltère tenu contre la poitrine, pieds largeur d\'épaules, pointes légèrement ouvertes. Descendez en poussant les hanches vers l\'arrière puis en pliant les genoux, dos droit, coudes entre les genoux en bas. Les genoux suivent l\'axe des pieds.\n\nErreur fréquente : relever le buste trop tôt en remontant.'))
doc('lecons/lec_exec_hip', dict(nom='Hip thrust', parentId='lec_exec', type='ressource', videoAssetId=None, createdAt=d(-90), texte='Haut du dos sur le banc, pieds à plat largeur de hanches. Poussez les hanches vers le haut jusqu\'à l\'alignement genoux-hanches-épaules en serrant fort les fessiers, menton rentré. Redescendez sans toucher le sol.\n\nErreur fréquente : cambrer le bas du dos au lieu de contracter les fessiers.'))
doc(f'lecons_vues/{C1}_lec_calories', dict(clientId=C1, leconId='lec_calories', vuAt=d(-40)))
doc(f'lecons_vues/{C1}_lec_exec_squat', dict(clientId=C1, leconId='lec_exec_squat', vuAt=d(-80)))
doc('niveaux_config/niv_1', dict(niveau=1, leconRequiseId='lec_calories', recompenseTexte='Séance Express offerte'))
doc('niveaux_config/niv_2', dict(niveau=2, leconRequiseId='lec_proteines', recompenseTexte='Bilan diététique complet offert'))
doc('niveaux_config/niv_3', dict(niveau=3, leconRequiseId='lec_sommeil', recompenseTexte='-10 % sur le suivi mensuel pendant 3 mois'))

# Aliments, recette, journal
FOODS = [('pr_poulet', 'Blanc de poulet', '', 'Viande/Poisson/Œufs', 165, 31, 3.6, 0), ('pr_oeuf', 'Œuf entier', '', 'Viande/Poisson/Œufs', 155, 13, 11, 1.1), ('pr_saumon', 'Saumon', '', 'Viande/Poisson/Œufs', 208, 20, 13, 0),
         ('pr_riz', 'Riz complet cuit', '', 'Féculents', 123, 2.6, 1, 25), ('pr_avoine', 'Flocons d\'avoine', '', 'Féculents', 389, 17, 7, 66), ('pr_pdt', 'Pomme de terre', '', 'Féculents', 77, 2, 0.1, 17),
         ('pr_skyr', 'Skyr nature', 'Danone', 'Produits laitiers', 63, 11, 0.2, 4), ('pr_fb', 'Fromage blanc 3 %', '', 'Produits laitiers', 60, 8, 3, 4), ('pr_brocoli', 'Brocoli', '', 'Légumes', 34, 2.8, 0.4, 7),
         ('pr_banane', 'Banane', '', 'Fruits', 89, 1.1, 0.3, 23), ('pr_pomme', 'Pomme', '', 'Fruits', 52, 0.3, 0.2, 14), ('pr_huile', 'Huile d\'olive', '', 'Matières grasses', 884, 0, 100, 0), ('pr_amandes', 'Amandes', '', 'Oléagineux', 579, 21, 50, 22)]
F = {}
for pid, nom, marque, cat, kcal, p, l, g in FOODS:
    F[pid] = dict(nom=nom, marque=marque, categorie=cat, kcal100=kcal, proteines100=p, lipides100=l, glucides100=g)
    doc(f'produits_bib/{pid}', F[pid])
ing = [('pr_skyr', 200), ('pr_avoine', 40), ('pr_banane', 100), ('pr_amandes', 15)]
ingredients = [dict(produitId=pid, nom=F[pid]['nom'], quantiteG=q, kcal100=F[pid]['kcal100'], prot100=F[pid]['proteines100'], lip100=F[pid]['lipides100']) for pid, q in ing]
tot = lambda key: sum(i[key]*i['quantiteG']/100 for i in ingredients)
doc('recettes/rec_bol', dict(nom='Bol du matin skyr-avoine', guide='Mélanger le skyr et les flocons la veille au soir. Ajouter la banane en rondelles et les amandes au moment de manger.', ingredients=ingredients, kcal=tot('kcal100'), proteines=tot('prot100'), lipides=tot('lip100'), createdAt=d(-30)))
j = 0
def entry(days, pid, q):
    global j; j += 1; f = F[pid]
    doc(f'journal_alimentaire/ja_nahia_{j:02d}', dict(clientId=C1, date=d(days), produitNom=f['nom'] + (f' ({f["marque"]})' if f['marque'] else ''), quantiteG=q, kcal100=f['kcal100'], proteines100=f['proteines100'], lipides100=f['lipides100'],
                                                    kcal=f['kcal100']*q/100, proteines=f['proteines100']*q/100, lipides=f['lipides100']*q/100, createdAt=d(days)))
def recipe_entry(days):
    global j; j += 1
    doc(f'journal_alimentaire/ja_nahia_{j:02d}', dict(clientId=C1, date=d(days), produitNom='Recette : Bol du matin skyr-avoine', quantiteG=None, kcal100=None, proteines100=None, lipides100=None, recetteId='rec_bol', kcal=tot('kcal100'), proteines=tot('prot100'), lipides=tot('lip100'), createdAt=d(days)))
recipe_entry(0); entry(0, 'pr_poulet', 150); entry(0, 'pr_riz', 180); entry(0, 'pr_brocoli', 200); entry(0, 'pr_huile', 10)
recipe_entry(-1); entry(-1, 'pr_saumon', 140); entry(-1, 'pr_pdt', 250); entry(-1, 'pr_pomme', 150); entry(-1, 'pr_fb', 200)
entry(-2, 'pr_oeuf', 120); entry(-2, 'pr_avoine', 50); entry(-2, 'pr_poulet', 160); entry(-2, 'pr_riz', 200); entry(-2, 'pr_banane', 120)

# Challenges
doc('challenges/ch_sucre', dict(nom='Zéro sucre ajouté', description='Pas de sodas, biscuits ni sucre dans le café jusqu\'à la fin du mois. Les fruits sont permis.', dateDebut=d(-10), dateFin=d(19), clientsCible='all', createdAt=d(-10)))
doc('challenges/ch_pas', dict(nom='10 000 pas par jour', description='Tous les jours du mois, montre ou téléphone en poche.', dateDebut='2026-10-01', dateFin='2026-10-31', clientsCible='all', createdAt='2026-09-28'))
doc(f'challenge_participations/ch_pas_{C1}', dict(challengeId='ch_pas', clientId=C1, statut='reussi', declaredAt='2026-10-30'))

# ---------- Client 2 : Peio Lascaray (auto-inscrit, bilan à valider) ----------
C2 = 'cl_peio'
doc(f'clients/{C2}', dict(prenom='Peio', nom='Lascaray', email='peio.lascaray@example.com', telephone='07 98 76 54 32', objectif='Prise de masse', dateCreation=d(-2)))
b2 = dict(date=d(-2), maj=d(-2), notes='', valide=False, genre='homme', dateNaissance='1998-11-03', taille='181', poids='68', niveauActivite='actif', estimationKilos='', adresseCoaching='4 rue Pannecau, Bayonne',
    mesures=dict(tourTaille='76', tourHanches='92', tourCuisse='54', tourBras='30'), typeActivitePro='Charpentier', intensiteActivitePro='5', horairesTravail='7h-16h', fatigueTravail='4',
    particularitesHormonales='', contreIndicationsAlimentaires='', contreIndicationsActivite='', allergies='Arachide', problemesCycle='', grossesse='', alcool='Le week-end', tabac='Non', drogues='Non', autresPrecisionsSante='',
    passif='Rugby jusqu\'à 22 ans, arrêt après une blessure à l\'épaule', dejaCoach='Non', problemeAlimentaire='Je saute souvent le petit-déjeuner', situationEmotionnelle='Bonne', reactionStress='2', enfants='Non',
    activitesSportivesActuelles='Surf l\'été', pretAjouterActivite='Oui', tempsDisponible='3 séances par semaine le soir', motivationSport='5', toleranceDifficulte='5',
    sommeil='7 h', nombreRepas='2 gros repas', quiCuisine='Moi, peu de temps', budgetAlimentaire='Contraint', regimesEssayes='Aucun', alimentsRefuses='Aucun', consommationEau='2 L', frequenceSocial='2 fois par semaine', niveauMotivation='9', entourage='Colocataires, neutre')
b2.update({k: str(v) for k, v in calc(68, 181, 28, 'homme', 'actif').items()})
doc(f'bilans/{C2}', b2)
doc('demandes_rdv/rdv_peio', dict(clientId=C2, type='reel', disponibilites='Soirs de semaine après 18 h, samedi matin', statut='attente', createdAt=d(-2)))

for i in range(0, len(ops), 50):
    (out / f'demo_ops_{i//50+1}.json').write_text(json.dumps(ops[i:i+50], ensure_ascii=False), encoding='utf-8')
print(len(ops), 'documents ;', (len(ops)+49)//50, 'lots ;', 'séances:', len(seances), 'journaux:', len(logs))
