/**
 * Fix asset paths in templates and blog
 * Changes ../ to / for absolute paths
 */

const fs = require('fs');
const path = require('path');

// Fix template files
const templatesDir = './src/templates';
const templates = ['index.html', 'contact.html', 'store.html', 'quiz.html'];

templates.forEach(template => {
  const filePath = path.join(templatesDir, template);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${template} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all ../styles/ with /styles/
  content = content.replace(/\.\.\/(styles|scripts|images|fonts|components)\//g, '/$1/');
  
  // Replace ../favicon with /favicon
  content = content.replace(/\.\.\/favicon/g, '/favicon');
  content = content.replace(/\.\.\/apple-touch-icon/g, '/apple-touch-icon');
  
  // Remove i18n.js script tag if it exists (not needed in new system)
  content = content.replace(/<script src="[^"]*i18n\.js"><\/script>\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed paths in ${template}`);
});

// Fix blog files
const blogDir = './src/blog';
const blogFiles = ['index.html', 'hair-loss-guide.html'];

console.log('\nFixing blog files...');
blogFiles.forEach(file => {
  const filePath = path.join(blogDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all ../styles/ and ../../styles/ with /styles/
  content = content.replace(/\.\.\/(\.\.\/)??(styles|scripts|images|fonts|components)\//g, '/$2/');
  
  // Replace favicon paths
  content = content.replace(/\.\.\/(\.\.\/)?favicon/g, '/favicon');
  content = content.replace(/\.\.\/(\.\.\/)?apple-touch-icon/g, '/apple-touch-icon');
  
  // Remove i18n.js script tag
  content = content.replace(/<script src="[^"]*i18n\.js"><\/script>\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed paths in blog/${file}`);
});

console.log('\n✅ All paths fixed!');
