const xlsx = require('xlsx');
const workbook = xlsx.readFile('src/assets/data_file.xlsx');

console.log('--- Sanskar Rajput (Raw) ---');
console.log(JSON.stringify(xlsx.utils.sheet_to_json(workbook.Sheets['Sanskar Rajput'], {header: 1}).slice(0, 10), null, 2));

console.log('--- Final Project Feedback (Raw) ---');
console.log(JSON.stringify(xlsx.utils.sheet_to_json(workbook.Sheets['Final Project Feedback'], {header: 1}), null, 2));
