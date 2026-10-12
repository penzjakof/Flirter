#!/usr/bin/env node

/**
 * scripts/check-i18n-parity.mjs
 *
 * Перевірка 100% паритету ключів локалізації між еталоном (en.json)
 * та всіма підтримуваними мовами (uk, es, fr, de, zh, hi, ar, pt, ja).
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_LANG = 'en';
const TARGET_LANGS = ['uk', 'es', 'fr', 'de', 'zh', 'hi', 'ar', 'pt', 'ja'];
const TRANSLATIONS_DIR = resolve(__dirname, '../src/i18n/translations');

function loadJson(lang) {
  const filePath = resolve(TRANSLATIONS_DIR, `${lang}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Файл перекладу не знайдено: ${filePath}`);
  }
  const raw = readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Помилка парсингу JSON для ${lang}.json: ${err.message}`);
  }
}

/**
 * Рекурсивне сплющення об'єкта до списку dot-notation шляхів з їх значеннями.
 */
function flattenKeys(obj, prefix = '') {
  const result = new Map();

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenKeys(value, fullPath);
      for (const [nestedKey, nestedVal] of nested.entries()) {
        result.set(nestedKey, nestedVal);
      }
    } else {
      result.set(fullPath, value);
    }
  }

  return result;
}

/**
 * Пошук інтерполяційних параметрів i18next типу {{param}}
 */
function extractInterpolations(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.map(m => m.replace(/[{}]/g, '').trim()).sort() : [];
}

function runAudit() {
  console.log('='.repeat(70));
  console.log('🔍 i18n Key Parity Audit (Flirter 10-Language Architecture)');
  console.log('='.repeat(70));

  let baseData;
  try {
    baseData = loadJson(BASE_LANG);
  } catch (e) {
    console.error(`❌ Помилка завантаження базової мови (${BASE_LANG}):`, e.message);
    process.exit(1);
  }

  const baseMap = flattenKeys(baseData);
  const baseTotalKeys = baseMap.size;
  console.log(`📋 Еталон: ${BASE_LANG}.json (${baseTotalKeys} унікальних ключів)`);
  console.log(`🌐 Перевірка мов: ${TARGET_LANGS.join(', ')}\n`);

  let hasErrors = false;
  const summary = [];

  for (const lang of TARGET_LANGS) {
    let targetData;
    try {
      targetData = loadJson(lang);
    } catch (e) {
      console.error(`❌ [${lang}] Не вдалося завантажити: ${e.message}`);
      hasErrors = true;
      continue;
    }

    const targetMap = flattenKeys(targetData);
    const missingKeys = [];
    const extraKeys = [];
    const emptyKeys = [];
    const interpolationMismatches = [];

    // Перевірка на відсутні ключі та пусті значення
    for (const [key, baseVal] of baseMap.entries()) {
      if (!targetMap.has(key)) {
        missingKeys.push(key);
      } else {
        const targetVal = targetMap.get(key);
        if (targetVal === '' || targetVal === null || targetVal === undefined) {
          emptyKeys.push(key);
        }

        // Перевірка плейсхолдерів {{...}}
        if (typeof baseVal === 'string' && typeof targetVal === 'string') {
          const basePlaceholders = extractInterpolations(baseVal);
          const targetPlaceholders = extractInterpolations(targetVal);
          if (JSON.stringify(basePlaceholders) !== JSON.stringify(targetPlaceholders)) {
            interpolationMismatches.push({
              key,
              expected: basePlaceholders.join(', '),
              actual: targetPlaceholders.join(', '),
            });
          }
        }
      }
    }

    // Перевірка на зайві ключі
    for (const key of targetMap.keys()) {
      if (!baseMap.has(key)) {
        extraKeys.push(key);
      }
    }

    const isParity100 =
      missingKeys.length === 0 &&
      extraKeys.length === 0 &&
      emptyKeys.length === 0;

    summary.push({
      lang,
      totalKeys: targetMap.size,
      missing: missingKeys.length,
      extra: extraKeys.length,
      empty: emptyKeys.length,
      interpolationWarns: interpolationMismatches.length,
      parity: isParity100 && targetMap.size === baseTotalKeys,
    });

    if (!isParity100) {
      hasErrors = true;
      console.log(`❌ [${lang.toUpperCase()}] Порушення паритету:`);
      if (missingKeys.length > 0) {
        console.log(`   - Відсутні ключі (${missingKeys.length}):`);
        missingKeys.slice(0, 10).forEach(k => console.log(`     * ${k}`));
        if (missingKeys.length > 10) console.log(`     ... та ще ${missingKeys.length - 10}`);
      }
      if (extraKeys.length > 0) {
        console.log(`   - Зайві ключі (${extraKeys.length}):`);
        extraKeys.slice(0, 10).forEach(k => console.log(`     * ${k}`));
        if (extraKeys.length > 10) console.log(`     ... та ще ${extraKeys.length - 10}`);
      }
      if (emptyKeys.length > 0) {
        console.log(`   - Порожні значення (${emptyKeys.length}):`);
        emptyKeys.slice(0, 5).forEach(k => console.log(`     * ${k}`));
      }
    } else {
      console.log(`✅ [${lang.toUpperCase()}] 100% паритет (${targetMap.size}/${baseTotalKeys} ключів)`);
    }

    if (interpolationMismatches.length > 0) {
      console.log(`   ⚠️ [${lang.toUpperCase()}] Розбіжності інтерполяції ({{var}}):`);
      interpolationMismatches.forEach(m => {
        console.log(`     * ${m.key}: очікувалося [${m.expected}], отримано [${m.actual}]`);
      });
    }
  }

  console.log('\n' + '-'.repeat(70));
  console.log('ПІДСУМОК ПАРИТЕТУ:');
  console.log('-'.repeat(70));
  console.table(summary);

  if (hasErrors) {
    console.error('\n💥 АУДИТ ПРОВАЛЕНО: виявлено порушення паритету ключів локалізації.');
    process.exit(1);
  } else {
    console.log('\n🎉 Всі 10 мов мають 100% паритет ключів із en.json!');
    process.exit(0);
  }
}

runAudit();
