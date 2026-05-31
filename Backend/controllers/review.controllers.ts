import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review.models";

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ jobId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name"),
      Review.countDocuments({ jobId }),
    ]);

    res.status(200).json({
      data: reviews,
      pagination: {
        currentPage: page,
        limitItems: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const stats = await Review.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]);

    if (stats.length === 0) {
      res.status(200).json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      return;
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratings.forEach((rating: number) => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.status(200).json({
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution,
    });
  } catch (error) {
    console.error("Get Review Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { jobId, userId, rating, comment } = req.body;

    if (!jobId || !userId || !rating || !comment) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const review = new Review({ jobId, userId, rating, comment });
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
