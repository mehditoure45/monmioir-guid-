// Passage vers les stores : /sortie/<emplacement>?vers=<lien>
// Compte le clic (page d'origine, store, emplacement du bouton), puis renvoie tout de suite vers le store.
// Les liens des pages y sont redirigés par _middleware.js, pour les visiteurs humains seulement.
// Rien de personnel n'est stocké : ni adresse IP, ni identifiant, seulement le pays.

const DESTINATIONS = [
  ['apps.apple.com', 'App Store'],
  ['play.google.com', 'Google Play'],
  ['monmiroir.net', 'Site de l\'app'],
];
const EMPLACEMENTS = new Set(['menu', 'article', 'pied']);

// Code fournisseur Apple (App Store Connect → App Analytics → Campagnes, paramètre pt).
// Une fois renseigné, chaque lien App Store porte le nom de l'article (ct) : Apple compte alors
// les téléchargements par article, comme Google Play avec utm_campaign.
const CODE_FOURNISSEUR_APPLE = '';

const TABLE = `CREATE TABLE IF NOT EXISTS clics (
  jour TEXT NOT NULL, page TEXT NOT NULL, destination TEXT NOT NULL, emplacement TEXT, pays TEXT
)`;

export async function onRequest({ request, env, params, waitUntil }) {
  const url = new URL(request.url);
  let vers;
  try { vers = new URL(url.searchParams.get('vers')); } catch (e) { return Response.redirect(`${url.origin}/`, 302); }
  const destination = vers.protocol === 'https:' && (DESTINATIONS.find(([hote]) => vers.hostname === hote) || [])[1];
  if (!destination) return Response.redirect(`${url.origin}/`, 302);

  const emplacement = EMPLACEMENTS.has(params.emplacement) ? params.emplacement : 'article';
  let page = 'inconnue';
  try {
    const ref = new URL(request.headers.get('referer'));
    if (ref.host === url.host) page = ref.pathname;
  } catch (e) { /* navigateur qui ne transmet pas la page d'origine */ }

  if (destination === 'App Store' && CODE_FOURNISSEUR_APPLE && !vers.searchParams.has('pt')) {
    const slug = page === '/' ? 'accueil' : page.replace(/\//g, '');
    vers.searchParams.set('pt', CODE_FOURNISSEUR_APPLE);
    vers.searchParams.set('ct', `${emplacement === 'pied' ? 'pied-' : ''}${slug}`.slice(0, 40));
    vers.searchParams.set('mt', '8');
  }

  const ua = request.headers.get('user-agent') || '';
  if (env.DB && !/bot|crawl|spider|preview|fetch|curl|wget/i.test(ua)) {
    const jour = new Date().toISOString().slice(0, 10);
    const pays = (request.cf && request.cf.country) || null;
    waitUntil((async () => {
      try {
        await env.DB.prepare(TABLE).run();
        await env.DB.prepare('INSERT INTO clics (jour, page, destination, emplacement, pays) VALUES (?, ?, ?, ?, ?)')
          .bind(jour, page, destination, emplacement, pays).run();
      } catch (e) { /* le comptage ne doit jamais bloquer le passage vers le store */ }
    })());
  }
  return Response.redirect(vers.toString(), 302);
}
