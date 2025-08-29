import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup } from "../controllers/group.controller.js";

const router = express.Router();

// Route to create a new group chat
router.post("/create", protectRoute, createGroup);

export default router;