figma.showUI(__html__, { width: 240, height: 196 });

function log(msg) {
  figma.ui.postMessage({ type: "log", message: msg });
}

// Parse tous les tokens (color, number, string, boolean)
function parseTokens(obj, path = [], actions = []) {
  for (const key in obj) {
    if (
      key === "$type" &&
      ["color", "number", "string", "boolean"].includes(obj[key]) &&
      obj["$value"] !== undefined &&
      obj["$extensions"]
    ) {
      actions.push({
        path: [...path],
        type: obj["$type"],
        value: obj["$value"],
        extensions: obj["$extensions"],
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      parseTokens(obj[key], [...path, key], actions);
    }
  }
  return actions;
}

// Regroupe les tokens par mode (ex: dark, light, md, etc.)
function groupByMode(files) {
  const modeMap = {};
  for (const file of files) {
    let json;
    try {
      json = JSON.parse(file.content);
    } catch (e) {
      continue;
    }
    const mode =
      (json.$extensions && json.$extensions["com.figma.modeName"]) ||
      file.name.replace(/\.tokens\.json$/, "");
    if (!modeMap[mode]) modeMap[mode] = [];
    modeMap[mode].push(json);
  }
  return modeMap;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "import-tokens") {
    const files = msg.files;
    if (!files || !files.length) {
      log("Aucun fichier fourni.");
      return;
    }
    const modeMap = groupByMode(files);
    let totalVars = 0;
    let processed = 0;
    const MAX_VARS = 1000; // Limite de sécurité pour éviter blocage
    for (const mode in modeMap) {
      for (const json of modeMap[mode]) {
        let collectionName =
          (json.$extensions && json.$extensions["com.figma.collectionName"]) ||
          "Design Tokens";
        const actions = parseTokens(json);
        try {
          for (const token of actions) {
            processed++;
            if (processed > MAX_VARS) {
              log(
                `Arrêt: trop de variables (> ${MAX_VARS}). Vérifiez vos fichiers.`
              );
              return;
            }

            const varName = token.path.join("/");
            const scopes = token.extensions["com.figma.scopes"] || [];
            const alias = token.extensions["com.figma.aliasdata"] || null;
            const type = token.type;
            const hidden =
              token.extensions["com.figma.hiddenFromPublishing"] || false;

            // 1. Récupérer le nom de la collection (déjà défini avant la boucle)
            let collection = figma.variables
              .getLocalVariableCollections()
              .find((c) => c.name === collectionName);
            if (!collection) {
              try {
                collection =
                  figma.variables.createVariableCollection(collectionName);
                // Important : retrouver la collection nouvellement créée via getLocalVariableCollections
                collection = figma.variables
                  .getLocalVariableCollections()
                  .find((c) => c.name === collectionName);
                if (!collection) {
                  log(
                    `Erreur : collection '${collectionName}' non retrouvée après création.`
                  );
                  return;
                }
              } catch (e) {
                log(`Erreur création collection '${collectionName}': ${e}`);
                return;
              }
            }
            // Ne pas refaire de recherche après création, utiliser l'objet collection directement
            // Pour retrouver les variables par collection et nom (pour les alias)
            if (!globalThis.__allCollections) globalThis.__allCollections = {};
            if (!globalThis.__allCollections[collectionName])
              globalThis.__allCollections[collectionName] = {
                collection,
                variables: {},
              };

            // 2. Créer ou récupérer le mode dans la collection
            let modeId = null;
            for (const m of collection.modes) {
              if (m.name === mode) {
                modeId = m.modeId;
                break;
              }
            }
            if (!modeId) {
              try {
                modeId = collection.addMode(mode);
              } catch (e) {
                log(
                  `Erreur lors de la création du mode '${mode}' dans '${collectionName}': ${e}`
                );
                return;
              }
            }
            // Après avoir ajouté le(s) mode(s), supprimer 'Mode 1' s'il existe et qu'il reste au moins un autre mode
            if (collection.modes.length > 1) {
              const defaultMode = collection.modes.find(
                (m) => m.name === "Mode 1"
              );
              if (defaultMode) {
                try {
                  collection.removeMode(defaultMode.modeId);
                } catch (e) {
                  log(
                    "Erreur lors de la suppression du mode par défaut : " + e
                  );
                }
              }
            }

            // 3. Créer la variable si elle n'existe pas
            let variable = null;
            if (
              collection.variableIds &&
              Array.isArray(collection.variableIds)
            ) {
              for (const varId of collection.variableIds) {
                const v = figma.variables.getVariableById(varId);
                if (v && v.name === varName) {
                  variable = v;
                  break;
                }
              }
            }
            if (!variable) {
              let varType = type;
              if (type === "boolean") varType = "BOOLEAN";
              if (type === "number") varType = "FLOAT";
              if (type === "color") varType = "COLOR";
              if (type === "string") varType = "STRING";
              try {
                let collectionId = collection.id;
                if (
                  typeof collectionId === "string" &&
                  collectionId.startsWith("VariableCollectionId:")
                ) {
                  collectionId = collectionId.replace(
                    "VariableCollectionId:",
                    ""
                  );
                }
                variable = figma.variables.createVariable(
                  varName,
                  collection,
                  varType
                );
              } catch (e) {
                log(
                  `Erreur création variable '${varName}' (${varType}) dans '${collectionName}': ${e}`
                );
                return;
              }
            }
            // 4. Appliquer hiddenFromPublishing et scopes si besoin
            try {
              variable.hiddenFromPublishing = !!hidden;
            } catch (e) {}
            try {
              if (Array.isArray(scopes) && scopes.length > 0) {
                variable.scopes = scopes;
              }
            } catch (e) {
              log(`Erreur lors de l'application des scopes: ${e}`);
            }

            // 5. Stocker pour les alias
            globalThis.__allCollections[collectionName].variables[varName] =
              variable;

            // 6. Définir la valeur pour le mode
            if (
              alias &&
              alias.targetVariableName &&
              alias.targetVariableSetName
            ) {
              // Gestion des alias inter-collections
              const targetCollectionName = alias.targetVariableSetName;
              let targetVarName = alias.targetVariableName.replace(/[{}]/g, "");
              // Utiliser le même format de nommage (slash pour les groupes)
              if (targetVarName.includes(".")) {
                targetVarName = targetVarName.replace(/\./g, "/");
              }
              // Cherche d'abord dans le cache local, sinon dans Figma
              let targetVar = null;
              if (
                globalThis.__allCollections[targetCollectionName] &&
                globalThis.__allCollections[targetCollectionName].variables &&
                globalThis.__allCollections[targetCollectionName].variables[
                  targetVarName
                ]
              ) {
                targetVar =
                  globalThis.__allCollections[targetCollectionName].variables[
                    targetVarName
                  ];
              }
              // Initialiser le cache si besoin
              if (
                globalThis.__allCollections[targetCollectionName] &&
                !globalThis.__allCollections[targetCollectionName].variables
              ) {
                globalThis.__allCollections[targetCollectionName].variables =
                  {};
              }
              if (!targetVar) {
                const targetCollection = figma.variables
                  .getLocalVariableCollections()
                  .find((c) => c.name === targetCollectionName);
                if (targetCollection && targetCollection.variableIds) {
                  for (const varId of targetCollection.variableIds) {
                    const v = figma.variables.getVariableById(varId);
                    if (v && v.name === targetVarName) {
                      targetVar = v;
                      break;
                    }
                  }
                }
              }
              if (targetVar) {
                variable.setValueForMode(modeId, {
                  type: "VARIABLE_ALIAS",
                  id: targetVar.id,
                });
              } else {
                log(
                  `Alias non résolu pour ${varName}: ${targetCollectionName}.${targetVarName}`
                );
              }
            } else {
              // Valeur directe selon le type
              if (type === "color") {
                const val = token.value;
                variable.setValueForMode(modeId, {
                  r: val.components[0],
                  g: val.components[1],
                  b: val.components[2],
                  a: val.alpha,
                });
              } else if (type === "number" || type === "boolean") {
                variable.setValueForMode(modeId, token.value);
              } else if (type === "string") {
                variable.setValueForMode(modeId, token.value);
              }
            }

            totalVars++;
          }
          //   } // End of for (const token of actions)
        } catch (e) {
          log(`Erreur dans la boucle des tokens: ${e}`);
        }
      }
    }
    log(`Import terminé. Variables traitées: ${totalVars}`);
    // setTimeout(() => figma.closePlugin(), 1000);
  }
};
