# Guides Mon Miroir

Site éditorial de Mon Miroir, publié sur guide.monmiroir.net. Totalement séparé de l'application (dépôt miroir-clarte).

- `site/` : les pages publiées (HTML statique, aucun outil de construction).
- `EDITORIAL.md` : la ligne éditoriale et la réserve de sujets, suivies par l'agent de rédaction.

Hébergement : GitHub Pages. À chaque mise à jour de `main`, le fichier `.github/workflows/publier.yml` copie le dossier `site/` sur la branche `gh-pages`, qui est publiée sur guide.monmiroir.net.
