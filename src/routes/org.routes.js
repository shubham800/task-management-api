import express from "express";
import protect from "../middleware/auth.middleware.js";
import { createOrganization, organizationDetail, deleteOrganization, updateOrganization, inviteMemberToOrg, updateRole, removeMember } from "../controllers/org.controller.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/orgs", protect, createOrganization);
router.put("/orgs/:orgId", protect, requireRole("admin","manager"), updateOrganization);
router.delete("/orgs/:orgId", protect, requireRole("admin"), deleteOrganization);
router.get("/orgs/:orgId", protect, requireRole("admin","manager","member"), organizationDetail);

router.post("/orgs/:orgId/invite", protect, requireRole("admin"), inviteMemberToOrg);
router.put("/orgs/:orgId/members/:userId/role", protect, requireRole("admin"), updateRole);
router.delete("/orgs/:orgId/members/:userId", protect, requireRole("admin"), removeMember);

export default router;