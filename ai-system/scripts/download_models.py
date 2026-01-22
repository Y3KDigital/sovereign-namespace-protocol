import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.settings import settings
print("Pre-downloading models... This might take a while.")

# Trigger loads
from models.image_generator import image_generator
try:
    image_generator.load_model()
    print("Image model loaded.")
except Exception as e:
    print(f"Image model failed: {e}")

from models.video_generator import video_generator
# Video load usually requires heavy download, skipping automatic pre-load to avoid timeout in prompt context,
# but can be run manually.

from models.voice_agent import voice_agent
try:
    voice_agent.load_llm()
    print("LLM loaded.")
    voice_agent.load_stt()
    print("STT loaded.")
except Exception as e:
    print(f"Voice models failed: {e}")

print("Download complete.")
