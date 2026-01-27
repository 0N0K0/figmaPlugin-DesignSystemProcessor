export async function loadFont(fontName: FontName): Promise<void> {
  try {
    await figma.loadFontAsync(fontName);
  } catch (error) {
    console.error(
      `Erreur lors du chargement de la police ${fontName.family} - ${fontName.style}:`,
      error,
    );
    throw error;
  }
}
