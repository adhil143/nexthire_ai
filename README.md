# NextHire AI 🚀

NextHire AI is a modern, premium AI-powered career platform designed to help professionals master their next interview. The platform features intelligent resume analysis, automated career roadmap generation, and real-time interactive voice mock interviews.

## 🌟 Features

*   **Intelligent Resume Matching**: Upload your resume (PDF/DOCX/TXT) to instantly get an ATS score, extract your top skills, and view personalized improvement analytics.
*   **Voice Mock Interview Engine**: Practice with our cutting-edge AI Coach in real-time. Features live speech-to-text transcription, automated text-to-speech AI responses, and deep analytics on your speaking pace (WPM) and filler word usage.
*   **Automated Career Roadmaps**: Generate step-by-step learning paths and actionable goals tailored to your resume and career aspirations.
*   **Premium Glassmorphism UI**: A stunning, state-of-the-art interface built with Tailwind CSS. It features a custom Light Mode (frosted glass mesh gradients) and a deep-space Dark Mode, both fully responsive.
*   **Secure Authentication**: JWT-based user authentication ensuring your data and interview history are completely private.

## 🛠️ Technology Stack

**Frontend:**
*   React.js + Vite
*   Tailwind CSS (with custom Glassmorphism themes)
*   Recharts (for Data Visualization)
*   Web Speech API (for real-time STT and TTS)
*   React Router DOM

**Backend:**
*   FastAPI (Python)
*   PostgreSQL + SQLAlchemy (ORM)
*   Google Gemini Pro / Flash API (for AI Evaluation)
*   Passlib + PyJWT (for secure Auth)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python 3.10+
*   PostgreSQL installed and running
*   A Google Gemini API Key

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    venv\Scripts\activate  # On Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in the `backend` folder:
    ```env
    DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexthire_db
    SECRET_KEY=your_super_secret_jwt_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
5.  Initialize the Database:
    Run the creation scripts to build your tables:
    ```bash
    python create_interview_table.py
    python create_voice_table.py
    # (Run other table creation scripts as needed)
    ```
6.  Start the Server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *The API will be available at `http://localhost:8000`*

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *The App will be available at `http://localhost:5173`*

## 🎨 Theme Engine
NextHire AI features a robust custom theme engine. It defaults to the premium Dark Mode. You can easily toggle between the bright, glassmorphism Light Theme and the deep-space Dark Theme using the sun/moon icon in the navigation bar.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Built to redefine how professionals prepare for their next big career move.*
