# Installation de la PWA

Le service worker est activé uniquement en production. `npm start` garde le
fonctionnement habituel du développement, sans cache PWA.

## Vérification locale

1. Exécuter `npm run build` pour produire la version avec le service worker.
2. Exécuter `npm run ng -- serve --configuration production`.
3. Ouvrir `http://localhost:4200` dans Chrome ou Edge, attendre l’activation du
   service worker (jusqu’à 30 secondes), puis recharger.
4. Dans les outils de développement, vérifier **Application > Manifest** et
   **Service Workers**, puis utiliser l’action d’installation du navigateur.
5. Tester le chargement de l’interface hors connexion après cette première visite.

## Mise en ligne

Publier le contenu de `dist/songoy_couture_front/browser` sur un hébergement HTTPS.
Le serveur doit servir les fichiers existants directement et renvoyer `index.html`
pour les routes Angular, sans rediriger les routes de l’API vers ce fichier.

Servir `ngsw.json`, `ngsw-worker.js` et `index.html` avec revalidation
(`Cache-Control: no-cache`). Les fichiers JS/CSS avec empreinte dans leur nom
peuvent être mis en cache longtemps.

Sur iPhone/iPad : ouvrir l’application dans Safari, puis **Partager > Sur l’écran
d’accueil**. Sur Android ou ordinateur : utiliser **Installer l’application**
dans le navigateur compatible.

## Périmètre du mode hors connexion

Seuls les fichiers de l’interface et les icônes sont conservés par le service
worker. Les réponses de l’API, les données clients, les ventes et les paiements
ne sont pas mis en cache. Les opérations métier nécessitent une connexion.
Les polices Google externes nécessitent également le réseau ou leur cache navigateur.

Les mises à jour suivent le mécanisme standard Angular : téléchargement de la
nouvelle version, puis utilisation lors d’un prochain chargement. Aucun
rechargement forcé n’interrompt une saisie en cours.

Les icônes reprennent le « S » de la connexion et la couleur dorée du projet.
Pour les régénérer sous Windows : `powershell -File scripts/generate-pwa-icons.ps1`.
