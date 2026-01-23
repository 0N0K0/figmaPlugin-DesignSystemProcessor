export type TextStyleParams = {
  name: string;
  fontName?: FontName;
  fontSize?: number;
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
  paragraphSpacing?: number;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
  boundVariables?: {
    fontFamily: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
    fontStyle: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
    fontSize: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
    lineHeight: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
    letterSpacing: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
  };
};

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: RGBA;
  boundVariables?: {
    color: {
      type: "VARIABLE_ALIAS";
      id: string;
    };
  };
}
