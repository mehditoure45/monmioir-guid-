// Liste d'attente de la version anglaise de Mon Miroir (formulaire de /en/).
// Stocke seulement : l'e-mail, la langue choisie, le pays (déduit par Cloudflare) et la date.
// Aucune autre donnée, aucune revente. Base D1 liée sous le nom DB.

const TABLE = `CREATE TABLE IF NOT EXISTS liste_attente (
  email TEXT PRIMARY KEY, langue TEXT, pays TEXT, source TEXT, cree_le TEXT NOT NULL
)`;

const page = (titre, texte) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${titre} | Mon Miroir</title><link rel="stylesheet" href="/assets/style.css"></head>
<body><main><div class="wrap"><h1>${titre}</h1><p class="lead">${texte}</p>
<p><a href="/en/">Back</a></p></div></main></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (form.get('site')) return page('Thank you', 'You are on the list.'); // piège à robots : champ caché
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return page('Please check your email', 'That address does not look valid.');
  }
  if (!form.get('accord')) return page('One more thing', 'Please tick the box so we can email you when the English version launches.');
  if (!env.DB) return page('Sorry', 'The waitlist is temporarily unavailable. Please try again later.');
  const langue = String(form.get('langue') || 'en').slice(0, 20);
  const source = String(form.get('source') || '').slice(0, 60);
  const pays = (request.cf && request.cf.country) || null;
  await env.DB.prepare(TABLE).run();
  await env.DB.prepare('INSERT OR IGNORE INTO liste_attente (email, langue, pays, source, cree_le) VALUES (?, ?, ?, ?, ?)')
    .bind(email, langue, pays, source, new Date().toISOString()).run();
  return page('You are on the list', 'Thank you. We will email you once, when Mon Miroir is available in your language. Nothing else.');
}

export async function onRequestGet() {
  return new Response(null, { status: 302, headers: { location: '/en/' } });
}
