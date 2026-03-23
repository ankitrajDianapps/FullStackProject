const axios = require("axios");
const AppError = require("../../utils/AppError");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Handle OpenRouter API calls
 */
const callOpenRouter = async (messages, maxTokens = 1000) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AppError("AI support is currently unavailable. (Missing API Key)", 500);
    }

    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: "deepseek/deepseek-v3.2", // Fast and cheap
                messages: messages,
                max_tokens: maxTokens,
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://dekhoblog.com", // For OpenRouter stats
                    "X-Title": "Dekho Blog Writing Assistant",
                },
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content.trim();
        } else {
            console.error("OpenRouter Response Error:", response.data);
            throw new AppError("Failed to get response from AI assistant.", 500);
        }
    } catch (err) {
        console.error("AI Service Error:", err.response?.data || err.message);
        throw new AppError("AI service error: " + (err.response?.data?.error?.message || err.message), 500);
    }
};

/**
 * Truncate long content to respect AI token limits
 */
const truncateContent = (content, maxChars = 4000) => {
    if (!content) return "";
    return content.length > maxChars ? content.substring(0, maxChars) + "..." : content;
};

const SYSTEM_PROMPT = `You are a professional blogging assistant for "Dekho Blog". 
Your goal is to help users create high-quality, engaging, and professional blog posts.
Rules:
1. Always be helpful, concise, and creative.
2. Maintain a professional yet friendly tone.
3. ADHERE TO SAFETY STANDARDS: Refuse to generate content that's hateful, harmful, sexually explicit, or promotes illegal activities. If asked for such, respond politely that you cannot assist with that topic.
4. Output only the requested content without extra conversational fluff (unless specifically asked for advice).`;

module.exports.generateDraft = async (title) => {
    if (!title) throw new AppError("Title/Topic is required for generation", 400);

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `Write a high-quality blog post draft for the title: "${title}". 
            Structure it well with headings if needed. Keep it engaging.`
        }
    ];

    return await callOpenRouter(messages, 300);
};

module.exports.summarize = async (content) => {
    if (!content) throw new AppError("Content is required for summarization", 400);

    const truncated = truncateContent(content, 6000);
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `Read the following blog post content and generate a concise, catchy 2-3 sentence summary (excerpt) for it.\n\nContent: ${truncated}`
        }
    ];

    return await callOpenRouter(messages, 250);
};

module.exports.refine = async (content, mode = "improve") => {
    if (!content) throw new AppError("Content is required for refinement", 400);

    const modes = {
        "improve": "Improve the grammar, flow, and vocabulary of the following text while maintaining the original meaning.",
        "professional": "Rewrite the following text to sound more professional and authoritative.",
        "creative": "Rewrite the following text to sound more creative and engaging.",
        "shorten": "Condense the following text while keeping all the key information."
    };

    const task = modes[mode] || modes["improve"];
    const truncated = truncateContent(content, 5000);

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `${task}\n\nText: ${truncated}`
        }
    ];

    return await callOpenRouter(messages, 300);
};

// --- RAG Chatbot Section ---

const knowledgeBase = require("./knowledge.json");

const CHAT_SYSTEM_PROMPT = `You are "Dekho Bot", the official AI assistant for the Dekho Blog platform.
Your objective is to help users understand and navigate the website's features.

GROUNDING RULES:
1. ONLY answer questions based on the provided Knowledge Base context.
2. If the user asks something NOT related to Dekho Blog or not covered in the knowledge base (e.g., general knowledge, coding help, personal advice), politely say: "I'm sorry, I am only trained to answer questions about the Dekho Blog platform and its features. How can I help you with the website today?"
3. Be friendly, concise, and helpful.
4. Use the information below to answer:

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}
`;

module.exports.getChatResponse = async (userQuery) => {
    if (!userQuery) throw new AppError("Question is required", 400);

    const messages = [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "user", content: userQuery }
    ];

    return await callOpenRouter(messages, 500);
};
