export const generateStudentAnalysisPrompt = (student) => {
  const categoriesText = student.metrics?.map(m => `${m.subject}: ${m.score}/10`).join(', ') || 'N/A';
  const overallFeedback = student.overallComments && student.overallComments.length > 0 
    ? student.overallComments.join(' | ') 
    : 'No explicit overall feedback available.';
  
  const meetingLogs = student.moms && student.moms.length > 0 
    ? student.moms.map(m => `${m.meeting}: ${Array.isArray(m.notes) ? m.notes.join(' / ') : m.notes}`).join(' || ') 
    : 'No meeting logs available.';
    
  let latestWeek = 0;
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  weeks.forEach(w => {
    if (student.scores && student.scores[`week${w}`] > 0) {
      latestWeek = w;
    }
  });

  const timelineContext = latestWeek > 0 && latestWeek < 8
    ? `TIMELINE CONTEXT: This is a mid-bootcamp assessment! The student has only completed up to Week ${latestWeek} out of 8. Do NOT judge them as if they have finished the entire program. Tailor your focus to where they should be at Week ${latestWeek}.`
    : `TIMELINE CONTEXT: This represents their complete, final cumulative bootcamp evaluation across all 8 weeks.`;

  const overallScoreStr = student.scores?.overall > 0 ? `${student.scores.overall}%` : 'TBD (Course in Progress)';
  const ratingStr = student.scores?.overallRating && student.scores?.overallRating !== 'N/A' && student.scores?.overallRating !== 'null' ? student.scores.overallRating : 'TBD (Pending Final Review)';
  
  return `You are an expert tech bootcamp mentor analyzing a student's performance.
Review the following metrics, scores (out of 10), and mentor logs to provide a highly tailored, constructive, and actionable plan for the student.

${timelineContext}

Student Name: ${student.name}
Track: ${student.track || 'Unassigned'}
Overall Bootcamp Score: ${overallScoreStr}
Overall Rating: ${ratingStr}

=== Performance by Category (0-10 Scale) ===
${categoriesText}

=== Qualitative Feedback & Logs ===
Overall Mentor Comments: ${overallFeedback}
Meeting/Review History: ${meetingLogs}

CRITICAL MENTORING DIRECTIVE:
Do NOT provide generic "keep it up" or basic improvement feedback. You MUST strictly adjust your tone and recommendations based precisely on their track record above:
- If the student is performing exceptionally well (e.g., scores 8.5-10, rating Excellent/Good), DO NOT tell them to learn basic fundamentals. Instead, provide ADVANCED challenges, encourage leadership, suggest complex architecture studies, or advise on portfolio building and interview preparation.
- If the student is average or struggling, accurately diagnose the root cause based on their category trends (e.g. low discipline vs low coding logic) and provide a strict, foundational triage recovery plan.
- Ensure the feedback is specific to the student's active track (e.g. ${student.track || 'Software Development'}).

Your ONLY output must be a valid, minified JSON object matching the exact schema below. Do not wrap it in markdown code blocks (\`\`\`json) and do not provide any introductory text.

{
  "summary": "A 2-3 sentence analytical summary highlighting their specific trajectory and current state based on their exact scores.",
  "focusTags": ["DynamicTag1", "DynamicTag2", "DynamicTag3"],
  "improvements": [
    "A highly specific, track-relevant action item tailored to their exact skill level.",
    "Another completely unique actionable challenge or foundational step.",
    "A final specific goal."
  ]
}
`;
};
