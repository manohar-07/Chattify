// backend/src/routes/conversation.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { findOrCreateConversation } from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", protectRoute, findOrCreateConversation);

export default router;