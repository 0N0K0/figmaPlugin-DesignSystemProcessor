import { generateShades } from "../../common/utils/colorUtils";
import { COLOR_DATA } from "../constants";

function randomHex(): string {
  const colorFamilies = Object.values(COLOR_DATA);
  const randomFamily =
    colorFamilies[Math.floor(Math.random() * colorFamilies.length)];
  const colors = Object.values(randomFamily);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const shades = generateShades(randomColor);
  const constrainedShades = shades.filter((shade) => {
    const step = shade.step;
    return step >= 300 && step <= 700;
  });
  const finalShades = constrainedShades.length > 0 ? constrainedShades : shades;
  return finalShades[Math.floor(Math.random() * finalShades.length)].color;
}

function getColorName(hex: string): string {
  // Utiliser hex par défaut, on peut ajouter une logique de nommage si besoin
  return hex.substring(1);
}

export interface PaletteColor {
  id: string;
  hex: string;
  locked: boolean;
}

export class PaletteGenerator {
  private container: HTMLElement;
  private colors: PaletteColor[] = [];
  private colorsWrapper: HTMLElement | null = null;
  private addBtn: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializePalette();
    this.render();
  }

  private initializePalette(): void {
    // Initialiser avec les couleurs par défaut de Brand
    const defaultColors = ["#0DB9F2", "#4DB2A1", "#A68659"];
    defaultColors.forEach((hex, i) => {
      this.colors.push({
        id: `color-${Date.now()}-${i}`,
        hex,
        locked: false,
      });
    });
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="palette-generator">
        <div class="palette-colors" id="palette-colors"></div>
      </div>
    `;

    this.colorsWrapper = this.container.querySelector("#palette-colors");
    this.addBtn = document.querySelector("#palette-add");

    const regenerateBtn = document.querySelector("#palette-regenerate");
    regenerateBtn?.addEventListener("click", () => this.regenerateUnlocked());

    this.addBtn?.addEventListener("click", () => this.addColor());

    this.renderColors();
  }

  private getUniqueRandomHex(): string {
    const maxAttempts = 50;
    let attempts = 0;
    let hex: string;

    do {
      hex = randomHex();
      attempts++;
    } while (this.colors.some((c) => c.hex === hex) && attempts < maxAttempts);

    return hex;
  }

  private renderColors(): void {
    if (!this.colorsWrapper) return;

    // Ajouter une classe pour adapter le nombre de colonnes
    let colCount: number;
    if (this.colors.length <= 3) {
      colCount = this.colors.length;
    } else {
      // Pour plus de 5 couleurs, diviser par 2 pour équilibrer les lignes
      colCount = Math.min(Math.ceil(this.colors.length / 2), 5);
    }
    this.colorsWrapper.className = `palette-colors palette-cols-${colCount}`;

    this.colorsWrapper.innerHTML = this.colors
      .map((color, index) => {
        const colorName = getColorName(color.hex);
        const canRemove = this.colors.length > 3;
        return `
        <div class="palette-color-card" data-id="${color.id}">
          <div class="palette-color-square" style="background-color: ${
            color.hex
          }">
            <div class="palette-color-overlay">
              <button class="palette-lock-btn icon-btn" title="${
                color.locked ? "Unlock" : "Lock"
              }">
                <i class="mdi mdi-${
                  color.locked ? "lock" : "lock-open-variant"
                }"></i>
              </button>
              <button class="palette-copy-btn icon-btn" title="Copy">
                <span class="palette-color-name">${colorName}</span>
                <i class="mdi mdi-content-copy"></i>
              </button>
              ${
                canRemove
                  ? `<button class="palette-remove-btn icon-btn" title="Remove">
                        <i class="mdi mdi-close"></i>
                      </button>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Attacher les event listeners
    this.colorsWrapper
      .querySelectorAll(".palette-color-card")
      .forEach((item, index) => {
        const colorId = item.getAttribute("data-id");
        if (!colorId) return;

        const lockBtn = item.querySelector(".palette-lock-btn");
        const copyBtn = item.querySelector(".palette-copy-btn");
        const removeBtn = item.querySelector(".palette-remove-btn");

        lockBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleLock(colorId);
        });
        copyBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.copyHex(colorId);
        });
        removeBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeColor(colorId);
        });
      });

    // Mettre à jour l'état du bouton Ajouter
    if (this.addBtn) {
      if (this.colors.length >= 10) {
        this.addBtn.setAttribute("disabled", "");
      } else {
        this.addBtn.removeAttribute("disabled");
      }
    }
  }

  private regenerateUnlocked(): void {
    this.colors = this.colors.map((color) =>
      color.locked ? color : { ...color, hex: this.getUniqueRandomHex() },
    );
    this.renderColors();
  }

  private addColor(): void {
    if (this.colors.length >= 10) return;

    this.colors.push({
      id: `color-${Date.now()}`,
      hex: this.getUniqueRandomHex(),
      locked: false,
    });

    this.renderColors();
  }

  private removeColor(colorId: string): void {
    // Ne pas aller en dessous de 3 couleurs
    if (this.colors.length <= 3) return;

    this.colors = this.colors.filter((c) => c.id !== colorId);
    this.renderColors();
  }

  private toggleLock(colorId: string): void {
    const color = this.colors.find((c) => c.id === colorId);
    if (color) {
      color.locked = !color.locked;
      this.renderColors();
    }
  }

  private copyHex(colorId: string): void {
    const color = this.colors.find((c) => c.id === colorId);
    if (!color) return;

    // Essayer d'utiliser l'API Clipboard moderne
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(color.hex)
        .then(() => {})
        .catch((err) => {
          console.error("Failed to copy:", err);
          this.fallbackCopy(color.hex);
        });
    } else {
      // Fallback pour les navigateurs plus anciens
      this.fallbackCopy(color.hex);
    }
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textarea);
  }

  public getPaletteData(): Record<string, string> {
    const data: Record<string, string> = {};
    this.colors.forEach((color, index) => {
      data[`paletteGenerated_${index}`] = color.hex;
    });
    return data;
  }
}

export function initPaletteGenerator(): void {
  const container = document.querySelector("#palette-generator-container");
  if (container) {
    new PaletteGenerator(container as HTMLElement);
  }
}
