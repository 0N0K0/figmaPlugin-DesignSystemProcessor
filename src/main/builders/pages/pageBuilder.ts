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
        await logger.info(`[getPage] Page '${name}' non trouvée.`);
        return undefined;
      }
      await logger.info(`[getPage] Page '${name}' trouvée.`);
      return page;
    } catch (error) {
      await logger.error(
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
      await logger.info(`[getPages] Nombre de pages trouvées: ${pages.length}`);
      return pages;
    } catch (error) {
      await logger.error(
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
      return page;
    } catch (error) {
      await logger.error(
        `[createPage] Erreur lors de la création de la page '${name}':`,
        error,
      );
      throw error;
    }
  }

  async getOrCreatePage(name: string): Promise<PageNode> {
    let page = await this.getPage(name);
    if (!page) {
      page = await this.createPage(name);
    }
    return page;
  }

  /**
   * Supprime une page par son nom
   */
  async removePage(name: string): Promise<void> {
    try {
      const page = await this.getPage(name);
      if (!page) {
        await logger.warn(
          `[removePage] Impossible de supprimer la page '${name}': page non trouvée.`,
        );
        return;
      }
      page.remove();
    } catch (error) {
      await logger.error(
        `[removePage] Erreur lors de la suppression de la page '${name}':`,
        error,
      );
      throw error;
    }
  }
}

export const pageBuilder = new PageBuilder();
