import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Starting Milestone 2 Verification Test Suite ---');

const ROOT_DIR = process.cwd();

// 1. Verify AST / code patterns in all 11 owned files
const ownedFiles = [
  'src/components/ui/app-text.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/selectable-chip.tsx',
  'src/components/ui/text-field.tsx',
  'src/components/ui/bottom-sheet.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/option-group.tsx',
  'src/components/ui/icon-button.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/chip.tsx',
  'src/app/(app)/(tabs)/profile.tsx',
];

for (const relPath of ownedFiles) {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert(fs.existsSync(fullPath), `File must exist: ${relPath}`);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Must import useTheme from '@/theme/use-theme'
  assert(
    content.includes("from '@/theme/use-theme'"),
    `${relPath} must import useTheme from '@/theme/use-theme'`
  );
  // Must call useTheme()
  assert(
    content.includes('useTheme('),
    `${relPath} must invoke useTheme()`
  );
}
console.log('✓ All 11 files properly import and invoke useTheme()');

// 2. Verify SelectableChip critical fix (no white-on-white bug)
const chipCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/selectable-chip.tsx'), 'utf8');
assert(chipCode.includes('colors.brand'), 'SelectableChip must use colors.brand for selected background');
assert(chipCode.includes('colors.textOnBrand'), 'SelectableChip must use colors.textOnBrand for selected text');
assert(chipCode.includes('colors.surfaceMuted'), 'SelectableChip must use colors.surfaceMuted for unselected');
assert(chipCode.includes('colors.textPrimary'), 'SelectableChip must use colors.textPrimary for unselected text');
assert(!chipCode.includes('backgroundColor: colors.textPrimary'), 'SelectableChip MUST NOT set background to textPrimary (avoids white-on-white bug)');
console.log('✓ SelectableChip: Critical white-on-white bug successfully fixed');

// 3. Verify Button variants
const buttonCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/button.tsx'), 'utf8');
assert(buttonCode.includes('colors.brand'), 'Button must use colors.brand');
assert(buttonCode.includes('colors.brandPressed'), 'Button must use colors.brandPressed');
assert(buttonCode.includes('colors.surfaceMuted'), 'Button secondary/danger pressed must use colors.surfaceMuted');
assert(buttonCode.includes('colors.brandSubtle'), 'Button ghost pressed must use colors.brandSubtle');
console.log('✓ Button: Variants dynamic resolution verified');

// 4. Verify TextField dynamic colors
const fieldCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/text-field.tsx'), 'utf8');
assert(fieldCode.includes('backgroundColor: colors.surface'), 'TextField must set background to colors.surface');
assert(fieldCode.includes('color: colors.textPrimary'), 'TextField must set color to colors.textPrimary');
assert(fieldCode.includes('placeholderTextColor={colors.textSecondary}'), 'TextField must set placeholderTextColor to colors.textSecondary');
console.log('✓ TextField: Dynamic theming verified');

// 5. Verify BottomSheet dynamic colors
const sheetCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/bottom-sheet.tsx'), 'utf8');
assert(sheetCode.includes('backgroundColor: colors.overlay'), 'BottomSheet backdrop must use colors.overlay');
assert(sheetCode.includes('backgroundColor: colors.surface'), 'BottomSheet sheet must use colors.surface');
assert(sheetCode.includes('backgroundColor: colors.border'), 'BottomSheet handle must use colors.border');
console.log('✓ BottomSheet: Dynamic theming verified');

// 6. Verify Checkbox dynamic colors
const checkboxCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/checkbox.tsx'), 'utf8');
assert(checkboxCode.includes('checked ? colors.brand : colors.surface'), 'Checkbox must use brand/surface for background');
assert(checkboxCode.includes('checked ? colors.brand : colors.textSecondary'), 'Checkbox must use brand/textSecondary for border');
assert(checkboxCode.includes('color={colors.textOnBrand}'), 'Checkbox icon must use colors.textOnBrand');
console.log('✓ Checkbox: Dynamic theming verified');

// 7. Verify OptionGroup dynamic colors
const optionCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/option-group.tsx'), 'utf8');
assert(optionCode.includes('isSelected ? colors.brandSubtle : colors.surface'), 'OptionGroup background verified');
assert(optionCode.includes('isSelected ? colors.brand : colors.border'), 'OptionGroup border verified');
console.log('✓ OptionGroup: Dynamic theming verified');

// 8. Verify IconButton dynamic colors
const iconButtonCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/icon-button.tsx'), 'utf8');
assert(iconButtonCode.includes('color ?? colors.textPrimary'), 'IconButton default color verified');
assert(iconButtonCode.includes('backgroundColor: colors.surfaceMuted'), 'IconButton pressed background verified');
console.log('✓ IconButton: Dynamic theming verified');

// 9. Verify Avatar ring and placeholder
const avatarCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/avatar.tsx'), 'utf8');
assert(avatarCode.includes('backgroundColor: colors.surfaceMuted'), 'Avatar wrapper background verified');
assert(avatarCode.includes('colors.surface'), 'Avatar default ringColor verified');
console.log('✓ Avatar: Dynamic theming verified');

// 10. Verify Chip dynamic colors
const chipItemCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ui/chip.tsx'), 'utf8');
assert(chipItemCode.includes('neutral: colors.surfaceMuted'), 'Chip neutral background verified');
assert(chipItemCode.includes('brand: colors.brandSubtle'), 'Chip brand background verified');
console.log('✓ Chip: Dynamic theming verified');

// 11. Verify Profile Theme Switcher
const profileCode = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/(tabs)/profile.tsx'), 'utf8');
assert(profileCode.includes('title="Тема оформлення"'), 'Profile must have "Тема оформлення" section');
assert(profileCode.includes('Як у системі'), 'Profile must have "Як у системі" option');
assert(profileCode.includes('Світла'), 'Profile must have "Світла" option');
assert(profileCode.includes('Темна'), 'Profile must have "Темна" option');
assert(profileCode.includes('setMode(opt.mode)'), 'Profile must call setMode on selection');
assert(profileCode.includes('mode === opt.mode'), 'Profile must indicate active selection');
assert(profileCode.includes('backgroundColor: colors.background'), 'Profile safeArea background verified');
assert(profileCode.includes('backgroundColor: colors.surface'), 'Profile cards background verified');
assert(profileCode.includes('borderColor: colors.border'), 'Profile cards borderColor verified');
console.log('✓ Profile: Theme Switcher and surface adaptations verified');

console.log('\n--- ALL ASSERTIONS PASSED SUCCESSFULLY! ---');
