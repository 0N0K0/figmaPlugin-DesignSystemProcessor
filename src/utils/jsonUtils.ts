import { FigmaVariable } from "../types";

export function generateModeJson(
  collectionName: string,
  modeName: string,
  variables: FigmaVariable[] | Record<string, any>
): string {
  const modeData: Record<string, any> = variables;
  modeData.$extensions = {
    "com.figma.modeName": modeName,
    "com.figma.collectionName": collectionName,
  };
  return JSON.stringify(modeData, null, 2);
}
