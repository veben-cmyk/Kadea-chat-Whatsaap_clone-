# 🐞 Notice de suivi des bugs — Kadea Chat

Ce document liste les bugs détectés dans le projet, leur statut, la correction apportée (si applicable), et surtout **comment les éviter à l'avenir**. Il est mis à jour au fur et à mesure des découvertes.

Légende : ✅ Corrigé · 🟡 Connu, non corrigé · 🔍 En cours d'investigation

---

## ✅ Corrigés

### 1. Casse incorrecte des initiales (`helpers.js`)
- **Problème** : `obtenirInitiales("alex rivera")` renvoyait `"aR"` au lieu de `"AR"`.
- **Cause** : seule la 2ème lettre passait par `.toUpperCase()`, pas la 1ère.
- **Correction** : `.toUpperCase()` appliqué aux deux initiales.
- **Comment l'éviter à l'avenir** : quand une fonction traite plusieurs éléments de la même façon (ici 2 lettres), applique la même transformation aux deux plutôt que de la copier-coller à un seul endroit — un bon réflexe est d'écrire une petite fonction interne réutilisée pour chaque lettre.

### 2. Classe CSS `block` dupliquée (`chat.html`)
- **Problème** : `class="block text-[11px] text-gray-500 text-right block"` — la classe `block` apparaît deux fois.
- **Cause** : copier-coller de classes sans relecture.
- **Correction** : doublon supprimé.
- **Comment l'éviter à l'avenir** : une extension comme *Tailwind CSS IntelliSense* (VS Code) souligne les classes dupliquées automatiquement.

---

## 🟡 Connus, non corrigés (à traiter prochainement)

### 3. Clé API exposée côté client
- **Problème** : la clé `x-api-key` est écrite en dur dans `login.js`, `register.js`, `profil.js`, `chat.js`. Une fois le repo public, elle est lisible par n'importe qui.
- **Impact** : risque d'utilisation abusive de la clé par un tiers.
- **Piste de correction** : passer par un petit backend/proxy qui garde la clé côté serveur, ou (si c'est une clé sandbox pédagogique) documenter clairement qu'elle est publique par design.
- **Comment l'éviter à l'avenir** : ne jamais committer de clé/secret en dur dans le code front-end ; utiliser des variables d'environnement + un `.env` dans `.gitignore` dès le départ d'un projet.

### 4. Liens morts : `appel.html` et `archive.html`
- **Problème** : `chat.html` et `profil.html` pointent vers ces deux pages qui n'existent pas encore.
- **Impact** : clic → 404.
- **Piste de correction** : soit créer ces pages, soit remplacer temporairement les liens par `href="#"` avec un état visuel "à venir".
- **Comment l'éviter à l'avenir** : garder une checklist des pages prévues vs pages livrées avant de merger une feature dans `develop`.

### 5. Documentation API désynchronisée (`README.md`)
- **Problème** : le README ne documente que `GET/POST /messages`, alors que le code utilise aussi `GET /users`, `POST /conversations`, `GET/POST /conversations/:id/messages`, `PATCH/DELETE /messages/:id`.
- **Impact** : un autre développeur (ou toi dans 6 mois) se fie à une doc fausse.
- **Piste de correction** : mettre à jour la section API du README à chaque fois qu'un nouvel endpoint est utilisé dans le code.
- **Comment l'éviter à l'avenir** : traiter la doc comme faisant partie de la "definition of done" d'une feature — pas de merge tant que la doc n'est pas à jour.

### 6. Structure de dossiers annoncée vs réelle
- **Problème** : le README décrit un dossier `html/` contenant les pages, mais les liens internes (`href="login.html"`, etc.) supposent que tout est à la racine.
- **Impact** : confusion si quelqu'un réorganise les fichiers en suivant le README à la lettre → tous les liens cassent.
- **Piste de correction** : corriger le README pour refléter la structure réelle (déjà fait dans ce dépôt, voir `README.md`).
- **Comment l'éviter à l'avenir** : générer/vérifier la structure du README après coup plutôt qu'en avance sur le code, ou utiliser une commande comme `tree` pour la copier-coller directement depuis le projet réel.

---

## 🔍 À investiguer

*(Section libre — les prochains bugs que tu signales viennent ici avant d'être classés corrigés/connus.)*
