export class FileList {
  private container: HTMLElement;
  private input: HTMLInputElement;
  private selectBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private files: File[] = [];
  private imagePreview: boolean = false;

  constructor(container: HTMLElement, input: HTMLInputElement) {
    this.container = container;
    this.input = input;
    this.imagePreview = container.dataset.imagePreview === "true";

    const inputId = container.dataset.inputId;
    if (!inputId) {
      console.error("File list container missing data-input-id");
      return;
    }

    // Trouver les boutons
    const wrapper = input.closest(".file-input-wrapper");
    if (!wrapper) {
      console.error("File input wrapper not found");
      return;
    }

    const selectBtn =
      wrapper.querySelector<HTMLButtonElement>(".file-select-btn");
    const clearBtn =
      wrapper.querySelector<HTMLButtonElement>(".file-clear-btn");

    if (!selectBtn || !clearBtn) {
      console.error("File buttons not found");
      return;
    }

    this.selectBtn = selectBtn;
    this.clearBtn = clearBtn;

    // Événements
    this.selectBtn.addEventListener("click", () => this.input.click());
    this.clearBtn.addEventListener("click", () => this.clearFiles());

    // Écouter les changements du input file
    this.input.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.addFiles(Array.from(target.files));
      }
    });

    // Afficher l'état initial
    this.render();
  }

  private addFiles(newFiles: File[]): void {
    this.files.push(...newFiles);
    this.render();
    // Reset l'input pour permettre de sélectionner les mêmes fichiers
    this.input.value = "";
  }

  private removeFile(index: number): void {
    this.files.splice(index, 1);
    this.render();
  }

  private clearFiles(): void {
    this.files = [];
    this.render();
  }

  private updateButtons(): void {
    const hasFiles = this.files.length > 0;

    if (hasFiles) {
      // Transformer select btn en icon-btn
      this.selectBtn.classList.remove("btn");
      this.selectBtn.classList.add("icon-btn");
      this.selectBtn.innerHTML = '<i class="mdi mdi-plus"></i>';
      this.selectBtn.querySelector("span")?.remove();

      // Afficher clear btn
      this.clearBtn.style.display = "";
    } else {
      // Garder le style btn initial
      this.selectBtn.classList.add("btn");
      this.selectBtn.classList.remove("icon-btn");
      const label = this.imagePreview ? "Choose images" : "Choose files";
      this.selectBtn.innerHTML = `<span>${label}</span><i class="mdi mdi-plus"></i>`;

      // Cacher clear btn
      this.clearBtn.style.display = "none";
    }
  }

  private render(): void {
    this.container.innerHTML = "";

    if (this.files.length === 0) {
      this.container.innerHTML =
        '<div class="file-list-empty">No files selected</div>';
      this.updateButtons();
      return;
    }

    this.files.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-list-item";

      if (this.imagePreview && file.type.startsWith("image/")) {
        // Preview pour les images
        const img = document.createElement("img");
        img.className = "file-preview";
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        item.appendChild(img);
      } else {
        // Nom du fichier pour les non-images
        const name = document.createElement("span");
        name.className = "file-name";
        name.textContent = file.name;
        item.appendChild(name);
      }

      // Bouton de suppression
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "file-remove-btn icon-btn";
      removeBtn.innerHTML = '<span class="mdi mdi-close"></span>';
      removeBtn.addEventListener("click", () => this.removeFile(index));

      item.appendChild(removeBtn);
      this.container.appendChild(item);
    });

    this.updateButtons();
  }

  getFiles(): File[] {
    return this.files;
  }
}
