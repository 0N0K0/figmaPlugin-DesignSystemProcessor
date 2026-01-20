/**
 * Utilitaire pour construire des styles Figma
 */

import { TextStyleParams } from "../../types/stylesTypes";

export class StyleBuilder {
  async getStyle(
    name: string,
    type: "effect" | "text" | "paint" | "grid",
  ): Promise<PaintStyle | EffectStyle | TextStyle | GridStyle | undefined> {
    let styles: ReadonlyArray<PaintStyle | EffectStyle | TextStyle | GridStyle>;
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
    return style;
  }

  async createOrUpdateStyle(
    name: string,
    type: "paint" | "text" | "effect",
    params: Paint[] | TextStyleParams | Effect[],
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    await this.removeStyle(name, type);
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

    return await this.updateStyle(name, type, params);
  }

  async updateStyle(
    name: string,
    type: "paint" | "text" | "effect",
    params: Paint[] | TextStyleParams | Effect[],
  ): Promise<PaintStyle | TextStyle | EffectStyle | GridStyle | undefined> {
    let style = await this.getStyle(name, type);
    if (!style) return;
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
        await figma.loadFontAsync(fontName);
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
        break;
      case "effect":
        (style as EffectStyle).effects = params as Effect[];
        break;
    }
    return style;
  }

  async removeStyle(
    name: string,
    type: "paint" | "text" | "effect" | "grid",
  ): Promise<void> {
    const style = await this.getStyle(name, type);
    if (style) {
      style.remove();
    }
  }
}

export const styleBuilder = new StyleBuilder();
