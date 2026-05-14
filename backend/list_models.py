import os
import google.generativeai as genai

# Load .env manually to avoid extra dependencies in script
env_path = os.path.join(os.path.dirname(__file__), ".env")
with open(env_path, "r") as f:
    for line in f:
        if line.startswith("GEMINI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            genai.configure(api_key=api_key)
            break

print("Available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("Error listing models:", str(e))
