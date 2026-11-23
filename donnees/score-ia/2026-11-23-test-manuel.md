# Score IA du 2026-11-23 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré, pour la 6e semaine : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement (« Rien à mesurer : aucune clé. »), et le réseau de l'environnement cloud refuse toujours api.openai.com, api.perplexity.ai, ssl.bing.com et monmiroir.net (curl : code 000). Les pages tierces citées (seeles.ai, webcatalog.io) sont aussi inaccessibles : impossible de vérifier un formulaire d'inscription.

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | How We Feel, Moodflow, Psyhelp, Liven, You-Me-It ; sources : fiches apps.apple.com, sherpas.com, nibble-app.com, iphon.fr |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | « pas d'outil commercial identifié » ; idée d'« IA socratique » (buzzwebzine.fr) et conseil d'écrire une consigne ; sources : techradar, hec.edu, formation.lefebvre-dalloz.fr, similarlabs.com/fr/p/ai-chatting |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Le Chat (Mistral), Perplexity ; sources : futura-sciences.com, comparateur-ia.com/guides/alternatives-chatgpt, topai.tools, clickup.com |
| q04 Meilleure application d'introspection en français | Non | Deeply App, Mindpiece, Zenfulnote, Psyhelp, Deepwander, Insight Timer ; sources : apps.apple.com, webcatalog.io, iphoneaddict.fr, positivepsychology.com/fr |
| q05 Journal intime avec IA en français | Non | Feeltracker, DayNote, Honestly, Clio, Rosebud, ZenDiary, Dottie, Reflectly ; sources : apps.apple.com, seeles.ai (guide en français mis à jour en novembre 2026), similarlabs.com, toolmage.com, aipure.ai |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Thinking Lens, Reframe, D-Clutter, NuMynd, Release It ; sources : uniquement des fiches apps.apple.com |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | « aucune appli francophone spécialement conçue pour ça » ; Me: Self-reflection, Life Audit, Your Life Compass, Purpose Finder |
| q08 Appli pour comprendre mes schémas répétitifs | Non | « un seul résultat pertinent » : Schema Pattern Finder (positivepsychology.com/fr) ; le reste hors sujet |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « pas d'application nommée exactement Mon Miroir » ; applis de miroir de maquillage |
| q10 Appli française de développement personnel avec IA | Non | « pas de recommandation fiable » ; Coach PLN AI, AI MY LIFE, Purpose, Sparky ; sources : apps.apple.com, makeheadway.com, moge.ai, aipure.ai |

Résultat : 0 sur 9 questions génériques testées, comme les 5 semaines précédentes. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune. Les recherches « guide.monmiroir.net » et « "Mon Miroir" "l'IA qui te questionne" » ne renvoient aucune page du site : ce moteur n'a toujours pas indexé le guide.

Sites les plus présents : apps.apple.com (q01, q04, q05, q06, q07, q09, q10), similarlabs.com (q02, q05), positivepsychology.com/fr (q04, q08), aipure.ai (q05, q10), comparateur-ia.com (q03). Nouveaux : webcatalog.io (q04) et seeles.ai (q05).

Sur q02, q07, q08 et q10, le moteur dit lui-même ne trouver aucune appli adaptée : la place est libre, le guide n'est simplement pas trouvé.

Côté site (7 jours) : Bing passe 289 fois (+65 %) et envoie 17 visiteurs ; ChatGPT (entraînement) 131 passages ; Claude (entraînement) 62 ; 0 visiteur venu d'une IA.
