import { logger } from "../../utils/logger";

export class ElementBuilder {
  /**
   * Obtient une frame par son nom
   */
  async getFrame(
    name: string,
    parent: PageNode | FrameNode,
  ): Promise<FrameNode | undefined> {
    try {
      const frames = await this.getFrames(parent);
      const frame = frames.find((f) => f.name === name) as
        | FrameNode
        | undefined;
      if (!frame) {
        logger.warn(`[getFrame] Frame '${name}' non trouvée.`);
        return undefined;
      }
      logger.info(`[getFrame] Frame '${name}' trouvée.`);
      return frame;
    } catch (error) {
      logger.error(
        `[getFrame] Erreur lors de la récupération de la frame '${name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtient toutes les frames d'un parent
   */
  async getFrames(parent: PageNode | FrameNode): Promise<FrameNode[]> {
    try {
      const frames = parent.findChildren(
        (child) => child.type === "FRAME",
      ) as FrameNode[];
      logger.info(`[getFrames] Nombre de frames trouvées: ${frames.length}`);
      return frames;
    } catch (error) {
      logger.error(
        `[getFrames] Erreur lors de la récupération des frames:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée une frame
   */
  async createFrame(
    name: string,
    parent: PageNode | FrameNode,
    properties: Partial<FrameNode>,
  ): Promise<FrameNode> {
    try {
      const frame = figma.createFrame();
      frame.name = name;
      await this.setFrameProperties(frame, properties);
      await this.setElementParent(frame, parent);
      logger.success(`[createFrame] Frame '${name}' créée.`);
      return frame;
    } catch (error) {
      logger.error(
        `[createFrame] Erreur lors de la création de la frame '${name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Définit le parent d'une frame
   */
  async setElementParent(
    element: SceneNode,
    parent: PageNode | FrameNode,
  ): Promise<void> {
    try {
      parent.appendChild(element);
      logger.success(
        `[setElementParent] Element '${element.name}' ajouté au parent '${parent.name}'.`,
      );
    } catch (error) {
      logger.error(
        `[setElementParent] Erreur lors de l'ajout de l'élément '${element.name}' au parent '${parent.name}':`,
        error,
      );
      throw error;
    }
  }

  async setFrameProperties(
    frame: FrameNode,
    properties: Partial<FrameNode>,
  ): Promise<void> {
    try {
      Object.assign(frame, properties);
      logger.success(
        `[setFrameProperties] Propriétés définies pour la frame '${frame.name}'.`,
      );
    } catch (error) {
      logger.error(
        `[setFrameProperties] Erreur lors de la définition des propriétés pour la frame '${frame.name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Supprime une frame par son nom
   */
  async removeFrame(name: string, parent: PageNode | FrameNode): Promise<void> {
    try {
      const frame = await this.getFrame(name, parent);
      if (!frame) {
        logger.warn(
          `[removeFrame] Impossible de supprimer la frame '${name}': frame non trouvée.`,
        );
        return;
      }
      frame.remove();
      logger.success(`Frame '${frame.name}' supprimée.`);
    } catch (error) {
      logger.error(
        `[removeFrame] Erreur lors de la suppression de la frame '${name}':`,
        error,
      );
      throw error;
    }
  }
}

export const elementBuilder = new ElementBuilder();
