import type { ColorSelectorConfig } from "../types/colors";
import { initColorSelector } from "./colorSelector";
import { generateShades } from "../../common/utils/colorUtils";
import { CustomSelector } from "./customSelector";
import type { SelectOption } from "../types/ui";

export class ColorCollection {
  private itemsContainer!: HTMLElement;
  private addBtn!: HTMLElement;
  private collectionId: string;
  private maxColors: number;
  private colors: ColorSelectorConfig[] = [];
  private counter: number = 0;
  private shadeSelectors: Map<string, CustomSelector<number>[]> = new Map();

  constructor(
    container: HTMLElement,
    initialColors: ColorSelectorConfig[] = [],
  ) {
    this.collectionId = container.dataset.collectionId || "colors";
    this.maxColors = parseInt(container.dataset.maxColors || "10");

    const addBtnEl = document.querySelector<HTMLElement>(
      `.color-collection-add-btn[data-collection-id="${this.collectionId}"]`,
    );

    if (!addBtnEl) {
      console.error("Color collection elements not found");
      return;
    }

    this.itemsContainer = container;
    this.addBtn = addBtnEl;

    // Initialiser avec les couleurs initiales
    initialColors.forEach((color) => {
      this.addColor(color);
    });

    // Si aucune couleur initiale, en ajouter une vide
    if (this.colors.length === 0) {
      this.addColor();
    }

    this.addBtn.addEventListener("click", () => this.addColor());
    this.updateAddButton();
  }

  private addColor(config?: ColorSelectorConfig): void {
    if (this.colors.length >= this.maxColors) return;

    this.counter++;
    const colorConfig: ColorSelectorConfig = config
      ? config
      : {
          inputId: `${this.collectionId}${String(this.counter).padStart(
            2,
            "0",
          )}`,
          label: undefined,
          defaultColor: undefined,
        };

    this.colors.push(colorConfig);

    const wrapper = document.createElement("div");
    wrapper.className = "color-selector-wrapper";
    wrapper.dataset.colorId = colorConfig.inputId;

    // Créer un wrapper pour base-color-input et shades-selector
    const colorAndShadesWrapper = document.createElement("div");
    colorAndShadesWrapper.className = "color-and-shades-wrapper";

    // Créer un wrapper pour le label input et le button
    const colorInputWrapper = document.createElement("div");
    colorInputWrapper.className = "base-color-input-wrapper";

    // Créer le label input (editable)
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "color-label-input";
    labelInput.dataset.inputId = `${colorConfig.inputId}-label`;
    labelInput.placeholder = "Label";
    if (colorConfig.label) {
      labelInput.value = colorConfig.label;
    }
    colorInputWrapper.appendChild(labelInput);

    // Créer le bouton color selector
    const colorBtn = document.createElement("button");
    colorBtn.type = "button";
    colorBtn.className = "color-selector-btn";
    colorBtn.dataset.inputId = colorConfig.inputId;
    if (colorConfig.defaultColor) {
      colorBtn.dataset.default = colorConfig.defaultColor;
    }

    const colorPreview = document.createElement("span");
    colorPreview.className = "color-preview";
    colorBtn.appendChild(colorPreview);

    const colorText = document.createElement("span");
    colorText.className = "color-text";
    colorBtn.appendChild(colorText);

    colorInputWrapper.appendChild(colorBtn);

    // Créer le popup pour le color selector
    const popup = document.createElement("div");
    popup.className = "color-selector-popup";
    const grid = document.createElement("div");
    grid.className = "color-selector-grid";
    popup.appendChild(grid);
    colorInputWrapper.appendChild(popup);

    colorAndShadesWrapper.appendChild(colorInputWrapper);

    // Ajouter les selects pour light, main, dark
    const shadesRow = document.createElement("div");
    shadesRow.className = "shades-selector-row";

    // Masquer la ligne des shades si pas de couleur choisie au départ
    if (!colorConfig.defaultColor) {
      shadesRow.style.display = "none";
    }

    // Générer les shades initialement avec une couleur par défaut ou celle fournie
    const baseColor = colorConfig.defaultColor || "#808080";
    const shades = generateShades(baseColor);
    const shadeOptions: SelectOption<number>[] = [];
    for (const shade of shades) {
      shadeOptions.push({
        value: shade.step,
        label: String(shade.step),
        color: shade.color,
        isBase: shade.color.toLowerCase() === baseColor.toLowerCase(),
      });
    }

    const baseColorOption = shadeOptions.find(({ isBase }) => isBase);
    let lightDefaultValue = 400;
    let mainDefaultValue = 500;
    let darkDefaultValue = 600;
    if (baseColorOption) {
      if (baseColorOption.value <= 200) {
        lightDefaultValue = baseColorOption.value;
        mainDefaultValue = baseColorOption.value + 100;
        darkDefaultValue = baseColorOption.value + 200;
      } else if (baseColorOption.value >= 800) {
        darkDefaultValue = baseColorOption.value;
        mainDefaultValue = baseColorOption.value - 100;
        lightDefaultValue = baseColorOption.value - 200;
      } else {
        lightDefaultValue = baseColorOption.value - 100;
        mainDefaultValue = baseColorOption.value;
        darkDefaultValue = baseColorOption.value + 100;
      }
    }

    const shadeTypes = [
      { type: "light", label: "Light", defaultValue: lightDefaultValue },
      { type: "main", label: "Main", defaultValue: mainDefaultValue },
      { type: "dark", label: "Dark", defaultValue: darkDefaultValue },
    ];

    const selectors: CustomSelector<number>[] = [];

    shadeTypes.forEach(({ type, label, defaultValue }) => {
      const column = document.createElement("div");
      column.className = "input-column shade-selector-column";

      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      labelEl.htmlFor = `${colorConfig.inputId}-${type}`;
      column.appendChild(labelEl);

      // Créer le shade selector
      const shadeSelector = new CustomSelector({
        options: shadeOptions,
        defaultValue: defaultValue,
        inputId: `${colorConfig.inputId}-${type}`,
      });

      selectors.push(shadeSelector);
      column.appendChild(shadeSelector.getElement());
      shadesRow.appendChild(column);
    });

    // Stocker les selectors pour pouvoir les mettre à jour plus tard
    this.shadeSelectors.set(colorConfig.inputId, selectors);

    colorAndShadesWrapper.appendChild(shadesRow);
    wrapper.appendChild(colorAndShadesWrapper);

    // Ajouter le bouton de suppression
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "color-collection-remove-btn icon-btn";
    removeBtn.title = "Remove";
    removeBtn.innerHTML = '<i class="mdi mdi-delete"></i>';
    wrapper.appendChild(removeBtn);

    this.itemsContainer.appendChild(wrapper);

    // Initialiser le color selector pour cet élément
    initColorSelector(wrapper);

    // Fermer les selects personnalisés quand on clique ailleurs
    document.addEventListener("click", () => {
      wrapper.querySelectorAll(".custom-selector.open").forEach((sel) => {
        sel.classList.remove("open");
      });
    });

    // Écouter les changements de couleur pour mettre à jour les shades
    colorBtn.addEventListener("click", () => {
      // Utiliser MutationObserver pour détecter quand la couleur change
      const observer = new MutationObserver(() => {
        const newColor = colorText.textContent;
        if (newColor && newColor !== "transparent") {
          shadesRow.style.display = "flex";
          this.updateShadesForColor(colorConfig.inputId, newColor);
        } else {
          shadesRow.style.display = "none";
        }
      });
      observer.observe(colorText, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });

    // Ajouter l'événement de suppression
    removeBtn.addEventListener("click", () => {
      this.removeColor(colorConfig.inputId);
    });

    this.updateAddButton();
    this.updateRemoveButtons();
  }

  private updateShadesForColor(inputId: string, colorHex: string): void {
    const shades = generateShades(colorHex);
    const shadeOptions: SelectOption<number>[] = shades.map((shade) => ({
      value: shade.step,
      label: String(shade.step),
      color: shade.color,
      isBase: shade.color.toLowerCase() === colorHex.toLowerCase(),
    }));

    const baseColorOption = shadeOptions.find(({ isBase }) => isBase);
    let lightDefaultValue = 400;
    let mainDefaultValue = 500;
    let darkDefaultValue = 600;
    if (baseColorOption) {
      if (baseColorOption.value <= 200) {
        lightDefaultValue = baseColorOption.value;
        mainDefaultValue = baseColorOption.value + 100;
        darkDefaultValue = baseColorOption.value + 200;
      } else if (baseColorOption.value >= 800) {
        darkDefaultValue = baseColorOption.value;
        mainDefaultValue = baseColorOption.value - 100;
        lightDefaultValue = baseColorOption.value - 200;
      } else {
        lightDefaultValue = baseColorOption.value - 100;
        mainDefaultValue = baseColorOption.value;
        darkDefaultValue = baseColorOption.value + 100;
      }
    }

    const selectors = this.shadeSelectors.get(inputId);
    if (selectors) {
      const defaultValues = [
        lightDefaultValue,
        mainDefaultValue,
        darkDefaultValue,
      ];
      selectors.forEach((selector, index) => {
        selector.updateOptions(shadeOptions);
        selector.setValue(defaultValues[index]);
      });
    }
  }

  private removeColor(inputId: string): void {
    // Ne pas supprimer si c'est la dernière couleur
    if (this.colors.length <= 1) return;

    this.colors = this.colors.filter((c) => c.inputId !== inputId);

    // Nettoyer les selectors stockés
    this.shadeSelectors.delete(inputId);

    const item = this.itemsContainer.querySelector(
      `[data-color-id="${inputId}"]`,
    );
    if (item) {
      item.remove();
    }

    this.updateAddButton();
    this.updateRemoveButtons();
  }

  private updateAddButton(): void {
    if (this.colors.length >= this.maxColors) {
      this.addBtn.setAttribute("disabled", "");
    } else {
      this.addBtn.removeAttribute("disabled");
    }
  }

  private updateRemoveButtons(): void {
    const removeButtons = this.itemsContainer.querySelectorAll<HTMLElement>(
      ".color-collection-remove-btn",
    );
    removeButtons.forEach((btn) => {
      if (this.colors.length <= 1) {
        btn.style.display = "none";
      } else {
        btn.style.display = "flex";
      }
    });
  }

  public getColors(): Record<string, string> {
    const data: Record<string, string> = {};
    this.colors.forEach((color) => {
      const button = this.itemsContainer.querySelector<HTMLElement>(
        `[data-input-id="${color.inputId}"]`,
      );
      if (button) {
        const colorText = button.querySelector<HTMLElement>(".color-text");
        if (colorText) {
          data[color.inputId] = colorText.textContent || "transparent";
        }
      }

      // Récupérer aussi les labels
      const labelInput = this.itemsContainer.querySelector<HTMLInputElement>(
        `[data-input-id="${color.inputId}-label"]`,
      );
      if (labelInput) {
        data[`${color.inputId}-label`] = labelInput.value || "";
      }
    });
    return data;
  }
}

export function initColorCollections(): void {
  const containers =
    document.querySelectorAll<HTMLElement>(".color-collection");

  containers.forEach((container) => {
    const collectionId = container.dataset.collectionId;

    // Récupérer les couleurs initiales depuis TABS
    new ColorCollection(container, []);
  });
}
