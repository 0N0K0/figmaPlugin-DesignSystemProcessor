// Permet de rendre la main à Figma pour flusher les logs/messages
export const yieldToFigma = () => new Promise<void>((r) => setTimeout(r, 0));
