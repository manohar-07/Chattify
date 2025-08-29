import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getMessages, getConversations, sendMessage } from "../controllers/message.controller.js";
const router =  express.Router();


router.get("/conversations",protectRoute,getConversations)  // to get all conversations for sidebar
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id",protectRoute,sendMessage)


export default router;