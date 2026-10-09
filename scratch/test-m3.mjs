import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Starting Milestone 3 Verification Test Suite ---');

const ROOT_DIR = process.cwd();

// 1. Owned files inventory for M3
const screenLayoutsAndRoutes = [
  'src/app/(onboarding)/_layout.tsx',
  'src/app/(onboarding)/welcome.tsx',
  'src/app/(onboarding)/age.tsx',
  'src/app/(onboarding)/verify.tsx',
  'src/app/(onboarding)/disclosure.tsx',
  'src/components/onboarding/onboarding-layout.tsx',
  'src/app/(app)/_layout.tsx',
  'src/app/(app)/(tabs)/_layout.tsx',
  'src/app/(app)/(tabs)/index.tsx',
  'src/app/(app)/(tabs)/chats.tsx',
  'src/app/(app)/character/[id].tsx',
  'src/app/legal/[doc].tsx',
  'src/app/+not-found.tsx',
  'src/app/+html.tsx',
];

const chatFiles = [
  'src/app/(app)/chat/[id].tsx',
  'src/components/chat/composer.tsx',
  'src/components/chat/message-bubble.tsx',
  'src/components/chat/typing-indicator.tsx',
];

const energyFiles = [
  'src/app/(app)/energy.tsx',
  'src/components/energy/balance-card.tsx',
  'src/components/energy/energy-chip.tsx',
  'src/components/energy/energy-packages-list.tsx',
  'src/components/energy/energy-plus-card.tsx',
  'src/components/energy/insufficient-energy-sheet.tsx',
  'src/components/energy/waiting-characters.tsx',
];

const discoverAndLayoutFiles = [
  'src/components/layout/app-header.tsx',
  'src/components/layout/boot-screen.tsx',
  'src/components/brand-mark.tsx',
  'src/components/pwa/install-sheet.tsx',
  'src/components/discover/character-grid-card.tsx',
  'src/components/discover/filter-sheet.tsx',
  'src/components/discover/gender-selector.tsx',
];

const allDynamicComponents = [
  ...screenLayoutsAndRoutes.filter((f) => !f.endsWith('+html.tsx')),
  ...chatFiles,
  ...energyFiles,
  ...discoverAndLayoutFiles,
];

// Check existence & useTheme() usage in all dynamic component files
for (const relPath of allDynamicComponents) {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert(fs.existsSync(fullPath), `File must exist: ${relPath}`);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(
    content.includes("from '@/theme/use-theme'"),
    `${relPath} must import useTheme from '@/theme/use-theme'`
  );
  assert(
    content.includes('useTheme('),
    `${relPath} must invoke useTheme()`
  );
}
console.log(`✓ All ${allDynamicComponents.length} dynamic component files properly import and invoke useTheme()`);

// 2. Specific Screen Layouts & Routes assertions
const welcome = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(onboarding)/welcome.tsx'), 'utf8');
assert(welcome.includes('colors.fadeTransparent'), 'welcome.tsx must use colors.fadeTransparent');
assert(welcome.includes('colors.background'), 'welcome.tsx must use colors.background');

const age = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(onboarding)/age.tsx'), 'utf8');
assert(age.includes('colors.surfaceMuted'), 'age.tsx must use colors.surfaceMuted for privacyNote');

const verify = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(onboarding)/verify.tsx'), 'utf8');
assert(verify.includes('colors.brandSubtle'), 'verify.tsx must use colors.brandSubtle for demoNote');

const disclosure = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(onboarding)/disclosure.tsx'), 'utf8');
assert(disclosure.includes('colors.surface'), 'disclosure.tsx must use colors.surface for facts card');
assert(disclosure.includes('colors.border'), 'disclosure.tsx must use colors.border');
assert(disclosure.includes('colors.brandSubtle'), 'disclosure.tsx must use colors.brandSubtle for factIcon');

const onboardingLayout = fs.readFileSync(path.join(ROOT_DIR, 'src/components/onboarding/onboarding-layout.tsx'), 'utf8');
assert(onboardingLayout.includes('colors.background'), 'onboarding-layout.tsx must use colors.background');
assert(onboardingLayout.includes('colors.border'), 'onboarding-layout.tsx must use colors.border for progressTrack');

const appLayout = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/_layout.tsx'), 'utf8');
assert(appLayout.includes('contentStyle: { backgroundColor: colors.background }'), 'app _layout.tsx must set contentStyle');

const tabsLayout = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/(tabs)/_layout.tsx'), 'utf8');
assert(tabsLayout.includes('sceneStyle: { backgroundColor: colors.background }'), 'tabs _layout.tsx must set sceneStyle');

const discoverIndex = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/(tabs)/index.tsx'), 'utf8');
assert(discoverIndex.includes('colors.background'), 'index.tsx must use colors.background for safeArea');
assert(discoverIndex.includes('colors.brandSubtle'), 'index.tsx must use colors.brandSubtle for emptyIcon');

const chats = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/(tabs)/chats.tsx'), 'utf8');
assert(chats.includes('colors.background'), 'chats.tsx must use colors.background for safeArea');
assert(chats.includes('colors.surfaceMuted'), 'chats.tsx must use colors.surfaceMuted');
assert(chats.includes('colors.brandSubtle'), 'chats.tsx must use colors.brandSubtle for emptyIcon');
assert(chats.includes('ringColor={colors.surface}'), 'chats.tsx must use ringColor={colors.surface}');

const characterProfile = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/character/[id].tsx'), 'utf8');
assert(characterProfile.includes('colors.background'), 'character/[id].tsx must use colors.background');
assert(characterProfile.includes('borderTopColor: colors.border'), 'character/[id].tsx must use colors.border for stickyCta');
assert(characterProfile.includes('colors.brandSubtle'), 'character/[id].tsx must use colors.brandSubtle for aboutAi');
assert(characterProfile.includes('colors.surfaceMuted'), 'character/[id].tsx must use colors.surfaceMuted for photoWrapper');

const legal = fs.readFileSync(path.join(ROOT_DIR, 'src/app/legal/[doc].tsx'), 'utf8');
assert(legal.includes('colors.background'), 'legal/[doc].tsx must use colors.background');

const notFound = fs.readFileSync(path.join(ROOT_DIR, 'src/app/+not-found.tsx'), 'utf8');
assert(notFound.includes('colors.background'), '+not-found.tsx must use colors.background');

const html = fs.readFileSync(path.join(ROOT_DIR, 'src/app/+html.tsx'), 'utf8');
assert(html.includes('media="(prefers-color-scheme: light)"'), '+html.tsx must support light theme-color');
assert(html.includes('media="(prefers-color-scheme: dark)"'), '+html.tsx must support dark theme-color');
assert(html.includes('content="light dark"'), '+html.tsx must support color-scheme: light dark');
console.log('✓ All Screen Layouts & Routes requirements verified');

// 3. Chat components & screen assertions
const chatScreen = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/chat/[id].tsx'), 'utf8');
assert(chatScreen.includes('colors.background'), 'chat/[id].tsx must use colors.background');
assert(chatScreen.includes('borderBottomColor: colors.border'), 'chat/[id].tsx must use colors.border for header');
assert(chatScreen.includes('colors.surface'), 'chat/[id].tsx must use colors.surface for suggestions');
assert(chatScreen.includes('colors.brandSubtle'), 'chat/[id].tsx must use colors.brandSubtle for suggestionPressed');

const composer = fs.readFileSync(path.join(ROOT_DIR, 'src/components/chat/composer.tsx'), 'utf8');
assert(composer.includes('color: colors.textPrimary'), 'composer.tsx must use colors.textPrimary');
assert(composer.includes('placeholderTextColor={colors.textSecondary}'), 'composer.tsx must use placeholderTextColor={colors.textSecondary}');
assert(composer.includes('color={colors.textSecondary}'), 'composer.tsx must use colors.textSecondary for attach/mic');
assert(composer.includes('colors.brand'), 'composer.tsx must use colors.brand for sendButton');

const messageBubble = fs.readFileSync(path.join(ROOT_DIR, 'src/components/chat/message-bubble.tsx'), 'utf8');
assert(messageBubble.includes('colors.surface'), 'message-bubble.tsx must use colors.surface for incoming bubble');
assert(messageBubble.includes('colors.border'), 'message-bubble.tsx must use colors.border for incoming bubble');
assert(messageBubble.includes('colors.brand'), 'message-bubble.tsx must use colors.brand for outgoing bubble');

const typingIndicator = fs.readFileSync(path.join(ROOT_DIR, 'src/components/chat/typing-indicator.tsx'), 'utf8');
assert(typingIndicator.includes('colors.surface'), 'typing-indicator.tsx must use colors.surface for bubble');
assert(typingIndicator.includes('colors.border'), 'typing-indicator.tsx must use colors.border for bubble');
assert(typingIndicator.includes('colors.textSecondary'), 'typing-indicator.tsx must use colors.textSecondary for dots');
console.log('✓ All Chat components and screen requirements verified');

// 4. Energy components & screen assertions
const energyScreen = fs.readFileSync(path.join(ROOT_DIR, 'src/app/(app)/energy.tsx'), 'utf8');
assert(energyScreen.includes('colors.background'), 'energy.tsx must use colors.background for safeArea');
assert(!energyScreen.includes('ENERGY_CONFIG'), 'energy.tsx must not have unused ENERGY_CONFIG');

const balanceCard = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/balance-card.tsx'), 'utf8');
assert(balanceCard.includes('colors.surface'), 'balance-card.tsx must use colors.surface for card');
assert(balanceCard.includes('colors.cardBorderSubtle'), 'balance-card.tsx must use colors.cardBorderSubtle');
assert(balanceCard.includes('colors.energyTrackBg'), 'balance-card.tsx must use colors.energyTrackBg for track');
assert(balanceCard.includes('colors.brand'), 'balance-card.tsx must use colors.brand for fill');
assert(!balanceCard.includes('sizes'), 'balance-card.tsx must not have unused sizes import');

const energyChip = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/energy-chip.tsx'), 'utf8');
assert(energyChip.includes('colors.energySurface'), 'energy-chip.tsx must use colors.energySurface');
assert(energyChip.includes('colors.energyText'), 'energy-chip.tsx must use colors.energyText');

const energyPackagesList = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/energy-packages-list.tsx'), 'utf8');
assert(energyPackagesList.includes('colors.surface'), 'energy-packages-list.tsx must use colors.surface');
assert(energyPackagesList.includes('colors.energyPlusCardBg'), 'energy-packages-list.tsx must use colors.energyPlusCardBg');
assert(energyPackagesList.includes('colors.energyPlusCardText'), 'energy-packages-list.tsx must use colors.energyPlusCardText');
assert(energyPackagesList.includes('colors.energyPlusBadgeBg'), 'energy-packages-list.tsx must use colors.energyPlusBadgeBg');
assert(energyPackagesList.includes('colors.energyPlusBadgeText'), 'energy-packages-list.tsx must use colors.energyPlusBadgeText');
assert(energyPackagesList.includes('colors.cardBorderSubtle'), 'energy-packages-list.tsx must use colors.cardBorderSubtle');
assert(energyPackagesList.includes('colors.border'), 'energy-packages-list.tsx must use colors.border');

const energyPlusCard = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/energy-plus-card.tsx'), 'utf8');
assert(energyPlusCard.includes('colors.energyPlusCardBg'), 'energy-plus-card.tsx must use colors.energyPlusCardBg');
assert(energyPlusCard.includes('colors.energyPlusCardBorder'), 'energy-plus-card.tsx must use colors.energyPlusCardBorder');
assert(energyPlusCard.includes('colors.energyPlusCardText'), 'energy-plus-card.tsx must use colors.energyPlusCardText');
assert(energyPlusCard.includes('colors.energyPlusBadgeBg'), 'energy-plus-card.tsx must use colors.energyPlusBadgeBg');
assert(energyPlusCard.includes('colors.energyPlusBadgeText'), 'energy-plus-card.tsx must use colors.energyPlusBadgeText');
assert(energyPlusCard.includes('colors.brand'), 'energy-plus-card.tsx must use colors.brand');

const insufficientSheet = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/insufficient-energy-sheet.tsx'), 'utf8');
assert(insufficientSheet.includes('colors.energyPlusCardBg'), 'insufficient-energy-sheet.tsx must use colors.energyPlusCardBg');
assert(insufficientSheet.includes('colors.energyPlusCardBorder'), 'insufficient-energy-sheet.tsx must use colors.energyPlusCardBorder');
assert(insufficientSheet.includes('colors.energyPlusCardText'), 'insufficient-energy-sheet.tsx must use colors.energyPlusCardText');
assert(insufficientSheet.includes('colors.surface'), 'insufficient-energy-sheet.tsx must use colors.surface');
assert(insufficientSheet.includes('colors.border'), 'insufficient-energy-sheet.tsx must use colors.border');
assert(insufficientSheet.includes('colors.textSecondary'), 'insufficient-energy-sheet.tsx must use colors.textSecondary');

const waitingCharacters = fs.readFileSync(path.join(ROOT_DIR, 'src/components/energy/waiting-characters.tsx'), 'utf8');
assert(waitingCharacters.includes('colors.surface'), 'waiting-characters.tsx must use colors.surface');
assert(waitingCharacters.includes('colors.cardBorderSubtle'), 'waiting-characters.tsx must use colors.cardBorderSubtle');
assert(waitingCharacters.includes('ringColor={colors.surface}'), 'waiting-characters.tsx must use ringColor={colors.surface}');
console.log('✓ All Energy components and screen requirements verified');

// 5. Discover & Layout components assertions
const appHeader = fs.readFileSync(path.join(ROOT_DIR, 'src/components/layout/app-header.tsx'), 'utf8');
assert(appHeader.includes('colors.background'), 'app-header.tsx must use colors.background');

const bootScreen = fs.readFileSync(path.join(ROOT_DIR, 'src/components/layout/boot-screen.tsx'), 'utf8');
assert(bootScreen.includes('colors.background'), 'boot-screen.tsx must use colors.background');
assert(bootScreen.includes('colors.brand'), 'boot-screen.tsx must use colors.brand');

const brandMark = fs.readFileSync(path.join(ROOT_DIR, 'src/components/brand-mark.tsx'), 'utf8');
assert(brandMark.includes('colors.surface'), 'brand-mark.tsx must use colors.surface');
assert(brandMark.includes('colors.brand'), 'brand-mark.tsx must use colors.brand');

const installSheet = fs.readFileSync(path.join(ROOT_DIR, 'src/components/pwa/install-sheet.tsx'), 'utf8');
assert(installSheet.includes('colors.surfaceMuted'), 'install-sheet.tsx must use colors.surfaceMuted');
assert(installSheet.includes('colors.brandSubtle'), 'install-sheet.tsx must use colors.brandSubtle');

const characterGridCard = fs.readFileSync(path.join(ROOT_DIR, 'src/components/discover/character-grid-card.tsx'), 'utf8');
assert(characterGridCard.includes('colors.surfaceMuted'), 'character-grid-card.tsx must use colors.surfaceMuted');

const filterSheet = fs.readFileSync(path.join(ROOT_DIR, 'src/components/discover/filter-sheet.tsx'), 'utf8');
assert(filterSheet.includes('trackColor={{ true: colors.brand, false: colors.border }}'), 'filter-sheet.tsx must set Switch trackColor');

const genderSelector = fs.readFileSync(path.join(ROOT_DIR, 'src/components/discover/gender-selector.tsx'), 'utf8');
assert(genderSelector.includes('colors.surfaceMuted'), 'gender-selector.tsx must use colors.surfaceMuted');
assert(genderSelector.includes('colors.brandSubtle'), 'gender-selector.tsx must use colors.brandSubtle');
assert(genderSelector.includes('colors.brand'), 'gender-selector.tsx must use colors.brand');
console.log('✓ All Discover & Layout components requirements verified');

console.log('\n--- ALL MILESTONE 3 PROGRAMMATIC ASSERTIONS PASSED! ---');
