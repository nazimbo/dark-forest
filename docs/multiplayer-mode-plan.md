# Plan — Mode multijoueur en ligne pour Dark Forest Simulator

> **Statut : planifié, non encore implémenté.** Ce document fige les décisions de design et le
> plan d'implémentation convenus. Aucun code multijoueur n'a encore été écrit.

## Contexte

Dark Forest Simulator est aujourd'hui un simulateur éducatif **solo** (React 19 + Canvas,
100 % client-side, déployé statique sur Vercel). On veut **ajouter un mode multijoueur en
ligne sans rien casser du solo**. Décisions verrouillées :

- **Solo conservé intact** ; le multi est un mode séparé choisi depuis un nouvel écran d'accueil.
- **Tour-par-tour à révélation simultanée** (style jeu de plateau / déduction), pas de temps réel.
- **Backend autoritaire : PartyKit** (serveur de salle en mémoire, ne diffuse que l'état public).
- **Victoire par élimination** (dernière civilisation debout).
- **4 actions secrètes/tour** : Diffuser (révèle ta position à portée), Se cacher (sûr/passif),
  Écouter (apprends les positions de ceux qui ont diffusé, sans te révéler),
  Frapper `<cible connue>` (tire un photoïde — **mais frapper te révèle aussi**).

Principe directeur : **réutiliser les modules purs existants** (`entities`, `physics`,
`renderer`, `useSound`) tels quels pour rejouer l'animation de résolution, et garder le solo
byte-for-byte.

## Architecture & coquille d'application

- Renommer `src/App.jsx` → `src/SoloApp.jsx` (contenu inchangé → le solo devient une feuille isolée).
- Nouveau `src/App.jsx` = coquille fine : `const [mode, setMode] = useState(null)` (`null|'solo'|'multiplayer'`),
  lecture d'un éventuel `?room=CODE` au montage (deep-link), puis rend `ModeSelect`, `SoloApp`,
  ou `MultiplayerApp` selon `mode`. `src/main.jsx` inchangé (le switch vit dans les providers).

## Backend PartyKit (nouveaux fichiers à la racine)

- `party/server.js` — classe de salle : protocole, secret, cycle de vie (connexion/déconnexion).
- `party/turnResolution.js` — **module PUR** de résolution de tour (importé par le serveur ET par Vitest).
- `party/board.js` — génération déterministe du plateau (layout d'étoiles graine, même forme que `entities.js`).
- `party/constants.js` — réglages serveur (BROADCAST_RADIUS, portée d'écoute, MIN/MAX joueurs) séparés du solo.
- `partykit.json` — config (`main: party/server.js`).

**État de salle (serveur, autoritaire) :** `phase` (lobby/choosing/resolving/finished), `turn`,
`hostId`, `board` (nebulae + étoiles décor + seed), et par joueur `{id, name, x, y, alive, ready,
connected, knownTargets, pendingAction (SECRET), hasSubmitted}`. **`pendingAction` n'est jamais
sérialisé dans un broadcast** — seul le booléen `hasSubmitted` est partagé.

**Protocole** — client→serveur : `setName`, `ready`, `startGame` (hôte), `submitAction{type,targetId?}`.
Serveur→client : `lobbyState`, `turnStart` (board au tour 0 ; bloc `you` propre à chaque joueur,
**jamais** les positions des autres), `turnProgress` (compteur de soumissions), `privateInfo`
(résultats d'écoute, envoyés **seulement** à l'écouteur), `turnResolution` (script d'événements
PUBLIC identique pour tous), `gameOver{winnerId}`, `error`.

**Algorithme `resolveTurn(roomState)` (pur)** :
1. Collecter les actions des joueurs vivants.
2. Classer les révélations : `broadcast` et `strike` révèlent la position (portée large/loud) ;
   `hide`/`listen` ne révèlent rien.
3. Détection : pour chaque révélateur R et joueur L, si L écoute OU est à portée → L ajoute R à `knownTargets`.
   (réutilise la logique de distance de `doWhisper` rules.js:122-127 et de collision physics.js:18-30).
4. Frappes : `strike{targetId}` valide seulement si `targetId ∈ knownTargets` au début du tour ;
   sinon no-op. Cible valide vivante → meurt. Frappes mutuelles simultanées → les deux meurent.
5. Construire `publicEvents` rejouables par le renderer : `{kind:'broadcast',x,y}` → `createWave` ;
   `{kind:'strike',fromX,fromY,toX,toY}` → `createWave` (pulse) + `createAttack` ;
   `{kind:'explosion',x,y}` → `createExplosionParticles` + `createFlash` + shake. Écouteurs/cachés
   → aucun événement public (secret préservé).
6. `privateInfoByPlayer` pour chaque écouteur. Vérif victoire : un seul vivant → `winnerId`, phase `finished`.
   Sinon `turn++`, reset des actions, phase `choosing`.

**Déconnexions** : `playerId` stable en `localStorage` pour reconnexion ; soumission manquante →
fallback auto `hide` pour que le tour se résolve ; MIN=2, MAX=8 ; rejoin rejeté une fois la partie lancée.

## Couche réseau & rendu client

- `src/net/partyClient.js` — wrapper `partysocket` léger (connect/send/onMessage/close, host via env).
- `src/hooks/useMultiplayerGame.js` — orchestrateur **parallèle à `useSimulation.js`** (pas une modif).
  Construit son `sim` via un **nouvel** export additif `createSimFromBoard(board)` dans `entities.js`,
  maintient une file d'événements alimentée par `turnResolution`, et chaque frame draine quelques
  événements (séquencés) en spawnant `createWave`/`createAttack`/`createExplosionParticles`, puis
  appelle le `render(...)` **inchangé**. `useSound` câblé comme en solo.

**Partage de la boucle (refactor additif, faible risque)** : extraire le boilerplate canvas+RAF
(DPR, resize useSimulation.js:41-70, getContext, requestAnimationFrame) dans un hook
`src/hooks/useCanvasLoop.js` prenant un callback `step(ctx, dims)`. `useSimulation` appelle
`useCanvasLoop(soloStep)` avec son corps **identique** (couvert par les tests existants) ;
`useMultiplayerGame` appelle `useCanvasLoop(mpStep)`. *Repli zéro-risque* : dupliquer ~30 lignes
de boilerplate et ne pas toucher `useSimulation.js`.

## Nouveaux composants UI (réutilisent `ActionButton`, `StatusBadge`, `NarrativePanel`, `SettingsPanel`)

- `src/components/ModeSelect.jsx` — Solo / Multijoueur.
- `src/MultiplayerApp.jsx` — racine multi (miroir de `SoloApp`) : canvas plein écran + header
  (titre, civs vivantes, `SettingsPanel`) + panneau bas = `Lobby` ou `MultiplayerControls` selon `phase`.
- `src/components/Lobby.jsx` — créer une salle (code + lien `?room=CODE` copiable), rejoindre par code,
  liste des joueurs + prêt, Start (hôte, ≥ min joueurs).
- `src/components/MultiplayerControls.jsx` — 4 boutons d'action secrète + sélecteur de cible pour
  Frapper (peuplé depuis `knownTargets`), « en attente de N joueurs », statut/élimination, écran de victoire.

**i18n** : ajouter un namespace `mp` dans `src/i18n/translations.js` (parallèle à `ui`/`narratives`).
`useTranslation` retombe sur l'anglais si une clé manque → **seul `en.mp` est requis**, les autres
langues se complètent plus tard.

## Dépendances & outillage

- Packages : `partykit` (dev) + `partysocket` (runtime) dans `package.json`.
- Scripts : `"party:dev": "partykit dev"`, `"party:deploy": "partykit deploy"`.
- Env : `VITE_PARTYKIT_HOST` (via `import.meta.env`), `.env.local` (déjà gitignoré) = `127.0.0.1:1999` en dev,
  host `*.partykit.dev` en prod (à mettre dans les env Vercel).
- ESLint : `party/server.js` n'est pas du code navigateur → ajouter un bloc de config dédié `party/**`
  (globals runtime) ou l'ignorer ; **garder** `turnResolution.js`/`board.js` lintés et testés.
- **Étapes manuelles utilisateur** : créer un compte PartyKit, `npx partykit login`, `npm run party:deploy`,
  reporter le host dans Vercel, redéployer. ⚠️ **Le sandbox distant ne peut probablement pas joindre le
  backend live** → la vérif online se fait sur la machine de l'utilisateur / un vrai déploiement.

## Tests (Vitest, style `src/simulation/__tests__/`)

- `party/__tests__/turnResolution.test.js` : (1) diffusion entendue par un écouteur, pas de mort ;
  (2) frappe valide tue la cible (+ frappeur révélé) ; (3) frappe sur cible inconnue = no-op ;
  (4) frappes mutuelles → deux morts ; (5) victoire à 2 joueurs ; (6) `hide` ne révèle rien.
- `party/__tests__/board.test.js` : même seed → même plateau, positions de spawn disjointes.
- Ajouter un test de `createSimFromBoard` dans `entities.test.js`. Vérifier le glob d'include Vitest
  (ajouter `party/` à `test.include` dans `vite.config.js` si besoin — modif additive).
- Test de sécurité : aucun payload broadcast ne contient le champ `pendingAction`.

## Vérification (machine utilisateur, 2 onglets)

1. `npm install` ; 2. terminal A `npm run party:dev` (127.0.0.1:1999) ; 3. terminal B `.env.local`
réglé puis `npm run dev`. 4. Onglet 1 → Multijoueur → Créer salle → copier le lien. 5. Onglet 2 →
ouvrir `?room=CODE` → lobby joint. 6. Prêt + Start. 7. Jouer : vérifier que le choix de l'autre
**n'est pas révélé** avant résolution, que les deux voient la **même** animation `turnResolution`,
et que seul l'écouteur voit ses positions privées. 8. Aller jusqu'à l'élimination → écran vainqueur.
9. Test déconnexion (fermer un onglet → fallback `hide` / reconnexion même `playerId`).
10. **Non-régression solo** : Solo → Diffuser/Murmurer/Écouter/Continuer/Renaissance OK.
11. `npm run lint && npm test && npm run build` au vert.

## Risques / points ouverts

- **Coordonnées du plateau** : le solo positionne en pixels CSS liés à la fenêtre ; le multi doit
  utiliser un **espace logique fixe** mis à l'échelle par client (fenêtres de tailles différentes),
  sinon les positions/animations diffèrent. À gérer dans `createSimFromBoard` + l'appel au renderer.
- **Intégrité de l'info cachée** : garantir que `pendingAction` ne fuit jamais dans un broadcast (test dédié).
- **Réglage des portées** (BROADCAST_RADIUS, écoute, rayon de révélation de la frappe) = leviers d'équilibrage.
- **Politique de déconnexion** (auto-hide vs forfait vs pause) à figer.
- **Refactor `useSimulation`** : l'extraction de `useCanvasLoop` touche le fichier solo le plus sensible
  (repli : duplication du boilerplate).
- **Deux cibles de déploiement** (front statique Vercel + host PartyKit) liées par l'env var.
