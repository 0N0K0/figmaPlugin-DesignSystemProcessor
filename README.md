# figma-Foundation

Générateur d'environnement de Design pour Figma

## 🧩 Fonctionnalités

L'applicatif permet de :

- génèrer des Variables pour Figma
- les importer via un pluggin
- générer un composant pour différentes tailles de Viewport
- générer des pages de présentation pour ces différentes tailles de Viewport
-

### Fonctionnalité à venir :

- génération de styles
- génération de composants à partir d'images
- génération des variables pour CSS

## 📦 Installation

```bash
npm install
```

## 🚀 Utilisation

### Générer les collections

```bash
npm run generate # compile et génère toutes les collections
npm run display-context # génère les collections du display-context
npm run colors # génère les collections de couleurs

# Génère une collection :
npm run breakpoints
npm run ratios
npm run orientations
npm run devices
npm run content-height
npm run vertical-densities
npm run colors-base
npm run palette
npm run theme
npm run brand
npm run feedback
npm run neutral
npm run typography
npm run radius
npm run placeholders
```

Cela permet de :

1. Compiler éventuellement le TypeScript
2. Générer un dossier par collection dans le dossier `output/` contenant un JSON par mode

### Développement

```bash
npm run dev      # Exécuter sans compiler
npm run build    # Compiler uniquement
```

## 📁 Structure du projet

```
src/
├── index.ts                  # Point d'entrée principal
├── types.ts                  # Types TypeScript
├── constants/                # Constantes
│   ├── colorConstants.ts
│   ├── figmaConstants.ts
│   └── systemConstants.ts
├── utils/                    # Fonctions utilitaires
│   ├── collectionGenerator.ts
│   ├── colorUtils.ts
│   ├── figmaUtils.ts
│   ├── fsUtils.ts
│   └── jsonUtils.ts
└── collections/              # Collections de variables
    ├── placeholders.ts
    ├── display-context/
    │   ├── breakpoints.ts
    │   ├── content-height.ts
    │   ├── devices.ts
    │   ├── orientations.ts
    │   ├── ratios.ts
    │   └── vertical-densities.ts
    └── style/
        ├── colors/
        │   ├── base.ts
        │   ├── brand.ts
        │   ├── feedback.ts
        │   ├── neutral.ts
        │   ├── palette.ts
        │   └── theme.ts
        ├── typography.ts
        └── radius.ts
```

## ⚙️ Configuration (.env)

### Fichier de configuration

Le projet utilise un fichier `.env` pour personnaliser les variables de design. Un fichier `.env.example` est fourni en modèle.

### Installation

1. Dupliquez `.env.example` en `.env` :
2. Modifiez les valeurs selon votre design system

### Variables disponibles

1. 📁 Répertoire de sortie
2. 🎨 Couleurs de marque
3. ⚠️ Couleurs de feedback
4. 🌓 Opacités de thème (light/dark)
5. 🎯 Opacités des couleurs neutres
6. 📐 Layout horizontal et vertical
7. 🔤 Typographie

### Utilisation dans le code

Les variables .env sont chargées automatiquement et utilisées lors de la génération des collections. Modifiez-les puis relancez:

```bash
npm run generate
```

## ✨ Créer une nouvelle collection

1. Créez un fichier dans `src/collections/`, ex: `example-collection.ts`
2. Définissez votre collection :

```typescript
import { FigmaCollection, FigmaVariable } from "../types";
import { SCOPES } from "../constants/figmaConstants";
import { generateVariable } from "../utils/figmaUtils";
import { generateModeJson } from "../utils/jsonUtils";

const variables: { [key: string]: FigmaVariable } = {};

// Exemple 1 : Couleur
variables["primary-color"] = generateVariable("color", "#FF5733", [
  SCOPES.COLOR.FILL,
  SCOPES.COLOR.STROKE,
]);

// Exemple 2 : Nombre
variables["spacing-base"] = generateVariable("number", 8, [
  SCOPES.DIMENSION.SIZE,
]);

// Exemple 3 : Texte
variables["brand-name"] = generateVariable("string", "My Brand", [
  SCOPES.STRING.TEXT_CONTENT,
]);

const mode = "Default";
const collectionName = "My Collection";

export const exampleCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
```

3. Importez et ajoutez-la dans `src/index.ts` :

```typescript
import { exampleCollection } from "./collections/example-collection";

const collections = {
  // ... Collections existantes
  example: exampleCollection, // Ajoutez ici
};
```

4. Ajouter un script dans package.json pour générer uniquement cette collection au besoin

```json
  "scripts": {
    "build": "vite build",
    "start": "node dist/index.js",
    "dev": "vite",
    "generate": "npm run build && npm start",
    // ... Collections existantes
    "example": "npm start -- --collections=example" // Ajoutez ici
  }
```

## 📄 Format de sortie

Chaque dossier contient un fichier JSON par mode (`mode-name.token.json`) au format Figma.

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
    "com.figma.modeName": "Mode 1",
    "com.figma.setName": "Example Collection"
  }
}
```

## 📥 Import des variables

Les variables générées peuvent être importées de deux manières :

### 1. Import direct (natif Figma)

Vous pouvez importer les fichiers JSON directement dans la **fenêtre de gestion des variables** de Figma :

- Assurez vous de n'avoir aucun objet sélectionné et d'être en mode `Design`
- Dans le menu latéral droit, cliquez sur `Variables`
- Créez une nouvelle collection
- Cliquez sur `Importer`
- Sélectionnez tous les fichiers JSON de la collection que vous souhaitez importer

⚠️ **Limitations** :

- Les **scopes** ne sont pas appliqués automatiquement
- Les **alias** ne sont pas reconnus

### 2. Import via le plugin Token Importer (recommandé)

Le plugin `Token Importer` automatise et enrichit le processus d'import.

**Avantages** :

- ✅ Application automatique des **scopes** (FILL, STROKE, TEXT_CONTENT, etc.)
- ✅ Gestion correcte des **alias** et références entre variables
- ✅ Création des collections

#### Installation du plugin

1. Allez dans `Plugins`
2. Cliquez sur `Import from manifest`
3. Pointez vers le fichier `token-importer-plugin/manifest.json`

#### Utilisation

1. Lancez le plugin depuis `Plugins > Token Importer`
2. Sélectionnez les fichiers JSON à importer
3. Cliquez sur `Importer`

## 🔌 Viewport Plugins

### Viewport variants generator

`Viewport variants generator` permet de générer un composant avec 7 variantes définies :

- le device : desktop | tablet | mobile
- l'orientation : landcape | portrait
- la taille : xl | lg | md | sm | xs

Une variante libre est également présente pour les développeurs Front.

Ces variantes sont des frames auxquelles est appliqué un Autolayout vertical et qui héritent des variables width et height définies dans la collection de variables `System/Devices`.

### Viewport pages generator

`Viewport pages generator` permet de générer un ensemble de 8 pages vides, destinées à recevoir les futures présentations, selon cette arborescence :

- Desktop
  - xl
  - lg
- Tablet
  - portrait
    - md
    - sm
  - landscape
- Mobile
  - portrait
  - landscape
- ⚡ DEV ONLY (destinée à la manipulation des frames par les Développeurs Front)

#### Installation des plugins

1. Allez dans `Plugins`
2. Cliquez sur `Import from manifest`
3. Pointez vers le fichier `manifest.json` du plugin à installer

#### Utilisation

1. Lancez le plugin depuis `Plugins`
2. Cliquez sur `Générer`
