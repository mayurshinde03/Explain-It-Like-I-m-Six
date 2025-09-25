const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        console.log('🔑 Checking API key...');
        console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
        console.log('API key starts with AIzaSy:', process.env.GEMINI_API_KEY?.startsWith('AIzaSy'));
        console.log('API key length:', process.env.GEMINI_API_KEY?.length);
        
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment variables');
            this.genAI = null;
            this.model = null;
        } else if (!process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
            console.error('❌ Invalid API key format. Should start with "AIzaSy"');
            this.genAI = null;
            this.model = null;
        } else {
            console.log('✅ API key looks valid, initializing Gemini...');
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // 🚨 CHANGE THIS LINE - Use the correct model name:
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        }
    }

    async explainConcept(topic) {
        if (!this.model) {
            return {
                success: false,
                error: 'Gemini API not configured',
                explanation: `Sample explanation for "${topic}": This is like when you have a toy that does something cool, but to understand how it works, you need to look inside and see all the parts working together! 🎯`
            };
        }

        try {
            const prompt = `Explain "${topic}" like I'm 6 years old. Follow these rules:
            1. Use simple analogies and comparisons to things a 6-year-old knows (toys, animals, family, food, playground)
            2. Tell it as a fun story with characters or scenarios
            3. Break it into 3-4 short, easy paragraphs
            4. Use words a child would understand - avoid jargon completely
            5. Make it engaging and fun with emojis
            6. Include a simple analogy at the start like "It's like..."
            7. End with a fun fact or "wow" moment
            8. Keep the total explanation under 200 words
            9. Use friendly, encouraging tone
            
            Topic: ${topic}
            
            Remember: Explain it so simply that a 6-year-old would say "Oh, now I get it!"`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return {
                success: true,
                explanation: text,
                topic: topic,
                wordCount: text.split(' ').length
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            return {
                success: false,
                error: 'Failed to generate explanation',
                details: error.message,
                explanation: `Sample explanation for "${topic}": This is like when you have a toy that does something cool, but to understand how it works, you need to look inside and see all the parts working together! 🎯`
            };
        }
    }

    async generateVisualPrompt(topic) {
        return {
            success: true,
            visualPrompt: `A colorful cartoon illustration showing ${topic} in a simple, child-friendly way with bright colors, friendly characters, and simple shapes that a 6-year-old would love.`
        };
    }
}

module.exports = GeminiService;
