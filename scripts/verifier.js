// Contrôleur qualité du site : bloque la publication automatique si une page ne respecte pas la ligne éditoriale.
// Usage : node scripts/verifier.js   (code de sortie 1 = au moins une erreur)
const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', 'site');
const PAGES_HORS_ARTICLE = new Set(['index.html', '404.html', 'a-propos/index.html']);
const SUJETS_SENSIBLES = /suicid|idées noires|pensées sombres|dépression|deuil|automutil|se faire du mal|envie de mourir|anxiété|crise d'angoisse|burn-?out|épuisement/i;

const erreurs = [];
const err = (page, msg) => erreurs.push(`${page} : ${msg}`);

const pages = ['index.html', '404.html'];
for (const d of fs.readdirSync(SITE, { withFileTypes: true })) {
  if (d.isDirectory() && d.name !== 'assets' && fs.existsSync(path.join(SITE, d.name, 'index.html'))) {
    pages.push(`${d.name}/index.html`);
  }
}

const sitemap = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(SITE, 'llms.txt'), 'utf8');
const accueil = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');

for (const p of pages) {
  const s = fs.readFileSync(path.join(SITE, p), 'utf8');
  const texte = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const titre = (s.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';

  if (!titre) err(p, 'pas de <title>');
  else if (titre.length > 70) err(p, `<title> trop long (${titre.length} caractères, 70 max)`);
  if (!desc) err(p, 'pas de meta description');
  else if (desc.length < 100 || desc.length > 170) err(p, `meta description hors limites (${desc.length} caractères)`);
  if ((s.match(/<h1[\s>]/g) || []).length !== 1) err(p, 'il faut exactement un <h1>');
  if (/—/.test(texte)) err(p, 'tiret cadratin « — » interdit');
  if (/APPLE_SVG|GOOGLE_SVG|APP_ORG_JSON|HEAD_LINKS|\bTODO\b|lorem ipsum/i.test(s)) err(p, 'texte provisoire oublié');

  const ld = s.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ld) { try { JSON.parse(ld[1]); } catch (e) { err(p, 'JSON-LD invalide'); } }

  // Liens internes : chaque /chemin/ doit exister
  for (const [, href] of s.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (href === '/' || href.startsWith('/assets/')) continue;
    const cible = path.join(SITE, href.replace(/^\//, ''), href.endsWith('/') ? 'index.html' : '');
    if (!fs.existsSync(cible)) err(p, `lien interne cassé : ${href}`);
  }

  if (PAGES_HORS_ARTICLE.has(p)) continue;

  // Règles propres aux articles
  const slug = p.split('/')[0];
  const url = `https://guide.monmiroir.net/${slug}/`;
  const mots = texte.split(' ').filter(Boolean).length;
  if (mots < 900 || mots > 2600) err(p, `longueur anormale (${mots} mots)`);
  if (!ld) err(p, 'pas de JSON-LD');
  if (!s.includes('class="answer"')) err(p, 'bloc « En bref » manquant');
  if (!s.includes('class="cta"')) err(p, 'bloc d\'appel à l\'action (boutons des stores) manquant');
  if (!s.includes('apps.apple.com/app/id6801134262') || !s.includes('net.monmiroir.app')) err(p, 'liens App Store / Google Play manquants');
  if (!s.includes('class="faq"')) err(p, 'FAQ manquante');
  if (!/Mon Miroir/.test(texte)) err(p, 'Mon Miroir n\'est pas nommé');
  if (!s.includes(`rel="canonical" href="${url}"`)) err(p, 'canonical absent ou incorrect');
  if (!sitemap.includes(`<loc>${url}</loc>`)) err(p, 'absent du sitemap');
  if (!llms.includes(url)) err(p, 'absent de llms.txt');
  if (!accueil.includes(`href="/${slug}/"`)) err(p, 'absent de la page d\'accueil');
  if (SUJETS_SENSIBLES.test(texte) && !(s.includes('class="care"') && s.includes('3114'))) {
    err(p, 'sujet sensible sans encadré de prudence avec le 3114');
  }
  if (/\b(guérir|te soigner|remplace (un|ton) (psy|thérapeute|psychologue)|diagnostiquer)\b/i.test(texte.replace(/ne (le )?remplace pas|ne soigne pas|ni diagnostic|aucun diagnostic|pas de diagnostic/gi, ''))) {
    err(p, 'promesse thérapeutique ou de diagnostic détectée');
  }
}

// Anti-répétition : deux articles ne doivent pas dire la même chose.
// Mesure de recouvrement (Jaccard) sur le titre, le bloc « En bref » et le corps.
// Seuils réglés le 30/09/2026 : entre articles distincts, le corps se recoupe à 10 % au plus.
const MOTS_VIDES = new Set('a au aux avec ce ces cet cette comment dans de des du elle en est et etre il je la le les leur lui ma me mes moi mon ne ni nos notre on ou par pas pour qu que qui quoi sa se ses si son sur ta te tes toi ton tu un une vos votre vous plus ca'.split(' '));
const mots = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !MOTS_VIDES.has(w));
const groupes = (w, n) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s; };
const jaccard = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; const u = a.size + b.size - i; return u ? i / u : 0; };
const articles = pages.filter(p => !PAGES_HORS_ARTICLE.has(p)).map(p => {
  const s = fs.readFileSync(path.join(SITE, p), 'utf8');
  const extrait = re => ((s.match(re) || [])[1] || '');
  return {
    p,
    titre: new Set(mots(extrait(/<h1>([\s\S]*?)<\/h1>/))),
    bref: groupes(mots(extrait(/class="answer">([\s\S]*?)<\/div>/)), 2),
    corps: groupes(mots(extrait(/<main>([\s\S]*?)<\/main>/)), 3),
  };
});
for (let i = 0; i < articles.length; i++) {
  for (let j = i + 1; j < articles.length; j++) {
    const a = articles[i], b = articles[j];
    const t = jaccard(a.titre, b.titre), br = jaccard(a.bref, b.bref), c = jaccard(a.corps, b.corps);
    if (t >= 0.5 || br >= 0.4 || c >= 0.18) {
      err(`${a.p} et ${b.p}`, `trop proches (titre ${Math.round(t * 100)} %, En bref ${Math.round(br * 100)} %, corps ${Math.round(c * 100)} %) : l'article le plus récent doit apporter un angle vraiment nouveau, ou enrichir l'ancien au lieu de le répéter`);
    }
  }
}

if (erreurs.length) {
  console.log(`❌ ${erreurs.length} problème(s) :\n- ` + erreurs.join('\n- '));
  process.exit(1);
}
console.log(`✅ ${pages.length} pages vérifiées, aucun problème.`);
