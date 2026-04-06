

# Remove Lovable Branding — Replace with Edroots International

## Problem
The OG image URLs point to Lovable's CDN (`pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev`), and the default `favicon.ico` is Lovable's favicon. These need to be replaced with Edroots branding.

## Changes

### 1. `index.html`
- Remove the OG image and Twitter image meta tags (they point to Lovable screenshot CDN). Can be re-added later when the user provides a custom OG image.
- Add a favicon link pointing to a new SVG favicon with Edroots branding (globe icon in teal, matching the app's sidebar logo)

### 2. `public/favicon.ico`
- Delete the existing Lovable favicon

### 3. `public/favicon.svg`
- Create a simple SVG favicon — a teal globe icon matching the Edroots brand color

### Files
- **Delete**: `public/favicon.ico`
- **Create**: `public/favicon.svg`
- **Modify**: `index.html`

