import { toKebabCase } from "../../common/utils/textUtils";
import type {
  ColorSelectorConfig,
  InputConfig,
  SectionConfig,
  TabConfig,
} from "../types";

export class HtmlBuilder {
  static buildColorSelector(config: ColorSelectorConfig): string {
    const isEditable = config.editableLabel !== false;
    const labelHtml = isEditable
      ? config.label
        ? `<input type="text" class="color-label-input" data-input-id="${config.inputId}-label" value="${config.label}" placeholder="Label" />`
        : `<input type="text" class="color-label-input" data-input-id="${config.inputId}-label" placeholder="Label" />`
      : config.label
        ? `<label>${config.label}</label>`
        : "";
    const defaultAttr = config.defaultColor
      ? ` data-default="${config.defaultColor}"`
      : "";
    return `
      <div class="input-row color-selector-wrapper">
        ${labelHtml}
          <button type="button" class="color-selector-btn" data-input-id="${config.inputId}"${defaultAttr}>
            <span class="color-preview"></span>
            <span class="color-text"></span>
          </button>
          <div class="color-selector-popup">
            <div class="color-selector-grid"></div>
          </div>
      </div>`;
  }

  static buildInput(config: InputConfig): string {
    if (config.type === "button") {
      return `
      <div class="input-row">
        <button type="button" id="${config.id}" class="btn ${
          config.class || ""
        }" data-action="${config.action || config.id}">
          ${config.label}
        </button>
      </div>`;
    }

    if (config.type === "select") {
      const options = config.options
        ?.map(
          (opt) =>
            `<option value="${opt.value}" ${
              opt.value === config.defaultValue ? "selected" : ""
            }>${opt.label}</option>`,
        )
        .join("");
      return `
      <div class="input-row">
        <label for="${config.id}">${config.label}</label>
        <select id="${config.id}">
          ${options}
        </select>
      </div>`;
    }

    if (config.type === "customSelector") {
      const optionsJson = JSON.stringify(config.options || []).replace(
        /'/g,
        "&apos;",
      );
      const placeholderAttr = config.placeholder
        ? ` data-placeholder="${config.placeholder}"`
        : "";
      const defaultValue =
        config.defaultValue !== undefined && config.defaultValue !== null
          ? config.defaultValue
          : "";
      const defaultDataAttr =
        defaultValue !== "" ? ` data-default="${defaultValue}"` : "";
      const defaultValueAttr =
        defaultValue !== "" ? ` value="${defaultValue}"` : "";
      const allowEmptyAttr = config.allowEmpty ? "true" : "false";
      const hiddenType =
        typeof config.defaultValue === "number" ? "number" : "text";

      return `
      <div class="input-row">
        ${
          config.label
            ? `<label for="${config.id}">${config.label}</label>`
            : ""
        }
        <div
          class="custom-selector-placeholder"
          data-input-id="${config.id}"
          data-options='${optionsJson}'
          data-allow-empty="${allowEmptyAttr}"${placeholderAttr}${defaultDataAttr}>
        </div>
        <input
          type="${hiddenType}"
          id="${config.id}"
          style="display: none;"${defaultValueAttr}
        />
      </div>`;
    }

    if (config.type === "file") {
      const labelHtml = config.label
        ? `<label for="${config.id}">${config.label}</label>`
        : "";
      const acceptAttr = config.accept ? ` accept="${config.accept}"` : "";
      const multipleAttr = config.multiple ? ` multiple` : "";

      if (config.fileList) {
        // const imagePreviewAttr = config.imagePreview
        // 	? ' data-image-preview="true"'
        // 	: "";
        return `
      <div class="input-row file-input-wrapper">
        ${labelHtml}
        <input type="file" id="${config.id}" class="file-input-hidden"${acceptAttr}${multipleAttr} />
        <button type="button" class="file-select-btn btn" data-input-id="${config.id}">
          <span>Choose files</span>
          <i class="mdi mdi-plus"></i>
        </button>
        <button type="button" class="file-clear-btn icon-btn" data-input-id="${config.id}" style="display: none;">
          <i class="mdi mdi-delete"></i>
        </button>
      </div>
      <div class="file-list-items" data-input-id="${config.id}"></div>`;
      }

      return `
      <div class="input-row">
        ${labelHtml}
        <input type="file" id="${config.id}"${acceptAttr}${multipleAttr} />
      </div>`;
    }

    if (config.type === "imageCategory") {
      const acceptAttr = config.accept ? ` accept="${config.accept}"` : "";
      const id = "imagesDatasFiles01";

      return `
	  <div class="input-row file-input-wrapper">
        <span>${config.label}</span>
		<button type="button" id="add-images-category-btn" class="btn category-btn" data-action="addImagesCategory">
      	    <span>Add Category</span>
      	    <i class="mdi mdi-plus"></i>
		</button>
      </div>
	  <div class="image-category-block" data-category-idx="1">
      	<div class="input-row file-input-wrapper">
		  <input type="text" class="image-category-label" data-input-id="${id}-label" placeholder="Catégorie" value="${config.label}"/>
      	  <input type="file" id="${id}" class="file-input-hidden"${acceptAttr}$ multiple />
      	  <button type="button" class="file-select-btn btn" data-input-id="${id}">
      	    <span>Choose images</span>
      	    <i class="mdi mdi-plus"></i>
      	  </button>
      	  <button type="button" class="file-clear-btn icon-btn" data-input-id="${id}" style="display: none;">
      	    <i class="mdi mdi-delete"></i>
      	  </button>
      	</div>
      	<div class="file-list-items" data-input-id="${id}" data-image-preview="true"></div>
	  </div>`;
    }

    const labelHtml = config.label
      ? `<label for="${config.id}">${config.label}</label>`
      : "";
    const valueAttr =
      config.defaultValue !== undefined
        ? ` value="${config.defaultValue}"`
        : "";
    const minAttr = config.min !== undefined ? ` min="${config.min}"` : "";
    const maxAttr = config.max !== undefined ? ` max="${config.max}"` : "";

    return `
      <div class="input-row">
        ${labelHtml}
        <input type="${config.type}" id="${config.id}"${valueAttr}${minAttr}${maxAttr} />
      </div>`;
  }

  static buildSection(config: SectionConfig, depth: number = 0): string {
    const items = [
      ...(config.colorSelectors?.map((cs) => this.buildColorSelector(cs)) ||
        []),
      ...(config.inputs?.map((input) => this.buildInput(input)) || []),
    ].join("\n");

    const subsections = config.subsections
      ?.map((subsection) => this.buildSection(subsection, depth + 1))
      .join("\n");

    const colorCollectionHtml = config.colorCollection
      ? `<div class="color-collection" data-collection-id="${config.colorCollection.id}" data-max-colors="${config.colorCollection.maxColors}"></div>`
      : "";

    const paletteGen = config.paletteGenerator
      ? `<div id="palette-generator-container"></div>`
      : "";

    const titleTag = depth === 0 ? "h2" : "h3";
    const collectionAddButton = config.colorCollection
      ? `<button type="button" class="color-collection-add-btn icon-btn" data-collection-id="${config.colorCollection.id}"><i class="mdi mdi-plus"></i></button>`
      : "";
    const paletteButtons = config.paletteGenerator
      ? `<div class="palette-controls">
          <button id="palette-regenerate" class="palette-btn icon-btn"><i class="mdi mdi-refresh"></i></button>
          <button id="palette-add" class="palette-btn icon-btn"><i class="mdi mdi-plus"></i></button>
        </div>`
      : "";
    const titleHtml = config.title
      ? `<div class="section-header">
          <${titleTag}>${config.title}</${titleTag}>
          ${collectionAddButton}
          ${paletteButtons}
        </div>`
      : "";

    // Pour la section Images, on veut sortir le bouton d'ajout de catégorie du fieldset
    let fieldsetHtml = items ? `<fieldset>${items}</fieldset>` : "";
    let addCategoryBtnHtml = "";
    if (config.inputs) {
      const addBtn = config.inputs.find(
        (input) => input.id === "add-images-category-btn",
      );
      if (addBtn) {
        // On retire le bouton du fieldset et on le place après
        const btnHtml = this.buildInput(addBtn);
        // On retire le bouton du fieldsetHtml
        fieldsetHtml = fieldsetHtml.replace(btnHtml, "");
        addCategoryBtnHtml = btnHtml;
      }
    }
    return `
		<section class="section-depth-${depth}">
			${titleHtml}
			${paletteGen}
			${colorCollectionHtml}
			${subsections || ""}
			${fieldsetHtml}
			${addCategoryBtnHtml}
		</section>`;
  }

  static buildTab(tab: TabConfig): string {
    const sections = tab.sections.map((s) => this.buildSection(s)).join("\n");
    return `
    <div class="tab-content" id="tab-${toKebabCase(tab.title)}">
      ${sections}
    </div>`;
  }

  static buildTabsHtml(tabs: TabConfig[]): string {
    const tabButtons = tabs
      .map(
        (tab, index) =>
          `<button class="tab-btn btn ${
            index === 0 ? "active" : ""
          }" data-tab="${toKebabCase(tab.title)}">${tab.title}</button>`,
      )
      .join("\n");

    const tabContents = tabs.map((tab) => this.buildTab(tab)).join("\n");

    return `
    <div class="tabs-container">
      <div class="tab-btn-wrapper">
        ${tabButtons}
      </div>
      <div class="tab-contents">
        ${tabContents}
      </div>
    </div>`;
  }

  static buildFullHtml(tabs: TabConfig[], css: string, js: string): string {
    const tabsHtml = this.buildTabsHtml(tabs);
    const tabsJson = JSON.stringify(tabs);

    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Design System Processor</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
    <style>${css}</style>
    <script>window.__TABS_CONFIG__ = ${tabsJson};</script>
  </head>
  <body>
    ${tabsHtml}

    <section class="actions">
      <h2>Process...</h2>
	  <div class="input-row">
        <button id="generate-all-btn" class="btn">All</button>
        <button id="generate-design-system-btn" class="btn">Design System</button>
        <button id="generate-datas-components-btn" class="btn">Datas & Components</button>
	  </div>
	</section>

    <script>${js}</script>
  </body>
</html>`;
  }
}
