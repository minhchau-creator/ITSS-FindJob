import { Router } from "express";
import * as controller from "../controllers/comments.controllers";

// Mount tại /api/v1/jobs/:jobId/comments  → mergeParams để đọc :jobId từ parent
const router: Router = Router({ mergeParams: true });

router.get("/", controller.listComments);
router.post("/", controller.createComment);

export const commentRoutes: Router = router;
