(() => {
  const panelContainer = document.querySelector(".baseline-panels");
  const tabs = Array.from(document.querySelectorAll("[data-baseline-target]"));
  const panels = Array.from(document.querySelectorAll("[data-baseline-panel]"));

  if (panelContainer && tabs.length === 2 && panels.length === 2) {
    const fluxPanel = document.querySelector('[data-baseline-panel="flux"]');
    const strengthFigure = document.querySelector('figure[aria-label="Controllable Erasure Strength"]');
    const remainingSdComparison = document.querySelector('[aria-label="Stable Diffusion 1.4 remaining qualitative comparison"]');
    const strengthMoreResultsTitle = strengthFigure?.querySelector(".more-results-title");
    const strengthMoreResults = strengthFigure?.querySelector(".strength-pair-block");
    let comparisonGroups = [];
    let comparisonHeader = null;

    if (remainingSdComparison) {
      const remainingBody = remainingSdComparison.querySelector("tbody");
      const desiredBaselineOrder = ["Obama", "Margot Robbie", "Van Gogh", "Picasso", "Grumpy Cat"];

      if (remainingBody) {
        const pairGroups = [];
        let currentGroup = null;

        Array.from(remainingBody.children).forEach((row) => {
          const pairLabel = row.querySelector(".pair-label .concept-erased");

          if (pairLabel) {
            currentGroup = { label: pairLabel.textContent.trim(), rows: [] };
            pairGroups.push(currentGroup);
          }

          if (currentGroup) {
            currentGroup.rows.push(row);
          }
        });

        const groupsByLabel = new Map(pairGroups.map((group) => [group.label, group]));
        if (desiredBaselineOrder.every((label) => groupsByLabel.has(label))) {
          desiredBaselineOrder
            .map((label) => groupsByLabel.get(label))
            .flatMap((group) => group.rows)
            .forEach((row) => remainingBody.appendChild(row));

          comparisonGroups = desiredBaselineOrder.map((label) => groupsByLabel.get(label));
        } else {
          comparisonGroups = pairGroups;
        }

        comparisonHeader = remainingSdComparison.querySelector("thead")?.cloneNode(true) ?? null;
      }
    }

    if (strengthFigure && remainingSdComparison) {
      remainingSdComparison.parentElement.insertBefore(strengthFigure, remainingSdComparison);

      if (strengthMoreResultsTitle && strengthMoreResults) {
        strengthFigure.after(strengthMoreResultsTitle);
        remainingSdComparison.after(strengthMoreResults);
      }
    }

    if (remainingSdComparison && comparisonHeader && comparisonGroups.length > 0) {
      const allGroupsHaveThreeSamples = comparisonGroups.every((group) => group.rows.length === 6);

      if (allGroupsHaveThreeSamples) {
        const carouselList = document.createElement("div");
        carouselList.className = "comparison-sampler-list";

        const createLabelCell = (source, classToRemove) => {
          const label = source.cloneNode(true);
          label.classList.remove(classToRemove, "vertical-label-four", "pair-label-eight");
          label.rowSpan = classToRemove === "pair-label-tall" ? 2 : 1;
          return label;
        };

        comparisonGroups.forEach((group) => {
          const sampleCount = group.rows.length / 2;
          const pairLabel = group.rows[0].querySelector(".pair-label");
          const eraseLabel = group.rows[0].querySelector(".vertical-label");
          const preserveLabel = group.rows[sampleCount].querySelector(".vertical-label");

          if (!pairLabel || !eraseLabel || !preserveLabel) {
            return;
          }

          const erasedConcept = pairLabel.querySelector(".concept-erased")?.textContent.trim() ?? "Erased concept";
          const preservedConcept = preserveLabel.textContent.trim();
          const pairName = `${erasedConcept} and ${preservedConcept}`;
          const isVanGoghPicasso = erasedConcept === "Van Gogh" && preservedConcept === "Picasso";
          const sampler = document.createElement("section");
          sampler.className = "comparison-sampler";
          sampler.setAttribute("aria-label", `${pairName} comparison samples`);

          const scroll = document.createElement("div");
          scroll.className = "figure-scroll comparison-sample-scroll";
          scroll.setAttribute("role", "group");
          scroll.setAttribute("aria-label", `${pairName} baseline comparison`);

          const table = document.createElement("table");
          table.className = "figure-table stable-table";
          const groupHeader = comparisonHeader.cloneNode(true);
          if (isVanGoghPicasso) {
            const headerRow = groupHeader.querySelector("tr");
            const oursHeader = Array.from(groupHeader.querySelectorAll(".method-label"))
              .find((header) => header.textContent.trim() === "Ours");
            if (headerRow && oursHeader) {
              const stereoHeader = document.createElement("th");
              stereoHeader.className = "method-label";
              stereoHeader.scope = "col";
              stereoHeader.textContent = "STEREO";
              headerRow.insertBefore(stereoHeader, oursHeader);
            }
          }
          table.appendChild(groupHeader);

          const sampleBodies = Array.from({ length: sampleCount }, (_, sampleIndex) => {
            const sampleBody = document.createElement("tbody");
            sampleBody.className = "comparison-sample";
            sampleBody.hidden = sampleIndex !== 0;

            const eraseRow = group.rows[sampleIndex].cloneNode(true);
            const preserveRow = group.rows[sampleIndex + sampleCount].cloneNode(true);
            eraseRow.classList.remove("group-start");
            preserveRow.classList.remove("group-start");
            eraseRow.querySelectorAll(".pair-label, .vertical-label").forEach((label) => label.remove());
            preserveRow.querySelectorAll(".pair-label, .vertical-label").forEach((label) => label.remove());

            const samplePairLabel = createLabelCell(pairLabel, "pair-label-tall");
            const sampleEraseLabel = createLabelCell(eraseLabel, "vertical-label-tall");
            const samplePreserveLabel = createLabelCell(preserveLabel, "vertical-label-tall");
            eraseRow.insertBefore(samplePairLabel, eraseRow.firstChild);
            eraseRow.insertBefore(sampleEraseLabel, samplePairLabel.nextSibling);
            preserveRow.insertBefore(samplePreserveLabel, preserveRow.firstChild);

            sampleBody.append(eraseRow, preserveRow);
            table.appendChild(sampleBody);
            return sampleBody;
          });

          scroll.appendChild(table);
          sampler.appendChild(scroll);

          const controls = document.createElement("nav");
          controls.className = "comparison-sample-controls";
          controls.setAttribute("aria-label", `${pairName} sample navigation`);

          const previousButton = document.createElement("button");
          previousButton.type = "button";
          previousButton.className = "comparison-sample-button";
          previousButton.setAttribute("aria-label", `Previous ${pairName} sample`);
          previousButton.innerHTML = '<span aria-hidden="true">&#8249;</span>';

          const status = document.createElement("output");
          status.className = "sr-only comparison-sample-status";
          status.setAttribute("aria-live", "polite");
          status.setAttribute("aria-atomic", "true");

          const dots = document.createElement("div");
          dots.className = "comparison-sample-dots";
          dots.setAttribute("aria-label", `${pairName} sample selection`);

          const dotButtons = Array.from({ length: sampleCount }, (_, sampleIndex) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "comparison-sample-dot";
            dot.setAttribute("aria-label", `Show ${pairName} sample ${sampleIndex + 1} of ${sampleCount}`);
            dot.addEventListener("click", () => setActiveSample(sampleIndex));
            dots.appendChild(dot);
            return dot;
          });

          const nextButton = document.createElement("button");
          nextButton.type = "button";
          nextButton.className = "comparison-sample-button";
          nextButton.setAttribute("aria-label", `Next ${pairName} sample`);
          nextButton.innerHTML = '<span aria-hidden="true">&#8250;</span>';

          let activeSample = 0;
          const setActiveSample = (nextSample) => {
            const nextIndex = (nextSample + sampleCount) % sampleCount;
            const changed = nextIndex !== activeSample;
            activeSample = nextIndex;
            sampleBodies.forEach((sampleBody, sampleIndex) => {
              sampleBody.hidden = sampleIndex !== activeSample;
            });
            status.value = `Sample ${activeSample + 1} of ${sampleCount}`;
            status.textContent = status.value;
            dotButtons.forEach((dot, sampleIndex) => {
              const selected = sampleIndex === activeSample;
              dot.setAttribute("aria-pressed", String(selected));
              dot.toggleAttribute("data-active", selected);
            });
            scroll.scrollLeft = 0;

            if (!sampler.classList.contains("is-ready")) {
              sampler.classList.add("is-ready");
              return;
            }

            if (!changed) {
              return;
            }

            sampler.classList.remove("is-changing");
            void sampler.offsetWidth;
            sampler.classList.add("is-changing");
          };

          previousButton.addEventListener("click", () => setActiveSample(activeSample - 1));
          nextButton.addEventListener("click", () => setActiveSample(activeSample + 1));
          controls.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              setActiveSample(activeSample + (event.key === "ArrowRight" ? 1 : -1));
            }
          });

          controls.append(previousButton, status, dots, nextButton);
          sampler.appendChild(controls);
          carouselList.appendChild(sampler);
          setActiveSample(0);
        });

        if (carouselList.children.length === comparisonGroups.length) {
          remainingSdComparison.replaceWith(carouselList);
        }
      }
    }

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
