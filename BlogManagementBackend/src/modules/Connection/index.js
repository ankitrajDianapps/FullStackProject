const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const {
    sendRequest,
    acceptRequest,
    removeConnection,
    getConnections,
    getConnectionStatus
} = require("./controller.js")

const router = express.Router()
router.use(express.json())

router.post("/request/:recipientId", auth, sendRequest)
router.patch("/accept/:connectionId", auth, acceptRequest)
router.delete("/remove/:recipientId", auth, removeConnection)
router.get("/", auth, getConnections)
router.get("/status/:profileUserId", auth, getConnectionStatus)

module.exports = router
