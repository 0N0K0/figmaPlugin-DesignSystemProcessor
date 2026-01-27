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
