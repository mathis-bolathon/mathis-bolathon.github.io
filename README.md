# Site CV — Mathis Bolathon

Site personnel statique (HTML / CSS / JavaScript, sans dépendance ni build).
Pro avant tout, avec une section dédiée à la passion **drone FPV** et des galeries
prêtes pour **Cartier** et le **Festival Le Grand Bastringue**.

## Voir le site

Ouvre simplement `index.html` dans un navigateur — c'est tout.

Pour un rendu identique à la mise en ligne (et pour que les galeries chargent bien),
tu peux aussi lancer un petit serveur local :

```bash
# Python (déjà installé sur ta machine)
cd site-cv
python -m http.server 8000
# puis ouvre http://localhost:8000
```

## Ajouter tes photos et vidéos

Tout se passe en 2 étapes.

### 1. Dépose tes fichiers

| Contenu | Dossier |
|---|---|
| Photos FPV | `assets/img/fpv/` |
| Photos Cartier | `assets/img/cartier/` |
| Photos Grand Bastringue | `assets/img/bastringue/` |
| Vidéos (toutes) | `assets/video/` |

### 2. Déclare-les dans `js/main.js`

En haut du fichier, dans `GALLERIES`, ajoute une ligne par média.

```js
const GALLERIES = {
  fpv: [
    { src: "assets/img/fpv/vol-01.jpg", caption: "Coucher de soleil en montagne" },
    { type: "video", src: "assets/video/freestyle.mp4",
      poster: "assets/img/fpv/poster.jpg", caption: "Session freestyle" },
  ],
  cartier: [
    { src: "assets/img/cartier/cockpit.jpg", caption: "Cockpit d'indicateurs" },
  ],
  bastringue: [
    { src: "assets/img/bastringue/scene.jpg", caption: "Édition 2025" },
  ],
};
```

- **Photo** : `{ src: "...", caption: "..." }`
- **Vidéo** : `{ type: "video", src: "...", poster: "...", caption: "..." }`
  (`poster` = image d'aperçu, facultative)

Tant qu'une galerie est vide, des cases « à venir » s'affichent automatiquement.
Au clic, chaque média s'ouvre en grand (lightbox).

## Mettre à jour le CV PDF

Remplace `assets/cv/CV-Mathis-Bolathon.pdf` par ta nouvelle version (même nom de fichier).

## Mettre le site en ligne (gratuit)

Le site étant 100 % statique, il s'héberge gratuitement sur :

- **Netlify** : glisse-dépose le dossier `site-cv` sur app.netlify.com.
- **GitHub Pages** : pousse le dossier dans un dépôt, active Pages.
- **Cloudflare Pages** / **Vercel** : connecte le dépôt.

Pour un nom de domaine perso (ex. `mathis-bolathon.com`), tu pourras le brancher
sur l'un de ces hébergeurs.

## Structure

```
site-cv/
├─ index.html        # contenu et structure
├─ css/styles.css    # design (thème clair/sombre via variables)
├─ js/main.js        # interactions + config des galeries
└─ assets/
   ├─ cv/            # CV PDF téléchargeable
   ├─ img/           # photos (fpv, cartier, bastringue) + favicon
   └─ video/         # vidéos
```
