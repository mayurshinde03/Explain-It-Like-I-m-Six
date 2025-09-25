const express = require('express');
const router = express.Router();
const GeminiService = require('../utils/gemini');

const geminiService = new GeminiService();

// Predefined popular concepts with fun colors and emojis
const popularConcepts = [
    {
        id: 'credit-card',
        title: 'Credit Cards',
        emoji: '💳',
        description: 'How do credit cards work?',
        color: '#FF6B6B',
        category: 'money'
    },
    {
        id: 'car-engine',
        title: 'Car Engines',
        emoji: '🚗',
        description: 'What makes cars go vroom?',
        color: '#4ECDC4',
        category: 'machines'
    },
    {
        id: 'internet',
        title: 'The Internet',
        emoji: '🌐',
        description: 'How does the internet work?',
        color: '#45B7D1',
        category: 'technology'
    },
    {
        id: 'chatgpt',
        title: 'ChatGPT & AI',
        emoji: '🤖',
        description: 'What is artificial intelligence?',
        color: '#96CEB4',
        category: 'technology'
    },
    {
        id: 'electricity',
        title: 'Electricity',
        emoji: '⚡',
        description: 'What makes lights turn on?',
        color: '#FFEAA7',
        category: 'science'
    },
    {
        id: 'airplane',
        title: 'Airplanes',
        emoji: '✈️',
        description: 'How do airplanes fly?',
        color: '#DDA0DD',
        category: 'machines'
    },
    {
        id: 'money',
        title: 'Money',
        emoji: '💰',
        description: 'Why does money exist?',
        color: '#98D8C8',
        category: 'money'
    },
    {
        id: 'smartphone',
        title: 'Smartphones',
        emoji: '📱',
        description: 'How do phones work?',
        color: '#F7DC6F',
        category: 'technology'
    }
];

// GET /api/explain/concepts - Get all popular concepts
router.get('/concepts', (req, res) => {
    try {
        console.log('📚 Serving concepts list');
        res.json({
            success: true,
            concepts: popularConcepts,
            total: popularConcepts.length,
            categories: [...new Set(popularConcepts.map(c => c.category))]
        });
    } catch (error) {
        console.error('Error serving concepts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load concepts'
        });
    }
});

// POST /api/explain - Explain any custom topic
router.post('/', async (req, res) => {
    try {
        const { topic } = req.body;
        
        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Topic is required',
                message: 'Please provide a topic you want me to explain!'
            });
        }

        if (topic.trim().length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Topic too long',
                message: 'Please keep your question under 100 characters!'
            });
        }

        console.log(`🔍 Explaining topic: ${topic.trim()}`);
        
        const explanation = await geminiService.explainConcept(topic.trim());
        
        if (!explanation.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate explanation',
                message: 'Sorry, I couldn\'t explain that right now. Try again!',
                fallback: explanation.explanation // Include fallback explanation
            });
        }

        // Also generate visual prompt
        const visualPrompt = await geminiService.generateVisualPrompt(topic.trim());

        res.json({
            success: true,
            topic: topic.trim(),
            explanation: explanation.explanation,
            visualPrompt: visualPrompt.success ? visualPrompt.visualPrompt : null,
            wordCount: explanation.wordCount,
            timestamp: new Date().toISOString(),
            isCustom: true
        });

    } catch (error) {
        console.error('Custom explanation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Oops! Something went wrong. Please try again!'
        });
    }
});

// GET /api/explain/concept/:id - Get predefined concept explanation
router.get('/concept/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const concept = popularConcepts.find(c => c.id === id);
        if (!concept) {
            return res.status(404).json({
                success: false,
                error: 'Concept not found',
                message: 'Sorry, I couldn\'t find that concept!'
            });
        }

        console.log(`📖 Explaining predefined concept: ${concept.title}`);
        
        const explanation = await geminiService.explainConcept(concept.title);
        
        if (!explanation.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate explanation',
                message: 'Sorry, I couldn\'t explain that right now. Try again!',
                fallback: explanation.explanation
            });
        }

        // Generate visual prompt
        const visualPrompt = await geminiService.generateVisualPrompt(concept.title);

        res.json({
            success: true,
            concept: concept,
            explanation: explanation.explanation,
            visualPrompt: visualPrompt.success ? visualPrompt.visualPrompt : null,
            wordCount: explanation.wordCount,
            timestamp: new Date().toISOString(),
            isCustom: false
        });

    } catch (error) {
        console.error('Predefined concept explanation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Oops! Something went wrong. Please try again!'
        });
    }
});

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Explain routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
