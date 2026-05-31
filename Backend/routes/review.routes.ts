import { Router } from "express";
import * as controller from "../controllers/review.controllers";
const router: Router = Router();

router.get("/:jobId", controller.getReviews);
router.get("/:jobId/stats", controller.getReviewStats);
router.post("/", controller.createReview);

export const reviewRoutes: Router = router;
