import { initAllColorSelectors } from "./components/colorSelector";
import { initPaletteGenerator } from "./components/paletteGenerator";
import { ColorCollection } from "./components/colorCollection";
import { FileList } from "./components/fileList";
import { getFormData } from "./utils/formData";
import type { TabConfig } from "./types";

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
        if (key.startsWith("brand") && !key.endsWith("-label") && typeof value === "string" && value.startsWith("#")) {
          // Récupère le label personnalisé depuis l'input
          const labelKey = `${key}-label`;
          const colorName = formData[labelKey] || key; // Utilise le label personnalisé ou le key par défaut
          if (colorName && typeof colorName === "string" && colorName.trim() !== "") {
            brandColors[colorName.trim()] = value;
          }
        }
      });

      // Récupère toutes les couleurs de Feedback avec leurs labels personnalisés
      const feedbackColors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith("feedback") && !key.endsWith("-label") && typeof value === "string" && value.startsWith("#")) {
          // Récupère le label personnalisé depuis l'input
          const labelKey = `${key}-label`;
          const colorName = formData[labelKey] || key; // Utilise le label personnalisé ou le key par défaut
          if (colorName && typeof colorName === "string" && colorName.trim() !== "") {
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
