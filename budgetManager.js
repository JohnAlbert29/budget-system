class BudgetManager {
    constructor() {
        this.activeBudget = null;
        this.archive = [];
        this.loadFromStorage();
    }

    // Create new budget - automatically archives current budget
    createBudget(name, startDate, endDate, totalAmount) {
        // Archive current budget if exists (even if not expired)
        if (this.activeBudget) {
            this.archiveCurrentBudget();
        }

        const budget = {
            id: Date.now(),
            name,
            startDate,
            endDate,
            totalBudget: parseFloat(totalAmount),
            addedMoney: 0,
            categories: {
                transportation: { spent: 0 },
                food: { spent: 0 },
                lrt: { spent: 0, trips: 0, saved: 0 },
                drinks: { spent: 0 },
                others: { spent: 0 },
                added_money: { spent: 0 }
            },
            transactions: []
        };

        this.activeBudget = budget;
        this.saveToStorage();
        return budget;
    }

    // Archive current budget
    archiveCurrentBudget() {
        if (!this.activeBudget) return null;
        
        // Calculate final statistics
        const totalSpent = this.getTotalSpent();
        const remaining = this.activeBudget.totalBudget - totalSpent;
        
        // Get the actual end date (either today or budget's end date, whichever is earlier)
        const today = new Date().toISOString().split('T')[0];
        const budgetEndDate = this.activeBudget.endDate;
        const actualEndDate = today < budgetEndDate ? today : budgetEndDate;
        
        const endedBudget = {
            ...this.activeBudget,
            endDate: actualEndDate, // Use actual end date
            totalSpent: totalSpent,
            savings: remaining,
            archivedAt: new Date().toISOString(),
            status: today < budgetEndDate ? 'incomplete' : 'completed'
        };
        
        // Add to archive at the beginning (most recent first)
        this.archive.unshift(endedBudget);
        
        // Keep only last 50 archived budgets
        if (this.archive.length > 50) {
            this.archive = this.archive.slice(0, 50);
        }
        
        this.saveToStorage();
        return endedBudget;
    }

    // Manually archive current budget (for UI)
    manualArchiveCurrentBudget() {
        return this.archiveCurrentBudget();
    }

    // Add money to budget
    addMoney(amount, source = '') {
        if (!this.activeBudget) return false;
        
        const amountNum = parseFloat(amount);
        this.activeBudget.totalBudget += amountNum;
        this.activeBudget.addedMoney += amountNum;
        
        // Record as transaction
        const transaction = {
            id: Date.now(),
            type: 'income',
            amount: amountNum,
            category: 'added_money',
            description: source || 'Added money',
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };
        
        this.activeBudget.transactions.push(transaction);
        this.saveToStorage();
        return transaction;
    }

    // Add expense
    addExpense(amount, category, description = '', date, applyDiscount = false) {
        if (!this.activeBudget) return false;
        
        let actualAmount = parseFloat(amount);
        let savedAmount = 0;
        let fullAmount = actualAmount;
        
        // Apply LRT discount
        if (category === 'lrt' && applyDiscount) {
            savedAmount = actualAmount * 0.5;
            actualAmount = actualAmount * 0.5;
            
            // Track LRT savings
            if (!this.activeBudget.categories.lrt.saved) this.activeBudget.categories.lrt.saved = 0;
            if (!this.activeBudget.categories.lrt.trips) this.activeBudget.categories.lrt.trips = 0;
            
            this.activeBudget.categories.lrt.saved += savedAmount;
            this.activeBudget.categories.lrt.trips += 1;
        }
        
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: actualAmount,
            fullAmount: fullAmount,
            category,
            description,
            date,
            savedAmount,
            applyDiscount,
            timestamp: Date.now()
        };
        
        this.activeBudget.transactions.push(transaction);
        
        // Initialize category if it doesn't exist
        if (!this.activeBudget.categories[category]) {
            this.activeBudget.categories[category] = { spent: 0 };
        }
        
        this.activeBudget.categories[category].spent += actualAmount;
        this.saveToStorage();
        return transaction;
    }

    // Update expense
    updateExpense(transactionId, updates) {
        if (!this.activeBudget) return false;
        
        const transactionIndex = this.activeBudget.transactions
            .findIndex(t => t.id === transactionId);
        
        if (transactionIndex === -1) return false;
        
        const oldTransaction = this.activeBudget.transactions[transactionIndex];
        
        // Remove old amount from category
        if (this.activeBudget.categories[oldTransaction.category]) {
            this.activeBudget.categories[oldTransaction.category].spent -= oldTransaction.amount;
        }
        
        // Remove LRT savings if applicable
        if (oldTransaction.category === 'lrt' && oldTransaction.savedAmount) {
            if (this.activeBudget.categories.lrt.saved) {
                this.activeBudget.categories.lrt.saved -= oldTransaction.savedAmount;
            }
            if (this.activeBudget.categories.lrt.trips) {
                this.activeBudget.categories.lrt.trips -= 1;
            }
        }
        
        // Prepare new transaction
        let actualAmount = parseFloat(updates.amount);
        let savedAmount = 0;
        let fullAmount = actualAmount;
        
        // Apply LRT discount if applicable
        if (updates.category === 'lrt' && updates.applyDiscount) {
            savedAmount = actualAmount * 0.5;
            actualAmount = actualAmount * 0.5;
            
            // Add LRT savings
            if (!this.activeBudget.categories.lrt.saved) this.activeBudget.categories.lrt.saved = 0;
            if (!this.activeBudget.categories.lrt.trips) this.activeBudget.categories.lrt.trips = 0;
            
            this.activeBudget.categories.lrt.saved += savedAmount;
            this.activeBudget.categories.lrt.trips += 1;
        }
        
        // Update transaction
        this.activeBudget.transactions[transactionIndex] = {
            ...oldTransaction,
            amount: actualAmount,
            fullAmount: fullAmount,
            category: updates.category,
            description: updates.description,
            date: updates.date,
            savedAmount,
            applyDiscount: updates.applyDiscount || false,
            updatedAt: Date.now()
        };
        
        // Add new amount to category
        if (!this.activeBudget.categories[updates.category]) {
            this.activeBudget.categories[updates.category] = { spent: 0 };
        }
        this.activeBudget.categories[updates.category].spent += actualAmount;
        
        this.saveToStorage();
        return this.activeBudget.transactions[transactionIndex];
    }

    // Delete transaction
    deleteTransaction(transactionId) {
        if (!this.activeBudget) return false;
        
        const transactionIndex = this.activeBudget.transactions
            .findIndex(t => t.id === transactionId);
        
        if (transactionIndex === -1) return false;
        
        const transaction = this.activeBudget.transactions[transactionIndex];
        
        // Remove from category spent
        if (this.activeBudget.categories[transaction.category]) {
            this.activeBudget.categories[transaction.category].spent -= transaction.amount;
        }
        
        // Remove from LRT tracking if applicable
        if (transaction.category === 'lrt' && transaction.savedAmount) {
            if (this.activeBudget.categories.lrt.saved) {
                this.activeBudget.categories.lrt.saved -= transaction.savedAmount;
            }
            if (this.activeBudget.categories.lrt.trips) {
                this.activeBudget.categories.lrt.trips -= 1;
            }
        }
        
        // Remove transaction
        this.activeBudget.transactions.splice(transactionIndex, 1);
        this.saveToStorage();
        
        return true;
    }

    // Get total spent
    getTotalSpent() {
        if (!this.activeBudget) return 0;
        
        return Object.values(this.activeBudget.categories)
            .filter(cat => cat.spent) // Only include categories with spending
            .reduce((sum, cat) => sum + (cat.spent || 0), 0);
    }

    // Get budget summary
    getBudgetSummary() {
        if (!this.activeBudget) return null;
        
        const totalSpent = this.getTotalSpent();
        const remaining = this.activeBudget.totalBudget - totalSpent;
        
        return {
            totalBudget: this.activeBudget.totalBudget,
            totalSpent,
            remaining,
            addedMoney: this.activeBudget.addedMoney || 0
        };
    }

    // Get category breakdown
    getCategoryBreakdown() {
        if (!this.activeBudget) return [];
        
        const totalSpent = this.getTotalSpent();
        
        return Object.entries(this.activeBudget.categories)
            .filter(([name]) => name !== 'added_money')
            .map(([name, data]) => ({
                name,
                spent: data.spent || 0,
                percentage: totalSpent > 0 ? ((data.spent || 0) / totalSpent * 100) : 0
            }))
            .filter(cat => cat.spent > 0);
    }

    // Get biggest expense
    getBiggestExpense() {
        const categories = this.getCategoryBreakdown();
        if (categories.length === 0) return null;
        
        return categories.reduce((max, cat) => 
            cat.spent > max.spent ? cat : max
        );
    }

    // Get daily spending summary
    getDailySpending(date) {
        if (!this.activeBudget) return { total: 0, transactions: [] };
        
        const dailyTransactions = this.activeBudget.transactions
            .filter(t => t.date === date && t.type === 'expense');
        
        const total = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Get category breakdown for the day
        const categoryBreakdown = {};
        dailyTransactions.forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });
        
        return {
            date,
            total,
            transactions: dailyTransactions.sort((a, b) => b.timestamp - a.timestamp),
            categoryBreakdown
        };
    }

    // Get all transactions with filters
    getAllTransactions(filters = {}) {
        if (!this.activeBudget) return [];
        
        let transactions = [...(this.activeBudget.transactions || [])];
        
        // Apply filters
        if (filters.category) {
            transactions = transactions.filter(t => t.category === filters.category);
        }
        
        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }
        
        if (filters.dateFrom) {
            transactions = transactions.filter(t => t.date >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            transactions = transactions.filter(t => t.date <= filters.dateTo);
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Check if budget has expired (only for auto-check, not for manual archiving)
    checkBudgetExpiry() {
        if (!this.activeBudget) return false;
        
        const today = new Date().toISOString().split('T')[0];
        if (today > this.activeBudget.endDate) {
            // Don't auto-archive, just notify
            return true;
        }
        return false;
    }

    // Get archive statistics
    getArchiveStats() {
        const totalSaved = this.archive.reduce((sum, budget) => sum + (budget.savings || 0), 0);
        const totalBudgets = this.archive.length;
        const avgSavings = totalBudgets > 0 ? totalSaved / totalBudgets : 0;
        
        return {
            totalSaved,
            totalBudgets,
            avgSavings
        };
    }

    // Get spending report data
    getSpendingReport() {
        if (!this.activeBudget) return null;
        
        const summary = this.getBudgetSummary();
        const categories = this.getCategoryBreakdown();
        const biggestExpense = this.getBiggestExpense();
        
        return {
            budgetName: this.activeBudget.name,
            period: `${this.activeBudget.startDate} to ${this.activeBudget.endDate}`,
            summary,
            categories,
            biggestExpense,
            transactions: this.getAllTransactions()
        };
    }

    // Get current budget info for archive confirmation
    getCurrentBudgetInfo() {
        if (!this.activeBudget) return null;
        
        const summary = this.getBudgetSummary();
        const totalTransactions = this.activeBudget.transactions?.length || 0;
        
        return {
            name: this.activeBudget.name,
            startDate: this.activeBudget.startDate,
            endDate: this.activeBudget.endDate,
            totalBudget: summary.totalBudget,
            totalSpent: summary.totalSpent,
            remaining: summary.remaining,
            addedMoney: summary.addedMoney,
            totalTransactions: totalTransactions,
            daysActive: this.getDaysActive()
        };
    }

    // Get days active for current budget
    getDaysActive() {
        if (!this.activeBudget) return 0;
        
        const start = new Date(this.activeBudget.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Storage methods
    saveToStorage() {
        try {
            localStorage.setItem('budgetData', JSON.stringify({
                activeBudget: this.activeBudget,
                archive: this.archive,
                version: '2.0' // Updated version for new format
            }));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('budgetData');
            if (data) {
                const parsed = JSON.parse(data);
                this.activeBudget = parsed.activeBudget;
                this.archive = parsed.archive || [];
                
                // Initialize missing categories for old data
                if (this.activeBudget) {
                    if (!this.activeBudget.categories) {
                        this.activeBudget.categories = {
                            transportation: { spent: 0 },
                            food: { spent: 0 },
                            lrt: { spent: 0, trips: 0, saved: 0 },
                            drinks: { spent: 0 },
                            others: { spent: 0 },
                            added_money: { spent: 0 }
                        };
                    }
                    
                    // Ensure all required categories exist
                    const requiredCategories = ['transportation', 'food', 'lrt', 'drinks', 'others', 'added_money'];
                    requiredCategories.forEach(cat => {
                        if (!this.activeBudget.categories[cat]) {
                            this.activeBudget.categories[cat] = { spent: 0 };
                        }
                        if (cat === 'lrt') {
                            if (typeof this.activeBudget.categories.lrt.saved === 'undefined') {
                                this.activeBudget.categories.lrt.saved = 0;
                            }
                            if (typeof this.activeBudget.categories.lrt.trips === 'undefined') {
                                this.activeBudget.categories.lrt.trips = 0;
                            }
                        }
                    });
                    
                    // Remove old budget field if exists (migration from v1.0)
                    Object.values(this.activeBudget.categories).forEach(cat => {
                        if (cat.budget !== undefined) {
                            delete cat.budget;
                        }
                    });
                }
                
                // Migrate archive data
                this.archive.forEach(budget => {
                    if (!budget.categories) {
                        budget.categories = {
                            transportation: { spent: 0 },
                            food: { spent: 0 },
                            lrt: { spent: 0, trips: 0, saved: 0 },
                            drinks: { spent: 0 },
                            others: { spent: 0 },
                            added_money: { spent: 0 }
                        };
                    }
                    
                    // Remove old budget field from archived budgets
                    Object.values(budget.categories).forEach(cat => {
                        if (cat.budget !== undefined) {
                            delete cat.budget;
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.activeBudget = null;
            this.archive = [];
        }
    }

    // Get recent transactions
    getRecentTransactions(limit = 5) {
        if (!this.activeBudget) return [];
        
        return [...this.activeBudget.transactions]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // Export data
    exportData() {
        return JSON.stringify({
            activeBudget: this.activeBudget,
            archive: this.archive,
            exportDate: new Date().toISOString(),
            version: '2.0'
        }, null, 2);
    }

    // Import data
    importData(data) {
        try {
            const parsed = JSON.parse(data);
            
            // Validate data structure
            if (!parsed.activeBudget && !parsed.archive) {
                throw new Error('Invalid data format');
            }
            
            // Clear current data
            this.activeBudget = null;
            this.archive = [];
            
            // Import data
            this.activeBudget = parsed.activeBudget;
            this.archive = parsed.archive || [];
            
            // Ensure categories structure
            if (this.activeBudget) {
                if (!this.activeBudget.categories) {
                    this.activeBudget.categories = {
                        transportation: { spent: 0 },
                        food: { spent: 0 },
                        lrt: { spent: 0, trips: 0, saved: 0 },
                        drinks: { spent: 0 },
                        others: { spent: 0 },
                        added_money: { spent: 0 }
                    };
                }
                
                // Ensure others category exists
                if (!this.activeBudget.categories.others) {
                    this.activeBudget.categories.others = { spent: 0 };
                }
                
                // Remove old budget field if exists
                Object.values(this.activeBudget.categories).forEach(cat => {
                    if (cat.budget !== undefined) {
                        delete cat.budget;
                    }
                });
            }
            
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            alert(`Error importing data: ${error.message}`);
            return false;
        }
    }
}