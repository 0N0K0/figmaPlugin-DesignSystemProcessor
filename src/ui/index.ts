import { HtmlBuilder } from "./builders";
import { TABS } from "./constants";
import * as fs from "fs";
import * as path from "path";

export function generateUI(): string {
  // Lire le CSS
  const cssPath = path.join(__dirname, "../../src/ui.css");
  const css = fs.readFileSync(cssPath, "utf8");

  // Le JS sera injecté par le build, on met un placeholder
  const js = "/* UI_SCRIPT */";

  return HtmlBuilder.buildFullHtml(TABS, css, js);
}
