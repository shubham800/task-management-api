import express from "express";
import protect from "../middleware/auth.middleware.js";
import { createProject, getProjectList, updateProject, deleteProject } from "../controllers/project.controller.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/:orgId/projects", protect, requireRole("admin","manager"), createProject);
router.get("/:orgId/projects", protect, requireRole("admin","manager","member"), getProjectList);
router.put("/:orgId/projects/:projectId", protect, requireRole("admin","manager"), updateProject);
router.delete("/:orgId/projects/:projectId", protect, requireRole("admin","manager"), deleteProject);

export default router;