import { breakpointsCollection } from "./collections/display-context/breakpoints";
import { ratiosCollection } from "./collections/display-context/ratios";
import { orientationsCollection } from "./collections/display-context/orientations";
import { devicesCollection } from "./collections/display-context/devices";
import { verticalDensitiesCollection } from "./collections/display-context/vertical-densities";
import { contentHeightCollection } from "./collections/display-context/content-height";
import { baseCollection } from "./collections/style/colors/base";
import { paletteCollection } from "./collections/style/colors/palette";
import { themeCollection } from "./collections/style/colors/theme";
import { brandCollection } from "./collections/style/colors/brand";
import { feedbackCollection } from "./collections/style/colors/feedback";
import { neutralCollection } from "./collections/style/colors/neutral";
import { createDirForCollection } from "./utils/fsUtils";
import { typographyCollection } from "./collections/style/typography";
import { radiusCollection } from "./collections/style/radius";

/**
 * Collections à traiter
 */
const allCollections: Record<string, any> = {
  breakpoints: breakpointsCollection,
  ratios: ratiosCollection,
  orientations: orientationsCollection,
  devices: devicesCollection,
  verticalDensities: verticalDensitiesCollection,
  contentHeight: contentHeightCollection,
  base: baseCollection,
  palette: paletteCollection,
  theme: themeCollection,
  brand: brandCollection,
  feedback: feedbackCollection,
  neutral: neutralCollection,
  typographyCollection: typographyCollection,
  radiusCollection: radiusCollection,
};

// Sélection des collections à générer via argument CLI ou variable d'environnement
function getSelectedCollections(): any[] {
  // Priorité à l'argument CLI --collections=theme,brand
  const cliArg = process.argv.find((arg) => arg.startsWith("--collections="));
  let selected: string | undefined = undefined;
  if (cliArg) {
    selected = cliArg.split("=")[1];
  } else if (process.env.COLLECTIONS) {
    selected = process.env.COLLECTIONS;
  }
  if (selected) {
    const names = selected
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return names
      .map((name) => {
        if (!allCollections[name]) {
          console.warn(`⚠️  Collection inconnue ignorée: ${name}`);
          return undefined;
        }
        return allCollections[name];
      })
      .filter(Boolean);
  }
  // Par défaut, tout générer
  return Object.values(allCollections);
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log("🚀 Génération des variables Figma...\n");

  const collections = getSelectedCollections();
  if (collections.length === 0) {
    console.log("Aucune collection à générer. Vérifiez vos paramètres.");
    return;
  }

  for (const collection of collections) {
    try {
      console.log(`📦 Génération de la collection: ${collection.name}`);
      console.log(`   Modes: ${collection.modes}`);

      await createDirForCollection(collection);

      console.log(`✅ Dossier créé pour la collection: ${collection.name}\n`);
    } catch (error) {
      console.error(`❌ Erreur pour la collection ${collection.name}:`, error);
    }
  }

  console.log("✨ Génération terminée!");
}

// Exécution du  script
main().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
