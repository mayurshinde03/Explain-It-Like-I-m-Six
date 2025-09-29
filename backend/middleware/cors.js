const cors = require('cors');

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:5500',
            'http://localhost:5500',
            'https://explain-it-like-i-m-six.vercel.app',  // ⭐ Your Vercel URL
            'https://explain-it-like-i-m-six-git-main-mgshis-projects.vercel.app', // Git branch URL
            'https://explain-it-like-i-m-six-*.vercel.app' // Wildcard for preview deployments
        ];
        
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin || allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                const pattern = allowedOrigin.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowedOrigin === origin;
        })) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = cors(corsOptions);
