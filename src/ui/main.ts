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

  /**
   * @TODO Gérer les évènements répétitifs des boutons d'actions
   *       Optimiser le code en créant une fonction générique pour les boutons d'actions
   */

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

  // Gestion du bouton Generate Brand Colors
  const generateBrandColorsBtn = document.getElementById(
    "generate-brand-colors-btn"
  );
  if (generateBrandColorsBtn) {
    generateBrandColorsBtn.addEventListener("click", () => {
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

      parent.postMessage(
        {
          pluginMessage: {
            type: "generateBrandColors",
            data: {
              brandColors,
            },
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Feedback Colors
  const generateFeedbackColorsBtn = document.getElementById(
    "generate-feedback-colors-btn"
  );
  if (generateFeedbackColorsBtn) {
    generateFeedbackColorsBtn.addEventListener("click", () => {
      const formData = getFormData();

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
            type: "generateFeedbackColors",
            data: {
              feedbackColors,
            },
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Neutral Colors
  const generateNeutralColorsBtn = document.getElementById(
    "generate-neutral-colors-btn"
  );
  if (generateNeutralColorsBtn) {
    generateNeutralColorsBtn.addEventListener("click", () => {
      const formData = getFormData();
      const greyHue = formData["greyHue"];
      const textSecondary = formData["neutralTextSecondaryOp"];
      const textStates = {
        neutralTextDisabledOp: formData["neutralTextDisabledOp"],
        neutralTextHoveredOp: formData["neutralTextHoveredOp"],
        neutralTextSelectedOp: formData["neutralTextSelectedOp"],
        neutralTextFocusedOp: formData["neutralTextFocusedOp"],
      };
      const bgStates = {
        neutralBgActiveOp: formData["neutralBgActiveOp"],
        neutralBgDisabledOp: formData["neutralBgDisabledOp"],
        neutralBgHoveredOp: formData["neutralBgHoveredOp"],
        neutralBgSelectedOp: formData["neutralBgSelectedOp"],
        neutralBgFocusedOp: formData["neutralBgFocusedOp"],
      };

      parent.postMessage(
        {
          pluginMessage: {
            type: "generateNeutralColors",
            data: {
              greyHue,
              textSecondary,
              textStates,
              bgStates,
            },
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

  // Gestion du bouton Generate Themes
  const generateThemesBtn = document.getElementById("generate-themes-btn");
  if (generateThemesBtn) {
    generateThemesBtn.addEventListener("click", () => {
      const formData = getFormData();
      const themeBgStates = {
        enabled: formData["themeEnabledOp"],
        disabled: formData["themeDisabledOp"],
        hovered: formData["themeHoveredOp"],
        selected: formData["themeSelectedOp"],
        focused: formData["themeFocusedOp"],
      };
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateThemes",
            data: themeBgStates,
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Layout Guide
  const generateLayoutGuideBtn = document.getElementById(
    "generate-layout-guide-btn"
  );
  if (generateLayoutGuideBtn) {
    generateLayoutGuideBtn.addEventListener("click", () => {
      const formData = getFormData();
      const gridSettings = {
        minColumnWidth: formData["minColumnWidth"],
        gutter: formData["gutter"],
        horizontalBodyPadding: formData["horizontalBodyPadding"],
        baselineGrid: formData["baselineGrid"],
        minViewportHeight: formData["minViewportHeight"],
      };
      const contentSettings = {
        horizontalMainPadding: formData["horizontalMainPadding"],
        maxContentHeight: formData["maxContentHeight"],
        offsetHeight: formData["offsetHeight"],
      };
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateLayoutGuide",
            data: {
              gridSettings,
              contentSettings,
            },
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Radius
  const generateRadiusBtn = document.getElementById("generate-radius-btn");
  if (generateRadiusBtn) {
    generateRadiusBtn.addEventListener("click", () => {
      const formData = getFormData();
      const radiusValues = {
        xs: formData["radiusXS"],
        sm: formData["radiusSM"],
        md: formData["radiusMD"],
        lg: formData["radiusLG"],
        xl: formData["radiusXL"],
        xxl: formData["radius2XL"],
      };
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateRadius",
            data: radiusValues,
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Font Sizes
  const generateFontSizesBtn = document.getElementById(
    "generate-font-sizes-btn"
  );
  if (generateFontSizesBtn) {
    generateFontSizesBtn.addEventListener("click", () => {
      const formData = getFormData();
      const baseFontSize = formData["baseFontSize"];
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateFontSizes",
            data: { baseFontSize },
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Font Families
  const generateFontFamiliesBtn = document.getElementById(
    "generate-font-families-btn"
  );
  if (generateFontFamiliesBtn) {
    generateFontFamiliesBtn.addEventListener("click", () => {
      const formData = getFormData();
      const fontFamilies: Record<string, string> = {};
      for (const key of ["body", "meta", "interface", "accent", "tech"]) {
        fontFamilies[key] = formData[`${key}FontFamily`] as string;
      }
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateFontFamilies",
            data: fontFamilies,
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Typography
  const generateTypographyBtn = document.getElementById(
    "generate-typography-btn"
  );
  if (generateTypographyBtn) {
    generateTypographyBtn.addEventListener("click", () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateTypography",
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Text Datas
  const generateTextDatasBtn = document.getElementById(
    "generate-text-datas-btn"
  );
  if (generateTextDatasBtn) {
    generateTextDatasBtn.addEventListener("click", async () => {
      const formData = getFormData();
      const textDatasFiles = formData["textDatasFile"] as unknown as
        | FileList
        | File
        | undefined;

      if (!textDatasFiles) {
        console.error("No file selected");
        return;
      }

      try {
        const textDatasList: Record<string, any>[] = [];
        const filesToProcess =
          textDatasFiles instanceof FileList
            ? Array.prototype.slice.call(textDatasFiles)
            : [textDatasFiles];

        for (const file of filesToProcess) {
          const jsonText = await file.text();
          const textData = JSON.parse(jsonText);
          textDatasList.push(textData);
        }

        parent.postMessage(
          {
            pluginMessage: {
              type: "generateTextDatas",
              data: {
                textDatas:
                  textDatasList.length === 1 ? textDatasList[0] : textDatasList,
              },
            },
          },
          "*"
        );
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
      }
    });
  }

  // Gestion du bouton Generate Images Datas
  const generateImagesDatasBtn = document.getElementById(
    "generate-images-datas-btn"
  );
  if (generateImagesDatasBtn) {
    generateImagesDatasBtn.addEventListener("click", async () => {
      const formData = getFormData();
      const imagesDatasFiles = formData["imagesDatasFile"] as unknown as
        | FileList
        | File
        | undefined;

      if (!imagesDatasFiles) {
        console.error("No file selected");
        return;
      }

      try {
        const imagesDatasList: Record<string, any>[] = [];
        const filesToProcess =
          imagesDatasFiles instanceof FileList
            ? Array.prototype.slice.call(imagesDatasFiles)
            : [imagesDatasFiles];

        for (const file of filesToProcess) {
          const jsonText = await file.text();
          const imagesData = JSON.parse(jsonText);
          imagesDatasList.push(imagesData);
        }

        parent.postMessage(
          {
            pluginMessage: {
              type: "generateImagesDatas",
              data: {
                imagesDatas:
                  imagesDatasList.length === 1
                    ? imagesDatasList[0]
                    : imagesDatasList,
              },
            },
          },
          "*"
        );
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
      }
    });
  }

  // Gestion du bouton Generate Datas
  const generateDatasBtn = document.getElementById("generate-datas-btn");
  if (generateDatasBtn) {
    generateDatasBtn.addEventListener("click", () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateDatas",
          },
        },
        "*"
      );
    });
  }

  // Gestion du bouton Generate Elevations
  const generateElevationsBtn = document.getElementById(
    "generate-elevations-btn"
  );
  if (generateElevationsBtn) {
    generateElevationsBtn.addEventListener("click", () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: "generateElevations",
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
