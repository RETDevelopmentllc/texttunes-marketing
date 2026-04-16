const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
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
  const { lyrics, elevenKey, songTitle } = req.body;
  if (!elevenKey) return res.status(400).json({ error: 'Missing ElevenLabs key' });
  try {
    // Use ElevenLabs Music API to generate an actual sung song
    const prompt = `A 20-second catchy upbeat pop song with strong sung female vocals, fun melody, and a full instrumental beat. The singer should SING melodically, not speak or rap. The song is humorous and inspired by this theme: "${songTitle || 'Untitled'}". Sung lyrics: ${lyrics}`;
    const r = await axios.post(
      'https://api.elevenlabs.io/v1/music/compose',
      { prompt, music_length_ms: 20000 },
      { headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' }, responseType: 'arraybuffer', timeout: 120000 }
    );
    res.set('Content-Type', 'audio/mpeg');
    res.send(r.data);
  } catch (e) {
    // If music API fails with bad_prompt, try the suggested prompt
    if (e.response?.data) {
      try {
        const errData = JSON.parse(Buffer.from(e.response.data).toString());
        if (errData.detail?.prompt_suggestion) {
          const retry = await axios.post(
            'https://api.elevenlabs.io/v1/music/compose',
            { prompt: errData.detail.prompt_suggestion, music_length_ms: 20000 },
            { headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' }, responseType: 'arraybuffer', timeout: 120000 }
          );
          res.set('Content-Type', 'audio/mpeg');
          return res.send(retry.data);
        }
        res.status(e.response?.status || 500).json({ error: errData.detail?.message || e.message });
      } catch (parseErr) {
        res.status(e.response?.status || 500).json({ error: e.message });
      }
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

// Convert WebM to MP4 using ffmpeg
app.post('/api/convert-mp4', (req, res) => {
  const { video } = req.body; // base64 encoded webm
  if (!video) return res.status(400).json({ error: 'No video data' });

  const tmpDir = os.tmpdir();
  const id = Date.now() + '_' + Math.random().toString(36).slice(2);
  const webmPath = path.join(tmpDir, `${id}.webm`);
  const mp4Path = path.join(tmpDir, `${id}.mp4`);

  // Write base64 WebM to temp file
  const buffer = Buffer.from(video, 'base64');
  fs.writeFileSync(webmPath, buffer);

  // Convert with ffmpeg
  execFile('ffmpeg', [
    '-i', webmPath,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', mp4Path
  ], { timeout: 60000 }, (err) => {
    // Clean up webm
    try { fs.unlinkSync(webmPath); } catch(e) {}

    if (err) {
      try { fs.unlinkSync(mp4Path); } catch(e) {}
      return res.status(500).json({ error: 'Conversion failed: ' + err.message });
    }

    // Read and send MP4
    const mp4Buffer = fs.readFileSync(mp4Path);
    try { fs.unlinkSync(mp4Path); } catch(e) {}

    res.set('Content-Type', 'video/mp4');
    res.set('Content-Disposition', 'attachment; filename="TextTunes_Ad.mp4"');
    res.send(mp4Buffer);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TextTunes running on http://localhost:${PORT}`));
