import { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "../../contexts/AuthContext";
import "./PasswordSection.css";

const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
  if (!/\d/.test(pw)) return "Mật khẩu phải có ít nhất 1 chữ số";
  return "";
};

const PasswordSection = () => {
  const { user, setPassword } = useAuth();
  const hasPassword = Boolean(user?.hasPassword);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ open: false, severity: "success", message: "" });

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (hasPassword && !current) errs.current = "Vui lòng nhập mật khẩu hiện tại";
    const pwErr = validatePassword(next);
    if (pwErr) errs.next = pwErr;
    if (next !== confirm) errs.confirm = "Mật khẩu xác nhận không khớp";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await setPassword(hasPassword ? current : null, next);
      setNotif({
        open: true,
        severity: "success",
        message: hasPassword ? "Đổi mật khẩu thành công!" : "Đặt mật khẩu thành công!",
      });
      reset();
      setOpen(false);
    } catch (err) {
      setNotif({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pw-section">
      <div className="pw-header">
        <div className="pw-header-left">
          <LockIcon style={{ color: "#6300b3" }} />
          <div>
            <div className="pw-title">Mật khẩu</div>
            <div className="pw-subtitle">
              {hasPassword
                ? "Đổi mật khẩu định kỳ để bảo mật tài khoản"
                : "Đặt mật khẩu để có thể đăng nhập bằng email"}
            </div>
          </div>
        </div>
        <Button
          variant={open ? "outlined" : "contained"}
          onClick={() => {
            setOpen((v) => !v);
            reset();
          }}
          style={open ? {} : { backgroundColor: "#6300b3" }}
        >
          {open ? "Hủy" : hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
        </Button>
      </div>

      {open && (
        <form className="pw-form" onSubmit={handleSubmit}>
          {hasPassword && (
            <TextField
              fullWidth
              size="small"
              label="Mật khẩu hiện tại"
              type={showPw ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              error={Boolean(errors.current)}
              helperText={errors.current}
              margin="dense"
            />
          )}
          <TextField
            fullWidth
            size="small"
            label="Mật khẩu mới"
            type={showPw ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={Boolean(errors.next)}
            helperText={errors.next || "Tối thiểu 8 ký tự, có ít nhất 1 chữ số"}
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Nhập lại mật khẩu mới"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={Boolean(errors.confirm)}
            helperText={errors.confirm}
            margin="dense"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            style={{ backgroundColor: "#6300b3", marginTop: 12 }}
          >
            {saving ? <CircularProgress size={20} style={{ color: "white" }} /> : "Lưu"}
          </Button>
        </form>
      )}

      <Snackbar
        open={notif.open}
        autoHideDuration={4000}
        onClose={() => setNotif({ ...notif, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={notif.severity} sx={{ width: "100%" }}>
          {notif.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PasswordSection;
