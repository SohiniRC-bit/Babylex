export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { utterance, topWord } = req.body
  if (!utterance || !topWord) {
    return res.status(400).json({ error: 'Missing utterance or topWord' })
  }

  const segmentPrompt = `You are modeling how a pre-linguistic infant segments child-directed speech. Given this utterance: "${utterance}" - identify 4-5 word candidates most likely acquired first. For each: word, score (1-10), reason. Respond ONLY with valid JSON array. No preamble, no markdown: [{"word":"ball","score":9,"reason":"Short concrete noun"}]`

  const caregiverPrompt = `You are a caregiver using motherese with a baby focused on "${topWord}" from: "${utterance}". Write 1-2 sentences reinforcing that word warmly. ONLY the caregiver words, no labels, no quotes.`

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  }

  try {
    const [segRes, careRes] = await Promise.all([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: segmentPrompt }] })
      }),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, messages: [{ role: 'user', content: caregiverPrompt }] })
      })
    ])

    const segData = await segRes.json()
    const careData = await careRes.json()

    if (segData.error) return res.status(500).json({ error: segData.error.message })

    const segments = JSON.parse(segData.content[0].text)
    const caregiverResponse = careData.content[0].text.trim()

    return res.status(200).json({ segments, caregiverResponse })
  } catch (err) {
    return res.status(500).json({ error: 'API call failed', detail: err.message })
  }
}