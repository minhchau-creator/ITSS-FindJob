import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Header from "../../components/Header";
import Footer from "../../components/Footer/Footer";
import defaultAvatar from "../../assets/company-logo.png";
import { Button, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import PasswordSection from "../../components/PasswordSection/PasswordSection";

const API_BASE_URL = "http://localhost:8080/api/v1/users";
// ID người dùng cố định - trong thực tế sẽ lấy từ authentication
const USER_ID = "6a1bf88a055dca08ecc56f9a";

// Khung lịch tuần khớp với enum trong Backend (user.models.ts)
const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const PERIODS = [
  { key: "sáng", label: "Ca sáng" },
  { key: "chiều", label: "Ca chiều" },
  { key: "tối", label: "Ca tối" },
];

// Tạo lịch rỗng: { "Thứ 2": { "sáng": false, ... }, ... }
const buildEmptyAvailability = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = PERIODS.reduce((p, { key }) => ({ ...p, [key]: false }), {});
    return acc;
  }, {});

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  // Dữ liệu mặc định cho profile
  const defaultProfile = {
    avatar: defaultAvatar,
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
    availability: buildEmptyAvailability(),
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Các tùy chọn dropdown lấy từ API (dữ liệu thật trong DB)
  const [options, setOptions] = useState({
    major: ["Công nghệ thông tin", "Kinh tế", "Ngoại ngữ", "Sư phạm", "Y khoa"],
    university: [
      "Đại học Bách Khoa",
      "Đại học Kinh tế",
      "Đại học Ngoại thương",
      "Đại học Quốc gia",
    ],
    jobType: [],
    jobForm: [],
    category: [],
  });

  const [dropdowns, setDropdowns] = useState({
    major: false,
    university: false,
    jobType: false,
    jobForm: false,
    category: false,
  });

  const dropdownRef = useRef(null);

  // Đóng mọi dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdowns({
          major: false,
          university: false,
          jobType: false,
          jobForm: false,
          category: false,
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Danh sách lựa chọn cố định cho các dropdown
//   const options = {
//     major: ["Công nghệ thông tin", "Kinh tế", "Ngoại ngữ", "Sư phạm", "Y khoa"],
//     university: ["Đại học Bách Khoa", "Đại học Kinh tế", "Đại học Ngoại thương", "Đại học Quốc gia"],
//     jobType: ["Part-Time", "Full-Time", "Freelancer"],
//     jobForm: ["Internship", "Contract", "Làm thêm"]
//   };
  
  //const userId = authUser?._id;

  // Tải thông tin người dùng + các danh sách tùy chọn
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, jTypeRes, jFormRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/${USER_ID}`),
          axios.get(`${API_BASE_URL}/${USER_ID}/get-jtype-list`),
          axios.get(`${API_BASE_URL}/${USER_ID}/get-jform-list`),
          axios.get(`${API_BASE_URL}/${USER_ID}/get-category-list`),
        ]);

        // Chuyển workingSchedule (mảng) -> availability (bảng tick)
        const availability = buildEmptyAvailability();
        (userRes.data?.workingSchedule || []).forEach(({ day, period }) => {
          if (availability[day] && period in availability[day]) {
            availability[day][period] = true;
          }
        });

        setProfile({
          ...defaultProfile,
          ...userRes.data,
          avatar: userRes.data?.avatar || defaultAvatar,
          availability,
        });

        setOptions((prev) => ({
          ...prev,
          jobType: jTypeRes.data?.length ? jTypeRes.data : prev.jobType,
          jobForm: jFormRes.data?.length ? jFormRes.data : prev.jobForm,
          category: catRes.data?.length ? catRes.data : prev.category,
        }));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setNotification({
          open: true,
          message: "Không thể tải thông tin người dùng. Vui lòng thử lại sau.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectOption = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const toggleDropdown = (field) => {
    setDropdowns((prev) => {
      const isOpen = prev[field];
      // chỉ mở 1 dropdown tại 1 thời điểm
      const allClosed = Object.keys(prev).reduce(
        (acc, k) => ({ ...acc, [k]: false }),
        {}
      );
      return { ...allClosed, [field]: !isOpen };
    });
  };

  const handleAvailabilityChange = (day, periodKey) => {
    setProfile((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [periodKey]: !prev.availability[day][periodKey],
        },
      },
    }));
  };

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      setNotification({
        open: true,
        message: "Vui lòng nhập họ và tên!",
        severity: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      // availability (bảng tick) -> workingSchedule (mảng) cho Backend
      const workingSchedule = [];
      Object.entries(profile.availability || {}).forEach(([day, periods]) => {
        Object.entries(periods).forEach(([periodKey, isOn]) => {
          if (isOn) workingSchedule.push({ day, period: periodKey });
        });
      });

      const userData = {
        name: profile.name,
        email: profile.email,
        dateOfBirth: profile.dateOfBirth || null,
        address: profile.address,
        phone: profile.phone,
        jobType: profile.jobType,
        jobForm: profile.jobForm,
        university: profile.university,
        major: profile.major,
        category: profile.category,
        workingSchedule,
      };

      await axios.post(`${API_BASE_URL}/${USER_ID}`, userData);
      setNotification({
        open: true,
        message: "Cập nhật thông tin thành công!",
        severity: "success",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setNotification({
        open: true,
        message: "Không thể cập nhật thông tin. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  // Dropdown tái sử dụng
  const renderDropdown = (field, label, list, placeholder) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="custom-dropdown">
        <div className="dropdown-selection" onClick={() => toggleDropdown(field)}>
          {profile[field] || placeholder}
          <KeyboardArrowDownIcon
            className={`dropdown-icon ${dropdowns[field] ? "rotated" : ""}`}
          />
        </div>
        {dropdowns[field] && (
          <div className="dropdown-options">
            {list.length === 0 ? (
              <div className="dropdown-option dropdown-empty">Không có dữ liệu</div>
            ) : (
              list.map((opt, i) => (
                <div
                  key={i}
                  className="dropdown-option"
                  onClick={() => handleSelectOption(field, opt)}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div
          className="profile-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <CircularProgress style={{ color: "#6300b3" }} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-gradient-banner"></div>

      <div className="profile-container" ref={dropdownRef}>
        <div className="profile-card">
          {/* Header thẻ: avatar + tên + nút Cập nhật */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <img src={profile.avatar} alt="Avatar" className="profile-avatar" />
              <div className="profile-info">
                <h2 className="profile-name">{profile.name || "Người dùng"}</h2>
                <p className="profile-email">{profile.email}</p>
              </div>
            </div>

            <Button
              variant="contained"
              className="update-btn"
              onClick={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={24} style={{ color: "white" }} />
              ) : (
                "Cập nhật"
              )}
            </Button>
          </div>

          <div className="profile-form">
            {/* 1. Thông tin cơ bản */}
            <h3 className="section-title">1. Thông tin cơ bản</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="profile-input"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="profile-input"
                  placeholder="Nhập email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày sinh</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="date"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="profile-input"
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={logout}
                  style={{ height: 56 }}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Địa chỉ</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="profile-input"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={profile.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="profile-input"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>
            </div>

            <div className="form-row">
              {renderDropdown("major", "Khoa/Ngành học", options.major, "Chọn khoa/ngành học")}
              {renderDropdown("university", "Trường học", options.university, "Chọn trường học")}
            </div>

            {/* 2. Loại hình công việc ưa thích */}
            <h3 className="section-title">2. Loại hình công việc ưa thích</h3>
            <div className="form-row">
              {renderDropdown("jobType", "Loại công việc mong muốn", options.jobType, "Chọn loại công việc")}
              {renderDropdown("jobForm", "Hình thức công việc mong muốn", options.jobForm, "Chọn hình thức công việc")}
            </div>
            <div className="form-row">
              {renderDropdown("category", "Lĩnh vực công việc mong muốn", options.category, "Chọn lĩnh vực công việc")}
              <div className="form-group" />
            </div>

            {/* 3. Thời gian rảnh trong tuần */}
            <h3 className="section-title">3. Thời gian rảnh trong tuần</h3>
            <div className="schedule-section">
              <div className="schedule-table">
                <div className="schedule-header">
                  <div className="schedule-day"></div>
                  {PERIODS.map((p) => (
                    <div className="schedule-period" key={p.key}>
                      {p.label}
                    </div>
                  ))}
                </div>

                {DAYS.map((day) => (
                  <div className="schedule-row" key={day}>
                    <div className="schedule-day">{day}</div>
                    {PERIODS.map((p) => (
                      <div className="schedule-period-cell" key={p.key}>
                        <input
                          type="checkbox"
                          checked={profile.availability?.[day]?.[p.key] || false}
                          onChange={() => handleAvailabilityChange(day, p.key)}
                          className="schedule-checkbox"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PasswordSection />
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Footer />
    </div>
  );
};

export default Profile;
