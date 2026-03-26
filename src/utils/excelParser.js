import * as XLSX from 'xlsx';

export const parseExcelWorkbook = (workbook) => {
  // 1. Parse Score Board
  const scoreBoardRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Score Board'] || workbook.Sheets[workbook.SheetNames[0]]);
  const students = scoreBoardRaw.map(row => {
    const nameStr = row['Candidate Name'] || '';
    const match = nameStr.match(/^(.*?)\s*\((.*?)\)$/);
    const name = match ? match[1].trim() : nameStr.trim();
    const track = match ? match[2].trim() : '';

    return {
      id: row['SrNo'] || Math.random().toString(36).substr(2, 9),
      name,
      track,
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
        lastTerm: row['Last Term'] || 0,
        lastTermRating: row['Rating Sec Term'] || 'N/A',
        overall: row['Overall'] || 0,
        overallRating: row['Rating Overall'] || 'N/A',
        teamProject: row['Team Project'] || '',
        individualProject: row['Individual Project'] || '',
      },
      mentorScores: {},
      metrics: [],
      moms: [],
      overallComments: [],
      projectFeedback: {},
    };
  });

  // 2. Parse individual sheets
  students.forEach(student => {
    const sheetName = student.name;
    if (!workbook.Sheets[sheetName]) return;

    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    if (rawData.length === 0) return;

    const headerRow = rawData[0] || [];
    let currentCategory = null;

    const midTermMOMIdx = headerRow.indexOf('Mid Term Meeting MOM');
    const finalMOMIdx = headerRow.indexOf('Final Meeting MOM');
    const overallPointIdx = headerRow.indexOf('Overall point');
    let midTermNotes = [];
    let finalNotes = [];
    let overallNotes = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      if (row[0] && typeof row[0] === 'string') {
        currentCategory = row[0].trim();
      }

      const mentorName = row[1];
      if (currentCategory && mentorName && typeof mentorName === 'string') {
        if (!student.mentorScores[currentCategory]) {
          student.mentorScores[currentCategory] = [];
        }

        const mentorEntry = {
          mentor: mentorName,
          week1: typeof row[2] === 'number' ? row[2] : null,
          week2: typeof row[3] === 'number' ? row[3] : null,
          week3: typeof row[4] === 'number' ? row[4] : null,
          week4: typeof row[5] === 'number' ? row[5] : null,
          week5: typeof row[6] === 'number' ? row[6] : null,
          week6: typeof row[7] === 'number' ? row[7] : null,
          week7: typeof row[8] === 'number' ? row[8] : null,
          week8: typeof row[9] === 'number' ? row[9] : null,
          todo: typeof row[10] === 'number' ? row[10] : null,
        };
        student.mentorScores[currentCategory].push(mentorEntry);
      }

      if (midTermMOMIdx >= 0 && row[midTermMOMIdx] && typeof row[midTermMOMIdx] === 'string') {
        midTermNotes.push(row[midTermMOMIdx]);
      }
      if (finalMOMIdx >= 0 && row[finalMOMIdx] && typeof row[finalMOMIdx] === 'string') {
        finalNotes.push(row[finalMOMIdx]);
      }
      if (overallPointIdx >= 0 && row[overallPointIdx] && typeof row[overallPointIdx] === 'string') {
        overallNotes.push(row[overallPointIdx]);
      }
    }

    const VALID_CATEGORIES = [
      'Communication', 'Professionalism and Discipline', 'Proactiveness', 
      'Learning and Agile', 'React', 'Node', 'Java'
    ];

    Object.keys(student.mentorScores).forEach(category => {
      if (!VALID_CATEGORIES.includes(category)) return;

      const entries = student.mentorScores[category];
      let totalScore = 0;
      let scoreCount = 0;
      
      entries.forEach(entry => {
        const weekScores = [entry.week1, entry.week2, entry.week3, entry.week4, entry.week5, entry.week6, entry.week7, entry.week8];
        weekScores.forEach(s => {
          if (s !== null) { // Explicitly include zero scores
            totalScore += s;
            scoreCount++;
          }
        });
      });

      const rawAvg = scoreCount > 0 ? (totalScore / scoreCount) : 0;

      student.metrics.push({
        subject: category === 'Professionalism and Discipline' ? 'Discipline' : category,
        score: Math.round(rawAvg * 10) / 10
      });
    });

    student.moms = [];
    if (midTermNotes.length > 0) student.moms.push({ meeting: 'Mid-Term', notes: midTermNotes });
    if (finalNotes.length > 0) student.moms.push({ meeting: 'Final', notes: finalNotes });
    
    if (student.moms.length === 0) {
      student.moms = [
        { meeting: 'Mid-Term', notes: 'Pending evaluation.' },
        { meeting: 'Final', notes: 'Pending evaluation.' },
      ];
    }

    if (overallNotes.length > 0) {
      student.overallComments = overallNotes;
    } else if (student.scores.overall > 0) {
      student.overallComments = [`Candidate achieved an overall score of ${student.scores.overall}% with a final rating of '${student.scores.overallRating}'.`];
    }
  });

  // 3. Parse Final Project
  const projectSheet = workbook.Sheets['Final Project Feedback'];
  if (projectSheet) {
    const pData = XLSX.utils.sheet_to_json(projectSheet, { header: 1 });
    let projectBreakdown = [];
    let totalPoints = 0;
    pData.forEach(row => {
      if (row[0] && typeof row[0] === 'string' && typeof row[1] === 'number') {
        projectBreakdown.push({ criteria: row[0], points: row[1] });
        totalPoints += row[1];
      }
    });
    students.forEach(s => s.projectFeedback = { scorecard: projectBreakdown, totalPoints });
  }

  return students;
};

// Original file upload parser
export const parseExcelData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(parseExcelWorkbook(workbook));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// New URL fetch parser
export const parseExcelFromUrl = async (url, triggerDownload = false) => {
  try {
    // Auto-convert standard Google Sheets URLs into direct XLSX export streams
    let finalUrl = url;
    if (finalUrl.includes("docs.google.com/spreadsheets") && finalUrl.includes("/edit")) {
      finalUrl = finalUrl.replace(/\/edit.*$/, '/export?format=xlsx');
    }

    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error("Failed to fetch the file from the provided URL.");
    
    const arrayBuffer = await response.arrayBuffer();

    // Trigger physical browser download if explicit debug download is requested
    if (triggerDownload) {
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'fetched_bootcamp_data.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return parseExcelWorkbook(workbook);
  } catch (err) {
    throw err;
  }
};
