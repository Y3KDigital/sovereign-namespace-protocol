# Local AI System

A complete, locally hosted AI stack featuring:
- **Text-to-Image** (Stable Diffusion XL)
- **Text-to-Video** (ModelScope / WAN-class)
- **Voice Agent** (Whisper + LLM + Telnyx Integration)

## Prerequisites
1. NVIDIA GPU (8GB+ VRAM recommended)
2. Docker & Docker Compose
3. Hugging Face Account (Pro recommended for faster downloads/gated models)
4. Telnyx Account (for phone integration)

## Installation

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in your `HF_TOKEN` and `TELNYX_API_KEY`.

2. Build and Run:
   ```bash
   docker compose up --build
   ```

## Usage

### Image Generation
```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a cyberpunk city in the rain"}'
```

### Video Generation
```bash
curl -X POST http://localhost:8000/generate/video \
  -H "Content-Type: application/json" \
  -d '{"prompt":"drone flying over a futuristic city"}'
```

### Voice Agent Setup
1. Expose port 8000 to the internet (Cloudflare Tunnel / ngrok).
2. Set your Telnyx Number's "Call Control Webhook" to `https://your-url.com/telnyx/webhook`.
3. Call the number.

## Models Used
- Image: `stabilityai/stable-diffusion-xl-base-1.0`
- Video: `damo-vilab/text-to-video-ms-1.7b`
- Chat: `TinyLlama/TinyLlama-1.1B-Chat-v1.0`
- STT: `openai/whisper-base`
