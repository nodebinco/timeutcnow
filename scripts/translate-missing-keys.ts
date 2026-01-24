import fs from 'fs';
import path from 'path';

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

// Basic translations for common keys (these are placeholders - should be properly translated)
const translations: Record<string, Record<string, string>> = {
  es: {
    about_us: "Acerca de nosotros",
    privacy_policy: "Política de privacidad",
    contact: "Contacto",
  },
  th: {
    contact_form_email_placeholder: "your.email@example.com", // Keep as is
    contact_github_title: "GitHub", // Keep as is
  },
  // Add more languages as needed
};

const languages = ['es', 'th', 'zh', 'hi', 'ar', 'pt', 'ru', 'ja', 'fr', 'de', 'it', 'ko', 'tr', 'vi', 'pl', 'nl', 'id'];

languages.forEach(lang => {
  const file = `messages/${lang}.json`;
  if (!fs.existsSync(file)) return;
  
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let updated = false;
  
  Object.keys(en).forEach(key => {
    // Only update if the value is still in English and matches en.json exactly
    if (data[key] === en[key] && (key.startsWith('about_') || key.startsWith('contact_') || key.startsWith('privacy_') || key.startsWith('converter_'))) {
      // Check if we have a translation for this key
      if (translations[lang] && translations[lang][key]) {
        data[key] = translations[lang][key];
        updated = true;
      }
    }
  });
  
  if (updated) {
    fs.writeFileSync(file, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log(`Updated ${lang}.json`);
  }
});

console.log('Note: This script only updates keys that have explicit translations.');
console.log('Most keys still need proper translation by native speakers.');
