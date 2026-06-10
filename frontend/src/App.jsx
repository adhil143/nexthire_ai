import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import InterviewCoach from './pages/InterviewCoach';
import RoadmapPage from './pages/Roadmap';
import JobMatcher from './pages/JobMatcher';
import VoiceInterview from './pages/VoiceInterview';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Global Glassmorphic Background Blobs */}
        <div className="fixed inset-0 -z-20 bg-slate-50 dark:bg-[#05060b] transition-colors duration-500" />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Glowing blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 dark:from-purple-600/15 dark:to-cyan-600/15 rounded-full blur-[120px] opacity-80" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[900px] bg-gradient-to-br from-purple-500/10 to-pink-500/5 dark:from-indigo-600/10 dark:to-fuchsia-600/10 rounded-full blur-[150px] opacity-80" />
          <div className="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] max-w-[500px] bg-indigo-500/5 dark:bg-cyan-500/5 rounded-full blur-[100px] opacity-60" />
          {/* Fine grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-coach"
            element={
              <ProtectedRoute>
                <InterviewCoach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-matcher"
            element={
              <ProtectedRoute>
                <JobMatcher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-coach"
            element={
              <ProtectedRoute>
                <VoiceInterview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
