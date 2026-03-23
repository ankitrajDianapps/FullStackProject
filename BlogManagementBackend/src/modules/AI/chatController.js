const aiService = require("./service");
const { apiResponse } = require("../../config/responseHandler");

module.exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return apiResponse({ res, code: 400, message: "Message is required", status: false });
        }

        const response = await aiService.getChatResponse(message);

        return apiResponse({
            res,
            code: 200,
            message: "Chat response generated",
            status: true,
            data: { reply: response }
        });
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        });
    }
};
