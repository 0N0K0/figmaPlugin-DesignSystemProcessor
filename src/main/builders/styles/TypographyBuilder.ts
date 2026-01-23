import { toKebabCase } from "../../../common/utils/textUtils";
import { TextStyleParams } from "../../types/stylesTypes";
import { logger } from "../../utils/logger";
import { generateFontSizes } from "../variables/DisplayContextBuilder";
import { generateTypography } from "../variables/styles/TypographyBuilder";
import { variableBuilder } from "../variables/variableBuilder";
import { styleBuilder } from "./styleBuilder";

/**
 * Headings
 *  - Black | letter spacing -5%
 *  - H2-H3 : ExtraLight
 *  - H4-H5 : Light
 *  - H6 : Regular
 * Subtitles : Thin italic
 * Body : Light
 * Accent : Regular
 * Meta : Medium
 * Tech : Regular
 */

export async function generateTypographyStyles(
  baseFontStyles: Record<
    string,
    Record<
      string,
      Record<string, string | number | Record<string, string | number>>
    >
  >,
  baseFontSize: number,
  baseLineGrid: number,
): Promise<void> {
  const fontSizesGroups = ["body", "heading"];
  const properties = ["font-size", "line-height"];
  let fontSizes: Record<string, Record<string, Variable[]>> = {};
  for (const group of fontSizesGroups) {
    if (!fontSizes[group]) fontSizes[group] = {};
    for (const property of properties) {
      fontSizes[group][property] =
        (
          await variableBuilder.getCollectionVariablesByGroup(
            "System\\VerticalDensity",
            `typography/${group}`,
          )
        )?.filter((v) => v.name.endsWith(property)) || [];
    }
  }
  const isEmpty = Object.values(fontSizes).every((group) =>
    Object.values(group).every((vars) => vars.length === 0),
  );
  if (isEmpty) {
    const fonts = await generateFontSizes(baseFontSize, baseLineGrid);
    for (const group of fontSizesGroups) {
      if (!fontSizes[group]) fontSizes[group] = {};
      for (const property of properties) {
        fontSizes[group][property] =
          fonts.filter(
            (f: Variable) =>
              f.name.includes(group) && f.name.endsWith(property),
          ) || [];
      }
    }
  }

  let fontStyles: Variable[] = [];
  fontStyles =
    await variableBuilder.getCollectionVariables("Style\\Typography");
  if (fontStyles.length === 0)
    fontStyles = await generateTypography(baseFontStyles);

  for (const [category, types] of Object.entries(baseFontStyles)) {
    for (const [type, variables] of Object.entries(types)) {
      let fontStyleProperties: Variable[] | undefined = [];
      for (const [property, variable] of Object.entries(variables)) {
        if (typeof variable === "object" && variable !== null) {
          for (const size of Object.keys(variable)) {
            fontStyleProperties.push(
              ...fontStyles.filter((v) =>
                v.name.includes(
                  `${category}/${type}/${toKebabCase(size)}/${toKebabCase(property)}`.toLowerCase(),
                ),
              ),
            );
          }
        } else {
          fontStyleProperties.push(
            ...fontStyles.filter((v) =>
              v.name.includes(
                `${category}/${type}/${toKebabCase(property)}`.toLowerCase(),
              ),
            ),
          );
        }
      }

      if (!fontStyleProperties || fontStyleProperties.length === 0) {
        continue;
      }

      const fontFamily: Variable | undefined = fontStyleProperties.find((v) =>
        v.name.includes("font-family"),
      );
      let fontStyle: Variable | undefined = fontStyleProperties.find((v) =>
        v.name.includes("font-style"),
      );
      let letterSpacing: Variable | undefined = fontStyleProperties.find((v) =>
        v.name.includes("letter-spacing"),
      );
      if (!fontFamily || !fontStyle || !letterSpacing) {
        logger.warn(
          `Propriétés manquantes : fontFamily: ${!!fontFamily}, fontStyle: ${!!fontStyle}, letterSpacing: ${!!letterSpacing} pour ${category}/${type}`,
        );
        continue;
      }

      const fontSizesProperties =
        type === "Heading" ? fontSizes["heading"] : fontSizes["body"];
      const sizes = fontSizesProperties["font-size"];
      const lineHeights = fontSizesProperties["line-height"];

      for (const fontSize of sizes) {
        if (type === "Tech" && !fontSize.name.includes("sm")) continue;

        const splitFontSizeName = fontSize.name.split("/");
        const fontSizeName = splitFontSizeName[splitFontSizeName.length - 2];
        if (!fontSizeName) {
          logger.warn(
            `Nom de taille de police introuvable pour ${fontSize.name}`,
          );
          continue;
        }
        let fontSizeValue: number | VariableAlias = fontSize.valuesByMode[
          Object.keys(fontSize.valuesByMode)[0]
        ] as number | VariableAlias;
        if (typeof fontSizeValue === "object" && fontSizeValue !== null) {
          const fontSizeVariable = sizes.find(
            (v) => v.id === (fontSizeValue as VariableAlias).id,
          );
          if (fontSizeVariable) {
            fontSizeValue = fontSizeVariable.valuesByMode[
              Object.keys(fontSizeVariable.valuesByMode)[0]
            ] as number;
          }
        }
        const lineHeight = lineHeights.find((lh) =>
          lh.name.includes(fontSizeName),
        );
        if (!lineHeight) {
          logger.warn(
            `Hauteur de ligne introuvable pour la taille ${fontSizeName}`,
          );
          continue;
        }
        let lineHeightValue: number | VariableAlias = lineHeight.valuesByMode[
          Object.keys(lineHeight.valuesByMode)[0]
        ] as number | VariableAlias;
        if (typeof lineHeightValue === "object" && lineHeightValue !== null) {
          const lineHeightVariable = lineHeights.find(
            (v) => v.id === (lineHeightValue as VariableAlias).id,
          );
          if (lineHeightVariable) {
            lineHeightValue = lineHeightVariable.valuesByMode[
              Object.keys(lineHeightVariable.valuesByMode)[0]
            ] as number;
          }
        }

        if (category === "editorial" && type === "Heading") {
          fontStyle = fontStyleProperties.find((v) =>
            v.name.includes(`/${fontSizeName}/font-style`),
          );
          letterSpacing = fontStyleProperties.find((v) =>
            v.name.includes(`/${fontSizeName}/letter-spacing`),
          );
        }
        if (!fontStyle || !letterSpacing) {
          logger.warn(
            `Propriétés manquantes : fontStyle: ${!!fontStyle}, letterSpacing: ${!!letterSpacing} pour ${category}/${type}/${fontSizeName}`,
          );
          continue;
        }

        const name = `${category}/${type}/${fontSizeName}`.toLowerCase();
        const textStyleParams: TextStyleParams = {
          name,
          fontName: {
            family:
              fontFamily.valuesByMode[Object.keys(fontFamily.valuesByMode)[0]],
            style:
              fontStyle.valuesByMode[Object.keys(fontStyle.valuesByMode)[0]],
          },
          fontSize: typeof fontSizeValue === "number" ? fontSizeValue : 16,
          lineHeight: {
            unit: "PIXELS",
            value: typeof lineHeightValue === "number" ? lineHeightValue : 24,
          },
          paragraphSpacing: 0,
          textCase:
            category === "interface" && type === "Heading"
              ? "UPPER"
              : "ORIGINAL",
          letterSpacing: {
            unit: "PIXELS",
            value:
              Number(
                letterSpacing.valuesByMode[
                  Object.keys(letterSpacing.valuesByMode)[0]
                ],
              ) || 0,
          },
          boundVariables: {
            fontFamily: { type: "VARIABLE_ALIAS", id: fontFamily.id },
            fontStyle: { type: "VARIABLE_ALIAS", id: fontStyle.id },
            fontSize: { type: "VARIABLE_ALIAS", id: fontSize.id },
            lineHeight: { type: "VARIABLE_ALIAS", id: lineHeight.id },
            letterSpacing: { type: "VARIABLE_ALIAS", id: letterSpacing.id },
          },
        } as TextStyleParams;
        await styleBuilder.createOrUpdateStyle(name, "text", textStyleParams);
      }
    }
  }
  /**
   * @TODO Générer une page contenant tous les styles
   */
}
