/* Check solid semantic text pairs. Photo/glass backgrounds and disabled controls need separate visual QA. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync('src/theme/tokens.ts', 'utf8');
const results = [];
function luminance(hex) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
for (const theme of ['light', 'dark']) {
  const block = source.split(`export const ${theme}Colors: ThemeColors = {`)[1].split('\n};')[0];
  const colors = Object.fromEntries([...block.matchAll(/(\w+): '(#[a-fA-F0-9]{6})'/g)].map(match => [match[1], match[2]]));
  const pairs = [
    ...['background', 'surface', 'surfaceMuted'].flatMap(background => ['textPrimary', 'textSecondary', 'brandText'].map(text => [text, background])),
    ['textOnBrand', 'brand'], ['textOnBrand', 'brandPressed'], ['energyText', 'energySurface'],
    ['energyPlusCardText', 'energyPlusCardBg'], ['energyPlusBadgeText', 'energyPlusBadgeBg'],
  ];
  for (const [foreground, background] of pairs) {
    const levels = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => a - b);
    const ratio = (levels[1] + 0.05) / (levels[0] + 0.05);
    results.push({ theme, foreground, background, ratio: Number(ratio.toFixed(3)), status: ratio >= 4.5 ? 'passed' : 'failed' });
  }
}
const output = path.resolve('Codex/frontend-audit'); fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'contrast-results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
for (const result of results) assert.equal(result.status, 'passed', `${result.theme}: ${result.foreground}/${result.background} = ${result.ratio}:1`);
console.log(`${results.length}/${results.length} solid text pairs meet 4.5:1.`);
