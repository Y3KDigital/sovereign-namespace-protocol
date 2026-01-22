from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.image_generator import image_generator
from fastapi.responses import FileResponse
import os
import uuid

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str

@router.post("/generate/image")
async def generate_image(req: ImageRequest):
    try:
        image = image_generator.generate(req.prompt)
        filename = f"generated_image_{uuid.uuid4()}.png"
        path = os.path.join("static", filename)
        os.makedirs("static", exist_ok=True)
        image.save(path)
        return FileResponse(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
