import win32com.client
import sys

def speak(text):
    try:
        import win32com.client
        speaker = win32com.client.Dispatch("SAPI.SpVoice")
        for voice in speaker.GetVoices():
            desc = voice.GetDescription()
            if "Portuguese" in desc or "Maria" in desc or "Daniel" in desc:
                speaker.Voice = voice
                break
        speaker.Speak(text)
        return True
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    msg = sys.argv[1] if len(sys.argv) > 1 else "Olá Guilherme, sistema Jarvis operacional."
    res = speak(msg)
    print("Result:", res)
