import { Request, Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/comment.models";
import { getOptionalUser } from "../helper/auth.helper";

//[GET]/api/v1/jobs/:jobId/comments
// Trả full list comments cho 1 job — filter (anonymous/loggedin) làm ở frontend
// để khi user đổi filter không phải gọi API lại.
export const listComments = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400).json({ message: "Invalid jobId" });
      return;
    }

    const comments = await Comment.find({ jobId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.error("List comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//[POST]/api/v1/jobs/:jobId/comments
// Body: { rating (0-5), content, asAnonymous (boolean) }
// Guest → luôn ẩn danh. Login user → checkbox.
// Rating chỉ cho 1 lần per (userId, jobId). Comment (không rating) không giới hạn.
export const createComment = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400).json({ message: "Invalid jobId" });
      return;
    }

    const { rating = 0, content = "", asAnonymous = false } = req.body;
    const ratingNum = Number(rating) || 0;

    if (ratingNum < 0 || ratingNum > 5) {
      res.status(400).json({ message: "Rating phải từ 0 đến 5" });
      return;
    }
    if (ratingNum === 0 && !content.trim()) {
      res.status(400).json({ message: "Nhập đánh giá hoặc bình luận" });
      return;
    }

    const user = await getOptionalUser(req);
    const isAnonymous = !user || Boolean(asAnonymous);

    // Enforce: 1 rating duy nhất per (userId, jobId) cho user đã login.
    if (user && ratingNum > 0) {
      const existing = await Comment.findOne({
        jobId,
        userId: user._id,
        rating: { $gt: 0 },
      });
      if (existing) {
        res.status(409).json({
          message: "Bạn đã đánh giá công việc này rồi. Có thể viết thêm bình luận (không kèm sao).",
        });
        return;
      }
    }

    const doc = await Comment.create({
      jobId,
      userId: user?._id || null,
      isAnonymous,
      authorName: isAnonymous ? "Người dùng ẩn danh" : user.name,
      authorAvatar: isAnonymous ? null : user.avatar,
      rating: ratingNum,
      content: content.trim(),
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
