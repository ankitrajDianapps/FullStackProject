const express = require("express");
const controller = require("./controller");
const { auth } = require("../../middleware/authMiddleware");

const api = express.Router();

api.get("/", auth, controller.getNotifications);
api.patch("/:id/read", auth, controller.markAsRead);
api.patch("/read-all", auth, controller.markAllAsRead);
api.delete("/:id", auth, controller.deleteById);

module.exports = api;
