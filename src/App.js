import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import StudyRoom from "./pages/StudyRoom"; 
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext"; 
import DeckPage from "./pages/DeckPage";
import Account from "./pages/Account";


// 🔐 Protect routes from users who aren't logged in
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/studyroom"
          element={
            <ProtectedRoute>
              <StudyRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deck/:deckId"
          element={
            <ProtectedRoute>
              <DeckPage />
            </ProtectedRoute>
          }
        />
        <Route path="/account" element={<Account />} />

      </Routes>
    </Router>
  );
}


export default App;
