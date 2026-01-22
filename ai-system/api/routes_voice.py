from fastapi import APIRouter, Request, HTTPException
from telnyx.call_flow import telnyx_handler
from models.voice_agent import voice_agent
from pydantic import BaseModel

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/telnyx/webhook")
async def telnyx_webhook(request: Request):
    data = await request.json()
    return await telnyx_handler.handle_webhook(data)

@router.post("/voice/tts")
async def text_to_speech(req: TTSRequest):
    # For local TTS, we could implement models here.
    # For now, this is a placeholder or could use a lightweight library if needed.
    return {"status": "not_implemented_locally", "message": "Use Telnyx phone channel for TTS"}

@router.post("/voice/chat")
async def ai_chat(req: TTSRequest):
    response = voice_agent.generate_response(req.text)
    return {"response": response}
