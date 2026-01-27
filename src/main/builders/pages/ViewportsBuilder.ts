import { variableBuilder } from "../variables/variableBuilder";
import { logger } from "../../utils/logger";

export async function generateViewportsPages() {
  try {
    const presentationsPage = figma.createPage();
    presentationsPage.name = "PRESENTATIONS";

    const devicesCollection =
      await variableBuilder.getCollection("System\\Devices");
    if (!devicesCollection) {
      return;
    }

    const verticalDensitiesCollection = await variableBuilder.getCollection(
      "System\\VerticalDensities",
    );
    if (!verticalDensitiesCollection) {
      return;
    }

    for (const deviceName of ["Desktop", "Tablet", "Mobile"]) {
      const devicePage = figma.createPage();
      devicePage.name = `↓ ${deviceName}`;

      if (deviceName === "Desktop") {
        for (const sizeName of ["XL", "LG"]) {
          const sizePage = figma.createPage();
          sizePage.name = `    ♢ ${sizeName}`;
          const deviceMode = devicesCollection.modes.find(
            (m) =>
              m.name === `${deviceName}/landscape/${sizeName}`.toLowerCase(),
          );
          if (!deviceMode) {
            continue;
          }
          const verticalDensityMode = verticalDensitiesCollection.modes.find(
            (m) => m.name === `loose`.toLowerCase(),
          );
          if (!verticalDensityMode) {
            continue;
          }
          sizePage.setExplicitVariableModeForCollection(
            devicesCollection,
            deviceMode.modeId,
          );
          sizePage.setExplicitVariableModeForCollection(
            verticalDensitiesCollection,
            verticalDensityMode.modeId,
          );
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
                const deviceMode = devicesCollection.modes.find(
                  (m) =>
                    m.name ===
                    `${deviceName}/${orientationName}/${sizeName}`.toLowerCase(),
                );
                if (!deviceMode) {
                  continue;
                }
                const verticalDensityMode =
                  verticalDensitiesCollection.modes.find(
                    (m) => m.name === `compact`.toLowerCase(),
                  );
                if (!verticalDensityMode) {
                  continue;
                }
                sizePage.setExplicitVariableModeForCollection(
                  devicesCollection,
                  deviceMode.modeId,
                );
                sizePage.setExplicitVariableModeForCollection(
                  verticalDensitiesCollection,
                  verticalDensityMode.modeId,
                );
              }
            } else {
              const deviceMode = devicesCollection.modes.find(
                (m) =>
                  m.name ===
                  `${deviceName}/${orientationName}/md`.toLowerCase(),
              );
              if (!deviceMode) {
                continue;
              }
              const verticalDensityMode =
                verticalDensitiesCollection.modes.find(
                  (m) => m.name === `compact`.toLowerCase(),
                );
              if (!verticalDensityMode) {
                continue;
              }
              orientationPage.setExplicitVariableModeForCollection(
                devicesCollection,
                deviceMode.modeId,
              );
              orientationPage.setExplicitVariableModeForCollection(
                verticalDensitiesCollection,
                verticalDensityMode.modeId,
              );
            }
          } else {
            let deviceMode;
            if (orientationName === "Portrait") {
              deviceMode = devicesCollection.modes.find(
                (m) =>
                  m.name ===
                  `${deviceName}/${orientationName}/xs`.toLowerCase(),
              );
            } else {
              deviceMode = devicesCollection.modes.find(
                (m) =>
                  m.name ===
                  `${deviceName}/${orientationName}/md`.toLowerCase(),
              );
            }
            if (!deviceMode) {
              continue;
            }
            const verticalDensityMode = verticalDensitiesCollection.modes.find(
              (m) => m.name === `tight`.toLowerCase(),
            );
            if (!verticalDensityMode) {
              continue;
            }
            orientationPage.setExplicitVariableModeForCollection(
              devicesCollection,
              deviceMode.modeId,
            );
            orientationPage.setExplicitVariableModeForCollection(
              verticalDensitiesCollection,
              verticalDensityMode.modeId,
            );
          }
        }
      }
    }

    const separator = figma.createPage();
    separator.name = "---";

    const devOnlyPage = figma.createPage();
    devOnlyPage.name = "⚡ DEV ONLY";
  } catch (error) {
    await logger.error(
      "Erreur lors de la génération des pages de viewports.",
      error,
    );
  }
}
