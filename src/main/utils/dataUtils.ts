export function flatten(
  obj: any,
  prefix = "",
  out: Record<string, string> = {},
) {
  try {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        flatten(obj[key], prefix + key + "/", out);
      } else {
        out[prefix + key] = String(obj[key]);
      }
    }
    return out;
  } catch (error) {
    throw new Error(`Erreur lors de l'aplatissement de l'objet: ${error}`);
  }
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function sliceItems(
  index: number,
  itemsCount: number,
  array: any[],
): any[] {
  const start = index * itemsCount;
  return array.slice(start, start + itemsCount);
}
