const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY missing");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using "gemini-flash-latest" as confirmed by the available models list
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: "Gemini API error: " + error.message });
    }
};

module.exports = { handleChat };
