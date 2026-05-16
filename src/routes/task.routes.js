import express from "express";
import protect from "../middleware/auth.middleware.js";
import { createTask, updateTask, deleteTask, taskList, taskDetail } from "../controllers/task.controller.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/:orgId/:projectId/tasks", protect, requireRole("admin","manager","member"), createTask);
router.put("/:orgId/:projectId/tasks/:taskId", protect, requireRole("admin","manager","member"), updateTask);
router.delete("/:orgId/:projectId/tasks/:taskId", protect, requireRole("admin","manager"), deleteTask);
router.get("/:orgId/:projectId/tasks", protect, requireRole("admin","manager","member"), taskList);
router.get("/:orgId/:projectId/tasks/:taskId", protect, requireRole("admin","manager","member"), taskDetail);

export default router;