import { CustomSelector } from "../components/customSelector";
import type { SelectOption } from "../types";
import { customSelectors } from "../state/selectors";

export function initCustomSelectors() {
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
