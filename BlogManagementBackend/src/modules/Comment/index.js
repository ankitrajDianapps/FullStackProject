const express = require("express")
const { addComment, getAllComments, updateComment, deleteComment } = require("./controller.js")
const { auth } = require("../../middleware/authMiddleware.js")
const { cacheMiddleware } = require("../../middleware/cacheMiddleware.js")

const router = express.Router()
router.use(express.json())


router.post("/:postId", auth, addComment)
router.get("/:postId", auth, cacheMiddleware(60), getAllComments)
router.put("/:id", auth, updateComment)
router.delete("/:id", auth, deleteComment)

module.exports = router