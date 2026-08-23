import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Splits a `data:<mimeType>[;params...];base64,<data>` URL into its base
// mimeType (params like `;codecs=opus` stripped) and raw base64 payload.
function parseDataUrl(dataUrl, fallbackMime) {
  const match = dataUrl.match(/^data:([^;,]+)(?:;[^,]*)*;base64,([\s\S]*)$/)
  if (!match) return { mimeType: fallbackMime, data: dataUrl }
  return { mimeType: match[1], data: match[2] }
}

const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    title: { type: 'string' },
    tags:  { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q:           { type: 'string' },
          options:     { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          answer:      { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['q', 'options', 'answer', 'explanation'],
      },
      minItems: 2,
      maxItems: 3,
    },
  },
  required: ['topic', 'title', 'tags', 'questions'],
}

const SYSTEM_PROMPT = `You are a study assistant that turns lecture material into a topic, title, tags, and retrieval-practice questions.

The source material is either a photographed slide, an audio recording of someone explaining a concept, or both — use whichever is present. If only audio is given, there is no slide to reference; base everything on what was said.

QUESTIONS — this is the most critical part of the output.
Context: after the student captures the source, it is HIDDEN — they answer from memory alone. Questions must force recall and application, not reading or re-listening.

Rules:
1. Write EXACTLY 3 questions (or 2 if the slide is very simple).
2. Each question must have EXACTLY 4 options.
3. Every question tests APPLICATION or IMPLICATION — what happens when you use, break, or extend the concept. Never ask for text that appears on the slide.
4. A question fails if a student who never saw the slide could eliminate options by logic, or if a student who glanced at the slide could answer by skimming. Rewrite it.
5. Distractors must be plausible misconceptions or common errors — not obviously wrong.
6. The explanation must say WHY the correct answer is right and why the most tempting wrong answer is wrong.

BAD question (fails rule 3): "Which three characteristics are listed on this slide?"
GOOD question: "A student applies this concept but uses soft drop shadows and muted colours. Which rule does that violate and what is the likely visual effect?"

Output language: match the language of the slide.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify the Supabase session token
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const { image, audio, subject } = req.body
  if (!image && !audio) return res.status(400).json({ error: 'image or audio is required' })

  const parts = [
    { text: `Subject: ${subject || 'General'}. Generate a topic, title, tags, and questions for this ${image ? 'lecture slide' : 'recorded explanation'}.` },
  ]

  if (image) {
    const { mimeType, data } = parseDataUrl(image, 'image/jpeg')
    parts.push({ inlineData: { mimeType, data } })
  }

  if (audio) {
    const { mimeType, data } = parseDataUrl(audio, 'audio/webm')
    parts.push({ inlineData: { mimeType, data } })
  }

  const call = () => ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: NOTE_SCHEMA,
      temperature: 0.4,
    },
  })

  try {
    let response
    try {
      response = await call()
    } catch (err) {
      if (err?.status === 503 || err?.code === 503) {
        await new Promise(r => setTimeout(r, 3000))
        response = await call()
      } else {
        throw err
      }
    }
    const result = JSON.parse(response.text)
    return res.status(200).json(result)
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(500).json({ error: 'Generation failed', detail: err.message })
  }
}
