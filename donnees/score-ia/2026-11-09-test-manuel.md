# Score IA du 2026-11-09 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré, pour la 4e semaine : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement, et le réseau de l'environnement cloud refuse toujours api.openai.com, api.perplexity.ai et ssl.bing.com (curl : code 000). mwm.ai, comparateur-ia.com et monmiroir.net sont aussi bloqués depuis l'environnement (lecture impossible).

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | Reflectr (toolmage.com), 6000thoughts, Deeply, Self App, Clarté (mwm.ai), Pocket Insight ; fiches apps.apple.com |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | aucune appli ; conseil d'écrire une consigne à un assistant ; sources : consultation.avocat.fr, formation.lefebvre-dalloz.fr, letudiant.fr |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Le Chat (Mistral), Gemini, Copilot ; sources : comparateur-ia.com/guides/alternatives-chatgpt, geotoolbox.ai, futura-sciences.com, topai.tools |
| q04 Meilleure application d'introspection en français | Non | Zenfulnote (apps.apple.com, pas en français) ; positivepsychology.com/fr ; dictionnaires |
| q05 Journal intime avec IA en français | Non | Jana AI, ZenDiary, AI Diary, Feeltracker, Reflectly, Journalie, MyJournee ; sources : ai.google.dev, creati.ai, toolmage.com, comparateur-ia.com |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Nonori, Close Your Brain Pages, NuMynd, RumiNot (mwm.ai), Loop Mind ; fiches apps.apple.com |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | 6 Pillars, MapMyLife, LifeWheel, Lyfleap, Life Audit ; mwm.ai, positivepsychology.com/fr |
| q08 Appli pour comprendre mes schémas répétitifs | Non | « aucune application précise » ; Schema Pattern Finder (positivepsychology.com/fr), podcasts Ausha, brut.media |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « aucune source n'évalue une application appelée Mon Miroir » ; Mirrors (App Store), miroirs connectés |
| q10 Appli française de développement personnel avec IA | Non | aucune appli trouvée |

Résultat : 0 sur 9 questions génériques testées, comme les 19/10, 26/10 et 02/11. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune. Une recherche « monmiroir.net » ou « guide.monmiroir.net » ne renvoie toujours aucune page du site sur ce moteur.

Sites les plus présents : apps.apple.com (q01, q04, q05, q06, q07), mwm.ai (q01, q06, q07), positivepsychology.com/fr (q04, q07, q08), comparateur-ia.com (q03, q05), toolmage.com (q01, q05).

Côté site : Bing envoie quelques visiteurs (10 en 7 jours) et passe 163 fois par semaine, donc le guide est connu de Bing, même si ce moteur de test ne le connaît pas.
