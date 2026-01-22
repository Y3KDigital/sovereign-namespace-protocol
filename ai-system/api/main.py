from fastapi import FastAPI
from api.routes_image import router as image_router
from api.routes_video import router as video_router
from api.routes_voice import router as voice_router
import uvicorn
import os

app = FastAPI(title="Local AI System")

app.include_router(image_router)
app.include_router(video_router)
app.include_router(voice_router)

@app.get("/health")
def health_check():
    return {"status": "operational", "gpu": "available" if os.environ.get("CUDA_VISIBLE_DEVICES") != "-1" else "unknown"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
