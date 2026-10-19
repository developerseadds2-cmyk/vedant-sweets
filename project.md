# Project Documentation

## 1. Project overview

This repository is a Shopify theme starter (Skeleton Theme) built for storefront customization using Shopify's Liquid templating system, HTML, CSS, JSON, and SVG assets. It is not a Node.js or backend application; it is a front-end theme package designed to be uploaded to a Shopify store or previewed with Shopify CLI.

The codebase is intentionally structured to be modular and maintainable. It uses Shopify's standard theme architecture:

- `layout/` for page wrappers
- `templates/` for page definition JSON
- `sections/` for reusable page sections
- `blocks/` for smaller reusable components inside sections
- `snippets/` for shared fragments and utilities
- `assets/` for static files and critical CSS
- `config/` for theme settings
- `locales/` for translation strings

The project retains Shopify Skeleton's minimal theme architecture and has a Vedanta Sweets storefront header, footer, and image-backed homepage slider. Product and collection templates remain lean starter implementations for the store's own catalog and merchandising.

---

## 2. Project purpose and primary use

The project is meant to:

- Provide a clean Shopify theme foundation
- Demonstrate Shopify best practices for modular storefront development
- Allow merchants to edit page sections, blocks, and settings in the theme editor
- Make page layout and styling easy to extend without writing custom app code
- Support multilingual content through locale JSON files

This repo is best understood as a storefront skeleton that can be transformed into a real online store theme.

---

## 3. Technology stack

### Core stack

- Shopify Liquid
- HTML5
- CSS
- JSON
- SVG assets
- Shopify CLI for preview and developer workflow

### Shopify mechanisms used

- Liquid objects and filters
- `schema` tags for theme editor settings
- Section groups and templates
- Page JSON templates for section ordering
- `content_for_layout` and `content_for_header`
- Global theme settings through `config/settings_schema.json`
- Localization with `locales/*.json`

### Tooling and local dev

The repository is designed to work with Shopify theme tooling, primarily:

- `shopify theme dev`
- local preview in a storefront environment
- theme editor configuration for section settings

---

## 4. Repository structure

```text
vedanta-custom/
├── AGENTS.md
├── CLAUDE.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE.md
├── README.md
├── copilot-instructions.md
├── project.md
├── assets/
│   ├── critical.css
│   ├── main.css
│   ├── index.js
│   ├── icon-account.svg
│   ├── icon-cart.svg
│   ├── logo.png
│   ├── logo.svg
│   ├── logo1.png
│   ├── Festive Indian Mithai Celebration.png
│   ├── Festive Indian Sweets in Gold and Maroon.png
│   └── shoppy-x-ray.svg
├── blocks/
│   ├── group.liquid
│   └── text.liquid
├── config/
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/
│   ├── password.liquid
│   └── theme.liquid
├── locales/
│   ├── en.default.json
│   └── en.default.schema.json
├── sections/
│   ├── 404.liquid
│   ├── article.liquid
│   ├── blog.liquid
│   ├── cart.liquid
│   ├── collection.liquid
│   ├── collections.liquid
│   ├── custom-section.liquid
│   ├── footer-group.json
│   ├── footer.liquid
│   ├── header-group.json
│   ├── header.liquid
│   ├── hero-slider.liquid
│   ├── hello-world.liquid
│   ├── page.liquid
│   ├── password.liquid
│   ├── product.liquid
│   └── search.liquid
├── snippets/
│   ├── font-face-styles.liquid
│   ├── image.liquid
│   └── meta-tags.liquid
├── templates/
│   ├── 404.json
│   ├── article.json
│   ├── blog.json
│   ├── cart.json
│   ├── collection.json
│   ├── gift_card.liquid
│   ├── index.json
│   ├── list-collections.json
│   ├── page.json
│   ├── password.json
│   ├── product.json
│   └── search.json
└── .theme-check.yml
```

---

## 5. Directory-by-directory explanation

### 5.1 `assets/`

Responsible for static files required by the storefront.

Files in this directory include:

- `critical.css` — the base CSS loaded on every page; contains resets, layout logic, and core theme styling
- `main.css` — brand tokens and shared styles for the header, footer, hero slider, and reusable theme components
- `index.js` — deferred hero slider logic, including autoplay and continuous slide wrapping
- `logo.png`, `logo.svg`, `logo1.png` — available logo assets
- `Festive Indian Mithai Celebration.png`, `Festive Indian Sweets in Gold and Maroon.png` — homepage slider backgrounds
- `icon-account.svg` — account icon
- `icon-cart.svg` — cart icon
- `shoppy-x-ray.svg` — theme illustration/logo asset used in demo content

`critical.css` provides the Skeleton theme's foundational layout styles. `main.css` is the central location for authored storefront CSS and global design tokens. `index.js` contains the hero slider's autoplay, infinite navigation, keyboard, and accessible control behavior. Liquid markup only passes dynamic values as custom properties when needed (for example, a merchant-selected height or an asset URL). Shopify-generated `font_face` rules are emitted from the selected global font settings so Shopify can serve the font files.

### 5.2 `blocks/`

Blocks are smaller and reusable content-building structures that are meant to be placed inside sections.

Current blocks:

- `group.liquid` — a layout block that can arrange child blocks vertically or horizontally with configurable spacing and alignment
- `text.liquid` — a content block used for simple text and alignment styling

These blocks use Shopify block schema and support merchant editing in the Theme Editor.

### 5.3 `config/`

Theme-level configuration values live here.

- `settings_schema.json` — defines global settings available in the theme editor, such as:
  - primary font
  - page width
  - page margin
  - background color
  - foreground color
  - input corner radius

- `settings_data.json` — stores currently active settings values, generated/managed by Shopify admin or the theme system.

This is the theme's global configuration layer.

### 5.4 `layout/`

Theme layout wrappers are stored here.

- `theme.liquid` — main HTML layout
  - loads `critical.css` and `main.css`
  - passes selected font families through CSS custom properties and loads their Shopify-hosted font faces
  - renders `meta-tags`
  - includes `{{ content_for_header }}`
  - renders header group and footer group around page content via `{{ content_for_layout }}`

- `password.liquid` — alternate layout used for password-protected storefronts.

The gift-card standalone template loads the same stylesheets directly because it uses `{% layout none %}`.

### 5.5 `locales/`

Localization files store internationalized UI strings.

Current files:

- `en.default.json` — default English strings for storefront labels such as cart, search, blog, login, and password pages
- `en.default.schema.json` — schema-specific translations for editor labels and settings

The theme follows Shopify's localization best practices; user-facing text should be translated through the `t` filter.

### 5.6 `sections/`

Sections are the reusable full-width content modules for pages.

Current sections include:

- `header.liquid` — responsive navigation header with a mobile menu toggle, account link, cart icon, and cart count
- `footer.liquid` — branded footer with optional navigation, contact email, and payment icons
- `hero-slider.liquid` — accessible, responsive two-slide homepage carousel using the provided Vedanta Sweets celebration backgrounds and editable slide text
- `hello-world.liquid` — starter homepage section with an introductory welcome layout
- `custom-section.liquid` — a generic customizable section meant for containing blocks with optional background image
- `404.liquid`, `article.liquid`, `blog.liquid`, `cart.liquid`, `collection.liquid`, `collections.liquid`, `page.liquid`, `password.liquid`, `product.liquid`, `search.liquid` — page-specific section templates in the default Shopify theme structure
- `header-group.json` and `footer-group.json` — section group definitions used by the main theme layout to render header and footer content in the desired order

Sections support merchant control through the Shopify Theme Editor and their own `schema` blocks.

### 5.7 `snippets/`

Snippets are reusable fragments used across templates and sections.

- `font-face-styles.liquid` — emits Shopify-generated font-face rules for the global font settings
- `meta-tags.liquid` — sets canonical URL, Open Graph tags, twitter metadata, page title, and description
- `image.liquid` — image helper snippet for reusable responsive image rendering

These helpers reduce duplication and centralize shared logic.

### 5.8 `templates/`

Templates define which sections should appear on each subject page type and in what order.

Current template files include:

- `index.json` — homepage structure
- `product.json` — product page structure
- `collection.json` — collection page structure
- `cart.json` — cart page structure
- `article.json` — article page structure
- `blog.json` — blog page structure
- `search.json` — search page structure
- `page.json` — static page structure
- `404.json` — not-found page structure
- `list-collections.json` — list collections page
- `gift_card.liquid` — gift card template
- `password.json` — password page template

The default home page is wired to the `hero-slider` section via `index.json`.

---

## 6. Core theme behavior

### 6.1 Layout flow

The page rendering flow is usually:

1. Shopify loads the layout file (`layout/theme.liquid`)
2. Header section group renders at the top
3. `{{ content_for_layout }}` renders the page template content
4. Footer section group renders at the bottom
5. Shopify injects scripts and metadata from `content_for_header`

### 6.2 Global styling

Global styling is driven by the custom properties at the top of `assets/main.css`. Edit the `--vs-*` tokens there to update shared colors, typography defaults, content width, and spacing.

The principal tokens include:

- `--vs-ruby-red`
- `--vs-heritage-green`
- `--vs-silk-ivory`
- `--vs-antique-gold`
- `--vs-font-heading`
- `--vs-font-body`
- `--vs-content-max-width`
- `--vs-page-gutter`

The global font, width, spacing, base colors, and input-radius controls are configured in `config/settings_schema.json`. The layout passes selected font families to the CSS properties, and `font-face-styles.liquid` asks Shopify to serve the selected font files. `critical.css` provides the Skeleton layout foundation; `main.css` owns Vedanta branding and shared component styles.

### 6.3 Section and block architecture

The theme follows Shopify's modular composition model:

- The design is broken into sections for large page chunks
- Each section can expose settings in a JSON schema
- Blocks can be nested inside sections to make content editable by merchants
- The default `custom-section.liquid` is a generic wrapper designed to host theme blocks

This enables a merchant-friendly UI in the Shopify Theme Editor without code changes.

---

## 7. Current homepage configuration

The current default homepage is configured in `templates/index.json`:

```json
{
  "sections": {
    "main": {
      "type": "hero-slider",
      "settings": {
        "button_link_one": "/collections/all",
        "button_link_two": "/collections/all"
      }
    }
  },
  "order": ["main"]
}
```

The homepage template references `sections/hero-slider.liquid`, whose slide text, CTA labels and links, autoplay behavior, and height are configurable in the theme editor. Autoplay is enabled by default; the slider wraps continuously between slides and respects reduced-motion preferences. Its JavaScript lives in `assets/index.js`, loaded deferred from the main layout.

---

## 8. Key theme files and what they do

### `layout/theme.liquid`

Main page wrapper. Renders global header and footer and injects theme metadata and Shopify scripts.

### `snippets/meta-tags.liquid`

Responsible for:

- canonical URL
- Open Graph tags
- Twitter card tags
- page title
- page description
- structured data for product pages

### `assets/critical.css`

Contains reset rules and reusable layout behavior for Shopify sections, including logic for:

- full-width vs constrained-width section layout
- content grid alignment
- baseline typography and spacing

### `sections/header.liquid`

Implements the storefront top bar, including:

- store name link
- navigation menu
- click-to-open mobile navigation with Escape-to-close and accessible expanded state
- account icon link (if customer accounts are enabled)
- cart icon with item count badge

### `sections/footer.liquid`

Implements the store footer with:

- copyright notice
- navigation links
- optional payment icons

### `blocks/text.liquid`

Reusable content block for a text-based section, with configurable style and alignment.

### `blocks/group.liquid`

Reusable wrapper block that arranges child content in a horizontal or vertical group layout.

---

## 9. Global theme settings

The theme exposes global settings through `config/settings_schema.json` for:

- theme info metadata
- font selection
- page width
- margin spacing
- colors
- input radius

These settings are surfaced in the Shopify Theme Editor and consumed by the layouts and shared stylesheet.

---

## 10. Localization and translation

The project uses Shopify's locale conventions. Strings should be inserted via the `t` filter rather than hardcoded text.

Example pattern:

```liquid
{{ 'general.cart.title' | t }}
```

The default locale file includes standard key groups such as:

- `404`
- `blog`
- `cart`
- `customers`
- `collections`
- `gift_card`
- `password`
- `search`

This makes the theme ready for future translation updates and multi-language storefront expansion.

---

## 11. Shopify theme conventions used in the repo

This project follows key Shopify theme conventions:

- sections with `schema` definitions
- JSON templates for page entry points
- `link_list` and `image_picker` settings for merchant editing
- CSS variables from theme settings
- `content_for_header` and `content_for_layout` layout injection
- responsive section patterns using `shopify-section` classes
- `full-width` utility classes for full-bleed sections

---

## 12. Development workflow

A typical local workflow for this theme is:

1. Ensure Shopify CLI is installed
2. Authenticate with the target store or connected Shopify environment
3. Run:

```bash
shopify theme dev
```

4. Preview the storefront in a local browser or Shopify preview environment
5. Edit theme files and sync changes through Shopify CLI

The project can be customized by editing Liquid templates, sections, blocks, snippets, and theme settings.

---

## 13. Current project state

The repository started from Shopify Skeleton Theme and now includes Vedanta Sweets branding: a responsive header, matching footer, and configurable two-slide homepage carousel. Product and collection experiences remain starter implementations and should be reviewed and customized with the store's catalog, shipping, and business requirements before production launch.

---

## 14. Best customization points

To transform this theme into a real storefront, the most likely files to edit are:

- `sections/header.liquid` — navigation and store header
- `sections/footer.liquid` — footer navigation and trust signals
- `sections/hero-slider.liquid` — homepage slider and primary brand presentation
- `sections/hello-world.liquid` — optional starter/demo content
- `templates/index.json` — homepage composition
- `config/settings_schema.json` — theme-wide styling and options
- `locales/en.default.json` — copy and translations
- `assets/critical.css` — global styling adjustments
- `assets/main.css` — shared variables and authored styling for global/component appearance

---

## 15. Summary

This repository retains Shopify's modular theme architecture while introducing Vedanta Sweets brand styling and homepage components. Its Liquid sections, blocks, snippets, global settings, and JSON templates provide a lightweight base that remains customizable in Shopify's theme editor.
