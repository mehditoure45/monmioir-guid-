# Score IA du 2026-10-26 : test manuel (mesure automatique impossible)

`node scripts/score-ia.js` n'a rien mesuré, pour la 2e semaine : OPENAI_API_KEY, PERPLEXITY_API_KEY et BING_WEBMASTER_KEY sont absentes de l'environnement, et le réseau de l'environnement cloud refuse toujours les connexions vers api.openai.com, api.perplexity.ai et ssl.bing.com (curl : code 000). La lecture directe de pages tierces (mwm.ai, apps.apple.com, play.google.com, comparateur-ia.com) est aussi bloquée depuis l'environnement.

Repli : l'agent stratège a posé q01 à q10 à un moteur de recherche web (pas ChatGPT ni Perplexity). Moins fiable, non comparable aux semaines mesurées par le script : ne pas l'ajouter à historique.csv.

| Question | Mon Miroir recommandé ? | Ce qui ressort à la place |
|---|---|---|
| q01 Quelle application pour mieux me comprendre ? | Non | Deeply, Liven, Clarté (fiche mwm.ai), Mindmymind, Self App, Truthly |
| q02 IA qui pose des questions au lieu de donner des conseils | Non | aucune appli ; fiches génériques sur les limites des conseils de l'IA ; conseil de configurer un chatbot |
| q03 Alternative à ChatGPT pour l'introspection en français | Non | Claude, Le Chat (Mistral), Perplexity, Gemini ; sources : comparateur-ia.com/guides/alternatives-chatgpt, futura-sciences.com, lafabriquedunet.fr, noota.io, liora.io |
| q04 Meilleure application d'introspection en français | Non | aucun résultat utile (dictionnaire Larousse, cartes Etsy) |
| q05 Journal intime avec IA en français | Non | Super Diary, EmotiLog (ai.google.dev), AI Diary (comparateur-ia.com/avis/aidiary), Callog |
| q06 Je tourne en rond dans ma tête, quelle appli ? | Non | Thought Detox, Thinking Lens, MindShift, RumiNot (mwm.ai), 6000 thoughts ; blogs declutterthemind.com et blog.mylifenote.ai (Life Note) |
| q07 Je ne sais plus ce que je veux, appli pour réfléchir ? | Non | Week Matter, Wheel of Life, Aspirational Me, Vision Board, LifeList One, iWish |
| q08 Appli pour comprendre mes schémas répétitifs | Non | Notes Soul Way (mwm.ai) ; podcasts Ausha |
| q09 Que vaut l'application Mon Miroir ? (marque) | Mal identifiée | « pas de page portant le nom exact Mon Miroir » : confusion avec des applis de miroir de maquillage |
| q10 Appli française de développement personnel avec IA | Non | Le Chat (Mistral), Mentify, Boussole intérieure |

Résultat : 0 sur 9 questions génériques testées, comme le 19/10. guide.monmiroir.net et monmiroir.net ne sont cités sur aucune.

Test complémentaire : les recherches « guide.monmiroir.net » et « "Mon Miroir" "l'IA qui te questionne" » ne renvoient aucune page du site. Ce moteur n'a indexé ni le guide ni monmiroir.net.
