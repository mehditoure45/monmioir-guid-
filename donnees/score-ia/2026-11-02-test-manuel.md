# Score IA du 2026-11-02 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré, pour la 3e semaine : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement, et le réseau de l'environnement cloud refuse toujours api.openai.com, api.perplexity.ai et ssl.bing.com (curl : code 000). apps.apple.com et play.google.com sont aussi bloqués (lecture des fiches impossible).

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | Deeply, Mindmymind, Reflectr (toolmage.com), 6000thoughts, Clarté (mwm.ai) ; fiches apps.apple.com |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | « pas d'application spécialisée trouvée » ; conseil de configurer ChatGPT, Claude ou Gemini ; sources : coactive.com, techradar.com |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Mistral, Perplexity, Gemini, Copilot ; sources : comparateur-ia.com/guides/alternatives-chatgpt, geotoolbox.ai, liora.io, topai.tools |
| q04 Meilleure application d'introspection en français | Non | Zenfulnote, Mindpiece (apps.apple.com) ; positivepsychology.com/fr ; dictionnaires |
| q05 Journal intime avec IA en français | Non | Reflectly, Miary, Journal Intime - Carnet Secret (apps.apple.com) ; comparateur-ia.com |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Mind Backlog, Clarido, Mindfluent, The Final Line (mwm.ai), Blank ; blog rosebud.app |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | Life Audit (apps.apple.com), modèles ClickUp et Miro, positivepsychology.com/fr, podcast Ausha |
| q08 Appli pour comprendre mes schémas répétitifs | Non | « Schema Pattern Finder » (positivepsychology.com/fr), podcasts Ausha |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « aucun résultat ne porte exactement ce nom » : applis de miroir et de maquillage, Golden Ratio Face - Miroir |
| q10 Appli française de développement personnel avec IA | Non | aucune appli recommandée « avec confiance » |

Résultat : 0 sur 9 questions génériques testées, comme le 19/10 et le 26/10. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune.

Tests complémentaires :
- « guide.monmiroir.net » / « monmiroir.net » introspection : aucune page du site. Ce moteur n'a toujours indexé ni le guide ni monmiroir.net.
- « Mon Miroir » app introspection iPhone : la fiche App Store de Mon Miroir n'apparaît pas. Ressortent à la place deux applis d'introspection aux noms proches, « Mirrors » et « Mirror Mind », et des miroirs de maquillage.
- IndexNow fonctionne : la publication du 02/11 a reçu le code 200 (journal du workflow « Publier le site »). Bing est donc prévenu à chaque publication ; le blocage n'est pas technique.
