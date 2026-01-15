import { initAllColorSelectors } from "./components/colorSelector";
import { initPaletteGenerator } from "./components/paletteGenerator";
import { ColorCollection } from "./components/colorCollection";
import { CustomSelector } from "./components/customSelector";
import { FileList } from "./components/fileList";
import { getFormData } from "./utils/formData";
import { generateGreyShades } from "../common/utils/colorUtils";
import {
  OPACITIES_STEPS,
  SHADE_STEPS,
} from "../common/constants/colorConstants";
import { converter, formatHex8 } from "culori";
import type { SelectOption, TabConfig } from "./types";

const customSelectors = new Map<string, CustomSelector<any>>();

// Récupérer la config des tabs depuis le HTML
declare global {
  interface Window {
    __TABS_CONFIG__: TabConfig[];
  }
}

function initColorCollections() {
  const containers =
    document.querySelectorAll<HTMLElement>(".color-collection");

  containers.forEach((container) => {
    const collectionId = container.dataset.collectionId;

    // Trouver les couleurs initiales depuis la config
    let initialColors: any[] = [];
    if (window.__TABS_CONFIG__) {
      for (const tab of window.__TABS_CONFIG__) {
        for (const section of tab.sections) {
          if (section.colorCollection?.id === collectionId) {
            initialColors = section.colorCollection?.initialColors || [];
            break;
          }
        }
      }
    }

    new ColorCollection(container, initialColors);
  });
}

function initFileLists() {
  const containers = document.querySelectorAll<HTMLElement>(".file-list-items");

  containers.forEach((container) => {
    const inputId = container.dataset.inputId;
    if (!inputId) return;
    const input = document.getElementById(inputId) as HTMLInputElement;

    if (input && input.type === "file") {
      new FileList(container, input);
    }
  });
}

function buildOpacityOptionsWithHue(baseHex?: string): SelectOption<number>[] {
  const oklch = baseHex ? converter("oklch")(baseHex) : null;
  const hue = oklch?.h ?? 0;
  const greyShade = generateGreyShades(SHADE_STEPS, hue)[50];
  const greyRGB = converter("rgb")(greyShade);

  if (!greyRGB) {
    return OPACITIES_STEPS.map((opacity) => ({
      value: opacity,
      label: String(opacity),
    }));
  }

  return OPACITIES_STEPS.map((opacity) => {
    const colorWithAlpha = { ...greyRGB, alpha: opacity / 1000 };
    return {
      value: opacity,
      label: String(opacity),
      color: formatHex8(colorWithAlpha),
    };
  });
}

function updateOpacitySelectors(baseHex?: string): void {
  const options = buildOpacityOptionsWithHue(baseHex);
  const targetIds = [
    "neutralTextSecondaryOp",
    "neutralTextHoveredOp",
    "neutralTextSelectedOp",
    "neutralTextFocusedOp",
    "neutralTextDisabledOp",
    "neutralBgActiveOp",
    "neutralBgHoveredOp",
    "neutralBgSelectedOp",
    "neutralBgFocusedOp",
    "neutralBgDisabledOp",
  ];

  targetIds.forEach((id) => {
    const selector = customSelectors.get(id);
    if (!selector) return;
    const currentValue = selector.getValue();
    selector.updateOptions(options);
    selector.setValue(currentValue);
  });
}

function watchGreyHueChanges(): void {
  const btn = document.querySelector<HTMLElement>(
    '.color-selector-btn[data-input-id="greyHue"]'
  );
  const text = btn?.querySelector<HTMLElement>(".color-text");
  if (!text) return;

  const applyUpdate = () => {
    const value = text.textContent || "";
    const baseHex = value.startsWith("#") ? value : undefined;
    updateOpacitySelectors(baseHex);
  };

  // Initial sync
  applyUpdate();

  const observer = new MutationObserver(() => applyUpdate());
  observer.observe(text, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function initCustomSelectors() {
  const placeholders = document.querySelectorAll<HTMLElement>(
    ".custom-selector-placeholder"
  );

  customSelectors.clear();

  placeholders.forEach((placeholder) => {
    const inputId = placeholder.dataset.inputId || "";
    const optionsRaw = placeholder.dataset.options || "[]";
    const placeholderText = placeholder.dataset.placeholder;
    const allowEmpty = placeholder.dataset.allowEmpty === "true";
    const defaultRaw = placeholder.dataset.default;

    let options: SelectOption[] = [];
    try {
      options = JSON.parse(optionsRaw);
    } catch (error) {
      console.error("Invalid options for custom selector", inputId, error);
      return;
    }

    let defaultValue: string | number | undefined;
    if (defaultRaw !== undefined) {
      const parsed = Number(defaultRaw);
      defaultValue = Number.isNaN(parsed) ? defaultRaw : parsed;
    }

    const selector = new CustomSelector({
      options,
      defaultValue,
      inputId,
      placeholder: placeholderText,
      allowEmpty,
    });

    if (inputId) {
      customSelectors.set(inputId, selector);
    }

    const selectorElement = selector.getElement();
    placeholder.replaceWith(selectorElement);

    const hiddenInput = inputId
      ? (document.getElementById(inputId) as HTMLInputElement | null)
      : null;

    if (hiddenInput) {
      const syncValue = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) {
          hiddenInput.value = "";
          return;
        }
        hiddenInput.value = String(value);
      };

      syncValue(selector.getValue());
      selector.onChange((val) => syncValue(val));
    }
  });
}

// Initialiser la navigation par onglets
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Désactiver tous les onglets
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Activer l'onglet sélectionné
      button.classList.add("active");
      const activeContent = document.getElementById(`tab-${tabId}`);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });

  // Activer le premier onglet par défaut
  if (tabButtons.length > 0) {
    const firstTab = tabButtons[0].getAttribute("data-tab");
    tabButtons[0].classList.add("active");
    const firstContent = document.getElementById(`tab-${firstTab}`);
    if (firstContent) {
      firstContent.classList.add("active");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 UI Loaded - Initializing...");
  console.log(
    "📄 DOM Ready - Document children:",
    document.body.children.length
  );

  // Initialiser les onglets
  initTabs();
  console.log("✅ Tabs initialized");

  // Initialiser les custom selectors
  initCustomSelectors();
  console.log("✅ Custom selectors initialized");

  // Initialiser le générateur de palette
  initPaletteGenerator();
  console.log("✅ Palette generator initialized");

  // Initialiser les color collections
  initColorCollections();
  console.log("✅ Color collections initialized");

  // Initialiser les file lists
  initFileLists();
  console.log("✅ File lists initialized");

  // Debug: Vérifiez les wrappers
  const wrappers = document.querySelectorAll(".color-selector-wrapper");
  console.log(`Found ${wrappers.length} color selector wrappers in DOM`);

  if (wrappers.length === 0) {
    console.error("❌ CRITICAL: No color selector wrappers found!");
    console.log("Available divs:", document.querySelectorAll("div").length);
  }

  // Initialiser les color selectors
  initAllColorSelectors();
  console.log("✅ Color selectors initialized");

  // Rebuild opacity options when Grey Hue changes
  watchGreyHueChanges();

  // Gestion du bouton Process
  const processBtn = document.getElementById("process-btn");
  if (processBtn) {
    processBtn.addEventListener("click", () => {
      const formData = getFormData();
      parent.postMessage(
        {
          pluginMessage: {
            type: "process",
            data: formData,
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Palettes
  const generatePalettesBtn = document.getElementById("generate-palettes-btn");
  if (generatePalettesBtn) {
    generatePalettesBtn.addEventListener("click", () => {
      const formData = getFormData();

      // Récupère toutes les couleurs de Brand avec leurs labels personnalisés
      const brandColors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key.startsWith("brand") &&
          !key.endsWith("-label") &&
          typeof value === "string" &&
          value.startsWith("#")
        ) {
          // Récupère le label personnalisé depuis l'input
          const labelKey = `${key}-label`;
          const colorName = formData[labelKey] || key; // Utilise le label personnalisé ou le key par défaut
          if (
            colorName &&
            typeof colorName === "string" &&
            colorName.trim() !== ""
          ) {
            brandColors[colorName.trim()] = value;
          }
        }
      });

      // Récupère toutes les couleurs de Feedback avec leurs labels personnalisés
      const feedbackColors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key.startsWith("feedback") &&
          !key.endsWith("-label") &&
          typeof value === "string" &&
          value.startsWith("#")
        ) {
          // Récupère le label personnalisé depuis l'input
          const labelKey = `${key}-label`;
          const colorName = formData[labelKey] || key; // Utilise le label personnalisé ou le key par défaut
          if (
            colorName &&
            typeof colorName === "string" &&
            colorName.trim() !== ""
          ) {
            feedbackColors[colorName.trim()] = value;
          }
        }
      });

      parent.postMessage(
        {
          pluginMessage: {
            type: "generatePalettes",
            data: {
              brandColors,
              feedbackColors,
            },
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Create Elevations
  const createElevationsBtn = document.getElementById("create-elevations-btn");
  if (createElevationsBtn) {
    createElevationsBtn.addEventListener("click", () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: "createElevations",
          },
        },
        "*"
      );
    });
  }

  // Écouter les messages du plugin
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (!message) return;

    switch (message.type) {
      case "notification":
        console.log("Plugin notification:", message.message);
        break;
    }
  };
});
