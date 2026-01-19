import type { ColorSelectorConfig } from "./colors";

export interface InputConfig {
  id: string;
  type:
    | "text"
    | "number"
    | "select"
    | "file"
    | "button"
    | "customSelector"
    | "imageCategory";
  label?: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  options?: SelectOption[];
  accept?: string;
  multiple?: boolean;
  fileList?: boolean;
  imageCategory?: boolean;
  action?: string;
  allowEmpty?: boolean;
  class?: string;
}

export interface SectionConfig {
  title?: string;
  inputs?: InputConfig[];
  colorSelectors?: ColorSelectorConfig[];
  subsections?: SectionConfig[];
  paletteGenerator?: boolean;
  colorCollection?: {
    id: string;
    maxColors: number;
    initialColors?: ColorSelectorConfig[];
  };
}

export interface TabConfig {
  title: string;
  sections: SectionConfig[];
}

export interface SelectOption<T = any> {
  value: T;
  label: string;
  color?: string;
  isBase?: boolean;
}

export interface CustomSelectorConfig<T = any> {
  options: SelectOption<T>[];
  defaultValue?: T;
  inputId: string;
  placeholder?: string;
  allowEmpty?: boolean;
}
