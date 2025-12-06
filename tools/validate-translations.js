#!/usr/bin/env node
/**
 * Translation Validation Script
 * 
 * Ensures all translation keys exist in all language files.
 * Run before build to catch missing translations.
 * 
 * Usage: node tools/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = './src/i18n';
const LANGUAGES = ['en', 'nl', 'de'];
const BASE_LANG = 'en'; // Reference language

console.log('🔍 Validating translations...\n');

// Load all translation files
const translations = {};
LANGUAGES.forEach(lang => {
  const filePath = path.join(I18N_DIR, `${lang}.json`);
  try {
    translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✓ Loaded ${lang}.json`);
  } catch (err) {
    console.error(`✗ Failed to load ${lang}.json:`, err.message);
    process.exit(1);
  }
});

/**
 * Get all keys from an object recursively
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Get value from nested object using dot notation
 */
function getValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Get all keys from base language
const baseKeys = getAllKeys(translations[BASE_LANG]);
console.log(`\n📋 Found ${baseKeys.length} keys in ${BASE_LANG}.json\n`);

// Check each language against base
let hasErrors = false;
let hasWarnings = false;

LANGUAGES.filter(lang => lang !== BASE_LANG).forEach(lang => {
  console.log(`\nChecking ${lang}.json against ${BASE_LANG}.json:`);
  
  const langKeys = getAllKeys(translations[lang]);
  
  // Find missing keys
  const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
  
  // Find extra keys (in target but not in base)
  const extraKeys = langKeys.filter(key => !baseKeys.includes(key));
  
  // Find empty translations
  const emptyKeys = langKeys.filter(key => {
    const value = getValue(translations[lang], key);
    return value === '' || value === null || value === undefined;
  });
  
  if (missingKeys.length === 0 && emptyKeys.length === 0) {
    console.log(`  ✅ All ${baseKeys.length} keys present`);
  }
  
  if (missingKeys.length > 0) {
    hasErrors = true;
    console.log(`  ❌ Missing ${missingKeys.length} keys:`);
    missingKeys.forEach(key => {
      const baseValue = getValue(translations[BASE_LANG], key);
      console.log(`     - ${key}`);
      console.log(`       English: "${baseValue}"`);
    });
  }
  
  if (emptyKeys.length > 0) {
    hasWarnings = true;
    console.log(`  ⚠️  Empty ${emptyKeys.length} keys:`);
    emptyKeys.forEach(key => {
      console.log(`     - ${key}`);
    });
  }
  
  if (extraKeys.length > 0) {
    console.log(`  ℹ️  Extra ${extraKeys.length} keys (not in ${BASE_LANG}):`);
    extraKeys.slice(0, 5).forEach(key => {
      console.log(`     - ${key}`);
    });
    if (extraKeys.length > 5) {
      console.log(`     ... and ${extraKeys.length - 5} more`);
    }
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Missing translations found!');
  console.log('   Add the missing keys to the language files before building.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('   Some translations are empty.');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED - All translations complete!');
  process.exit(0);
}
