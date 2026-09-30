// Tableau de bord privé : /tableau-de-bord?cle=...&jours=7
import { calculerStats } from './api/stats.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tableau = (titre, lignes, colonnes) => `
  <h2>${titre}</h2>
  ${lignes.length ? `<table><thead><tr>${colonnes.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>
  ${lignes.map(l => `<tr>${colonnes.map(c => `<td>${esc(l[c[1]])}</td>`).join('')}</tr>`).join('')}
  </tbody></table>` : '<p class="vide">Rien sur la période.</p>'}`;

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  if (!env.CLE || url.searchParams.get('cle') !== env.CLE) return new Response('Accès refusé', { status: 403 });
  if (!env.DB) return new Response('Base DB non liée', { status: 500 });
  const jours = Math.min(Math.max(parseInt(url.searchParams.get('jours') || '7', 10) || 7, 1), 365);
  const s = await calculerStats(env, url.origin, jours);
  const total = (arr) => arr.reduce((a, r) => a + r.n, 0);
  const lien = j => `<a href="?cle=${esc(env.CLE)}&jours=${j}"${j === jours ? ' class="actif"' : ''}>${j} jours</a>`;
  const muettes = s.pagesMuettes.map(p => ({ page: p.page, humains: p.sansVisiteur ? 'aucun' : 'oui', ia: p.sansRobotIA ? 'aucun' : 'oui' }));

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Tableau de bord des guides</title>
<style>
:root{--fond:#0b0b12;--carte:#161624;--texte:#e6e6ef;--doux:#9a9ab0;--accent:#7cc4f5}
body{margin:0;background:var(--fond);color:var(--texte);font-family:system-ui,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:24px 16px}
h1{font-size:24px}h2{font-size:17px;margin-top:32px}
.periode a{color:var(--doux);margin-right:12px}.periode a.actif{color:var(--accent);font-weight:600}
.chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0}
.chiffre{background:var(--carte);border-radius:12px;padding:16px}.chiffre b{display:block;font-size:28px}.chiffre span{color:var(--doux);font-size:13px}
table{width:100%;border-collapse:collapse;background:var(--carte);border-radius:12px;overflow:hidden;font-size:14px}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #26263a}th{color:var(--doux);font-weight:500}
.vide{color:var(--doux)}
</style></head><body><div class="wrap">
<h1>Tableau de bord des guides</h1>
<p class="periode">${[7, 30, 90].map(lien).join('')}</p>
<div class="chiffres">
  <div class="chiffre"><b>${total(s.humainsParPage)}</b><span>visites humaines</span></div>
  <div class="chiffre"><b>${total(s.provenances.filter(p => ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Copilot', 'Mistral'].includes(p.provenance)))}</b><span>visiteurs venus d'une IA</span></div>
  <div class="chiffre"><b>${total(s.robotsParNom)}</b><span>passages de robots</span></div>
  <div class="chiffre"><b>${s.pagesMuettes.filter(p => p.sansVisiteur).length}</b><span>pages sans visiteur</span></div>
  <div class="chiffre"><b>${s.listeAttente.total}</b><span>inscrits liste d'attente (autres langues)</span></div>
</div>
${tableau('Articles les plus lus (humains)', s.humainsParPage, [['Page', 'page'], ['Visites', 'n']])}
${tableau('D\'où viennent les visiteurs', s.provenances, [['Provenance', 'provenance'], ['Visites', 'n']])}
${tableau('Robots qui lisent le site', s.robotsParNom, [['Robot', 'robot'], ['Passages', 'n']])}
${tableau('Quel robot lit quelle page', s.robotsParPage, [['Page', 'page'], ['Robot', 'robot'], ['Passages', 'n']])}
${tableau('Liste d\'attente : par langue demandée', s.listeAttente.parLangue, [['Langue', 'langue'], ['Inscrits', 'n']])}
${tableau('Liste d\'attente : par pays', s.listeAttente.parPays, [['Pays', 'pays'], ['Inscrits', 'n']])}
${tableau('Pages à retravailler (sans visiteur ou jamais lues par une IA)', muettes, [['Page', 'page'], ['Visiteurs humains', 'humains'], ['Robots d\'IA', 'ia']])}
</div></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
