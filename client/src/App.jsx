import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './component/navbar/Navbar';
import LandingPage from './Pages/LandingPage/LandingPage';
import About from './Pages/About/About';
import Login from './Auth/Login/Login';
import Register from './Auth/Register/Register';
import ForgotPassword from './Auth/ForgotPassword/ForgotPassword';
import GetToKnow from './Pages/GetToKnow/GetToKnow';
import ZodiacResult from './Pages/ZodiacResult/ZodiacResult';
import UnderTone from './Pages/UnderTone/UnderTone';
import UndertoneResult from './Pages/UnderTone/UndertoneResult';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './Pages/Dashboard/Dashboard';
import Zodiac from './Pages/Zodiac/Zodiac';
import Forecast from './Pages/Forecast/Forecast';
import SingleCard from './Pages/Forecast/Singlecard/SingleCard';
import SingleCardResult from './Pages/Forecast/Singlecard/SingleCardResult';
import HeartHeadPath from './Pages/Forecast/HeartHeadPath/HeartHeadPath';
import HeartHeadPathResult from './Pages/Forecast/HeartHeadPath/HeartHeadPathResult';
import AestheticWelcome from './Pages/Quizzes/AestheticWelcome/AestheticWelcome';
import AestheticQuiz from './Pages/Quizzes/AestheticQuiz/AestheticQuiz';
import AestheticResult from './Pages/Quizzes/AestheticResult/AestheticResult';
import BodyTypeAnalysis from './Pages/Quizzes/BodyTypeAnalysis/BodyTypeAnalysis';
import StyleQuiz from './Pages/Quizzes/StyleQuiz/StyleQuiz';
import StyleResult from './Pages/Quizzes/StyleResult/StyleResult';
import SecuritySetup from './Auth/SecuritySetup/SecuritySetup';
import ChangePassword from './Auth/ChangePassword/ChangePassword';
import Moodboard from './Pages/Moodboard/Moodboard';

// Feedback Component import
import FeedbackModal from './component/feedback/FeedbackModal';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  // Hide Navbar on standalone auth screens and first-time setup flows[cite: 23]
  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/auth/login' || 
    location.pathname === '/register' || 
    location.pathname === '/auth/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname === '/auth/forgot-password';
  const isSetupPage = location.pathname === '/get-to-know';

  const getActiveFeature = () => {
    if (location.pathname.includes('style')) return 'Style Quiz';
    if (location.pathname.includes('aesthetic')) return 'Aesthetic Quiz';
    if (location.pathname.includes('undertone')) return 'Undertone Test';
    return 'Dashboard';
  };

  // Prevent UI flashing before session is verified from Express[cite: 23]
  if (loading) {
    return null;
  }

  return (
    <>
      {!isAuthPage && !isSetupPage && (
        <Navbar />
      )}
      <div style={{ paddingTop: (!isAuthPage && !isSetupPage) ? '80px' : 0 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About isAuthenticated={isAuthenticated} />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/auth/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          <Route path="/get-to-know" element={<GetToKnow />} />
          <Route path="/zodiac/zodiac-result" element={<ZodiacResult />} />
          <Route path="/undertone/test" element={<UnderTone />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/zodiac" element={<Zodiac />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/forecast/single-card" element={<SingleCard />} />
          <Route path="/forecast/single-card-result" element={<SingleCardResult />} />
          <Route path="/forecast/heart-head-path" element={<HeartHeadPath />} />
          <Route path="/forecast/heart-head-path-result" element={<HeartHeadPathResult />} />
          <Route path="/quizzes/aesthetic-welcome" element={<AestheticWelcome />} />
          <Route path="/quizzes/aesthetic-quiz" element={<AestheticQuiz />} />
          <Route path="/quizzes/aesthetic-result" element={<AestheticResult />} />
          <Route path="/quizzes/bodytype-analysis" element={<BodyTypeAnalysis />} />
          <Route path="/quizzes/style-welcome" element={<StyleQuiz />} />
          <Route path="/quizzes/style-quiz" element={<StyleQuiz />} />
          <Route path="/quizzes/style-result" element={<StyleResult />} />
          
          {/* Moodboard Route[cite: 23] */}
          <Route path="/moodboard/result" element={<Moodboard />} />
          <Route path="/moodboard" element={<Moodboard />} />

          <Route path="/astro-insights" element={<Forecast />} />
          <Route path="/auth/security-setup" element={<SecuritySetup />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />

          <Route path="/undertone/result" element={<UndertoneResult />} />
        </Routes>
      </div>

      {!isAuthPage && !isSetupPage && (
        <button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9998,
            backgroundColor: '#8B5FBF',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 22px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(139, 95, 191, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 95, 191, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 95, 191, 0.45)';
          }}
        >
          <span>Feedback</span> 💬
        </button>
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        defaultFeature={getActiveFeature()}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}