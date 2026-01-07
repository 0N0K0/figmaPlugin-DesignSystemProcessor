import { createZipForCollection } from "./utils";
import { breakpointsCollection } from "./collections/display-context/breakpoints";
import { ratiosCollection } from "./collections/display-context/ratios";
import { orientationsCollection } from "./collections/display-context/orientations";
import { verticalDensityCollection } from "./collections/display-context/vertical-density";
import { colorsCollection } from "./collections/colors/colors";
import { paletteCollection } from "./collections/colors/palette";
import { brandCollection } from "./collections/colors/brand";
import { feedbackCollection } from "./collections/colors/feedback";
import { neutralCollection } from "./collections/colors/neutral";
import { contentHeightCollection } from "./collections/display-context/content-height";

/**
 * Collections à traiter
 */
const collections = [
  breakpointsCollection,
  ratiosCollection,
  orientationsCollection,
  verticalDensityCollection,
  contentHeightCollection,
  colorsCollection,
  paletteCollection,
  brandCollection,
  feedbackCollection,
  neutralCollection,
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
      console.log(`   Variables: ${collection.variables.length}`);

      const zipPath = await createZipForCollection(collection);

      console.log(`✅ ZIP créé: ${zipPath}\n`);
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
