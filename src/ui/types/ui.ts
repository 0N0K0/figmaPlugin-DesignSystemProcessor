import type { ColorSelectorConfig } from "./colors";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface InputConfig {
  id: string;
  type: "text" | "number" | "select" | "file" | "button";
  label?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  options?: SelectOption[];
  accept?: string;
  multiple?: boolean;
  fileList?: boolean;
  imagePreview?: boolean;
  action?: string;
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
  id: string;
  title: string;
  sections: SectionConfig[];
}
