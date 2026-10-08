#!/usr/bin/env python3
"""Suivi des réponses aux commentaires Reddit de Mehdi.

Usage : python3 outils/suivi_reddit.py <pseudo_reddit> [jours=14] [deja_vus.txt]

Lit le flux public des commentaires du compte, puis pour chacun (des N derniers jours) :
- les réponses directes sous son commentaire,
- les nouveaux messages de l'auteur du post (OP) dans le fil, après son commentaire.
Les réponses déjà listées dans deja_vus.txt sont marquées « déjà vu » ; les nouvelles y sont ajoutées.
Rien n'est posté : lecture seule des flux RSS publics.
"""
import sys, time, re, html, urllib.request, urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

NS = {'a': 'http://www.w3.org/2005/Atom'}
UA = 'Mozilla/5.0 suivi-mehdi'

def flux(url, essais=4):
    url = urllib.parse.quote(url, safe=':/?=&%')
    for i in range(essais):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return ET.fromstring(r.read())
        except Exception as e:
            if '429' in str(e):
                time.sleep(20 * (i + 1))
            else:
                time.sleep(5)
    return None

def entrees(racine):
    res = []
    if racine is None:
        return res
    for e in racine.findall('a:entry', NS):
        auteur = (e.findtext('a:author/a:name', '', NS) or '').replace('/u/', '')
        lien = e.find('a:link', NS).get('href')
        date = e.findtext('a:updated', '', NS)
        texte = re.sub(r'<[^>]+>', ' ', html.unescape(e.findtext('a:content', '', NS)))
        texte = re.sub(r'\s+', ' ', texte).replace('[link] [comments]', '').strip()
        res.append({'auteur': auteur, 'lien': lien, 'date': date, 'texte': texte})
    return res

def id_de(lien):
    return lien.rstrip('/').split('/')[-1]

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    pseudo = sys.argv[1]
    jours = int(sys.argv[2]) if len(sys.argv) > 2 else 14
    fichier_vus = sys.argv[3] if len(sys.argv) > 3 else None
    vus = set()
    if fichier_vus:
        try:
            vus = set(open(fichier_vus).read().split())
        except FileNotFoundError:
            pass
    limite = datetime.now(timezone.utc) - timedelta(days=jours)

    mes_coms = [c for c in entrees(flux(f'https://www.reddit.com/user/{pseudo}/comments/.rss?limit=100'))
                if datetime.fromisoformat(c['date']) >= limite]
    print(f'{len(mes_coms)} commentaires de u/{pseudo} sur les {jours} derniers jours\n')
    nouveaux = []
    for c in mes_coms:
        time.sleep(7)
        fil = entrees(flux(c['lien'] + '.rss'))
        if not fil:
            print(f'(fil illisible) {c["lien"]}\n'); continue
        post = fil[0]
        op = post['auteur']
        reponses = [e for e in fil[1:] if e['auteur'] not in (pseudo, '', '[deleted]') and e['texte'] not in ('[deleted]', '[removed]') and id_de(e['lien']) != id_de(c['lien'])]
        time.sleep(7)
        tout = entrees(flux(post['lien'] + '.rss?limit=100'))
        for e in tout[1:]:
            if op not in ('', '[deleted]') and e['auteur'] == op and e['texte'] not in ('[deleted]', '[removed]') and e['date'] > c['date'] and all(e['lien'] != r['lien'] for r in reponses):
                e['op_ailleurs'] = True
                reponses.append(e)
        titre = post['lien'].rstrip('/').split('/')[-1]
        print(f'===== {titre}\n {c["lien"]}\n Ton commentaire ({c["date"][:10]}) : {c["texte"][:140]}…')
        if not reponses:
            print(' Aucune réponse pour l\'instant.\n'); continue
        for r in reponses:
            rid = id_de(r['lien'])
            etat = 'déjà vu' if rid in vus else 'NOUVEAU'
            qui = 'OP' if r['auteur'] == op else 'autre'
            ou = ' (ailleurs dans le fil)' if r.get('op_ailleurs') else ''
            print(f' [{etat}] {qui} u/{r["auteur"]} {r["date"][:16]}{ou}\n  {r["lien"]}\n  {r["texte"][:1500]}')
            if rid not in vus:
                nouveaux.append(rid)
                vus.add(rid)
        print()
    if fichier_vus and nouveaux:
        with open(fichier_vus, 'a') as f:
            f.write('\n'.join(nouveaux) + '\n')
    print(f'{len(nouveaux)} nouvelle(s) réponse(s).')

if __name__ == '__main__':
    main()
