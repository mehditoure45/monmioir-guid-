// Journal des visites de guide.monmiroir.net (Cloudflare Pages Functions).
// Pour chaque page HTML servie, on note : la page, s'il s'agit d'un robot (et lequel),
// et d'où vient le visiteur humain (ChatGPT, Perplexity, Google...).
// Rien de personnel n'est stocké : ni adresse IP, ni identifiant, seulement le pays.
// Base D1 liée sous le nom DB. Sans base liée, le site fonctionne normalement, sans journal.
// Pour les visiteurs humains, les liens vers l'App Store, Google Play et l'app passent par /sortie/,
// qui compte le clic puis renvoie vers le store. Les robots voient toujours les liens directs.

const ROBOTS = [
  ['GPTBot', 'ChatGPT (entraînement)'],
  ['OAI-SearchBot', 'ChatGPT (recherche)'],
  ['ChatGPT-User', 'ChatGPT (lecture pour un utilisateur)'],
  ['ClaudeBot', 'Claude (entraînement)'],
  ['Claude-SearchBot', 'Claude (recherche)'],
  ['Claude-User', 'Claude (lecture pour un utilisateur)'],
  ['anthropic-ai', 'Claude (autre)'],
  ['PerplexityBot', 'Perplexity (recherche)'],
  ['Perplexity-User', 'Perplexity (lecture pour un utilisateur)'],
  ['MistralAI-User', 'Mistral Le Chat'],
  ['DuckAssistBot', 'DuckDuckGo IA'],
  ['Google-Extended', 'Gemini'],
  ['Googlebot', 'Google'],
  ['bingbot', 'Bing (et Copilot / ChatGPT)'],
  ['Applebot', 'Apple (Siri, Spotlight)'],
  ['meta-externalagent', 'Meta IA'],
  ['Amazonbot', 'Amazon'],
  ['CCBot', 'Common Crawl'],
  ['Bytespider', 'ByteDance'],
];

const PROVENANCES = [
  ['chatgpt.com', 'ChatGPT'], ['chat.openai.com', 'ChatGPT'],
  ['perplexity.ai', 'Perplexity'], ['claude.ai', 'Claude'],
  ['gemini.google.com', 'Gemini'], ['copilot.microsoft.com', 'Copilot'],
  ['chat.mistral.ai', 'Mistral'],
  ['google.', 'Google'], ['bing.com', 'Bing'], ['duckduckgo.com', 'DuckDuckGo'],
  ['ecosia.org', 'Ecosia'], ['qwant.com', 'Qwant'],
  ['monmiroir.net', 'Interne'],
  ['tiktok.com', 'TikTok'], ['instagram.com', 'Instagram'], ['linkedin.com', 'LinkedIn'],
];

const TABLE = `CREATE TABLE IF NOT EXISTS visites (
  jour TEXT NOT NULL, page TEXT NOT NULL, robot TEXT, provenance TEXT, pays TEXT
)`;

// Liens comptés : stores et page de téléchargement de l'app (pas les mentions légales ni la confidentialité).
const SORTIES = /^https:\/\/(apps\.apple\.com\/|play\.google\.com\/|monmiroir\.net\/app)/;

export async function onRequest(context) {
  const reponse = await context.next();
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const estPage = request.method === 'GET' && (url.pathname.endsWith('/') || url.pathname.endsWith('.html'));
    const exclu = url.pathname.startsWith('/tableau-de-bord') || url.pathname.startsWith('/api/');
    if (!estPage || exclu || reponse.status >= 400) return reponse;
    const ua = request.headers.get('user-agent') || '';
    const robot = (ROBOTS.find(([cle]) => ua.toLowerCase().includes(cle.toLowerCase())) || [])[1] || null;
    if (env.DB) {
      let provenance = null;
      if (!robot) {
        const ref = request.headers.get('referer') || '';
        const utm = url.searchParams.get('utm_source') || '';
        const hote = ref ? new URL(ref).hostname : '';
        provenance = (PROVENANCES.find(([cle]) => hote.includes(cle) || utm.includes(cle.split('.')[0])) || [])[1]
          || (hote ? 'Autre site' : 'Direct');
      }
      const jour = new Date().toISOString().slice(0, 10);
      const pays = (request.cf && request.cf.country) || null;
      context.waitUntil((async () => {
        await env.DB.prepare(TABLE).run();
        await env.DB.prepare('INSERT INTO visites (jour, page, robot, provenance, pays) VALUES (?, ?, ?, ?, ?)')
          .bind(jour, url.pathname, robot, provenance, pays).run();
      })());
    }
    if (!robot && (reponse.headers.get('content-type') || '').includes('text/html')) return compterLesSorties(reponse);
  } catch (e) {
    // Le journal ne doit jamais casser le site.
  }
  return reponse;
}

// Réécrit les liens vers les stores en /sortie/<emplacement>?vers=<lien d'origine>.
// L'emplacement (menu, article, pied) dit quel bouton a été cliqué ; la page d'origine est lue par /sortie/ dans le Referer.
function compterLesSorties(reponse) {
  let zone = 'article';
  const suivreZone = nom => ({ element(el) { zone = nom; el.onEndTag(() => { zone = 'article'; }); } });
  return new HTMLRewriter()
    .on('.site-header', suivreZone('menu'))
    .on('.site-footer', suivreZone('pied'))
    .on('a[href]', {
      element(a) {
        const href = (a.getAttribute('href') || '').replace(/&amp;/g, '&');
        if (SORTIES.test(href)) a.setAttribute('href', `/sortie/${zone}?vers=${encodeURIComponent(href)}`);
      },
    })
    .transform(reponse);
}
