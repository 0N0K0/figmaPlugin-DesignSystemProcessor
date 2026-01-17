# Design System Processor

Plugin Figma avec architecture TypeScript modulaire, compilation avec esbuild et support des librairies Node.js.

## 📁 Structure

```
plugin/
├── src/                    # Code source TypeScript
│   ├── main.ts            # Point d'entrée principal
│   ├── types.ts           # Types et interfaces partagés
│   ├── utils.ts           # Fonctions utilitaires
│   └── services.ts        # Services métier
├── dist/                   # Fichiers compilés
│   └── code.js            # Bundle final (généré)
├── build.js               # Script de build esbuild
├── manifest.json          # Configuration du plugin Figma
├── ui.html                # Interface utilisateur
├── package.json           # Dépendances npm
└── tsconfig.json          # Configuration TypeScript
```

## 🚀 Installation

```bash
cd plugin
npm install
```

## 🛠️ Développement

### Build unique
```bash
npm run build
```

### Mode watch (rebuild automatique)
```bash
npm run watch
# ou
npm run dev
```

## 📦 Ajout de librairies Node.js

Pour utiliser des librairies npm dans votre plugin :

1. **Installer la librairie** :
   ```bash
   npm install nom-de-la-librairie
   ```

2. **L'importer dans votre code TypeScript** :
   ```typescript
   import { maFonction } from 'nom-de-la-librairie';
   ```

3. **Rebuild** - esbuild va automatiquement bundler la librairie dans `code.js`

### Exemples de librairies utiles

```bash
# Manipulation de dates
npm install date-fns

# UUID
npm install uuid
npm install --save-dev @types/uuid

# Lodash (utilitaires)
npm install lodash
npm install --save-dev @types/lodash

# Color manipulation
npm install chroma-js
npm install --save-dev @types/chroma-js
```

## 🎯 Architecture Modulaire

### `main.ts` - Point d'entrée
- Initialise le plugin
- Gère la communication avec l'UI
- Orchestre les services

### `types.ts` - Types partagés
- Interfaces
- Types
- Enums

### `utils.ts` - Fonctions utilitaires
- Manipulation de nodes
- Helpers génériques
- Fonctions pures

### `services.ts` - Logique métier
- Classes de services
- Logique complexe
- Traitement de données

## 📝 Utilisation dans Figma

1. Ouvrir Figma Desktop
2. Menu **Plugins** → **Development** → **Import plugin from manifest...**
3. Sélectionner le fichier `manifest.json`
4. Le plugin apparaît dans **Plugins** → **Development** → **Plugin Complexe**

## 🔧 Configuration esbuild

Le fichier `build.js` configure esbuild pour :
- ✅ Bundler tous les fichiers TS en un seul `code.js`
- ✅ Inclure les librairies Node.js
- ✅ Minification en production
- ✅ Sourcemaps en développement
- ✅ Mode watch pour le développement
- ✅ Format IIFE pour Figma

## 💡 Exemple d'extension

### Ajouter un nouveau service

1. Créer `src/myService.ts` :
```typescript
export class MyService {
  doSomething() {
    // votre code
  }
}
```

2. L'importer dans `main.ts` :
```typescript
import { MyService } from './myService';
const myService = new MyService();
```

3. Rebuild automatique si en mode watch !

## 🐛 Debugging

Les `console.log()` apparaissent dans :
- Figma Desktop : **Menu** → **Plugins** → **Development** → **Open Console**

## 📚 Ressources

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [esbuild Documentation](https://esbuild.github.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
