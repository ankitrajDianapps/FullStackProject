const express = require('express')
const path = require('path')
const fs = require('fs')
require("dotenv").config()

const { connectDB } = require('./config/db.js')
const userRoutes = require("./modules/user")
const postRouter = require("./modules/Post/index.js")
const commentRouter = require("./modules/Comment/index.js")
const analyticsRouter = require("./modules/Analytics/index.js")
const savedPostRouter = require("./modules/SavedPost/index.js")
const connectionRouter = require("./modules/Connection/index.js")
const notificationRouter = require("./modules/Notification/index.js")

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
const frontendPath = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
} else {
    console.warn("WARNING: frontend/dist directory not found. Static files will not be served.");
}

// CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://bms-dekhoblog.onrender.com",
    process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

app.use("/api/auth", userRoutes)
app.use("/api/posts", postRouter)
app.use("/api/comments", commentRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api/saved", savedPostRouter)
app.use("/api/connections", connectionRouter)
app.use("/api/notifications", notificationRouter)

// API 404 Handler
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `API End Point does not exist ${req.url}`
    });
});

// SPA Catch-all: serve index.html for any other routes
app.get('/*any', (req, res) => {
    const indexPath = path.join(__dirname, "../../frontend/dist/index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            success: false,
            message: "Frontend build not found. Please run 'npm run build' in the frontend directory."
        });
    }
});


cron.schedule("*/2 * * * *", dailyAggregation)

cron.schedule("*/2 * * * *", trendingPosts)

cron.schedule("0 0 */7 * *", inActiveUserCleanup)

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server is listening at port ${port}`)
})

