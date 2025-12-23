// Main Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Budget System Loading...');
    
    // Check if all required elements exist
    if (!document.getElementById('spendingChart')) {
        console.error('❌ Chart canvas not found!');
        return;
    }
    
    // Initialize managers in correct order
    const budgetManager = new BudgetManager();
    const transactionManager = new TransactionManager();
    const chartManager = new ChartManager();
    
    // Initialize chart first
    try {
        chartManager.initializeChart('spendingChart');
        console.log('📊 Chart initialized');
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
    
    // Initialize UI manager
    const uiManager = new UIManager(budgetManager, transactionManager, chartManager);
    
    // Initial UI update with delay to ensure DOM is ready
    setTimeout(() => {
        uiManager.updateUI();
        console.log('✅ UI updated');
    }, 300);
    
    // Set today's date as default for filters
    const today = new Date().toISOString().split('T')[0];
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    
    if (filterDateFrom) filterDateFrom.value = today;
    if (filterDateTo) filterDateTo.value = today;
    
    // Show welcome message if no budget exists
    if (!budgetManager.activeBudget && budgetManager.archive.length === 0) {
        setTimeout(() => {
            alert('Welcome to Simple Budget System! 🎉\n\nTo get started:\n1. Click "New Budget" to create your first budget\n2. Add expenses as you spend\n3. Add money when you receive extra funds\n4. Track your spending and savings!\n\n💡 Tip: You can create a new budget anytime. The current budget will be archived automatically.');
        }, 1500);
    }
    
    // Make managers globally available for debugging
    window.budgetManager = budgetManager;
    window.transactionManager = transactionManager;
    window.uiManager = uiManager;
    window.chartManager = chartManager;
    
    console.log('✅ Budget System Loaded Successfully!');
    
    // Auto-save every minute
    setInterval(() => {
        budgetManager.saveToStorage();
    }, 60000);
});