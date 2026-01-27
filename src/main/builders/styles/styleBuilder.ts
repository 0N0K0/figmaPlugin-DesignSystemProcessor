/**
 * Utilitaire pour construire des styles Figma
 */

import { TextStyleParams } from "../../types/stylesTypes";
import { logger } from "../../utils/logger";
import { loadFont } from "../../utils/typographyUtils";

export class StyleBuilder {
  /**
   * Obtient un style par son nom et son type
   */
  private async getStyle(
    name: string,
    type: "effect" | "text" | "paint" | "grid",
  ): Promise<PaintStyle | EffectStyle | TextStyle | GridStyle | undefined> {
    try {
      let styles: ReadonlyArray<
        PaintStyle | EffectStyle | TextStyle | GridStyle
      >;
      switch (type) {
        case "paint":
          styles = await figma.getLocalPaintStylesAsync();
          break;
        case "effect":
          styles = await figma.getLocalEffectStylesAsync();
          break;
        case "text":
          styles = await figma.getLocalTextStylesAsync();
          break;
        case "grid":
          styles = await figma.getLocalGridStylesAsync();
          break;
      }
      const style = styles.find((s) => s.name === name);
      await logger.info(
        `[getStyle] Style '${name}' de type '${type}' récupéré:`,
        style,
      );
      return style;
    } catch (error) {
      await logger.error(
        `[getStyle] Erreur lors de la récupération du style '${name}' de type '${type}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée un style Figma
   */
  private async createStyle(
    name: string,
    type: "paint" | "text" | "effect",
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    try {
      let newStyle;
      switch (type) {
        case "paint":
          newStyle = figma.createPaintStyle();
          break;
        case "effect":
          newStyle = figma.createEffectStyle();
          break;
        case "text":
          newStyle = figma.createTextStyle();
          break;
      }
      newStyle.name = name;
      const newStyleWithValues = await this.setStyleValues(newStyle, type, []);
      return newStyleWithValues;
    } catch (error) {
      await logger.error(
        `[createStyle] Erreur lors de la création du style '${name}' de type '${type}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée ou met à jour un style Figma
   */
  async createOrUpdateStyle(
    name: string,
    type: "paint" | "text" | "effect",
    params: Paint[] | TextStyleParams | Effect[],
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    try {
      let style = await this.getStyle(name, type);
      if (style) {
        return await this.updateStyle(name, type, params);
      }
      style = await this.createStyle(name, type);
    } catch (error) {
      await logger.error(
        `[createOrUpdateStyle] Erreur lors de la création ou mise à jour du style '${name}' de type '${type}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Met à jour un style Figma existant
   */
  private async updateStyle(
    name: string,
    type: "paint" | "text" | "effect",
    params: Paint[] | TextStyleParams | Effect[],
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    try {
      let style = await this.getStyle(name, type);
      if (!style) {
        await logger.warn(
          `[updateStyle] Le style '${name}' de type '${type}' n'existe pas.`,
        );
        return;
      }
      const updatedStyle = await this.setStyleValues(style, type, params);
      return updatedStyle;
    } catch (error) {
      await logger.error(
        `[updateStyle] Erreur lors de la mise à jour du style '${name}' de type '${type}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Définit les valeurs d'un style Figma
   */
  private async setStyleValues(
    style: PaintStyle | TextStyle | EffectStyle | GridStyle,
    type: "paint" | "text" | "effect",
    params: Paint[] | TextStyleParams | Effect[],
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    try {
      switch (type) {
        case "paint":
          (style as PaintStyle).paints = params as Paint[];
          break;
        case "text":
          const textParams = params as TextStyleParams;
          const fontName = textParams.fontName || {
            family: "Roboto",
            style: "Regular",
          };
          await loadFont(fontName);
          const textStyle = style as TextStyle;
          textStyle.fontName = fontName;
          textStyle.fontSize = textParams.fontSize || 16;
          textStyle.lineHeight = textParams.lineHeight || {
            value: 24,
            unit: "PIXELS",
          };
          textStyle.letterSpacing = textParams.letterSpacing || {
            value: 0,
            unit: "PIXELS",
          };
          textStyle.paragraphSpacing = textParams.paragraphSpacing || 0;
          textStyle.textCase = textParams.textCase || "ORIGINAL";
          textStyle.textDecoration = textParams.textDecoration || "NONE";

          // Bind variables to text style properties if provided
          if (textParams.boundVariables) {
            for (const field of Object.keys(textParams.boundVariables) as Array<
              keyof typeof textParams.boundVariables
            >) {
              const variableAlias = textParams.boundVariables[field];
              // Si ce n'est pas une Variable, mais un alias ou un id, on récupère la Variable
              if (variableAlias) {
                const variable = await figma.variables.getVariableByIdAsync(
                  variableAlias.id,
                );
                if (variable) {
                  textStyle.setBoundVariable(
                    field as VariableBindableTextField,
                    variable,
                  );
                }
              }
            }
          }
          break;
        case "effect":
          (style as EffectStyle).effects = params as Effect[];
          break;
      }
      return style;
    } catch (error) {
      await logger.error(
        `[setStyleValues] Erreur lors de la définition des valeurs du style '${style.name}' de type '${type}':`,
        error,
      );
      throw error;
    }
  }
}

export const styleBuilder = new StyleBuilder();
