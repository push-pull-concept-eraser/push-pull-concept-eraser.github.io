(() => {
  const panelContainer = document.querySelector(".baseline-panels");
  const tabs = Array.from(document.querySelectorAll("[data-baseline-target]"));
  const panels = Array.from(document.querySelectorAll("[data-baseline-panel]"));

  if (panelContainer && tabs.length === 2 && panels.length === 2) {
    const fluxPanel = document.querySelector('[data-baseline-panel="flux"]');
    if (fluxPanel) {
      panelContainer.appendChild(fluxPanel);
    }

    const activateTab = (target, moveFocus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.baselineTarget === target;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && moveFocus) {
          tab.focus();
        }
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.baselinePanel !== target;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.baselineTarget));
      tab.addEventListener("keydown", (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          return;
        }

        event.preventDefault();
        const nextIndex = event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activateTab(tabs[nextIndex].dataset.baselineTarget, true);
      });
    });

    activateTab("sd");
  }

  const citationCopyButton = document.querySelector("[data-copy-citation]");
  const citationCode = document.querySelector("#citation-bibtex code");
  const citationCopyStatus = document.querySelector("#citation-copy-status");

  if (citationCopyButton && citationCode) {
    citationCopyButton.addEventListener("click", async () => {
      const citation = citationCode.textContent.trim();

      try {
        await navigator.clipboard.writeText(citation);
        if (citationCopyStatus) {
          citationCopyStatus.textContent = "BibTeX copied to clipboard.";
        }
      } catch {
        if (citationCopyStatus) {
          citationCopyStatus.textContent = "Unable to copy BibTeX. Please select and copy it manually.";
        }
      }
    });
  }

  const links = Array.from(document.querySelectorAll("[data-lightbox]"));

  if (links.length === 0) {
    return;
  }

  const viewer = document.createElement("div");
  viewer.className = "lightbox";
  viewer.hidden = true;
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", "Figure image preview");
  viewer.innerHTML = `
    <div class="lightbox-panel">
      <div class="lightbox-frame">
        <img class="lightbox-image" alt="">
      </div>
      <div class="lightbox-bar">
        <p class="lightbox-caption"></p>
        <div class="lightbox-actions">
          <a class="lightbox-action lightbox-open-original" target="_blank" rel="noopener">Open Original</a>
          <a class="lightbox-action lightbox-download" download>Download</a>
          <button class="lightbox-action" type="button" data-lightbox-close>Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(viewer);

  const image = viewer.querySelector(".lightbox-image");
  const caption = viewer.querySelector(".lightbox-caption");
  const openOriginal = viewer.querySelector(".lightbox-open-original");
  const download = viewer.querySelector(".lightbox-download");
  const closeButton = viewer.querySelector("[data-lightbox-close]");
  let activeTrigger = null;

  const closeViewer = () => {
    if (viewer.hidden) {
      return;
    }

    viewer.hidden = true;
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");

    if (activeTrigger) {
      activeTrigger.focus({ preventScroll: true });
      activeTrigger = null;
    }
  };

  const openViewer = (link) => {
    const href = link.href;
    const label = link.dataset.caption || link.querySelector("img")?.alt || "Figure image";
    const filename = new URL(href, window.location.href).pathname.split("/").pop();

    activeTrigger = link;
    image.src = href;
    image.alt = label;
    caption.textContent = label;
    openOriginal.href = href;
    download.href = href;
    download.download = filename || "";

    viewer.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus({ preventScroll: true });
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      openViewer(link);
    });
  });

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target.closest("[data-lightbox-close]")) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeViewer();
    }
  });
})();
