import { initAllColorSelectors } from "./components/colorSelector";
import { initPaletteGenerator } from "./components/paletteGenerator";
import { debugPanel } from "./components/debugPanel";
import {
  initColorCollections,
  initCustomSelectors,
  initTabs,
  initFileLists,
  watchGreyHueChanges,
  attachButtonListeners,
} from "./initializers";
import { initImageCategoryList } from "./initializers/imageCategoryInitializer";

document.addEventListener("DOMContentLoaded", () => {
  initTabs();

  initCustomSelectors();

  initPaletteGenerator();

  initColorCollections();

  initFileLists();

  initImageCategoryList();

  initAllColorSelectors();

  watchGreyHueChanges();

  attachButtonListeners();
  // Ajouter le bouton toggle pour le debug panel
  const debugToggleBtn = document.createElement("button");
  debugToggleBtn.className = "debug-toggle-btn";
  debugToggleBtn.innerHTML = '<span class="mdi mdi-bug"></span>';
  debugToggleBtn.title = "Toggle Debug Logs";
  debugToggleBtn.onclick = () => debugPanel.toggle();
  document.body.appendChild(debugToggleBtn);
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
