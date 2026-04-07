const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sonali\\OneDrive\\Desktop\\openlesson\\frontend\\src\\pages\\student';

const files = fs.readdirSync(dir);
console.log('Files in directory:', files);

files.forEach(file => {
  if (file.endsWith(' .jsx')) {
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, file.replace(' .jsx', '.jsx'));
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: "${file}" -> "${path.basename(newPath)}"`);
    } catch (err) {
      console.error(`Error renaming "${file}": ${err.message}`);
    }
  } else if (file === 'Myteachers .jsx') {
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, 'Myteachers.jsx');
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: "${file}" -> "Myteachers.jsx"`);
      } catch (err) {
        console.error(`Error renaming "${file}": ${err.message}`);
      }
  }
});
