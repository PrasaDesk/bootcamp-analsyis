const xlsx = require('xlsx');
const workbook = xlsx.readFile('src/assets/data_file.xlsx');
console.log('SHEETS:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
  console.log('--- ' + sheetName + ' ---');
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(data.slice(0, 3));
}
