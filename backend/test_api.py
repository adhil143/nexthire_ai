import os
import google.generativeai as genai

env_path = os.path.join(os.path.dirname(__file__), ".env")
with open(env_path, "r") as f:
    for line in f:
        if line.startswith("GEMINI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            genai.configure(api_key=api_key)
            break

models_to_test = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"]

print("Testing API Key:", api_key[:10] + "...")
for m in models_to_test:
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Hello")
        print(f"[OK] Success with {m}: {response.text.strip()}")
    except Exception as e:
        print(f"[FAIL] Failed with {m}: {str(e)}")
