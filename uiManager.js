class UIManager {
    constructor(budgetManager, transactionManager, chartManager) {
        this.budgetManager = budgetManager;
        this.transactionManager = transactionManager;
        this.chartManager = chartManager;
        this.currentScreen = 'dashboard';
        this.currentReport = null;
        this.selectedCategory = null;
        
        // Initialize after DOM is ready
        setTimeout(() => {
            this.initializeEventListeners();
            this.setupDatePickers();
            this.checkForNewDay();
            this.updateUI();
            this.setupSwipeGestures();
        }, 100);
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Menu Toggle
        const menuBtn = document.getElementById('menuBtn');
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        const sideMenu = document.getElementById('sideMenu');
        
        if (menuBtn) menuBtn.addEventListener('click', () => this.toggleMenu());
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => this.toggleMenu());
        
        // Menu items
        document.querySelectorAll('.menu-item[data-screen]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
                this.toggleMenu();
            });
        });
        
        // New Budget from Menu
        const newBudgetMenuBtn = document.getElementById('newBudgetMenuBtn');
        if (newBudgetMenuBtn) {
            newBudgetMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNewBudgetModal();
                this.toggleMenu();
            });
        }
        
        // Import from Menu
        const importMenuBtn = document.getElementById('importMenuBtn');
        if (importMenuBtn) {
            importMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showImportModal();
                this.toggleMenu();
            });
        }
        
        // Bottom Navigation
        document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
            });
        });
        
        // Quick Add Button (FAB)
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                if (!this.budgetManager.activeBudget) {
                    showToast('Please create a budget first!', 'warning');
                    return;
                }
                this.showAddExpenseModal();
            });
        }
        
        // Add Expense Buttons
        const addExpenseQuickBtn = document.getElementById('addExpenseQuickBtn');
        if (addExpenseQuickBtn) {
            addExpenseQuickBtn.addEventListener('click', () => {
                if (!this.budgetManager.activeBudget) {
                    showToast('Please create a budget first!', 'warning');
                    return;
                }
                this.showAddExpenseModal();
            });
        }
        
        // Add Money Buttons
        const addMoneyQuickBtn = document.getElementById('addMoneyQuickBtn');
        const addMoneyBtn = document.getElementById('addMoneyBtn');
        
        if (addMoneyQuickBtn) {
            addMoneyQuickBtn.addEventListener('click', () => {
                if (!this.budgetManager.activeBudget) {
                    showToast('Please create a budget first!', 'warning');
                    return;
                }
                this.showAddMoneyModal();
            });
        }
        
        if (addMoneyBtn) {
            addMoneyBtn.addEventListener('click', () => {
                if (!this.budgetManager.activeBudget) {
                    showToast('Please create a budget first!', 'warning');
                    return;
                }
                this.showAddMoneyModal();
            });
        }
        
        // Export Button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }
        
        // View All Transactions
        const viewAllBtn = document.getElementById('viewAllBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.switchScreen('transactions');
            });
        }
        
        // Back Buttons
        document.getElementById('backToDashboard')?.addEventListener('click', () => this.switchScreen('dashboard'));
        document.getElementById('backToDashboard2')?.addEventListener('click', () => this.switchScreen('dashboard'));
        document.getElementById('backToDashboard3')?.addEventListener('click', () => this.switchScreen('dashboard'));
        
        // Filter Toggle
        const filterToggleBtn = document.getElementById('filterToggleBtn');
        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', () => {
                this.toggleFilters();
            });
        }
        
        // Apply Filters
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.loadAllTransactions();
            });
        }
        
        // Clear Filters
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }
        
        // Daily Date Picker
        const dailyDatePicker = document.getElementById('dailyDatePicker');
        if (dailyDatePicker) {
            dailyDatePicker.addEventListener('change', (e) => {
                this.showDailySummary(e.target.value);
            });
        }
        
        // Report Options
        document.querySelectorAll('.report-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.currentTarget.dataset.report;
                this.generateReport(reportType);
            });
        });
        
        // Modal Close Buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });
        
        // Modal Overlay Click
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'modalOverlay') {
                    this.hideAllModals();
                }
            });
        }
        
        // Create Budget Button
        const createBudgetBtn = document.getElementById('createBudgetBtn');
        if (createBudgetBtn) {
            createBudgetBtn.addEventListener('click', () => {
                this.createNewBudget();
            });
        }
        
        // Save Expense Button
        const saveExpenseBtn = document.getElementById('saveExpenseBtn');
        if (saveExpenseBtn) {
            saveExpenseBtn.addEventListener('click', () => {
                this.addExpense();
            });
        }
        
        // Save Money Button
        const saveMoneyBtn = document.getElementById('saveMoneyBtn');
        if (saveMoneyBtn) {
            saveMoneyBtn.addEventListener('click', () => {
                this.addMoney();
            });
        }
        
        // Update Transaction Button
        const updateTransactionBtn = document.getElementById('updateTransactionBtn');
        if (updateTransactionBtn) {
            updateTransactionBtn.addEventListener('click', () => {
                this.updateTransaction();
            });
        }
        
        // Delete Transaction Button
        const deleteTransactionBtn = document.getElementById('deleteTransactionBtn');
        if (deleteTransactionBtn) {
            deleteTransactionBtn.addEventListener('click', () => {
                this.deleteTransaction();
            });
        }
        
        // Category Buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.selectCategory(category);
            });
        });
        
        // LRT Discount Checkbox
        const applyDiscount = document.getElementById('applyDiscount');
        if (applyDiscount) {
            applyDiscount.addEventListener('change', (e) => {
                this.toggleDiscountInfo(e.target.checked);
                this.calculateDiscount();
            });
        }
        
        // Edit LRT Discount Checkbox
        const editApplyDiscount = document.getElementById('editApplyDiscount');
        if (editApplyDiscount) {
            editApplyDiscount.addEventListener('change', (e) => {
                this.toggleEditDiscountInfo(e.target.checked);
                this.calculateEditDiscount();
            });
        }
        
        // Expense Amount Input for Discount
        const expenseAmount = document.getElementById('expenseAmount');
        if (expenseAmount) {
            expenseAmount.addEventListener('input', () => {
                this.calculateDiscount();
            });
        }
        
        // Edit Expense Amount Input
        const editExpenseAmount = document.getElementById('editExpenseAmount');
        if (editExpenseAmount) {
            editExpenseAmount.addEventListener('input', () => {
                this.calculateEditDiscount();
            });
        }
        
        // Export Options
        document.getElementById('copyDataBtn')?.addEventListener('click', () => this.copyDataToClipboard());
        document.getElementById('downloadJsonBtn')?.addEventListener('click', () => this.downloadDataAsFile());
        document.getElementById('printReportBtn')?.addEventListener('click', () => this.printReport());
        
        // Import Button
        const confirmImportBtn = document.getElementById('confirmImportBtn');
        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', () => {
                this.importData();
            });
        }
        
        // Import File Input
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
        }
        
        // Archive Confirmation
        const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
        if (confirmArchiveBtn) {
            confirmArchiveBtn.addEventListener('click', () => {
                this.confirmArchiveAndCreateNew();
            });
        }
        
        // Refresh Chart
        const refreshChart = document.getElementById('refreshChart');
        if (refreshChart) {
            refreshChart.addEventListener('click', () => {
                this.updateUI();
                showToast('Chart refreshed', 'success');
            });
        }
        
        // Transaction Click (delegated)
        document.addEventListener('click', (e) => {
            // Edit transaction
            if (e.target.closest('.edit-btn')) {
                const btn = e.target.closest('.edit-btn');
                if (btn && btn.dataset.id) {
                    const transactionId = parseInt(btn.dataset.id);
                    this.editTransaction(transactionId);
                }
            }
            
            // Transaction item click
            if (e.target.closest('.transaction-item')) {
                const item = e.target.closest('.transaction-item');
                if (item && item.dataset.id && !e.target.closest('.edit-btn')) {
                    const transactionId = parseInt(item.dataset.id);
                    this.viewTransactionDetails(transactionId);
                }
            }
            
            // Archive item click
            if (e.target.closest('.archive-item')) {
                const item = e.target.closest('.archive-item');
                if (item && item.dataset.id) {
                    const budgetId = parseInt(item.dataset.id);
                    this.viewArchiveBudget(budgetId);
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                this.hideAllModals();
                this.toggleMenu(false);
            }
            
            // Ctrl+N for new budget
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showNewBudgetModal();
            }
        });
        
        console.log('Event listeners initialized successfully');
    }

    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left
                this.nextScreen();
            } else {
                // Swipe right
                this.previousScreen();
            }
        }
    }

    nextScreen() {
        const screens = ['dashboard', 'transactions', 'reports', 'archive'];
        const currentIndex = screens.indexOf(this.currentScreen);
        if (currentIndex < screens.length - 1) {
            this.switchScreen(screens[currentIndex + 1]);
        }
    }

    previousScreen() {
        const screens = ['dashboard', 'transactions', 'reports', 'archive'];
        const currentIndex = screens.indexOf(this.currentScreen);
        if (currentIndex > 0) {
            this.switchScreen(screens[currentIndex - 1]);
        }
    }

    setupDatePickers() {
        const today = new Date().toISOString().split('T')[0];
        
        // Set default dates for new budget
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) startDate.value = today;
        if (endDate) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            endDate.value = nextMonth.toISOString().split('T')[0];
        }
        
        // Set default for expense and money dates
        const expenseDate = document.getElementById('expenseDate');
        const moneyDate = document.getElementById('moneyDate');
        const editExpenseDate = document.getElementById('editExpenseDate');
        
        if (expenseDate) expenseDate.value = today;
        if (moneyDate) moneyDate.value = today;
        if (editExpenseDate) editExpenseDate.value = today;
        
        // Set daily date picker to today
        const dailyDatePicker = document.getElementById('dailyDatePicker');
        if (dailyDatePicker) {
            dailyDatePicker.value = today;
            this.showDailySummary(today);
        }
    }

    checkForNewDay() {
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = localStorage.getItem('lastDailyCheck') || today;
        
        if (lastCheck !== today) {
            localStorage.setItem('lastDailyCheck', today);
            
            // Update daily date picker
            const dailyDatePicker = document.getElementById('dailyDatePicker');
            if (dailyDatePicker) {
                dailyDatePicker.value = today;
                this.showDailySummary(today);
            }
            
            // Check for budget expiry
            if (this.budgetManager.checkBudgetExpiry()) {
                showToast('Your current budget has ended. Consider archiving it.', 'warning');
            }
        }
    }

    toggleMenu(show = null) {
        const sideMenu = document.getElementById('sideMenu');
        if (!sideMenu) return;
        
        if (show === null) {
            show = !sideMenu.classList.contains('active');
        }
        
        if (show) {
            sideMenu.classList.add('active');
            this.updateMenuInfo();
        } else {
            sideMenu.classList.remove('active');
        }
    }

    updateMenuInfo() {
        if (this.budgetManager.activeBudget) {
            const menuBudgetName = document.getElementById('menuBudgetName');
            const menuBudgetDates = document.getElementById('menuBudgetDates');
            
            if (menuBudgetName) {
                menuBudgetName.textContent = this.budgetManager.activeBudget.name;
            }
            
            if (menuBudgetDates) {
                const start = this.transactionManager.formatDate(this.budgetManager.activeBudget.startDate);
                const end = this.transactionManager.formatDate(this.budgetManager.activeBudget.endDate);
                menuBudgetDates.textContent = `${start} - ${end}`;
            }
        }
    }

    showModal(modalId) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById(modalId);
        
        if (modalOverlay && modal) {
            modalOverlay.style.display = 'flex';
            modal.style.display = 'block';
            
            // Close menu if open
            this.toggleMenu(false);
        }
    }

    hideAllModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset forms
        this.resetForms();
    }

    resetForms() {
        // Reset expense form
        const expenseAmount = document.getElementById('expenseAmount');
        const expenseDescription = document.getElementById('expenseDescription');
        const applyDiscount = document.getElementById('applyDiscount');
        
        if (expenseAmount) expenseAmount.value = '';
        if (expenseDescription) expenseDescription.value = '';
        if (applyDiscount) applyDiscount.checked = false;
        
        this.toggleDiscountInfo(false);
        this.toggleLRTDiscount(false);
        
        // Reset category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset edit form
        this.resetEditForm();
    }

    resetEditForm() {
        const editTransactionId = document.getElementById('editTransactionId');
        const editExpenseAmount = document.getElementById('editExpenseAmount');
        const editExpenseDescription = document.getElementById('editExpenseDescription');
        const editApplyDiscount = document.getElementById('editApplyDiscount');
        
        if (editTransactionId) editTransactionId.value = '';
        if (editExpenseAmount) editExpenseAmount.value = '';
        if (editExpenseDescription) editExpenseDescription.value = '';
        if (editApplyDiscount) editApplyDiscount.checked = false;
        
        this.toggleEditDiscountInfo(false);
        this.toggleEditLRTDiscount(false);
        
        // Reset category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    selectCategory(category) {
        // Update UI
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.selectedCategory = category;
        
        // Show/hide LRT discount
        this.toggleLRTDiscount(category === 'lrt');
        if (category === 'lrt') {
            this.calculateDiscount();
        } else {
            this.toggleDiscountInfo(false);
        }
    }

    toggleLRTDiscount(show) {
        const discountGroup = document.getElementById('lrtDiscountGroup');
        if (discountGroup) {
            discountGroup.style.display = show ? 'block' : 'none';
        }
    }

    toggleEditLRTDiscount(show) {
        const discountGroup = document.getElementById('editLrtDiscountGroup');
        if (discountGroup) {
            discountGroup.style.display = show ? 'block' : 'none';
        }
    }

    toggleDiscountInfo(show) {
        const discountInfo = document.getElementById('discountInfo');
        if (discountInfo) {
            discountInfo.style.display = show ? 'block' : 'none';
        }
    }

    toggleEditDiscountInfo(show) {
        const discountInfo = document.getElementById('editDiscountInfo');
        if (discountInfo) {
            discountInfo.style.display = show ? 'block' : 'none';
        }
    }

    calculateDiscount() {
        const expenseAmount = document.getElementById('expenseAmount');
        const discountedAmount = document.getElementById('discountedAmount');
        const savedAmount = document.getElementById('savedAmount');
        
        if (expenseAmount && discountedAmount && savedAmount) {
            const amount = parseFloat(expenseAmount.value) || 0;
            const discounted = amount * 0.5;
            const saved = amount * 0.5;
            
            discountedAmount.textContent = discounted.toFixed(2);
            savedAmount.textContent = saved.toFixed(2);
        }
    }

    calculateEditDiscount() {
        const editExpenseAmount = document.getElementById('editExpenseAmount');
        const editDiscountedAmount = document.getElementById('editDiscountedAmount');
        const editSavedAmount = document.getElementById('editSavedAmount');
        
        if (editExpenseAmount && editDiscountedAmount && editSavedAmount) {
            const amount = parseFloat(editExpenseAmount.value) || 0;
            const discounted = amount * 0.5;
            const saved = amount * 0.5;
            
            editDiscountedAmount.textContent = discounted.toFixed(2);
            editSavedAmount.textContent = saved.toFixed(2);
        }
    }

    toggleFilters() {
        const filtersPanel = document.getElementById('filtersPanel');
        if (filtersPanel) {
            filtersPanel.classList.toggle('active');
        }
    }

    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        
        this.loadAllTransactions();
        showToast('Filters cleared', 'success');
    }

    switchScreen(screen) {
        // Update current screen
        this.currentScreen = screen;
        
        // Update menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screen);
        });
        
        // Update bottom nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
        });
        
        // Show/hide screens
        document.querySelectorAll('.screen').forEach(screenEl => {
            screenEl.classList.toggle('active', screenEl.id === `${screen}Screen`);
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update content for specific screens
        switch(screen) {
            case 'dashboard':
                this.updateUI();
                break;
            case 'transactions':
                this.loadAllTransactions();
                break;
            case 'reports':
                this.showReportsScreen();
                break;
            case 'archive':
                this.loadArchive();
                break;
        }
        
        // Close filters if open
        const filtersPanel = document.getElementById('filtersPanel');
        if (filtersPanel) {
            filtersPanel.classList.remove('active');
        }
    }

    showNewBudgetModal() {
        if (this.budgetManager.activeBudget) {
            this.showArchiveConfirmation();
        } else {
            this.showModal('newBudgetModal');
            this.setupDatePickers();
        }
    }

    showArchiveConfirmation() {
        const budgetInfo = this.budgetManager.getCurrentBudgetInfo();
        if (!budgetInfo) return;
        
        // Update modal with current budget info
        document.getElementById('archiveBudgetName').textContent = budgetInfo.name;
        document.getElementById('archiveTotal').textContent = this.transactionManager.formatCurrency(budgetInfo.totalBudget);
        document.getElementById('archiveSpent').textContent = this.transactionManager.formatCurrency(budgetInfo.totalSpent);
        document.getElementById('archiveRemaining').textContent = this.transactionManager.formatCurrency(budgetInfo.remaining);
        document.getElementById('archiveTransactions').textContent = budgetInfo.totalTransactions;
        
        this.showModal('archiveConfirmModal');
    }

    confirmArchiveAndCreateNew() {
        this.budgetManager.archiveCurrentBudget();
        this.hideAllModals();
        
        // Show new budget modal after a short delay
        setTimeout(() => {
            this.showModal('newBudgetModal');
            this.setupDatePickers();
            showToast('Previous budget archived successfully', 'success');
        }, 300);
    }

    createNewBudget() {
        const name = document.getElementById('budgetTitle')?.value.trim();
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        const amount = document.getElementById('budgetAmount')?.value;

        if (!name || !startDate || !endDate || !amount) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        if (parseFloat(amount) <= 0) {
            showToast('Please enter a valid budget amount', 'warning');
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            showToast('End date must be after start date', 'warning');
            return;
        }

        this.budgetManager.createBudget(name, startDate, endDate, amount);
        this.hideAllModals();
        this.updateUI();
        
        showToast(`Budget "${name}" created successfully!`, 'success');
    }

    showAddExpenseModal() {
        this.showModal('addExpenseModal');
        
        // Set default date
        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) {
            expenseDate.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset form
        this.resetForms();
    }

    addExpense() {
        const amount = document.getElementById('expenseAmount')?.value;
        const description = document.getElementById('expenseDescription')?.value.trim();
        const date = document.getElementById('expenseDate')?.value;
        const applyDiscount = document.getElementById('applyDiscount')?.checked;
        
        const category = this.selectedCategory;
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount', 'warning');
            return;
        }
        
        if (!category) {
            showToast('Please select a category', 'warning');
            return;
        }
        
        if (!date) {
            showToast('Please select a date', 'warning');
            return;
        }

        const transaction = this.budgetManager.addExpense(amount, category, description, date, applyDiscount);
        if (transaction) {
            this.hideAllModals();
            this.updateUI();
            
            // Update daily summary if date is today
            const today = new Date().toISOString().split('T')[0];
            if (date === today) {
                this.showDailySummary(today);
            }
            
            showToast('Expense added successfully', 'success');
        }
    }

    showAddMoneyModal() {
        this.showModal('addMoneyModal');
        
        // Set default date
        const moneyDate = document.getElementById('moneyDate');
        if (moneyDate) {
            moneyDate.value = new Date().toISOString().split('T')[0];
        }
    }

    addMoney() {
        const amount = document.getElementById('moneyAmount')?.value;
        const source = document.getElementById('moneySource')?.value.trim();
        const date = document.getElementById('moneyDate')?.value;

        if (!amount || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount', 'warning');
            return;
        }

        const transaction = this.budgetManager.addMoney(amount, source);
        if (transaction) {
            this.hideAllModals();
            this.updateUI();
            showToast(`Successfully added ${this.transactionManager.formatCurrency(amount)} to your budget!`, 'success');
        }
    }

    editTransaction(transactionId) {
        if (!this.budgetManager.activeBudget) return;
        
        const transaction = this.budgetManager.activeBudget.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        // Fill edit form
        document.getElementById('editTransactionId').value = transactionId;
        document.getElementById('editExpenseAmount').value = transaction.fullAmount || transaction.amount;
        document.getElementById('editExpenseDescription').value = transaction.description || '';
        document.getElementById('editExpenseDate').value = transaction.date;
        
        // Select category
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === transaction.category);
        });
        this.selectedCategory = transaction.category;
        
        // Handle LRT discount
        if (transaction.category === 'lrt') {
            this.toggleEditLRTDiscount(true);
            document.getElementById('editApplyDiscount').checked = transaction.applyDiscount || false;
            this.toggleEditDiscountInfo(transaction.applyDiscount || false);
            if (transaction.applyDiscount) {
                this.calculateEditDiscount();
            }
        } else {
            this.toggleEditLRTDiscount(false);
            this.toggleEditDiscountInfo(false);
        }
        
        this.showModal('editTransactionModal');
    }

    updateTransaction() {
        const transactionId = parseInt(document.getElementById('editTransactionId')?.value || '0');
        const amount = document.getElementById('editExpenseAmount')?.value;
        const description = document.getElementById('editExpenseDescription')?.value.trim();
        const date = document.getElementById('editExpenseDate')?.value;
        const applyDiscount = document.getElementById('editApplyDiscount')?.checked;
        
        const category = this.selectedCategory;
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount', 'warning');
            return;
        }
        
        if (!category) {
            showToast('Please select a category', 'warning');
            return;
        }
        
        if (!date) {
            showToast('Please select a date', 'warning');
            return;
        }

        const updates = {
            amount,
            category,
            description,
            date,
            applyDiscount
        };

        const transaction = this.budgetManager.updateExpense(transactionId, updates);
        if (transaction) {
            this.hideAllModals();
            this.updateUI();
            showToast('Transaction updated successfully', 'success');
        }
    }

    deleteTransaction() {
        const transactionId = parseInt(document.getElementById('editTransactionId')?.value || '0');
        
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            if (this.budgetManager.deleteTransaction(transactionId)) {
                this.hideAllModals();
                this.updateUI();
                showToast('Transaction deleted successfully', 'success');
            }
        }
    }

    viewTransactionDetails(transactionId) {
        // For now, just edit the transaction
        this.editTransaction(transactionId);
    }

    showDailySummary(date) {
        const dailyContent = document.getElementById('dailyContent');
        if (!dailyContent) return;
        
        const dailyData = this.budgetManager.getDailySpending(date);
        const summaryHTML = this.transactionManager.createDailySummary(dailyData);
        
        dailyContent.innerHTML = summaryHTML;
    }

    loadAllTransactions() {
        const container = document.getElementById('allTransactions');
        if (!container) return;
        
        // Get filter values
        const category = document.getElementById('filterCategory')?.value || '';
        const type = document.getElementById('filterType')?.value || '';
        const dateFrom = document.getElementById('filterDateFrom')?.value || '';
        const dateTo = document.getElementById('filterDateTo')?.value || '';
        
        const filters = {};
        if (category) filters.category = category;
        if (type) filters.type = type;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        
        const transactions = this.budgetManager.getAllTransactions(filters);
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No transactions found</p></div>';
            return;
        }
        
        let html = '';
        transactions.forEach(transaction => {
            html += this.transactionManager.createTransactionElement(transaction, true);
        });
        
        container.innerHTML = html;
    }

    showReportsScreen() {
        const reportContent = document.getElementById('reportContent');
        if (reportContent) {
            reportContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <p>Select a report to generate</p>
                    <p class="small-text">Tap any report option above</p>
                </div>
            `;
        }
    }

    generateReport(reportType) {
        if (!this.budgetManager.activeBudget) {
            showToast('Please create a budget first!', 'warning');
            return;
        }
        
        const reportData = this.budgetManager.getSpendingReport();
        if (!reportData) {
            showToast('No data available for report', 'warning');
            return;
        }
        
        this.currentReport = { reportData, reportType };
        
        // Show in modal for better viewing
        const reportViewContent = document.getElementById('reportViewContent');
        const reportTitle = document.getElementById('reportTitle');
        
        if (reportViewContent && reportTitle) {
            const reportHTML = this.transactionManager.createReportHTML(reportData, reportType);
            reportViewContent.innerHTML = reportHTML;
            
            const titles = {
                'spending': 'Spending Report',
                'category': 'Category Report',
                'savings': 'Savings Report',
                'full': 'Complete Budget Report'
            };
            reportTitle.textContent = titles[reportType] || 'Report';
            
            this.showModal('reportViewModal');
        }
    }

    printReport() {
        if (!this.currentReport) {
            showToast('No report generated yet', 'warning');
            return;
        }
        
        const reportHTML = this.transactionManager.createReportHTML(
            this.currentReport.reportData, 
            this.currentReport.reportType
        );
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Budget Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .print-summary { margin-bottom: 30px; }
                        .print-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
                        .print-stat { background: #f5f5f5; padding: 15px; border-radius: 8px; }
                        .print-stat h4 { margin: 0 0 5px 0; color: #666; font-size: 14px; }
                        .print-stat p { margin: 0; font-size: 18px; font-weight: bold; color: #333; }
                        .print-section { margin-bottom: 30px; }
                        .print-categories { margin-top: 15px; }
                        .print-category { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .negative { color: #f72585; }
                        .positive { color: #4cc9f0; }
                        .highlight { background: #e3f2fd !important; border: 2px solid #4cc9f0; }
                        .print-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${reportHTML}
                    <div class="no-print" style="margin-top: 40px; text-align: center;">
                        <button onclick="window.print()" style="padding: 12px 24px; background: #4361ee; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                            Print Report
                        </button>
                        <p style="margin-top: 20px; color: #666; font-size: 14px;">
                            Generated by Budget Tracker Mobile App
                        </p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    }

    loadArchive() {
        const archiveList = document.getElementById('archiveList');
        const archiveStats = document.getElementById('archiveStats');
        
        if (!archiveList || !archiveStats) return;
        
        const archive = this.budgetManager.archive;
        const stats = this.budgetManager.getArchiveStats();
        
        // Update stats
        archiveStats.innerHTML = `
            <h3>Archive Summary</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">Total Budgets</span>
                        <span class="stat-value">${stats.totalBudgets}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-piggy-bank"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">Total Saved</span>
                        <span class="stat-value">${this.transactionManager.formatCurrency(stats.totalSaved)}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">Completed</span>
                        <span class="stat-value">${stats.completed}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">Incomplete</span>
                        <span class="stat-value">${stats.incomplete}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Update archive list
        if (archive.length === 0) {
            archiveList.innerHTML = '<div class="empty-state"><p>No archived budgets yet</p></div>';
            return;
        }
        
        let html = '';
        archive.forEach(budget => {
            html += this.transactionManager.createArchiveItem(budget);
        });
        
        archiveList.innerHTML = html;
    }

    viewArchiveBudget(budgetId) {
        const budget = this.budgetManager.archive.find(b => b.id === budgetId);
        if (!budget) return;
        
        // Create report data
        const reportData = {
            budgetName: budget.name,
            period: `${budget.startDate} to ${budget.endDate || 'Present'}`,
            summary: {
                totalBudget: budget.totalBudget,
                totalSpent: budget.totalSpent || 0,
                remaining: budget.savings || 0,
                addedMoney: budget.addedMoney || 0
            },
            categories: Object.entries(budget.categories || {})
                .filter(([name]) => name !== 'added_money')
                .map(([name, data]) => ({
                    name,
                    spent: data.spent || 0,
                    percentage: (budget.totalSpent || 0) > 0 ? 
                        ((data.spent || 0) / (budget.totalSpent || 0) * 100) : 0
                }))
                .filter(cat => cat.spent > 0),
            transactions: budget.transactions || []
        };
        
        this.currentReport = { reportData, reportType: 'full' };
        
        // Show in modal
        const reportViewContent = document.getElementById('reportViewContent');
        const reportTitle = document.getElementById('reportTitle');
        
        if (reportViewContent && reportTitle) {
            const reportHTML = this.transactionManager.createReportHTML(reportData, 'full');
            reportViewContent.innerHTML = reportHTML;
            reportTitle.textContent = `Archive: ${budget.name}`;
            this.showModal('reportViewModal');
        }
    }

    showExportModal() {
        this.showModal('exportModal');
    }

    showImportModal() {
        this.showModal('importModal');
    }

    copyDataToClipboard() {
        const exportData = this.budgetManager.exportData();
        
        navigator.clipboard.writeText(exportData).then(() => {
            showToast('Data copied to clipboard!', 'success');
            this.hideAllModals();
        }).catch(err => {
            showToast('Failed to copy data', 'error');
        });
    }

    downloadDataAsFile() {
        const exportData = this.budgetManager.exportData();
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `budget-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data downloaded as file!', 'success');
        this.hideAllModals();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('importDataText').value = e.target.result;
        };
        reader.readAsText(file);
    }

    importData() {
        const importDataText = document.getElementById('importDataText');
        const fileInput = document.getElementById('importFile');
        
        let data = importDataText?.value;
        
        if (!data && fileInput?.files[0]) {
            // Read from file
            const reader = new FileReader();
            reader.onload = (e) => {
                this.processImport(e.target.result);
            };
            reader.readAsText(fileInput.files[0]);
            return;
        }
        
        if (!data?.trim()) {
            showToast('Please paste data or select a file', 'warning');
            return;
        }
        
        this.processImport(data);
    }

    processImport(data) {
        if (!confirm('⚠️ This will replace ALL current data. Are you sure?')) {
            return;
        }
        
        showLoading();
        
        try {
            const success = this.budgetManager.importData(data);
            if (success) {
                this.hideAllModals();
                this.updateUI();
                showToast('Data imported successfully!', 'success');
            }
        } catch (error) {
            showToast(`Error importing data: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    updateUI() {
        console.log('Updating UI...');
        
        if (this.budgetManager.activeBudget) {
            const budget = this.budgetManager.activeBudget;
            const summary = this.budgetManager.getBudgetSummary();
            const categories = this.budgetManager.getCategoryBreakdown();
            const biggestExpense = this.budgetManager.getBiggestExpense();
            const recentTransactions = this.budgetManager.getRecentTransactions(3);
            const lrtSavings = budget.categories.lrt?.saved || 0;
            
            // Update budget summary
            document.getElementById('currentBudgetName').textContent = budget.name;
            document.getElementById('currentBudgetDates').textContent = 
                `${this.transactionManager.formatDate(budget.startDate)} - ${this.transactionManager.formatDate(budget.endDate)}`;
            
            // Update progress bar
            const progressBar = document.querySelector('.progress-fill');
            const progressPercentage = document.getElementById('progressPercentage');
            if (progressBar) {
                progressBar.style.width = `${summary.percentage}%`;
            }
            if (progressPercentage) {
                progressPercentage.textContent = `${summary.percentage.toFixed(1)}%`;
            }
            
            // Update summary numbers
            document.getElementById('summaryTotal').textContent = this.transactionManager.formatCurrency(summary.totalBudget);
            document.getElementById('summarySpent').textContent = this.transactionManager.formatCurrency(summary.totalSpent);
            document.getElementById('summaryLeft').textContent = this.transactionManager.formatCurrency(summary.remaining);
            
            // Update chart
            this.chartManager.updateChart(categories);
            
            // Update daily summary
            const today = new Date().toISOString().split('T')[0];
            this.showDailySummary(today);
            
            // Update recent transactions
            const recentContainer = document.getElementById('recentTransactions');
            if (recentContainer) {
                if (recentTransactions.length === 0) {
                    recentContainer.innerHTML = '<div class="empty-state"><p>No recent transactions</p></div>';
                } else {
                    let html = '';
                    recentTransactions.forEach(transaction => {
                        html += this.transactionManager.createTransactionElement(transaction);
                    });
                    recentContainer.innerHTML = html;
                }
            }
            
            // Update stats
            document.getElementById('statAddedMoney').textContent = this.transactionManager.formatCurrency(summary.addedMoney);
            document.getElementById('statLRTSavings').textContent = this.transactionManager.formatCurrency(lrtSavings);
            document.getElementById('statBiggestExpense').textContent = biggestExpense ? 
                this.transactionManager.formatCurrency(biggestExpense.spent) : '₱0.00';
            document.getElementById('statCategories').textContent = categories.length;
            
        } else {
            // Show empty state
            document.getElementById('currentBudgetName').textContent = 'No Active Budget';
            document.getElementById('currentBudgetDates').textContent = '-';
            
            document.getElementById('summaryTotal').textContent = '₱0.00';
            document.getElementById('summarySpent').textContent = '₱0.00';
            document.getElementById('summaryLeft').textContent = '₱0.00';
            
            document.querySelector('.progress-fill').style.width = '0%';
            document.getElementById('progressPercentage').textContent = '0%';
            
            document.getElementById('recentTransactions').innerHTML = 
                '<div class="empty-state"><p>No transactions yet</p></div>';
            
            document.getElementById('dailyContent').innerHTML = 
                '<div class="empty-state"><p>No spending today</p></div>';
            
            // Reset stats
            document.getElementById('statAddedMoney').textContent = '₱0';
            document.getElementById('statLRTSavings').textContent = '₱0';
            document.getElementById('statBiggestExpense').textContent = '₱0';
            document.getElementById('statCategories').textContent = '0';
            
            // Update chart with empty state
            this.chartManager.updateChart([]);
        }
        
        // Update menu info
        this.updateMenuInfo();
    }
}