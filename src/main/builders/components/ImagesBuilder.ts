import { imageDatas, layoutGuide, radiusDatas } from "../../../common/types";
import { shuffle, sliceItems } from "../../utils/dataUtils";
import { logger } from "../../utils/logger";
import { elementBuilder } from "../elements/elementBuilder";
import { pageBuilder } from "../pages/pageBuilder";
import { variableBuilder } from "../variables/variableBuilder";
import { componentBuilder } from "./componentBuilder";
import { breakpointsConfig } from "../../utils/displayContextUtils";

export async function generateImagesComponents(
  imageDatas: imageDatas,
  radiusDatas: radiusDatas,
  layoutGuide: layoutGuide,
) {
  try {
    /**
     * Créer les pages
     */
    logger.info(
      "[generateImagesComponents] Création ou récupération des pages pour les composants de medias...",
    );
    const breakpointCollectionName = "System\\Breakpoints";
    const XXLmode = await variableBuilder.getModeFromCollection(
      breakpointCollectionName,
      "xxl",
    );

    const pagesNames = [
      "COMPONENTS",
      "↓ Data Display",
      "    ♢ Media",
      "↓ Layout",
      "    ♢ Gallery",
      "DATAS",
      "    ♢ Image",
    ];
    let mediaPage: PageNode = figma.currentPage;
    let galleryPage: PageNode = figma.currentPage;
    let imagePage: PageNode = figma.currentPage;
    for (const pageName of pagesNames) {
      const page = await pageBuilder.getOrCreatePage(pageName);

      switch (pageName) {
        case "    ♢ Media":
          mediaPage = page;
          break;
        case "    ♢ Gallery":
          galleryPage = page;
          break;
        case "    ♢ Image":
          imagePage = page;
          break;
      }
    }
    logger.success(
      "[generateImagesComponents] Pages pour les composants de medias créées ou récupérées avec succès.",
    );

    /**
     * Créer le ComponentSet d'images
     */
    logger.info(
      "[generateImagesComponents] Création du ComponentSet <ImageDatas>...",
    );
    figma.currentPage = imagePage;

    const imageWidthVariable = await variableBuilder.findVariable(
      breakpointCollectionName,
      "viewport/width/min-width",
    );
    const imageWidth =
      imageWidthVariable && XXLmode.mode
        ? (imageWidthVariable.valuesByMode[XXLmode.mode?.modeId] as number)
        : 1920;

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
        const ratio = file.width / file.height;

        let newWidth = imageWidth;
        let newHeight = Math.round(newWidth / ratio);
        if (newHeight > layoutGuide.maxContentHeight) {
          newHeight = layoutGuide.maxContentHeight;
          newWidth = Math.round(newHeight * ratio);
        }

        const bytes =
          file.data && file.data.byteLength
            ? new Uint8Array(file.data)
            : new Uint8Array([]);
        const hash = figma.createImage(bytes).hash;

        // Créer un composant pour l'image

        const imageComponent = (await elementBuilder.createElement(
          `image=${i + 1}, category=${category || "miscellaneous"}`,
          "COMPONENT",
          imagePage,
          {
            fills: [
              {
                type: "IMAGE",
                imageHash: hash,
                scaleMode: "FILL",
              },
            ],
            clipsContent: true,
            x: xOffset,
            y: 0,
          },
          { width: newWidth, height: newHeight },
        )) as ComponentNode;

        xOffset += newWidth + 40;

        imageComponents.push({
          component: imageComponent,
          ratio,
          name: file.name,
        });
      }
    }

    const imageComponentSet = await componentBuilder.createComponentSet(
      "<ImageDatas>",
      imagePage,
      imageComponents.map((ic) => ic.component),
      {
        layoutMode: "HORIZONTAL",
        layoutSizingHorizontal: "HUG",
        layoutSizingVertical: "HUG",
        itemSpacing: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 40,
        paddingBottom: 40,
        x: 0,
        y: 0,
      },
    );
    logger.success(
      "[generateImagesComponents] ComponentSet <ImageDatas> créé avec succès.",
    );

    /**
     * Créer le ComponentSet de formats de medias
     */
    logger.info(
      "[generateImagesComponents] Création du ComponentSet <Media>...",
    );
    figma.currentPage = mediaPage;

    const ratios = [
      { name: "1:1", ratio: 1 },
      { name: "4:3", ratio: 4 / 3 },
      { name: "16:9", ratio: 16 / 9 },
      { name: "20:9", ratio: 20 / 9 },
    ];
    const orientations = ["landscape", "portrait"];
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
      Object.assign(radius, { square: 0, ...radiusDatas, rounded: 9999 });
    }

    const formatComponents = [];

    for (const ratioConfig of ratios) {
      const orientationsToUse =
        ratioConfig.name !== "1:1" ? orientations : ["false"];

      for (const orientation of orientationsToUse) {
        for (const [radiusKey, radiusValue] of Object.entries(radius)) {
          let targetRatio = ratioConfig.ratio;
          if (orientation === "portrait") {
            targetRatio = 1 / targetRatio;
          }
          let width = imageWidth;
          let height = Math.floor(width / targetRatio);
          if (height > layoutGuide.maxContentHeight) {
            height = layoutGuide.maxContentHeight;
            width = Math.floor(height * targetRatio);
          }

          const formatComponent = (await elementBuilder.createElement(
            `ratio=${ratioConfig.name}, orientation=${orientation}, radius=${radiusKey}`,
            "COMPONENT",
            mediaPage,
            {
              cornerRadius: radiusValue,
              clipsContent: true,
              layoutMode: "HORIZONTAL",
              layoutSizingHorizontal: "FIXED",
              layoutSizingVertical: "FIXED",
            },
            { width, height },
            true,
          )) as ComponentNode;

          await componentBuilder.createInstance(
            imageComponentSet.children[0] as ComponentNode,
            formatComponent,
            true,
            {
              layoutSizingHorizontal: "FILL",
              layoutSizingVertical: "FILL",
              isExposedInstance: true,
            },
          );

          formatComponents.push(formatComponent);
        }
      }
    }

    const formatComponentSet = await componentBuilder.createComponentSet(
      "<Media>",
      mediaPage,
      formatComponents,
      {
        layoutMode: "HORIZONTAL",
        primaryAxisSizingMode: "AUTO",
        counterAxisSizingMode: "AUTO",
        itemSpacing: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 40,
        paddingBottom: 40,
        x: 0,
        y: imageComponentSet.height + 80,
      },
    );
    logger.success(
      "[generateImagesComponents] ComponentSet <Media> créé avec succès.",
    );

    /**
     * Créer le ComponentSet de galeries de medias
     */
    logger.info(
      "[generateImagesComponents] Création du ComponentSet <Gallery>...",
    );
    figma.currentPage = galleryPage;
    const galleryComponents: ComponentNode[] = [];

    const layouts = ["grid", "masonry", "justified", "carousel"];
    const breakpoints = breakpointsConfig(
      layoutGuide.minColumnWidth,
      layoutGuide.gutter,
      layoutGuide.horizontalBodyPadding,
      layoutGuide.minViewportHeight,
      layoutGuide.horizontalMainPadding,
    );

    const categoryLength = imageDatas[Object.keys(imageDatas)[0]].length;
    const ratiosByOrientations = ratios.flatMap((ratio) => {
      if (ratio.name === "1:1") {
        return [{ ratio: ratio.name, orientation: "false" }];
      }
      return orientations
        .filter((orientation) => orientation !== "false")
        .map((orientation) => ({
          ratio: ratio.name,
          orientation: orientation,
        }));
    });
    const baseFormatComponent = formatComponentSet.children[0] as ComponentNode;

    for (const layout of layouts) {
      for (const [breakpoint, properties] of Object.entries(breakpoints)) {
        if (properties.columns % 3 !== 0) continue;
        const columns = properties.columns / 3;
        const columnWidth = properties.contentWidth.columns[3].min;
        const galleryComponent: ComponentNode =
          (await elementBuilder.createElement(
            `layout=${layout}, breakpoint=${breakpoint}`,
            "COMPONENT",
            galleryPage,
            {
              layoutMode: layout === "justified" ? "VERTICAL" : "HORIZONTAL",
              primaryAxisSizingMode: layout === "justified" ? "AUTO" : "FIXED",
              counterAxisSizingMode: layout === "justified" ? "FIXED" : "AUTO",
              itemSpacing:
                layout === "justified"
                  ? layoutGuide.baselineGrid
                  : layoutGuide.gutter,
              counterAxisSpacing:
                layout === "grid" ? layoutGuide.baselineGrid : undefined,
              layoutWrap:
                layout === "grid"
                  ? "WRAP"
                  : layout === "carousel"
                    ? "NO_WRAP"
                    : undefined,
              clipsContent: layout === "carousel",
              overflowDirection:
                layout === "carousel" ? "HORIZONTAL" : undefined,
            },
            {
              width: properties.contentWidth.columns[properties.columns].min,
              height: layoutGuide.maxContentHeight,
            },
          )) as ComponentNode;

        const formatInstances = [];
        for (let i = 0; i < 24; i++) {
          const categoryIndex = i % categoryLength;

          const ratioOrientationIndex = i % ratiosByOrientations.length;
          const { ratio, orientation } =
            ratiosByOrientations[ratioOrientationIndex];

          const formatInstance = await componentBuilder.createInstance(
            baseFormatComponent,
            undefined,
            false,
          );
          formatInstance.setProperties({
            ratio,
            orientation,
          });

          const nestedImageInstance = formatInstance.findOne(
            (n) => n.type === "INSTANCE" && n.name === "<ImageDatas>",
          ) as InstanceNode;
          nestedImageInstance.setProperties({
            image: String(categoryIndex + 1),
          });

          formatInstances.push(formatInstance);
        }

        if (layout === "masonry" || layout === "justified") {
          const galleryLayoutFramesPropeties: Partial<FrameNode> = {
            primaryAxisSizingMode: "AUTO",
            fills: [],
          };
          if (layout === "masonry") {
            const imagesByColumn = Math.ceil(24 / columns);
            for (let column = 0; column < columns; column++) {
              const columnFrame = (await elementBuilder.createElement(
                `column-${column + 1}`,
                "FRAME",
                galleryComponent,
                {
                  layoutMode: "VERTICAL",
                  counterAxisSizingMode: "FIXED",
                  itemSpacing: layoutGuide.baselineGrid,
                  ...galleryLayoutFramesPropeties,
                },
              )) as FrameNode;

              let itemsForColumn = sliceItems(
                column,
                imagesByColumn,
                formatInstances,
              );
              itemsForColumn = shuffle(itemsForColumn);

              for (const item of itemsForColumn) {
                await elementBuilder.updateElement(item, columnFrame, {
                  layoutAlign: "STRETCH",
                });
              }
              await elementBuilder.updateElement(
                columnFrame,
                undefined,
                {},
                { width: columnWidth, height: columnFrame.height },
              );
            }
          } else {
            for (let row = 0; row < Math.ceil(24 / columns); row++) {
              const rowFrame = await elementBuilder.createElement(
                `row-${row + 1}`,
                "FRAME",
                galleryComponent,
                {
                  layoutMode: "HORIZONTAL",
                  counterAxisSizingMode: "AUTO",
                  itemSpacing: layoutGuide.gutter,
                  ...galleryLayoutFramesPropeties,
                },
              );

              let itemsForRow = sliceItems(row, columns, formatInstances);
              const ratios = itemsForRow.map((item) => {
                const w = (item as InstanceNode).width;
                const h = (item as InstanceNode).height;
                return w / h;
              });
              const sumRatios = ratios.reduce((a, b) => a + b, 0);
              const height =
                (galleryComponent.width -
                  layoutGuide.gutter * (ratios.length - 1)) /
                sumRatios;
              const widths = ratios.map((r) => r * height);
              itemsForRow = shuffle(itemsForRow);

              for (const [index, item] of itemsForRow.entries()) {
                const sizes = { width: widths[index], height: height };
                await elementBuilder.updateElement(item, rowFrame, {}, sizes);
                await elementBuilder.updateElement(
                  rowFrame,
                  undefined,
                  {},
                  sizes,
                );
              }
            }
          }
        } else {
          const shuffledInstances = shuffle(formatInstances);
          for (const item of shuffledInstances) {
            let width: number;
            let height: number;
            if (layout === "grid") {
              item.setProperties({
                orientation: "false",
                ratio: "1:1",
              });
              height = width = columnWidth;
            } else {
              // carousel
              height = columnWidth;
              width = (columnWidth * item.width) / item.height;
            }
            await elementBuilder.updateElement(
              item,
              galleryComponent,
              {},
              { width, height },
            );
          }
        }

        galleryComponents.push(galleryComponent);
      }
    }

    const galleryComponentSet = await componentBuilder.createComponentSet(
      "<Gallery>",
      galleryPage,
      galleryComponents,
      {
        layoutMode: "HORIZONTAL",
        primaryAxisSizingMode: "AUTO",
        counterAxisSizingMode: "AUTO",
        itemSpacing: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 40,
        paddingBottom: 40,
        x: 0,
        y: imageComponentSet.height + formatComponentSet.height + 160,
      },
    );
    logger.success(
      "[generateImagesComponents] ComponentSet <Gallery> créé avec succès.",
    );

    figma.viewport.scrollAndZoomIntoView([galleryComponentSet]);
  } catch (error) {
    await logger.error(
      "Erreur lors de la génération des composants d'images:",
      error,
    );
    throw error;
  }
}
