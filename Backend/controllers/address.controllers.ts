import { Request, Response } from "express";
import Job from "../models/jobs.models";

// [GET] /api/v1/addresses
export const index = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ deleted: false }).select("address -_id");

    const wardsAndDistricts = jobs.map(job => {
      const fullAddress = job.address || "";
      const parts = fullAddress.split(",").map(s => s.trim());

      // Nếu có đủ phần tử (ít nhất 3: đường, phường, quận,...)
      if (parts.length >= 3) {
        return parts.slice(1, 3).join(", "); // lấy phần [phường, quận]
      }
      return null;
    }).filter(Boolean); // loại bỏ null nếu địa chỉ không đủ phần

    const uniqueAddresses = [...new Set(wardsAndDistricts)];

    res.status(200).json({
      address: uniqueAddresses,
    });
  } catch (error) {
    console.error("Get Wards and Districts Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

