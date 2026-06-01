import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE } from "../../config";
import "./CompleteProfile.css";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const PERIODS = ["Ca sáng", "Ca chiều", "Ca tối"];

const MAJOR_OPTIONS = [
  "Công nghệ thông tin",
  "Kinh tế",
  "Ngoại ngữ",
  "Sư phạm",
  "Y khoa",
];
const UNIVERSITY_OPTIONS = [
  "Đại học Bách Khoa",
  "Đại học Kinh tế",
  "Đại học Ngoại thương",
  "Đại học Quốc gia",
];
const JOB_TYPE_OPTIONS = ["Part-Time", "Full-Time", "Freelancer"];
const JOB_FORM_OPTIONS = ["Internship", "Contract", "Làm thêm"];

const buildAvailabilityMap = () => {
  const map = {};
  DAYS.forEach((d) => {
    map[d] = { "Ca sáng": false, "Ca chiều": false, "Ca tối": false };
  });
  return map;
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    major: "",
    university: "",
    jobType: "",
    jobForm: "",
    category: "",
  });
  const [availability, setAvailability] = useState(buildAvailabilityMap());
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
      address: user.address || "",
      phone: user.phone || "",
      major: user.major || "",
      university: user.university || "",
      jobType: user.jobType || "",
      jobForm: user.jobForm || "",
      category: user.category || "",
    }));

    if (user.workingSchedule && user.workingSchedule.length > 0) {
      const map = buildAvailabilityMap();
      user.workingSchedule.forEach((s) => {
        const key = `Ca ${s.period}`;
        if (map[s.day]) map[s.day][key] = true;
      });
      setAvailability(map);
    }

    axios
      .get(`${API_BASE}/users/${user._id}/get-category-list`)
      .then((res) => setCategoryOptions(res.data || []))
      .catch(() => {});
  }, [user]);

  if (authLoading) {
    return (
      <div className="cp-page">
        <CircularProgress style={{ color: "#6300b3" }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const toggleSlot = (day, period) => {
    setAvailability({
      ...availability,
      [day]: { ...availability[day], [period]: !availability[day][period] },
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setNotification({
        open: true,
        message: "Vui lòng nhập họ và tên",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const workingSchedule = [];
      Object.entries(availability).forEach(([day, slots]) => {
        Object.entries(slots).forEach(([period, on]) => {
          if (on)
            workingSchedule.push({ day, period: period.replace("Ca ", "") });
        });
      });

      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        workingSchedule,
      };

      await axios.post(`${API_BASE}/users/${user._id}`, payload);
      await refreshUser();

      setNotification({
        open: true,
        message: "Lưu thông tin thành công!",
        severity: "success",
      });
      setTimeout(() => navigate("/profile", { replace: true }), 600);
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: "Lưu thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        <div className="cp-header">
          {user.avatar && (
            <img className="cp-avatar" src={user.avatar} alt="avatar" />
          )}
          <div>
            <h1 className="cp-title">Hoàn thiện hồ sơ của bạn</h1>
            <p className="cp-subtitle">
              Điền thông tin để chúng tôi gợi ý công việc phù hợp nhất với bạn
            </p>
          </div>
        </div>

        <div className="cp-form">
          <div className="cp-row">
            <div className="cp-group">
              <label>Họ và tên *</label>
              <TextField
                fullWidth
                size="small"
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>
            <div className="cp-group">
              <label>Email</label>
              <TextField
                fullWidth
                size="small"
                value={form.email}
                disabled
              />
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-group">
              <label>Ngày sinh</label>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="cp-group">
              <label>Số điện thoại</label>
              <TextField
                fullWidth
                size="small"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="VD: 0123456789"
              />
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-group cp-full">
              <label>Địa chỉ</label>
              <TextField
                fullWidth
                size="small"
                value={form.address}
                onChange={handleChange("address")}
                placeholder="VD: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
              />
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-group">
              <label>Trường học</label>
              <TextField
                fullWidth
                size="small"
                select
                value={form.university}
                onChange={handleChange("university")}
              >
                <MenuItem value="">-- Chọn --</MenuItem>
                {UNIVERSITY_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="cp-group">
              <label>Khoa/Ngành học</label>
              <TextField
                fullWidth
                size="small"
                select
                value={form.major}
                onChange={handleChange("major")}
              >
                <MenuItem value="">-- Chọn --</MenuItem>
                {MAJOR_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-group">
              <label>Loại công việc mong muốn</label>
              <TextField
                fullWidth
                size="small"
                select
                value={form.jobType}
                onChange={handleChange("jobType")}
              >
                <MenuItem value="">-- Chọn --</MenuItem>
                {JOB_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="cp-group">
              <label>Hình thức công việc</label>
              <TextField
                fullWidth
                size="small"
                select
                value={form.jobForm}
                onChange={handleChange("jobForm")}
              >
                <MenuItem value="">-- Chọn --</MenuItem>
                {JOB_FORM_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-group cp-full">
              <label>Vị trí công việc mong muốn</label>
              <TextField
                fullWidth
                size="small"
                select
                value={form.category}
                onChange={handleChange("category")}
              >
                <MenuItem value="">-- Chọn --</MenuItem>
                {categoryOptions.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          {form.jobType === "Part-Time" && (
            <div className="cp-schedule">
              <h3>Thời gian rảnh trong tuần</h3>
              <div className="cp-schedule-table">
                <div className="cp-schedule-row cp-schedule-head">
                  <div></div>
                  {PERIODS.map((p) => (
                    <div key={p}>{p}</div>
                  ))}
                </div>
                {DAYS.map((day) => (
                  <div key={day} className="cp-schedule-row">
                    <div className="cp-schedule-day">{day}</div>
                    {PERIODS.map((period) => (
                      <div key={period} className="cp-schedule-cell">
                        <input
                          type="checkbox"
                          checked={availability[day][period]}
                          onChange={() => toggleSlot(day, period)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cp-actions">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              className="cp-submit"
            >
              {saving ? (
                <CircularProgress size={22} style={{ color: "white" }} />
              ) : (
                "Lưu và tiếp tục"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CompleteProfile;
