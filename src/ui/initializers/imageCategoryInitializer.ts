import { ImageCategoryList } from "../components/imageCategoryList";

export function initImageCategoryList() {
  const datasTab = document.getElementById("tab-datas");
  if (!datasTab) return;
  const imagesSection = datasTab.querySelector(
    'section:has([id="add-images-category-btn"])',
  );
  if (!imagesSection) return;
  const addBtn = imagesSection.querySelector(
    "#add-images-category-btn",
  ) as HTMLElement | null;
  const fieldset = imagesSection.querySelector(
    "fieldset",
  ) as HTMLElement | null;
  if (addBtn && fieldset) {
    new ImageCategoryList(fieldset, addBtn);
  }
}
