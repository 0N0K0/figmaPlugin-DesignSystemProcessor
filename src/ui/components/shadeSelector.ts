/**
 * Composant de sélection de shade personnalisé avec indicateur de couleur
 */

export interface ShadeOption {
  value: number;
  label: string;
  color: string;
}

export class ShadeSelector {
  private container: HTMLDivElement;
  private selectBtn: HTMLButtonElement;
  private optionsMenu: HTMLDivElement;
  private options: ShadeOption[];
  private currentValue: number;
  private onChangeCallback?: (value: number) => void;

  constructor(options: ShadeOption[], defaultValue: number, inputId: string) {
    this.options = options;
    this.currentValue = defaultValue;

    // Créer le conteneur principal
    this.container = document.createElement("div");
    this.container.className = "custom-shade-select";
    this.container.dataset.inputId = inputId;

    // Créer le bouton de sélection
    this.selectBtn = document.createElement("button");
    this.selectBtn.type = "button";
    this.selectBtn.className = "custom-shade-select-btn btn";

    const defaultShade =
      this.options.find((opt) => opt.value === defaultValue) || this.options[0];
    this.updateButtonDisplay(defaultShade);
    this.selectBtn.dataset.value = String(defaultValue);

    // Créer le menu des options
    this.optionsMenu = document.createElement("div");
    this.optionsMenu.className = "custom-shade-options";
    this.optionsMenu.style.display = "none"; // Caché par défaut

    this.renderOptions();
    this.attachEventListeners();

    this.container.appendChild(this.selectBtn);
    this.container.appendChild(this.optionsMenu);
  }

  private updateButtonDisplay(shade: ShadeOption): void {
    this.selectBtn.innerHTML = `
      <span class="shade-color-indicator" style="background-color: ${shade.color}"></span>
      <span class="shade-label">${shade.label}</span>
      <i class="mdi mdi-chevron-down"></i>
    `;
  }

  private renderOptions(): void {
    this.optionsMenu.innerHTML = "";

    this.options.forEach(({ value, label, color }) => {
      const optionItem = document.createElement("button");
      optionItem.type = "button";
      optionItem.className = "custom-shade-option btn";
      optionItem.dataset.value = String(value);
      optionItem.innerHTML = `
        <span class="shade-color-indicator" style="background-color: ${color}"></span>
        <span class="shade-label">${label}</span>
      `;
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
      document.querySelectorAll(".custom-shade-select").forEach((sel) => {
        if (sel !== this.container) {
          sel.classList.remove("open");
          const menu = sel.querySelector(
            ".custom-shade-options"
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
  }

  /**
   * Sélectionne une valeur
   */
  public selectValue(value: number): void {
    const selectedOption = this.options.find((opt) => opt.value === value);
    if (!selectedOption) return;

    this.currentValue = value;

    // Mettre à jour le bouton
    this.updateButtonDisplay(selectedOption);
    this.selectBtn.dataset.value = String(value);

    // Mettre à jour les classes selected
    this.optionsMenu.querySelectorAll(".custom-shade-option").forEach((opt) => {
      opt.classList.remove("selected");
    });
    const selectedOptionEl = this.optionsMenu.querySelector(
      `[data-value="${value}"]`
    );
    selectedOptionEl?.classList.add("selected");

    // Fermer le menu
    this.container.classList.remove("open");
    this.optionsMenu.style.display = "none";

    // Appeler le callback
    if (this.onChangeCallback) {
      this.onChangeCallback(value);
    }
  }

  /**
   * Met à jour les options avec de nouvelles couleurs
   */
  public updateOptions(newOptions: ShadeOption[]): void {
    this.options = newOptions;
    this.renderOptions();

    // Mettre à jour l'affichage du bouton avec la nouvelle couleur
    const currentOption = this.options.find(
      (opt) => opt.value === this.currentValue
    );
    if (currentOption) {
      this.updateButtonDisplay(currentOption);
    }
  }

  /**
   * Récupère la valeur actuelle
   */
  public getValue(): number {
    return this.currentValue;
  }

  /**
   * Définit un callback appelé lors du changement de valeur
   */
  public onChange(callback: (value: number) => void): void {
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
