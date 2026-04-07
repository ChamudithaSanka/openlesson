const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sonali\\OneDrive\\Desktop\\openlesson\\frontend\\src\\pages\\student';
const files = fs.readdirSync(dir);

console.log('Total files found:', files.length);

files.forEach((file) => {
  if (file.endsWith(' .jsx')) {
    const filePath = path.join(dir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: [${file}]`);
    } catch (err) {
      console.error(`Error deleting [${file}]: ${err.message}`);
    }
  }
});
