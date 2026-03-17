const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { savePost, unsavePost, getSavedPosts, isPostSaved } = require("./controller.js")

const router = express.Router()
router.use(express.json())

router.post("/:postId", auth, savePost)
router.delete("/:postId", auth, unsavePost)
router.get("/", auth, getSavedPosts)
router.get("/:postId/status", auth, isPostSaved)

module.exports = router
