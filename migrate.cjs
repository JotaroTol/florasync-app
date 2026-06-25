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
files.push('./src/App.jsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Import replacements
  if (content.includes("import { useLiveQuery } from 'dexie-react-hooks';")) {
    content = content.replace("import { useLiveQuery } from 'dexie-react-hooks';", "import { useSupabaseQuery } from '../hooks/useSupabaseQuery';\nimport { db } from '../db';");
    // App.jsx is at root
    if (file.includes('App.jsx')) {
      content = content.replace("import { useSupabaseQuery } from '../hooks/useSupabaseQuery';", "import { useSupabaseQuery } from './hooks/useSupabaseQuery';");
    }
    changed = true;
  }
  
  // App.jsx liveUser
  if (content.includes("const liveUser = useLiveQuery(() => db.users.get(initialUser.id), [initialUser.id]) || initialUser;")) {
    content = content.replace(
      "const liveUser = useLiveQuery(() => db.users.get(initialUser.id), [initialUser.id]) || initialUser;", 
      "const liveUser = useSupabaseQuery('users', { eq: { id: initialUser.id } }, [initialUser.id], true) || initialUser;"
    );
    changed = true;
  }

  // toArray() without where
  content = content.replace(/useLiveQuery\(\(\) => db\.([a-zA-Z]+)\.toArray\(\)\)/g, "useSupabaseQuery('$1', {})");
  content = content.replace(/useLiveQuery\(\(\) => db\.([a-zA-Z]+)\.toArray\(\),\s*\[\]\)/g, "useSupabaseQuery('$1', {}, [])");

  // where('key').equals(val).toArray()
  content = content.replace(/useLiveQuery\(\(\) => db\.([a-zA-Z]+)\.where\('([^']+)'\)\.equals\(([^)]+)\)\.toArray\(\),\s*\[([^\]]+)\]\)/g, "useSupabaseQuery('$1', { eq: { $2: $3 } }, [$4])");

  // where('key').equals(val).first()
  content = content.replace(/useLiveQuery\(\(\) => db\.([a-zA-Z]+)\.where\('([^']+)'\)\.equals\(([^)]+)\)\.first\(\),\s*\[([^\]]+)\]\)/g, "useSupabaseQuery('$1', { eq: { $2: $3 } }, [$4], true)");

  // get(id)
  content = content.replace(/useLiveQuery\(\(\) => db\.([a-zA-Z]+)\.get\(([^)]+)\)\)/g, "useSupabaseQuery('$1', { eq: { id: $2 } }, [$2], true)");
  
  // Custom filter in PlantDetail.jsx
  if (content.includes(".filter(e => e.userId === user.id)")) {
    content = content.replace(
      "useLiveQuery(() => db.events.where('plantId').equals(plantId).filter(e => e.userId === user.id).toArray(), [plantId, user.id])",
      "useSupabaseQuery('events', { eq: { plantId: plantId, userId: user.id } }, [plantId, user.id])"
    );
    changed = true;
  }

  if (changed || content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
