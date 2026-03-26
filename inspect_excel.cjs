const xlsx = require('xlsx');
const workbook = xlsx.readFile('src/assets/data_file.xlsx');

console.log('--- Sanskar Rajput (Full) ---');
console.log(JSON.stringify(xlsx.utils.sheet_to_json(workbook.Sheets['Sanskar Rajput']), null, 2));

console.log('--- Final Project Feedback (Full) ---');
console.log(JSON.stringify(xlsx.utils.sheet_to_json(workbook.Sheets['Final Project Feedback']), null, 2));
