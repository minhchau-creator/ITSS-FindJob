import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { GOOGLE_CLIENT_ID } from "./config";
import Home from "./pages/Home";
import JobDetail from "./pages/JobDetail";
import JobList from "./pages/JobList";
// solve conflict
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import CompleteProfile from "./pages/CompleteProfile";


const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes — guest có thể xem */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes — phải login mới vào được */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute requireProfile={false}>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
