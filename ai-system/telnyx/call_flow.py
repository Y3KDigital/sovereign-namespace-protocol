import telnyx
from config.settings import settings
import json

telnyx.api_key = settings.TELNYX_API_KEY

class TelnyxCallHandler:
    async def handle_webhook(self, data: dict):
        event_type = data.get("event_type")
        payload = data.get("payload", {})
        call_control_id = payload.get("call_control_id")
        
        print(f"Received Telnyx Event: {event_type} | Call ID: {call_control_id}")

        if not call_control_id:
            return {"status": "ignored", "reason": "no_call_control_id"}

        try:
            if event_type == "call.initiated":
                # Answer the call
                print("Answering call...")
                telnyx.Call.answer(
                    telnyx.Call(), 
                    call_control_id=call_control_id
                )

            elif event_type == "call.answered":
                # Speak greeting and wait for input
                print("Call answered, speaking greeting...")
                self.speak_and_gather(call_control_id, "Hello! I am your local A I system. How can I help you today?")

            elif event_type == "call.gather.ended":
                # We have recording/input
                print("Input gathered.")
                audio_url = payload.get("recording_url") # If using recording
                # Note: gather often returns digits or speech text if using 'simultaneous_transcription'
                # But here we assume standard simplistic gather.
                # For speech, we ideally want a recording so we can transcribe it locally with Whisper.
                # 'gather_using_speak' -> creates a temporary recording url if configured.
                
                # However, gather webhook payload usually contains 'speech_result' if ASR is enabled on Telnyx side.
                # But we want LOCAL Whisper. So we check if there is a 'recording_url' from a 'record' action.
                # Simpler flow: Record -> webhook -> Transcribe -> Respond.
                pass
            
            # Simplified flow: we actually need to RECORD to get audio for Whisper.
            # 1. Answer -> call.answered
            # 2. Speak -> call.speak.ended
            # 3. Record -> call.recording.saved (This gives us the URL for Whisper)
            
            elif event_type == "call.speak.ended":
                # Start recording user input
                print("Speak ended, starting recording...")
                telnyx.Call.record_start(
                    telnyx.Call(),
                    call_control_id=call_control_id,
                    format="wav",
                    channels="single",
                    play_beep=True,
                    timeout_secs=5 # Record for 5 seconds of silence or until timeout
                )

            elif event_type == "call.recording.saved":
                recording_url = payload.get("recording_url")
                print(f"Recording saved: {recording_url}")
                
                # Process with Local Voice Agent
                from models.voice_agent import voice_agent
                
                user_text = voice_agent.transcribe_audio_url(recording_url)
                print(f"User said: {user_text}")
                
                ai_response = voice_agent.generate_response(user_text)
                print(f"AI Responding: {ai_response}")
                
                # Speak response
                self.speak_and_gather(call_control_id, ai_response)
                
        except Exception as e:
            print(f"Error handling flow: {e}")

        return {"status": "ok"}

    def speak_and_gather(self, call_id, text):
        # Speak text
        telnyx.Call.speak(
            telnyx.Call(),
            call_control_id=call_id,
            payload=text,
            voice="female",
            language="en-US"
        )
        # Note: We rely on 'call.speak.ended' event to trigger recording start
        # This creates a loop: Speak -> Ended -> Record -> Saved -> Process -> Speak

telnyx_handler = TelnyxCallHandler()
