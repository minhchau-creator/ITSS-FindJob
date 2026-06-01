import { Navigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress style={{ color: "#6300b3" }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !user.profileCompleted)
    return <Navigate to="/complete-profile" replace />;

  return children;
};

export default ProtectedRoute;
