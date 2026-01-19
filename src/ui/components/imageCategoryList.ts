// Composant pour la gestion dynamique des catégories d'images
// Utilisation : voir l'initializer associé

import { FileList } from "./fileList";

export class ImageCategoryList {
  private fieldset: HTMLElement;
  private addBtn: HTMLElement;
  private categoryCount: number = 1;

  constructor(fieldset: HTMLElement, addBtn: HTMLElement) {
    this.fieldset = fieldset;
    this.addBtn = addBtn;
    this.init();
  }

  private createCategoryBlock(idx: number): HTMLElement {
    const categoryBlock = document.createElement("div");
    categoryBlock.className = "image-category-block";
    categoryBlock.dataset.categoryIdx = String(idx);

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-row file-input-wrapper";

    // Label input
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "image-category-label";
    labelInput.placeholder = "Catégorie";
    labelInput.id = `imagesDatasFiles${String(idx).padStart(2, "0")}-label`;
    inputWrapper.appendChild(labelInput);

    // File input (HTML structure compatible avec FileList)
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = `imagesDatasFiles${String(idx).padStart(2, "0")}`;
    fileInput.className = "file-input-hidden";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    inputWrapper.appendChild(fileInput);

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.className = "file-select-btn btn";
    selectBtn.dataset.inputId = fileInput.id;
    selectBtn.innerHTML =
      '<span>Choose images</span><i class="mdi mdi-plus"></i>';
    inputWrapper.appendChild(selectBtn);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "file-clear-btn category-btn icon-btn";
    removeBtn.innerHTML = '<i class="mdi mdi-delete"></i>';
    removeBtn.title = "Remove Category";
    removeBtn.onclick = () => {
      categoryBlock.remove();
    };
    inputWrapper.appendChild(removeBtn);

    categoryBlock.appendChild(inputWrapper);

    // File list container
    const fileListDiv = document.createElement("div");
    fileListDiv.className = "file-list-items";
    fileListDiv.dataset.inputId = fileInput.id;
    fileListDiv.dataset.imagePreview = "true";
    categoryBlock.appendChild(fileListDiv);

    // Initialiser FileList après création du bloc
    setTimeout(() => {
      // @ts-ignore
      new FileList(fileListDiv, fileInput, true);
    }, 0);

    return categoryBlock;
  }

  private init() {
    // Ajout dynamique de catégories
    this.addBtn.addEventListener("click", () => {
      this.categoryCount++;
      const newBlock = this.createCategoryBlock(this.categoryCount);
      const generateBtn = this.fieldset.querySelector(
        ".input-row:has(#generate-images-datas-btn)",
      );
      if (generateBtn && generateBtn.parentElement === this.fieldset) {
        this.fieldset.insertBefore(newBlock, generateBtn);
      } else {
        this.fieldset.appendChild(newBlock);
      }
    });
  }
}
