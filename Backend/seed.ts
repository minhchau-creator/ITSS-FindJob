import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import mongoose from "mongoose";
import Job from "./models/jobs.models";
import User from "./models/user.models";
import { calculateMonthlySalary } from "./helper/salary.helper";
import { hashPassword } from "./helper/password.helper";
import { extraJobs } from "./data/extra-jobs";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ITSS2";
const mongoDataDir = path.join(__dirname, ".mongo-data");
const mongoLogDir = path.join(__dirname, ".mongo-log");
const mongoLogPath = path.join(mongoLogDir, "mongod.log");

function isLocalMongoUrl(url: string): boolean {
  return /mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url);
}

function findMongoExecutable(): string | null {
  // Danh sách các đường dẫn phổ biến để tăng tính linh hoạt
  const commonPaths = [
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
  ];

  const foundPath = commonPaths.find(p => fs.existsSync(p));
  if (foundPath) return foundPath;

  return null;
}

function startMongoDaemon(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mongodPath = findMongoExecutable();

    if (!mongodPath) {
      reject(new Error("Không tìm thấy mongod.exe. Hãy cài MongoDB Server hoặc bật MongoDB local trước khi seed."));
      return;
    }

    fs.mkdirSync(mongoDataDir, { recursive: true });
    fs.mkdirSync(mongoLogDir, { recursive: true });

    const child = spawn(
      mongodPath,
      [
        "--dbpath",
        mongoDataDir,
        "--logpath",
        mongoLogPath,
        "--logappend",
        "--port",
        "27017",
        "--bind_ip",
        "127.0.0.1",
      ],
      {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      }
    );

    child.unref();
    resolve();
  });
}

async function waitForMongoReady(timeoutMs = 15000): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 1000 });
      await mongoose.disconnect();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("MongoDB local chưa sẵn sàng sau khi khởi động tự động.");
}

async function connectWithLocalFallback(): Promise<void> {
  try {
    await mongoose.connect(mongoUrl);
    return;
  } catch (error) {
    if (!isLocalMongoUrl(mongoUrl)) {
      throw error;
    }

    await startMongoDaemon();
    await waitForMongoReady();
    await mongoose.connect(mongoUrl);
  }
}

const jobs = [
  {
    title: "Gia sư Toán cấp 2",
    jobType: "Part-Time",
    category: "Gia sư",
    jobForm: "Contract",
    company: {
      name: "SmartTutor",
      location: "Hà Nội",
      employeeCount: "50 nhân viên",
      industry: "Giáo dục",
      address: "74 ngõ Xã Đàn 2, Nam Đồng, Đống Đa, Hà Nội",
      logo: "https://placehold.co/120x120?text=ST",
    },
    address: "74 ngõ Xã Đàn 2, Nam Đồng, Đống Đa, Hà Nội",
    salary: 250000,
    salaryUnit: "buổi",
    experienceRequired: "Không yêu cầu kinh nghiệm",
    numberOfPeople: "2 người",
    needCount: 2,
    hiredCount: 0,
    applyingCount: 5,
    contact: {
      person: "Chị Hương (HR)",
      email: "hr@smarttutor.vn",
      phone: "0912 345 678",
    },
    workingTime: "Thứ 2, Thứ 4, Thứ 6 : 18h00-20h00",
    workingSchedule: [
      { day: "Thứ 2", period: "tối" },
      { day: "Thứ 4", period: "tối" },
      { day: "Thứ 6", period: "tối" },
    ],
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-08-31"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-05-15"),
    description: "Dạy toán lớp 6-9, ưu tiên sinh viên sư phạm hoặc có kỹ năng kèm 1-1.",
    deleted: false,
  },
  {
    title: "Nhân viên bán hàng Part-Time",
    jobType: "Part-Time",
    category: "Sales",
    jobForm: "Contract",
    company: {
      name: "Nova Store",
      location: "Hà Nội",
      employeeCount: "120 nhân viên",
      industry: "Bán lẻ",
      address: "12 Chùa Bộc, Đống Đa, Hà Nội",
      logo: "https://placehold.co/120x120?text=NS",
    },
    address: "12 Chùa Bộc, Đống Đa, Hà Nội",
    salary: 300000,
    salaryUnit: "ca",
    experienceRequired: "Có kinh nghiệm bán hàng là lợi thế",
    numberOfPeople: "3 người",
    needCount: 3,
    hiredCount: 1,
    applyingCount: 8,
    contact: {
      person: "Anh Tuấn (Quản lý cửa hàng)",
      email: "tuyendung@novastore.vn",
      phone: "0987 654 321",
    },
    workingTime: "Thứ 3, Thứ 5, Thứ 7 : 8h00-12h00",
    workingSchedule: [
      { day: "Thứ 3", period: "sáng" },
      { day: "Thứ 5", period: "sáng" },
      { day: "Thứ 7", period: "sáng" },
    ],
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-12-31"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-05-31"),
    description: "Tư vấn sản phẩm, hỗ trợ khách hàng và trưng bày hàng hóa tại cửa hàng.",
    deleted: false,
  },
  {
    title: "Lập trình viên Intern Frontend",
    jobType: "Full-Time",
    category: "IT",
    jobForm: "Internship",
    company: {
      name: "TechFlow",
      location: "Hà Nội",
      employeeCount: "80 nhân viên",
      industry: "Công nghệ",
      address: "21 Duy Tân, Cầu Giấy, Hà Nội",
      logo: "https://placehold.co/120x120?text=TF",
    },
    address: "21 Duy Tân, Cầu Giấy, Hà Nội",
    salary: 7000000,
    salaryUnit: "tháng",
    experienceRequired: "Biết React là lợi thế",
    numberOfPeople: "1 người",
    needCount: 1,
    hiredCount: 0,
    applyingCount: 12,
    contact: {
      person: "Chị Mai (Talent Acquisition)",
      email: "career@techflow.com",
      phone: "0901 234 567",
    },
    workingTime: "Thứ 2 - Thứ 6 : 9h00-18h00",
    workingSchedule: [
      { day: "Thứ 2", period: "sáng" },
      { day: "Thứ 3", period: "sáng" },
      { day: "Thứ 4", period: "sáng" },
      { day: "Thứ 5", period: "sáng" },
      { day: "Thứ 6", period: "sáng" },
    ],
    startDate: new Date("2026-05-15"),
    endDate: new Date("2026-11-15"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-06-01"),
    description: "Tham gia phát triển giao diện web, phối hợp với backend qua API.",
    deleted: false,
  },
  {
    title: "Cộng tác viên Content",
    jobType: "Part-Time",
    category: "Marketing",
    jobForm: "Freelance",
    company: {
      name: "Blue Media",
      location: "Hà Nội",
      employeeCount: "35 nhân viên",
      industry: "Truyền thông",
      address: "45 Láng Hạ, Đống Đa, Hà Nội",
      logo: "https://placehold.co/120x120?text=BM",
    },
    address: "45 Láng Hạ, Đống Đa, Hà Nội",
    salary: 4000000,
    salaryUnit: "tháng",
    experienceRequired: "Biết viết bài chuẩn SEO",
    numberOfPeople: "2 người",
    needCount: 2,
    hiredCount: 1,
    applyingCount: 6,
    contact: {
      person: "Anh Khoa (Content Lead)",
      email: "hr@bluemedia.vn",
      phone: "0936 789 012",
    },
    workingTime: "Linh hoạt",
    workingSchedule: [
      { day: "Thứ 2", period: "chiều" },
      { day: "Thứ 4", period: "chiều" },
      { day: "Thứ 6", period: "chiều" },
    ],
    startDate: new Date("2026-05-10"),
    endDate: new Date("2026-10-10"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-05-20"),
    description: "Viết bài, lên ý tưởng nội dung và hỗ trợ quản lý fanpage.",
    deleted: false,
  },
  {
    title: "Lễ tân phòng gym",
    jobType: "Part-Time",
    category: "Dịch vụ",
    jobForm: "Contract",
    company: {
      name: "FitZone",
      location: "Hà Nội",
      employeeCount: "22 nhân viên",
      industry: "Thể thao",
      address: "9 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
      logo: "https://placehold.co/120x120?text=FZ",
    },
    address: "9 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    salary: 280000,
    salaryUnit: "ca",
    experienceRequired: "Giao tiếp tốt",
    numberOfPeople: "1 người",
    needCount: 1,
    hiredCount: 0,
    applyingCount: 3,
    contact: {
      person: "Chị Linh (Lễ tân trưởng)",
      email: "tuyendung@fitzone.vn",
      phone: "0978 111 222",
    },
    workingTime: "Thứ 2, Thứ 5, Chủ nhật : 17h00-21h00",
    workingSchedule: [
      { day: "Thứ 2", period: "tối" },
      { day: "Thứ 5", period: "tối" },
      { day: "Chủ nhật", period: "tối" },
    ],
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-09-30"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-05-25"),
    description: "Đón tiếp khách hàng, hỗ trợ check-in và trả lời các câu hỏi cơ bản.",
    deleted: false,
  },
  {
    title: "Thu ngân siêu thị",
    jobType: "Full-Time",
    category: "Bán lẻ",
    jobForm: "Official",
    company: {
      name: "MiniMart",
      location: "Hà Nội",
      employeeCount: "200 nhân viên",
      industry: "Bán lẻ",
      address: "88 Nguyễn Trãi, Thanh Xuân, Hà Nội",
      logo: "https://placehold.co/120x120?text=MM",
    },
    address: "88 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    salary: 6500000,
    salaryUnit: "tháng",
    experienceRequired: "Có kỹ năng làm việc với máy POS",
    numberOfPeople: "2 người",
    needCount: 2,
    hiredCount: 2,
    applyingCount: 0,
    contact: {
      person: "Anh Phong (Cửa hàng trưởng)",
      email: "hr@minimart.vn",
      phone: "0945 678 901",
    },
    workingTime: "Ca xoay",
    workingSchedule: [
      { day: "Thứ 2", period: "sáng" },
      { day: "Thứ 3", period: "chiều" },
      { day: "Thứ 4", period: "sáng" },
    ],
    startDate: new Date("2026-05-05"),
    endDate: new Date("2027-05-05"),
    recruitStartDate: new Date("2026-04-21"),
    recruitEndDate: new Date("2026-05-30"),
    description: "Thực hiện thanh toán, hỗ trợ khách hàng và giữ khu vực quầy gọn gàng.",
    deleted: false,
  },
];

const users = [
  {
    name: "Nguyễn Quốc Khánh",
    email: "khanh@example.com",
    address: "Đống Đa, Hà Nội",
    phone: "0987654321",
    jobType: "Part-Time",
    jobForm: "Contract",
    university: "HUST",
    major: "CNTT",
    desiredJob: "gia sư",
    category: "Gia sư",
    workingSchedule: [
      { day: "Thứ 2", period: "tối" },
      { day: "Thứ 4", period: "tối" },
      { day: "Thứ 6", period: "tối" },
    ],
  },
  {
    name: "Phạm Hoàng Hải Nam",
    email: "nam@example.com",
    address: "Hai Bà Trưng, Hà Nội",
    phone: "0912345678",
    jobType: "Part-Time",
    jobForm: "Contract",
    university: "NEU",
    major: "Marketing",
    desiredJob: "bán hàng",
    category: "Sales",
    workingSchedule: [
      { day: "Thứ 3", period: "sáng" },
      { day: "Thứ 5", period: "sáng" },
      { day: "Thứ 7", period: "sáng" },
    ],
  },
];

async function seed() {
  try {
    await connectWithLocalFallback();

    await Promise.all([Job.deleteMany({}), User.deleteMany({})]);

    const allJobs = [...jobs, ...extraJobs];
    const jobsWithMonthly = allJobs.map((job) => ({
      ...job,
      monthlySalary: calculateMonthlySalary(
        job.salary,
        job.salaryUnit,
        job.workingSchedule
      ),
    }));

    // Mọi user mẫu đều có password = "password1"
    const defaultHash = await hashPassword("password1");
    const usersWithPassword = users.map((u) => ({
      ...u,
      passwordHash: defaultHash,
      profileCompleted: true, // user mẫu có sẵn full info → đánh dấu complete
    }));

    const insertedJobs = await Job.insertMany(jobsWithMonthly);
    const insertedUsers = await User.insertMany(usersWithPassword);

    console.log(`Seed xong: ${insertedJobs.length} jobs, ${insertedUsers.length} users`);
  } catch (error) {
    console.error("Seed thất bại:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();