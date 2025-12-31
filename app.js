// Main Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Budget Mobile App Loading...');
    
    // Check for required elements
    if (!document.getElementById('spendingChart')) {
        console.error('❌ Chart canvas not found!');
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Initialize managers
    const budgetManager = new BudgetManager();
    const transactionManager = new TransactionManager();
    const chartManager = new ChartManager();
    
    // Initialize chart first
    try {
        chartManager.initializeChart('spendingChart');
        console.log('📊 Chart initialized');
    } catch (error) {
        console.error('Error initializing chart:', error);
        showToast('Error initializing chart', 'error');
    }
    
    // Initialize UI manager
    const uiManager = new UIManager(budgetManager, transactionManager, chartManager);
    
    // Hide loading after initialization
    setTimeout(() => {
        hideLoading();
        uiManager.updateUI();
        console.log('✅ UI updated');
    }, 500);
    
    // Set default dates for filters
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const dailyDatePicker = document.getElementById('dailyDatePicker');
    
    if (filterDateFrom) filterDateFrom.value = startOfMonthStr;
    if (filterDateTo) filterDateTo.value = today;
    if (dailyDatePicker) dailyDatePicker.value = today;
    
    // Show welcome message if no budget exists
    if (!budgetManager.activeBudget && budgetManager.archive.length === 0) {
        setTimeout(() => {
            showToast('Welcome to Budget Tracker! Create your first budget to get started.', 'info');
        }, 2000);
    }
    
    // Check for expired budget
    setTimeout(() => {
        if (budgetManager.checkBudgetExpiry()) {
            showToast('Current budget has ended. Consider archiving it.', 'warning');
        }
    }, 3000);
    
    // Make managers globally available
    window.budgetManager = budgetManager;
    window.transactionManager = transactionManager;
    window.uiManager = uiManager;
    window.chartManager = chartManager;
    
    console.log('✅ Budget Mobile App Loaded Successfully!');
    
    // Auto-save every 30 seconds
    setInterval(() => {
        budgetManager.saveToStorage();
    }, 30000);
    
    // Check for new day every minute
    setInterval(() => {
        uiManager.checkForNewDay();
    }, 60000);
});

// Utility functions for UI
function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.display = 'block';
    
    // Set color based on type
    const colors = {
        'info': '#4361ee',
        'success': '#4cc9f0',
        'warning': '#f8961e',
        'error': '#f72585'
    };
    toast.style.background = colors[type] || colors.info;
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Add service worker for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}