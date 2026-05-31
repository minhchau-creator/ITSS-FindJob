import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CommentSection from "../../components/CommentSection/CommentSection";
import StarRating from "../../components/StarRating/StarRating";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import companyLogo from "../../assets/company-logo.png";
import PushPin from "../../assets/pushpin.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Schedule from "@mui/icons-material/WorkOutline";
import "./JobDetail.css";
import Header from "../../components/Header";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const emptySummary = { avg: 0, ratedCount: 0, total: 0 };
  const [ratingSummary, setRatingSummary] = useState({
    overall: emptySummary,
    loggedIn: emptySummary,
  });
  const navigate = useNavigate();

  const handleSummaryChange = useCallback((s) => setRatingSummary(s), []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/jobs/detail/${id}`
        );
        console.log("Dữ liệu trả về:", response.data);
        setJob(response.data);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };
    fetchJob();
  }, [id]);

  if (!job) {
    return <div>Loading...</div>;
  }

  const formatPrice = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    return Number(amount).toLocaleString("vi-VN");
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="JobDetail-page">
      <Header />
      <div className="page-content">
        <div className="job-container">
          <div className="newdiv">
            <h1 onClick={() => navigate(-1)} className="job-title">
              <FontAwesomeIcon icon={faChevronLeft} />
              <span style={{ marginLeft: "10px" }}>{job.title}</span>
            </h1>
            <div className="badges">
              <span className="badge type-v">{job.jobType}</span>
              <span className="badge category-v">{job.category}</span>
            </div>
            {ratingSummary.overall.ratedCount > 0 && (
              <div className="job-title-rating overall" title="Tất cả đánh giá">
                <StarRating value={ratingSummary.overall.avg} size="small" />
                <span>
                  <strong>{ratingSummary.overall.avg.toFixed(1)}</strong>
                  <span className="rating-label">
                    {" "}· Chung ({ratingSummary.overall.ratedCount})
                  </span>
                </span>
              </div>
            )}
            {ratingSummary.loggedIn.ratedCount > 0 && (
              <div className="job-title-rating verified" title="Đánh giá từ người dùng đã xác minh">
                <StarRating value={ratingSummary.loggedIn.avg} size="small" />
                <span>
                  <strong>{ratingSummary.loggedIn.avg.toFixed(1)}</strong>
                  <span className="rating-label">
                    {" "}· Đã xác minh ({ratingSummary.loggedIn.ratedCount})
                  </span>
                </span>
              </div>
            )}
          </div>

          <h2>Thông tin cơ bản</h2>
          <div className="basic-info">
            <div className="left-column">
              <ul>
                <li>
                  <LocationOnIcon /> {job.address}
                </li>
                <li>
                  <MonetizationOnIcon />{" "}
                  <span>
                    {formatPrice(job.monthlySalary || job.salary)} đ/tháng
                    {job.salaryUnit && job.salaryUnit !== "tháng" && (
                      <span style={{ color: "#666", marginLeft: 6 }}>
                        ({formatPrice(job.salary)} đ/{job.salaryUnit})
                      </span>
                    )}
                  </span>
                </li>
                <li>
                  <WorkIcon
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  {job.jobForm}
                </li>
                <li>
                  <WorkHistoryIcon />{" "}
                  {job.experienceRequired || "Không yêu cầu kinh nghiệm"}
                </li>
                <li>
                  <PeopleIcon /> Cần {job.needCount || 1} người
                </li>
                {job.jobType === "Part-Time" ? (
                  <>
                    <li onClick={() => setShowSchedule(!showSchedule)}>
                      <AccessTimeIcon /> {job.workingTime}
                      {job.workingSchedule?.length > 0 && (
                        <span style={{ color: "#6300b3", marginLeft: 6 }}>
                          ({job.workingSchedule.length} ca/tuần)
                        </span>
                      )}
                      <span
                        style={{
                          fontStyle: "italic",
                          textDecoration: "underline",
                          color: "#007bff",
                          cursor: "pointer",
                          marginLeft: 6,
                        }}
                      >
                        (Chi tiết)
                      </span>
                    </li>

                    {showSchedule && job.workingSchedule?.length > 0 && (
                      <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
                        {job.workingSchedule.map((item) => (
                          <li key={item._id}>
                            <AccessTimeIcon
                              style={{
                                verticalAlign: "middle",
                              }}
                            />
                            <strong>{item.day}:</strong> {item.period}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <li>
                    <AccessTimeIcon /> {job.workingTime}
                    {job.workingSchedule?.length > 0 && (
                      <span style={{ color: "#6300b3", marginLeft: 6 }}>
                        ({job.workingSchedule.length} ngày/tuần)
                      </span>
                    )}
                  </li>
                )}

                <li>
                  <AssignmentIcon /> Ứng tuyển:
                  {formatDateTime(job.startDate)} –{" "}
                  {formatDateTime(job.endDate)}
                </li>
                <li>
                  <Schedule /> Làm chính thức:
                  {formatDateTime(job.recruitStartDate)} –{" "}
                  {formatDateTime(job.recruitEndDate)}
                </li>
              </ul>
            </div>

            <div className="right-column">
              <div className="icon-PushPin">
                <img src={PushPin} alt="company-logo" />
              </div>
              <div className="company-v">
                <div className="avatar">
                  <img
                    src={job.company.logo ?? companyLogo}
                    alt="company-logo"
                  />
                </div>
                <div className="company-info">
                  <div className="company-name">{job.company.name}</div>
                  <div className="company-location">{job.company.address}</div>
                </div>
              </div>
              <div className="info">
                <li>
                  <PeopleIcon /> {job.company.employeeCount}
                </li>
                <li>
                  <Inventory2Icon /> {job.company.industry}
                </li>
                <li>
                  <LocationOnIcon /> {job.company.location}
                </li>
              </div>
            </div>
          </div>

          <h2>Trạng thái tuyển dụng</h2>
          <div className="recruit-status">
            {(() => {
              const need = job.needCount || 1;
              const hired = job.hiredCount || 0;
              const applying = job.applyingCount || 0;
              const percent = Math.min(100, Math.round((hired / need) * 100));
              const remaining = Math.max(0, need - hired);
              return (
                <>
                  <div className="recruit-stats">
                    <div className="recruit-stat">
                      <HowToRegIcon style={{ color: "#16a34a" }} />
                      <div>
                        <div className="recruit-stat-label">Đã tuyển</div>
                        <div className="recruit-stat-value">
                          {hired} / {need} người
                        </div>
                      </div>
                    </div>
                    <div className="recruit-stat">
                      <GroupAddIcon style={{ color: "#6300b3" }} />
                      <div>
                        <div className="recruit-stat-label">Còn tuyển</div>
                        <div className="recruit-stat-value">
                          {remaining} người
                        </div>
                      </div>
                    </div>
                    <div className="recruit-stat">
                      <HourglassEmptyIcon style={{ color: "#ea580c" }} />
                      <div>
                        <div className="recruit-stat-label">Đang ứng tuyển</div>
                        <div className="recruit-stat-value">
                          {applying} người
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="recruit-progress">
                    <div
                      className="recruit-progress-bar"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="recruit-progress-text">
                    Tiến độ tuyển dụng: {percent}%
                    {remaining === 0 && " — Đã đủ người"}
                  </div>
                </>
              );
            })()}
          </div>

          <h2>Thông tin liên hệ nhà tuyển dụng</h2>
          <div className="contact-info">
            {job.contact ? (
              <ul>
                {job.contact.person && (
                  <li>
                    <PersonIcon /> <strong>Người phụ trách:</strong>{" "}
                    {job.contact.person}
                  </li>
                )}
                {job.contact.email && (
                  <li>
                    <EmailIcon />{" "}
                    <a href={`mailto:${job.contact.email}`}>
                      {job.contact.email}
                    </a>
                  </li>
                )}
                {job.contact.phone && (
                  <li>
                    <PhoneIcon />{" "}
                    <a href={`tel:${job.contact.phone.replace(/\s/g, "")}`}>
                      {job.contact.phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p style={{ color: "#888" }}>
                Nhà tuyển dụng chưa cập nhật thông tin liên hệ.
              </p>
            )}
          </div>

          <h2>Mô tả chi tiết công việc</h2>
          <div className="job-description">
            <ul>
              {job.description.split(".").map(
                (line, index) =>
                  line.trim() && (
                    <p
                      key={index}
                      style={{ fontSize: "16px", lineHeight: "1.6" }}
                    >
                      • {line.trim()}.
                    </p>
                  )
              )}
            </ul>
          </div>

          <CommentSection jobId={job._id} onSummaryChange={handleSummaryChange} />
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
