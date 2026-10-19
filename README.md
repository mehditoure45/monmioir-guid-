# Guides Mon Miroir

Site éditorial de Mon Miroir, publié sur guide.monmiroir.net. Totalement séparé de l'application (dépôt miroir-clarte).

- `site/` : les pages publiées (HTML statique, aucun outil de construction).
- `EDITORIAL.md` : la ligne éditoriale et la réserve de sujets, suivies par l'agent de rédaction.
- `functions/` : journal des visites et des robots d'IA, comptage des clics vers les stores (`/sortie/`), tableau de bord privé et `/api/stats` (Cloudflare Pages Functions, base D1).
- `scripts/score-ia.js` : chaque lundi, l'agent stratège pose les questions de `donnees/questions-ia.json` à ChatGPT et à Perplexity et note si Mon Miroir est recommandé, et par quels sites. Résultats dans `donnees/score-ia/`.

Hébergement : GitHub Pages. À chaque mise à jour de `main`, le fichier `.github/workflows/publier.yml` copie le dossier `site/` sur la branche `gh-pages`, qui est publiée sur guide.monmiroir.net.
