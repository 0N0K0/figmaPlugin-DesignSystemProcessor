import type { ColorSelectorConfig } from "../types/colors";
import { initColorSelector } from "./colorSelector";

export class ColorCollection {
  private container: HTMLElement;
  private itemsContainer!: HTMLElement;
  private addBtn!: HTMLElement;
  private collectionId: string;
  private maxColors: number;
  private colors: ColorSelectorConfig[] = [];
  private counter: number = 0;

  constructor(
    container: HTMLElement,
    initialColors: ColorSelectorConfig[] = []
  ) {
    this.container = container;
    this.collectionId = container.dataset.collectionId || "colors";
    this.maxColors = parseInt(container.dataset.maxColors || "10");

    const itemsEl = container.querySelector<HTMLElement>(
      ".color-collection-items"
    );
    const addBtnEl = document.querySelector<HTMLElement>(
      `.color-collection-add-btn[data-collection-id="${this.collectionId}"]`
    );

    if (!itemsEl || !addBtnEl) {
      console.error("Color collection elements not found");
      return;
    }

    this.itemsContainer = itemsEl;
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
            "0"
          )}`,
          label: undefined,
          defaultColor: undefined,
        };

    this.colors.push(colorConfig);

    const wrapper = document.createElement("div");
    wrapper.className = "input-row color-selector-wrapper";
    wrapper.dataset.colorId = colorConfig.inputId;

    const isEditable = colorConfig.editableLabel !== false;
    const labelHtml = isEditable
      ? colorConfig.label
        ? `<input type="text" class="color-label-input" data-input-id="${colorConfig.inputId}-label" value="${colorConfig.label}" placeholder="Label" />`
        : `<input type="text" class="color-label-input" data-input-id="${colorConfig.inputId}-label" placeholder="Label" />`
      : colorConfig.label
      ? `<label>${colorConfig.label}</label>`
      : "";

    const defaultAttr = colorConfig.defaultColor
      ? ` data-default="${colorConfig.defaultColor}"`
      : "";

    wrapper.innerHTML = `
      ${labelHtml}
      <button type="button" class="color-selector-btn" data-input-id="${colorConfig.inputId}"${defaultAttr}>
        <span class="color-preview"></span>
        <span class="color-text"></span>
      </button>
      <div class="color-selector-popup">
        <div class="color-selector-grid"></div>
      </div>
      <button type="button" class="color-collection-remove-btn icon-btn" title="Remove"><i class="mdi mdi-close"></i></button>
    `;

    this.itemsContainer.appendChild(wrapper);

    // Initialiser le color selector pour cet élément
    initColorSelector(wrapper);

    // Ajouter l'événement de suppression
    const removeBtn = wrapper.querySelector(".color-collection-remove-btn");
    removeBtn?.addEventListener("click", () => {
      this.removeColor(colorConfig.inputId);
    });

    this.updateAddButton();
    this.updateRemoveButtons();
  }

  private removeColor(inputId: string): void {
    // Ne pas supprimer si c'est la dernière couleur
    if (this.colors.length <= 1) return;

    this.colors = this.colors.filter((c) => c.inputId !== inputId);

    const item = this.itemsContainer.querySelector(
      `[data-color-id="${inputId}"]`
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
      ".color-collection-remove-btn"
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
        `[data-input-id="${color.inputId}"]`
      );
      if (button) {
        const colorText = button.querySelector<HTMLElement>(".color-text");
        if (colorText) {
          data[color.inputId] = colorText.textContent || "transparent";
        }
      }

      // Récupérer aussi les labels
      const labelInput = this.itemsContainer.querySelector<HTMLInputElement>(
        `[data-input-id="${color.inputId}-label"]`
      );
      if (labelInput) {
        data[`${color.inputId}-label`] = labelInput.value || "";
      }
    });
    return data;
  }
}

export function initColorCollections(): void {
  console.log("🎨 Initializing color collections...");

  const containers =
    document.querySelectorAll<HTMLElement>(".color-collection");
  console.log(`Found ${containers.length} color collections`);

  containers.forEach((container) => {
    const collectionId = container.dataset.collectionId;
    console.log(`Initializing color collection: ${collectionId}`);

    // Récupérer les couleurs initiales depuis TABS
    // Pour l'instant, on passe un tableau vide et on les chargera depuis le build
    new ColorCollection(container, []);
  });
}
