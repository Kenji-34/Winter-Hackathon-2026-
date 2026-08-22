import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    title: { type: 'string' },
    tags:  { type: 'array', items: { type: 'string' } },
    content: {
      type: 'object',
      properties: {
        summary:  { type: 'string' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
              points:  { type: 'array', items: { type: 'string' } },
            },
            required: ['heading', 'points'],
          },
        },
        keyTerms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term:       { type: 'string' },
              definition: { type: 'string' },
            },
            required: ['term', 'definition'],
          },
        },
        formulas: { type: 'array', items: { type: 'string' } },
      },
      required: ['summary', 'sections', 'keyTerms', 'formulas'],
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q:           { type: 'string' },
          options:     { type: 'array', items: { type: 'string' } },
          answer:      { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['q', 'options', 'answer', 'explanation'],
      },
    },
  },
  required: ['topic', 'title', 'tags', 'content', 'questions'],
}

const SYSTEM_PROMPT = `You are a study assistant that turns lecture slides into structured notes and retrieval-practice questions.

Rules for questions (this is the most important part):
- Write 2–3 questions per slide.
- Every question must test APPLICATION or IMPLICATION of the concept — never ask for text that appears verbatim on the slide.
- A question is failed if a student could answer it by skimming the slide. Do not write that question.
- Distractors must be plausible-but-wrong applications, not obviously silly options.
- Example of a bad question: "What three characteristics are listed?" — answerable by reading.
- Example of a good question: "A designer uses thin grey borders and soft drop shadows. Which principle on this slide does that violate, and why?" — requires understanding.

Output language: match the language of the slide content.`

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

  const { image, subject } = req.body
  if (!image) return res.status(400).json({ error: 'image is required' })

  // Strip the data URL prefix to get raw base64
  const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg'
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Subject: ${subject || 'General'}. Generate notes and questions for this lecture slide.` },
            { inlineData: { mimeType, data: base64Data } },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: NOTE_SCHEMA,
      },
    })

    const result = JSON.parse(response.text)
    return res.status(200).json(result)
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(500).json({ error: 'Generation failed', detail: err.message })
  }
}
