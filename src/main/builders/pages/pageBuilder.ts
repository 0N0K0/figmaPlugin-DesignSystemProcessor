import { logger } from "../../utils/logger";

export class PageBuilder {
  /**
   * Obtient une page par son nom
   */
  async getPage(name: string): Promise<PageNode | undefined> {
    try {
      const pages = await this.getPages();
      const page = pages.find((p) => p.name === name) as PageNode | undefined;
      if (!page) {
        logger.warn(`[getPage] Page '${name}' non trouvée.`);
        return undefined;
      }
      logger.info(`[getPage] Page '${name}' trouvée.`);
      return page;
    } catch (error) {
      logger.error(
        `[getPage] Erreur lors de la récupération de la page '${name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtient toutes les pages
   */
  async getPages(): Promise<PageNode[]> {
    try {
      const pages = figma.root.children as PageNode[];
      logger.info(`[getPages] Nombre de pages trouvées: ${pages.length}`);
      return pages;
    } catch (error) {
      logger.error(
        `[getPages] Erreur lors de la récupération des pages:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée une page
   */
  async createPage(name: string): Promise<PageNode> {
    try {
      const page = figma.createPage();
      page.name = name;
      logger.success(`Page '${name}' créée.`);
      return page;
    } catch (error) {
      logger.error(
        `[createPage] Erreur lors de la création de la page '${name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Supprime une page par son nom
   */
  async removePage(name: string): Promise<void> {
    try {
      const page = await this.getPage(name);
      if (!page) {
        logger.warn(
          `[removePage] Impossible de supprimer la page '${name}': page non trouvée.`,
        );
        return;
      }
      page.remove();
      logger.success(`Page '${page.name}' supprimée.`);
    } catch (error) {
      logger.error(
        `[removePage] Erreur lors de la suppression de la page '${name}':`,
        error,
      );
      throw error;
    }
  }
}

export const pageBuilder = new PageBuilder();
