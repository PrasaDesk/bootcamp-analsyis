const CATEGORY_SHORT = {
  'Communication': 'Comms',
  'Professionalism and Discipline': 'Discipline',
  'Proactiveness': 'Proactive',
  'Learning and Agile': 'Agile',
  'React': 'React',
  'Node': 'Node',
  'Java': 'Java',
  'Node/Java': 'Backend',
}

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_SHORT))

function round1(n) {
  return Math.round(n * 10) / 10
}

function avg(nums) {
  if (!nums || nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function getWeeklyScores(student) {
  const scores = []
  for (let w = 1; w <= 8; w++) {
    const v = student?.scores?.[`week${w}`]
    if (typeof v === 'number' && v > 0) scores.push(v)
  }
  return scores
}

function computeTrendTag(student) {
  const weekly = getWeeklyScores(student)
  if (weekly.length < 4) return null

  const mid = Math.floor(weekly.length / 2)
  const first = avg(weekly.slice(0, mid))
  const last = avg(weekly.slice(mid))
  if (first == null || last == null) return null

  const delta = last - first
  if (delta >= 1.0) return { kind: 'strength', tag: 'Rising' }
  if (delta <= -1.0) return { kind: 'weakness', tag: 'Slipping' }
  return { kind: 'neutral', tag: 'Steady' }
}

function computeCategoryAverages(student) {
  const mentorScores = student?.mentorScores
  if (mentorScores && typeof mentorScores === 'object') {
    const out = []
    for (const [category, entries] of Object.entries(mentorScores)) {
      if (!VALID_CATEGORIES.has(category)) continue
      if (!Array.isArray(entries) || entries.length === 0) continue

      const all = []
      for (const entry of entries) {
        for (let w = 1; w <= 8; w++) {
          const v = entry?.[`week${w}`]
          if (typeof v === 'number') all.push(v)
        }
      }

      const a = avg(all)
      if (a == null) continue
      out.push({ category, short: CATEGORY_SHORT[category] || category, score: round1(a) })
    }
    if (out.length > 0) return out
  }

  // Fallback to `metrics` if mentorScores is missing.
  const metrics = Array.isArray(student?.metrics) ? student.metrics : []
  const out = metrics
    .filter(m => typeof m?.subject === 'string' && typeof m?.score === 'number')
    .filter(m => VALID_CATEGORIES.has(m.subject))
    .map(m => ({ category: m.subject, short: CATEGORY_SHORT[m.subject] || m.subject, score: m.score }))

  return out
}

/**
 * Returns 1–2 word chips for strengths/weaknesses.
 * Output shape:
 * { strengths: string[], weaknesses: string[] }
 */
export function getStudentInsights(student, options = {}) {
  const maxPerSide = options.maxPerSide ?? 2

  const categories = computeCategoryAverages(student)
    .slice()
    .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity))

  const strengths = []
  const weaknesses = []

  // Top 2 as strengths (if meaningfully scored)
  for (const c of categories) {
    if (strengths.length >= maxPerSide) break
    if (typeof c.score !== 'number') continue
    // Heuristic: require at least "okay" signal; these are 0–10 in most data
    if (c.score >= 6.5) strengths.push(c.short)
  }

  // Bottom 2 as weaknesses (if meaningfully scored)
  const bottom = categories.slice().sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity))
  for (const c of bottom) {
    if (weaknesses.length >= maxPerSide) break
    if (typeof c.score !== 'number') continue
    if (c.score <= 5.5) weaknesses.push(c.short)
  }

  // Trend tag as tie-breaker/fill
  const trend = computeTrendTag(student)
  if (trend?.kind === 'strength' && strengths.length < maxPerSide) strengths.push(trend.tag)
  if (trend?.kind === 'weakness' && weaknesses.length < maxPerSide) weaknesses.push(trend.tag)

  // Fill remaining slots with top/bottom labels if thresholds didn’t pass
  for (const c of categories) {
    if (strengths.length >= maxPerSide) break
    if (!strengths.includes(c.short)) strengths.push(c.short)
  }
  for (const c of bottom) {
    if (weaknesses.length >= maxPerSide) break
    if (!weaknesses.includes(c.short)) weaknesses.push(c.short)
  }

  return {
    strengths: strengths.slice(0, maxPerSide),
    weaknesses: weaknesses.slice(0, maxPerSide),
  }
}

