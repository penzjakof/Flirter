import fs from 'node:fs';
import path from 'node:path';

/**
 * ADVERSARIAL CONTRAST & WCAG 2.1 VERIFICATION SUITE
 * Flirter iOS / Expo Application
 * Challenger 1
 */

// 1. WCAG 2.1 Color Science Formulas
export function parseColor(color) {
  if (!color || typeof color !== 'string') {
    throw new Error(`Invalid color value: ${color}`);
  }
  const trimmed = color.trim();

  // Hex: #RRGGBB or #RGB
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }
  }

  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbMatch = trimmed.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (rgbMatch) {
    const r = parseFloat(rgbMatch[1]);
    const g = parseFloat(rgbMatch[2]);
    const b = parseFloat(rgbMatch[3]);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    return { r, g, b, a };
  }

  if (trimmed === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Composite a semi-transparent foreground color over an opaque background color.
 */
export function compositeColor(fgInput, bgInput) {
  const fg = typeof fgInput === 'string' ? parseColor(fgInput) : fgInput;
  const bg = typeof bgInput === 'string' ? parseColor(bgInput) : bgInput;

  const alpha = fg.a;
  const r = Math.round(fg.r * alpha + bg.r * (1 - alpha));
  const g = Math.round(fg.g * alpha + bg.g * (1 - alpha));
  const b = Math.round(fg.b * alpha + bg.b * (1 - alpha));

  return { r, g, b, a: 1 };
}

export function toHex({ r, g, b }) {
  const hR = Math.min(255, Math.max(0, Math.round(r))).toString(16).padStart(2, '0');
  const hG = Math.min(255, Math.max(0, Math.round(g))).toString(16).padStart(2, '0');
  const hB = Math.min(255, Math.max(0, Math.round(b))).toString(16).padStart(2, '0');
  return `#${hR}${hG}${hB}`.toUpperCase();
}

/**
 * W3C Relative Luminance calculation for sRGB
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(colorInput) {
  const color = typeof colorInput === 'string' ? parseColor(colorInput) : colorInput;
  const { r, g, b } = color;

  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const rLin = sR <= 0.04045 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const gLin = sG <= 0.04045 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const bLin = sB <= 0.04045 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * W3C Contrast Ratio calculation
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(c1, c2) {
  const L1 = getRelativeLuminance(c1);
  const L2 = getRelativeLuminance(c2);

  const brighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (brighter + 0.05) / (darker + 0.05);
}

// 2. Token Definitions Extracted from src/theme/tokens.ts
const lightColors = {
  background: '#FAF8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEF1',
  textPrimary: '#211C24',
  textSecondary: '#6C626C',
  textOnBrand: '#FFFFFF',
  textOnMedia: '#FFFFFF',
  brand: '#B6245A',
  brandPressed: '#9A1D4B',
  brandSubtle: '#F9E7EE',
  energyText: '#765000',
  energySurface: '#FFF1D1',
  border: '#E7E0E5',
  cardBorderSubtle: 'rgba(33, 28, 36, 0.06)',
  danger: '#B3261E',
  success: '#1E7A46',
  pass: '#6C626C',
  premiumDeep: '#3B1232',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.18)',
  premiumInk: '#1C0A18',
  energyPlusCardBg: '#FDF2F6',
  energyPlusCardBorder: '#F3D2DF',
  energyPlusCardText: '#5A122D',
  energyPlusBadgeBg: '#F7DDE6',
  energyPlusBadgeText: '#9A1D4B',
  energyTrackBg: '#EAE5E8',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  glassEdge: 'rgba(33, 28, 36, 0.07)',
  glassLens: 'rgba(255, 255, 255, 0.96)',
  tabBarInactive: '#403644',
  overlay: 'rgba(33, 28, 36, 0.55)',
  mediaScrim: 'rgba(0, 0, 0, 0.62)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(250, 248, 247, 0)',
};

const darkColors = {
  background: '#121013',
  surface: '#1C1820',
  surfaceMuted: '#28232D',
  textPrimary: '#F6F3F7',
  textSecondary: '#A59BAA',
  textOnBrand: '#FFFFFF',
  textOnMedia: '#FFFFFF',
  brand: '#DC3B78',
  brandPressed: '#BA2B61',
  brandSubtle: 'rgba(220, 59, 120, 0.16)',
  energyText: '#FFD666',
  energySurface: '#3A2E10',
  border: '#332C38',
  cardBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  danger: '#FF6459',
  success: '#38D468',
  pass: '#A59BAA',
  premiumDeep: '#2E0B27',
  premiumGold: '#F6C445',
  textOnPremiumMuted: 'rgba(255, 255, 255, 0.72)',
  premiumTrack: 'rgba(255, 255, 255, 0.22)',
  premiumInk: '#140512',
  energyPlusCardBg: '#281320',
  energyPlusCardBorder: '#4E213B',
  energyPlusCardText: '#FFB8D2',
  energyPlusBadgeBg: '#451932',
  energyPlusBadgeText: '#FF80AC',
  energyTrackBg: '#342B38',
  glass: 'rgba(255, 255, 255, 0.88)',
  glassBorder: 'rgba(255, 255, 255, 0.98)',
  glassEdge: 'rgba(0, 0, 0, 0.40)',
  glassLens: '#FFFFFF',
  tabBarInactive: '#403644',
  overlay: 'rgba(0, 0, 0, 0.75)',
  mediaScrim: 'rgba(0, 0, 0, 0.65)',
  transparent: 'transparent',
  fadeTransparent: 'rgba(18, 16, 19, 0)',
};

// 3. Execution of Adversarial Verification Calculations
console.log('='.repeat(78));
console.log('ADVERSARIAL EMPIRICAL VERIFICATION REPORT — CHALLENGER 1');
console.log('='.repeat(78));

const testResults = {
  task1: {},
  task2: {},
  task3: {},
  task4: {},
  task5: {},
};

// ---------------------------------------------------------------------------
// TASK 1: Glass Tab Bar Capsule Luminance & Contrast Against Pure Black & Dark BG
// ---------------------------------------------------------------------------
console.log('\n>>> [TASK 1] Glass Tab Bar Capsule Contrast against Pure Black & Dark Background');

const pureBlack = '#000000';
const darkBg = darkColors.background; // '#121013'

// On pure black
const capsuleOnBlack = compositeColor(darkColors.glass, pureBlack);
const lumBlack = getRelativeLuminance(pureBlack);
const lumCapsuleOnBlack = getRelativeLuminance(capsuleOnBlack);
const crCapsuleVsBlack = getContrastRatio(capsuleOnBlack, pureBlack);

// On dark theme background (#121013)
const capsuleOnDarkBg = compositeColor(darkColors.glass, darkBg);
const lumDarkBg = getRelativeLuminance(darkBg);
const lumCapsuleOnDarkBg = getRelativeLuminance(capsuleOnDarkBg);
const crCapsuleVsDarkBg = getContrastRatio(capsuleOnDarkBg, darkBg);

testResults.task1 = {
  glassToken: darkColors.glass,
  pureBlack: {
    bgLuminance: lumBlack,
    compositeHex: toHex(capsuleOnBlack),
    capsuleLuminance: lumCapsuleOnBlack,
    contrastRatio: crCapsuleVsBlack,
    wcag3Pass: crCapsuleVsBlack >= 3.0,
  },
  darkThemeBg: {
    bgLuminance: lumDarkBg,
    compositeHex: toHex(capsuleOnDarkBg),
    capsuleLuminance: lumCapsuleOnDarkBg,
    contrastRatio: crCapsuleVsDarkBg,
    wcag3Pass: crCapsuleVsDarkBg >= 3.0,
  },
};

console.log(`• Dark Glass Token: ${darkColors.glass}`);
console.log(`• Pure Black (#000000): Luminance = ${lumBlack.toFixed(4)}`);
console.log(`  - Composite color: ${toHex(capsuleOnBlack)} (rgb ${capsuleOnBlack.r}, ${capsuleOnBlack.g}, ${capsuleOnBlack.b})`);
console.log(`  - Capsule Luminance: ${lumCapsuleOnBlack.toFixed(4)}`);
console.log(`  - Contrast Ratio: ${crCapsuleVsBlack.toFixed(2)}:1 (WCAG UI minimum 3.0:1 -> ${crCapsuleVsBlack >= 3.0 ? 'PASS' : 'FAIL'})`);

console.log(`• Dark BG (#121013): Luminance = ${lumDarkBg.toFixed(4)}`);
console.log(`  - Composite color: ${toHex(capsuleOnDarkBg)} (rgb ${capsuleOnDarkBg.r}, ${capsuleOnDarkBg.g}, ${capsuleOnDarkBg.b})`);
console.log(`  - Capsule Luminance: ${lumCapsuleOnDarkBg.toFixed(4)}`);
console.log(`  - Contrast Ratio: ${crCapsuleVsDarkBg.toFixed(2)}:1 (WCAG UI minimum 3.0:1 -> ${crCapsuleVsDarkBg >= 3.0 ? 'PASS' : 'FAIL'})`);

// ---------------------------------------------------------------------------
// TASK 2: Contrast Ratio of tabBarInactive (#403644) against White Frosted Glass Surface
// ---------------------------------------------------------------------------
console.log('\n>>> [TASK 2] Inactive Tab Bar Item (#403644) vs White Frosted Glass Surface');

const inactiveColor = darkColors.tabBarInactive; // #403644
const lumInactive = getRelativeLuminance(inactiveColor);

// 1. Inactive vs frosted glass surface over pure black
const crInactiveVsGlassBlack = getContrastRatio(inactiveColor, capsuleOnBlack);
// 2. Inactive vs frosted glass surface over dark theme bg
const crInactiveVsGlassDarkBg = getContrastRatio(inactiveColor, capsuleOnDarkBg);
// 3. Inactive vs frosted glass surface in light mode (over #FAF8F7)
const capsuleOnLightBg = compositeColor(lightColors.glass, lightColors.background);
const crInactiveVsGlassLightBg = getContrastRatio(inactiveColor, capsuleOnLightBg);
// 4. Inactive vs pure white #FFFFFF
const crInactiveVsWhite = getContrastRatio(inactiveColor, '#FFFFFF');

testResults.task2 = {
  inactiveColor,
  lumInactive,
  onGlassOverBlack: {
    surfaceHex: toHex(capsuleOnBlack),
    contrastRatio: crInactiveVsGlassBlack,
    wcagAaPass: crInactiveVsGlassBlack >= 4.5,
    wcagAaaPass: crInactiveVsGlassBlack >= 7.0,
  },
  onGlassOverDarkBg: {
    surfaceHex: toHex(capsuleOnDarkBg),
    contrastRatio: crInactiveVsGlassDarkBg,
    wcagAaPass: crInactiveVsGlassDarkBg >= 4.5,
    wcagAaaPass: crInactiveVsGlassDarkBg >= 7.0,
  },
  onGlassOverLightBg: {
    surfaceHex: toHex(capsuleOnLightBg),
    contrastRatio: crInactiveVsGlassLightBg,
    wcagAaPass: crInactiveVsGlassLightBg >= 4.5,
    wcagAaaPass: crInactiveVsGlassLightBg >= 7.0,
  },
  onPureWhite: {
    contrastRatio: crInactiveVsWhite,
    wcagAaPass: crInactiveVsWhite >= 4.5,
    wcagAaaPass: crInactiveVsWhite >= 7.0,
  },
};

console.log(`• tabBarInactive color: ${inactiveColor} (Luminance = ${lumInactive.toFixed(4)})`);
console.log(`  - vs Frosted Glass on Black (${toHex(capsuleOnBlack)}): ${crInactiveVsGlassBlack.toFixed(2)}:1 (AA: ${crInactiveVsGlassBlack >= 4.5}, AAA: ${crInactiveVsGlassBlack >= 7.0})`);
console.log(`  - vs Frosted Glass on Dark BG (${toHex(capsuleOnDarkBg)}): ${crInactiveVsGlassDarkBg.toFixed(2)}:1 (AA: ${crInactiveVsGlassDarkBg >= 4.5}, AAA: ${crInactiveVsGlassDarkBg >= 7.0})`);
console.log(`  - vs Frosted Glass on Light BG (${toHex(capsuleOnLightBg)}): ${crInactiveVsGlassLightBg.toFixed(2)}:1 (AA: ${crInactiveVsGlassLightBg >= 4.5}, AAA: ${crInactiveVsGlassLightBg >= 7.0})`);
console.log(`  - vs Pure White (#FFFFFF): ${crInactiveVsWhite.toFixed(2)}:1 (AA: ${crInactiveVsWhite >= 4.5}, AAA: ${crInactiveVsWhite >= 7.0})`);

// ---------------------------------------------------------------------------
// TASK 3: Contrast Ratio of colors.brand Against Active Lens (colors.glassLens)
// ---------------------------------------------------------------------------
console.log('\n>>> [TASK 3] Active Brand against Active Lens (colors.glassLens)');

// In Dark Mode: brand is #DC3B78, lens is #FFFFFF
const darkBrand = darkColors.brand;
const darkLens = darkColors.glassLens; // #FFFFFF
const crDarkBrandVsLens = getContrastRatio(darkBrand, darkLens);

// In Light Mode: brand is #B6245A, lens is rgba(255, 255, 255, 0.96)
// Lens in light mode sits on top of glass capsule (0.85) over light bg (#FAF8F7)
const lensOnGlassLight = compositeColor(lightColors.glassLens, capsuleOnLightBg);
const lightBrand = lightColors.brand;
const crLightBrandVsLensComposite = getContrastRatio(lightBrand, lensOnGlassLight);
const crLightBrandVsPureWhite = getContrastRatio(lightBrand, '#FFFFFF');

testResults.task3 = {
  darkMode: {
    brand: darkBrand,
    lens: darkLens,
    contrastRatio: crDarkBrandVsLens,
    wcagGraphicUiPass: crDarkBrandVsLens >= 3.0, // UI icons & large text (>= 3:1)
    wcagNormalTextPass: crDarkBrandVsLens >= 4.5, // Normal text (< 18pt regular)
  },
  lightMode: {
    brand: lightBrand,
    lens: lightColors.glassLens,
    lensCompositeHex: toHex(lensOnGlassLight),
    contrastRatioComposite: crLightBrandVsLensComposite,
    contrastRatioPureWhite: crLightBrandVsPureWhite,
    wcagGraphicUiPass: crLightBrandVsLensComposite >= 3.0,
    wcagNormalTextPass: crLightBrandVsLensComposite >= 4.5,
  },
};

console.log(`• Dark Mode:`);
console.log(`  - Brand: ${darkBrand} (L = ${getRelativeLuminance(darkBrand).toFixed(4)})`);
console.log(`  - Lens: ${darkLens} (L = ${getRelativeLuminance(darkLens).toFixed(4)})`);
console.log(`  - Contrast Ratio: ${crDarkBrandVsLens.toFixed(2)}:1`);
console.log(`  - WCAG Graphical/UI (>= 3.0:1): ${crDarkBrandVsLens >= 3.0 ? 'PASS' : 'FAIL'}`);
console.log(`  - WCAG Body Text (>= 4.5:1): ${crDarkBrandVsLens >= 4.5 ? 'PASS' : 'FAIL'} (Note: Active tab icon is 24px graphical UI element, label is 11px bold)`);

console.log(`• Light Mode:`);
console.log(`  - Brand: ${lightBrand} (L = ${getRelativeLuminance(lightBrand).toFixed(4)})`);
console.log(`  - Lens Composite: ${toHex(lensOnGlassLight)} (L = ${getRelativeLuminance(lensOnGlassLight).toFixed(4)})`);
console.log(`  - Contrast Ratio on Composite Lens: ${crLightBrandVsLensComposite.toFixed(2)}:1`);
console.log(`  - Contrast Ratio on Pure White: ${crLightBrandVsPureWhite.toFixed(2)}:1`);
console.log(`  - WCAG Graphical/UI (>= 3.0:1): ${crLightBrandVsLensComposite >= 3.0 ? 'PASS' : 'FAIL'}`);
console.log(`  - WCAG Body Text (>= 4.5:1): ${crLightBrandVsLensComposite >= 4.5 ? 'PASS' : 'FAIL'}`);

// ---------------------------------------------------------------------------
// TASK 4: WCAG AA / AAA Contrast of textPrimary & textSecondary against BG & Surface
// ---------------------------------------------------------------------------
console.log('\n>>> [TASK 4] WCAG AA/AAA Contrast of textPrimary and textSecondary');

function evaluateTextContrast(name, fg, bg) {
  const cr = getContrastRatio(fg, bg);
  const passAANormal = cr >= 4.5;
  const passAALarge = cr >= 3.0;
  const passAAANormal = cr >= 7.0;
  const passAAALarge = cr >= 4.5;

  let status = 'FAIL';
  if (passAAANormal) status = 'AAA (Normal & Large)';
  else if (passAANormal) status = 'AA (Normal & Large) / AAA (Large)';
  else if (passAALarge) status = 'AA (Large only)';

  return {
    name,
    fg,
    bg,
    contrastRatio: cr,
    passAANormal,
    passAALarge,
    passAAANormal,
    status,
  };
}

const textPairs = [
  // Light Mode
  evaluateTextContrast('Light: textPrimary on background', lightColors.textPrimary, lightColors.background),
  evaluateTextContrast('Light: textPrimary on surface', lightColors.textPrimary, lightColors.surface),
  evaluateTextContrast('Light: textSecondary on background', lightColors.textSecondary, lightColors.background),
  evaluateTextContrast('Light: textSecondary on surface', lightColors.textSecondary, lightColors.surface),

  // Dark Mode
  evaluateTextContrast('Dark: textPrimary on background', darkColors.textPrimary, darkColors.background),
  evaluateTextContrast('Dark: textPrimary on surface', darkColors.textPrimary, darkColors.surface),
  evaluateTextContrast('Dark: textSecondary on background', darkColors.textSecondary, darkColors.background),
  evaluateTextContrast('Dark: textSecondary on surface', darkColors.textSecondary, darkColors.surface),

  // Extended Token Pairs
  evaluateTextContrast('Light: textOnBrand on brand', lightColors.textOnBrand, lightColors.brand),
  evaluateTextContrast('Dark: textOnBrand on brand', darkColors.textOnBrand, darkColors.brand),
  evaluateTextContrast('Light: energyText on energySurface', lightColors.energyText, lightColors.energySurface),
  evaluateTextContrast('Dark: energyText on energySurface', darkColors.energyText, darkColors.energySurface),
  evaluateTextContrast('Light: energyPlusCardText on energyPlusCardBg', lightColors.energyPlusCardText, lightColors.energyPlusCardBg),
  evaluateTextContrast('Dark: energyPlusCardText on energyPlusCardBg', darkColors.energyPlusCardText, darkColors.energyPlusCardBg),
];

testResults.task4 = textPairs;

console.table(
  textPairs.map((p) => ({
    'Test Pair': p.name,
    FG: p.fg,
    BG: p.bg,
    'Contrast Ratio': `${p.contrastRatio.toFixed(2)}:1`,
    'WCAG Status': p.status,
  }))
);

// ---------------------------------------------------------------------------
// TASK 5: White-on-White / Black-on-Black Verification in UI Primitives
// ---------------------------------------------------------------------------
console.log('\n>>> [TASK 5] Adversarial Verification of White-on-White / Black-on-Black Collisions');

const collisions = [];

function checkCollision(component, state, fgToken, bgToken, fgColor, bgColor) {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);

  // If background is semi-transparent, composite over typical base
  const effBg = bg.a < 1 ? compositeColor(bg, '#FFFFFF') : bg;
  const effFg = fg.a < 1 ? compositeColor(fg, effBg) : fg;

  const cr = getContrastRatio(effFg, effBg);

  // Collision detected if contrast ratio is lower than 2.0:1 (unreadable / invisible)
  const isCollision = cr < 2.0;

  if (isCollision) {
    collisions.push({
      component,
      state,
      fgToken,
      bgToken,
      fgColor,
      bgColor,
      cr: cr.toFixed(2),
    });
  }

  return {
    component,
    state,
    fgToken,
    bgToken,
    fgColor,
    bgColor,
    contrastRatio: cr,
    safe: !isCollision,
  };
}

const componentChecks = [];

// 1. SelectableChip
// Selected: bg = brand, fg = textOnBrand
// Unselected: bg = surfaceMuted, fg = textPrimary
for (const [themeName, tColors] of [['Light', lightColors], ['Dark', darkColors]]) {
  componentChecks.push(
    checkCollision('SelectableChip', `${themeName} - Selected`, 'textOnBrand', 'brand', tColors.textOnBrand, tColors.brand),
    checkCollision('SelectableChip', `${themeName} - Unselected`, 'textPrimary', 'surfaceMuted', tColors.textPrimary, tColors.surfaceMuted)
  );
}

// 2. Button
// Primary: bg = brand, fg = textOnBrand
// Secondary: bg = surface, fg = textPrimary
// Ghost: bg = transparent, fg = brand
// Danger: bg = surface, fg = danger
for (const [themeName, tColors] of [['Light', lightColors], ['Dark', darkColors]]) {
  componentChecks.push(
    checkCollision('Button', `${themeName} - Primary`, 'textOnBrand', 'brand', tColors.textOnBrand, tColors.brand),
    checkCollision('Button', `${themeName} - Secondary`, 'textPrimary', 'surface', tColors.textPrimary, tColors.surface),
    checkCollision('Button', `${themeName} - Ghost on Surface`, 'brand', 'surface', tColors.brand, tColors.surface),
    checkCollision('Button', `${themeName} - Danger`, 'danger', 'surface', tColors.danger, tColors.surface),
    // Pressed states
    checkCollision('Button', `${themeName} - Primary Pressed`, 'textOnBrand', 'brandPressed', tColors.textOnBrand, tColors.brandPressed),
    checkCollision('Button', `${themeName} - Secondary Pressed`, 'textPrimary', 'surfaceMuted', tColors.textPrimary, tColors.surfaceMuted)
  );
}

// 3. TextField
// input: bg = surface, color = textPrimary, placeholder = textSecondary
// label: textSecondary on background/surface
// error: danger on background/surface
// helper: textSecondary on background/surface
for (const [themeName, tColors] of [['Light', lightColors], ['Dark', darkColors]]) {
  componentChecks.push(
    checkCollision('TextField', `${themeName} - Input text`, 'textPrimary', 'surface', tColors.textPrimary, tColors.surface),
    checkCollision('TextField', `${themeName} - Placeholder`, 'textSecondary', 'surface', tColors.textSecondary, tColors.surface),
    checkCollision('TextField', `${themeName} - Label on Surface`, 'textSecondary', 'surface', tColors.textSecondary, tColors.surface),
    checkCollision('TextField', `${themeName} - Error on Surface`, 'danger', 'surface', tColors.danger, tColors.surface)
  );
}

// 4. MessageBubble
// Outgoing: bg = brand, text = textOnBrand, time = textOnBrand
// Incoming: bg = surface, text = textPrimary, time = textSecondary
// System: textSecondary on background
// Disclaimer: textSecondary on background
// Like Sticker: circle = brand, heart = textOnBrand
for (const [themeName, tColors] of [['Light', lightColors], ['Dark', darkColors]]) {
  componentChecks.push(
    checkCollision('MessageBubble', `${themeName} - Outgoing text`, 'textOnBrand', 'brand', tColors.textOnBrand, tColors.brand),
    checkCollision('MessageBubble', `${themeName} - Incoming text`, 'textPrimary', 'surface', tColors.textPrimary, tColors.surface),
    checkCollision('MessageBubble', `${themeName} - Incoming time`, 'textSecondary', 'surface', tColors.textSecondary, tColors.surface),
    checkCollision('MessageBubble', `${themeName} - System text on BG`, 'textSecondary', 'background', tColors.textSecondary, tColors.background),
    checkCollision('MessageBubble', `${themeName} - Like Sticker Heart`, 'textOnBrand', 'brand', tColors.textOnBrand, tColors.brand)
  );
}

// 5. AppText
// Direct usage with background / surface
for (const [themeName, tColors] of [['Light', lightColors], ['Dark', darkColors]]) {
  componentChecks.push(
    checkCollision('AppText', `${themeName} - textPrimary on BG`, 'textPrimary', 'background', tColors.textPrimary, tColors.background),
    checkCollision('AppText', `${themeName} - textSecondary on BG`, 'textSecondary', 'background', tColors.textSecondary, tColors.background),
    checkCollision('AppText', `${themeName} - textPrimary on Surface`, 'textPrimary', 'surface', tColors.textPrimary, tColors.surface),
    checkCollision('AppText', `${themeName} - textSecondary on Surface`, 'textSecondary', 'surface', tColors.textSecondary, tColors.surface)
  );
}

testResults.task5 = {
  totalChecks: componentChecks.length,
  collisionCount: collisions.length,
  collisions,
};

console.log(`• Total component color pairs evaluated: ${componentChecks.length}`);
console.log(`• Collisions found (CR < 2.0:1): ${collisions.length}`);
if (collisions.length > 0) {
  console.error('❌ CRITICAL COLLISIONS DETECTED:');
  console.table(collisions);
} else {
  console.log('✓ ZERO white-on-white or black-on-black collisions found across all 5 primitives!');
}

// Write JSON artifact for handoff and report
fs.writeFileSync(
  path.resolve('./scratch/contrast-verification-results.json'),
  JSON.stringify(testResults, null, 2),
  'utf8'
);

console.log('\nResults written to ./scratch/contrast-verification-results.json');
console.log('='.repeat(78));
