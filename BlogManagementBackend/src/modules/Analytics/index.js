const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { getDashBoard, postAnalytics, todaystrendingPost, authorPerformaceMetrics } = require("./controller.js")
const { cacheMiddleware } = require("../../middleware/cacheMiddleware.js")

const router = express.Router()

router.get("/overview", auth, cacheMiddleware(60), getDashBoard)
router.get("/post/:postId", auth, cacheMiddleware(60), postAnalytics)
router.get("/trending", auth, cacheMiddleware(60), todaystrendingPost)
router.get("/author/:authorId", auth, cacheMiddleware(60), authorPerformaceMetrics)

module.exports = router