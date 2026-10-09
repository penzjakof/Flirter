import fs from 'node:fs';
import path from 'node:path';

/**
 * CHALLENGER R2_1 INDEPENDENT ADVERSARIAL CONTRAST VERIFIER
 * Comprehensive Color Science, iOS Glass Physics & UI Collision Harness
 */

// 1. Precise WCAG 2.1 Parsing & Calculations
export function parseColor(color) {
  if (!color || typeof color !== 'string') {
    throw new Error(`Invalid color value: ${color}`);
  }
  const trimmed = color.trim();

  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
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

  const rgbaMatch = trimmed.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (rgbaMatch) {
    return {
      r: parseFloat(rgbaMatch[1]),
      g: parseFloat(rgbaMatch[2]),
      b: parseFloat(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  if (trimmed === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  throw new Error(`Unsupported color format: ${color}`);
}

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

export function getContrastRatio(c1, c2) {
  const L1 = getRelativeLuminance(c1);
  const L2 = getRelativeLuminance(c2);
  const brighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (brighter + 0.05) / (darker + 0.05);
}

// 2. Read live tokens directly from source
const tokensFile = fs.readFileSync(path.resolve('./src/theme/tokens.ts'), 'utf8');

function extractPalette(source, varName) {
  const regex = new RegExp(`export const ${varName}: ThemeColors = ({[\\s\\S]*?\\n});`);
  const match = source.match(regex);
  if (!match) throw new Error(`Could not find ${varName} in tokens.ts`);
  const objStr = match[1]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .trim()
    .replace(/;$/, '');
  return eval(`(${objStr})`);
}

const lightColors = extractPalette(tokensFile, 'lightColors');
const darkColors = extractPalette(tokensFile, 'darkColors');

console.log('='.repeat(80));
console.log('CHALLENGER R2_1: INDEPENDENT ADVERSARIAL CONTRAST AUDIT');
console.log('='.repeat(80));

const results = {
  requirement1_glassCapsule: {},
  requirement2_inactiveIconIOS: {},
  requirement3_benefitText: {},
  requirement4_componentCollisions: {
    totalChecked: 0,
    collisionsFound: 0,
    details: [],
  },
};

// ============================================================================
// REQUIREMENT 1: Glass Tab Bar Capsule Contrast
// Against pure black #000000 and dark background #121013
// ============================================================================
console.log('\n[R1] GLASS TAB BAR CAPSULE CONTRAST (Pure Black & Dark Background)');

const pureBlack = '#000000';
const darkThemeBg = darkColors.background; // #121013
const deepPurpleBg = '#281320'; // Energy card / gradient bottom
const deepChatBg = '#1C1820'; // Surface

const backgroundsToTest = [
  { name: 'Pure Black', hex: pureBlack },
  { name: 'Dark Theme Background', hex: darkThemeBg },
  { name: 'Deep Purple (Gradient Bottom)', hex: deepPurpleBg },
  { name: 'Dark Surface', hex: deepChatBg },
];

results.requirement1_glassCapsule = backgroundsToTest.map((bg) => {
  // 1. Android/Web fallback (0.88 white opacity)
  const compFallback = compositeColor(darkColors.glass, bg.hex);
  const crFallback = getContrastRatio(compFallback, bg.hex);
  
  // 2. Edge border contrast (outer 0.40 dark edge or 0.98 white border)
  const compBorder = compositeColor(darkColors.glassBorder, bg.hex);
  const crBorder = getContrastRatio(compBorder, bg.hex);

  // 3. iOS Worst-Case (no blur assumption, just 40% tint on black)
  const iosRawTint = compositeColor('rgba(255, 255, 255, 0.40)', bg.hex);
  const crIosRawTint = getContrastRatio(iosRawTint, bg.hex);

  // 4. iOS Realistic Material (systemMaterialLight baseline L=0.65 + 40% tint)
  const iosMaterialComp = compositeColor('rgba(255, 255, 255, 0.40)', '#A8A8A8');
  const crIosRealistic = getContrastRatio(iosMaterialComp, bg.hex);

  return {
    background: bg.name,
    bgHex: bg.hex,
    fallbackHex: toHex(compFallback),
    fallbackContrast: crFallback,
    fallbackPass: crFallback >= 3.0,
    borderContrast: crBorder,
    iosRawTintHex: toHex(iosRawTint),
    iosRawTintContrast: crIosRawTint,
    iosRealisticContrast: crIosRealistic,
  };
});

console.table(
  results.requirement1_glassCapsule.map((r) => ({
    'Background': r.background,
    'BG Hex': r.bgHex,
    'Fallback Color': r.fallbackHex,
    'Fallback CR': `${r.fallbackContrast.toFixed(2)}:1`,
    'WCAG UI (>=3.0)': r.fallbackPass ? 'PASS' : 'FAIL',
    'iOS Realistic CR': `${r.iosRealisticContrast.toFixed(2)}:1`,
    'iOS Raw 40% CR': `${r.iosRawTintContrast.toFixed(2)}:1`,
  }))
);

// ============================================================================
// REQUIREMENT 2: Inactive Icon Contrast on White Frosted Glass on iOS
// ============================================================================
console.log('\n[R2] INACTIVE ICON CONTRAST ON WHITE FROSTED GLASS (iOS & Fallback)');

const inactiveColor = darkColors.tabBarInactive; // #403644

// Test inactive color on top of the capsule across various underlying backdrops
const capsuleSurfaces = [
  { name: 'Capsule over Pure Black (#000000)', base: pureBlack, fg: darkColors.glass },
  { name: 'Capsule over Dark BG (#121013)', base: darkThemeBg, fg: darkColors.glass },
  { name: 'Capsule over Light BG (#FAF8F7)', base: lightColors.background, fg: lightColors.glass },
  { name: 'Pure White (#FFFFFF)', base: '#FFFFFF', fg: '#FFFFFF' },
  // iOS native glass variations:
  { name: 'iOS Glass (systemMaterialLight + 40% tint over black)', base: '#C8C8C8', fg: 'rgba(255, 255, 255, 0.40)' },
  { name: 'iOS Glass (worst-case raw 40% tint on black)', base: '#000000', fg: 'rgba(255, 255, 255, 0.40)' },
];

results.requirement2_inactiveIconIOS = capsuleSurfaces.map((s) => {
  const surfaceColor = s.fg === '#FFFFFF' ? { r: 255, g: 255, b: 255, a: 1 } : compositeColor(s.fg, s.base);
  const surfaceHex = toHex(surfaceColor);
  const cr = getContrastRatio(inactiveColor, surfaceColor);
  const passGraphic = cr >= 3.0; // SC 1.4.11
  const passTextAA = cr >= 4.5;  // SC 1.4.3 Level AA
  const passTextAAA = cr >= 7.0; // SC 1.4.3 Level AAA

  return {
    surfaceDesc: s.name,
    surfaceHex,
    inactiveColor,
    contrastRatio: cr,
    passGraphic,
    passTextAA,
    passTextAAA,
  };
});

console.table(
  results.requirement2_inactiveIconIOS.map((r) => ({
    'Glass Surface': r.surfaceDesc,
    'Surface Hex': r.surfaceHex,
    'Inactive Hex': r.inactiveColor,
    'Contrast Ratio': `${r.contrastRatio.toFixed(2)}:1`,
    'UI Graphic (>=3.0)': r.passGraphic ? 'PASS' : 'FAIL',
    'Text AA (>=4.5)': r.passTextAA ? 'PASS' : 'FAIL',
    'Text AAA (>=7.0)': r.passTextAAA ? 'PASS' : 'FAIL',
  }))
);

// ============================================================================
// REQUIREMENT 3: Contrast of benefitText in energy-plus-card.tsx in Dark Mode
// ============================================================================
console.log('\n[R3] ENERGY PLUS CARD: benefitText & FULL COMPONENT CONTRAST');

const energyCardBgDark = darkColors.energyPlusCardBg; // #281320
const energyCardBgLight = lightColors.energyPlusCardBg; // #FDF2F6

// Inspect actual file source of energy-plus-card.tsx
const cardFileContent = fs.readFileSync(path.resolve('./src/components/energy/energy-plus-card.tsx'), 'utf8');

// Verify that benefitText has NO hardcoded color in StyleSheet
const hasColorInBenefitText = /benefitText:\s*{[^}]*color:/g.test(cardFileContent);
console.log(`• StyleSheet.benefitText overrides color: ${hasColorInBenefitText ? 'YES (FAIL)' : 'NO (PASSED - delegates to AppText)'}`);

// benefitText delegates to AppText default (color="textPrimary")
const benefitTextDarkColor = darkColors.textPrimary; // #F6F3F7
const benefitTextLightColor = lightColors.textPrimary; // #211C24

const crBenefitDark = getContrastRatio(benefitTextDarkColor, energyCardBgDark);
const crBenefitLight = getContrastRatio(benefitTextLightColor, energyCardBgLight);

// Also check ALL elements inside EnergyPlusCard
const energyPlusElements = [
  {
    name: 'benefitText (AppText default: textPrimary)',
    darkFg: darkColors.textPrimary,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.textPrimary,
    lightBg: lightColors.energyPlusCardBg,
  },
  {
    name: 'benefitText nested bodyStrong (textPrimary)',
    darkFg: darkColors.textPrimary,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.textPrimary,
    lightBg: lightColors.energyPlusCardBg,
  },
  {
    name: 'title "Energy+" (energyPlusCardText)',
    darkFg: darkColors.energyPlusCardText,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.energyPlusCardText,
    lightBg: lightColors.energyPlusCardBg,
  },
  {
    name: 'badgeText "Найвигідніше" (energyPlusBadgeText on energyPlusBadgeBg)',
    darkFg: darkColors.energyPlusBadgeText,
    darkBg: darkColors.energyPlusBadgeBg,
    lightFg: lightColors.energyPlusBadgeText,
    lightBg: lightColors.energyPlusBadgeBg,
  },
  {
    name: 'price "149 ₴" (brand on energyPlusCardBg)',
    darkFg: darkColors.brand,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.brand,
    lightBg: lightColors.energyPlusCardBg,
  },
  {
    name: 'period "/ тиждень" (textSecondary on energyPlusCardBg)',
    darkFg: darkColors.textSecondary,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.textSecondary,
    lightBg: lightColors.energyPlusCardBg,
  },
  {
    name: 'iconBox flash/time icon (energyPlusCardText on energyPlusBadgeBg)',
    darkFg: darkColors.energyPlusCardText,
    darkBg: darkColors.energyPlusBadgeBg,
    lightFg: lightColors.energyPlusCardText,
    lightBg: lightColors.energyPlusBadgeBg,
  },
  {
    name: 'button label (textOnBrand on brand)',
    darkFg: darkColors.textOnBrand,
    darkBg: darkColors.brand,
    lightFg: lightColors.textOnBrand,
    lightBg: lightColors.brand,
  },
  {
    name: 'footnote (textSecondary on energyPlusCardBg)',
    darkFg: darkColors.textSecondary,
    darkBg: darkColors.energyPlusCardBg,
    lightFg: lightColors.textSecondary,
    lightBg: lightColors.energyPlusCardBg,
  },
];

results.requirement3_benefitText = energyPlusElements.map((elem) => {
  const darkCR = getContrastRatio(elem.darkFg, elem.darkBg);
  const lightCR = getContrastRatio(elem.lightFg, elem.lightBg);
  return {
    element: elem.name,
    darkFg: elem.darkFg,
    darkBg: elem.darkBg,
    darkCR,
    darkPassAA: darkCR >= 4.5,
    darkPassAAA: darkCR >= 7.0,
    lightFg: elem.lightFg,
    lightBg: elem.lightBg,
    lightCR,
    lightPassAA: lightCR >= 4.5,
    lightPassAAA: lightCR >= 7.0,
  };
});

console.table(
  results.requirement3_benefitText.map((r) => ({
    'Element': r.element,
    'Dark FG / BG': `${r.darkFg} / ${r.darkBg}`,
    'Dark CR': `${r.darkCR.toFixed(2)}:1`,
    'Dark AAA': r.darkPassAAA ? 'PASS' : (r.darkPassAA ? 'AA ONLY' : 'FAIL'),
    'Light FG / BG': `${r.lightFg} / ${r.lightBg}`,
    'Light CR': `${r.lightCR.toFixed(2)}:1`,
    'Light AAA': r.lightPassAAA ? 'PASS' : (r.lightPassAA ? 'AA ONLY' : 'FAIL'),
  }))
);

// ============================================================================
// REQUIREMENT 4: Comprehensive Collision Audit Across All UI Components
// 0 white-on-white and 0 dark-on-dark collisions
// ============================================================================
console.log('\n[R4] EXHAUSTIVE UI COMPONENT COLLISION AUDIT (0 COLLISIONS GOAL)');

const collisions = [];
let totalEvaluations = 0;

function evaluatePair(component, element, theme, fgColor, bgColor, minAllowedCR = 2.0) {
  totalEvaluations++;
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);

  const effBg = bg.a < 1 ? compositeColor(bg, theme === 'Dark' ? '#121013' : '#FAF8F7') : bg;
  const effFg = fg.a < 1 ? compositeColor(fg, effBg) : fg;

  const cr = getContrastRatio(effFg, effBg);
  const isCollision = cr < minAllowedCR;

  if (isCollision) {
    collisions.push({
      component,
      element,
      theme,
      fgColor,
      bgColor,
      cr: cr.toFixed(2),
    });
  }

  return {
    component,
    element,
    theme,
    fgHex: toHex(effFg),
    bgHex: toHex(effBg),
    cr,
    isCollision,
  };
}

// System-wide Component Scenarios
const componentScenarios = [
  // 1. AppText (variants against all backgrounds)
  { comp: 'AppText', el: 'textPrimary on background', fg: 'textPrimary', bg: 'background' },
  { comp: 'AppText', el: 'textPrimary on surface', fg: 'textPrimary', bg: 'surface' },
  { comp: 'AppText', el: 'textPrimary on surfaceMuted', fg: 'textPrimary', bg: 'surfaceMuted' },
  { comp: 'AppText', el: 'textSecondary on background', fg: 'textSecondary', bg: 'background' },
  { comp: 'AppText', el: 'textSecondary on surface', fg: 'textSecondary', bg: 'surface' },
  { comp: 'AppText', el: 'textSecondary on surfaceMuted', fg: 'textSecondary', bg: 'surfaceMuted' },

  // 2. Button (all 4 variants x 3 states)
  { comp: 'Button', el: 'primary default', fg: 'textOnBrand', bg: 'brand' },
  { comp: 'Button', el: 'primary pressed', fg: 'textOnBrand', bg: 'brandPressed' },
  { comp: 'Button', el: 'secondary default', fg: 'textPrimary', bg: 'surface' },
  { comp: 'Button', el: 'secondary pressed', fg: 'textPrimary', bg: 'surfaceMuted' },
  { comp: 'Button', el: 'ghost on background', fg: 'brand', bg: 'background' },
  { comp: 'Button', el: 'ghost on surface', fg: 'brand', bg: 'surface' },
  { comp: 'Button', el: 'danger default', fg: 'danger', bg: 'surface' },
  { comp: 'Button', el: 'danger pressed', fg: 'danger', bg: 'surfaceMuted' },

  // 3. SelectableChip
  { comp: 'SelectableChip', el: 'selected state', fg: 'textOnBrand', bg: 'brand' },
  { comp: 'SelectableChip', el: 'unselected state', fg: 'textPrimary', bg: 'surfaceMuted' },

  // 4. TextField
  { comp: 'TextField', el: 'input text', fg: 'textPrimary', bg: 'surface' },
  { comp: 'TextField', el: 'placeholder', fg: 'textSecondary', bg: 'surface' },
  { comp: 'TextField', el: 'label on background', fg: 'textSecondary', bg: 'background' },
  { comp: 'TextField', el: 'error text', fg: 'danger', bg: 'background' },
  { comp: 'TextField', el: 'helper text', fg: 'textSecondary', bg: 'background' },

  // 5. MessageBubble
  { comp: 'MessageBubble', el: 'outgoing body', fg: 'textOnBrand', bg: 'brand' },
  { comp: 'MessageBubble', el: 'outgoing time', fg: 'textOnBrand', bg: 'brand' },
  { comp: 'MessageBubble', el: 'incoming body', fg: 'textPrimary', bg: 'surface' },
  { comp: 'MessageBubble', el: 'incoming time', fg: 'textSecondary', bg: 'surface' },
  { comp: 'MessageBubble', el: 'system bubble', fg: 'textSecondary', bg: 'background' },
  { comp: 'MessageBubble', el: 'heart sticker', fg: 'textOnBrand', bg: 'brand' },

  // 6. Checkbox & OptionGroup
  { comp: 'Checkbox', el: 'checked checkmark', fg: 'textOnBrand', bg: 'brand' },
  { comp: 'Checkbox', el: 'unchecked box on surface', fg: 'border', bg: 'surface' },
  { comp: 'OptionGroup', el: 'selected card', fg: 'textPrimary', bg: 'surface' },
  { comp: 'OptionGroup', el: 'unselected card', fg: 'textSecondary', bg: 'surface' },

  // 7. BottomSheet & Modal
  { comp: 'BottomSheet', el: 'surface container', fg: 'textPrimary', bg: 'surface' },
  { comp: 'BottomSheet', el: 'overlay scrim on black', fg: 'overlay', bg: '#000000' },

  // 8. Energy Store Components
  { comp: 'EnergyHero', el: 'textOnPremiumMuted on premiumDeep', fg: 'textOnPremiumMuted', bg: 'premiumDeep' },
  { comp: 'EnergyHero', el: 'premiumGold on premiumDeep', fg: 'premiumGold', bg: 'premiumDeep' },
  { comp: 'BalanceCard', el: 'amount on surface', fg: 'textPrimary', bg: 'surface' },
  { comp: 'BalanceCard', el: 'out of max', fg: 'textSecondary', bg: 'surface' },
  { comp: 'BalanceCard', el: 'flash icon', fg: 'brand', bg: 'surface' },
  { comp: 'BalanceCard', el: 'track fill', fg: 'brand', bg: 'energyTrackBg' },

  // 9. Glass Tab Bar Navigation
  { comp: 'GlassTabBar', el: 'inactive icon on glass', fg: 'tabBarInactive', bg: 'glass' },
  { comp: 'GlassTabBar', el: 'active brand on lens', fg: 'brand', bg: 'glassLens' },
  { comp: 'GlassTabBar', el: 'badge text on brand', fg: 'textOnBrand', bg: 'brand' },
];

for (const sc of componentScenarios) {
  for (const theme of ['Light', 'Dark']) {
    const palette = theme === 'Dark' ? darkColors : lightColors;
    const fgVal = palette[sc.fg] || sc.fg;
    const bgVal = palette[sc.bg] || sc.bg;
    evaluatePair(sc.comp, sc.el, theme, fgVal, bgVal);
  }
}

results.requirement4_componentCollisions.totalChecked = totalEvaluations;
results.requirement4_componentCollisions.collisionsFound = collisions.length;
results.requirement4_componentCollisions.details = collisions;

console.log(`• Total UI pairs evaluated: ${totalEvaluations}`);
console.log(`• Collisions detected (CR < 2.0:1): ${collisions.length}`);

if (collisions.length > 0) {
  console.error('❌ ADVERSARIAL FAIL: Collisions detected:');
  console.table(collisions);
} else {
  console.log('✓ ADVERSARIAL PASS: Zero white-on-white and zero dark-on-dark collisions verified!');
}

// 5. Write Artifacts
fs.writeFileSync(
  path.resolve('./scratch/challenger-contrast-verification-results.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

console.log('\nVerification results written to ./scratch/challenger-contrast-verification-results.json');
console.log('='.repeat(80));

process.exit(collisions.length === 0 ? 0 : 1);
