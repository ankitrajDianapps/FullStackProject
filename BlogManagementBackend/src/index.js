const express = require('express')
const path = require('path')
require("dotenv").config()

const { connectDB } = require('./config/db.js')
const userRoutes = require("./modules/user")
const postRoutes = require("./modules/Post")
const commentRouter = require("./modules/Comment")
const analyticsRouter = require("./modules/Analytics")

const cron = require("node-cron")
const dailyAggregation = require("./cron/dailyAggregation.js")
const { postAnalytics } = require('./modules/Analytics/controller.js')
const { trendingPosts } = require('./cron/TrendingPost.js')
const inActiveUserCleanup = require('./cron/InActiveUserCleanup.js')
const { InActiveUserCleanup } = require("./cron/InActiveUserCleanup.js")
const { messages } = require('./messages/apiResponses.js')
const cors = require("cors")
const app = express()

app.use(express.json())
connectDB()

// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, "../../frontend/dist")))

// CORS

app.use(cors({
    origin: "https://bms-dekhoblog.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}))

app.use("/api/auth", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRouter)
app.use("/api/analytics", analyticsRouter)

// API 404 Handler
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `API End Point does not exist ${req.url}`
    });
});

// SPA Catch-all: serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});


cron.schedule("*/2 * * * *", dailyAggregation)

cron.schedule("*/2 * * * *", trendingPosts)

cron.schedule("0 0 */7 * *", inActiveUserCleanup)

port = process.env.PORT || 5000
app.listen(port, () => {
    console.log("Server is listening at port 8000")

})

