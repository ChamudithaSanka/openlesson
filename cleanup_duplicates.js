const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sonali\\OneDrive\\Desktop\\openlesson\\frontend\\src\\pages\\student';

// Files to delete exactly (including those with spaces or underscores)
const filesToDelete = [
  'Myteachers_.jsx',
  'Studentmaterials .jsx',
  'Studentquizzes .jsx',
  'Studentsessions .jsx'
];

console.log('--- Starting Cleanup ---');

filesToDelete.forEach(filename => {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted: "${filename}"`);
    } catch (err) {
      console.error(`Error deleting "${filename}":`, err.message);
    }
  } else {
    // Try listing the whole directory and matching by name to handle hidden/weird characters
    const actualFiles = fs.readdirSync(dir);
    const match = actualFiles.find(f => f.trim() === filename.trim() && f !== filename.trim());
    if (match) {
        try {
            fs.unlinkSync(path.join(dir, match));
            console.log(`Successfully deleted (via match): "${match}"`);
        } catch(e) {
            console.error(`Error deleting match "${match}":`, e.message);
        }
    } else {
        console.log(`File not found: "${filename}"`);
    }
  }
});

// Final check for any file ending in " .jsx" or "_.jsx" that shouldn't be there
const remainingFiles = fs.readdirSync(dir);
remainingFiles.forEach(f => {
    if (f.endsWith(' .jsx') || f === 'Myteachers_.jsx') {
        try {
            fs.unlinkSync(path.join(dir, f));
            console.log(`Cleanup deleted: "${f}"`);
        } catch(e) {}
    }
});

console.log('--- Cleanup Finished ---');
