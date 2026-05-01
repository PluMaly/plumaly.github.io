# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A personal academic website for Yue Yu, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme (v0.16.3). Deployed at `https://plumaly.github.io`.

## Essential Commands

### Local Development (Docker — always prefer this over native Ruby)

```bash
docker compose pull && docker compose up       # first-time setup + start dev server → http://localhost:8080
docker compose up --build                       # rebuild after dependency/Dockerfile changes
docker compose down                             # stop containers, free port 8080
```

### Code Formatting (mandatory — CI fails without this)

```bash
npm install --save-dev prettier @shopify/prettier-plugin-liquid   # first time only
npx prettier . --write                                           # format all files
```

### Production Build Simulation

```bash
JEKYLL_ENV=production bundle exec jekyll build   # requires Ruby + gems installed
```

## Architecture

### Template System (Liquid)

All templates are in `_layouts/` and `_includes/`. The inheritance chain is:

```
default.liquid          ← base HTML shell (head, header, footer, scripts)
├── page.liquid         ← generic content page
├── post.liquid         ← blog post
├── about.liquid        ← about/profile page
├── bib.liquid          ← publications listing
├── cv.liquid           ← CV page (renders sections from _includes/cv/)
├── archive.liquid      ← blog/news archive
├── distill.liquid      ← Distill.pub-style articles
├── book-review.liquid  ← book review pages
└── profiles.liquid     ← profile listing
```

`_includes/` contains reusable components: `head.liquid`, `header.liquid`, `footer.liquid`, `scripts.liquid`, `metadata.liquid`, plus subdirectories for `cv/` (10 section renderers) and `repository/`.

### Content Organization

| Directory        | Purpose                                  | Format                                                                |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `_pages/`        | Static pages (about, cv, projects, etc.) | Markdown with YAML frontmatter                                        |
| `_posts/`        | Blog posts                               | `YYYY-MM-DD-title.md`                                                 |
| `_projects/`     | Project showcases                        | Markdown with frontmatter (`importance:` for ordering)                |
| `_news/`         | News/announcements                       | Markdown                                                              |
| `_teachings/`    | Course listings                          | Markdown                                                              |
| `_books/`        | Book reviews                             | Markdown                                                              |
| `_bibliography/` | BibTeX publications                      | `papers.bib` — supports custom keywords like `pdf`, `code`, `preview` |

### Data Files (`_data/`)

- `socials.yml` — social media links
- `cv.yml` — CV content (RenderCV format)
- `coauthors.yml` — co-author list for publications
- `repositories.yml` — GitHub repo showcases
- `citations.yml`, `venues.yml` — publication metadata

### Styling (`_sass/`)

SCSS partials prefixed with `_`. Main variables in `_variables.scss`. Compiled via `_sass/_base.scss` import chain. Bootstrap is the CSS framework. Dark mode is a feature flag in `_config.yml`.

### Custom Plugins (`_plugins/`)

7 Ruby plugins extending Jekyll: Google Scholar citation fetching, external post aggregation, BibTeX manipulation, accent removal, and conditional content rendering.

### Scripts (`_scripts/`)

JavaScript setup files for analytics, Giscus comments, PhotoSwipe gallery, and cookie consent. `search.liquid.js` is a Liquid+JS hybrid for search functionality.

## Configuration (`_config.yml`)

The single most important file. Key sections:

- **Site identity:** `title`, `first_name`, `last_name`, `url`, `baseurl`
  - Personal site: `url: https://username.github.io`, `baseurl:` (empty)
  - Project site: `url: https://username.github.io`, `baseurl: /repo-name/`
- **Feature flags:** `enable_` prefixed settings (dark_mode, math, progressbar, etc.)
- **Third-party libraries:** `third_party_libraries` section with CDN URLs and SRI hashes — 30+ libraries managed here
- **Collections:** books, news, projects, teachings (all `output: true`)

YAML special characters (`:`, `&`, `#`) must be quoted in values.

## CI/CD

- **`prettier.yml`** — formatting check (blocks PRs if code isn't formatted)
- **`deploy.yml`** — builds with Ruby 3.3.5, Python 3.13, runs PurgeCSS, deploys to `gh-pages` branch
- **`broken-links.yml`** — link validation via lychee
- **`axe.yml`** — accessibility testing
- **`update-citations.yml`** — auto-updates Google Scholar citation counts

## Common Pitfalls

- **CSS/JS not loading after deploy:** Wrong `url`/`baseurl` in `_config.yml`. Personal site needs empty `baseurl`.
- **"Unknown tag 'toc'" error:** Verify gh-pages branch is set as deployment source in GitHub Settings → Pages.
- **Prettier failures in CI:** Always run `npx prettier . --write` before committing.
- **Port 8080 in use:** `docker compose down` first.
- **"Zero vectors cannot be normalized":** Empty blog posts confuse `classifier-reborn`. Add content or set `related_posts: false` in frontmatter.
- **`_config.yml` changes require restart:** Docker dev server watches most files but config changes need `docker compose down && docker compose up`.

## Detailed Guides

- `AGENTS.md` — routing to role-specific instructions
- `.github/copilot-instructions.md` — tech stack details, build process, common pitfalls
- `.github/agents/customize.agent.md` — customization recipes (12+ common tasks)
- `.github/instructions/` — path-specific coding guidelines (5 files for YAML, Liquid, BibTeX, JS, Markdown)
- `INSTALL.md`, `CUSTOMIZE.md`, `TROUBLESHOOTING.md`, `QUICKSTART.md` — user-facing documentation
