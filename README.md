# figma-DisplayContextVariables
Générateur de variables Figma au format JSON.

## 📦 Installation

```bash
npm install
```

## 🚀 Utilisation

### Générer les collections

```bash
npm run generate
```

Cela va :
1. Compiler le TypeScript
2. Générer un fichier ZIP par collection dans le dossier `output/`
3. Chaque ZIP contient un JSON par mode + un manifest

### Développement

```bash
# Exécuter sans compiler
npm run dev

# Compiler uniquement
npm run build
```

## 📁 Structure du projet

```
src/
├── constants.ts              # Constantes et enums (types de variables, scopes)
├── utils.ts                  # Fonctions utilitaires (génération JSON, ZIP)
├── collections/              # Fichiers de collections
│   └── example-collection.ts # Exemple de collection
└── index.ts                  # Point d'entrée principal
```

## ✨ Créer une nouvelle collection

1. Créez un fichier dans `src/collections/`, ex: `my-collection.ts`
2. Définissez votre collection :

```typescript
import { FigmaCollection } from '../utils';
import { SCOPES } from '../constants';

export const myCollection: FigmaCollection = {
  id: 'unique-id',
  name: 'Ma Collection',
  modes: [
    { modeId: 'mode-1', name: 'Mode 1' },
    { modeId: 'mode-2', name: 'Mode 2' },
  ],
  variables: [
    {
      id: 'var-1',
      name: 'colors/primary',
      type: 'number' | 'color' | 'string' | 'boolean',
      scopes: [SCOPES.ALL],
      values: {
        'mode-1': { r: 0.2, g: 0.4, b: 0.8, a: 1 },
        'mode-2': { r: 0.4, g: 0.6, b: 1, a: 1 },
      },
    },
  ],
};
```

3. Importez et ajoutez-la dans `src/index.ts` :

```typescript
import { myCollection } from './collections/my-collection';

const collections = [
  exampleCollection,
  myCollection, // Ajoutez ici
];
```

## 📄 Format de sortie

Chaque ZIP contient un fichier JSON par mode (`mode-name.json`) au format Figma.

Exemple de structure JSON :

```json
{
  "example color": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [1, 1, 1],
      "alpha": 1,
      "hex": "#FFFFFF"
    },
    "$extensions": {
      "com.figma.scopes": ["ALL_SCOPES"]
    }
  },
  "example number": {
    "$type": "number",
    "$value": 20,
    "$extensions": {
      "com.figma.hiddenFromPublishing": true,
      "com.figma.scopes": ["ALL_SCOPES"]
    }
  },
  "example string": {
    "$type": "string",
    "$value": "Valeur de chaîne",
    "$extensions": {
      "com.figma.type": "string",
      "com.figma.scopes": ["ALL_SCOPES"]
    }
  },
  "example boolean": {
    "$type": "number",
    "$value": 0,
    "$extensions": {
      "com.figma.type": "boolean",
      "com.figma.scopes": ["ALL_SCOPES"]
    }
  },
  "$extensions": {
    "com.figma.modeName": "Mode 1"
  }
}
```

## 🔧 Types de variables supportés

- `color` : Couleurs (RGBA ou hex)
- `number` : Nombres décimaux
- `string` : Chaînes de caractères
- `boolean` : Booléens (stockés comme 0/1)