import { createZipForCollection } from './utils';
import { breakpointsCollection } from './collections/breakpoints';
import { ratiosCollection } from './collections/ratios';
import { orientationsCollection } from './collections/orientations';
import { verticalDensityCollection } from './collections/vertical-density';

/**
 * Collections à traiter
 */
const collections = [
  breakpointsCollection,
  ratiosCollection,
  orientationsCollection,
  verticalDensityCollection
];

/**
 * Point d'entrée principal
 */
async function main() {
  console.log('🚀 Génération des variables Figma...\n');

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

  console.log('✨ Génération terminée!');
}

// Exécution du  script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
