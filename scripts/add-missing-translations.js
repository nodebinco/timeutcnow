const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const languages = ['ar', 'de', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];

languages.forEach(lang => {
  const file = `messages/${lang}.json`;
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${lang}.json - file not found`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let updated = false;
  const missingKeys = [];
  
  Object.keys(en).forEach(key => {
    if (!data[key]) {
      // Add missing key with English text as placeholder
      data[key] = en[key];
      missingKeys.push(key);
      updated = true;
    }
  });
  
  if (updated) {
    // Sort keys to match English file order (keep $schema first)
    const sorted = { $schema: data.$schema };
    Object.keys(en).forEach(key => {
      if (data[key]) {
        sorted[key] = data[key];
      }
    });
    
    fs.writeFileSync(file, JSON.stringify(sorted, null, '\t') + '\n', 'utf8');
    console.log(`✓ Updated ${lang}.json - added ${missingKeys.length} missing keys`);
  } else {
    console.log(`✓ ${lang}.json - all keys present`);
  }
});

console.log('\nNote: Missing keys have been added with English text as placeholders.');
console.log('Please have them properly translated by native speakers.');
