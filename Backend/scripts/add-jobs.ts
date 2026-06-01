// Script add-only: insert các job trong extra-jobs.ts vào DB
// Skip job nếu đã có job cùng title (idempotent — chạy nhiều lần OK).
import dotenv from "dotenv";
import mongoose from "mongoose";
import Job from "../models/jobs.models";
import { extraJobs } from "../data/extra-jobs";
import { calculateMonthlySalary } from "../helper/salary.helper";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ITSS2";

async function addJobs() {
  await mongoose.connect(mongoUrl);

  let inserted = 0;
  let skipped = 0;

  for (const job of extraJobs) {
    const existing = await Job.findOne({ title: job.title });
    if (existing) {
      console.log(`  ⊘ Skip (đã có): ${job.title}`);
      skipped++;
      continue;
    }
    await Job.create({
      ...job,
      monthlySalary: calculateMonthlySalary(
        job.salary,
        job.salaryUnit,
        job.workingSchedule
      ),
    });
    console.log(`  ✓ Thêm:        ${job.title}`);
    inserted++;
  }

  console.log(`\nXong: thêm ${inserted}, skip ${skipped}.`);
  await mongoose.disconnect();
}

addJobs().catch((err) => {
  console.error("Add jobs lỗi:", err);
  process.exit(1);
});
