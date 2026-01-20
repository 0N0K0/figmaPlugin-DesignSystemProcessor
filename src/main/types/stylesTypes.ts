export type TextStyleParams = {
  name: string;
  fontName?: FontName;
  fontSize?: number;
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
  paragraphSpacing?: number;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
};

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}
