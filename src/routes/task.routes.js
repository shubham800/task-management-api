import express from "express";
import protect from "../middleware/auth.middleware.js";
import { createTask } from "../controllers/task.controller.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/:orgId/:projectId/tasks", protect, requireRole("admin","manager","member"), createTask);

export default router;