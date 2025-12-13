# Scripts

## Generate OG Image

Generate the social share image (og-image.png) from the HTML template.

### Method 1: Using Puppeteer Script (Recommended)

**Prerequisites:**
Install Puppeteer as a dev dependency:

```bash
npm install --save-dev puppeteer
```

**Usage:**
```bash
node scripts/generate-og-image.js
```

This will:
1. Load `public/og-image-generator.html`
2. Render it in a headless browser at 1200x630px
3. Save the screenshot as `public/og-image.png`

### Method 2: Browser Screenshot (Quick Alternative)

1. Open `public/og-image-generator.html` in Chrome/Edge
2. Open DevTools (F12)
3. Toggle device toolbar (Cmd/Ctrl + Shift + M)
4. Set custom dimensions: 1200 x 630
5. Right-click → "Capture screenshot" or Cmd/Ctrl + Shift + P → "Capture screenshot"
6. Save as `public/og-image.png`

### Method 3: Online Tools

Use services like:
- [htmlcsstoimage.com](https://htmlcsstoimage.com)
- [bannerbear.com](https://bannerbear.com)
- Upload `og-image-generator.html` and set dimensions to 1200x630

### Verification

After generating, verify the image:
- Should be exactly 1200x630 pixels
- Should display correctly when shared on Twitter, LinkedIn, Facebook
- Test with: https://www.opengraph.xyz/url/https://180focus.app
