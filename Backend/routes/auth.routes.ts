import { Router } from "express";
import * as controller from "../controllers/auth.controllers";

const router: Router = Router();

router.post("/google", controller.googleLogin);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/set-password", controller.setPassword);
router.get("/me", controller.getCurrentUser);

export const authRoutes: Router = router;
