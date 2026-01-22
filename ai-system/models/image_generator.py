import torch
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler
from config.settings import settings
import gc

class ImageGenerator:
    def __init__(self):
        self.pipe = None
        self.device = settings.DEVICE

    def load_model(self):
        if self.pipe is None:
            print(f"Loading Image Model: {settings.MODEL_IMAGE}...")
            self.pipe = DiffusionPipeline.from_pretrained(
                settings.MODEL_IMAGE,
                torch_dtype=torch.float16,
                use_safetensors=True,
                variant="fp16",
                use_auth_token=settings.HF_TOKEN
            )
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(self.pipe.scheduler.config)
            self.pipe.to(self.device)
            # Optimize for memory if using consumer GPU
            self.pipe.enable_model_cpu_offload() 

    def generate(self, prompt: str, steps: int = 30):
        self.load_model()
        image = self.pipe(prompt=prompt, num_inference_steps=steps).images[0]
        return image

image_generator = ImageGenerator()
