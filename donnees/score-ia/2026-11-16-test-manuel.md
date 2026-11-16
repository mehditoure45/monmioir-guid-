# Score IA du 2026-11-16 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré, pour la 5e semaine : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement, et le réseau de l'environnement cloud refuse toujours api.openai.com, api.perplexity.ai et ssl.bing.com (curl : code 000). Sont aussi bloqués cette semaine : monmiroir.net, apps.apple.com, play.google.com et similarlabs.com (impossible de vérifier les fiches stores ou une page d'inscription).

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | Moodflow, Pdb, Liven, Deeply App ; sources : nibble-app.com, sherpas.com, carepatron.com, positivepsychology.com/fr, fiches apps.apple.com |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | aucune appli ; « IA socratique » (buzzwebzine.fr) et conseil d'écrire une consigne à un assistant ; sources : techradar, formation.lefebvre-dalloz.fr, hec.edu |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Le Chat (Mistral), Perplexity ; sources : comparateur-ia.com/guides/alternatives-chatgpt, futura-sciences.com, topai.tools, geotoolbox.ai |
| q04 Meilleure application d'introspection en français | Non | Day One, Journal intime, Diarly, Stoic, Life Note ; sources : clickup.com, similarlabs.com, mwm.ai, blog.mylifenote.ai, evernote.com, yaps.ai |
| q05 Journal intime avec IA en français | Non | Maumo, Honestly, Feeltracker, Clio, Rosebud, ZenDiary, Reflectly ; sources : apps.apple.com, similarlabs.com, toolmage.com, creati.ai, comparateur-ia.com |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Journey, Life Note, Wysa, RumiNot (mwm.ai), D-Clutter, Mindfluent ; sources : blog.mylifenote.ai, rosebud.app, declutterthemind.com |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | Reflection (toolguide.io), Reflect (mwm.ai), Me: Self-reflection, MapMyLife ; Skillshare |
| q08 Appli pour comprendre mes schémas répétitifs | Non | « une seule piste » : Schema Pattern Finder (positivepsychology.com/fr) ; le reste hors sujet (motifs graphiques) |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « aucune application appelée précisément Mon Miroir » ; applis miroir de maquillage sur apps.apple.com |
| q10 Appli française de développement personnel avec IA | Non | « pas d'appli française clairement identifiée » ; Purpose, Ren, Coach PNL AI, Headway ; sources : makeheadway.com, nibble-app.com, similarlabs.com |

Résultat : 0 sur 9 questions génériques testées, comme les 19/10, 26/10, 02/11 et 09/11. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune. Une recherche « guide.monmiroir.net Mon Miroir l'IA qui te questionne » ne renvoie toujours aucune page du site sur ce moteur.

Sites les plus présents : apps.apple.com (q01, q04, q05, q06, q07, q09, q10), similarlabs.com (q02, q04, q05, q10), mwm.ai (q04, q06, q07), positivepsychology.com/fr (q01, q08), comparateur-ia.com (q03, q05). Nouveau cette semaine : similarlabs.com (annuaire d'applis et d'outils IA en français).

Côté site : Bing passe 176 fois en 7 jours et envoie 13 visiteurs ; ChatGPT (robot d'entraînement) a relu 126 pages ; Claude a lu 4 pages pour répondre à un utilisateur. Le guide est donc lu, mais pas encore cité.
