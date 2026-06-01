import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, select: false }, // ẩn mặc định khi query, phải .select('+passwordHash') nếu cần
  avatar: { type: String },
  profileCompleted: { type: Boolean, default: false },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  dateOfBirth: { type: Date },
  address: { type: String },
  phone: { type: String },
  jobType: { type: String },
  jobForm: { type: String },
  university: { type: String },
  major: { type: String },
  desiredJob: { type: String },
  category: { type: String },
  workingSchedule: [
    {
      day: {
        type: String,
        enum: [
          "Thứ 2",
          "Thứ 3",
          "Thứ 4",
          "Thứ 5",
          "Thứ 6",
          "Thứ 7",
          "Chủ nhật",
        ],
        required: true,
      },
      period: {
        type: String,
        enum: ["sáng", "chiều", "tối"],
        required: true,
      },
    },
  ],
});

export default mongoose.model("User", userSchema, "Users");
