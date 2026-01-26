import { variableBuilder } from "../variables/variableBuilder";
import { logger } from "../../utils/logger";
import { yieldToFigma } from "../../utils/yieldToFigma";

export async function generateViewportsPages() {
  try {
    logger.info("Création de la page 'PRESENTATIONS'...");
    const presentationsPage = figma.createPage();
    presentationsPage.name = "PRESENTATIONS";
    logger.success("Page 'PRESENTATIONS' créée.");
    await yieldToFigma();

    logger.info("Chargement de la collection Devices...");
    const devicesCollection =
      await variableBuilder.getCollection("System\\Devices");
    if (!devicesCollection) {
      logger.error("Collection 'System\\Devices' introuvable.");
      return;
    }
    logger.success("Collection Devices chargée.");
    await yieldToFigma();

    logger.info("Chargement de la collection VerticalDensities...");
    const verticalDensitiesCollection = await variableBuilder.getCollection(
      "System\\VerticalDensities",
    );
    if (!verticalDensitiesCollection) {
      logger.error("Collection 'System\\VerticalDensities' introuvable.");
      return;
    }
    logger.success("Collection VerticalDensities chargée.");
    await yieldToFigma();

    for (const deviceName of ["Desktop", "Tablet", "Mobile"]) {
      logger.info(`Création des pages pour le device: ${deviceName}`);
      const devicePage = figma.createPage();
      devicePage.name = `↓ ${deviceName}`;
      await yieldToFigma();

      if (deviceName === "Desktop") {
        for (const sizeName of ["XL", "LG"]) {
          const sizePage = figma.createPage();
          sizePage.name = `    ♢ ${sizeName}`;
          const deviceMode = devicesCollection.modes.find(
            (m) =>
              m.name === `${deviceName}/landscape/${sizeName}`.toLowerCase(),
          );
          if (!deviceMode) {
            logger.warn(
              `Mode introuvable: ${deviceName}/landscape/${sizeName}`,
            );
            continue;
          }
          const verticalDensityMode = verticalDensitiesCollection.modes.find(
            (m) => m.name === `loose`.toLowerCase(),
          );
          if (!verticalDensityMode) {
            logger.warn(`Mode introuvable: loose`);
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
          logger.success(`Page Desktop/${sizeName} créée.`);
          await yieldToFigma();
        }
      } else if (deviceName === "Tablet" || deviceName === "Mobile") {
        for (const orientationName of ["Portrait", "Landscape"]) {
          logger.info(`Création des pages ${deviceName}/${orientationName}`);
          const orientationPage = figma.createPage();
          orientationPage.name = `  ► ${orientationName}`;
          await yieldToFigma();

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
                  logger.warn(
                    `Mode introuvable: ${deviceName}/${orientationName}/${sizeName}`,
                  );
                  continue;
                }
                const verticalDensityMode =
                  verticalDensitiesCollection.modes.find(
                    (m) => m.name === `compact`.toLowerCase(),
                  );
                if (!verticalDensityMode) {
                  logger.warn(`Mode introuvable: compact`);
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
                logger.success(`Page Tablet/Portrait/${sizeName} créée.`);
                await yieldToFigma();
              }
            } else {
              const deviceMode = devicesCollection.modes.find(
                (m) =>
                  m.name ===
                  `${deviceName}/${orientationName}/md`.toLowerCase(),
              );
              if (!deviceMode) {
                logger.warn(
                  `Mode introuvable: ${deviceName}/${orientationName}/md`,
                );
                continue;
              }
              const verticalDensityMode =
                verticalDensitiesCollection.modes.find(
                  (m) => m.name === `compact`.toLowerCase(),
                );
              if (!verticalDensityMode) {
                logger.warn(`Mode introuvable: compact`);
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
              logger.success(`Page Tablet/Landscape/MD créée.`);
              await yieldToFigma();
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
              logger.warn(
                `Mode introuvable: ${deviceName}/${orientationName}/${orientationName === "Portrait" ? "xs" : "md"}`,
              );
              continue;
            }
            const verticalDensityMode = verticalDensitiesCollection.modes.find(
              (m) => m.name === `tight`.toLowerCase(),
            );
            if (!verticalDensityMode) {
              logger.warn(`Mode introuvable: tight`);
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
            logger.success(`Pages ${deviceName}/${orientationName} créées.`);
            await yieldToFigma();
          }
        }
      }
      logger.success(`Pages pour le device ${deviceName} créées.`);
      await yieldToFigma();
    }

    logger.info("Création de la page '⚡ DEV ONLY'");
    const separator = figma.createPage();
    separator.name = "---";

    const devOnlyPage = figma.createPage();
    devOnlyPage.name = "⚡ DEV ONLY";
    logger.success(`Page '⚡ DEV ONLY' créée.`);
    await yieldToFigma();

    logger.success("Toutes les pages ont été générées avec succès.");
  } catch (err) {
    logger.error("Erreur lors de la génération des pages de viewports.", err);
    await yieldToFigma();
  }
}
