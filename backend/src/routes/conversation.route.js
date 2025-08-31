// backend/src/routes/conversation.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { findOrCreateConversation , hideOrLeaveConversation} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", protectRoute, findOrCreateConversation);
router.delete("/:id", protectRoute, hideOrLeaveConversation);

export default router;