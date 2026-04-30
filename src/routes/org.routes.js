import express from "express";
import protect from "../middleware/auth.middleware.js";
import { createOrganization, organizationDetail, deleteOrganization, updateOrganization } from "../controllers/org.controller.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/orgs", protect, createOrganization);
router.put("/orgs/:orgId", protect, requireRole("admin","manager"), updateOrganization);
router.delete("/orgs/:orgId", protect, requireRole("admin"), deleteOrganization);
router.get("/orgs/:orgId", protect, requireRole("admin","manager","member"), organizationDetail);



export default router;