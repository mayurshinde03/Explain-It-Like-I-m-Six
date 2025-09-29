// Configuration
const API_BASE_URL = 'https://explain-it-like-i-m-six.onrender.com/api';


// DOM Elements
const conceptsGrid = document.getElementById('conceptsGrid');
const conceptsLoading = document.getElementById('conceptsLoading');
const customSearch = document.getElementById('customSearch');
const searchBtn = document.getElementById('searchBtn');
const loadingModal = document.getElementById('loadingModal');

// State
let concepts = [];
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Explain Like I\'m 6 - Loading...');
    loadConcepts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleCustomSearch);
    customSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCustomSearch();
        }
    });

    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const topic = e.target.dataset.topic;
            customSearch.value = topic;
            handleCustomSearch();
        });
    });

    // Prevent form submission on enter
    customSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

// Load popular concepts from API
async function loadConcepts() {
    try {
        console.log('📚 Loading concepts...');
        conceptsLoading.style.display = 'block';
        conceptsGrid.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/explain/concepts`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            concepts = data.concepts;
            renderConcepts(concepts);
            console.log(`✅ Loaded ${concepts.length} concepts`);
        } else {
            throw new Error(data.error || 'Failed to load concepts');
        }
    } catch (error) {
        console.error('❌ Error loading concepts:', error);
        showError('Failed to load concepts. Please check if the server is running.');
    } finally {
        conceptsLoading.style.display = 'none';
    }
}

// Render concepts grid
function renderConcepts(conceptsList) {
    if (!conceptsList || conceptsList.length === 0) {
        conceptsGrid.innerHTML = '<p style="text-align: center; color: white;">No concepts available</p>';
        return;
    }

    conceptsGrid.innerHTML = conceptsList.map(concept => `
        <div class="concept-card" 
             onclick="explainConcept('${concept.id}')" 
             style="--card-color: ${concept.color}"
             data-concept-id="${concept.id}">
            <div class="concept-emoji">${concept.emoji}</div>
            <h3 class="concept-title">${concept.title}</h3>
            <p class="concept-description">${concept.description}</p>
        </div>
    `).join('');

    conceptsGrid.style.display = 'grid';

    // Add hover effects
    document.querySelectorAll('.concept-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fadeInUp');
    });
}

// Handle custom search
async function handleCustomSearch() {
    const topic = customSearch.value.trim();
    
    if (!topic) {
        showMessage('Please enter something you want me to explain!', 'warning');
        customSearch.focus();
        return;
    }

    if (topic.length > 100) {
        showMessage('Please keep your question under 100 characters!', 'warning');
        return;
    }

    if (isLoading) {
        return;
    }

    try {
        isLoading = true;
        showLoadingModal();

        console.log(`🔍 Searching for: "${topic}"`);
        
        const response = await fetch(`${API_BASE_URL}/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic })
        });

        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.success) {
            // Store the explanation data for the concept page
            sessionStorage.setItem('currentExplanation', JSON.stringify(data));
            // Navigate to concept page
            window.location.href = 'concept.html';
        } else {
            throw new Error(data.message || data.error || 'Failed to get explanation');
        }

    } catch (error) {
        console.error('❌ Search error:', error);
        hideLoadingModal();
        showMessage(error.message || 'Failed to get explanation. Please try again!', 'error');
    } finally {
        isLoading = false;
    }
}

// Explain a predefined concept
async function explainConcept(conceptId) {
    if (isLoading) return;

    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) {
        showMessage('Concept not found!', 'error');
        return;
    }

    try {
        isLoading = true;
        showLoadingModal();

        console.log(`📖 Explaining concept: ${concept.title}`);

        const response = await fetch(`${API_BASE_URL}/explain/concept/${conceptId}`);
        const data = await response.json();
        
        hideLoadingModal();
        
        if (data.success) {
            // Store the explanation data
            sessionStorage.setItem('currentExplanation', JSON.stringify(data));
            // Navigate to concept page
            window.location.href = 'concept.html';
        } else {
            throw new Error(data.message || data.error || 'Failed to get explanation');
        }

    } catch (error) {
        console.error('❌ Concept explanation error:', error);
        hideLoadingModal();
        showMessage(error.message || 'Failed to explain that concept. Please try again!', 'error');
    } finally {
        isLoading = false;
    }
}

// Loading modal functions
function showLoadingModal() {
    loadingModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animate progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.animation = 'none';
        setTimeout(() => {
            progressFill.style.animation = 'progress 3s ease-in-out infinite';
        }, 10);
    }
}

function hideLoadingModal() {
    loadingModal.style.display = 'none';
    document.body.style.overflow = '';
}

// Utility functions
function showMessage(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
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
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function showError(message) {
    conceptsLoading.style.display = 'none';
    conceptsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: white;">
            <div style="font-size: 3rem; margin-bottom: 20px;">😅</div>
            <h3 style="font-family: 'Fredoka One', cursive; margin-bottom: 15px;">Oops!</h3>
            <p>${message}</p>
            <button onclick="loadConcepts()" style="
                background: rgba(255,255,255,0.2); 
                color: white; 
                border: 2px solid rgba(255,255,255,0.3); 
                padding: 10px 20px; 
                border-radius: 20px; 
                cursor: pointer; 
                margin-top: 20px;
                font-family: 'Comic Neue', cursive;
            ">Try Again</button>
        </div>
    `;
    conceptsGrid.style.display = 'grid';
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !isLoading && concepts.length === 0) {
        loadConcepts();
    }
});

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // You can implement a service worker for offline functionality
        console.log('🔧 Service Worker support available');
    });
}

console.log('✅ Main.js loaded successfully');
