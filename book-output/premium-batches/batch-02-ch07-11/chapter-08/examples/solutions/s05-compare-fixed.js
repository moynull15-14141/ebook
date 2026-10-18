const saved = 'Sara Ahmed';
const typed = '  sara ahmed ';
const clean = (text) => text.trim().toLowerCase();

console.log(clean(saved) === clean(typed));
