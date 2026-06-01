import { Router } from "express";
import * as controller from "../controllers/jobs.controllers";
import { commentRoutes } from "./comments.routes";

const router:Router = Router();

//[GET]/api/v1/jobs
router.get("/", controller.index);
//[GET]/api/v1/jobs/detail/:id
router.get("/detail/:id",controller.detail);

// /api/v1/jobs/:jobId/comments → list + create
router.use("/:jobId/comments", commentRoutes);

export const jobRoutes:Router = router;