import { Request, Response } from "express";
import User from "../models/user.models";
import Job from "../models/jobs.models";
import mongoose from "mongoose";

//[GET]/api/v1/users
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid User ID format" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//[POST]/api/v1/users
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid User ID format" });
      return;
    }

    const {
      name,
      email,
      dateOfBirth,
      address,
      phone,
      jobType,
      jobForm,
      university,
      major,
      category,
      workingSchedule,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        dateOfBirth,
        address,
        phone,
        jobType,
        jobForm,
        university,
        major,
        category,
        workingSchedule,
        profileCompleted: true,
      },
      { new: true } // Removed upsert: true to prevent accidental creation
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//[GET]/api/v1/users/:id/suggested-jobs
export const suggestJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid User ID format" });
      return;
    }

    const jobs = await Job.find({ deleted: false });
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const scoredJobs = jobs.map((job) => {
      let score = 0;

      if (user.jobType && job.jobType === user.jobType) score += 2;
      if (user.jobForm && job.jobForm === user.jobForm) score += 2;

      if (
        user.desiredJob &&
        job.title.toLowerCase().includes(user.desiredJob.toLowerCase())
      ) {
        score += 3;
      }

      const userSchedule = user.workingSchedule || [];
      const jobSchedule = job.workingSchedule || [];

      const matchingSchedules = userSchedule.filter((uSlot) =>
        jobSchedule.some(
          (jSlot) => jSlot.day === uSlot.day && jSlot.period === uSlot.period
        )
      );

      score += matchingSchedules.length;

      return {
        job,
        score,
      };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    const topJobs = scoredJobs.slice(0, 10);
    const result = topJobs.map((entry) => entry.job);
    res.status(200).json(result);
  } catch (error) {
    console.error("Suggest Jobs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//[GET]/api/v1/users/:id/get-jtype-list
export const getJobTypeList = async (req: Request, res: Response) => {
  try {
    const jobTypes = await Job.distinct("jobType");
    res.status(200).json(jobTypes);
  } catch (error) {
    console.error("Error fetching job types:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//[GET]/api/v1/users/:id/get-jform-list
export const getJobFormList = async (req: Request, res: Response) => {
  try {
    const jobForms = await Job.distinct("jobForm");
    res.status(200).json(jobForms);
  } catch (error) {
    console.error("Error fetching job forms:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//[GET]/api/v1/users/:id/get-category-list
export const getCategoryList = async (req: Request, res: Response) => {
  try {
    const categories = await Job.distinct("category");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching job categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};
