const cors = require('cors');

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:5500',
            'http://localhost:5500',
            'https://explain-it-like-i-m-six.vercel.app',  // Your main Vercel URL
            'https://explain-it-like-i-m-six-git-main-mgshis-projects.vercel.app', // Git branch URL
            'https://explain-it-like-i-m-six.vercel.app/',  // With trailing slash
            'https://explain-it-like-i-m-six-mgshis-projects.vercel.app', // Alternative format
        ];
        
        // Allow requests with no origin (like mobile apps, Postman, or direct server calls)
        if (!origin) {
            console.log('✅ No origin header - allowing request');
            return callback(null, true);
        }

        // Check exact matches first
        if (allowedOrigins.includes(origin)) {
            console.log('✅ CORS allowed for origin:', origin);
            return callback(null, true);
        }

        // Check wildcard patterns for Vercel preview deployments
        const vercelPattern = /^https:\/\/explain-it-like-i-m-six.*\.vercel\.app$/;
        if (vercelPattern.test(origin)) {
            console.log('✅ CORS allowed for Vercel preview:', origin);
            return callback(null, true);
        }

        // Block other origins
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: false, // Changed to false for better compatibility
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    optionsSuccessStatus: 200 // For legacy browser support
};

module.exports = cors(corsOptions);
