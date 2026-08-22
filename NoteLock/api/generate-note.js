import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { getFormat } from '../src/formats/index.js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

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

  const { image, formatId } = req.body
  if (!image) return res.status(400).json({ error: 'image is required' })

  const format = getFormat(formatId)
  if (!format) {
    return res.status(400).json({ error: `Unknown formatId: ${formatId}` })
  }

  // Strip the data URL prefix to get raw base64
  const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg'
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  const call = () => ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${format.promptHint} Generate the note content for this lecture slide.` },
          { inlineData: { mimeType, data: base64Data } },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: format.schema,
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
