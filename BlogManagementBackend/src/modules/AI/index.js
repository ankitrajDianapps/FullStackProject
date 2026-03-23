const express = require("express");
const router = express.Router();
const aiController = require("./controller");
const chatController = require("./chatController");
const { auth } = require("../../middleware/authMiddleware");

// All AI routes are protected
router.post("/generate", auth, aiController.generateContent);
router.post("/summarize", auth, aiController.summarizeContent);
router.post("/refine", auth, aiController.refineContent);
router.post("/chat", auth, chatController.chat);

module.exports = router;
