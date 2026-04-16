# TextTunes Ad Machine

Turn text convos into viral song ads. Runs locally, works on any device on your network.

## Setup (2 minutes)

### 1. Install Node.js
Download from https://nodejs.org (click "LTS" version)

### 2. Run the app
Open Terminal (Mac) or Command Prompt (Windows), then:

```bash
cd texttunes
npm install
node server.js
```

You'll see: `TextTunes running on http://localhost:3000`

### 3. Open in browser
Go to: http://localhost:3000

### 4. Add your API keys
- Click ⚙️ in the app
- Paste your **Anthropic key** (from console.anthropic.com)
- Paste your **ElevenLabs key** (optional, for real audio — from elevenlabs.io)
- Click Save

### 5. Use it
- **Hardcoded scenarios**: Pick one, hit Play, screen record
- **AI mode**: Type any scenario in the text box, hit ✨ AI
- **Content tab**: Copy captions for every platform
- **Strategy tab**: Full viral playbook

## Access from your phone
If your phone is on the same WiFi:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. Go to `http://YOUR_IP:3000` on your phone

## Deploy to the web (free)
1. Push this folder to GitHub
2. Go to render.com → New Web Service → connect repo
3. Set environment variables for keys if you want them pre-loaded
4. Free tier works fine

## Files
- `server.js` — Express backend, proxies API calls
- `public/index.html` — Full frontend
- `package.json` — Dependencies
