import { Request } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.models";

/**
 * Đọc Bearer token từ Authorization header, verify và trả về user.
 * Trả về null nếu không có token, token sai, hoặc user không tồn tại.
 * Không throw — dùng cho route công khai cần biết "ai đang xem nếu có".
 */
export const getOptionalUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret) as { userId: string };
    return await User.findById(decoded.userId);
  } catch {
    return null;
  }
};
