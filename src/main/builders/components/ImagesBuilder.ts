import { log } from "console";
import { logger } from "../../utils/logger";
import { variableBuilder } from "../variables/variableBuilder";

async function getRadiusVariables(
  radiusDatas: Record<string, number>,
): Promise<Record<string, number>> {
  logger.info("Radius Datas:", radiusDatas);

  let radiusVariables =
    await variableBuilder.getCollectionVariables("Style\\Radius");

  const radius: Record<string, number> = {};
  if (radiusVariables.length > 0) {
    for (const radiusVariable of radiusVariables) {
      radius[radiusVariable.name] = radiusVariable.valuesByMode[
        Object.keys(radiusVariable.valuesByMode)[0]
      ] as number;
    }
  } else {
    Object.assign(radius, radiusDatas);
  }

  radius["square"] = 0;
  radius["rounded"] = 9999;

  return radius;
}

export async function generateImagesComponents(
  imageDatas: Record<
    string,
    Array<{ name: string; data: ArrayBuffer; width: number; height: number }>
  >,
  radiusDatas: Record<string, number>,
) {
  // Crée une page dédiée ♢ Media
  let imagePage = figma.root.children.find(
    (page) => page.name === "    ♢ Media",
  ) as PageNode | undefined;
  if (!imagePage) {
    imagePage = figma.createPage();
    imagePage.name = "    ♢ Media";
  }
  figma.currentPage = imagePage;

  // Crée un componentSet pour les images
  const imageComponents: {
    component: ComponentNode;
    ratio: number;
    name: string;
  }[] = [];
  let xOffset = 0;

  for (const [category, files] of Object.entries(imageDatas)) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Les dimensions sont transmises depuis l'UI
      const origWidth = file.width;
      const origHeight = file.height;
      const ratio = origWidth / origHeight;

      // Redimensionner à 1920px width
      let newWidth = 1920;
      let newHeight = Math.round(newWidth / ratio);
      if (newHeight > 1080) {
        // Si dépasse 1080px height, redimensionner à 1080px height
        newHeight = 1080;
        newWidth = Math.round(newHeight * ratio);
      }

      // Créer un composant pour l'image
      const imageComponent = figma.createComponent();
      imageComponent.name = `image=${i + 1}, category=${category || "miscellaneous"}`;

      // Ajouter l'image en background du composant (cover + center)
      const bytes =
        file.data && file.data.byteLength
          ? new Uint8Array(file.data)
          : new Uint8Array([]);
      const hash = figma.createImage(bytes).hash;
      imageComponent.fills = [
        {
          type: "IMAGE",
          imageHash: hash,
          scaleMode: "FILL",
        },
      ];

      // Redimensionner le composant aux dimensions calculées
      imageComponent.resize(newWidth, newHeight);
      imageComponent.clipsContent = true;

      imagePage.appendChild(imageComponent);
      imageComponent.x = xOffset;
      imageComponent.y = 0;
      xOffset += newWidth + 40;

      imageComponents.push({
        component: imageComponent,
        ratio,
        name: file.name,
      });
    }
  }

  if (imageComponents.length === 0) {
    logger.error("❌ Aucune image n'a pu être traitée");
    return;
  }

  imagePage.selection = imageComponents.map((ic) => ic.component);
  const imageComponentSet: ComponentSetNode = figma.combineAsVariants(
    imageComponents.map((ic) => ic.component),
    imagePage,
  );
  imageComponentSet.name = "<Image>";
  imageComponentSet.layoutMode = "HORIZONTAL";
  imageComponentSet.layoutSizingHorizontal = "HUG";
  imageComponentSet.layoutSizingVertical = "HUG";
  imageComponentSet.itemSpacing = 20;
  imageComponentSet.paddingLeft = 40;
  imageComponentSet.paddingRight = 40;
  imageComponentSet.paddingTop = 40;
  imageComponentSet.paddingBottom = 40;
  imageComponentSet.x = 0;
  imageComponentSet.y = 0;

  const ratios = [
    { name: "1:1", ratio: 1 },
    { name: "4:3", ratio: 4 / 3 },
    { name: "16:9", ratio: 16 / 9 },
    { name: "20:9", ratio: 20 / 9 },
  ];

  const orientations = ["landscape", "portrait"];

  const radius = await getRadiusVariables(radiusDatas);

  const formatComponents = [];

  for (const ratioConfig of ratios) {
    const hasOrientation = ratioConfig.name !== "1:1";

    const orientationsToUse = hasOrientation ? orientations : ["false"];

    for (const orientation of orientationsToUse) {
      for (const [radiusKey, radiusValue] of Object.entries(radius)) {
        const formatComponent = figma.createComponent();

        // Nom de la variante
        formatComponent.name = `ratio=${ratioConfig.name}, orientation=${orientation}, radius=${radiusKey}`;

        // Calculer les dimensions selon les maxima 1920x1080
        let targetRatio = ratioConfig.ratio;
        if (orientation === "portrait") {
          targetRatio = 1 / targetRatio;
        }

        let width = 1920;
        let height = Math.floor(width / targetRatio);
        if (height > 1080) {
          height = 1080;
          width = Math.floor(height * targetRatio);
        }

        // Configurer le composant avec coin arrondi
        formatComponent.resize(width, height);
        formatComponent.cornerRadius = radiusValue;
        formatComponent.clipsContent = true;
        formatComponent.layoutMode = "HORIZONTAL";
        formatComponent.layoutSizingHorizontal = "FIXED";
        formatComponent.layoutSizingVertical = "FIXED";

        // Ajouter directement une instance d'un composant de la galerie et la faire remplir
        const baseImageComponent = imageComponentSet
          .children[0] as ComponentNode;
        const imageInstance = baseImageComponent.createInstance();
        formatComponent.appendChild(imageInstance);
        imageInstance.layoutSizingHorizontal = "FILL";
        imageInstance.layoutSizingVertical = "FILL";
        imageInstance.isExposedInstance = true;

        imagePage.appendChild(formatComponent);
        formatComponents.push(formatComponent);
      }
    }
  }

  // Créer le ComponentSet format
  figma.currentPage = imagePage;
  imagePage.selection = formatComponents;
  const formatComponentSet = figma.combineAsVariants(
    formatComponents,
    imagePage,
  );
  formatComponentSet.name = "<ImageFormat>";
  // Utiliser auto-layout horizontal avec wrap pour simuler une grille 7x7
  formatComponentSet.layoutMode = "HORIZONTAL";
  formatComponentSet.primaryAxisSizingMode = "AUTO";
  formatComponentSet.counterAxisSizingMode = "AUTO";
  formatComponentSet.itemSpacing = 20;
  formatComponentSet.paddingLeft = 40;
  formatComponentSet.paddingRight = 40;
  formatComponentSet.paddingTop = 40;
  formatComponentSet.paddingBottom = 40;
  formatComponentSet.x = 0;
  formatComponentSet.y = imageComponentSet.height + 80;

  imagePage.selection = [imageComponentSet, formatComponentSet];
  figma.viewport.scrollAndZoomIntoView([imageComponentSet, formatComponentSet]);
}
