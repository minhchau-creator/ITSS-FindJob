import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.models";
import {
  validatePassword,
  hashPassword,
  comparePassword,
  isValidEmail,
} from "../helper/password.helper";
import { getOptionalUser } from "../helper/auth.helper";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

const publicUser = (user: any) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  profileCompleted: user.profileCompleted,
  hasPassword: Boolean(user.passwordHash),
});

const verifyGoogleCredential = async (credential: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

//[POST]/api/v1/auth/google
// 1-click Google login. Tự tạo account nếu chưa tồn tại (user có thể đặt password sau).
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ message: "Missing Google credential" });
      return;
    }

    const payload = await verifyGoogleCredential(credential);
    if (!payload || !payload.sub || !payload.email) {
      res.status(401).json({ message: "Invalid Google token" });
      return;
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.findOne({ email: payload.email });
      if (user) {
        user.googleId = payload.sub;
        if (!user.avatar && payload.picture) user.avatar = payload.picture;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        avatar: payload.picture,
        profileCompleted: false,
      });
    }

    const token = signToken(user._id.toString());
    res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

//[POST]/api/v1/auth/register
// Body: { credential (Google ID token), password, name }
// Verify Gmail qua Google → đặt password → tạo (hoặc merge) account
export const register = async (req: Request, res: Response) => {
  try {
    const { credential, password, name } = req.body;

    if (!credential) {
      res.status(400).json({ message: "Vui lòng xác thực Gmail trước" });
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      res.status(400).json({ message: passErr });
      return;
    }
    if (!name || !name.trim()) {
      res.status(400).json({ message: "Vui lòng nhập họ và tên" });
      return;
    }

    const payload = await verifyGoogleCredential(credential);
    if (!payload || !payload.sub || !payload.email) {
      res.status(401).json({ message: "Xác thực Google thất bại" });
      return;
    }

    const passwordHash = await hashPassword(password);

    // Tìm account đã tồn tại (theo googleId hoặc email)
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email }],
    }).select("+passwordHash");

    if (user) {
      if (user.passwordHash) {
        res.status(409).json({
          message: "Email này đã có tài khoản. Vui lòng đăng nhập.",
        });
        return;
      }
      // Merge: account Google sẵn có nhưng chưa có password → set password + name
      user.passwordHash = passwordHash;
      user.name = name.trim();
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    } else {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: name.trim(),
        avatar: payload.picture,
        passwordHash,
        profileCompleted: false,
      });
    }

    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Đăng ký thất bại" });
  }
};

//[POST]/api/v1/auth/login
// Body: { email, password }
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Email không hợp lệ" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "Vui lòng nhập mật khẩu" });
      return;
    }

    const user = await User.findOne({ email: email.trim() }).select("+passwordHash");
    if (!user) {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
      return;
    }
    if (!user.passwordHash) {
      res.status(401).json({
        message: "Tài khoản này chưa đặt mật khẩu. Hãy đăng nhập bằng Google.",
      });
      return;
    }

    const matched = await comparePassword(password, user.passwordHash);
    if (!matched) {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
      return;
    }

    const token = signToken(user._id.toString());
    res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Đăng nhập thất bại" });
  }
};

//[POST]/api/v1/auth/set-password
// Yêu cầu: đã đăng nhập. Body: { currentPassword?, newPassword }
// Nếu user chưa có password (Google-only) → không cần currentPassword.
export const setPassword = async (req: Request, res: Response) => {
  try {
    const authUser = await getOptionalUser(req);
    if (!authUser) {
      res.status(401).json({ message: "Chưa đăng nhập" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const passErr = validatePassword(newPassword);
    if (passErr) {
      res.status(400).json({ message: passErr });
      return;
    }

    const user = await User.findById(authUser._id).select("+passwordHash");
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy user" });
      return;
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại" });
        return;
      }
      const ok = await comparePassword(currentPassword, user.passwordHash);
      if (!ok) {
        res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
        return;
      }
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công", user: publicUser(user) });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//[GET]/api/v1/auth/me
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await User.findById(decoded.userId).select("+passwordHash");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Trả full user nhưng kèm hasPassword (boolean), không lộ hash
    const obj = user.toObject();
    delete (obj as any).passwordHash;
    (obj as any).hasPassword = Boolean(user.passwordHash);
    res.status(200).json(obj);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
