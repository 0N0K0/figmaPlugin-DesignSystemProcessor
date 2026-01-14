export interface ColorSelectorConfig {
  inputId: string;
  label?: string;
  defaultColor?: string;
  editableLabel?: boolean;
}

export interface ColorInfo {
  hex: string;
  name: string;
  family: string;
  shade: string;
}
