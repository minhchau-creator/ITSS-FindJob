import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import { Alert, Snackbar, CircularProgress, Pagination } from "@mui/material";
import StarRating from "../StarRating/StarRating";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE } from "../../config";
import "./CommentSection.css";

const TOKEN_KEY = "itss_token";
const PAGE_SIZE = 5;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CommentSection = ({ jobId, onSummaryChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | loggedin | anonymous
  const [page, setPage] = useState(1);

  // form
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [asAnonymous, setAsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState({ open: false, severity: "success", message: "" });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/${jobId}/comments`);
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchComments();
  }, [jobId]);

  const filtered = useMemo(() => {
    if (filter === "loggedin") return comments.filter((c) => !c.isAnonymous);
    if (filter === "anonymous") return comments.filter((c) => c.isAnonymous);
    return comments;
  }, [comments, filter]);

  // Đổi filter → reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const computeSummary = (list) => {
    const rated = list.filter((c) => c.rating > 0);
    const avg =
      rated.length > 0
        ? rated.reduce((s, c) => s + c.rating, 0) / rated.length
        : 0;
    return { avg, ratedCount: rated.length, total: list.length };
  };

  // Summary hiển thị trong section header — đổi theo filter
  const summary = useMemo(() => computeSummary(filtered), [filtered]);

  // Summary ngoài section (truyền lên JobDetail) — KHÔNG đổi theo filter
  const overallSummary = useMemo(() => computeSummary(comments), [comments]);
  const loggedInSummary = useMemo(
    () => computeSummary(comments.filter((c) => !c.isAnonymous)),
    [comments]
  );

  useEffect(() => {
    if (onSummaryChange) {
      onSummaryChange({ overall: overallSummary, loggedIn: loggedInSummary });
    }
  }, [overallSummary, loggedInSummary, onSummaryChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 && !content.trim()) {
      setNotif({ open: true, severity: "warning", message: "Nhập đánh giá hoặc bình luận trước đã" });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_BASE}/jobs/${jobId}/comments`,
        { rating, content, asAnonymous },
        { headers }
      );

      setRating(0);
      setContent("");
      setAsAnonymous(false);
      setPage(1); // về trang đầu để thấy comment mới
      setNotif({ open: true, severity: "success", message: "Đăng đánh giá thành công!" });
      await fetchComments();
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng đánh giá thất bại";
      setNotif({ open: true, severity: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h2>Đánh giá & bình luận</h2>

        <div className="comments-summary">
          <div className="comments-avg-num">{summary.avg.toFixed(1)}</div>
          <div>
            <StarRating value={summary.avg} size="medium" />
            <div className="comments-summary-text">
              {summary.ratedCount} đánh giá · {summary.total} bình luận
            </div>
          </div>
        </div>
      </div>

      <div className="comments-filters">
        {[
          { key: "all", label: "Tất cả" },
          { key: "loggedin", label: "Đã đăng nhập" },
          { key: "anonymous", label: "Ẩn danh" },
        ].map((opt) => (
          <button
            key={opt.key}
            className={`comments-filter-btn ${filter === opt.key ? "active" : ""}`}
            onClick={() => setFilter(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-row">
          <span className="comment-form-label">Đánh giá:</span>
          <StarRating value={rating} onChange={setRating} size="large" allowHalf={false} />
          {rating > 0 && (
            <button
              type="button"
              className="comment-clear-rating"
              onClick={() => setRating(0)}
            >
              Bỏ chọn
            </button>
          )}
        </div>

        <textarea
          className="comment-textarea"
          placeholder="Viết bình luận của bạn về công việc này..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        <div className="comment-form-actions">
          {user ? (
            <label className="comment-anon-toggle">
              <input
                type="checkbox"
                checked={asAnonymous}
                onChange={(e) => setAsAnonymous(e.target.checked)}
              />
              Đăng dưới dạng ẩn danh
            </label>
          ) : (
            <span className="comment-guest-note">
              <VisibilityOffIcon fontSize="small" /> Bạn đang đăng ở chế độ ẩn danh
            </span>
          )}

          <button
            type="submit"
            className="comment-submit-btn"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={18} style={{ color: "white" }} /> : "Gửi đánh giá"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="comments-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <CircularProgress size={28} style={{ color: "#6300b3" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="comments-empty">
            Chưa có bình luận nào{filter !== "all" ? " trong bộ lọc này" : ""}.
          </div>
        ) : (
          paginated.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-avatar">
                {c.authorAvatar ? (
                  <img src={c.authorAvatar} alt={c.authorName} />
                ) : (
                  <div className="comment-avatar-fallback">
                    {c.isAnonymous ? <VisibilityOffIcon /> : <PersonIcon />}
                  </div>
                )}
              </div>

              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">{c.authorName}</span>
                  {c.isAnonymous ? (
                    <span className="comment-badge anon">
                      <VisibilityOffIcon fontSize="inherit" /> Ẩn danh
                    </span>
                  ) : (
                    <span className="comment-badge verified">
                      <VerifiedIcon fontSize="inherit" /> Đã xác minh
                    </span>
                  )}
                  <span className="comment-date">{formatDate(c.createdAt)}</span>
                </div>

                {c.rating > 0 && (
                  <div className="comment-stars">
                    <StarRating value={c.rating} size="small" allowHalf={false} />
                  </div>
                )}

                {c.content && <div className="comment-content">{c.content}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="comments-pagination">
          <span className="comments-page-info">
            Hiện {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
          <Pagination
            count={totalPages}
            page={safePage}
            onChange={(_, p) => {
              setPage(p);
              const el = document.querySelector(".comments-section");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            color="secondary"
            shape="rounded"
            size="small"
          />
        </div>
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

export default CommentSection;
