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
    ? `TIMELINE CONTEXT: Mid-bootcamp (Week ${latestWeek}/8). Evaluate ONLY expected progress till this stage.`
    : `TIMELINE CONTEXT: Final cumulative evaluation (Week 8 completed).`;

  const overallScoreStr = student.scores?.overall > 0 ? `${student.scores.overall}%` : 'TBD (Course in Progress)';
  const ratingStr = student.scores?.overallRating && student.scores?.overallRating !== 'N/A' && student.scores?.overallRating !== 'null' ? student.scores.overallRating : 'TBD (Pending Final Review)';

  return `You are an expert tech bootcamp mentor analyzing a student's performance.

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

CRITICAL ANALYSIS DIRECTIVE:

You MUST derive insights strictly from the numerical scores and logs.
Do NOT generate generic advice.

SCORING INTERPRETATION RULES:
- 0–4 → Critical weakness → strict recovery plan
- 5–6.9 → Average → structured improvement required
- 7–8.4 → Good → optimization focus
- 8.5–10 → Excellent → advanced challenges ONLY

LOGIC RULES:
- Identify between 2 to 5 strengths directly from holistic analysis of scores, mentor comments, and meeting logs.
- Identify between 2 to 5 weaknesses directly from holistic analysis of scores, mentor comments, and meeting logs.
- Provide between 2 to 5 targeted improvements. Each weakness MUST map to an improvement, plus any advanced challenges if applicable.
- Generate between 2 to 5 focus tags based on current priorities.
- Calculate an independent "smart" overall percentage (e.g., "85%") and rating (e.g., "Excellent", "Good", "Average", "At Risk") that represents their true trajectory. This does NOT need to match their raw "Overall Bootcamp Score" and can be higher or lower depending entirely on your deep analysis of their actual skill level, recent progress, and mentor comments.

ANTI-REPETITION RULE:
- Avoid generic phrases like "keep practicing" or "improve skills"
- Ensure each point is unique and specific to THIS student
- Use student's scores + logs to differentiate output

OUTPUT STYLE RULES:
- No paragraphs in improvements, strengths, weaknesses
- Each bullet in improvements must be concise (max 18 words)
- Strengths and weaknesses MUST BE EXCLUSIVELY 1 or 2 word phrases (e.g. "React", "Time Management", "Debugging"). DO NOT write sentences or phrases.
- Use action-oriented phrasing only for improvements

FORMAT RULE:
Each improvement must follow:
<Action> + <Area> + <Execution detail>

Example:
"Build 3 REST APIs using NestJS with JWT authentication to improve backend fundamentals"

TRACK ALIGNMENT:
All suggestions MUST align with ${student.track || 'Software Development'}

STRICT OUTPUT REQUIREMENT:
Return ONLY a valid minified JSON. No markdown. No explanation.
Provide dynamically sized arrays (2 to 5 items each) based on the specific results and needs of the student. Do NOT force exactly 3 items.

{
  "smartPercentage": "85%",
  "smartRating": "Good",
  "summary": "2 concise sentences explaining performance trend based on scores.",
  "focusTags": ["DynamicTag1", "DynamicTag2", "...up to 5"],
  "improvements": [
    "Specific action mapped to weakest area",
    "...between 2 to 5 unique measurable improvements tailored to the student"
  ],
  "strengths": ["1-2 words", "...between 2 to 5 strengths"],
  "weaknesses": ["1-2 words", "...between 2 to 5 weaknesses"]
}
`;
};