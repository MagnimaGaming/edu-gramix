import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

/* ═══════════════════════════════════════════════════════════════════════
   CLIENT-SIDE FIVE-LENS ANALYSIS ENGINE (No API needed)
   ═══════════════════════════════════════════════════════════════════════ */

// ── Keyword databases per role ──────────────────────────────────────────
const ROLE_KEYWORDS = {
    'software engineer': ['react', 'javascript', 'typescript', 'node', 'python', 'java', 'api', 'rest', 'graphql', 'sql', 'nosql', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'ci/cd', 'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'microservices', 'scalability', 'testing', 'unit test', 'tdd', 'oop', 'design patterns', 'data structures', 'algorithms'],
    'web developer': ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'next.js', 'node', 'express', 'tailwind', 'sass', 'responsive', 'accessibility', 'seo', 'webpack', 'vite', 'api', 'rest', 'graphql', 'git', 'figma', 'ui/ux', 'performance', 'cross-browser', 'progressive web app', 'pwa'],
    'data scientist': ['python', 'r', 'sql', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'statistics', 'data visualization', 'tableau', 'power bi', 'nlp', 'neural network', 'regression', 'classification', 'clustering', 'feature engineering', 'a/b testing', 'jupyter', 'spark', 'hadoop', 'etl'],
    'frontend developer': ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'next.js', 'tailwind', 'sass', 'responsive', 'accessibility', 'seo', 'webpack', 'vite', 'figma', 'ui/ux', 'performance', 'state management', 'redux', 'testing', 'jest', 'cypress', 'storybook', 'design system'],
    'backend developer': ['python', 'java', 'node', 'go', 'rust', 'api', 'rest', 'graphql', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'microservices', 'message queue', 'kafka', 'rabbitmq', 'ci/cd', 'authentication', 'security', 'caching', 'load balancing'],
    'devops engineer': ['docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'aws', 'azure', 'gcp', 'linux', 'bash', 'python', 'monitoring', 'prometheus', 'grafana', 'elk', 'infrastructure as code', 'networking', 'security', 'automation', 'git', 'helm', 'istio'],
    'default': ['communication', 'teamwork', 'leadership', 'problem solving', 'analytical', 'project management', 'agile', 'scrum', 'git', 'python', 'javascript', 'sql', 'api', 'cloud', 'docker', 'testing', 'ci/cd', 'data analysis'],
}

// ── ATS Problematic patterns ────────────────────────────────────────────
const ATS_BAD_HEADERS = ['my journey', 'my story', 'about me', 'who i am', 'my background', 'professional story', 'career narrative']
const ATS_GOOD_HEADERS = ['experience', 'education', 'skills', 'projects', 'certifications', 'summary', 'objective', 'work history', 'professional experience', 'technical skills']

// ── Weak action verbs vs Strong action verbs ────────────────────────────
const WEAK_VERBS = ['responsible for', 'helped', 'assisted', 'worked on', 'involved in', 'participated in', 'tasked with', 'duties included', 'contributed to', 'supported', 'handled', 'managed to']
const STRONG_VERBS = ['engineered', 'architected', 'spearheaded', 'optimized', 'automated', 'reduced', 'increased', 'delivered', 'launched', 'designed', 'implemented', 'scaled', 'migrated', 'built', 'transformed', 'accelerated', 'streamlined', 'pioneered']

// ── Metric patterns ─────────────────────────────────────────────────────
const METRIC_PATTERNS = [
    /\d+\s*%/g,                         // percentages
    /\$\s*[\d,]+\.?\d*/g,               // currency
    /\d+[kKmM]\+?\s*(users|requests|records|downloads|views|transactions)/gi,
    /\d+x\s/gi,                         // multipliers like 3x
    /\d+\s*(million|billion|thousand)/gi,
    /\d+\s*(hours|days|weeks|months|minutes|seconds)\s/gi,  // time
    /\b\d{2,}\b/g,                      // any number with 2+ digits
]

/* ── Analysis Functions ── */

function analyzeATS(text, lines) {
    const lower = text.toLowerCase()
    const checks = []
    let score = 100

    // Check 1: Standard section headers
    const foundGoodHeaders = ATS_GOOD_HEADERS.filter(h => lower.includes(h))
    const foundBadHeaders = ATS_BAD_HEADERS.filter(h => lower.includes(h))
    if (foundGoodHeaders.length >= 3) {
        checks.push({ label: 'Standard Section Headers', status: 'pass', detail: `Found: ${foundGoodHeaders.slice(0, 4).join(', ')}. ATS parsers will identify your sections correctly.` })
    } else if (foundBadHeaders.length > 0) {
        checks.push({ label: 'Standard Section Headers', status: 'fail', detail: `Non-standard headers detected: "${foundBadHeaders.join('", "')}". Use standard headers like "Experience", "Education", "Skills".` })
        score -= 25
    } else {
        checks.push({ label: 'Standard Section Headers', status: 'warn', detail: `Only ${foundGoodHeaders.length} standard headers found. Add clear sections for Experience, Education, Skills.` })
        score -= 12
    }

    // Check 2: Contact info
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text)
    const hasPhone = /[\+]?[\d\s\-()]{7,}/.test(text)
    if (hasEmail && hasPhone) {
        checks.push({ label: 'Contact Information', status: 'pass', detail: 'Email and phone number detected in plain text. Parsers can extract these.' })
    } else {
        checks.push({ label: 'Contact Information', status: hasEmail ? 'warn' : 'fail', detail: `${hasEmail ? 'Email found' : 'No email detected'}. ${hasPhone ? 'Phone found' : 'No phone number detected'}. Ensure contact info is in plain text.` })
        score -= hasEmail ? 8 : 20
    }

    // Check 3: Length check
    const wordCount = text.split(/\s+/).length
    if (wordCount > 200 && wordCount < 1200) {
        checks.push({ label: 'Resume Length', status: 'pass', detail: `${wordCount} words — good length for a ${wordCount > 700 ? 'senior' : 'standard'} resume.` })
    } else if (wordCount <= 200) {
        checks.push({ label: 'Resume Length', status: 'fail', detail: `Only ${wordCount} words. Modern resumes should be 300-800 words to pass ATS filters.` })
        score -= 20
    } else {
        checks.push({ label: 'Resume Length', status: 'warn', detail: `${wordCount} words — quite long. Consider trimming to 600-800 words for better parsing.` })
        score -= 8
    }

    // Check 4: Special characters / formatting issues
    const specialCount = (text.match(/[│┃┆═╔╗╚╝►◆●★✓✗▸▪▫⊙⊕]/g) || []).length
    if (specialCount > 5) {
        checks.push({ label: 'Special Characters', status: 'fail', detail: `${specialCount} non-standard characters/symbols found. ATS may misread these. Use simple bullets (•) or dashes (-).` })
        score -= 15
    } else {
        checks.push({ label: 'Character Encoding', status: 'pass', detail: 'No problematic special characters detected. Clean text encoding.' })
    }

    const status = score >= 80 ? 'pass' : score >= 50 ? 'warn' : 'fail'
    const summary = score >= 80
        ? 'Your resume structure is ATS-friendly. Minor optimizations possible.'
        : score >= 50
            ? `${4 - checks.filter(c => c.status === 'pass').length} structural issues may affect ATS parsing.`
            : 'Critical formatting issues detected. Your resume may not parse correctly in most ATS systems.'

    return {
        score: Math.max(0, Math.min(100, score)),
        status,
        summary,
        checks,
        rewrites: foundBadHeaders.length > 0
            ? foundBadHeaders.map(h => ({
                original: `Section header: "${h}"`,
                rewrite: `Use standard header: "${ATS_GOOD_HEADERS[0]}" or "${ATS_GOOD_HEADERS[1]}"`,
                reason: 'ATS parsers look for standard headers. Non-standard names cause sections to be skipped entirely.'
            }))
            : [{ original: 'Current structure', rewrite: 'Ensure clear separation: Summary → Experience → Education → Skills → Projects', reason: 'A predictable structure helps ATS parsers extract maximum information.' }],
    }
}

function analyzeKeywords(text, profile) {
    const lower = text.toLowerCase()
    const targetRole = (profile?.targetRole || 'software engineer').toLowerCase()
    const userTechs = (profile?.interestedTechnologies || []).map(t => t.toLowerCase())

    // Find the closest role keyword set
    const roleKey = Object.keys(ROLE_KEYWORDS).find(k => targetRole.includes(k)) || 'default'
    const allKeywords = [...new Set([...ROLE_KEYWORDS[roleKey], ...userTechs])]

    const found = allKeywords.filter(kw => lower.includes(kw))
    const missing = allKeywords.filter(kw => !lower.includes(kw))
    const coverage = Math.round((found.length / allKeywords.length) * 100)

    const checks = []

    // Found keywords
    if (found.length > 0) {
        checks.push({
            label: `Found Keywords (${found.length})`,
            status: found.length >= allKeywords.length * 0.6 ? 'pass' : 'warn',
            detail: found.slice(0, 8).join(', ') + (found.length > 8 ? ` + ${found.length - 8} more` : ''),
        })
    }

    // Missing keywords
    if (missing.length > 0) {
        const criticalMissing = missing.slice(0, 6)
        checks.push({
            label: `Missing Keywords (${missing.length})`,
            status: missing.length > allKeywords.length * 0.5 ? 'fail' : 'warn',
            detail: criticalMissing.join(', ') + (missing.length > 6 ? ` + ${missing.length - 6} more` : ''),
        })
    }

    // User's interested technologies
    if (userTechs.length > 0) {
        const foundTechs = userTechs.filter(t => lower.includes(t))
        checks.push({
            label: 'Your Technologies Match',
            status: foundTechs.length === userTechs.length ? 'pass' : foundTechs.length > 0 ? 'warn' : 'fail',
            detail: foundTechs.length === userTechs.length
                ? `All ${userTechs.length} of your technologies are mentioned.`
                : `${foundTechs.length}/${userTechs.length} of your technologies found. Missing: ${userTechs.filter(t => !lower.includes(t)).join(', ')}`,
        })
    }

    // Industry standard check
    const industryTerms = ['2024', '2025', '2026', 'cloud', 'ai', 'machine learning', 'devops', 'security']
    const modernTerms = industryTerms.filter(t => lower.includes(t))
    checks.push({
        label: '2026 Industry Relevance',
        status: modernTerms.length >= 2 ? 'pass' : modernTerms.length >= 1 ? 'warn' : 'fail',
        detail: modernTerms.length >= 2
            ? `Modern terms found: ${modernTerms.join(', ')}`
            : 'Few modern industry terms. Consider adding references to current technologies and trends.',
    })

    const score = Math.max(0, Math.min(100, coverage))
    return {
        score,
        status: score >= 75 ? 'pass' : score >= 50 ? 'warn' : 'fail',
        summary: score >= 75
            ? `Strong keyword coverage (${coverage}%). Your resume aligns well with ${targetRole} requirements.`
            : `${missing.length} high-value keywords missing for "${targetRole}". Coverage: ${coverage}%.`,
        checks,
        rewrites: missing.slice(0, 2).map(kw => ({
            original: `Missing keyword: "${kw}"`,
            rewrite: `Add "${kw}" naturally into your Experience or Skills section. Example: "Implemented ${kw}-based solutions..."`,
            reason: `"${kw}" is a high-value keyword for ${targetRole} roles in 2026 job postings.`,
        })),
    }
}

function analyzeImpact(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 15)
    const bulletLines = lines.filter(l => /^[\s]*[-•▪▸*]\s/.test(l) || /^\s*\d+[.)]\s/.test(l))
    const contentLines = bulletLines.length > 0 ? bulletLines : lines.slice(0, 15)

    let weakCount = 0
    let strongCount = 0
    const weakExamples = []
    const strongExamples = []

    contentLines.forEach(line => {
        const lower = line.toLowerCase().trim()
        const hasWeak = WEAK_VERBS.some(v => lower.includes(v))
        const hasStrong = STRONG_VERBS.some(v => lower.includes(v))

        if (hasWeak && !hasStrong) {
            weakCount++
            if (weakExamples.length < 2) weakExamples.push(line.trim().slice(0, 80))
        } else if (hasStrong) {
            strongCount++
            if (strongExamples.length < 2) strongExamples.push(line.trim().slice(0, 80))
        }
    })

    const total = Math.max(contentLines.length, 1)
    const strongRatio = strongCount / total
    const score = Math.round(Math.min(100, (strongRatio * 100) + (weakCount === 0 ? 20 : 0) + (strongCount >= 3 ? 15 : 0)))

    const checks = []

    checks.push({
        label: 'Strong Action Verbs',
        status: strongCount >= 3 ? 'pass' : strongCount >= 1 ? 'warn' : 'fail',
        detail: strongCount > 0
            ? `Found ${strongCount} strong verbs: ${STRONG_VERBS.filter(v => text.toLowerCase().includes(v)).slice(0, 4).join(', ')}`
            : 'No strong action verbs detected. Use "Engineered", "Optimized", "Delivered" instead of "Worked on".',
    })

    checks.push({
        label: 'Weak/Passive Language',
        status: weakCount === 0 ? 'pass' : weakCount <= 2 ? 'warn' : 'fail',
        detail: weakCount === 0
            ? 'No passive language detected. Your bullets read confidently.'
            : `${weakCount} instances of weak language: ${WEAK_VERBS.filter(v => text.toLowerCase().includes(v)).slice(0, 3).join(', ')}`,
    })

    // PAR framework check
    const hasResults = contentLines.some(l => /result|led to|improved|increased|decreased|reduced|achieved|saving/i.test(l))
    checks.push({
        label: 'Problem → Action → Result',
        status: hasResults ? 'pass' : 'fail',
        detail: hasResults
            ? 'Some bullets follow the PAR framework showing outcomes.'
            : 'No result-oriented language found. Bullets describe tasks, not achievements.',
    })

    return {
        score: Math.max(10, Math.min(100, score)),
        status: score >= 75 ? 'pass' : score >= 45 ? 'warn' : 'fail',
        summary: score >= 75
            ? 'Your bullets are impact-driven. Strong narrative with action verbs.'
            : `${weakCount} bullet points describe tasks instead of results. Narrative needs strengthening.`,
        checks,
        rewrites: weakExamples.map(ex => ({
            original: `"${ex}${ex.length >= 80 ? '...' : ''}"`,
            rewrite: `Replace with: "Engineered/Optimized [specific thing], resulting in [measurable outcome] for [stakeholder]"`,
            reason: 'Recruiters spend 7 seconds scanning. Impact-driven bullets survive that filter.',
        })),
    }
}

function analyzeMetrics(text) {
    let totalMetrics = 0
    const foundTypes = []

    // Percentages
    const pcts = text.match(/\d+\s*%/g) || []
    if (pcts.length > 0) { totalMetrics += pcts.length; foundTypes.push(`${pcts.length} percentage(s)`) }

    // Currency
    const currency = text.match(/\$\s*[\d,]+\.?\d*/g) || text.match(/₹\s*[\d,]+/g) || []
    if (currency.length > 0) { totalMetrics += currency.length; foundTypes.push(`${currency.length} currency figure(s)`) }

    // Scale numbers (1000+)
    const bigNums = text.match(/\b\d{3,}\b/g) || []
    if (bigNums.length > 0) { totalMetrics += bigNums.length; foundTypes.push(`${bigNums.length} large number(s)`) }

    // Multipliers
    const multipliers = text.match(/\d+x\s/gi) || []
    if (multipliers.length > 0) { totalMetrics += multipliers.length; foundTypes.push(`${multipliers.length} multiplier(s)`) }

    // Time-based
    const timeBased = text.match(/\d+\s*(hours|days|weeks|months|years|minutes)\b/gi) || []
    if (timeBased.length > 0) { totalMetrics += timeBased.length; foundTypes.push(`${timeBased.length} time metric(s)`) }

    const bulletCount = (text.match(/^[\s]*[-•▪▸*]\s/gm) || []).length || 5
    const density = Math.round((totalMetrics / Math.max(bulletCount, 1)) * 100)
    const score = Math.min(100, Math.max(0, density > 100 ? 95 : density))

    const checks = []

    checks.push({
        label: 'Percentage Metrics',
        status: pcts.length >= 2 ? 'pass' : pcts.length >= 1 ? 'warn' : 'fail',
        detail: pcts.length > 0 ? `Found: ${pcts.slice(0, 3).join(', ')}` : 'No percentages found. Add improvement rates and growth numbers.',
    })

    checks.push({
        label: 'Revenue / Cost Impact',
        status: currency.length >= 1 ? 'pass' : 'fail',
        detail: currency.length > 0 ? `Found: ${currency.slice(0, 3).join(', ')}` : 'No financial metrics. Quantify savings, revenue, or budget managed.',
    })

    checks.push({
        label: 'Scale Indicators',
        status: bigNums.length >= 2 ? 'pass' : bigNums.length >= 1 ? 'warn' : 'fail',
        detail: bigNums.length > 0 ? `${bigNums.length} scale numbers found (users, records, etc.)` : 'No scale metrics. Add user counts, data volumes, request numbers.',
    })

    checks.push({
        label: 'Time-Based Metrics',
        status: timeBased.length >= 1 ? 'pass' : 'fail',
        detail: timeBased.length > 0 ? `Found: ${timeBased.slice(0, 3).join(', ')}` : 'No timeline improvements. Add delivery speed, uptime stats.',
    })

    return {
        score: Math.max(5, Math.min(100, score)),
        status: score >= 70 ? 'pass' : score >= 40 ? 'warn' : 'fail',
        summary: totalMetrics === 0
            ? 'Zero quantifiable metrics found. This is a critical gap for recruiter attention.'
            : totalMetrics <= 3
                ? `Only ${totalMetrics} metrics found (${foundTypes.join(', ')}). Density is low.`
                : `${totalMetrics} metrics detected (${foundTypes.join(', ')}). Good quantification.`,
        checks,
        rewrites: [
            {
                original: '"Improved application performance"',
                rewrite: '"Reduced API response time from 1.2s to 180ms (85% improvement), decreasing server costs by $2,400/month"',
                reason: 'One sentence, four metrics. This is what recruiters scan for.',
            },
            {
                original: '"Managed intern onboarding"',
                rewrite: '"Onboarded 12 interns across 2 cohorts, achieving 95% retention rate and reducing ramp-up time from 4 weeks to 10 days"',
                reason: 'Numbers transform soft skills into hard evidence.',
            },
        ],
    }
}

function analyzeRoleAlignment(text, profile) {
    const lower = text.toLowerCase()
    const targetRole = (profile?.targetRole || 'software engineer').toLowerCase()
    const roleKey = Object.keys(ROLE_KEYWORDS).find(k => targetRole.includes(k)) || 'default'
    const roleKws = ROLE_KEYWORDS[roleKey]

    // Skills match
    const matchedSkills = roleKws.filter(kw => lower.includes(kw))
    const skillMatch = Math.round((matchedSkills.length / roleKws.length) * 100)

    // Education relevance
    const eduTerms = ['computer science', 'software', 'engineering', 'information technology', 'data science', 'mathematics', 'statistics', 'bca', 'mca', 'b.tech', 'm.tech', 'bsc', 'msc', 'bachelor', 'master', 'degree']
    const hasRelevantEdu = eduTerms.some(t => lower.includes(t))

    // Project relevance
    const projectTerms = ['project', 'built', 'developed', 'created', 'designed', 'implemented', 'application', 'system', 'platform', 'tool', 'website', 'app']
    const projectMentions = projectTerms.filter(t => lower.includes(t)).length

    // Experience relevance
    const expTerms = ['intern', 'developer', 'engineer', 'analyst', 'associate', 'assistant', 'junior', 'senior', 'lead', 'manager', 'experience', 'worked at', 'employment']
    const hasExp = expTerms.some(t => lower.includes(t))

    const checks = []
    let score = skillMatch

    checks.push({
        label: 'Skills → Role Match',
        status: skillMatch >= 60 ? 'pass' : skillMatch >= 35 ? 'warn' : 'fail',
        detail: `${matchedSkills.length}/${roleKws.length} required skills found (${skillMatch}% match). ${matchedSkills.length > 0 ? 'Top: ' + matchedSkills.slice(0, 5).join(', ') : ''}`,
    })

    checks.push({
        label: 'Academic Alignment',
        status: hasRelevantEdu ? 'pass' : 'warn',
        detail: hasRelevantEdu ? 'Relevant academic background detected for this role.' : 'No clear academic background detected. Consider adding your degree and field of study.',
    })
    if (!hasRelevantEdu) score -= 10

    checks.push({
        label: 'Project Portfolio',
        status: projectMentions >= 4 ? 'pass' : projectMentions >= 2 ? 'warn' : 'fail',
        detail: projectMentions >= 4
            ? `Strong project presence with ${projectMentions} project-related mentions.`
            : `Only ${projectMentions} project mentions. Add 2-3 role-specific projects to strengthen alignment.`,
    })
    if (projectMentions < 2) score -= 15

    checks.push({
        label: 'Experience Relevance',
        status: hasExp ? 'pass' : 'warn',
        detail: hasExp
            ? 'Professional experience section detected and relevant.'
            : 'No clear professional experience section. Add internships, freelance work, or open-source contributions.',
    })
    if (!hasExp) score -= 10

    score = Math.max(10, Math.min(100, score))

    return {
        score,
        status: score >= 75 ? 'pass' : score >= 50 ? 'warn' : 'fail',
        summary: score >= 75
            ? `Strong alignment with "${targetRole}" role. Skills and experience match well.`
            : `Your profile needs strengthening for "${targetRole}". ${roleKws.length - matchedSkills.length} relevant skills are missing.`,
        checks,
        rewrites: [
            {
                original: `Current role alignment: ${skillMatch}%`,
                rewrite: `Add missing skills to your projects section: ${roleKws.filter(kw => !lower.includes(kw)).slice(0, 5).join(', ')}`,
                reason: `These keywords appear in 80%+ of "${targetRole}" job postings for 2026.`,
            },
        ],
    }
}

/** Check if text looks like a resume */
function isResume(text) {
    const lower = text.toLowerCase()
    const resumeSignals = ['experience', 'education', 'skills', 'projects', 'work', 'employment', 'intern', 'developer', 'engineer', 'summary', 'objective', 'certifications', 'resume', 'curriculum vitae', 'cv']
    const matchCount = resumeSignals.filter(s => lower.includes(s)).length
    return matchCount >= 2
}

/** Run all 5 lenses — fully offline */
function runFiveLensAnalysis(resumeText, profile) {
    return {
        is_resume: isResume(resumeText),
        overall_score: 0, // calculated after
        lenses: {
            ats: analyzeATS(resumeText, resumeText.split('\n')),
            keyword: analyzeKeywords(resumeText, profile),
            impact: analyzeImpact(resumeText),
            metrics: analyzeMetrics(resumeText),
            role: analyzeRoleAlignment(resumeText, profile),
        },
    }
}

/* ═══════════════════════════════════════════════════════════════════════
   PDF TEXT EXTRACTION
   ═══════════════════════════════════════════════════════════════════════ */

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
    }
    return fullText.trim()
}

/* ═══════════════════════════════════════════════════════════════════════
   LENS CONFIG
   ═══════════════════════════════════════════════════════════════════════ */

const LENS_META = {
    ats: { title: 'ATS Compatibility', subtitle: 'Parsing Health', icon: '⬡', accent: '#22d3ee' },
    keyword: { title: 'Keyword Optimization', subtitle: 'Keyword Coverage', icon: '◈', accent: '#818cf8' },
    impact: { title: 'Impact & Achievement', subtitle: 'Narrative Strength', icon: '◎', accent: '#f97316' },
    metrics: { title: 'Quantification Audit', subtitle: 'Metrics Density', icon: '◇', accent: '#a78bfa' },
    role: { title: 'Role Alignment', subtitle: 'Dream Job Match', icon: '✦', accent: '#22d3ee' },
}

const LENS_ORDER = ['ats', 'keyword', 'impact', 'metrics', 'role']

/* ═══════════════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════ */

function ScoreRing({ score, accent = '#22d3ee', size = 96, strokeW = 6 }) {
    const r = (size - strokeW) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 75 ? '#22d3ee' : score >= 50 ? '#ffd93d' : '#f97316'

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} fill="none" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color} strokeWidth={strokeW} fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl font-black text-white leading-none"
                >{score}</motion.span>
                <span className="text-[7px] text-white/25 uppercase tracking-[0.25em] font-black mt-0.5">Score</span>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const map = {
        pass: { cls: 'bg-[#22d3ee]/8 border-[#22d3ee]/20 text-[#22d3ee]', label: 'OPTIMIZED' },
        warn: { cls: 'bg-[#f97316]/8 border-[#f97316]/20 text-[#f97316]', label: 'ACTION REQUIRED' },
        fail: { cls: 'bg-[#ef4444]/8 border-[#ef4444]/20 text-[#ef4444]', label: 'CRITICAL' },
    }
    const s = map[status] || map.warn
    return <span className={`px-2.5 py-0.5 border rounded-full text-[7px] font-black tracking-[0.15em] ${s.cls}`}>{s.label}</span>
}

function CheckDot({ status }) {
    const c = { pass: '#22d3ee', warn: '#f97316', fail: '#ef4444' }[status] || '#f97316'
    return (
        <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: `${c}20`, boxShadow: `0 0 6px ${c}30` }}>
            <div className="w-full h-full rounded-full scale-50" style={{ background: c }} />
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEURAL UPLOADER
   ═══════════════════════════════════════════════════════════════════════ */

function NeuralUploader({ onFileAccepted, analyzing }) {
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef(null)

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) onFileAccepted(file)
    }, [onFileAccepted])

    const handleDrag = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
    const handleDragLeave = useCallback(() => setDragOver(false), [])
    const handleBrowse = (e) => { const file = e.target.files?.[0]; if (file) onFileAccepted(file) }

    return (
        <motion.div
            animate={{ y: analyzing ? 0 : [0, -6, 0] }}
            transition={analyzing ? {} : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragLeave={handleDragLeave}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden ${dragOver ? 'border-[#22d3ee]/60 bg-[#22d3ee]/[0.04]' : 'border-white/[0.08] bg-white/[0.02]'
                }`}
            style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
            <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(34,211,238,0.03) 50%, transparent 60%)' }} />

            <div className="flex flex-col items-center justify-center py-16 px-8 gap-6 relative z-10">
                {analyzing ? (
                    <>
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-full bg-[#22d3ee] blur-2xl"
                                style={{ width: 80, height: 80, margin: 'auto' }}
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-2 border-[#22d3ee]/15 border-t-[#22d3ee] rounded-full relative z-10"
                                style={{ boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-sm font-black tracking-[0.3em] text-[#22d3ee] uppercase font-mono">
                                Neural Analysis in Progress
                            </motion.p>
                            <p className="text-[10px] text-white/20 tracking-wider">Running Five-Lens Elite Audit...</p>
                        </div>
                    </>
                ) : (
                    <>
                        <motion.div
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: 'radial-gradient(circle at 35% 35%, #22d3ee, #0e7490)', boxShadow: '0 0 30px rgba(34,211,238,0.25)' }}
                        >
                            <span className="text-3xl text-white/90">📄</span>
                        </motion.div>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h3 className="text-lg font-black text-white tracking-tight">Drop Your Resume</h3>
                            <p className="text-xs text-white/30 max-w-sm leading-relaxed">
                                Drag & drop a PDF, or click to browse. We'll extract and run the Five-Lens Elite Audit.
                            </p>
                        </div>
                        <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleBrowse} />
                        <button onClick={() => inputRef.current?.click()}
                            className="px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border-2 border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/10 hover:border-[#22d3ee]/50 transition-all"
                            style={{ backdropFilter: 'blur(16px)' }}>
                            Browse Files
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════
   LENS CARD
   ═══════════════════════════════════════════════════════════════════════ */

function LensCard({ lensKey, data, index, onFix }) {
    const meta = LENS_META[lensKey]
    if (!meta || !data) return null
    const glow = meta.accent

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.08] overflow-hidden group hover:border-white/[0.14] transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
            <div className="h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${glow}50, transparent)` }} />

            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl" style={{ color: glow, filter: `drop-shadow(0 0 8px ${glow}50)` }}>{meta.icon}</span>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight">{meta.title}</h3>
                            <p className="text-[9px] text-white/20 tracking-[0.15em] uppercase font-bold">{meta.subtitle}</p>
                        </div>
                    </div>
                    <StatusBadge status={data.status} />
                </div>

                <div className="flex items-center gap-5 mb-4">
                    <ScoreRing score={data.score} accent={glow} size={76} strokeW={5} />
                    <p className="text-xs text-white/45 leading-relaxed flex-1">{data.summary}</p>
                </div>

                <div className="space-y-2.5 mb-4">
                    {(data.checks || []).map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.07, duration: 0.3 }} className="flex items-start gap-2.5">
                            <CheckDot status={c.status} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white/55 leading-tight">{c.label}</p>
                                <p className="text-[10px] text-white/20 leading-snug mt-0.5">{c.detail}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button onClick={() => onFix(lensKey, data)}
                    className="w-full py-2.5 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 border"
                    style={{ borderColor: `${glow}20`, color: glow, background: `${glow}06` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${glow}15`; e.currentTarget.style.borderColor = `${glow}40` }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${glow}06`; e.currentTarget.style.borderColor = `${glow}20` }}
                >🔧 Fix This →</button>
            </div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════
   COACH PANEL
   ═══════════════════════════════════════════════════════════════════════ */

function CoachPanel({ lensKey, data, onClose }) {
    const meta = LENS_META[lensKey]
    if (!meta || !data) return null
    const glow = meta.accent

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-2xl max-h-[80vh] rounded-3xl border border-white/[0.08] overflow-hidden flex flex-col"
                style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(32px)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${glow}40, transparent)` }} />

                <div className="px-6 pt-5 pb-4 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl" style={{ color: glow }}>{meta.icon}</span>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight">{meta.title} — Coach</h3>
                            <p className="text-[9px] text-white/20 tracking-[0.15em] uppercase font-bold">Specific Rewrites for Your Resume</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 transition-all text-sm">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                    {(data.rewrites || []).map((fix, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, duration: 0.4 }} className="rounded-2xl border border-white/[0.06] overflow-hidden">
                            <div className="p-4 bg-white/[0.015] border-b border-white/[0.04]">
                                <p className="text-[8px] font-black tracking-[0.2em] text-[#ef4444]/60 uppercase mb-1.5">⚠ Current</p>
                                <p className="text-xs text-white/35 italic leading-relaxed">{fix.original}</p>
                            </div>
                            <div className="p-4" style={{ background: `${glow}06` }}>
                                <p className="text-[8px] font-black tracking-[0.2em] uppercase mb-1.5" style={{ color: `${glow}cc` }}>✦ Elite Rewrite</p>
                                <p className="text-xs font-bold leading-relaxed" style={{ color: glow }}>{fix.rewrite}</p>
                            </div>
                            <div className="px-4 py-3 bg-white/[0.01] border-t border-white/[0.03]">
                                <p className="text-[10px] text-white/25 italic">💡 {fix.reason}</p>
                            </div>
                        </motion.div>
                    ))}
                    {(!data.rewrites || data.rewrites.length === 0) && (
                        <div className="text-center py-10 text-white/20 text-sm">No rewrites generated for this lens.</div>
                    )}
                </div>

                <div className="p-5 border-t border-white/[0.05]">
                    <button onClick={onClose}
                        className="w-full py-3.5 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase transition-all btn-neon border-2"
                        style={{ borderColor: glow, color: glow }}>
                        <span>Close</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN RESUME AUDITOR PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function ResumeAuditor({ profile }) {
    const [analyzing, setAnalyzing] = useState(false)
    const [auditResult, setAuditResult] = useState(null)
    const [error, setError] = useState(null)
    const [coachOpen, setCoachOpen] = useState(null)
    const [fileName, setFileName] = useState(null)

    const handleFileAccepted = async (file) => {
        setError(null)
        setAuditResult(null)
        setFileName(file.name)
        setAnalyzing(true)

        try {
            // 1. Extract text
            let resumeText = ''
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                resumeText = await extractTextFromPDF(file)
            } else {
                resumeText = await file.text()
            }

            if (!resumeText || resumeText.trim().length < 30) {
                throw new Error('Could not extract enough text from this file. Try a different format or paste the text manually.')
            }

            // 2. Run Five-Lens analysis (fully offline)
            const result = runFiveLensAnalysis(resumeText, profile)

            // 3. Validate it's actually a resume
            if (!result.is_resume) {
                setError('⚠ Neural Error: This document does not match a professional resume profile. Please upload a valid CV or resume.')
                setAnalyzing(false)
                return
            }

            // 4. Calculate overall score
            const lensScores = Object.values(result.lenses).map(l => l.score)
            result.overall_score = Math.round(lensScores.reduce((a, b) => a + b, 0) / lensScores.length)

            // 5. Stagger results for cinematic reveal
            const staggeredResult = { ...result, lenses: {} }
            setAuditResult(staggeredResult)

            for (let i = 0; i < LENS_ORDER.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 500))
                staggeredResult.lenses[LENS_ORDER[i]] = result.lenses[LENS_ORDER[i]]
                setAuditResult({ ...staggeredResult, lenses: { ...staggeredResult.lenses } })
            }

        } catch (err) {
            console.error('Audit error:', err)
            setError(err.message || 'Audit failed. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleReset = () => { setAuditResult(null); setError(null); setFileName(null) }
    const hasResults = !!auditResult && Object.keys(auditResult.lenses || {}).length > 0

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-[2px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                        <p className="text-[10px] tracking-[0.4em] text-[#22d3ee] uppercase font-black font-mono">Resume Auditor</p>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                        Five-Lens <span className="text-white/20">Elite Audit.</span>
                    </h2>
                    <p className="text-xs text-white/25 mt-2 font-medium">
                        ATS · Keywords · Impact · Metrics · Role Alignment — Instant Analysis
                    </p>
                </div>

                {hasResults && auditResult.overall_score > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 px-5 py-3 rounded-2xl border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
                        <ScoreRing score={auditResult.overall_score} size={56} strokeW={4} />
                        <div>
                            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase font-black">Overall</p>
                            <p className="text-lg font-black text-white leading-none">{auditResult.overall_score}%</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Neural Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="rounded-2xl border border-[#f97316]/20 p-5 flex items-center gap-4"
                        style={{ background: 'rgba(249,115,22,0.06)', backdropFilter: 'blur(16px)' }}>
                        <span className="text-2xl">🧠</span>
                        <div className="flex-1">
                            <p className="text-[10px] tracking-[0.2em] text-[#f97316] uppercase font-black mb-1">Neural Error</p>
                            <p className="text-sm text-white/60">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-white/20 hover:text-white/50 text-sm transition-colors">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload */}
            {!hasResults && !analyzing && <NeuralUploader onFileAccepted={handleFileAccepted} analyzing={false} />}
            {analyzing && <NeuralUploader onFileAccepted={() => { }} analyzing={true} />}

            {/* Five-Lens Grid */}
            {hasResults && (
                <>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] tracking-[0.2em] text-white/25 uppercase font-black font-mono">📄 {fileName}</span>
                        <button onClick={handleReset}
                            className="px-5 py-2.5 border border-white/[0.08] text-white/25 text-[9px] font-black uppercase tracking-widest rounded-xl hover:text-white/45 hover:border-white/[0.15] transition-all"
                            style={{ backdropFilter: 'blur(12px)' }}>
                            ↻ New Audit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {LENS_ORDER.map((key, i) => {
                            const data = auditResult.lenses?.[key]
                            if (!data) return (
                                <motion.div key={key} initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="rounded-2xl border border-white/[0.05] bg-[#0d0d0d] h-64 flex flex-col items-center justify-center gap-3">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-8 h-8 border-2 border-white/5 rounded-full"
                                        style={{ borderTopColor: LENS_META[key].accent }} />
                                    <p className="text-[9px] tracking-[0.3em] uppercase font-black"
                                        style={{ color: `${LENS_META[key].accent}60` }}>
                                        Scanning {LENS_META[key].title}...
                                    </p>
                                </motion.div>
                            )
                            return <LensCard key={key} lensKey={key} data={data} index={i} onFix={(k, d) => setCoachOpen({ lensKey: k, data: d })} />
                        })}
                    </div>
                </>
            )}

            {/* Coach Modal */}
            <AnimatePresence>
                {coachOpen && <CoachPanel lensKey={coachOpen.lensKey} data={coachOpen.data} onClose={() => setCoachOpen(null)} />}
            </AnimatePresence>
        </div>
    )
}
