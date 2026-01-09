import { createDirForCollection } from "./utils";
import { breakpointsCollection } from "./collections/display-context/breakpoints";
import { ratiosCollection } from "./collections/display-context/ratios";
import { orientationsCollection } from "./collections/display-context/orientations";
import { verticalDensitiesCollection } from "./collections/display-context/vertical-densities";
import { colorsCollection } from "./collections/colors/colors";
import { paletteCollection } from "./collections/colors/palette";
import { brandCollection } from "./collections/colors/brand";
import { feedbackCollection } from "./collections/colors/feedback";
import { neutralCollection } from "./collections/colors/neutral";
import { contentHeightCollection } from "./collections/display-context/content-height";
import { themeCollection } from "./collections/colors/theme";

/**
 * Collections à traiter
 */
const collections = [
  breakpointsCollection,
  ratiosCollection,
  orientationsCollection,
  verticalDensitiesCollection,
  contentHeightCollection,
  colorsCollection,
  paletteCollection,
  themeCollection,
];

/**
 * Point d'entrée principal
 */
async function main() {
  console.log("🚀 Génération des variables Figma...\n");

  for (const collection of collections) {
    try {
      console.log(`📦 Génération de la collection: ${collection.name}`);
      console.log(`   Modes: ${collection.modes}`);

      const zipPath = await createDirForCollection(collection);

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
