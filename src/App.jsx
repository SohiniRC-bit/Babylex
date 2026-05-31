import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PRESETS = [
  { label: "Look at the doggy!", text: "Look at the doggy! See the doggy? Big doggy!" },
  { label: "Where's your nose?", text: "Where's your nose? Can you find your nose? There it is!" },
  { label: "Do you want milk?", text: "Do you want milk? Nice warm milk? Yummy milk for baby!" },
  { label: "Wave bye-bye!", text: "Wave bye-bye! Bye-bye dada! Say bye-bye!" }
]

const COLORS = ['#7EB8F7', '#5ECFB1', '#F4A96A', '#E07B9A', '#A78BFA']

const speak = (text) => {
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.pitch = 1.6
  utter.rate = 0.82
  utter.volume = 1

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Zira') ||
      v.name.includes('Susan') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Female') ||
      (v.lang.startsWith('en') && v.name.includes('Google') && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en'))

    if (preferred) utter.voice = preferred
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = trySpeak
  } else {
    trySpeak()
  }
}

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0A0C10;
    color: #E8EAF0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app-shell {
    min-height: 100vh;
    background: #0A0C10;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(126,184,247,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(94,207,177,0.05) 0%, transparent 60%);
    padding: 0 0 80px;
  }

  .header {
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 28px 0;
    margin-bottom: 56px;
  }

  .header-inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: baseline;
    gap: 20px;
  }

  .logo {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 600;
    color: #F0F2F8;
    letter-spacing: -0.5px;
  }

  .logo span { color: #7EB8F7; }

  .badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 300;
    color: #5ECFB1;
    border: 1px solid rgba(94,207,177,0.3);
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .main {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 400;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .intro-text {
    font-size: 15px;
    line-height: 1.8;
    color: rgba(232,234,240,0.6);
    margin-bottom: 48px;
    max-width: 580px;
    font-weight: 300;
  }

  .intro-text em { color: #7EB8F7; font-style: normal; }

  .presets-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .preset-btn {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 300;
    color: rgba(232,234,240,0.5);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }

  .preset-btn:hover {
    color: #7EB8F7;
    border-color: rgba(126,184,247,0.35);
    background: rgba(126,184,247,0.06);
  }

  .input-area {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 18px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: #E8EAF0;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    line-height: 1.7;
    margin-bottom: 14px;
  }

  .input-area::placeholder { color: rgba(232,234,240,0.2); }
  .input-area:focus { border-color: rgba(126,184,247,0.4); }

  .analyze-btn {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #0A0C10;
    background: #7EB8F7;
    border: none;
    padding: 12px 28px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    margin-bottom: 56px;
  }

  .analyze-btn:hover:not(:disabled) {
    background: #A8CFFA;
    transform: translateY(-1px);
  }

  .analyze-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .loading-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 56px;
    padding: 20px 0;
  }

  .loading-dots { display: flex; gap: 5px; }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #7EB8F7;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  .loading-text {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.06em;
  }

  .error-msg {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #E07B9A;
    margin-bottom: 32px;
    padding: 14px 18px;
    border: 1px solid rgba(224,123,154,0.2);
    border-radius: 8px;
    background: rgba(224,123,154,0.05);
  }

  .divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 40px 0;
  }

  .utterance-display {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 22px 24px;
    margin-bottom: 40px;
    line-height: 1.9;
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .chart-wrap { margin-bottom: 40px; }

  .word-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 40px;
  }

  .word-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    transition: border-color 0.2s;
  }

  .word-card:hover { border-color: rgba(255,255,255,0.12); }

  .score-pill {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    min-width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .word-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 400;
    margin-bottom: 4px;
    color: #F0F2F8;
  }

  .word-reason {
    font-size: 13px;
    font-weight: 300;
    color: rgba(232,234,240,0.45);
    line-height: 1.6;
  }

  .caregiver-block {
    border-left: 2px solid rgba(94,207,177,0.4);
    padding: 20px 24px;
    margin-bottom: 40px;
    background: rgba(94,207,177,0.03);
    border-radius: 0 10px 10px 0;
  }

  .caregiver-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #5ECFB1;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .replay-btn {
    background: rgba(94,207,177,0.1);
    border: 1px solid rgba(94,207,177,0.25);
    color: #5ECFB1;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.06em;
  }

  .replay-btn:hover {
    background: rgba(94,207,177,0.2);
    border-color: rgba(94,207,177,0.5);
  }

  .caregiver-text {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 400;
    color: rgba(232,234,240,0.85);
    line-height: 1.7;
    font-style: italic;
  }

  .research-note {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 22px 24px;
    background: rgba(255,255,255,0.015);
  }

  .research-note-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .research-note-text {
    font-size: 13px;
    font-weight: 300;
    color: rgba(232,234,240,0.4);
    line-height: 1.85;
  }

  .research-note-text strong {
    color: rgba(232,234,240,0.65);
    font-weight: 400;
  }

  .custom-tooltip {
    background: #13161C;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #E8EAF0;
  }

  /* ─── Visual grounding panel (CLIP model) ─── */
  .upload-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
  }

  .file-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(232,234,240,0.5);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 9px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }

  .file-label:hover {
    color: #5ECFB1;
    border-color: rgba(94,207,177,0.35);
    background: rgba(94,207,177,0.06);
  }

  .words-input {
    flex: 1;
    min-width: 220px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    color: #E8EAF0;
    outline: none;
    transition: border-color 0.2s;
  }

  .words-input:focus { border-color: rgba(94,207,177,0.4); }

  .ground-btn {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #0A0C10;
    background: #5ECFB1;
    border: none;
    padding: 11px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }

  .ground-btn:hover:not(:disabled) {
    background: #7FE0C6;
    transform: translateY(-1px);
  }

  .ground-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .ground-preview {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-top: 8px;
    margin-bottom: 40px;
  }

  .ground-img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .ground-results {
    flex: 1;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .ground-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ground-word {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    min-width: 90px;
  }

  .ground-bar-track {
    flex: 1;
    height: 8px;
    background: rgba(255,255,255,0.06);
    border-radius: 4px;
    overflow: hidden;
  }

  .ground-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .ground-pct {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    min-width: 52px;
    text-align: right;
    color: rgba(232,234,240,0.6);
  }
`

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div style={{ color: payload[0].fill }}>{payload[0].payload.word}</div>
        <div style={{ color: 'rgba(232,234,240,0.5)', marginTop: 4 }}>{payload[0].value}/10</div>
      </div>
    )
  }
  return null
}

export default function App() {
  const [utterance, setUtterance] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ─── Visual grounding (CLIP) state ───
  const [groundImage, setGroundImage] = useState(null)
  const [groundWords, setGroundWords] = useState('apple, dog, ball, car, cup')
  const [grounding, setGrounding] = useState(null)
  const [groundingLoading, setGroundingLoading] = useState(false)
  const [groundingError, setGroundingError] = useState('')

  // Local dev points at the Python CLIP service on :7860.
  // After deploying to Hugging Face, replace the production URL below.
  const ML_URL = import.meta.env.DEV
    ? 'http://localhost:7860'
    : 'https://sohini-rc-babylex-clip.hf.space'

  const analyze = async (text) => {
    const input = text || utterance
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const words = input.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(w => w.length > 1)
      const topWord = words.sort((a, b) => a.length - b.length)[0] || words[0] || 'ball'

      const { data } = await axios.post((import.meta.env.DEV ? 'http://localhost:3001/api/analyze' : '/api/analyze'), { utterance: input, topWord })
      setResult({ ...data, utterance: input })
      setTimeout(() => speak(data.caregiverResponse), 600)

    } catch {
      setError('Connection failed — is the server running on port 3001?')
    }
    setLoading(false)
  }

  const handlePreset = (preset) => {
    setUtterance(preset.text)
    analyze(preset.text)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setGroundImage(reader.result)   // data:image/...;base64,xxxx
      setGrounding(null)
      setGroundingError('')
    }
    reader.readAsDataURL(file)
  }

  const runGrounding = async () => {
    if (!groundImage) return
    const words = groundWords.split(',').map(w => w.trim()).filter(Boolean)
    if (words.length === 0) {
      setGroundingError('Add at least one candidate word.')
      return
    }
    setGroundingLoading(true)
    setGroundingError('')
    setGrounding(null)
    try {
      const { data } = await axios.post(`${ML_URL}/ground`, { image_b64: groundImage, words })
      setGrounding(data.scores)   // [{word, score}, ...] sorted high→low
    } catch {
      setGroundingError('Grounding failed — is the CLIP model running on port 7860 (or your HF Space)?')
    }
    setGroundingLoading(false)
  }

  const getHighlightedTokens = () => {
    if (!result) return null
    const segWords = result.segments.map(s => s.word.toLowerCase())
    return result.utterance.split(' ').map((word, i) => {
      const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
      const idx = segWords.indexOf(clean)
      if (idx !== -1) {
        return (
          <span key={i} style={{
            color: COLORS[idx % COLORS.length],
            background: COLORS[idx % COLORS.length] + '18',
            borderRadius: '5px',
            padding: '1px 5px',
            marginRight: '5px',
            border: `1px solid ${COLORS[idx % COLORS.length]}30`,
            fontWeight: 400
          }}>{word}</span>
        )
      }
      return <span key={i} style={{ marginRight: '5px', color: 'rgba(232,234,240,0.35)' }}>{word}</span>
    })
  }

  return (
    <>
      <style>{style}</style>
      <div className="app-shell">
        <header className="header">
          <div className="header-inner">
            <div className="logo">Baby<span>Lex</span></div>
            <div className="badge">Research Demo · Inria MIAI</div>
          </div>
        </header>

        <main className="main">
          <p className="section-label">About this tool</p>
          <p className="intro-text">
            Exploring how infants segment <em>child-directed speech</em> into learnable lexical units —
            and how caregiver social feedback reinforces word acquisition.
            Built to demonstrate the research questions behind multimodal and socially-grounded SpeechLMs.
          </p>

          <p className="section-label">Try an example</p>
          <div className="presets-row">
            {PRESETS.map(p => (
              <button key={p.label} className="preset-btn" onClick={() => handlePreset(p)}>
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            className="input-area"
            value={utterance}
            onChange={e => setUtterance(e.target.value)}
            placeholder="Type a caregiver utterance… e.g. 'Look at the ball! Big red ball!'"
            rows={3}
          />

          <br />
          <button
            className="analyze-btn"
            onClick={() => analyze()}
            disabled={loading || !utterance.trim()}
          >
            {loading ? 'Analyzing…' : 'Analyze utterance'}
          </button>

          {loading && (
            <div className="loading-row">
              <div className="loading-dots">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
              <span className="loading-text">Segmenting speech stream…</span>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          {result && (
            <div>
              <hr className="divider" />

              <p className="section-label">Utterance — candidate words highlighted</p>
              <div className="utterance-display">
                {getHighlightedTokens()}
              </div>

              <p className="section-label">Learnability scores</p>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.segments} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <XAxis
                      dataKey="word"
                      tick={{ fontSize: 12, fontFamily: 'DM Mono', fill: 'rgba(232,234,240,0.4)' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: 'rgba(232,234,240,0.25)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {result.segments.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="section-label">Word analysis</p>
              <div className="word-cards">
                {result.segments.map((seg, i) => (
                  <div key={i} className="word-card">
                    <div className="score-pill" style={{
                      background: COLORS[i % COLORS.length] + '18',
                      color: COLORS[i % COLORS.length],
                      border: `1px solid ${COLORS[i % COLORS.length]}30`
                    }}>
                      {seg.score}
                    </div>
                    <div>
                      <div className="word-name">{seg.word}</div>
                      <div className="word-reason">{seg.reason}</div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="section-label">Caregiver social response</p>
              <div className="caregiver-block">
                <div className="caregiver-label">
                  Simulated contingent feedback
                  <button className="replay-btn" onClick={() => speak(result.caregiverResponse)}>
                    ▶ replay audio
                  </button>
                </div>
                <div className="caregiver-text">"{result.caregiverResponse}"</div>
              </div>

              <div className="research-note">
                <div className="research-note-label">Research note</div>
                <p className="research-note-text">
                  This tool demonstrates two core challenges in the MIAI DevAI&Speech programme:
                  <strong> lexical discovery</strong> — how word boundaries emerge from a continuous speech stream — and
                  <strong> social grounding</strong> — how caregiver contingent responses shape word-meaning mappings.
                  The fundamental limitation here is that this LLM operates on statistical text patterns,
                  with no access to <strong>acoustic salience</strong>, prosodic stress, or shared visual attention.
                  That gap — between statistical and grounded language acquisition — is precisely
                  what multimodal SpeechLM training aims to close.
                </p>
              </div>
            </div>
          )}

          {/* ─── Visual grounding: a real CLIP model closing the "shared visual attention" gap ─── */}
          <hr className="divider" />

          <p className="section-label">Visual grounding — live CLIP model</p>
          <p className="intro-text" style={{ marginBottom: 24 }}>
            The analysis above is text-only. Here a real vision-language model
            (<em>OpenAI CLIP</em>) grounds a word directly in an <em>image</em> — the shared
            visual attention the research note describes as missing. Upload a picture of an object,
            list candidate words, and the model scores which word the image grounds to.
          </p>

          <div className="upload-row">
            <label className="file-label">
              {groundImage ? 'Change image' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <input
              className="words-input"
              value={groundWords}
              onChange={e => setGroundWords(e.target.value)}
              placeholder="candidate words, comma-separated"
            />
            <button
              className="ground-btn"
              onClick={runGrounding}
              disabled={groundingLoading || !groundImage}
            >
              {groundingLoading ? 'Grounding…' : 'Ground'}
            </button>
          </div>

          {groundingError && <div className="error-msg">{groundingError}</div>}

          {groundImage && (
            <div className="ground-preview">
              <img className="ground-img" src={groundImage} alt="to ground" />
              <div className="ground-results">
                {grounding ? grounding.map((g, i) => (
                  <div className="ground-bar-row" key={g.word}>
                    <span className="ground-word" style={{ color: i === 0 ? '#5ECFB1' : 'rgba(232,234,240,0.7)' }}>
                      {g.word}{i === 0 ? ' ●' : ''}
                    </span>
                    <div className="ground-bar-track">
                      <div className="ground-bar-fill" style={{
                        width: `${(g.score * 100).toFixed(0)}%`,
                        background: i === 0 ? '#5ECFB1' : '#7EB8F7',
                        opacity: i === 0 ? 1 : 0.5
                      }} />
                    </div>
                    <span className="ground-pct">{(g.score * 100).toFixed(1)}%</span>
                  </div>
                )) : (
                  <span className="loading-text">Image ready — click “Ground” to run the model.</span>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}