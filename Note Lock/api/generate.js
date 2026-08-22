export default function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'OPENAI_API_KEY is not set' })
  }
  res.status(200).json({ ok: true, model: process.env.OPENAI_MODEL ?? null })
}
