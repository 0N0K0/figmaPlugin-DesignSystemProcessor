figma.showUI(__html__, { width: 240, height: 196 });

function log(msg) {
  figma.ui.postMessage({ type: "log", message: msg });
}
figma.ui.onmessage = async (msg) => {
  if (msg.type !== "generate-viewport-pages") return;

  // Trouver ou créer la page "PRESENTATIONS"
  let presentationsPage = figma.root.children.find(
    (page) => page.type === "PAGE" && page.name === "PRESENTATIONS"
  );
  if (!presentationsPage) {
    presentationsPage = figma.createPage();
    presentationsPage.name = "PRESENTATIONS";
    log(`📄 Page créée: "PRESENTATIONS"`);
  }

  for (const deviceName of ["↓ Desktop", "↓ Tablet", "↓ Mobile"]) {
    let devicePage = figma.root.children.find(
      (page) => page.type === "PAGE" && page.name === deviceName
    );
    if (!devicePage) {
      devicePage = figma.createPage();
      devicePage.name = deviceName;
      log(`📄 Page créée: "${deviceName}"`);
    }
    if (deviceName === "↓ Desktop") {
      for (const sizeName of ["    ♢ XL", "    ♢ LG"]) {
        let sizePage = figma.root.children.find(
          (page) => page.type === "PAGE" && page.name === sizeName
        );
        if (!sizePage) {
          sizePage = figma.createPage();
          sizePage.name = sizeName;
          log(`📄 Page créée: "${sizeName}"`);
        }
      }
    } else if (deviceName === "↓ Tablet" || deviceName === "↓ Mobile") {
      for (const orientationName of ["  ► Portrait", "  ► Landscape"]) {
        let orientationPage = figma.root.children.find(
          (page) => page.type === "PAGE" && page.name === orientationName
        );
        orientationPage = figma.createPage();
        orientationPage.name = orientationName;
        log(`📄 Page créée: "${orientationName}" pour "${deviceName}`);
        if (deviceName === "↓ Tablet" && orientationName === "  ► Portrait") {
          for (const sizeName of ["    ♢ MD", "    ♢ SM"]) {
            let sizePage = figma.root.children.find(
              (page) => page.type === "PAGE" && page.name === sizeName
            );
            sizePage = figma.createPage();
            sizePage.name = sizeName;
            log(`📄 Page créée: "${sizeName}"`);
          }
        }
      }
    }
  }

  // Trouver ou créer la page "⚡ DEV ONLY"
  let devOnlyPage = figma.root.children.find(
    (page) => page.type === "PAGE" && page.name === "⚡ DEV ONLY"
  );
  if (!devOnlyPage) {
    const separatorPage = figma.createPage();
    separatorPage.name = "------------------------------";
    devOnlyPage = figma.createPage();
    devOnlyPage.name = "⚡ DEV ONLY";
    log(`📄 Page créée: "DEV ONLY"`);
  }

  figma.closePlugin("✅ Pages de présentations générées avec succès.");
};
