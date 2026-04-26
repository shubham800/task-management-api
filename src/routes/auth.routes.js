import express from "express";
import { register, login, logout, refreshToken, me } from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, me);

export default router;