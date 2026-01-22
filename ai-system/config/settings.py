import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HF_TOKEN: str = ""
    TELNYX_API_KEY: str = ""
    TELNYX_PUBLIC_URL: str = "http://localhost:8000"
    DEVICE: str = "cuda"
    
    # Model IDs
    MODEL_IMAGE: str = "stabilityai/stable-diffusion-xl-base-1.0"
    MODEL_VIDEO: str = "damo-vilab/text-to-video-ms-1.7b"
    MODEL_LLM: str = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    
    class Config:
        env_file = ".env"

settings = Settings()
