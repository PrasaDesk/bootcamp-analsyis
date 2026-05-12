export const generateStudentAnalysisPrompt = (student) => {
  const s = student.scores || {};

  // Determine how far into the bootcamp the student is (last week with a score > 0)
  let latestWeek = 0;
  for (let w = 1; w <= 8; w++) {
    if (s[`week${w}`] != null && s[`week${w}`] !== '' && s[`week${w}`] > 0) latestWeek = w;
  }

  // Weekly trajectory
  const weeklyLine = [1, 2, 3, 4, 5, 6, 7, 8]
    .map(w => `W${w}=${s[`week${w}`] ?? 'N/A'}`)
    .join(', ');

  // Mid vs Last term delta (key trajectory signal)
  const midTerm = typeof s.midTerm === 'number' ? s.midTerm : null;
  const lastTerm = typeof s.lastTerm === 'number' ? s.lastTerm : null;
  let trajectory = 'N/A';
  if (midTerm != null && lastTerm != null && (midTerm > 0 || lastTerm > 0)) {
    const delta = lastTerm - midTerm;
    const dir = delta > 2 ? 'improving' : delta < -2 ? 'declining' : 'flat';
    trajectory = `Mid-Term ${midTerm}% → Last-Term ${lastTerm}% (Δ ${delta > 0 ? '+' : ''}${delta}, ${dir})`;
  }

  // Per-category mentor averages (radar metrics)
  const categoriesText = student.metrics?.length
    ? student.metrics.map(m => `${m.subject}=${m.score}/10`).join(', ')
    : 'N/A';

  // Mentor-by-mentor grid: useful for spotting outlier mentors / consistency
  let mentorGrid = 'N/A';
  if (student.mentorScores && Object.keys(student.mentorScores).length > 0) {
    const rows = [];
    Object.entries(student.mentorScores).forEach(([category, entries]) => {
      entries.forEach(e => {
        const weekVals = [e.week1, e.week2, e.week3, e.week4, e.week5, e.week6, e.week7, e.week8];
        const valid = weekVals.filter(v => typeof v === 'number');
        if (valid.length === 0) return;
        const avg = (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
        rows.push(`${category}/${e.mentor}: avg=${avg}${e.project != null ? `, project=${e.project}` : ''}`);
      });
    });
    if (rows.length > 0) mentorGrid = rows.join(' | ');
  }

  // Project performance vs theory
  const projectScore = student.projectFeedback?.projectScore;
  const projectScoreStr = typeof projectScore === 'number' ? `${projectScore}%` : 'Not recorded';
  const projectBreakdown = student.projectFeedback?.scorecard?.length
    ? student.projectFeedback.scorecard.map(c => `${c.criteria}=${c.points}/10`).join(', ')
    : 'No breakdown available';

  // Separate feedback streams (don't merge — each has different meaning)
  const pickNotes = (meeting) => {
    const m = student.moms?.find(x => x.meeting === meeting);
    if (!m) return null;
    const text = Array.isArray(m.notes) ? m.notes.join(' / ') : m.notes;
    if (!text || text === 'Pending evaluation.') return null;
    return text;
  };
  const midTermFeedback = pickNotes('Mid-Term') || 'No mid-term meeting notes recorded.';
  const finalFeedback = pickNotes('Final') || 'No final meeting notes recorded.';
  const overallFeedback = student.overallComments?.length
    ? student.overallComments.join(' / ')
    : 'No overall mentor comments recorded.';

  const timelineContext = latestWeek === 0
    ? `TIMELINE: Bootcamp not started / no scores recorded. Treat all evaluations as pending — do NOT fabricate trends.`
    : latestWeek < 8
      ? `TIMELINE: Mid-bootcamp (Week ${latestWeek}/8 completed). Evaluate progress ONLY through this week; do not assume the rest.`
      : `TIMELINE: Bootcamp complete (Week 8). Provide a final cumulative assessment.`;

  const overallScoreStr = s.overall > 0 ? `${s.overall}%` : 'TBD (Course in Progress)';
  const ratingStr = s.overallRating && s.overallRating !== 'N/A' && s.overallRating !== 'null'
    ? s.overallRating
    : 'TBD (Pending Final Review)';

  return `You are an expert tech bootcamp mentor analyzing a single student's performance across the entire program. Your job is to produce a precise, evidence-based assessment that a head mentor could act on tomorrow.

${timelineContext}

=== STUDENT IDENTITY ===
Name: ${student.name}
Track: ${student.track || 'Unassigned'}
Overall Bootcamp Score: ${overallScoreStr}
Overall Rating: ${ratingStr}

=== SCORE TRAJECTORY (0–100%) ===
Weekly: ${weeklyLine}
Mid vs Last Term: ${trajectory}
Final Project: ${projectScoreStr}

=== CATEGORY AVERAGES (0–10) ===
${categoriesText}

=== FINAL PROJECT BREAKDOWN (per-category mentor avg, 0–10) ===
${projectBreakdown}

=== MENTOR-LEVEL DETAIL (raw weekly avg per mentor-category, 0–10) ===
${mentorGrid}

=== QUALITATIVE FEEDBACK (three independent streams) ===
Overall Mentor Comments: ${overallFeedback}
Mid-Term Meeting MOM: ${midTermFeedback}
Final Meeting MOM: ${finalFeedback}

=== ANALYSIS DIRECTIVES (must follow) ===

1. EVIDENCE-FIRST: Every strength, weakness, and improvement must be traceable to a number or quote above. If you cannot cite the source signal, do not include the point.

2. TRAJECTORY OVER SNAPSHOT: Weight mid→last term direction heavily. A student improving from 50% → 70% is a DIFFERENT case than one declining 70% → 50%, even if both average 60%. Reflect this in summary and rating.

3. PROJECT vs THEORY GAP: If the Final Project score differs from the Overall score by 15+ points, call it out explicitly — it indicates either strong applied skill (project > theory) or weak execution under pressure (project < theory).

4. CROSS-REFERENCE FEEDBACK: Numeric weaknesses must be confirmed (or contradicted) by mentor comments and MOMs. A low score with no mentor concern = different from a low score the mentors have flagged repeatedly.

5. MENTOR CONSISTENCY: If one mentor's scores diverge significantly from peers for the same category, note it as a data caveat — do not treat outliers as ground truth.

6. MISSING DATA HONESTY: If feedback streams say "No ... recorded" or project is "Not recorded", state that as a data gap. Do NOT invent placeholder feedback. Reduce confidence in any conclusion derived from a single source.

7. SCORE BANDS (apply to category 0–10 averages):
   - 0–4 → Critical weakness → must appear in weaknesses and drive an improvement
   - 5–6.9 → Average → eligible as weakness only if mentor feedback corroborates
   - 7–8.4 → Good → potential strength
   - 8.5–10 → Excellent → strength, drive advanced challenge

8. SMART OVERALL: Compute an independent "smartPercentage" representing the student's true trajectory. This MAY differ from the raw Overall Score — for example, a 55% student trending strongly upward with positive late-term mentor feedback could be 65% on trajectory, and a 65% student declining with red-flag MOMs could be 55%. Justify implicitly via the summary.

=== OUTPUT FORMAT RULES ===

- Improvements: action verb + specific area + concrete execution detail (max 18 words each). Each improvement must map to a weakness OR an advanced-challenge stretch goal.
  Example: "Build 3 REST APIs in Express with JWT auth and Postman tests to close the backend gap"
- Strengths and Weaknesses: 1–2 words each (e.g., "React", "Debugging", "Time Management", "Communication"). NEVER sentences.
- Focus Tags: 1–2 words each, representing the next priorities (e.g., "Backend", "DSA", "Code Quality").
- Track Alignment: every recommendation must fit a ${student.track || 'Software Development'} student.
- Array sizes are dynamic: between 2 and 5 items each, based on what the data actually supports. Do not pad.
- Summary: 2 concise sentences citing the strongest evidence (a number, a trend, or a quote).

=== STRICT JSON OUTPUT ===
Return ONLY valid minified JSON, no markdown, no prose.

{
  "smartPercentage": "85%",
  "smartRating": "Excellent | Good | Average | At Risk",
  "summary": "Two evidence-backed sentences about trajectory and standout signals.",
  "focusTags": ["Tag1", "Tag2"],
  "improvements": ["Action + area + execution detail", "..."],
  "strengths": ["1-2 words", "..."],
  "weaknesses": ["1-2 words", "..."]
}
`;
};
