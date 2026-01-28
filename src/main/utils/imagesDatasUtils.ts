import { componentBuilder } from "../builders/components/componentBuilder";
import { pageBuilder } from "../builders/pages/pageBuilder";
import { logger } from "./logger";

export async function createPages(
  pagesNames: string[],
  targetPageName: string,
  componentSetName: string,
): Promise<PageNode> {
  try {
    logger.info(
      `[createPages] Création ou récupération des pages pour le composant ${componentSetName}...`,
    );

    let targetPage: PageNode;
    for (const pageName of pagesNames) {
      const page = await pageBuilder.getOrCreatePage(pageName);
      if (pageName === targetPageName) targetPage = page;
    }
    logger.success(
      `[createPages] Pages pour le composant ${componentSetName} créées ou récupérées avec succès.`,
    );
    return targetPage!;
  } catch (error) {
    logger.error(
      `[createPages] Erreur lors de la création ou de la récupération des pages pour le composant ${componentSetName}:`,
      error,
    );
    throw error;
  }
}

export async function createComponentSet(
  componentName: string,
  page: PageNode,
  components: { component: ComponentNode; name: string }[] | ComponentNode[],
): Promise<void> {
  try {
    const componentSet = await componentBuilder.createComponentSet(
      componentName,
      page,
      "component" in components[0]
        ? (components as { component: ComponentNode; name: string }[]).map(
            (ic) => ic.component,
          )
        : (components as ComponentNode[]),
      {
        layoutMode: "HORIZONTAL",
        layoutSizingHorizontal: "HUG",
        layoutSizingVertical: "HUG",
        itemSpacing: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 40,
        paddingBottom: 40,
        x: 0,
        y: 0,
      },
    );
    figma.viewport.scrollAndZoomIntoView([componentSet]);
    logger.success(
      `[createComponentSet] Jeu de composants <${componentName}> créé avec succès.`,
    );
  } catch (error) {
    logger.error(
      `[createComponentSet] Erreur lors de la création du jeu de composants <${componentName}>:`,
      error,
    );
    throw error;
  }
}

export async function generateWidthHeight(
  width: number,
  maxHeight: number,
  ratio: number,
): Promise<{ newWidth: number; newHeight: number }> {
  try {
    let newWidth = width;
    let newHeight = Math.round(newWidth / ratio);
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = Math.round(newHeight * ratio);
    }
    return { newWidth, newHeight };
  } catch (error) {
    logger.error(
      "[generateWidthHeight] Erreur lors du calcul des nouvelles dimensions :",
      error,
    );
    throw error;
  }
}
