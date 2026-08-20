# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the source for the GitHub Pages site `peterinhk.github.io` — a personal arcade/portal of browser games and web apps. There is no build system, no test suite, and no package manager at the repo root; it is served as static files directly from GitHub Pages. "Development" here almost always means either (a) editing the root `index.html` landing page, or (b) adding/updating a vendored game in its own subdirectory.

## Repository structure

- `index.html` — the live landing page. A single static HTML file with an inline `<style>` and `<script>`. The script alphabetizes the `<li>` game list on load and implements the live search box filter. **Every game must have a corresponding `<li><a href="/dirname">Display Name</a></li>` entry in the `<ul id="game-list">` for it to be reachable from the homepage.**
- `index.html-2` — an alternate/local-network copy of the landing page (links point at `games.home.int` instead of relative paths). It is tracked but not served by GitHub Pages; treat it as a reference variant, not the live page. Keep it in sync manually if you want it usable.
- Every other top-level directory (`2048/`, `chess/`, `doom/`, `quake/`, `pacman/`, `w95/`, `vxp/`, `mac/`, `StarCraft/`, `nes/`, `LemmingsJS/`, `typing-test/`, etc.) is a **self-contained, independently-sourced project**, most vendored/imported from a third-party open-source repo. Each keeps its own `README.md`, license, and (where applicable) its own `package.json` / build tooling (React, Nuxt, plain Rakefile+SCSS, Node servers, etc.). There is no shared build pipeline across them — do not assume a change in one subdirectory's tooling applies to another.
- A few top-level files (`config`, `HEAD`, `description`, `hooks/`, `info/`) are stray bare-git-repo artifacts sitting in the working tree. They are **untracked** (not in `git ls-files`) and unrelated to the real `.git/` directory — do not confuse them with actual git plumbing, and do not treat them as site content.
- `chips_challenge.zip` is a zipped archive alongside its extracted counterpart `chips-challenge/`.

## Adding or updating a game

1. Add the game's files as a new top-level directory (typically vendored from an upstream project — preserve its own README/license).
2. If the subdirectory requires a build step (e.g. `typing-test` is a React app built with `react-scripts`, `flagle-2` is a Nuxt app), build it and commit the built/static output that GitHub Pages will actually serve (see how `typing-test` links to `/typing-test/build` rather than its source root).
3. Add a matching `<li><a href="/dirname">Display Name</a></li>` entry to `index.html`'s `#game-list`. The list is sorted client-side, so entries don't need to be added in alphabetical order.
4. To temporarily unlist a game without deleting its files, comment out its `<li>` (see the `wheel-of-luck` entry for the existing pattern) rather than removing the directory.

## Working within a vendored subdirectory

Because each game directory is its own upstream project, check that directory's own `README.md`/`package.json` before assuming a workflow — commands, dependencies, and build output locations vary per game (some are plain static HTML/JS with no build step at all; others are full npm/React/Nuxt projects with their own CI workflows under `<game>/.github/`).
