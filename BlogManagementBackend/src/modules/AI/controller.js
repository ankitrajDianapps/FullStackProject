const aiService = require("./service");
const { apiResponse } = require("../../config/responseHandler");

module.exports.generateContent = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return apiResponse({ res, code: 400, message: "Title/Topic is required", status: false });
        }

        const content = await aiService.generateDraft(title);

        return apiResponse({
            res,
            code: 200,
            message: "Content generated successfully",
            status: true,
            data: { content }
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

module.exports.summarizeContent = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return apiResponse({ res, code: 400, message: "Content is required", status: false });
        }

        const summary = await aiService.summarize(content);

        return apiResponse({
            res,
            code: 200,
            message: "Summary generated successfully",
            status: true,
            data: { summary }
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

module.exports.refineContent = async (req, res) => {
    try {
        const { content, mode } = req.body;
        if (!content) {
            return apiResponse({ res, code: 400, message: "Content is required", status: false });
        }

        const refinedContent = await aiService.refine(content, mode);

        return apiResponse({
            res,
            code: 200,
            message: "Content refined successfully",
            status: true,
            data: { content: refinedContent }
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
