import torch
from transformers import pipeline
import whisper
import os
import requests
from config.settings import settings

class VoiceAgent:
    def __init__(self):
        self.llm_pipeline = None
        self.stt_model = None
        self.device = settings.DEVICE

    def load_llm(self):
        if self.llm_pipeline is None:
            print(f"Loading LLM: {settings.MODEL_LLM}...")
            self.llm_pipeline = pipeline(
                "text-generation",
                model=settings.MODEL_LLM,
                torch_dtype=torch.float16,
                device_map="auto", # auto handles accelerate
                token=settings.HF_TOKEN
            )

    def load_stt(self):
        if self.stt_model is None:
            print("Loading Whisper STT...")
            # 'base' is fast, 'medium' is more accurate.
            self.stt_model = whisper.load_model("base", device=self.device)

    def transcribe_audio_url(self, audio_url: str) -> str:
        self.load_stt()
        # Download file
        temp_file = "temp_audio.wav"
        response = requests.get(audio_url)
        with open(temp_file, "wb") as f:
            f.write(response.content)
        
        # Transcribe
        result = self.stt_model.transcribe(temp_file)
        text = result["text"]
        os.remove(temp_file)
        return text.strip()

    def generate_response(self, text_input: str) -> str:
        self.load_llm()
        # Simple chat formatting for TinyLlama
        prompt = f"<|system|>\nYou are a helpful AI assistant answering a phone call. Keep answers short and conversational.<|end|>\n<|user|>\n{text_input}<|end|>\n<|assistant|>\n"
        
        outputs = self.llm_pipeline(
            prompt, 
            max_new_tokens=128, 
            do_sample=True, 
            temperature=0.7, 
            top_k=50, 
            top_p=0.95
        )
        response = outputs[0]["generated_text"].split("<|assistant|>\n")[-1].strip()
        return response

voice_agent = VoiceAgent()
