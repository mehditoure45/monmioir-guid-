# Score IA du 2026-10-19 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement, et le réseau de l'environnement cloud refuse les connexions vers api.openai.com, api.perplexity.ai et ssl.bing.com.

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | appli Myers-Briggs, Clarté, listes d'applis de découverte de soi (mwm.ai, gridinsoft) |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | aucune appli ; conseil d'écrire un prompt « socratique » |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Le Chat (Mistral) ; sources : comparateur-ia.com, tool-advisor.fr, futura-sciences.com |
| q04 Meilleure application d'introspection en français | Non | aucun résultat utile (dictionnaire Larousse) |
| q05 Journal intime avec IA en français | Non | Super Diary, AI Diary (comparateur-ia.com), EmotiLog, Callog, Journalie (creati.ai) |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Jornali, Still, Lens Journal, Ponder, 6000 thoughts ; blog Rosebud |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | Balise, Wheel of Life, Reflexion Journaling, Way2me |
| q08 Appli pour comprendre mes schémas répétitifs | Non | Notes Soul Way (mwm.ai), Mindberg ; podcasts |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « aucune application nommée Mon Miroir » : confusion avec des applis de miroir de maquillage |
| q10 Appli française de développement personnel avec IA | Non | aucune appli précise |

Résultat : 0 sur 9 questions génériques testées. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune.
