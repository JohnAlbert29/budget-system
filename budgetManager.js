class BudgetManager {
    constructor() {
        this.activeBudget = null;
        this.archive = [];
        this.loadFromStorage();
    }

    createBudget(name, startDate, endDate, totalAmount) {
        // Archive current budget if exists
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
                transportation: { spent: 0, count: 0 },
                food: { spent: 0, count: 0 },
                lrt: { spent: 0, trips: 0, saved: 0, count: 0 },
                drinks: { spent: 0, count: 0 },
                others: { spent: 0, count: 0 },
                added_money: { spent: 0, count: 0 }
            },
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.activeBudget = budget;
        this.saveToStorage();
        return budget;
    }

    archiveCurrentBudget() {
        if (!this.activeBudget) return null;
        
        const totalSpent = this.getTotalSpent();
        const remaining = this.activeBudget.totalBudget - totalSpent;
        const today = new Date().toISOString().split('T')[0];
        const budgetEndDate = this.activeBudget.endDate;
        const actualEndDate = today < budgetEndDate ? today : budgetEndDate;
        
        const endedBudget = {
            ...this.activeBudget,
            endDate: actualEndDate,
            totalSpent: totalSpent,
            savings: remaining,
            archivedAt: new Date().toISOString(),
            status: today < budgetEndDate ? 'incomplete' : 'completed',
            daysActive: this.getDaysActive()
        };
        
        this.archive.unshift(endedBudget);
        
        // Keep only last 50 archived budgets
        if (this.archive.length > 50) {
            this.archive = this.archive.slice(0, 50);
        }
        
        this.saveToStorage();
        return endedBudget;
    }

    addMoney(amount, source = '') {
        if (!this.activeBudget) return false;
        
        const amountNum = parseFloat(amount);
        this.activeBudget.totalBudget += amountNum;
        this.activeBudget.addedMoney += amountNum;
        this.activeBudget.updatedAt = new Date().toISOString();
        
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
        this.activeBudget.categories.added_money.spent += amountNum;
        this.activeBudget.categories.added_money.count += 1;
        this.saveToStorage();
        return transaction;
    }

    addExpense(amount, category, description = '', date, applyDiscount = false) {
        if (!this.activeBudget) return false;
        
        let actualAmount = parseFloat(amount);
        let savedAmount = 0;
        let fullAmount = actualAmount;
        
        if (category === 'lrt' && applyDiscount) {
            savedAmount = actualAmount * 0.5;
            actualAmount = actualAmount * 0.5;
            
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
        
        if (!this.activeBudget.categories[category]) {
            this.activeBudget.categories[category] = { spent: 0, count: 0 };
        }
        
        this.activeBudget.categories[category].spent += actualAmount;
        this.activeBudget.categories[category].count += 1;
        this.activeBudget.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return transaction;
    }

    updateExpense(transactionId, updates) {
        if (!this.activeBudget) return false;
        
        const transactionIndex = this.activeBudget.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) return false;
        
        const oldTransaction = this.activeBudget.transactions[transactionIndex];
        
        // Remove old amount
        if (this.activeBudget.categories[oldTransaction.category]) {
            this.activeBudget.categories[oldTransaction.category].spent -= oldTransaction.amount;
            this.activeBudget.categories[oldTransaction.category].count -= 1;
        }
        
        // Remove LRT savings
        if (oldTransaction.category === 'lrt' && oldTransaction.savedAmount) {
            this.activeBudget.categories.lrt.saved -= oldTransaction.savedAmount;
            this.activeBudget.categories.lrt.trips -= 1;
        }
        
        // Prepare new transaction
        let actualAmount = parseFloat(updates.amount);
        let savedAmount = 0;
        let fullAmount = actualAmount;
        
        if (updates.category === 'lrt' && updates.applyDiscount) {
            savedAmount = actualAmount * 0.5;
            actualAmount = actualAmount * 0.5;
            
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
        
        // Add new amount
        if (!this.activeBudget.categories[updates.category]) {
            this.activeBudget.categories[updates.category] = { spent: 0, count: 0 };
        }
        this.activeBudget.categories[updates.category].spent += actualAmount;
        this.activeBudget.categories[updates.category].count += 1;
        
        this.activeBudget.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return this.activeBudget.transactions[transactionIndex];
    }

    deleteTransaction(transactionId) {
        if (!this.activeBudget) return false;
        
        const transactionIndex = this.activeBudget.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) return false;
        
        const transaction = this.activeBudget.transactions[transactionIndex];
        
        // Remove from category
        if (this.activeBudget.categories[transaction.category]) {
            this.activeBudget.categories[transaction.category].spent -= transaction.amount;
            this.activeBudget.categories[transaction.category].count -= 1;
        }
        
        // Remove LRT tracking
        if (transaction.category === 'lrt' && transaction.savedAmount) {
            this.activeBudget.categories.lrt.saved -= transaction.savedAmount;
            this.activeBudget.categories.lrt.trips -= 1;
        }
        
        this.activeBudget.transactions.splice(transactionIndex, 1);
        this.activeBudget.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    getTotalSpent() {
        if (!this.activeBudget) return 0;
        
        return Object.values(this.activeBudget.categories)
            .filter(cat => cat.spent && cat.category !== 'added_money')
            .reduce((sum, cat) => sum + (cat.spent || 0), 0);
    }

    getBudgetSummary() {
        if (!this.activeBudget) return null;
        
        const totalSpent = this.getTotalSpent();
        const remaining = this.activeBudget.totalBudget - totalSpent;
        const percentage = (totalSpent / this.activeBudget.totalBudget) * 100;
        
        return {
            totalBudget: this.activeBudget.totalBudget,
            totalSpent,
            remaining,
            percentage: Math.min(100, percentage),
            addedMoney: this.activeBudget.addedMoney || 0
        };
    }

    getCategoryBreakdown() {
        if (!this.activeBudget) return [];
        
        const totalSpent = this.getTotalSpent();
        const categories = Object.entries(this.activeBudget.categories)
            .filter(([name]) => name !== 'added_money')
            .map(([name, data]) => ({
                name,
                spent: data.spent || 0,
                count: data.count || 0,
                percentage: totalSpent > 0 ? ((data.spent || 0) / totalSpent * 100) : 0
            }))
            .filter(cat => cat.spent > 0)
            .sort((a, b) => b.spent - a.spent);
        
        return categories;
    }

    getBiggestExpense() {
        const categories = this.getCategoryBreakdown();
        if (categories.length === 0) return null;
        
        return categories[0];
    }

    getDailySpending(date) {
        if (!this.activeBudget) return { total: 0, transactions: [] };
        
        const dailyTransactions = this.activeBudget.transactions
            .filter(t => t.date === date && t.type === 'expense');
        
        const total = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
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

    getAllTransactions(filters = {}) {
        if (!this.activeBudget) return [];
        
        let transactions = [...this.activeBudget.transactions];
        
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

    getRecentTransactions(limit = 5) {
        if (!this.activeBudget) return [];
        
        return [...this.activeBudget.transactions]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    checkBudgetExpiry() {
        if (!this.activeBudget) return false;
        
        const today = new Date().toISOString().split('T')[0];
        return today > this.activeBudget.endDate;
    }

    getArchiveStats() {
        const totalSaved = this.archive.reduce((sum, budget) => sum + (budget.savings || 0), 0);
        const totalBudgets = this.archive.length;
        const avgSavings = totalBudgets > 0 ? totalSaved / totalBudgets : 0;
        
        const completed = this.archive.filter(b => b.status === 'completed').length;
        const incomplete = this.archive.filter(b => b.status === 'incomplete').length;
        
        return {
            totalSaved,
            totalBudgets,
            avgSavings,
            completed,
            incomplete
        };
    }

    getSpendingReport() {
        if (!this.activeBudget) return null;
        
        const summary = this.getBudgetSummary();
        const categories = this.getCategoryBreakdown();
        const biggestExpense = this.getBiggestExpense();
        const lrtSavings = this.activeBudget.categories.lrt?.saved || 0;
        
        return {
            budgetName: this.activeBudget.name,
            period: `${this.activeBudget.startDate} to ${this.activeBudget.endDate}`,
            summary,
            categories,
            biggestExpense,
            lrtSavings,
            transactions: this.getAllTransactions(),
            daysActive: this.getDaysActive(),
            createdAt: this.activeBudget.createdAt
        };
    }

    getCurrentBudgetInfo() {
        if (!this.activeBudget) return null;
        
        const summary = this.getBudgetSummary();
        const totalTransactions = this.activeBudget.transactions?.length || 0;
        const categories = this.getCategoryBreakdown();
        
        return {
            name: this.activeBudget.name,
            startDate: this.activeBudget.startDate,
            endDate: this.activeBudget.endDate,
            totalBudget: summary.totalBudget,
            totalSpent: summary.totalSpent,
            remaining: summary.remaining,
            addedMoney: summary.addedMoney,
            totalTransactions,
            daysActive: this.getDaysActive(),
            categoryCount: categories.length
        };
    }

    getDaysActive() {
        if (!this.activeBudget) return 0;
        
        const start = new Date(this.activeBudget.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Storage methods
    saveToStorage() {
        try {
            localStorage.setItem('budgetData', JSON.stringify({
                activeBudget: this.activeBudget,
                archive: this.archive,
                version: '2.1',
                lastUpdated: new Date().toISOString()
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
                
                // Initialize missing categories
                if (this.activeBudget) {
                    const requiredCategories = ['transportation', 'food', 'lrt', 'drinks', 'others', 'added_money'];
                    requiredCategories.forEach(cat => {
                        if (!this.activeBudget.categories[cat]) {
                            this.activeBudget.categories[cat] = { spent: 0, count: 0 };
                        }
                        if (cat === 'lrt') {
                            this.activeBudget.categories.lrt.saved = this.activeBudget.categories.lrt.saved || 0;
                            this.activeBudget.categories.lrt.trips = this.activeBudget.categories.lrt.trips || 0;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.activeBudget = null;
            this.archive = [];
        }
    }

    exportData() {
        return JSON.stringify({
            activeBudget: this.activeBudget,
            archive: this.archive,
            exportDate: new Date().toISOString(),
            version: '2.1',
            app: 'Budget Tracker Mobile'
        }, null, 2);
    }

    importData(data) {
        try {
            const parsed = JSON.parse(data);
            
            if (!parsed.activeBudget && !parsed.archive) {
                throw new Error('Invalid data format');
            }
            
            this.activeBudget = null;
            this.archive = [];
            
            this.activeBudget = parsed.activeBudget;
            this.archive = parsed.archive || [];
            
            // Ensure categories structure
            if (this.activeBudget) {
                const requiredCategories = ['transportation', 'food', 'lrt', 'drinks', 'others', 'added_money'];
                requiredCategories.forEach(cat => {
                    if (!this.activeBudget.categories[cat]) {
                        this.activeBudget.categories[cat] = { spent: 0, count: 0 };
                    }
                });
            }
            
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
}