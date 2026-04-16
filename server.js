const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/claude', async (req, res) => {
  const { prompt, anthropicKey } = req.body;
  if (!anthropicKey) return res.status(400).json({ error: 'Missing Anthropic key' });
  try {
    const r = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
    });
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.error?.message || e.message });
  }
});

app.post('/api/elevenlabs', async (req, res) => {
  const { lyrics, elevenKey } = req.body;
  if (!elevenKey) return res.status(400).json({ error: 'Missing ElevenLabs key' });
  try {
    const r = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      { text: lyrics, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.35, similarity_boost: 0.75, style: 0.65, use_speaker_boost: true } },
      { headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' }
    );
    res.set('Content-Type', 'audio/mpeg');
    res.send(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TextTunes running on http://localhost:${PORT}`));
