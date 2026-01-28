import { logger } from "../../utils/logger";

export class ElementBuilder {
  /**
   * Obtient un élément par son nom
   */
  async getElement(
    name: string,
    parent: PageNode | FrameNode | ComponentNode,
  ): Promise<SceneNode | undefined> {
    try {
      const elements = await this.getElements(parent);
      const element = elements.find((e) => e.name === name) as
        | SceneNode
        | undefined;
      if (!element) {
        await logger.info(`[getElement] Element '${name}' non trouvé.`);
        return undefined;
      }
      return element;
    } catch (error) {
      await logger.error(
        `[getElement] Erreur lors de la récupération de l'élément '${name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtient tous les éléments d'un parent
   */
  async getElements(
    parent: PageNode | FrameNode | ComponentNode,
  ): Promise<readonly SceneNode[]> {
    try {
      const elements = parent.children;
      await logger.info(
        `[getElements] Nombre d'éléments trouvés: ${elements.length}`,
      );
      return elements;
    } catch (error) {
      await logger.error(
        `[getElements] Erreur lors de la récupération des éléments:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée un élément
   */
  async createElement(
    name: string,
    type: "FRAME" | "COMPONENT",
    parent: PageNode | FrameNode | ComponentNode,
    properties?: Partial<FrameNode | ComponentNode>,
    size?: { width: number; height: number },
    lockAspectRatio?: boolean,
  ): Promise<FrameNode | ComponentNode> {
    try {
      let element: FrameNode | ComponentNode;
      switch (type) {
        case "FRAME":
          element = figma.createFrame();
          break;
        case "COMPONENT":
          element = figma.createComponent();
          break;
        default:
          throw new Error(`[createElement] Type d'élément inconnu: ${type}`);
      }

      element.name = name;
      if (
        properties !== undefined ||
        size !== undefined ||
        lockAspectRatio !== undefined
      )
        await this.updateElement(
          element,
          parent,
          properties,
          size,
          lockAspectRatio,
        );

      return element;
    } catch (error) {
      await logger.error(
        `[createElement] Erreur lors de la création de l'élément '${name}':`,
        error,
      );
      throw error;
    }
  }

  async updateElement(
    element: FrameNode | ComponentNode | InstanceNode,
    parent?: FrameNode | ComponentNode | PageNode,
    properties?: Partial<FrameNode | ComponentNode | InstanceNode>,
    size?: { width: number; height: number },
    lockAspectRatio?: boolean,
  ): Promise<FrameNode | ComponentNode | InstanceNode> {
    try {
      if (parent !== undefined) parent.appendChild(element);
      if (size !== undefined && size.width && size.height)
        element.resize(size.width, size.height);
      if (lockAspectRatio) element.lockAspectRatio();
      if (properties !== undefined) Object.assign(element, properties);
      return element;
    } catch (error) {
      await logger.error(
        `[updateElement] Erreur lors de la mise à jour de l'élément '${element.name}':`,
        error,
      );
      throw error;
    }
  }

  async setParent(
    element: SceneNode,
    parent: FrameNode | ComponentNode | PageNode,
  ): Promise<void> {
    try {
      parent.appendChild(element);
    } catch (error) {
      await logger.error(
        `[setParent] Erreur lors de la définition du parent de l'élément '${element.name}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Supprime un élément par son nom
   */
  async removeElement(
    name: string,
    parent: PageNode | FrameNode,
  ): Promise<void> {
    try {
      const element = await this.getElement(name, parent);
      if (!element) {
        await logger.warn(
          `[removeElement] Impossible de supprimer l'élément '${name}': élément non trouvé.`,
        );
        return;
      }
      element.remove();
    } catch (error) {
      await logger.error(
        `[removeElement] Erreur lors de la suppression de l'élément '${name}':`,
        error,
      );
      throw error;
    }
  }
}

export const elementBuilder = new ElementBuilder();
