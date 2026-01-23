import { variableBuilder } from "../variables/variableBuilder";

export async function generateViewportsPages() {
  // Trouver ou créer la page "PRESENTATIONS"
  const presentationsPage = figma.createPage();
  presentationsPage.name = "PRESENTATIONS";

  const collection = await variableBuilder.getCollection("System\\Devices");
  if (!collection) return;

  for (const deviceName of ["Desktop", "Tablet", "Mobile"]) {
    const devicePage = figma.createPage();
    devicePage.name = `↓ ${deviceName}`;

    if (deviceName === "Desktop") {
      for (const sizeName of ["XL", "LG"]) {
        const sizePage = figma.createPage();
        sizePage.name = `    ♢ ${sizeName}`;
        const mode = collection.modes.find(
          (m) => m.name === `${deviceName}/landscape/${sizeName}`.toLowerCase(),
        );
        if (!mode) continue;
        sizePage.setExplicitVariableModeForCollection(collection, mode.modeId);
      }
    } else if (deviceName === "Tablet" || deviceName === "Mobile") {
      for (const orientationName of ["Portrait", "Landscape"]) {
        const orientationPage = figma.createPage();
        orientationPage.name = `  ► ${orientationName}`;

        if (deviceName === "Tablet") {
          if (orientationName === "Portrait") {
            for (const sizeName of ["MD", "SM"]) {
              const sizePage = figma.createPage();
              sizePage.name = `    ♢ ${sizeName}`;
              const mode = collection.modes.find(
                (m) =>
                  m.name ===
                  `${deviceName}/${orientationName}/${sizeName}`.toLowerCase(),
              );
              if (!mode) continue;
              sizePage.setExplicitVariableModeForCollection(
                collection,
                mode.modeId,
              );
            }
          } else {
            const mode = collection.modes.find(
              (m) =>
                m.name === `${deviceName}/${orientationName}/md`.toLowerCase(),
            );
            if (!mode) continue;
            orientationPage.setExplicitVariableModeForCollection(
              collection,
              mode.modeId,
            );
          }
        } else {
          let mode;
          if (orientationName === "Portrait") {
            mode = collection.modes.find(
              (m) =>
                m.name === `${deviceName}/${orientationName}/xs`.toLowerCase(),
            );
            if (!mode) continue;
          } else {
            mode = collection.modes.find(
              (m) =>
                m.name === `${deviceName}/${orientationName}/md`.toLowerCase(),
            );
          }
          if (!mode) continue;
          orientationPage.setExplicitVariableModeForCollection(
            collection,
            mode.modeId,
          );
        }
      }
    }
  }

  // Créer la page DEV ONLY
  const separator = figma.createPage();
  separator.name = "---";

  const devOnlyPage = figma.createPage();
  devOnlyPage.name = "⚡ DEV ONLY";
}
