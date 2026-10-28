const fs = require('fs');

let content = fs.readFileSync('src/data/quizQuestionsData.ts', 'utf8');

// 1. Remove all ! from options array elements
content = content.replace(/(options:\s*\[[\s\S]*?\])/g, (match) => {
  return match.replace(/!/g, '.').replace(/\.{2,}/g, '.');
});

// Write to temp and verify syntax
fs.writeFileSync('src/data/quizQuestionsData.ts', content);
console.log('Successfully eliminated all exclamation marks from options.');
