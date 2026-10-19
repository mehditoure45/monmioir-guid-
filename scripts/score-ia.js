// Score IA : quand on pose nos questions cibles à ChatGPT et à Perplexity, recommandent-ils Mon Miroir ?
// Lancé chaque lundi par l'agent stratège. Usage : node scripts/score-ia.js
// Clés lues dans l'environnement, chacune facultative : OPENAI_API_KEY, PERPLEXITY_API_KEY, BING_WEBMASTER_KEY.
// Modèles réglables : OPENAI_MODELE (gpt-5-mini par défaut), PERPLEXITY_MODELE (sonar par défaut).
// Écrit donnees/score-ia/AAAA-MM-JJ.json (réponses, sources citées, concurrents, données Bing)
// et ajoute une ligne par moteur dans donnees/score-ia/historique.csv.
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'donnees', 'score-ia');
const { questions } = JSON.parse(fs.readFileSync(path.join(RACINE, 'donnees', 'questions-ia.json'), 'utf8'));
const jour = new Date().toISOString().slice(0, 10);

const MON_MIROIR = /mon[\s-]?miroir/i;
const CONCURRENTS = ['Rosebud', 'Mindsera', 'Reflection', 'Day One', 'Stoic', 'Reflectly', 'Daylio', 'Journey', 'Diarium',
  'Penzu', 'Replika', 'Wysa', 'Youper', 'Woebot', 'Petit Bambou', 'Headspace', 'Calm', 'Mon Sherpa', 'Owlie', 'Kanopee',
  'Clearful', 'Insight Timer', 'Moodnotes', 'Bearable', 'Finch', 'Character.AI', 'Claude', 'Gemini', 'Copilot', 'Le Chat'];

const attendre = ms => new Promise(r => setTimeout(r, ms));
const domaine = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return null; } };

async function appel(url, cle, corps, essai = 1) {
  const rep = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(180000),
  });
  const texte = await rep.text();
  if ((rep.status === 429 || rep.status >= 500) && essai < 3) { await attendre(15000 * essai); return appel(url, cle, corps, essai + 1); }
  if (!rep.ok) throw new Error(`HTTP ${rep.status} : ${texte.slice(0, 300)}`);
  return JSON.parse(texte);
}

const MOTEURS = {
  chatgpt: {
    cle: 'OPENAI_API_KEY',
    modele: process.env.OPENAI_MODELE || 'gpt-5-mini',
    async demander(question, cle, modele) {
      const r = await appel('https://api.openai.com/v1/responses', cle, {
        model: modele,
        input: question,
        tools: [{ type: 'web_search', user_location: { type: 'approximate', country: 'FR' } }],
      });
      const morceaux = [], sources = [];
      let recherche = false;
      for (const item of r.output || []) {
        if (item.type === 'web_search_call') recherche = true;
        if (item.type !== 'message') continue;
        for (const c of item.content || []) {
          if (c.type !== 'output_text') continue;
          morceaux.push(c.text);
          for (const a of c.annotations || []) if (a.type === 'url_citation') sources.push({ url: a.url, titre: a.title || '' });
        }
      }
      return { reponse: morceaux.join('\n'), sources, recherche };
    },
  },
  perplexity: {
    cle: 'PERPLEXITY_API_KEY',
    modele: process.env.PERPLEXITY_MODELE || 'sonar',
    async demander(question, cle, modele) {
      const r = await appel('https://api.perplexity.ai/chat/completions', cle, { model: modele, messages: [{ role: 'user', content: question }] });
      const titres = Object.fromEntries((r.search_results || []).map(s => [s.url, s.title || '']));
      const urls = r.citations || (r.search_results || []).map(s => s.url);
      const reponse = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || '';
      return { reponse, sources: urls.map(url => ({ url, titre: titres[url] || '' })), recherche: true };
    },
  },
};

function analyser(q, moteur, { reponse, sources, recherche }) {
  const domaines = [...new Set(sources.map(s => domaine(s.url)).filter(Boolean))];
  return {
    id: q.id, type: q.type, question: q.question, moteur,
    recommande: MON_MIROIR.test(reponse),
    siteDansSources: domaines.some(d => d.endsWith('monmiroir.net')),
    concurrents: CONCURRENTS.filter(n => new RegExp(`\\b${n.replace('.', '\\.')}\\b`).test(reponse)),
    recherche, domaines, sources: sources.slice(0, 15), reponse: reponse.slice(0, 6000),
  };
}

async function interroger(nom, m, cle) {
  const resultats = [];
  // 3 questions à la fois, pour aller vite sans se faire limiter
  for (let i = 0; i < questions.length; i += 3) {
    resultats.push(...await Promise.all(questions.slice(i, i + 3).map(async q => {
      try { return analyser(q, nom, await m.demander(q.question, cle, m.modele)); }
      catch (e) { return { id: q.id, type: q.type, question: q.question, moteur: nom, erreur: String(e.message || e) }; }
    })));
  }
  return resultats;
}

async function bing(cle) {
  const site = encodeURIComponent('https://guide.monmiroir.net/');
  const lire = async methode => {
    const r = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/${methode}?siteUrl=${site}&apikey=${cle}`, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`${methode} : HTTP ${r.status}`);
    return (await r.json()).d || [];
  };
  // Bing renvoie une ligne par semaine : on additionne par requête (ou par page) et on garde les 100 premières.
  const cumuler = lignes => {
    const t = {};
    for (const l of lignes) {
      const c = t[l.Query] || (t[l.Query] = { impressions: 0, clics: 0, position: l.AvgImpressionPosition });
      c.impressions += l.Impressions || 0; c.clics += l.Clicks || 0;
    }
    return Object.entries(t).map(([cle, v]) => ({ cle, ...v })).sort((a, b) => b.impressions - a.impressions).slice(0, 100);
  };
  const [requetes, pages] = await Promise.all([lire('GetQueryStats'), lire('GetPageStats')]);
  return { requetes: cumuler(requetes), pages: cumuler(pages) };
}

(async () => {
  const actifs = Object.entries(MOTEURS).filter(([, m]) => process.env[m.cle]);
  const absents = Object.values(MOTEURS).filter(m => !process.env[m.cle]).map(m => m.cle);
  if (!process.env.BING_WEBMASTER_KEY) absents.push('BING_WEBMASTER_KEY');
  if (absents.length) console.log(`⚠ Clé absente, mesure sautée : ${absents.join(', ')}`);
  if (!actifs.length && !process.env.BING_WEBMASTER_KEY) { console.log('Rien à mesurer : aucune clé.'); return; }

  const [parMoteur, donneesBing] = await Promise.all([
    Promise.all(actifs.map(([nom, m]) => interroger(nom, m, process.env[m.cle]))),
    process.env.BING_WEBMASTER_KEY ? bing(process.env.BING_WEBMASTER_KEY).catch(e => ({ erreur: String(e.message || e) })) : null,
  ]);
  const resultats = parMoteur.flat();

  // Synthèse : score par moteur (questions génériques), sites que les IA citent, concurrents cités
  const synthese = { parMoteur: {}, domainesCites: {}, concurrentsCites: {} };
  for (const [nom, m] of actifs) {
    const gen = resultats.filter(r => r.moteur === nom && r.type === 'generique');
    const ok = gen.filter(r => !r.erreur);
    synthese.parMoteur[nom] = {
      modele: m.modele, questions: ok.length, erreurs: gen.length - ok.length,
      recommande: ok.filter(r => r.recommande).length, siteDansSources: ok.filter(r => r.siteDansSources).length,
      questionsGagnees: ok.filter(r => r.recommande).map(r => r.id),
    };
  }
  for (const r of resultats.filter(r => !r.erreur && r.type === 'generique')) {
    for (const d of r.domaines) if (!d.endsWith('monmiroir.net')) synthese.domainesCites[d] = (synthese.domainesCites[d] || 0) + 1;
    for (const c of r.concurrents) synthese.concurrentsCites[c] = (synthese.concurrentsCites[c] || 0) + 1;
  }
  const trier = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([nom, n]) => ({ nom, n }));
  synthese.domainesCites = trier(synthese.domainesCites).slice(0, 40);
  synthese.concurrentsCites = trier(synthese.concurrentsCites);

  fs.mkdirSync(DOSSIER, { recursive: true });
  fs.writeFileSync(path.join(DOSSIER, `${jour}.json`), JSON.stringify({ date: jour, synthese, bing: donneesBing, resultats }, null, 1) + '\n');

  const csv = path.join(DOSSIER, 'historique.csv');
  const entete = 'date,moteur,modele,questions,recommande,site_dans_sources,erreurs';
  const anciennes = fs.existsSync(csv) ? fs.readFileSync(csv, 'utf8').trim().split('\n').slice(1).filter(l => !l.startsWith(`${jour},`)) : [];
  const nouvelles = Object.entries(synthese.parMoteur).map(([nom, s]) => [jour, nom, s.modele, s.questions, s.recommande, s.siteDansSources, s.erreurs].join(','));
  fs.writeFileSync(csv, [entete, ...anciennes, ...nouvelles].join('\n') + '\n');

  console.log(`Score IA du ${jour} (questions génériques où Mon Miroir est recommandé) :`);
  for (const [nom, s] of Object.entries(synthese.parMoteur)) {
    console.log(`- ${nom} (${s.modele}) : ${s.recommande}/${s.questions}, site cité en source ${s.siteDansSources} fois${s.erreurs ? `, ${s.erreurs} erreur(s)` : ''}`);
  }
  const erreurs = resultats.filter(r => r.erreur);
  if (erreurs.length) console.log(`⚠ Exemple d'erreur : ${erreurs[0].moteur} ${erreurs[0].id} : ${erreurs[0].erreur}`);
  console.log(`Sites les plus cités par les IA : ${synthese.domainesCites.slice(0, 8).map(d => `${d.nom} (${d.n})`).join(', ') || 'aucun'}`);
  console.log(`Concurrents cités : ${synthese.concurrentsCites.map(c => `${c.nom} (${c.n})`).join(', ') || 'aucun'}`);
  if (donneesBing) console.log(donneesBing.erreur ? `⚠ Bing : ${donneesBing.erreur}` : `Bing : ${donneesBing.requetes.length} requêtes, ${donneesBing.pages.length} pages`);
  console.log(`Détail : donnees/score-ia/${jour}.json`);
})().catch(e => { console.error(`❌ ${e.stack || e}`); process.exit(1); });
