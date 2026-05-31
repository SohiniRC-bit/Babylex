import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY?.substring(0, 25) + '...')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/analyze', async (req, res) => {
  const { utterance, topWord } = req.body
  const segmentPrompt = `You are modeling how a pre-linguistic infant segments child-directed speech. Given this utterance: "${utterance}" - identify 4-5 word candidates most likely acquired first. For each: word, score (1-10), reason. Respond ONLY with valid JSON array: [{"word":"ball","score":9,"reason":"Short concrete noun"}]`
  const caregiverPrompt = `You are a caregiver using motherese with a baby focused on "${topWord}" from: "${utterance}". Write 1-2 sentences reinforcing that word warmly. ONLY the caregiver words, no labels.`
  try {
    const [segRes, careRes] = await Promise.all([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: segmentPrompt }] })
      }),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, messages: [{ role: 'user', content: caregiverPrompt }] })
      })
    ])
    const segData = await segRes.json()
    const careData = await careRes.json()
    console.log('Seg response:', JSON.stringify(segData).substring(0, 200))
    if (segData.error) return res.status(500).json({ error: segData.error.message })
    const segments = JSON.parse(segData.content[0].text)
    const caregiverResponse = careData.content[0].text
    res.json({ segments, caregiverResponse })
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: 'API call failed', detail: err.message })
  }
})

app.listen(3001, () => console.log('Proxy running on port 3001'))
