import fs from "fs";
import path from "path";
import { FigmaCollection } from "../types";
import { OUTPUT_DIR } from "../constants/fsConstants";

export function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

export async function createDirForCollection(collection: FigmaCollection) {
  ensureOutputDir();
  const collectionDir = path.join(OUTPUT_DIR, ...collection.name.split("/"));
  if (!fs.existsSync(collectionDir)) {
    fs.mkdirSync(collectionDir, { recursive: true });
  }
  collection.modes.forEach((mode) => {
    const filePath = path.join(
      collectionDir,
      `${sanitizeFilename(mode)}.tokens.json`
    );
    const data = collection.variables[mode];
    if (data === undefined) {
      console.warn(
        `Aucune donnée pour le mode "${mode}" dans la collection "${collection.name}"`
      );
      return;
    }
    fs.writeFileSync(filePath, data, "utf-8");
  });
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9_-]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}
