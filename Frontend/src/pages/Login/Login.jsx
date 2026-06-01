import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import logo from "../../assets/logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
  if (!/\d/.test(pw)) return "Mật khẩu phải có ít nhất 1 chữ số";
  return "";
};

const Login = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // Register form
  const [regCredential, setRegCredential] = useState(null);
  const [regInfo, setRegInfo] = useState(null); // { email, name, picture }
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [regErrors, setRegErrors] = useState({});

  if (loading) {
    return (
      <div className="login-page">
        <CircularProgress style={{ color: "#6300b3" }} />
      </div>
    );
  }
  if (user) {
    return (
      <Navigate to={user.profileCompleted ? "/" : "/complete-profile"} replace />
    );
  }

  const goAfterAuth = (u) => {
    navigate(u.profileCompleted ? "/" : "/complete-profile", { replace: true });
  };

  // ===== Login flow =====
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = {};
    if (!EMAIL_REGEX.test(loginEmail.trim())) errs.email = "Email không hợp lệ";
    if (!loginPassword) errs.password = "Vui lòng nhập mật khẩu";
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const u = await loginWithEmail(loginEmail.trim(), loginPassword);
      goAfterAuth(u);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLoginSuccess = async (resp) => {
    setError("");
    setSubmitting(true);
    try {
      const u = await loginWithGoogle(resp.credential);
      goAfterAuth(u);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập Google thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Register flow =====
  const handleGoogleVerifySuccess = (resp) => {
    setError("");
    setRegCredential(resp.credential);
    // Decode payload phía client để hiển thị (không thay verify backend)
    try {
      const payload = JSON.parse(atob(resp.credential.split(".")[1]));
      setRegInfo({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
      setRegName(payload.name || "");
    } catch {
      setRegInfo(null);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = {};
    if (!regName.trim()) errs.name = "Vui lòng nhập họ và tên";
    const pwErr = validatePassword(regPassword);
    if (pwErr) errs.password = pwErr;
    if (regConfirm !== regPassword) errs.confirm = "Mật khẩu xác nhận không khớp";
    setRegErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const u = await registerWithGoogle(regCredential, regPassword, regName.trim());
      goAfterAuth(u);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setLoginErrors({});
    setRegErrors({});
  };

  return (
    <div className="login-page">
      <button
        className="login-back-btn"
        onClick={() => navigate("/")}
        type="button"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Quay lại</span>
      </button>

      <div className="login-card">
        <img className="login-logo" src={logo} alt="logo" />

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`login-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <Alert severity="error" style={{ marginBottom: 16, width: "100%" }}>
            {error}
          </Alert>
        )}

        {mode === "login" ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              error={Boolean(loginErrors.email)}
              helperText={loginErrors.email}
              margin="dense"
            />
            <TextField
              fullWidth
              size="small"
              label="Mật khẩu"
              type={showLoginPw ? "text" : "password"}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              error={Boolean(loginErrors.password)}
              helperText={loginErrors.password}
              margin="dense"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowLoginPw((v) => !v)}>
                      {showLoginPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <button type="submit" className="login-submit-btn" disabled={submitting}>
              {submitting ? <CircularProgress size={20} style={{ color: "white" }} /> : "Đăng nhập"}
            </button>

            <div className="login-divider"><span>hoặc</span></div>

            <div className="login-google-btn">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setError("Không thể đăng nhập Google")}
                theme="outline"
                size="large"
                text="signin_with"
                width="320"
              />
            </div>

            <div className="login-switch-row">
              Chưa có tài khoản?{" "}
              <button type="button" className="login-switch-link" onClick={() => switchMode("register")}>
                Đăng ký ngay
              </button>
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            {!regCredential ? (
              <div className="register-verify-block">
                <p className="register-step-title">Bước 1: Xác thực Gmail</p>
                <p className="register-step-desc">
                  Để đảm bảo email hợp lệ, vui lòng xác thực bằng Google trước khi tiếp tục.
                </p>
                <div className="login-google-btn">
                  <GoogleLogin
                    onSuccess={handleGoogleVerifySuccess}
                    onError={() => setError("Không thể xác thực Gmail")}
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                    width="320"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="register-verified-box">
                  <VerifiedIcon style={{ color: "#16a34a" }} />
                  <div>
                    <div className="register-verified-email">{regInfo?.email}</div>
                    <div className="register-verified-note">Gmail đã xác thực thành công</div>
                  </div>
                  <button
                    type="button"
                    className="register-change-link"
                    onClick={() => {
                      setRegCredential(null);
                      setRegInfo(null);
                      setRegName("");
                      setRegPassword("");
                      setRegConfirm("");
                    }}
                  >
                    Đổi
                  </button>
                </div>

                <TextField
                  fullWidth
                  size="small"
                  label="Họ và tên"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  error={Boolean(regErrors.name)}
                  helperText={regErrors.name}
                  margin="dense"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Mật khẩu"
                  type={showRegPw ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  error={Boolean(regErrors.password)}
                  helperText={regErrors.password || "Tối thiểu 8 ký tự, có ít nhất 1 chữ số"}
                  margin="dense"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowRegPw((v) => !v)}>
                          {showRegPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Nhập lại mật khẩu"
                  type={showRegPw ? "text" : "password"}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  error={Boolean(regErrors.confirm)}
                  helperText={regErrors.confirm}
                  margin="dense"
                />

                <button type="submit" className="login-submit-btn" disabled={submitting}>
                  {submitting ? <CircularProgress size={20} style={{ color: "white" }} /> : "Đăng ký"}
                </button>
              </>
            )}

            <div className="login-switch-row">
              Đã có tài khoản?{" "}
              <button type="button" className="login-switch-link" onClick={() => switchMode("login")}>
                Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
