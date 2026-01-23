import { variableBuilder } from "../variables/variableBuilder";

async function getRadiusVariables(
  radiusDatas: Record<string, number>,
): Promise<Record<string, number>> {
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

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]; // clone pour ne pas modifier l'original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calculateRowDimensions(
  ratios: number[],
  lineWidth: number,
  gap: number,
) {
  const sumRatios = ratios.reduce((a, b) => a + b, 0);
  const height = (lineWidth - gap * (ratios.length - 1)) / sumRatios;

  const widths = ratios.map((r) => r * height);

  return { height, widths };
}

export async function generateImagesComponents(
  imageDatas: Record<
    string,
    Array<{ name: string; data: ArrayBuffer; width: number; height: number }>
  >,
  radiusDatas: Record<string, number>,
) {
  // Crée une page dédiée ♢ Media
  let componentPage = figma.root.children.find(
    (page) => page.name === "COMPONENTS",
  ) as PageNode | undefined;
  if (!componentPage) {
    const separator = figma.createPage();
    separator.name = "---";
    separator.isPageDivider = true;
    componentPage = figma.createPage();
    componentPage.name = "COMPONENTS";
  }
  let dataDisplayPage = figma.root.children.find(
    (page) => page.name === "↓ Data Display",
  ) as PageNode | undefined;
  if (!dataDisplayPage) {
    dataDisplayPage = figma.createPage();
    dataDisplayPage.name = "↓ Data Display";
  }
  let mediaPage = figma.root.children.find(
    (page) => page.name === "    ♢ Media",
  ) as PageNode | undefined;
  if (!mediaPage) {
    mediaPage = figma.createPage();
    mediaPage.name = "    ♢ Media";
  }

  let layoutPage = figma.root.children.find(
    (page) => page.name === "↓ Layout",
  ) as PageNode | undefined;
  if (!layoutPage) {
    layoutPage = figma.createPage();
    layoutPage.name = "↓ Layout";
  }
  let galleryPage = figma.root.children.find(
    (page) => page.name === "    ♢ Gallery",
  ) as PageNode | undefined;
  if (!galleryPage) {
    galleryPage = figma.createPage();
    galleryPage.name = "    ♢ Gallery";
  }

  let datasPage = figma.root.children.find((page) => page.name === "DATAS") as
    | PageNode
    | undefined;
  if (!datasPage) {
    datasPage = figma.createPage();
    datasPage.name = "DATAS";
  }
  let imagePage = figma.root.children.find(
    (page) => page.name === "    ♢ Image",
  ) as PageNode | undefined;
  if (!imagePage) {
    imagePage = figma.createPage();
    imagePage.name = "    ♢ Image";
  }

  /**
   * Créer les composants d'images
   */
  figma.currentPage = imagePage;

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
    return;
  }

  // Créer le ComponentSet d'Images
  figma.currentPage = imagePage;
  imagePage.selection = imageComponents.map((ic) => ic.component);
  const imageComponentSet: ComponentSetNode = figma.combineAsVariants(
    imageComponents.map((ic) => ic.component),
    imagePage,
  );
  imageComponentSet.name = "<ImageDatas>";
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

  /**
   * Créer les composants de formats d'images
   */
  figma.currentPage = mediaPage;

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
        formatComponent.lockAspectRatio();
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

        // Ajout d'une propriété de swap d'instance 'image' sur le ComponentSet
        formatComponent.addComponentProperty(
          "image",
          "INSTANCE_SWAP",
          imageInstance.mainComponent!.id,
          {
            preferredValues: [
              { type: "COMPONENT", key: imageInstance.mainComponent!.key },
            ],
          },
        );
        mediaPage.appendChild(formatComponent);
        formatComponents.push(formatComponent);
      }
    }
  }

  // Créer le ComponentSet de Formats
  figma.currentPage = mediaPage;
  mediaPage.selection = formatComponents;
  const formatComponentSet = figma.combineAsVariants(
    formatComponents,
    mediaPage,
  );
  formatComponentSet.name = "<Media>";
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

  /**
   * Créer les composants de galerie d'images
   */
  figma.currentPage = galleryPage;
  const galleryComponents: ComponentNode[] = [];

  const layouts = ["grid", "masonry", "justified", "carousel"];
  const breakpoints = {
    xl: { width: 1392, columns: 4 }, // 12
    lg: { width: 1056, columns: 3 }, // 9
    md: { width: 720, columns: 2 }, // 6
    xs: { width: 384, columns: 1 }, // 3
  };
  const columnWidth = 96 * 3 + 16 * 2;

  const categoryLength = imageDatas[Object.keys(imageDatas)[0]].length;
  const ratiosByOrientations = ratios.flatMap((ratio) => {
    // Si ratio = 1:1, on ne veut que "false"
    if (ratio.name === "1:1") {
      return [{ ratio: ratio.name, orientation: "false" }];
    }
    // Sinon on crée toutes les orientations sauf "false"
    return orientations
      .filter((orientation) => orientation !== "false")
      .map((orientation) => ({ ratio: ratio.name, orientation: orientation }));
  });
  const baseFormatComponent = formatComponentSet.children[0] as ComponentNode;

  for (const layout of layouts) {
    for (const [breakpoint, sizes] of Object.entries(breakpoints)) {
      const galleryComponent = figma.createComponent();
      galleryComponent.name = `layout=${layout}, breakpoint=${breakpoint}`;

      galleryComponent.resize(sizes.width - 32 * 2, 1080);
      galleryComponent.layoutMode = "HORIZONTAL";
      galleryComponent.primaryAxisSizingMode = "FIXED";
      galleryComponent.counterAxisSizingMode = "AUTO";
      galleryComponent.itemSpacing = 16;

      const formatInstances = [];
      for (let i = 0; i < 24; i++) {
        const categoryIndex = i % categoryLength;
        const formatInstance = baseFormatComponent.createInstance();
        const nestedImageInstance = formatInstance.findOne(
          (n) => n.type === "INSTANCE" && n.name === "<ImageDatas>",
        ) as InstanceNode;
        nestedImageInstance.setProperties({
          image: String(categoryIndex + 1),
        });

        const ratioOrientationIndex = i % ratiosByOrientations.length;
        const { ratio, orientation } =
          ratiosByOrientations[ratioOrientationIndex];
        formatInstance.setProperties({
          ratio,
          orientation,
        });
        formatInstances.push(formatInstance);
      }

      if (layout === "masonry") {
        const galleryLayoutFrames: FrameNode[] = [];
        for (let i = 0; i < sizes.columns; i++) {
          galleryLayoutFrames.push(figma.createFrame());
        }

        const imagesByColumn = Math.ceil(24 / sizes.columns);
        // dispatcher les items
        for (let col = 0; col < sizes.columns; col++) {
          const start = col * imagesByColumn;
          const end = start + imagesByColumn;
          let itemsForColumn = formatInstances.slice(start, end);
          itemsForColumn = shuffle(itemsForColumn);

          itemsForColumn.forEach((item) => {
            item.layoutAlign = "STRETCH";
            galleryLayoutFrames[col].appendChild(item as SceneNode);
          });
        }

        galleryLayoutFrames.forEach((frame) => {
          frame.layoutMode = "VERTICAL";
          frame.primaryAxisSizingMode = "AUTO";
          frame.counterAxisSizingMode = "FIXED";
          frame.resize(columnWidth, frame.height);
          frame.itemSpacing = 24;
          frame.fills = [];
          galleryComponent.appendChild(frame);
        });
      }

      if (layout === "justified") {
        galleryComponent.layoutMode = "VERTICAL";
        galleryComponent.primaryAxisSizingMode = "AUTO";
        galleryComponent.counterAxisSizingMode = "FIXED";
        galleryComponent.itemSpacing = 24;

        const imagesByRows = sizes.columns;
        for (let row = 0; row < Math.ceil(24 / imagesByRows); row++) {
          const rowFrame = figma.createFrame();
          rowFrame.layoutMode = "HORIZONTAL";
          rowFrame.primaryAxisSizingMode = "AUTO";
          rowFrame.counterAxisSizingMode = "AUTO";
          rowFrame.itemSpacing = 16;
          rowFrame.fills = [];

          const start = row * imagesByRows;
          const end = start + imagesByRows;
          let itemsForRow = formatInstances.slice(start, end);
          const ratios = itemsForRow.map((item) => {
            const w = (item as InstanceNode).width;
            const h = (item as InstanceNode).height;
            return w / h;
          });
          const { height, widths } = calculateRowDimensions(
            ratios,
            galleryComponent.width,
            rowFrame.itemSpacing,
          );

          itemsForRow = shuffle(itemsForRow);

          itemsForRow.forEach((item, index) => {
            item.resize(widths[index], height);
            rowFrame.appendChild(item as SceneNode);
          });
          galleryComponent.appendChild(rowFrame);
        }
      }

      if (layout === "grid") {
        const shuffledInstances = shuffle(formatInstances);
        shuffledInstances.forEach((item) => {
          item.setProperties({
            orientation: "false",
            ratio: "1:1",
          });
          item.resize(96 * 3 + 16 * 2, 96 * 3 + 16 * 2);
          galleryComponent.appendChild(item as SceneNode);
        });
        galleryComponent.layoutMode = "HORIZONTAL";
        galleryComponent.primaryAxisSizingMode = "FIXED";
        galleryComponent.counterAxisSizingMode = "AUTO";
        galleryComponent.itemSpacing = 16;
        galleryComponent.counterAxisSpacing = 24;

        galleryComponent.layoutWrap = "WRAP";
      }
      if (layout === "carousel") {
        const shuffledInstances = shuffle(formatInstances);
        shuffledInstances.forEach((item) => {
          const widthItem = item.width;
          const heightItem = item.height;
          const height = 96 * 3 + 16 * 2;
          item.resize((height * widthItem) / heightItem, height);
          galleryComponent.appendChild(item as SceneNode);
        });
        galleryComponent.layoutMode = "HORIZONTAL";
        galleryComponent.primaryAxisSizingMode = "FIXED";
        galleryComponent.counterAxisSizingMode = "AUTO";
        galleryComponent.itemSpacing = 16;

        galleryComponent.layoutWrap = "NO_WRAP";
        galleryComponent.clipsContent = true;
        galleryComponent.overflowDirection = "HORIZONTAL";
      }

      galleryPage.appendChild(galleryComponent);
      galleryComponents.push(galleryComponent);
    }
  }

  // Créer le ComponentSet gallery
  figma.currentPage = galleryPage;
  galleryPage.selection = galleryComponents;
  const galleryComponentSet = figma.combineAsVariants(
    galleryComponents,
    galleryPage,
  );
  galleryComponentSet.name = "<Gallery>";
  galleryComponentSet.layoutMode = "HORIZONTAL";
  galleryComponentSet.primaryAxisSizingMode = "AUTO";
  galleryComponentSet.counterAxisSizingMode = "AUTO";
  galleryComponentSet.itemSpacing = 20;
  galleryComponentSet.paddingLeft = 40;
  galleryComponentSet.paddingRight = 40;
  galleryComponentSet.paddingTop = 40;
  galleryComponentSet.paddingBottom = 40;
  galleryComponentSet.x = 0;
  galleryComponentSet.y =
    imageComponentSet.height + formatComponentSet.height + 160;

  figma.viewport.scrollAndZoomIntoView([galleryComponentSet]);
}
