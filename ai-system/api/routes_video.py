from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.video_generator import video_generator
from fastapi.responses import FileResponse

router = APIRouter()

class VideoRequest(BaseModel):
    prompt: str

@router.post("/generate/video")
async def generate_video(req: VideoRequest):
    try:
        video_path = video_generator.generate(req.prompt)
        return FileResponse(video_path, media_type="video/mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
