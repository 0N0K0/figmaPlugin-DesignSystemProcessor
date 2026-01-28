import { logger } from "../../utils/logger";

export class ComponentBuilder {
  /**
   * Crée un jeu de composants
   */
  async createComponentSet(
    name: string,
    page: PageNode,
    components: ComponentNode[],
    properties?: Partial<ComponentSetNode>,
  ): Promise<ComponentSetNode> {
    try {
      figma.currentPage = page;
      page.selection = components;
      const componentSet: ComponentSetNode = figma.combineAsVariants(
        components,
        page,
      );
      componentSet.name = name;
      if (properties) {
        Object.assign(componentSet, properties);
      }
      return componentSet;
    } catch (error) {
      await logger.error(
        `[createComponentSet] Erreur lors de la création du jeu de composants ${name} :`,
        error,
      );
      throw error;
    }
  }

  async createInstance(
    mainComponent: ComponentNode,
    parent?: PageNode | FrameNode | ComponentNode,
    instanceSwap?: boolean,
    properties?: Partial<SceneNode>,
    size?: { width: number; height: number },
  ): Promise<InstanceNode> {
    try {
      const instance = mainComponent.createInstance();
      if (parent !== undefined) parent.appendChild(instance);
      if (properties !== undefined) Object.assign(instance, properties);
      if (size !== undefined && size.width && size.height)
        instance.resize(size.width, size.height);
      if (instanceSwap && parent !== undefined && parent.type === "COMPONENT")
        parent.addComponentProperty(
          mainComponent.name,
          "INSTANCE_SWAP",
          mainComponent.id,
          {
            preferredValues: [{ type: "COMPONENT", key: mainComponent.key }],
          },
        );
      return instance;
    } catch (error) {
      await logger.error(
        `[createInstance] Erreur lors de la création de l'instance:`,
        error,
      );
      throw error;
    }
  }
}

export const componentBuilder = new ComponentBuilder();
