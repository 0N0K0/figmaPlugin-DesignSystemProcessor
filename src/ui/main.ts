import { initAllColorSelectors } from "./components/colorSelector";
import { initPaletteGenerator } from "./components/paletteGenerator";
import {
  initColorCollections,
  initCustomSelectors,
  initTabs,
  initFileLists,
  watchGreyHueChanges,
  attachButtonListeners,
} from "./initializers";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 UI Loaded - Initializing...");
  console.log("📄 DOM Ready - Document children:", document.body.children.length);

  initTabs();
  console.log("✅ Tabs initialized");

  initCustomSelectors();
  console.log("✅ Custom selectors initialized");

  initPaletteGenerator();
  console.log("✅ Palette generator initialized");

  initColorCollections();
  console.log("✅ Color collections initialized");

  initFileLists();
  console.log("✅ File lists initialized");

  initAllColorSelectors();
  console.log("✅ Color selectors initialized");

  watchGreyHueChanges();

  attachButtonListeners();
  console.log("✅ Button listeners attached");

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
