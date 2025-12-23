class UIManager {
    constructor(budgetManager, transactionManager, chartManager) {
        this.budgetManager = budgetManager;
        this.transactionManager = transactionManager;
        this.chartManager = chartManager;
        this.currentScreen = 'dashboard';
        this.currentReport = null;
        
        // Initialize with delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeEventListeners();
            this.setupDailyDatePicker();
            this.checkForNewDay();
            this.updateUI();
        }, 100);
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Check for required elements
        try {
            // New Budget Button - Show confirmation if current budget exists
            const newBudgetBtn = document.getElementById('newBudgetBtn');
            if (newBudgetBtn) {
                newBudgetBtn.addEventListener('click', () => {
                    if (this.budgetManager.activeBudget) {
                        this.showArchiveConfirmation();
                    } else {
                        this.showModal('newBudgetModal');
                        this.setDefaultDates();
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

            // Confirm Archive Button (for creating new budget)
            const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
            if (confirmArchiveBtn) {
                confirmArchiveBtn.addEventListener('click', () => {
                    this.hideAllModals();
                    // Show new budget modal after archiving
                    setTimeout(() => {
                        this.showModal('newBudgetModal');
                        this.setDefaultDates();
                    }, 300);
                });
            }

            // Cancel Archive Button
            const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
            if (cancelArchiveBtn) {
                cancelArchiveBtn.addEventListener('click', () => {
                    this.hideAllModals();
                });
            }

            // Add Expense Button
            const addExpenseBtn = document.getElementById('addExpenseBtn');
            if (addExpenseBtn) {
                addExpenseBtn.addEventListener('click', () => {
                    if (!this.budgetManager.activeBudget) {
                        alert('Please create a budget first!');
                        return;
                    }
                    this.showModal('addExpenseModal');
                    this.setDefaultExpenseDate();
                    this.resetExpenseForm();
                });
            }

            // Add Money Button
            const addMoneyBtn = document.getElementById('addMoneyBtn');
            if (addMoneyBtn) {
                addMoneyBtn.addEventListener('click', () => {
                    if (!this.budgetManager.activeBudget) {
                        alert('Please create a budget first!');
                        return;
                    }
                    this.showModal('addMoneyModal');
                    this.setDefaultMoneyDate();
                });
            }

            // View All Transactions Button
            const viewAllTransactionsBtn = document.getElementById('viewAllTransactionsBtn');
            if (viewAllTransactionsBtn) {
                viewAllTransactionsBtn.addEventListener('click', () => {
                    this.switchScreen('transactions');
                    this.loadAllTransactions();
                });
            }

            // View Archive Button
            const viewArchiveBtn = document.getElementById('viewArchiveBtn');
            if (viewArchiveBtn) {
                viewArchiveBtn.addEventListener('click', () => {
                    this.switchScreen('archive');
                    this.loadFullArchive();
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

            // Update Expense Button
            const updateExpenseBtn = document.getElementById('updateExpenseBtn');
            if (updateExpenseBtn) {
                updateExpenseBtn.addEventListener('click', () => {
                    this.updateExpense();
                });
            }

            // Delete Expense Button
            const deleteExpenseBtn = document.getElementById('deleteExpenseBtn');
            if (deleteExpenseBtn) {
                deleteExpenseBtn.addEventListener('click', () => {
                    this.deleteExpense();
                });
            }

            // Print Button
            const printBtn = document.getElementById('printBtn');
            if (printBtn) {
                printBtn.addEventListener('click', () => {
                    this.printReport();
                });
            }

            // Download PDF Button
            const downloadPdfBtn = document.getElementById('downloadPdfBtn');
            if (downloadPdfBtn) {
                downloadPdfBtn.addEventListener('click', () => {
                    this.downloadPDF();
                });
            }

            // Daily Date Picker
            const dailyDatePicker = document.getElementById('dailyDatePicker');
            if (dailyDatePicker) {
                dailyDatePicker.addEventListener('change', (e) => {
                    this.showDailySummary(e.target.value);
                });
            }

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

            // Expense amount input for discount calculation
            const expenseAmount = document.getElementById('expenseAmount');
            if (expenseAmount) {
                expenseAmount.addEventListener('input', () => {
                    this.calculateDiscount();
                });
            }

            // Edit expense amount input
            const editExpenseAmount = document.getElementById('editExpenseAmount');
            if (editExpenseAmount) {
                editExpenseAmount.addEventListener('input', () => {
                    this.calculateEditDiscount();
                });
            }

            // Category change for LRT discount
            const expenseCategory = document.getElementById('expenseCategory');
            if (expenseCategory) {
                expenseCategory.addEventListener('change', (e) => {
                    this.toggleLRTDiscount(e.target.value === 'lrt');
                });
            }

            // Edit category change for LRT discount
            const editExpenseCategory = document.getElementById('editExpenseCategory');
            if (editExpenseCategory) {
                editExpenseCategory.addEventListener('change', (e) => {
                    this.toggleEditLRTDiscount(e.target.value === 'lrt');
                });
            }

            // Filter transactions
            const filterCategory = document.getElementById('filterCategory');
            if (filterCategory) {
                filterCategory.addEventListener('change', () => {
                    this.loadAllTransactions();
                });
            }

            const filterDateFrom = document.getElementById('filterDateFrom');
            if (filterDateFrom) {
                filterDateFrom.addEventListener('change', () => {
                    this.loadAllTransactions();
                });
            }

            const filterDateTo = document.getElementById('filterDateTo');
            if (filterDateTo) {
                filterDateTo.addEventListener('change', () => {
                    this.loadAllTransactions();
                });
            }

            const clearFilters = document.getElementById('clearFilters');
            if (clearFilters) {
                clearFilters.addEventListener('click', () => {
                    this.clearFilters();
                });
            }

            // Report buttons
            document.querySelectorAll('.report-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const reportType = e.currentTarget.dataset.report;
                    this.generateReport(reportType);
                });
            });

            // Close modals
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.hideAllModals();
                });
            });

            // Modal overlay click
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target.id === 'modalOverlay') {
                        this.hideAllModals();
                    }
                });
            }

            // Bottom navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const screen = e.currentTarget.dataset.screen;
                    if (screen === 'add') {
                        if (!this.budgetManager.activeBudget) {
                            alert('Please create a budget first!');
                            return;
                        }
                        this.showModal('addExpenseModal');
                    } else {
                        this.switchScreen(screen);
                    }
                });
            });

            // Back buttons
            document.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetScreen = e.currentTarget.dataset.target;
                    this.switchScreen(targetScreen);
                });
            });

            // Daily summary click
            const dailySummary = document.getElementById('dailySummary');
            if (dailySummary) {
                dailySummary.addEventListener('click', () => {
                    const selectedDate = document.getElementById('dailyDatePicker')?.value;
                    if (selectedDate) {
                        this.showDailySummaryModal(selectedDate);
                    }
                });
            }

            // Biggest expense click
            const biggestExpense = document.getElementById('biggestExpense');
            if (biggestExpense) {
                biggestExpense.addEventListener('click', () => {
                    const biggest = this.budgetManager.getBiggestExpense();
                    if (biggest) {
                        this.generateReport('category');
                        this.switchScreen('reports');
                    }
                });
            }

            // Archive item clicks (delegated)
            document.addEventListener('click', (e) => {
                // Edit transaction
                if (e.target.closest('.edit-btn')) {
                    const editBtn = e.target.closest('.edit-btn');
                    if (editBtn && editBtn.dataset.id) {
                        const transactionId = parseInt(editBtn.dataset.id);
                        this.editTransaction(transactionId);
                    }
                }
                
                // Delete transaction
                if (e.target.closest('.delete-btn')) {
                    const deleteBtn = e.target.closest('.delete-btn');
                    if (deleteBtn && deleteBtn.dataset.id) {
                        const transactionId = parseInt(deleteBtn.dataset.id);
                        this.confirmDeleteTransaction(transactionId);
                    }
                }
                
                // Archive item click
                if (e.target.closest('.archive-item')) {
                    const archiveItem = e.target.closest('.archive-item');
                    if (archiveItem && archiveItem.dataset.id) {
                        const budgetId = parseInt(archiveItem.dataset.id);
                        this.viewArchiveBudget(budgetId);
                    }
                }
            });

            // Category items click
            document.addEventListener('click', (e) => {
                if (e.target.closest('.category-item')) {
                    const categoryItem = e.target.closest('.category-item');
                    const categoryNameElement = categoryItem.querySelector('.category-name span:nth-child(2)');
                    if (categoryNameElement) {
                        const categoryName = categoryNameElement.textContent.toLowerCase();
                        this.filterByCategory(categoryName);
                    }
                }
            });

            console.log('Event listeners initialized successfully');
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    // Show archive confirmation when creating new budget
    showArchiveConfirmation() {
        if (!this.budgetManager.activeBudget) {
            this.showModal('newBudgetModal');
            return;
        }
        
        const budgetInfo = this.budgetManager.getCurrentBudgetInfo();
        if (!budgetInfo) return;
        
        // Update confirmation modal with current budget info
        const currentBudgetName = document.getElementById('currentBudgetName');
        const currentBudgetSpent = document.getElementById('currentBudgetSpent');
        const currentBudgetRemaining = document.getElementById('currentBudgetRemaining');
        
        if (currentBudgetName) currentBudgetName.textContent = budgetInfo.name;
        if (currentBudgetSpent) currentBudgetSpent.textContent = this.transactionManager.formatCurrency(budgetInfo.totalSpent);
        if (currentBudgetRemaining) currentBudgetRemaining.textContent = this.transactionManager.formatCurrency(budgetInfo.remaining);
        
        this.showModal('archiveBudgetModal');
    }

    setupDailyDatePicker() {
        const dailyDatePicker = document.getElementById('dailyDatePicker');
        if (dailyDatePicker) {
            const today = new Date().toISOString().split('T')[0];
            dailyDatePicker.value = today;
            this.showDailySummary(today);
        }
    }

    checkForNewDay() {
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = localStorage.getItem('lastDailyCheck') || today;
        
        if (lastCheck !== today) {
            localStorage.setItem('lastDailyCheck', today);
            this.setupDailyDatePicker();
        }
    }

    showModal(modalId) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById(modalId);
        
        if (modalOverlay && modal) {
            modalOverlay.style.display = 'flex';
            modal.style.display = 'block';
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
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const budgetAmount = document.getElementById('budgetAmount');
        
        if (startDate) startDate.value = today;
        if (endDate) endDate.value = nextMonthStr;
        
        // Set budget amount based on last budget if available
        if (budgetAmount && this.budgetManager.archive.length > 0) {
            const lastBudget = this.budgetManager.archive[0];
            budgetAmount.value = lastBudget.totalBudget;
        }
    }

    setDefaultExpenseDate() {
        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) {
            expenseDate.value = new Date().toISOString().split('T')[0];
        }
    }

    setDefaultMoneyDate() {
        const moneyDate = document.getElementById('moneyDate');
        if (moneyDate) {
            moneyDate.value = new Date().toISOString().split('T')[0];
        }
    }

    resetExpenseForm() {
        const expenseAmount = document.getElementById('expenseAmount');
        const expenseDescription = document.getElementById('expenseDescription');
        const applyDiscount = document.getElementById('applyDiscount');
        
        if (expenseAmount) expenseAmount.value = '';
        if (expenseDescription) expenseDescription.value = '';
        if (applyDiscount) applyDiscount.checked = false;
        
        this.toggleDiscountInfo(false);
        this.toggleLRTDiscount(false);
    }

    toggleLRTDiscount(show) {
        const discountGroup = document.getElementById('lrtDiscountGroup');
        if (discountGroup) {
            discountGroup.style.display = show ? 'block' : 'none';
            if (!show) {
                const applyDiscount = document.getElementById('applyDiscount');
                if (applyDiscount) applyDiscount.checked = false;
                this.toggleDiscountInfo(false);
            }
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
            if (show) {
                this.calculateDiscount();
            }
        }
    }

    toggleEditDiscountInfo(show) {
        const discountInfo = document.getElementById('editDiscountInfo');
        if (discountInfo) {
            discountInfo.style.display = show ? 'block' : 'none';
            if (show) {
                this.calculateEditDiscount();
            }
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

    createNewBudget() {
        const name = document.getElementById('budgetTitle')?.value.trim();
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        const amount = document.getElementById('budgetAmount')?.value;

        if (!name || !startDate || !endDate || !amount) {
            alert('Please fill in all fields');
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            alert('End date must be after start date');
            return;
        }

        // Get current budget info before archiving
        const currentBudgetName = this.budgetManager.activeBudget?.name;
        
        // Create new budget (automatically archives current)
        this.budgetManager.createBudget(name, startDate, endDate, amount);
        this.hideAllModals();
        this.updateUI();
        
        // Show success message
        let message = `Budget "${name}" created successfully!\nPeriod: ${startDate} to ${endDate}\nTotal: ₱${parseFloat(amount).toFixed(2)}`;
        
        if (currentBudgetName) {
            message += `\n\nPrevious budget "${currentBudgetName}" has been archived.`;
        }
        
        alert(message);
    }

    addExpense() {
        const amount = document.getElementById('expenseAmount')?.value;
        const category = document.getElementById('expenseCategory')?.value;
        const description = document.getElementById('expenseDescription')?.value.trim();
        const date = document.getElementById('expenseDate')?.value;
        const applyDiscount = category === 'lrt' && 
            document.getElementById('applyDiscount')?.checked;

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!date) {
            alert('Please select a date');
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
        }
    }

    addMoney() {
        const amount = document.getElementById('moneyAmount')?.value;
        const source = document.getElementById('moneySource')?.value.trim();
        const date = document.getElementById('moneyDate')?.value;

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const transaction = this.budgetManager.addMoney(amount, source);
        if (transaction) {
            this.hideAllModals();
            this.updateUI();
            alert(`Successfully added ₱${parseFloat(amount).toFixed(2)} to your budget!`);
        }
    }

    editTransaction(transactionId) {
        if (!this.budgetManager.activeBudget) return;
        
        const transaction = this.budgetManager.activeBudget.transactions
            .find(t => t.id === transactionId);
        
        if (!transaction) return;
        
        // Fill edit form
        const editTransactionId = document.getElementById('editTransactionId');
        const editExpenseAmount = document.getElementById('editExpenseAmount');
        const editExpenseCategory = document.getElementById('editExpenseCategory');
        const editExpenseDescription = document.getElementById('editExpenseDescription');
        const editExpenseDate = document.getElementById('editExpenseDate');
        const editApplyDiscount = document.getElementById('editApplyDiscount');
        
        if (editTransactionId) editTransactionId.value = transactionId;
        if (editExpenseAmount) editExpenseAmount.value = transaction.fullAmount || transaction.amount;
        if (editExpenseCategory) editExpenseCategory.value = transaction.category;
        if (editExpenseDescription) editExpenseDescription.value = transaction.description || '';
        if (editExpenseDate) editExpenseDate.value = transaction.date;
        
        // Handle LRT discount
        if (transaction.category === 'lrt') {
            this.toggleEditLRTDiscount(true);
            if (editApplyDiscount) {
                editApplyDiscount.checked = transaction.applyDiscount || false;
            }
            this.toggleEditDiscountInfo(transaction.applyDiscount || false);
            if (transaction.applyDiscount) {
                this.calculateEditDiscount();
            }
        } else {
            this.toggleEditLRTDiscount(false);
            if (editApplyDiscount) editApplyDiscount.checked = false;
            this.toggleEditDiscountInfo(false);
        }
        
        this.showModal('editExpenseModal');
    }

    updateExpense() {
        const transactionId = parseInt(document.getElementById('editTransactionId')?.value || '0');
        const amount = document.getElementById('editExpenseAmount')?.value;
        const category = document.getElementById('editExpenseCategory')?.value;
        const description = document.getElementById('editExpenseDescription')?.value.trim();
        const date = document.getElementById('editExpenseDate')?.value;
        const applyDiscount = category === 'lrt' && 
            document.getElementById('editApplyDiscount')?.checked;

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!date) {
            alert('Please select a date');
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
            alert('Expense updated successfully!');
        }
    }

    confirmDeleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.deleteTransaction(transactionId);
        }
    }

    deleteTransaction(transactionId) {
        if (this.budgetManager.deleteTransaction(transactionId)) {
            this.updateUI();
            alert('Transaction deleted successfully!');
        }
    }

    showDailySummary(date) {
        const dailySummary = document.getElementById('dailySummary');
        if (!dailySummary) return;
        
        const dailyData = this.budgetManager.getDailySpending(date);
        const summaryHTML = this.transactionManager.createDailySummary(dailyData);
        
        dailySummary.innerHTML = summaryHTML || '<p>No expenses for this day.</p>';
    }

    showDailySummaryModal(date) {
        const printContent = document.getElementById('printContent');
        if (!printContent) return;
        
        const dailyData = this.budgetManager.getDailySpending(date);
        const summaryHTML = this.transactionManager.createDailySummary(dailyData);
        
        printContent.innerHTML = `
            <div class="print-report">
                <div class="print-header">
                    <h2>Daily Spending Report</h2>
                    <p>${this.transactionManager.formatDate(date)}</p>
                </div>
                ${summaryHTML}
            </div>
        `;
        
        this.showModal('printReportModal');
    }

    switchScreen(screen) {
        // Update current screen
        this.currentScreen = screen;
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
        });
        
        // Show/hide screens
        document.querySelectorAll('.screen').forEach(screenEl => {
            screenEl.classList.toggle('active', screenEl.id === `${screen}Screen`);
        });
        
        // Update content for specific screens
        switch(screen) {
            case 'transactions':
                this.loadAllTransactions();
                break;
            case 'archive':
                this.loadFullArchive();
                break;
            case 'reports':
                const reportContent = document.getElementById('reportContent');
                if (reportContent) {
                    reportContent.innerHTML = '<p>Select a report to generate</p>';
                }
                break;
            case 'dashboard':
                this.updateUI();
                break;
        }
    }

    loadAllTransactions() {
        const container = document.getElementById('allTransactions');
        if (!container) return;
        
        // Get filter values
        const category = document.getElementById('filterCategory')?.value || '';
        const dateFrom = document.getElementById('filterDateFrom')?.value || '';
        const dateTo = document.getElementById('filterDateTo')?.value || '';
        
        const filters = {};
        if (category) filters.category = category;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        
        const transactions = this.budgetManager.getAllTransactions(filters);
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>No transactions found</p>';
            return;
        }
        
        container.innerHTML = '';
        transactions.forEach(transaction => {
            const element = this.transactionManager.createTransactionElement(transaction, true);
            container.appendChild(element);
        });
    }

    loadFullArchive() {
        const container = document.getElementById('fullArchive');
        if (!container) return;
        
        const archive = this.budgetManager.archive;
        
        if (archive.length === 0) {
            container.innerHTML = '<p>No archived budgets yet</p>';
            return;
        }
        
        container.innerHTML = '';
        archive.forEach(budget => {
            const element = this.transactionManager.createArchiveItem(budget);
            container.appendChild(element);
        });
        
        // Add archive stats
        const stats = this.budgetManager.getArchiveStats();
        if (stats.totalBudgets > 0) {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'archive-stats-summary';
            statsDiv.innerHTML = `
                <h3>Archive Summary</h3>
                <p>Total Budgets: ${stats.totalBudgets}</p>
                <p>Total Saved: ${this.transactionManager.formatCurrency(stats.totalSaved)}</p>
                <p>Average Savings: ${this.transactionManager.formatCurrency(stats.avgSavings)}</p>
            `;
            container.insertBefore(statsDiv, container.firstChild);
        }
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
                    budget: data.budget || 0,
                    remaining: (data.budget || 0) - (data.spent || 0),
                    percentage: (budget.totalSpent || 0) > 0 ? 
                        ((data.spent || 0) / (budget.totalSpent || 0) * 100) : 0
                }))
                .filter(cat => cat.spent > 0),
            transactions: budget.transactions || []
        };
        
        // Show in print modal
        const printContent = document.getElementById('printContent');
        if (printContent) {
            const reportHTML = this.transactionManager.createReportHTML(reportData, 'full');
            printContent.innerHTML = reportHTML;
            this.showModal('printReportModal');
        }
    }

    generateReport(reportType) {
        if (!this.budgetManager.activeBudget) {
            alert('Please create a budget first!');
            return;
        }
        
        const reportData = this.budgetManager.getSpendingReport();
        if (!reportData) {
            alert('No data available for report');
            return;
        }
        
        const reportContent = document.getElementById('reportContent');
        if (reportContent) {
            const reportHTML = this.transactionManager.createReportHTML(reportData, reportType);
            reportContent.innerHTML = reportHTML;
            
            // Store for printing
            this.currentReport = { reportData, reportType };
        }
    }

    printReport() {
        if (!this.currentReport) {
            alert('No report generated yet');
            return;
        }
        
        const reportHTML = this.transactionManager.createReportHTML(
            this.currentReport.reportData, 
            this.currentReport.reportType
        );
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Budget Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .print-header { text-align: center; margin-bottom: 30px; }
                        .print-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
                        .print-stat { background: #f5f5f5; padding: 15px; border-radius: 8px; }
                        .print-category { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .negative { color: red; }
                        .positive { color: green; }
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${reportHTML}
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Print Report
                        </button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    }

    downloadPDF() {
        alert('PDF download functionality would require a server-side component or specialized library.\n\nFor now, you can:\n1. Print the report (Ctrl+P)\n2. Save as PDF from print dialog');
    }

    clearFilters() {
        const filterCategory = document.getElementById('filterCategory');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');
        
        if (filterCategory) filterCategory.value = '';
        if (filterDateFrom) filterDateFrom.value = '';
        if (filterDateTo) filterDateTo.value = '';
        
        this.loadAllTransactions();
    }

    filterByCategory(categoryName) {
        // Map category name to value
        const categoryMap = {
            'transportation': 'transportation',
            'food': 'food',
            'lrt fare': 'lrt',
            'drinks': 'drinks'
        };
        
        const categoryValue = categoryMap[categoryName.toLowerCase()];
        if (categoryValue) {
            this.switchScreen('transactions');
            const filterCategory = document.getElementById('filterCategory');
            if (filterCategory) {
                filterCategory.value = categoryValue;
                this.loadAllTransactions();
            }
        }
    }

    updateUI() {
        console.log('Updating UI...');
        
        // Update budget summary
        if (this.budgetManager.activeBudget) {
            const budget = this.budgetManager.activeBudget;
            const summary = this.budgetManager.getBudgetSummary();
            
            const budgetName = document.getElementById('budgetName');
            const budgetDates = document.getElementById('budgetDates');
            const totalBudget = document.getElementById('totalBudget');
            const totalSpent = document.getElementById('totalSpent');
            const totalRemaining = document.getElementById('totalRemaining');
            
            if (budgetName) budgetName.textContent = budget.name;
            if (budgetDates) budgetDates.textContent = 
                `${this.transactionManager.formatDate(budget.startDate)} - ${this.transactionManager.formatDate(budget.endDate)}`;
            if (totalBudget) totalBudget.textContent = 
                this.transactionManager.formatCurrency(summary.totalBudget);
            if (totalSpent) totalSpent.textContent = 
                this.transactionManager.formatCurrency(summary.totalSpent);
            if (totalRemaining) totalRemaining.textContent = 
                this.transactionManager.formatCurrency(summary.remaining);
            
            // Update categories
            this.updateCategories();
            
            // Update chart
            const breakdown = this.budgetManager.getCategoryBreakdown();
            this.chartManager.updateChart(breakdown);
            
            // Update biggest expense
            const biggest = this.budgetManager.getBiggestExpense();
            const biggestExpense = document.getElementById('biggestExpense');
            if (biggestExpense) {
                biggestExpense.innerHTML = `
                    <h3>💰 Biggest Expense</h3>
                    ${this.chartManager.createBiggestExpenseHTML(biggest)}
                `;
            }
            
            // Update recent transactions
            this.updateRecentTransactions();
            
            // Update archive preview
            this.updateArchivePreview();
            
        } else {
            // Show empty state
            const budgetName = document.getElementById('budgetName');
            const budgetDates = document.getElementById('budgetDates');
            const totalBudget = document.getElementById('totalBudget');
            const totalSpent = document.getElementById('totalSpent');
            const totalRemaining = document.getElementById('totalRemaining');
            const categorySummary = document.querySelector('.category-summary');
            const recentTransactions = document.getElementById('recentTransactions');
            const budgetArchive = document.getElementById('budgetArchive');
            
            if (budgetName) budgetName.textContent = 'No Active Budget';
            if (budgetDates) budgetDates.textContent = '';
            if (totalBudget) totalBudget.textContent = '₱0.00';
            if (totalSpent) totalSpent.textContent = '₱0.00';
            if (totalRemaining) totalRemaining.textContent = '₱0.00';
            if (categorySummary) categorySummary.innerHTML = '<p>Create a budget to get started!</p>';
            if (recentTransactions) recentTransactions.innerHTML = '<p>No transactions yet</p>';
            if (budgetArchive) budgetArchive.innerHTML = '<p>No archived budgets yet</p>';
        }
    }

    updateCategories() {
        const categorySummary = document.querySelector('.category-summary');
        if (!categorySummary) return;
        
        const breakdown = this.budgetManager.getCategoryBreakdown();
        
        if (!breakdown || breakdown.length === 0) {
            categorySummary.innerHTML = '<p>No expenses yet</p>';
            return;
        }
        
        let html = '';
        breakdown.forEach(cat => {
            const icon = cat.name === 'transportation' ? '🚗' : 
                        cat.name === 'food' ? '🍔' : 
                        cat.name === 'lrt' ? '🚆' : '🥤';
            const name = this.transactionManager.getCategoryName(cat.name);
            const spent = this.transactionManager.formatCurrency(cat.spent);
            const percentage = `${cat.percentage.toFixed(1)}%`;
            const remaining = this.transactionManager.formatCurrency(cat.remaining);
            
            const biggest = this.budgetManager.getBiggestExpense();
            const isHighlight = biggest && cat.name === biggest.name;
            
            html += `
                <div class="category-item ${isHighlight ? 'highlight' : ''}">
                    <div class="category-name">
                        <span>${icon}</span>
                        <span>${name}</span>
                    </div>
                    <div>
                        <div class="category-amount">${spent}</div>
                        <div class="category-percentage">${percentage} • Remaining: ${remaining}</div>
                    </div>
                </div>
            `;
        });
        
        categorySummary.innerHTML = html;
    }

    updateRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;
        
        const recent = this.budgetManager.getRecentTransactions(5);
        
        if (!recent || recent.length === 0) {
            container.innerHTML = '<p>No transactions yet</p>';
            return;
        }
        
        container.innerHTML = '';
        recent.forEach(transaction => {
            const element = this.transactionManager.createTransactionElement(transaction);
            container.appendChild(element);
        });
    }

    updateArchivePreview() {
        const container = document.getElementById('budgetArchive');
        if (!container) return;
        
        const archive = this.budgetManager.archive.slice(0, 3); // Show last 3
        
        if (!archive || archive.length === 0) {
            container.innerHTML = '<p>No archived budgets yet</p>';
            return;
        }
        
        container.innerHTML = '';
        archive.forEach(budget => {
            const element = this.transactionManager.createArchiveItem(budget);
            container.appendChild(element);
        });
    }
}