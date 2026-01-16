import { FileList } from "../components/fileList";

export function initFileLists() {
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
