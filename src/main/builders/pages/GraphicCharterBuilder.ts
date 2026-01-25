import { formatHex8, formatHsl, formatRgb, Rgb } from "culori";
import { variableBuilder } from "../variables/variableBuilder";

function generateGraphicCharterPages(): PageNode {
  // Trouver ou créer la page "CHARTE GRAPHIQUE"
  let graphicCharterPage = figma.root.children.find(
    (page) => page.name === "GRAPHIC CHARTER",
  ) as PageNode | undefined;
  if (!graphicCharterPage) {
    graphicCharterPage = figma.createPage();
    graphicCharterPage.name = "GRAPHIC CHARTER";
  }
  figma.currentPage = graphicCharterPage;
  return graphicCharterPage;
}

async function generateFrame(
  name: string,
  theme: string,
  layout: "GRID" | "HORIZONTAL",
): Promise<FrameNode> {
  const graphicCharterPage = generateGraphicCharterPages();
  // Créer une frame pour les couleurs
  let frame = graphicCharterPage.children.find(
    (child) => child.name === name,
  ) as FrameNode | undefined;
  if (!frame) {
    frame = figma.createFrame();
    frame.fills = [];
    frame.name = name;
    frame.resize(1920, 1080);
    frame.x = 0;
    frame.layoutMode = layout;
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "AUTO";
    if (layout === "GRID") {
      frame.gridColumnGap = 16;
      frame.gridRowGap = 24;
      frame.paddingTop = 48;
      frame.paddingBottom = 48;
      frame.paddingLeft = 32;
      frame.paddingRight = 32;
    } else {
      frame.itemSpacing = 0;
    }
    frame.fills = [
      {
        type: "SOLID",
        color: {
          r: theme === "light" ? 1 : 0,
          g: theme === "light" ? 1 : 0,
          b: theme === "light" ? 1 : 0,
        },
      },
    ];
    graphicCharterPage.appendChild(frame);
  }
  return frame;
}

async function generateText(
  parent: FrameNode,
  name: string,
  typography: "meta" | "body",
  rowIndex?: number,
  colIndex?: number,
) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  let text = parent.children.find((child) => child.name === name) as
    | TextNode
    | undefined;
  if (!text) {
    const textColor = await variableBuilder.findVariable(
      "Style\\Colors\\Themes",
      "neutral/text/core/primary",
    );
    const textStyles = await figma.getLocalTextStylesAsync();
    if (!textStyles) return;
    const textStyle = textStyles.find(
      (s) =>
        s.name ===
        (typography === "meta" ? "interface/meta/sm" : "core/body/sm"),
    );
    if (textStyle) {
      await figma.loadFontAsync(textStyle.fontName as FontName);
    }

    text = figma.createText();
    text.name = name;
    text.characters = name;
    text.textStyleId = textStyle ? textStyle.id : "";
    text.fills = textColor
      ? [
          {
            type: "SOLID",
            color: { r: 0, g: 0, b: 0 },
            boundVariables: {
              color: {
                id: textColor.id,
                type: "VARIABLE_ALIAS",
              },
            },
          },
        ]
      : [];
    parent.appendChild(text);
    if (rowIndex !== undefined && colIndex !== undefined)
      text.setGridChildPosition(rowIndex, colIndex);
  }
}

async function generateColorFrame(
  color: Variable,
  colorIndex: number,
  collection: VariableCollection,
  parent: FrameNode,
  mode?: {
    modeId: string;
    name: string;
  },
  modeIndex?: number,
  themeMode?: {
    modeId: string;
    name: string;
  },
): Promise<void> {
  // Générer title
  await generateText(parent, color.name, "meta", colorIndex, 0);

  let colorTargetValue: VariableValue | undefined = mode
    ? color.valuesByMode[mode.modeId]
    : color.valuesByMode[Object.keys(color.valuesByMode)[0]];
  let maxDepth = 10;
  while (
    colorTargetValue &&
    typeof colorTargetValue === "object" &&
    "type" in colorTargetValue &&
    maxDepth-- > 0
  ) {
    const alias = await figma.variables.getVariableByIdAsync(
      colorTargetValue.id,
    );
    if (!alias) break;
    const possiblesModes = themeMode
      ? [themeMode.modeId, Object.keys(alias.valuesByMode)[0]]
      : [Object.keys(alias.valuesByMode)[0]];
    for (const possibleMode of possiblesModes) {
      const value = alias.valuesByMode[possibleMode];
      if (value) {
        colorTargetValue = value;
        break;
      }
    }
  }
  if (
    typeof colorTargetValue === "object" &&
    colorTargetValue !== null &&
    "a" in colorTargetValue
  ) {
    const RGB: Rgb = {
      mode: "rgb",
      r: colorTargetValue.r,
      g: colorTargetValue.g,
      b: colorTargetValue.b,
      alpha: colorTargetValue.a,
    };

    const colorFrame = figma.createFrame();
    colorFrame.fills = [];
    colorFrame.name = color.name;
    colorFrame.layoutMode = "HORIZONTAL";
    colorFrame.primaryAxisSizingMode = "AUTO";
    colorFrame.counterAxisSizingMode = "AUTO";
    colorFrame.itemSpacing = 8;

    const rect = figma.createRectangle();
    rect.resize(72, 72);
    rect.fills = [
      {
        type: "SOLID",
        color: {
          r: colorTargetValue.r,
          g: colorTargetValue.g,
          b: colorTargetValue.b,
        },
        opacity: colorTargetValue.a,
        boundVariables: {
          color: {
            id: color.id,
            type: "VARIABLE_ALIAS",
          },
        },
      },
    ];
    rect.cornerRadius = 4;
    if (mode) {
      rect.setExplicitVariableModeForCollection(collection, mode.modeId);
    }
    colorFrame.appendChild(rect);

    const colorValuesFrame = figma.createFrame();
    colorValuesFrame.fills = [];
    colorValuesFrame.layoutMode = "VERTICAL";
    colorValuesFrame.primaryAxisSizingMode = "AUTO";
    colorValuesFrame.counterAxisSizingMode = "AUTO";
    colorValuesFrame.itemSpacing = 0;

    // Générer Hex
    await generateText(colorValuesFrame, formatHex8(RGB), "body");
    // Générer RGB
    await generateText(colorValuesFrame, formatRgb(RGB), "body");
    // Générer HSL
    await generateText(colorValuesFrame, formatHsl(RGB), "body");
    colorFrame.appendChild(colorValuesFrame);

    parent.appendChild(colorFrame);
    colorFrame.setGridChildPosition(colorIndex, modeIndex ? modeIndex + 1 : 1);
  }
}

export async function generateGraphicCharterColors(
  category: string,
): Promise<void> {
  const themesCollection = await variableBuilder.getCollection(
    "Style\\Colors\\Themes",
  );
  if (!themesCollection) return;
  const themesModes = await variableBuilder.getModesFromCollection(
    "Style\\Colors\\Themes",
  );

  const collectionName = `Style\\Colors\\${category}`;
  const categoryCollection =
    await variableBuilder.getCollection(collectionName);
  if (!categoryCollection) return;
  const categoryModes =
    await variableBuilder.getModesFromCollection(collectionName);
  const categoryColors =
    await variableBuilder.getCollectionVariables(collectionName);
  const coreColors = categoryColors.filter((color) =>
    color.name.toLowerCase().includes("shade"),
  );
  const themeColors = categoryColors
    .filter(
      (color) =>
        !color.name.toLowerCase().includes("shade") &&
        !color.name.toLowerCase().includes("opacity"),
    )
    .sort((a, b) => a.name.localeCompare(b.name, undefined));

  const createdFrames: FrameNode[] = [];
  const paletteFrame = await generateFrame(
    `${category}\\Palettes`,
    "light",
    "GRID",
  );
  paletteFrame.y = 0;
  paletteFrame.gridColumnCount = categoryModes.length + 1;
  paletteFrame.gridRowCount = coreColors.length + 1;
  paletteFrame.gridRowSizes = new Array(coreColors.length + 1).fill({
    type: "HUG",
  });
  createdFrames.push(paletteFrame);

  for (const color of coreColors) {
    for (const mode of categoryModes) {
      // Générer mode title
      await generateText(
        paletteFrame,
        mode.name,
        "meta",
        0,
        categoryModes.indexOf(mode) + 1,
      );

      await generateColorFrame(
        color,
        coreColors.indexOf(color) + 1,
        categoryCollection,
        paletteFrame,
        mode,
        categoryModes.indexOf(mode),
      );
    }
  }

  for (const theme of themesModes) {
    const themeColorFrame = await generateFrame(
      `${category}\\${theme.name}`,
      theme.name.toLowerCase(),
      "GRID",
    );
    createdFrames.push(themeColorFrame);
    themeColorFrame.y = 0;
    themeColorFrame.gridColumnCount = categoryModes.length + 1;
    themeColorFrame.gridRowCount = themeColors.length + 1;
    themeColorFrame.gridRowSizes = new Array(themeColors.length + 1).fill({
      type: "HUG",
    });
    themeColorFrame.setExplicitVariableModeForCollection(
      themesCollection,
      theme.modeId,
    );

    for (const mode of categoryModes) {
      // Générer mode title
      await generateText(
        themeColorFrame,
        mode.name,
        "meta",
        0,
        categoryModes.indexOf(mode) + 1,
      );

      for (const color of themeColors) {
        await generateColorFrame(
          color,
          themeColors.indexOf(color) + 1,
          categoryCollection,
          themeColorFrame,
          mode,
          categoryModes.indexOf(mode),
          theme,
        );
      }
    }
  }

  const gap = 80;

  // Optionnel : trier par position X actuelle
  const nodes = figma.currentPage.children;

  // Point de départ
  let cursorX = nodes[0]?.x ?? 0;
  const baseY = nodes[0]?.y ?? 0;

  for (const node of nodes) {
    node.x = cursorX;
    node.y = baseY;
    cursorX += node.width + gap;
  }
}

export async function generateGraphicCharterNeutral(): Promise<void> {
  const themeCollectionName = `Style\\Colors\\Themes`;

  const themesCollection =
    await variableBuilder.getCollection(themeCollectionName);
  if (!themesCollection) return;
  const themesModes =
    await variableBuilder.getModesFromCollection(themeCollectionName);
  const themeColors =
    await variableBuilder.getCollectionVariables(themeCollectionName);
  const neutralColors = themeColors
    .filter((color) => color.name.toLowerCase().includes("neutral"))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const createdFrames: FrameNode[] = [];
  const themesFrame = await generateFrame(`Neutral`, "light", "HORIZONTAL");

  for (const theme of themesModes) {
    let themeColorFrame = themesFrame.children.find(
      (child) => child.name === theme.name,
    ) as FrameNode | undefined;
    if (!themeColorFrame) {
      themeColorFrame = figma.createFrame();
      themeColorFrame.resize(960, 1080);
      themeColorFrame.fills = [];
      themeColorFrame.name = theme.name;
      themeColorFrame.layoutMode = "GRID";
      themeColorFrame.counterAxisSizingMode = "AUTO";
      themeColorFrame.gridColumnGap = 16;
      themeColorFrame.gridRowGap = 24;
      themeColorFrame.paddingTop = 48;
      themeColorFrame.paddingBottom = 48;
      themeColorFrame.paddingLeft = 32;
      themeColorFrame.paddingRight = 32;
      themeColorFrame.fills = [
        {
          type: "SOLID",
          color: {
            r: theme.name === "Light" ? 1 : 0,
            g: theme.name === "Light" ? 1 : 0,
            b: theme.name === "Light" ? 1 : 0,
          },
        },
      ];
      themesFrame.appendChild(themeColorFrame);
    }

    createdFrames.push(themeColorFrame);
    themeColorFrame.gridColumnCount = 2;
    themeColorFrame.gridRowCount = neutralColors.length;
    themeColorFrame.gridColumnSizes = [{ type: "FLEX" }, { type: "FLEX" }];
    themeColorFrame.gridRowSizes = new Array(neutralColors.length).fill({
      type: "HUG",
    });
    themeColorFrame.setExplicitVariableModeForCollection(
      themesCollection,
      theme.modeId,
    );
    for (const color of neutralColors) {
      await generateColorFrame(
        color,
        neutralColors.indexOf(color),
        themesCollection,
        themeColorFrame,
        undefined,
        undefined,
        theme,
      );
    }
  }

  const gap = 80;

  const nodes = figma.currentPage.children;
  // Point de départ
  let cursorX = nodes[0]?.x ?? 0;
  const baseY = nodes[0]?.y ?? 0;

  for (const node of nodes) {
    node.x = cursorX;
    node.y = baseY;
    cursorX += node.width + gap;
  }
}
