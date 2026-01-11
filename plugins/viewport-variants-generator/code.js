figma.showUI(__html__, { width: 240, height: 196 });

function log(msg) {
  figma.ui.postMessage({ type: "log", message: msg });
}

const COLLECTION_NAME = "System/Devices";

const COMPONENT_NAME = "<Viewport>";

// Parse variant name to extract device, orientation, and size properties
function parseVariablePath(path) {
  const [device, orientation, size] = path.split("/");
  return { device, orientation, size };
}

const VARIANTS = [
  {
    path: "desktop/landscape/xl",
    widthFallback: 1536,
    minHeightFallback: 960,
  },
  {
    path: "desktop/landscape/lg",
    widthFallback: 1280,
    minHeightFallback: 800,
  },
  {
    path: "tablet/portrait/md",
    widthFallback: 720,
    minHeightFallback: 1152,
  },
  {
    path: "tablet/portrait/sm",
    widthFallback: 640,
    minHeightFallback: 1024,
  },
  {
    path: "tablet/landscape/md",
    widthFallback: 1024,
    minHeightFallback: 640,
  },
  {
    path: "mobile/portrait/xs",
    widthFallback: 432,
    minHeightFallback: 960,
  },
  {
    path: "mobile/landscape/md",
    widthFallback: 960,
    minHeightFallback: 432,
  },
].map((v) => {
  const variantProps = parseVariablePath(v.path);
  return Object.assign({}, v, { variantProps });
});

// Trouve une variable par son nom dans une collection donnée
function findVariable(path) {
  const targetCollection = figma.variables
    .getLocalVariableCollections()
    .find((c) => c.name === COLLECTION_NAME);
  if (targetCollection) {
    for (const id of targetCollection.variableIds) {
      const variable = figma.variables.getVariableById(id);
      if (variable && variable.name === path) {
        return variable;
      }
    }
  }

  // Fallback : recherche globale si la collection n'est pas trouvée
  for (const collection of figma.variables.getLocalVariableCollections()) {
    for (const id of collection.variableIds) {
      const variable = figma.variables.getVariableById(id);
      if (variable && variable.name === path) {
        return variable;
      }
    }
  }

  return null;
}

// Crée un composant avec autolayout vertical
function createAutoLayoutComponent() {
  const component = figma.createComponent();
  component.layoutMode = "VERTICAL";
  component.layoutSizingVertical = "HUG";
  component.layoutSizingHorizontal = "FIXED";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "MIN";
  component.itemSpacing = 0;
  component.paddingLeft = 0;
  component.paddingRight = 0;
  component.paddingTop = 0;
  component.paddingBottom = 0;
  return component;
}

// Lie une variable à une propriété d'un node
function bindVariable(node, property, variable) {
  try {
    if (variable && variable.id) {
      node.setBoundVariable(property, variable);
      return true;
    }
    log(`❌ Variable non trouvée pour la liaison à la propriété: ${property}`);
    return false;
  } catch (e) {
    log(`❌ Erreur lors de la liaison de la variable: ${e.message}`);
    return false;
  }
}

// Trouve ou crée le composant Instance
async function findOrCreateInstanceComponent() {
  // Chercher le composant dans toutes les pages
  log(`🔍 Recherche du composant "<_Instance>" dans le document...`);

  for (const page of figma.root.children) {
    if (page.type === "PAGE") {
      const found = page.findOne(
        (node) => node.type === "COMPONENT" && node.name === "<_Instance>"
      );
      if (found) {
        return found;
      }
    }
  }

  // Si non trouvé, créer une page dédiée et le composant
  let instancePage = figma.root.children.find(
    (page) => page.type === "PAGE" && page.name === "Instance"
  );
  if (!instancePage) {
    log(`🔍 Page "Instance" non trouvée, création en cours...`);
    instancePage = figma.createPage();
    instancePage.name = "Instance";
    log(`📄 Page créée: "Instance"`);
  } else {
  }

  log(`🔨 Création du composant "<_Instance>"`);
  try {
    const instanceComponent = figma.createComponent();
    instanceComponent.name = "<_Instance>";
    instanceComponent.layoutMode = "VERTICAL";
    instanceComponent.primaryAxisAlignItems = "CENTER";
    instanceComponent.counterAxisAlignItems = "CENTER";
    instanceComponent.primaryAxisSizingMode = "FIXED";
    instanceComponent.counterAxisSizingMode = "FIXED";
    instanceComponent.resize(400, 400); // Taille par défaut
    instanceComponent.paddingLeft = 64;
    instanceComponent.paddingRight = 64;
    instanceComponent.paddingTop = 72;
    instanceComponent.paddingBottom = 72;

    const instanceContent = figma.createFrame();
    instanceContent.name = "content";
    instanceContent.layoutMode = "VERTICAL";
    instanceContent.primaryAxisAlignItems = "CENTER";
    instanceContent.counterAxisAlignItems = "CENTER";
    instanceContent.paddingLeft = 32;
    instanceContent.paddingRight = 32;
    instanceContent.paddingTop = 48;
    instanceContent.paddingBottom = 48;
    instanceContent.cornerRadius = 32;
    instanceContent.strokeWeight = 2;
    instanceContent.strokes = [
      { type: "SOLID", color: { r: 0.54, g: 0.22, b: 0.96 } },
    ];
    instanceContent.dashPattern = [12, 6]; // Tirets de 12px avec espaces de 6px
    instanceContent.fills = [];

    const text = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    text.characters = `Instance`;
    text.fontSize = 48;
    text.lineHeight = { unit: "PIXELS", value: 48 };
    text.fills = [{ type: "SOLID", color: { r: 0.54, g: 0.22, b: 0.96 } }];
    instanceContent.appendChild(text);

    instanceComponent.appendChild(instanceContent);

    // Configurer FILL après avoir ajouté au parent
    instanceContent.layoutSizingHorizontal = "FILL";
    instanceContent.layoutSizingVertical = "FILL";

    instancePage.appendChild(instanceComponent);
    log(`✅ Composant "<_Instance>" créé sur la page "Instance"`);
    return instanceComponent;
  } catch (e) {
    log(
      `❌ Erreur lors de la création du composant "<_Instance>": ${e.message}`
    );
    return null;
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "generate-viewport-variants") return;

  // Créer une page dédiée pour le composant de présentations
  let targetPage = figma.root.children.find(
    (page) => page.type === "PAGE" && page.name === "Viewport"
  );
  if (!targetPage) {
    targetPage = figma.createPage();
    targetPage.name = "Viewport";
    log(`📄 Page créée: "Viewport"`);
  } else {
  }

  log(`📋 Nom du composant: ${COMPONENT_NAME}`);
  log(`🔢 Variantes: ${VARIANTS.length}`);

  try {
    // Trouver ou créer le composant Instance
    const instanceComponent = await findOrCreateInstanceComponent();

    if (!instanceComponent) {
      log(`❌ Impossible de créer le composant Instance`);
      return;
    }

    log(`✅ Composant Instance prêt`);

    const variantsFrames = [];
    const variantPropsMap = new Map();

    for (const variant of VARIANTS) {
      const variantComponent = createAutoLayoutComponent();
      const { device, orientation, size } = variant.variantProps;
      // Nommer avec le format Figma pour les variantes
      variantComponent.name = `device=${device}, orientation=${orientation}, size=${size}`;
      log(`📐 Composant créé pour la variante: ${variantComponent.name}`);

      // Propriété d'instance swap pour permettre de remplacer l'Instance
      const swapPropName = "content";
      variantComponent.addComponentProperty(
        swapPropName,
        "INSTANCE_SWAP",
        instanceComponent.id
      );
      log(`🔀 Propriété d'instance swap ajoutée: ${swapPropName}`);

      // Ajouter un fond gris clair
      variantComponent.fills = [
        { type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } },
      ];

      // Lier width (ou fallback)
      const widthVariable = findVariable(`${variant.path}/width`);
      if (widthVariable) {
        bindVariable(variantComponent, "width", widthVariable);
      } else {
        variantComponent.resizeWithoutConstraints(variant.widthFallback, 100);
        log(`⚠️ width fallback ${variant.widthFallback}px (${variant.path})`);
      }

      // Hauteur ajustée au contenu
      variantComponent.layoutSizingVertical = "HUG";

      // Lier minHeight (ou fallback)
      const minHeightVariable = findVariable(`${variant.path}/height`);
      if (minHeightVariable) {
        bindVariable(variantComponent, "minHeight", minHeightVariable);
      } else {
        variantComponent.minHeight = variant.minHeightFallback;
        log(
          `⚠️ min-height fallback ${variant.minHeightFallback}px (${variant.path})`
        );
      }

      // Créer une instance du composant Instance
      const instanceVariant = instanceComponent.createInstance();
      variantComponent.appendChild(instanceVariant);
      log(`✅ Instance ajoutée au composant de la variante`);

      // Configurer FILL après avoir ajouté au parent
      instanceVariant.layoutSizingHorizontal = "FILL";
      instanceVariant.layoutSizingVertical = "FILL";

      // Lier l'instance à la propriété d'instance swap
      if (typeof instanceVariant.setComponentPropertyValue === "function") {
        instanceVariant.setComponentPropertyValue(
          swapPropName,
          instanceComponent.id
        );
      } else {
        log(`⚠️ Impossible de lier l'instance swap: API non supportée`);
      }

      variantsFrames.push(variantComponent);
      variantPropsMap.set(variantComponent.id, variant.variantProps); // Stocker les props avec l'ID du composant
      log(`✅ Variante prête: ${variant.path}`);
    }

    if (!variantsFrames.length) {
      log("❌ Aucune variante créée.");
      return;
    }

    log(
      `📦 ${variantsFrames.length} variantes créées, création du component set...`
    );

    // Ajouter les composants à la page dédiée
    for (const component of variantsFrames) {
      targetPage.appendChild(component);
    }

    // Positionner les composants côte à côte sur la page
    let xOffset = 0;
    for (const component of variantsFrames) {
      component.x = xOffset;
      component.y = 0;
      xOffset += component.width + 40;
    }

    // Créer le component set
    figma.currentPage = targetPage;
    targetPage.selection = variantsFrames;
    const componentSet = figma.combineAsVariants(variantsFrames, targetPage);
    componentSet.name = COMPONENT_NAME;

    // Appliquer autolayout horizontal au component set
    componentSet.layoutMode = "HORIZONTAL";
    componentSet.layoutSizingHorizontal = "HUG";
    componentSet.layoutSizingVertical = "HUG";
    componentSet.itemSpacing = 40;
    componentSet.paddingLeft = 80;
    componentSet.paddingRight = 80;
    componentSet.paddingTop = 80;
    componentSet.paddingBottom = 80;

    log(
      `✅ Propriétés de variantes créées automatiquement: device, orientation, size`
    );

    log(
      `✅ Composant "${COMPONENT_NAME}" créé avec ${VARIANTS.length} variantes`
    );
    targetPage.selection = [componentSet];
    figma.viewport.scrollAndZoomIntoView([componentSet]);
  } catch (e) {
    log(`❌ Erreur finale: ${e.message}`);
    log(`Stack: ${e.stack}`);
  }
};
