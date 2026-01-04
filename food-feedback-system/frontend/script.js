// API Configuration
const API_URL = 'http://localhost:5000/api';

// Global state for 5-question feedback
let currentFeedbackMode = 'emoji';
let feedbackRatings = {
    overall: null,
    quality: null,
    hygiene: null,
    quantity: null,
    temperature: null
};
let feedbacksList = [];

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Load initial data
    loadImpactStats();
    loadRecentFeedbacks();
});

// Scroll to Feedback Section
function scrollToFeedback() {
    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Feedback Mode Switching
function setFeedbackMode(mode) {
    currentFeedbackMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        }
    });
    
    // Update content visibility
    document.querySelectorAll('.feedback-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${mode}Feedback`).classList.add('active');
}

// Select Emoji for Specific Question
function selectEmojiForQuestion(element, questionType) {
    // Remove selection from all emojis in this question's grid
    const grid = element.closest('.emoji-grid');
    grid.querySelectorAll('.emoji-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked emoji
    element.classList.add('selected');
    
    // Store the rating for this question
    feedbackRatings[questionType] = {
        rating: parseInt(element.getAttribute('data-rating')),
        emoji: element.getAttribute('data-emoji')
    };
    
    console.log('Updated ratings:', feedbackRatings);
}

// Submit Feedback
async function submitFeedback() {
    let feedbackData = {
        timestamp: new Date().toISOString(),
        type: currentFeedbackMode
    };
    
    if (currentFeedbackMode === 'emoji') {
        // Check if all 5 questions are answered
        const unanswered = [];
        if (!feedbackRatings.overall) unanswered.push('Overall Rating');
        if (!feedbackRatings.quality) unanswered.push('Quality');
        if (!feedbackRatings.hygiene) unanswered.push('Hygiene');
        if (!feedbackRatings.quantity) unanswered.push('Quantity');
        if (!feedbackRatings.temperature) unanswered.push('Temperature');
        
        if (unanswered.length > 0) {
            alert('⚠️ Please answer all questions:\n\n• ' + unanswered.join('\n• '));
            return;
        }
        
        // Add all ratings to feedback data
        feedbackData.overall_rating = feedbackRatings.overall.rating;
        feedbackData.overall_emoji = feedbackRatings.overall.emoji;
        feedbackData.quality_rating = feedbackRatings.quality.rating;
        feedbackData.quality_emoji = feedbackRatings.quality.emoji;
        feedbackData.hygiene_rating = feedbackRatings.hygiene.rating;
        feedbackData.hygiene_emoji = feedbackRatings.hygiene.emoji;
        feedbackData.quantity_rating = feedbackRatings.quantity.rating;
        feedbackData.quantity_emoji = feedbackRatings.quantity.emoji;
        feedbackData.temperature_rating = feedbackRatings.temperature.rating;
        feedbackData.temperature_emoji = feedbackRatings.temperature.emoji;
        
        // Calculate average rating
        feedbackData.average_rating = (
            feedbackRatings.overall.rating +
            feedbackRatings.quality.rating +
            feedbackRatings.hygiene.rating +
            feedbackRatings.quantity.rating +
            feedbackRatings.temperature.rating
        ) / 5;
        
    } else if (currentFeedbackMode === 'text') {
        const textInput = document.getElementById('feedbackText');
        if (!textInput.value.trim()) {
            alert('⚠️ Please write your feedback!');
            return;
        }
        feedbackData.message = textInput.value;
    } else if (currentFeedbackMode === 'voice') {
        alert('🎤 Voice recording feature coming soon!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        if (response.ok) {
            alert('✅ Thank you for your feedback! Your response has been saved.');
            
            // Reset form
            resetFeedbackForm();
            
            // Reload recent feedbacks
            loadRecentFeedbacks();
        } else {
            alert('❌ Failed to submit feedback. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        // For demo purposes, save locally
        saveFeedbackLocally(feedbackData);
        alert('✅ Thank you for your feedback!\n');
        resetFeedbackForm();
    }
}

// Reset Feedback Form
function resetFeedbackForm() {
    // Reset emoji selections
    document.querySelectorAll('.emoji-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset ratings object
    feedbackRatings = {
        overall: null,
        quality: null,
        hygiene: null,
        quantity: null,
        temperature: null
    };
    
    // Reset text feedback
    const textInput = document.getElementById('feedbackText');
    if (textInput) {
        textInput.value = '';
    }
}

// Save Feedback Locally (for demo without backend)
function saveFeedbackLocally(feedbackData) {
    let localFeedbacks = JSON.parse(localStorage.getItem('mealsetu_feedbacks') || '[]');
    localFeedbacks.unshift(feedbackData);
    // Keep only last 50
    if (localFeedbacks.length > 50) {
        localFeedbacks = localFeedbacks.slice(0, 50);
    }
    localStorage.setItem('mealsetu_feedbacks', JSON.stringify(localFeedbacks));
    feedbacksList = localFeedbacks;
    displayRecentFeedbacks();
}

// Load Recent Feedbacks
async function loadRecentFeedbacks() {
    try {
        const response = await fetch(`${API_URL}/feedbacks?limit=10`);
        if (response.ok) {
            feedbacksList = await response.json();
            displayRecentFeedbacks();
        }
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        // Load from local storage
        feedbacksList = JSON.parse(localStorage.getItem('mealsetu_feedbacks') || '[]');
        if (feedbacksList.length > 0) {
            displayRecentFeedbacks();
        }
    }
}

// Display Recent Feedbacks
function displayRecentFeedbacks() {
    const recentFeedbacksDiv = document.getElementById('recentFeedbacks');
    const feedbacksListDiv = document.getElementById('feedbacksList');
    
    if (!recentFeedbacksDiv || !feedbacksListDiv) return;
    
    if (feedbacksList.length === 0) {
        recentFeedbacksDiv.style.display = 'none';
        return;
    }
    
    recentFeedbacksDiv.style.display = 'block';
    feedbacksListDiv.innerHTML = '';
    
    feedbacksList.slice(0, 10).forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.style.cssText = 'padding: 1.5rem; background: var(--light-bg); border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid var(--primary-color);';
        
        if (feedback.type === 'emoji' && feedback.overall_rating) {
            feedbackItem.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <strong>Overall:</strong> ${feedback.overall_emoji} ${feedback.overall_rating}/5
                    </div>
                    <div>
                        <strong>Quality:</strong> ${feedback.quality_emoji} ${feedback.quality_rating}/5
                    </div>
                    <div>
                        <strong>Hygiene:</strong> ${feedback.hygiene_emoji} ${feedback.hygiene_rating}/5
                    </div>
                    <div>
                        <strong>Quantity:</strong> ${feedback.quantity_emoji} ${feedback.quantity_rating}/5
                    </div>
                    <div>
                        <strong>Temperature:</strong> ${feedback.temperature_emoji} ${feedback.temperature_rating}/5
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <strong>Average: ${feedback.average_rating ? feedback.average_rating.toFixed(1) : 'N/A'}/5</strong>
                    <span style="float: right; color: var(--text-secondary); font-size: 0.85rem;">
                        ${new Date(feedback.timestamp).toLocaleString()}
                    </span>
                </div>
            `;
        } else if (feedback.type === 'text') {
            feedbackItem.innerHTML = `
                <p style="color: var(--text-primary); margin-bottom: 1rem;">${feedback.message}</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${new Date(feedback.timestamp).toLocaleString()}
                </p>
            `;
        }
        
        feedbacksListDiv.appendChild(feedbackItem);
    });
}

// Load Impact Stats
async function loadImpactStats() {
    try {
        const response = await fetch(`${API_URL}/stats/impact`);
        if (response.ok) {
            const stats = await response.json();
            
            const elements = {
                foodSaved: document.getElementById('foodSaved'),
                servingsDonated: document.getElementById('servingsDonated'),
                qualityScore: document.getElementById('qualityScore'),
                wastageReduced: document.getElementById('wastageReduced')
            };
            
            if (elements.foodSaved) elements.foodSaved.textContent = stats.foodSaved;
            if (elements.servingsDonated) elements.servingsDonated.textContent = stats.servingsDonated;
            if (elements.qualityScore) elements.qualityScore.textContent = stats.qualityScore;
            if (elements.wastageReduced) elements.wastageReduced.textContent = stats.wastageReduced;
        }
    } catch (error) {
        console.error('Error loading impact stats:', error);
    }
}

// Initialize Charts (for Analytics Page)
function initializeEnhancedCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }
    
    // Load feedback data from localStorage or API
    const feedbacks = JSON.parse(localStorage.getItem('mealsetu_feedbacks') || '[]');
    
    // Calculate statistics for each parameter
    const stats = calculateFeedbackStats(feedbacks);
    
    // Chart colors
    const colors = {
        excellent: '#10b981',
        good: '#34d399',
        average: '#f59e0b',
        poor: '#f97316',
        veryPoor: '#ef4444'
    };

    // Create individual parameter charts
    createParameterChart('overallChart', 'Overall Rating', stats.overall, colors);
    createParameterChart('qualityChart', 'Quality Rating', stats.quality, colors);
    createParameterChart('hygieneChart', 'Hygiene Rating', stats.hygiene, colors);
    createParameterChart('quantityChart', 'Quantity Rating', stats.quantity, colors);
    createParameterChart('temperatureChart', 'Temperature Rating', stats.temperature, colors);
    
    // Comparative Radar Chart
    createComparativeChart(stats);
    
    // Weekly Trend Chart
    createWeeklyTrendChart(feedbacks);
}

function calculateFeedbackStats(feedbacks) {
    const stats = {
        overall: [0, 0, 0, 0, 0],
        quality: [0, 0, 0, 0, 0],
        hygiene: [0, 0, 0, 0, 0],
        quantity: [0, 0, 0, 0, 0],
        temperature: [0, 0, 0, 0, 0]
    };
    
    feedbacks.forEach(fb => {
        if (fb.type === 'emoji') {
            if (fb.overall_rating) stats.overall[5 - fb.overall_rating]++;
            if (fb.quality_rating) stats.quality[5 - fb.quality_rating]++;
            if (fb.hygiene_rating) stats.hygiene[5 - fb.hygiene_rating]++;
            if (fb.quantity_rating) stats.quantity[5 - fb.quantity_rating]++;
            if (fb.temperature_rating) stats.temperature[5 - fb.temperature_rating]++;
        }
    });
    
    return stats;
}

function createParameterChart(canvasId, label, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
            datasets: [{
                label: 'Number of Responses',
                data: data,
                backgroundColor: [colors.excellent, colors.good, colors.average, colors.poor, colors.veryPoor]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                } 
            }
        }
    });
}

function createComparativeChart(stats) {
    const ctx = document.getElementById('comparativeChart');
    if (!ctx) return;
    
    // Calculate averages
    const calculateAvg = (arr) => {
        let sum = 0, count = 0;
        arr.forEach((val, idx) => {
            sum += val * (5 - idx);
            count += val;
        });
        return count > 0 ? sum / count : 0;
    };
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Overall', 'Quality', 'Hygiene', 'Quantity', 'Temperature'],
            datasets: [{
                label: 'Average Scores',
                data: [
                    calculateAvg(stats.overall),
                    calculateAvg(stats.quality),
                    calculateAvg(stats.hygiene),
                    calculateAvg(stats.quantity),
                    calculateAvg(stats.temperature)
                ],
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#10b981',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function createWeeklyTrendChart(feedbacks) {
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Overall',
                    data: [4.2, 4.4, 4.1, 4.5, 4.3, 4.6, 4.2],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Quality',
                    data: [4.3, 4.5, 4.2, 4.6, 4.4, 4.7, 4.3],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Hygiene',
                    data: [4.6, 4.7, 4.5, 4.8, 4.6, 4.9, 4.5],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Quantity',
                    data: [4.5, 4.6, 4.4, 4.7, 4.5, 4.8, 4.4],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Temperature',
                    data: [4.0, 4.2, 3.9, 4.3, 4.1, 4.4, 4.0],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top' 
                }
            },
            scales: {
                y: {
                    beginAtZero: false, 
                    min: 3.5, 
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        }
    });
}

// Load Meal Reports
async function loadMealReports() {
    try {
        const response = await fetch(`${API_URL}/meals?limit=10`);
        if (response.ok) {
            const meals = await response.json();
            console.log('Loaded meals:', meals);
        }
    } catch (error) {
        console.error('Error loading meal reports:', error);
    }
}

// Load Donation Data
async function loadDonationData() {
    try {
        const statsResponse = await fetch(`${API_URL}/donations/stats`);
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('Donation stats:', stats);
        }
    } catch (error) {
        console.error('Error loading donation data:', error);
    }
}

// Claim Surplus
async function claimSurplus(surplusId) {
    const ngoName = prompt('Enter your NGO name:');
    if (!ngoName) return;
    
    alert(`Thank you ${ngoName}! Your donation request has been submitted.`);
}

// Contact NGO
function contactNGO(ngoName) {
    alert(`Contacting ${ngoName}...\n\nIn production, this would open contact details or initiate a call.`);
}