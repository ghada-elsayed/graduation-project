import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage        from './pages/LandingPage';
import RoleSelectionPage  from './pages/RoleSelectionPage';
import RegisterPage       from './pages/RegisterPage';
import LoginPage          from './pages/LoginPage';
import PlayerDashboard    from './pages/PlayerDashboard';
import AdminDashboard     from './pages/AdminDashboard';
import NutritionPage      from './pages/NutritionPage';
import JobsPage           from './pages/JobsPage';
import ExerciseCoach      from './pages/ExerciseCoach';
import ChatbotPage        from './pages/ChatbotPage';
import ClubDashboard      from './pages/ClubDashboard';
import ChatFAB            from './components/ChatFAB';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/select-role"    element={<RoleSelectionPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/dashboard"      element={<PlayerDashboard />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/nutrition"      element={<NutritionPage />} />
        <Route path="/jobs"           element={<JobsPage />} />
        <Route path="/exercise-coach" element={<ExerciseCoach />} />
        <Route path="/chatbot"        element={<ChatbotPage />} />
        <Route path="/club-dashboard" element={<ClubDashboard />} />
      </Routes>
      <ChatFAB />
    </BrowserRouter>
  );
}

export default App;