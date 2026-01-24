#!/usr/bin/env node
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const languages = ['es', 'th', 'zh', 'hi', 'ar', 'pt', 'ru', 'ja', 'fr', 'de', 'it', 'ko', 'tr', 'vi', 'pl', 'nl', 'id'];

console.log('Translation Completeness Report');
console.log('================================\n');

languages.forEach(lang => {
  const file = `messages/${lang}.json`;
  if (!fs.existsSync(file)) {
    console.log(`❌ ${lang}: File not found`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keysToCheck = Object.keys(en).filter(k => 
    k.startsWith('about_') || 
    k.startsWith('contact_') || 
    k.startsWith('privacy_') || 
    k.startsWith('converter_')
  );
  
  const stillEnglish = keysToCheck.filter(k => data[k] === en[k]);
  const translated = keysToCheck.length - stillEnglish.length;
  const percentage = Math.round(translated / keysToCheck.length * 100);
  
  const status = percentage === 100 ? '✅' : percentage >= 90 ? '⚠️' : '❌';
  console.log(`${status} ${lang}: ${translated}/${keysToCheck.length} (${percentage}%)`);
});

console.log('\nNote: Keys that match English exactly are considered untranslated.');
console.log('Some keys (like "GitHub", email placeholders) may intentionally stay in English.');
