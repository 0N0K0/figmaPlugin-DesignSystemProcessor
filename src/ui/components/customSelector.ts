import { SelectOption, CustomSelectorConfig } from "../types/ui";

/**
 * Composant de sélection personnalisé flexible
 */

export class CustomSelector<T = any> {
  private container: HTMLDivElement;
  private selectBtn: HTMLButtonElement;
  private optionsMenu: HTMLDivElement;
  private options: SelectOption<T>[];
  private currentValue: T | null;
  private onChangeCallback?: (value: T | null) => void;
  private placeholder: string;
  private allowEmpty: boolean;

  constructor(config: CustomSelectorConfig<T>) {
    this.options = config.options;
    this.currentValue = config.defaultValue ?? null;
    this.placeholder = config.placeholder ?? "Sélectionner...";
    this.allowEmpty = config.allowEmpty ?? false;

    // Créer le conteneur principal
    this.container = document.createElement("div");
    this.container.className = "custom-selector";
    this.container.dataset.inputId = config.inputId;

    // Créer le bouton de sélection
    this.selectBtn = document.createElement("button");
    this.selectBtn.type = "button";
    this.selectBtn.className = "custom-selector-btn btn";

    const defaultOption =
      this.currentValue !== null
        ? this.options.find((opt) => opt.value === this.currentValue)
        : null;

    if (defaultOption) {
      this.updateButtonDisplay(defaultOption);
      this.selectBtn.dataset.value = String(this.currentValue);
    } else {
      this.selectBtn.textContent = this.placeholder;
      this.selectBtn.classList.add("empty");
    }

    // Créer le menu des options
    this.optionsMenu = document.createElement("div");
    this.optionsMenu.className = "custom-selector-options";
    this.optionsMenu.style.display = "none"; // Caché par défaut

    this.renderOptions();
    this.attachEventListeners();

    this.container.appendChild(this.selectBtn);
    this.container.appendChild(this.optionsMenu);
  }

  private updateButtonDisplay(option: SelectOption<T>): void {
    if (option.color) {
      this.selectBtn.innerHTML = `
        <span class="custom-selector-color-indicator" style="background-color: ${option.color}"></span>
        <span class="custom-selector-label">${option.label}</span>
        <i class="mdi mdi-chevron-down"></i>
      `;
    } else {
      this.selectBtn.innerHTML = `
        <span class="custom-selector-label">${option.label}</span>
        <i class="mdi mdi-chevron-down"></i>
      `;
    }
    this.selectBtn.classList.remove("empty");
  }

  private renderOptions(): void {
    this.optionsMenu.innerHTML = "";

    // Ajouter l'option "Aucun" si allowEmpty est true
    if (this.allowEmpty) {
      const emptyOption = document.createElement("button");
      emptyOption.type = "button";
      emptyOption.className = "custom-selector-option btn empty-option";
      emptyOption.dataset.value = "null";
      emptyOption.textContent = "Aucun";

      if (this.currentValue === null) {
        emptyOption.classList.add("selected");
      }

      emptyOption.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectValue(null);
      });

      this.optionsMenu.appendChild(emptyOption);
    }

    this.options.forEach(({ value, label, color, isBase }) => {
      const optionItem = document.createElement("button");
      optionItem.type = "button";
      optionItem.className = "custom-selector-option btn";
      optionItem.dataset.value = String(value);

      if (isBase) {
        optionItem.classList.add("base");
      }

      if (color) {
        optionItem.innerHTML = `
          <span class="custom-selector-color-indicator" style="background-color: ${color}"></span>
          <span class="custom-selector-label">${label}</span>
          ${isBase ? '<i class="mdi mdi-star"></i>' : ""}
        `;
      } else {
        optionItem.innerHTML = `<span class="custom-selector-label">${label}</span>${
          isBase ? '<i class="mdi mdi-star"></i>' : ""
        }`;
      }

      if (value === this.currentValue) {
        optionItem.classList.add("selected");
      }

      // Gérer la sélection
      optionItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectValue(value);
      });

      this.optionsMenu.appendChild(optionItem);
    });
  }

  private attachEventListeners(): void {
    // Toggle du menu
    this.selectBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const isCurrentlyOpen = this.container.classList.contains("open");

      // Fermer les autres selects ouverts
      document.querySelectorAll(".custom-selector").forEach((sel) => {
        if (sel !== this.container) {
          sel.classList.remove("open");
          const menu = sel.querySelector(
            ".custom-selector-options"
          ) as HTMLElement;
          if (menu) menu.style.display = "none";
        }
      });

      // Toggle l'état du select actuel
      if (isCurrentlyOpen) {
        this.container.classList.remove("open");
        this.optionsMenu.style.display = "none";
      } else {
        this.container.classList.add("open");
        this.optionsMenu.style.display = "flex";
      }
    });

    // Fermer le menu au click outside
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!this.container.contains(target)) {
        this.close();
      }
    });
  }

  /**
   * Sélectionne une valeur
   */
  public selectValue(value: T | null): void {
    if (value === null) {
      if (!this.allowEmpty) return;
      this.currentValue = null;
      this.selectBtn.textContent = this.placeholder;
      this.selectBtn.classList.add("empty");
    } else {
      const selectedOption = this.options.find((opt) => opt.value === value);
      if (!selectedOption) return;

      this.currentValue = value;
      this.updateButtonDisplay(selectedOption);
      this.selectBtn.dataset.value = String(value);
    }

    // Mettre à jour les classes selected
    this.optionsMenu
      .querySelectorAll(".custom-selector-option")
      .forEach((opt) => {
        opt.classList.remove("selected");
      });

    if (value === null) {
      const emptyOption = this.optionsMenu.querySelector(".empty-option");
      emptyOption?.classList.add("selected");
    } else {
      const selectedOptionEl = this.optionsMenu.querySelector(
        `[data-value="${value}"]`
      );
      selectedOptionEl?.classList.add("selected");
    }

    // Fermer le menu
    this.container.classList.remove("open");
    this.optionsMenu.style.display = "none";

    // Appeler le callback
    if (this.onChangeCallback) {
      this.onChangeCallback(value);
    }
  }

  /**
   * Met à jour les options avec de nouvelles valeurs
   */
  public updateOptions(newOptions: SelectOption<T>[]): void {
    this.options = newOptions;
    this.renderOptions();

    // Mettre à jour l'affichage du bouton avec la nouvelle option
    if (this.currentValue !== null) {
      const currentOption = this.options.find(
        (opt) => opt.value === this.currentValue
      );
      if (currentOption) {
        this.updateButtonDisplay(currentOption);
      } else {
        // Si la valeur n'existe plus dans les options, réinitialiser
        this.selectValue(null);
      }
    }
  }

  /**
   * Récupère la valeur actuelle
   */
  public getValue(): T | null {
    return this.currentValue;
  }

  /**
   * Définit la valeur actuelle
   */
  public setValue(value: T | null): void {
    this.selectValue(value);
  }

  /**
   * Définit un callback appelé lors du changement de valeur
   */
  public onChange(callback: (value: T | null) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Récupère l'élément DOM
   */
  public getElement(): HTMLDivElement {
    return this.container;
  }

  /**
   * Ferme le menu si ouvert
   */
  public close(): void {
    this.container.classList.remove("open");
    this.optionsMenu.style.display = "none";
  }
}
