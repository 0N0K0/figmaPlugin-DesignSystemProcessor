figma.showUI(__html__, { width: 400, height: 350 });

function log(msg) {
  figma.ui.postMessage({ type: "log", message: msg });
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "generate-presentations") {
    log(`Génération des pages de présentation terminée.`);
    figma.closePlugin();
  }
};
