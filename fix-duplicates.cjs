const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match any variation of duplicate imports
  const lines = content.split('\n');
  const uniqueLines = [];
  let dbImportSeen = false;
  
  lines.forEach(line => {
    if (line.includes("import { db } from '../db';")) {
      if (!dbImportSeen) {
        uniqueLines.push(line);
        dbImportSeen = true;
      }
    } else if (line.includes('import { db } from "../db";')) {
      if (!dbImportSeen) {
        uniqueLines.push(line);
        dbImportSeen = true;
      }
    } else {
      uniqueLines.push(line);
    }
  });
  
  const newContent = uniqueLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed duplicate db in', file);
  }
});
