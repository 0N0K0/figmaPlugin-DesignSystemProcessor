export function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const activeContent = document.getElementById(`tab-${tabId}`);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });

  if (tabButtons.length > 0) {
    const firstTab = tabButtons[0].getAttribute("data-tab");
    tabButtons[0].classList.add("active");
    const firstContent = document.getElementById(`tab-${firstTab}`);
    if (firstContent) {
      firstContent.classList.add("active");
    }
  }
}
