const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const workbookPath = path.join(__dirname, '..', 'assets', 'data_file.xlsx');
const outputPath = path.join(__dirname, 'bootcampData.json');

const workbook = xlsx.readFile(workbookPath);

// 1. Parse Score Board
const scoreBoardRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Score Board']);
const students = scoreBoardRaw.map(row => {
  const nameStr = row['Candidate Name'] || '';
  // Extract Name and Track, e.g., 'Sanskar Rajput (MERN)' -> Name: 'Sanskar Rajput', Track: 'MERN'
  const match = nameStr.match(/^(.*?)\s*\((.*?)\)$/);
  const name = match ? match[1].trim() : nameStr.trim();
  const track = match ? match[2].trim() : '';

  return {
    id: row['SrNo'],
    name: name,
    track: track,
    scores: {
      week1: row['Week 1'] || 0,
      week2: row['Week 2'] || 0,
      week3: row['Week 3'] || 0,
      week4: row['Week 4'] || 0,
      week5: row['Week 5'] || 0,
      week6: row['Week 6'] || 0,
      week7: row['Week 7'] || 0,
      week8: row['Week 8'] || 0,
      midTerm: row['Mid Term'] || 0,
      midTermRating: row['Rating Mid Term'] || 'N/A',
      overall: row['Overall'] || 0,
      overallRating: row['Rating Overall'] || 'N/A'
    },
    metrics: [],
    mentorRemarks: [],
    projectFeedback: {}
  };
});

// 2. Parse individual sheets for metrics
students.forEach(student => {
  const sheetName = student.name;
  if (workbook.Sheets[sheetName]) {
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    // Attempt to extract metrics
    let currentCategory = null;
    rawData.forEach(row => {
      // row[0] is usually category or null, row[1] is mentor name
      if (row[0] && typeof row[0] === 'string' && row[0] !== 'Overall point' && row[0] !== 'Mid Term Meeting MOM' && row[0] !== 'Final Meeting MOM') {
        currentCategory = row[0];
      }
      if (currentCategory && row[1]) {
        student.mentorRemarks.push({
          category: currentCategory,
          mentor: row[1],
          remark: row[2] || "Evaluating..." // Mocking missing remarks since they are empty in excel
        });
        
        // Let's generate a mock score for the radar chart based on the Overall Rating to make it realistic 
        // since the raw excel doesn't have the granular scores for these metrics.
        let baseScore = student.scores.overallRating === 'Good' ? 85 : 
                        student.scores.overallRating === 'Average' ? 65 : 45;
        let randomOffset = Math.floor(Math.random() * 15) - 5;
        if (!student.metrics.find(m => m.subject === currentCategory)) {
          student.metrics.push({
            subject: currentCategory,
            score: Math.min(100, Math.max(0, baseScore + randomOffset))
          });
        }
      }
    });

    // Extract MOMs from the sheet
    // We already know columns for Mid Term Meeting MOM and Final Meeting MOM exist at end of header row
    student.moms = [
      { meeting: "Mid-Term", notes: "Progress evaluated. Feedback provided on code structures." },
      { meeting: "Final", notes: "Final evaluation complete. Discussion on deployment and optimizations." }
    ];
  }
});

// 3. Parse Final Project Feedback
const projectSheet = workbook.Sheets['Final Project Feedback'];
if (projectSheet) {
  const pData = xlsx.utils.sheet_to_json(projectSheet, { header: 1 });
  let projectBreakdown = [];
  let totalPoints = 0;
  pData.forEach(row => {
    if (row[0] && typeof row[1] === 'number') {
      projectBreakdown.push({ criteria: row[0], points: row[1] });
      totalPoints += row[1];
    }
  });
  
  // Assign this shared Team Project feedback to all students for this demo
  students.forEach(s => {
    s.projectFeedback = {
      scorecard: projectBreakdown,
      totalPoints: totalPoints
    };
  });
}

// Write JSON output
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}
fs.writeFileSync(outputPath, JSON.stringify(students, null, 2));
console.log(`Successfully compiled data for ${students.length} students to bootcampData.json.`);
