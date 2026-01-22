import torch
from diffusers import VideoGenerateDiffusionPipeline
from diffusers.utils import export_to_video
from config.settings import settings
import tempfile
import os

class VideoGenerator:
    def __init__(self):
        self.pipe = None
        self.device = settings.DEVICE

    def load_model(self):
        if self.pipe is None:
            print(f"Loading Video Model: {settings.MODEL_VIDEO}...")
            # Note: damo-vilab/text-to-video-ms-1.7b works well with DiffusionPipeline
            self.pipe = VideoGenerateDiffusionPipeline.from_pretrained(
                settings.MODEL_VIDEO,
                torch_dtype=torch.float16,
                variant="fp16",
                use_auth_token=settings.HF_TOKEN
            )
            # Enable CPU offload to save VRAM
            self.pipe.enable_model_cpu_offload()

    def generate(self, prompt: str, num_frames: int = 16):
        self.load_model()
        print(f"Generating video for: {prompt}")
        output = self.pipe(prompt=prompt, num_frames=num_frames, num_inference_steps=25)
        frames = output.frames[0]
        
        # Save to temp file
        temp_dir = tempfile.gettempdir()
        output_path = os.path.join(temp_dir, "generated_video.mp4")
        export_to_video(frames, output_path)
        return output_path

video_generator = VideoGenerator()
