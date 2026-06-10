import express from "express";

import { createNewCase, getCases, getCase, getCasesByOwner, getCasesByRecipient, updateCase, removeCase } from "../controllers/caseController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

//POST | localhost:3868/api/v1/case
router.post("/", authenticateToken, createNewCase);

router.get("/owner/:ownerUuid", authenticateToken, getCasesByOwner);
router.get("/recipient/:recipientUuid", authenticateToken, getCasesByRecipient);

router.get("/", authenticateToken, authorizeRole("support", "admin"), getCases);
router.get("/:uuid", authenticateToken, authorizeRole("support", "admin"), getCase);

router.patch("/:uuid", authenticateToken, updateCase);

router.delete("/:uuid", authenticateToken, authorizeRole("admin"), removeCase);

export default router;