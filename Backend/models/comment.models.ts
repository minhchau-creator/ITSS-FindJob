import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },

    // userId chỉ có giá trị khi comment được post bởi user đã đăng nhập
    // (kể cả khi user chọn "ẩn danh" — ta vẫn lưu userId để enforce 1 rating/user/job)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // True nếu user chọn hiển thị ẩn danh, hoặc nếu là guest (chưa login)
    isAnonymous: { type: Boolean, default: false },

    // Snapshot tên + avatar tại thời điểm post (để khỏi join User mỗi lần)
    authorName: { type: String },
    authorAvatar: { type: String },

    // 0 = không kèm rating, 1-5 = số sao
    rating: { type: Number, min: 0, max: 5, default: 0 },

    content: { type: String, default: "" },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema, "Comments");
export default Comment;
