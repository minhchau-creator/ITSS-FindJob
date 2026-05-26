import { Router } from "express";
import * as controller from "../controllers/users.controllers";
const router: Router = Router();
//[GET]/api/v1/users
router.get("/:id", controller.getUserInfo);
//[POST]/api/v1/users
router.post("/:id", controller.updateUserInfo);
//[GET]/api/v1/users/:id/suggested-jobs
router.get("/:id/suggested-jobs", controller.suggestJobs);
//[GET}/api/v1/users/get-jtype-list
router.get("/:id/get-jtype-list", controller.getJobTypeList);
//[GET}/api/v1/users/get-jform-list
router.get("/:id/get-jform-list", controller.getJobFormList);
//[GET}/api/v1/users/get-category-list]
router.get("/:id/get-category-list", controller.getCategoryList);
export const userRoutes: Router = router;
