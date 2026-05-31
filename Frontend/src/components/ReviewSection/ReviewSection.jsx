import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import "./ReviewSection.css";

const API_BASE = "http://localhost:8080/api/v1";

const ReviewSection = () => {
  const { id: jobId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/reviews/${jobId}?page=${pageNum}&limit=5`
      );
      if (pageNum === 1) {
        setReviews(response.data.data);
      } else {
        setReviews((prev) => [...prev, ...response.data.data]);
      }
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/reviews/${jobId}/stats`
      );
      setStats(response.data);
    } catch (err) {
      console.error("Lỗi khi tải thống kê:", err);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchReviews(1);
      fetchStats();
    }
  }, [jobId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const anonymizeName = (name) => {
    if (!name) return "***";
    const words = name.split(" ");
    const lastName = words[words.length - 1];
    if (lastName.length <= 1) {
      words[words.length - 1] = "*";
    } else {
      words[words.length - 1] = lastName[0] + "*".repeat(lastName.length - 1);
    }
    return words.join(" ");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    return words.map((w) => w[0]).join("").toUpperCase();
  };

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (!jobId) return null;

  return (
    <div className="review-section">
      <h2 className="review-section-title">Đánh giá từ người dùng</h2>

      <div className="review-stats">
        <div className="stats-average">
          <span className="stats-rating-number">{stats.averageRating}</span>
          <div className="stats-star-group">
            <Rating
              value={stats.averageRating}
              precision={0.5}
              readOnly
              size="large"
              sx={{ color: "#f59e0b" }}
            />
            <span className="stats-total">
              {stats.totalReviews} đánh giá
            </span>
          </div>
        </div>
        <div className="stats-distribution">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="dist-row">
                <span className="dist-label">{star} sao</span>
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="dist-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="review-list">
        {reviews.length === 0 && !loading && (
          <p className="review-empty">Chưa có đánh giá nào</p>
        )}
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <Avatar className="review-avatar">
              {getInitials(review.userId?.name)}
            </Avatar>
            <div className="review-content">
              <div className="review-header">
                <span className="review-name">
                  {anonymizeName(review.userId?.name)}
                </span>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{ color: "#f59e0b" }}
                />
              </div>
              <p className="review-comment">{review.comment}</p>
              <span className="review-time">
                {formatRelativeTime(review.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="review-loadmore">
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Xem thêm đánh giá"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
