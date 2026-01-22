# Local AI System - Quick Start Guide (Windows)

## ✅ System Already Built!

Your AI system is complete and ready to run. Here's how to start it on Windows.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Environment

Edit [.env](.env) and add your tokens:

```env
HF_TOKEN=hf_your_token_here
TELNYX_API_KEY=KEY_your_telnyx_key
TELNYX_PUBLIC_URL=http://localhost:8000
DEVICE=cuda
```

**Get Tokens:**
- Hugging Face: https://huggingface.co/settings/tokens
- Telnyx: https://portal.telnyx.com

---

### Step 2: Start the System

**Option A: With Docker (Recommended)**
```powershell
docker compose up --build
```

**Option B: With PowerShell Script**
```powershell
.\start-ai-system.ps1 -HF_TOKEN "your_token" -TELNYX_KEY "your_key"
```

**Option C: Manual (Local Python)**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd api
python main.py
```

---

### Step 3: Test It

Run the test script:
```powershell
.\test-system.ps1
```

Or manually test endpoints:

**Health Check:**
```powershell
Invoke-RestMethod http://localhost:8000/health
```

**Generate Image:**
```powershell
$body = '{"prompt":"cyberpunk city at night"}' | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/generate/image -Method POST -Body $body -ContentType "application/json" -OutFile "output.png"
```

**AI Chat:**
```powershell
$body = '{"text":"Hello, who are you?"}' | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/voice/chat -Method POST -Body $body -ContentType "application/json"
```

---

## 📞 Telnyx Phone Integration

### Step 1: Expose to Internet
```powershell
cloudflared tunnel --url http://localhost:8000
```
Copy the public URL (e.g., `https://random-words.trycloudflare.com`)

### Step 2: Configure Telnyx
1. Go to: https://portal.telnyx.com
2. Navigate to **Call Control** → **Applications**
3. Create/Edit your application
4. Set **Webhook URL** to: `https://your-tunnel-url/telnyx/webhook`
5. Assign a phone number to this application

### Step 3: Call Your Number
The AI will:
1. Answer the call
2. Greet you
3. Record your voice
4. Transcribe with Whisper (local)
5. Generate response with LLM
6. Speak back to you

---

## 🎯 What's Included

| Feature | Endpoint | Model |
|---------|----------|-------|
| Text → Image | `/generate/image` | Stable Diffusion XL |
| Text → Video | `/generate/video` | ModelScope Text-to-Video 1.7B |
| Voice Agent | `/telnyx/webhook` | Whisper + TinyLlama |
| AI Chat | `/voice/chat` | TinyLlama 1.1B |
| Health Check | `/health` | System Status |

---

## 🔧 Troubleshooting

### "CUDA out of memory"
**Solution:** Reduce batch size or use CPU:
```env
DEVICE=cpu
```

### "Telnyx webhook not working"
**Solution:** Ensure tunnel is running and webhook URL is correct:
```powershell
# Test webhook locally first
$body = '{"event_type":"call.initiated","payload":{"call_control_id":"test123"}}' | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/telnyx/webhook -Method POST -Body $body -ContentType "application/json"
```

### "Models downloading slowly"
**Solution:** Use Hugging Face Pro for faster downloads. Alternatively, pre-download:
```powershell
python scripts/download_models.py
```

---

## 🎨 Customization

### Add New Models

Edit `config/settings.py`:
```python
MODEL_IMAGE = "your-model/name-here"
MODEL_VIDEO = "another-model/video-model"
MODEL_LLM = "your-llm/model"
```

### Change Inference Device

Edit `.env`:
```env
DEVICE=cpu  # For CPU-only
DEVICE=cuda # For NVIDIA GPU
```

---

## 📊 System Requirements

**Minimum:**
- Python 3.10+
- 8GB RAM
- 20GB disk space

**Recommended:**
- NVIDIA GPU (8GB+ VRAM)
- 16GB+ RAM
- 50GB disk space (for models)

---

## 🚀 Next Steps

Want to extend this system?

### Option 1: Add Gradio Web UI
Create a user-friendly web interface for non-technical users.

### Option 2: Multi-Model Video
Integrate WAN 2.5 or other advanced video models.

### Option 3: Blockchain Integration
Log AI interactions to XRPL for immutable audit trails.

### Option 4: Multi-Agent System
Route calls to specialized agents based on intent.

Let me know which direction you want, and I'll build it!

---

## 📝 File Structure

```
ai-system/
├── api/
│   ├── main.py              # FastAPI server
│   ├── routes_image.py      # Image generation endpoint
│   ├── routes_video.py      # Video generation endpoint
│   └── routes_voice.py      # Voice & Telnyx endpoints
├── models/
│   ├── image_generator.py   # SDXL wrapper
│   ├── video_generator.py   # Video model wrapper
│   └── voice_agent.py       # Whisper + LLM
├── telnyx/
│   └── call_flow.py         # Telnyx webhook handler
├── config/
│   └── settings.py          # Environment config
├── scripts/
│   ├── download_models.py   # Pre-download models
│   └── start.sh             # Linux startup script
├── .env                     # Your secrets (gitignored)
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container definition
├── docker-compose.yml       # Orchestration
├── start-ai-system.ps1      # Windows startup script
├── test-system.ps1          # Test all endpoints
└── README.md                # This file
```

---

**Status:** ✅ Ready to Launch

Run `.\start-ai-system.ps1` to begin!
