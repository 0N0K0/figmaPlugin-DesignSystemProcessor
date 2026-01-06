/**
 * Valeur d'une couleur Figma
 */
export interface FigmaColorValue {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha: number;
  hex: string;
}

/**
 * Interface pour une variable Figma
 */
export interface FigmaVariable {
  id: string;
  name: string;
  type: 'color' | 'number' | 'string' | 'boolean';
  scopes: string[];
  hiddenFromPublishing?: boolean;
  values: Record<string, any>;
}

/**
 * Interface pour un mode d'une collection
 */
export interface FigmaMode {
  modeId: string;
  name: string;
}

/**
 * Interface pour une collection de variables
 */
export interface FigmaCollection {
  id: string;
  name: string;
  modes: FigmaMode[];
  variables: FigmaVariable[];
}
