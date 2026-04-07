const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sonali\\OneDrive\\Desktop\\openlesson\\frontend\\src\\pages\\student';

// Final desperate deletion of anything with spaces
const files = fs.readdirSync(dir);
files.forEach(f => {
    if (f.includes(' ')) {
        try { fs.unlinkSync(path.join(dir, f)); console.log('unlinked space file', f); } catch(e) {}
    }
});

// Rename Myteachers.jsx to MyTeachers.jsx (forcefully)
const oldPath = path.join(dir, 'Myteachers.jsx');
const newPath = path.join(dir, 'MyTeachers.jsx');
if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath + '.tmp'); // intermediate step
    fs.renameSync(newPath + '.tmp', newPath);
    console.log('Renamed Myteachers.jsx to MyTeachers.jsx');
}
