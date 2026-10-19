// Chiffres du tableau de bord, en JSON : /api/stats?cle=...&jours=7
// Lus par la page /tableau-de-bord et par l'agent bilan hebdomadaire.

export async function calculerStats(env, origine, jours) {
  const depuis = new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10);
  const q = (sql, ...p) => env.DB.prepare(sql).bind(...p).all().then(r => r.results || []);

  const [humainsParPage, provenances, robotsParNom, robotsParPage, parJour] = await Promise.all([
    q(`SELECT page, COUNT(*) n FROM visites WHERE robot IS NULL AND jour >= ? GROUP BY page ORDER BY n DESC`, depuis),
    q(`SELECT provenance, COUNT(*) n FROM visites WHERE robot IS NULL AND jour >= ? GROUP BY provenance ORDER BY n DESC`, depuis),
    q(`SELECT robot, COUNT(*) n FROM visites WHERE robot IS NOT NULL AND jour >= ? GROUP BY robot ORDER BY n DESC`, depuis),
    q(`SELECT page, robot, COUNT(*) n FROM visites WHERE robot IS NOT NULL AND jour >= ? GROUP BY page, robot ORDER BY n DESC`, depuis),
    q(`SELECT jour, SUM(robot IS NULL) humains, SUM(robot IS NOT NULL) robots FROM visites WHERE jour >= ? GROUP BY jour ORDER BY jour`, depuis),
  ]);

  // Pages du sitemap jamais visitées par un humain ni lues par un robot d'IA sur la période
  let pagesMuettes = [];
  try {
    const sitemap = await (await env.ASSETS.fetch(new URL('/sitemap.xml', origine))).text();
    const pages = [...sitemap.matchAll(/<loc>https:\/\/guide\.monmiroir\.net([^<]*)<\/loc>/g)].map(m => m[1] || '/');
    const vues = new Set(humainsParPage.map(r => r.page));
    const luesIA = new Set(robotsParPage.filter(r => !/^(Google|Bing|Apple|Amazon|Common|ByteDance)/.test(r.robot)).map(r => r.page));
    pagesMuettes = pages.map(page => ({ page, sansVisiteur: !vues.has(page), sansRobotIA: !luesIA.has(page) }))
      .filter(p => p.sansVisiteur || p.sansRobotIA);
  } catch (e) { /* sitemap illisible : on s'en passe */ }

  let listeAttente = { total: 0, parLangue: [], parPays: [] };
  try {
    const tot = await q(`SELECT COUNT(*) n FROM liste_attente`);
    listeAttente = { total: tot[0] ? tot[0].n : 0,
      parLangue: await q(`SELECT langue, COUNT(*) n FROM liste_attente GROUP BY langue ORDER BY n DESC`),
      parPays: await q(`SELECT pays, COUNT(*) n FROM liste_attente GROUP BY pays ORDER BY n DESC`) };
  } catch (e) { /* table pas encore créée : personne inscrit */ }

  // Clics vers l'App Store, Google Play et l'app (comptés par /sortie/ depuis le 19/10/2026)
  let clics = { total: 0, parDestination: [], parEmplacement: [], parPage: [], tauxParPage: [] };
  try {
    const [parDestination, parEmplacement, parPage] = await Promise.all([
      q(`SELECT destination, COUNT(*) n FROM clics WHERE jour >= ? GROUP BY destination ORDER BY n DESC`, depuis),
      q(`SELECT emplacement, COUNT(*) n FROM clics WHERE jour >= ? GROUP BY emplacement ORDER BY n DESC`, depuis),
      q(`SELECT page, destination, COUNT(*) n FROM clics WHERE jour >= ? GROUP BY page, destination ORDER BY n DESC`, depuis),
    ]);
    const parPageTotal = {};
    for (const r of parPage) parPageTotal[r.page] = (parPageTotal[r.page] || 0) + r.n;
    const tauxParPage = humainsParPage.filter(r => parPageTotal[r.page])
      .map(r => ({ page: r.page, visites: r.n, clics: parPageTotal[r.page], taux: `${Math.round(100 * parPageTotal[r.page] / r.n)} %` }))
      .sort((a, b) => b.clics - a.clics);
    clics = { total: parDestination.reduce((a, r) => a + r.n, 0), parDestination, parEmplacement, parPage, tauxParPage };
  } catch (e) { /* table pas encore créée : aucun clic */ }

  return { listeAttente, periode_jours: jours, depuis, humainsParPage, provenances, robotsParNom, robotsParPage, parJour, pagesMuettes, clics };
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  if (!env.CLE || url.searchParams.get('cle') !== env.CLE) return new Response('Accès refusé', { status: 403 });
  if (!env.DB) return Response.json({ erreur: 'Base DB non liée' }, { status: 500 });
  const jours = Math.min(Math.max(parseInt(url.searchParams.get('jours') || '7', 10) || 7, 1), 365);
  return Response.json(await calculerStats(env, url.origin, jours), { headers: { 'Cache-Control': 'no-store' } });
}
