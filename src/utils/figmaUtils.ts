import { FigmaVariable, FigmaColorValue } from "../types";

export function generateVariable(
  type: "number" | "string" | "boolean" | "color",
  value: number | string | boolean | FigmaColorValue,
  scopes?: string[],
  hiddenFromPublishing: boolean = false,
  targetVariableName?: string,
  targetVariableSetName?: string
): FigmaVariable {
  let variable: FigmaVariable = {
    $type: type === "boolean" ? "number" : type,
    $value:
      typeof value === "boolean"
        ? value
          ? 1
          : 0
        : (value as number | string | FigmaColorValue),
  };
  if (scopes) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.scopes"] = scopes;
  }
  if (type === "boolean" || type === "string") {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.type"] = type;
  }
  if (hiddenFromPublishing) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.hiddenFromPublishing"] = true;
  }
  if (targetVariableName && targetVariableSetName) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.aliasdata"] = {
      targetVariableName: targetVariableName,
      targetVariableSetName: targetVariableSetName,
    };
  }
  return variable;
}
