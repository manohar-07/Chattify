import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, updateGroupDetails } from "../controllers/group.controller.js";

const router = express.Router();

// Route to create a new group chat
router.post("/create", protectRoute, createGroup);
router.put("/:id/update", protectRoute, updateGroupDetails); 

export default router;