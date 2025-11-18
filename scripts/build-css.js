#!/usr/bin/env node

/**
 * CSS Build Script
 *
 * Bundles modular CSS files for each widget:
 * - base.css (variables & resets)
 * - brand CSS (school-specific colors)
 * - component CSS (shared components)
 * - widget-specific CSS
 *
 * Usage:
 *   node scripts/build-css.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCHOOL_ID = 'bergen-private-gymnas';
const SHARED_DIR = path.join(__dirname, '../shared');
const WIDGETS_DIR = path.join(__dirname, '../widgets');
const DOCS_DIR = path.join(__dirname, '../docs/widgets');

// CSS file paths
const BASE_CSS = path.join(SHARED_DIR, 'base.css');
const BRAND_CSS = path.join(SHARED_DIR, 'brand', `${SCHOOL_ID}.css`);
const MODAL_CSS = path.join(SHARED_DIR, 'components', 'modal.css');
const ACCORDION_CSS = path.join(SHARED_DIR, 'components', 'accordion.css');

/**
 * Read file content with error handling
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err.message);
    return '';
  }
}

/**
 * Write file with error handling
 */
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Built: ${filePath}`);
  } catch (err) {
    console.error(`❌ Error writing ${filePath}:`, err.message);
  }
}

/**
 * Build CSS for a widget
 */
function buildWidget(widgetName, cssFileName, useModal = false, useAccordion = false) {
  console.log(`\n📦 Building CSS for: ${widgetName}`);

  // Read all required CSS files
  const base = readFile(BASE_CSS);
  const brand = readFile(BRAND_CSS);
  const widgetSrc = path.join(WIDGETS_DIR, widgetName, 'src', cssFileName);
  const widgetCss = readFile(widgetSrc);

  // Build the bundle
  let bundle = '';

  // Add header comment
  bundle += `/**\n`;
  bundle += ` * ${widgetName} - Bundled CSS\n`;
  bundle += ` * Generated: ${new Date().toISOString()}\n`;
  bundle += ` * School: ${SCHOOL_ID}\n`;
  bundle += ` * \n`;
  bundle += ` * Bundle includes:\n`;
  bundle += ` * - base.css (variables & resets)\n`;
  bundle += ` * - brand CSS (${SCHOOL_ID})\n`;
  if (useModal) bundle += ` * - modal.css (shared modal component)\n`;
  if (useAccordion) bundle += ` * - accordion.css (shared accordion component)\n`;
  bundle += ` * - ${widgetName}.css (widget-specific styles)\n`;
  bundle += ` */\n\n`;

  // Add base styles
  bundle += '/* ========================================\n';
  bundle += '   BASE STYLES & VARIABLES\n';
  bundle += '   ======================================== */\n\n';
  bundle += base + '\n\n';

  // Add brand styles
  bundle += '/* ========================================\n';
  bundle += '   BRAND STYLES (Bergen Private Gymnas)\n';
  bundle += '   ======================================== */\n\n';
  bundle += brand + '\n\n';

  // Add modal if needed
  if (useModal) {
    const modal = readFile(MODAL_CSS);
    bundle += '/* ========================================\n';
    bundle += '   SHARED COMPONENT - MODAL\n';
    bundle += '   ======================================== */\n\n';
    bundle += modal + '\n\n';
  }

  // Add accordion if needed
  if (useAccordion) {
    const accordion = readFile(ACCORDION_CSS);
    bundle += '/* ========================================\n';
    bundle += '   SHARED COMPONENT - ACCORDION\n';
    bundle += '   ======================================== */\n\n';
    bundle += accordion + '\n\n';
  }

  // Add widget-specific styles
  bundle += '/* ========================================\n';
  bundle += `   WIDGET-SPECIFIC STYLES\n`;
  bundle += '   ======================================== */\n\n';
  bundle += widgetCss;

  // Write to docs directory (deployed version)
  const outputPath = path.join(DOCS_DIR, widgetName, 'v1', 'styles.css');
  writeFile(outputPath, bundle);

  return bundle;
}

/**
 * Main build process
 */
function main() {
  console.log('🚀 Starting CSS build process...\n');
  console.log(`School ID: ${SCHOOL_ID}`);

  // Build programfag-katalog (uses modal + accordion)
  buildWidget('programfag-katalog', 'catalog.css', true, true);

  // Build programfag-velger (uses modal + accordion)
  buildWidget('programfag-velger', 'velger.css', true, true);

  console.log('\n✨ CSS build complete!\n');
}

// Run the build
main();
