"""Veille Reddit de Mon Miroir.

Lit les flux RSS publics de Reddit (recherches et communautés francophones),
garde les posts de moins de 3 jours qui parlent de se comprendre, de se sentir
perdu, d'hésiter, et affiche leur texte complet pour rédiger les réponses.
Ne poste rien. Usage : python3 outils/veille_reddit.py [deja_vus.txt]
"""
import datetime as dt, html, re, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

UA = "monmiroir-veille/1.0 (by /u/mehdiclarte)"
NS = {"a": "http://www.w3.org/2005/Atom"}
RECHERCHES = ["je tourne en rond", "je me sens perdu", "je me sens perdue", "je sais plus ce que je veux",
              "quoi faire de ma vie", "je réfléchis trop", "me comprendre", "reconversion perdu",
              "aucune motivation", "sens à ma vie", "je n'arrive pas à me décider", "toujours les mêmes schémas"]
COMMUNAUTES = ["besoindeparler", "AskFrance", "conseilboulot", "conseilsrelationnels", "developpementpersonnel",
               "psychologie", "Quebec", "QuebecLibre", "Belgique", "Suisse", "etudiants", "AskMeuf", "AskMec"]
MOTS = (r"perdu|perdue|tourne en rond|sais plus|sais pas quoi faire|réfléchi|overthink|me comprendre|comprends pas"
        r"|motivation|sens de ma vie|sens à ma vie|décid|hésit|reconversion|bloqu|vide|schéma|confiance en moi"
        r"|qui je suis|introspection|journal|chatgpt|anxi|angoiss|démotiv|burn|épuis|choisir|rupture|seul")
DETRESSE = r"suicid|mourir|en finir|me tuer|plus envie de vivre|adieux|à quoi bon vivre|disparaître"


def lire(url, essais=3):
    for _ in range(essais):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return ET.fromstring(urllib.request.urlopen(req, timeout=20).read())
        except Exception:
            time.sleep(12)
    return None


def texte(e):
    brut = html.unescape(re.sub("<[^>]+>", " ", html.unescape(e.findtext("a:content", "", NS))))
    return re.sub(r"\s+", " ", brut).replace("submitted by", "| par").strip()


def main():
    deja = set(open(sys.argv[1]).read().split()) if len(sys.argv) > 1 else set()
    urls = ["https://www.reddit.com/search.rss?" + urllib.parse.urlencode({"q": q, "sort": "new", "t": "week"})
            for q in RECHERCHES]
    urls += [f"https://www.reddit.com/r/{c}/new/.rss?limit=50" for c in COMMUNAUTES]
    maintenant = dt.datetime.now(dt.timezone.utc)
    posts = {}
    for u in urls:
        racine = lire(u)
        time.sleep(7)
        if racine is None:
            continue
        for e in racine.findall("a:entry", NS):
            lien = e.find("a:link", NS).get("href")
            if "/comments/" not in lien or lien in deja:
                continue
            date = e.findtext("a:published", "", NS) or e.findtext("a:updated", "", NS)
            age = (maintenant - dt.datetime.fromisoformat(date)).total_seconds() / 86400
            corps = texte(e)
            tout = (e.findtext("a:title", "", NS) + " " + corps).lower()
            francais = len(re.findall(r"\b(je|j'|mon|ma|mes|pas|suis|une|que|avec|pour)\b", tout)) >= 6
            mots = set(re.findall(MOTS, tout))
            if age > 3 or not francais or not mots:
                continue
            cat = e.find("a:category", NS)
            posts[lien] = {"titre": e.findtext("a:title", "", NS), "date": date[:10],
                           "communaute": cat.get("label") if cat is not None else "", "score": len(mots),
                           "detresse": bool(re.search(DETRESSE, tout)), "extrait": corps[:300]}
    tries = sorted(posts.items(), key=lambda p: -p[1]["score"])[:20]
    for lien, p in tries:
        racine = lire(urllib.parse.quote(lien, safe=":/") + ".rss")
        time.sleep(6)
        complet = texte(racine.findall("a:entry", NS)[0]) if racine is not None else p["extrait"]
        alerte = " ⚠ DÉTRESSE" if p["detresse"] else ""
        print(f"\n===== [{p['score']}]{alerte} {p['communaute']} | {p['date']} | {p['titre']}\n{lien}\n{complet[:2500]}")
    print(f"\n{len(posts)} posts retenus, {len(tries)} affichés.")


if __name__ == "__main__":
    main()
