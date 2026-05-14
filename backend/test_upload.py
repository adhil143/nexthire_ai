import requests
import io

BASE_URL = "http://localhost:8000/api"

# 1. Login to get token
login_data = {"username": "testscript@example.com", "password": "password123"}
r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if r.status_code != 200:
    print("Login failed:", r.status_code, r.text)
    exit(1)

token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload dummy text file
files = {"file": ("test.txt", io.BytesIO(b"Hello world, this is a test resume."), "text/plain")}
r = requests.post(f"{BASE_URL}/resumes/upload", headers=headers, files=files)

print("Upload status:", r.status_code)
print("Upload response:", r.text)
