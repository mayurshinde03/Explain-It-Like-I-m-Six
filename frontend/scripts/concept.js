// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const conceptIcon = document.getElementById('conceptIcon');
const conceptTitle = document.getElementById('conceptTitle');
const conceptSubtitle = document.getElementById('conceptSubtitle');
const visualPrompt = document.getElementById('visualPrompt');
const loadingExplanation = document.getElementById('loadingExplanation');
const explanationContent = document.getElementById('explanationContent');
const explanationText = document.getElementById('explanationText');
const wordCount = document.getElementById('wordCount');
const generationTime = document.getElementById('generationTime');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

// State
let currentExplanationData = null;
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('📖 Concept page loading...');
    loadExplanationFromStorage();
});

// Load explanation from session storage
function loadExplanationFromStorage() {
    try {
        const stored = sessionStorage.getItem('currentExplanation');
        if (stored) {
            currentExplanationData = JSON.parse(stored);
            displayExplanation(currentExplanationData);
        } else {
            // If no stored data, redirect to home
            console.log('No explanation data found, redirecting to home');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading explanation:', error);
        showError('Failed to load explanation');
    }
}

// Display the explanation
function displayExplanation(data) {
    try {
        // Update header
        if (data.concept) {
            // Predefined concept
            conceptIcon.textContent = data.concept.emoji;
            conceptTitle.textContent = data.concept.title;
            conceptSubtitle.textContent = data.concept.description;
            document.title = `${data.concept.title} - Explain Like I'm 6`;
        } else {
            // Custom topic
            conceptIcon.textContent = '🤔';
            conceptTitle.textContent = data.topic;
            conceptSubtitle.textContent = 'Let me explain this for you!';
            document.title = `${data.topic} - Explain Like I'm 6`;
        }

        // Update visual prompt
        if (data.visualPrompt) {
            visualPrompt.textContent = data.visualPrompt;
        } else {
            visualPrompt.textContent = 'Imagine a colorful cartoon that shows this concept in a fun, simple way!';
        }

        // Show explanation with animation
        setTimeout(() => {
            loadingExplanation.style.display = 'none';
            explanationContent.style.display = 'block';
            
            // Add explanation text with typewriter effect
            typewriterEffect(explanationText, data.explanation);
            
            // Update metadata
            if (data.wordCount) {
                wordCount.textContent = `📊 ${data.wordCount} words`;
            }
            
            if (data.timestamp) {
                const time = new Date(data.timestamp).toLocaleTimeString();
                generationTime.textContent = `⏰ Generated at ${time}`;
            }
        }, 1500);

    } catch (error) {
        console.error('Error displaying explanation:', error);
        showError('Failed to display explanation');
    }
}

// Typewriter effect for explanation text
function typewriterEffect(element, text, speed = 30) {
    element.textContent = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// Navigation functions
function goHome() {
    window.location.href = 'index.html';
}

// Action button functions
function askAnother() {
    window.location.href = 'index.html';
}

async function explainAgain() {
    if (isLoading || !currentExplanationData) return;

    const topic = currentExplanationData.concept ? 
                  currentExplanationData.concept.title : 
                  currentExplanationData.topic;

    try {
        isLoading = true;
        showLoading();

        const endpoint = currentExplanationData.concept ? 
                        `${API_BASE_URL}/explain/concept/${currentExplanationData.concept.id}` :
                        `${API_BASE_URL}/explain`;

        const options = {
            method: currentExplanationData.concept ? 'GET' : 'POST',
            headers: currentExplanationData.concept ? {} : {
                'Content-Type': 'application/json'
            },
            body: currentExplanationData.concept ? null : JSON.stringify({ topic })
        };

        const response = await fetch(endpoint, options);
        const data = await response.json();

        if (data.success) {
            currentExplanationData = data;
            sessionStorage.setItem('currentExplanation', JSON.stringify(data));
            
            // Reset display and show new explanation
            explanationContent.style.display = 'none';
            loadingExplanation.style.display = 'block';
            displayExplanation(data);
        } else {
            throw new Error(data.message || 'Failed to generate new explanation');
        }

    } catch (error) {
        console.error('Error getting new explanation:', error);
        showMessage(error.message || 'Failed to generate new explanation', 'error');
    } finally {
        isLoading = false;
    }
}

async function getRandomConcept() {
    if (isLoading) return;

    try {
        isLoading = true;
        showLoading();

        const response = await fetch(`${API_BASE_URL}/explain/random`);
        const data = await response.json();

        if (data.success) {
            currentExplanationData = data;
            sessionStorage.setItem('currentExplanation', JSON.stringify(data));
            
            // Reset display and show new explanation
            explanationContent.style.display = 'none';
            loadingExplanation.style.display = 'block';
            displayExplanation(data);
        } else {
            throw new Error(data.message || 'Failed to get random concept');
        }

    } catch (error) {
        console.error('Error getting random concept:', error);
        showMessage(error.message || 'Failed to get random concept', 'error');
    } finally {
        isLoading = false;
    }
}

function retryExplanation() {
    if (currentExplanationData) {
        errorState.style.display = 'none';
        displayExplanation(currentExplanationData);
    } else {
        goHome();
    }
}

// Utility functions
function showLoading() {
    loadingExplanation.style.display = 'block';
    explanationContent.style.display = 'none';
    errorState.style.display = 'none';
}

function showError(message) {
    loadingExplanation.style.display = 'none';
    explanationContent.style.display = 'none';
    errorState.style.display = 'block';
    errorMessage.textContent = message;
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#e53e3e' : type === 'warning' ? '#d69e2e' : '#38a169',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        fontSize: '1rem',
        fontFamily: 'Comic Neue, cursive',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '300px'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        goHome();
    } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        explainAgain();
    }
});

console.log('✅ Concept.js loaded successfully');
