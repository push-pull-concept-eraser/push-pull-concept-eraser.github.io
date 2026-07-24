# AGENTS.md

## Project

This repository is the static GitHub Pages project site for **Push–Pull Attentional Anchoring for Diffusion Concept Erasure**.

- Public site: https://push-pull-concept-eraser.github.io/
- GitHub repository: `push-pull-concept-eraser/push-pull-concept-eraser.github.io`
- Local project root: `/Users/nessessence/Documents/push-pull-concept-eraser.github.io`

The site has no build system or package manager. GitHub Pages serves the repository files directly. The main pieces are:

- `index.html` — page structure, paper summary, resources, figures, and citation.
- `styles.css` — all layout, typography, responsive behavior, and visual styling.
- `figure-viewer.js` — figure tabs, modal/viewer behavior, copy-citation interaction, and keyboard handling.
- `assets/` — logos, thumbnails, and figure images/animations.

## Paper context

Use Zotero MCP as the canonical source for paper metadata. The matching Zotero item is:

- Title: *Push–Pull Attentional Anchoring for Diffusion Concept Erasure*
- Authors: Nattanat Chatthee, Tagon Sompong, Ekapol Chuangsuwanich, Supasorn Suwajanakorn
- Zotero item key: `B3AMXPVG`

The paper presents Push–Pull Attentional Anchoring (PPAA), a cross-attention-space method for diffusion concept erasure. It displaces target representations while constraining semantic retention with bounded cosine-similarity ratios, aiming to control erasure strength while limiting semantic drift. Do not copy or invent paper details; consult the Zotero item when updating factual paper content.

## Editing conventions

1. Run `git status --short --branch` before editing and preserve unrelated work.
2. Existing uncommitted changes are part of the user’s work. Do not reset, discard, or overwrite them unintentionally.
3. Use `apply_patch` for repository file edits.
4. Keep links and asset references relative to the site root so they work on GitHub Pages.
5. Follow the existing asset naming pattern under `assets/figures/` and avoid replacing source images or animations without an explicit request.
6. Prefer the existing HTML/CSS/JavaScript structure and avoid adding dependencies unless the task explicitly requires them.
7. Preserve accessibility: meaningful image `alt` text, usable focus states, semantic headings, keyboard-operable controls, and sensible reduced-motion behavior.
8. Keep responsive behavior intact across desktop, tablet, and mobile layouts.

## Publishing

After completing and validating any site edit, commit the intended changes and push the current branch to its configured GitHub remote so GitHub Pages can publish the update. Do not include unrelated user work in the commit.

## Layout invariants

- For teaser figures, center only the actual image columns; do not include the left-side label columns when calculating horizontal centering.
- Keep all row and group labels visible; labels must not be clipped by the figure container.
- Preserve horizontal scrolling on tablet and mobile layouts.

## Validation

After changes, run a local static-server smoke test from the repository root:

```sh
python3 -m http.server 8765
```

In another terminal, verify representative resources:

```sh
curl -fsS -o /dev/null -w 'index.html: HTTP %{http_code}\n' http://127.0.0.1:8765/index.html
curl -fsS -o /dev/null -w 'figure-viewer.js: HTTP %{http_code}\n' http://127.0.0.1:8765/figure-viewer.js
curl -fsS -o /dev/null -w 'logo: HTTP %{http_code}\n' http://127.0.0.1:8765/assets/eccv-2026-logo.svg
```

Also run:

```sh
curl -L -fsS -o /dev/null -w 'deployed site: HTTP %{http_code}\n' https://push-pull-concept-eraser.github.io/
git diff --check
```

For UI changes, visually inspect the page at desktop and mobile widths. Check figure tabs/viewer behavior, external and resource links, citation copying, focus states, and keyboard interactions (including `Escape` where applicable).

## Current worktree note

At the time this guide was created, the worktree already contained uncommitted changes in `index.html` and `styles.css`, plus two untracked GIFs:

- `assets/figures/strength/r01-goku_animated_powerpoint.gif`
- `assets/figures/strength/r02-grumpy-cat_animated_powerpoint.gif`

Treat these as existing user work. Inspect before modifying, and never remove them as part of unrelated tasks.
