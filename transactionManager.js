class TransactionManager {
    constructor() {
        // Remove budgetManager dependency
    }

    // Format currency
    formatCurrency(amount) {
        return `₱${parseFloat(amount).toFixed(2)}`;
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            transportation: '🚗',
            food: '🍔',
            lrt: '🚆',
            drinks: '🥤',
            others: '📦',
            added_money: '💰'
        };
        return icons[category] || '📝';
    }

    // Get category name
    getCategoryName(category) {
        const names = {
            transportation: 'Transportation',
            food: 'Food',
            lrt: 'LRT Fare',
            drinks: 'Drinks',
            others: 'Others',
            added_money: 'Added Money'
        };
        return names[category] || category;
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Create transaction HTML element
    createTransactionElement(transaction, showActions = false) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.dataset.id = transaction.id;
        
        const isExpense = transaction.type === 'expense';
        const icon = this.getCategoryIcon(transaction.category);
        const amount = this.formatCurrency(transaction.amount);
        const date = this.formatDate(transaction.date);
        
        // Special handling for LRT with discount
        let description = transaction.description || this.getCategoryName(transaction.category);
        if (transaction.category === 'lrt' && transaction.savedAmount > 0) {
            description += ` (Saved ${this.formatCurrency(transaction.savedAmount)})`;
        }
        
        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <h4>${description}</h4>
                    <span class="transaction-date">${date}</span>
                </div>
            </div>
            <div class="transaction-amount ${isExpense ? 'negative' : 'positive'}">
                ${isExpense ? '-' : '+'}${amount}
            </div>
            ${showActions ? `
                <div class="transaction-actions">
                    <button class="edit-btn" data-id="${transaction.id}">✏️</button>
                    <button class="delete-btn" data-id="${transaction.id}">🗑️</button>
                </div>
            ` : ''}
        `;
        
        return div;
    }

    // Create daily summary HTML
    createDailySummary(dailyData) {
        if (!dailyData || dailyData.transactions.length === 0) {
            return '<p>No expenses for this day.</p>';
        }
        
        let html = `
            <div class="daily-total">
                <h4>Total Spent: ${this.formatCurrency(dailyData.total)}</h4>
            </div>
        `;
        
        if (dailyData.categoryBreakdown && Object.keys(dailyData.categoryBreakdown).length > 0) {
            html += `
                <div class="daily-categories">
                    <h4>By Category:</h4>
            `;
            
            Object.entries(dailyData.categoryBreakdown).forEach(([category, amount]) => {
                html += `
                    <div class="daily-category">
                        <span>${this.getCategoryIcon(category)} ${this.getCategoryName(category)}</span>
                        <span>${this.formatCurrency(amount)}</span>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        html += `
            <div class="daily-transactions">
                <h4>Transactions (${dailyData.transactions.length}):</h4>
        `;
        
        dailyData.transactions.forEach(transaction => {
            const icon = this.getCategoryIcon(transaction.category);
            const description = transaction.description || this.getCategoryName(transaction.category);
            
            html += `
                <div class="daily-transaction">
                    <span>${icon} ${description}</span>
                    <span class="negative">-${this.formatCurrency(transaction.amount)}</span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // Create archive item HTML with status indicator
    createArchiveItem(budget) {
        const div = document.createElement('div');
        div.className = 'archive-item';
        div.dataset.id = budget.id;
        
        const startDate = this.formatDate(budget.startDate);
        const endDate = budget.endDate ? this.formatDate(budget.endDate) : 'Present';
        const totalBudget = this.formatCurrency(budget.totalBudget);
        const totalSpent = this.formatCurrency(budget.totalSpent || 0);
        const savings = budget.savings ? this.formatCurrency(budget.savings) : this.formatCurrency(0);
        const status = budget.status === 'completed' ? '✅ Completed' : '⏸️ Incomplete';
        const transactions = budget.transactions?.length || 0;
        
        div.innerHTML = `
            <h4>${budget.name}</h4>
            <div class="archive-dates">${startDate} - ${endDate}</div>
            <div class="archive-status">${status}</div>
            <div class="archive-stats">
                <div>Budget: ${totalBudget}</div>
                <div>Spent: ${totalSpent}</div>
                <div>Transactions: ${transactions}</div>
                <div class="archive-amount">Saved: ${savings}</div>
            </div>
        `;
        
        return div;
    }

    // Create report HTML
    createReportHTML(reportData, reportType) {
        if (!reportData) {
            return '<p>No data available for report</p>';
        }
        
        let html = `<div class="print-report">`;
        
        switch (reportType) {
            case 'spending':
                html += this.createSpendingReport(reportData);
                break;
            case 'savings':
                html += this.createSavingsReport(reportData);
                break;
            case 'category':
                html += this.createCategoryReport(reportData);
                break;
            case 'full':
                html += this.createFullReport(reportData);
                break;
            default:
                html += '<p>Select a report type</p>';
        }
        
        html += '</div>';
        return html;
    }

    createSpendingReport(reportData) {
        return `
            <div class="print-header">
                <h2>${reportData.budgetName || 'Budget Report'}</h2>
                <p>${reportData.period || ''}</p>
            </div>
            <div class="print-stats">
                <div class="print-stat">
                    <h4>Total Budget</h4>
                    <p>${this.formatCurrency(reportData.summary?.totalBudget || 0)}</p>
                </div>
                <div class="print-stat">
                    <h4>Total Spent</h4>
                    <p>${this.formatCurrency(reportData.summary?.totalSpent || 0)}</p>
                </div>
                <div class="print-stat">
                    <h4>Remaining</h4>
                    <p>${this.formatCurrency(reportData.summary?.remaining || 0)}</p>
                </div>
                <div class="print-stat">
                    <h4>Added Money</h4>
                    <p>${this.formatCurrency(reportData.summary?.addedMoney || 0)}</p>
                </div>
            </div>
            ${reportData.categories && reportData.categories.length > 0 ? `
                <div class="print-categories">
                    <h3>Category Breakdown</h3>
                    ${reportData.categories.map(cat => `
                        <div class="print-category">
                            <span>${this.getCategoryName(cat.name)}</span>
                            <span>${this.formatCurrency(cat.spent)} (${cat.percentage?.toFixed(1) || 0}%)</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${reportData.biggestExpense ? `
                <div class="print-stat">
                    <h4>Biggest Expense</h4>
                    <p>${this.getCategoryName(reportData.biggestExpense.name)}: ${this.formatCurrency(reportData.biggestExpense.spent)}</p>
                </div>
            ` : ''}
        `;
    }

    createSavingsReport(reportData) {
        const totalBudget = reportData.summary?.totalBudget || 1;
        const remaining = reportData.summary?.remaining || 0;
        const savingsRate = ((remaining / totalBudget) * 100).toFixed(1);
        
        return `
            <div class="print-header">
                <h2>Savings Report</h2>
                <p>${reportData.period || ''}</p>
            </div>
            <div class="print-stats">
                <div class="print-stat">
                    <h4>Total Savings</h4>
                    <p>${this.formatCurrency(remaining)}</p>
                </div>
                <div class="print-stat">
                    <h4>Savings Rate</h4>
                    <p>${savingsRate}%</p>
                </div>
            </div>
        `;
    }

    createCategoryReport(reportData) {
        return `
            <div class="print-header">
                <h2>Category Report</h2>
                <p>${reportData.period || ''}</p>
            </div>
            <div class="print-categories">
                <h3>Spending by Category</h3>
                ${reportData.categories ? reportData.categories.map(cat => `
                    <div class="print-category">
                        <span>${this.getCategoryName(cat.name)}</span>
                        <span>${this.formatCurrency(cat.spent)}</span>
                        <span>${cat.percentage?.toFixed(1) || 0}%</span>
                    </div>
                `).join('') : '<p>No category data</p>'}
            </div>
        `;
    }

    createFullReport(reportData) {
        return `
            <div class="print-header">
                <h2>Complete Budget Report</h2>
                <p>${reportData.period || ''}</p>
            </div>
            <div class="print-stats">
                <div class="print-stat">
                    <h4>Total Budget</h4>
                    <p>${this.formatCurrency(reportData.summary?.totalBudget || 0)}</p>
                </div>
                <div class="print-stat">
                    <h4>Total Spent</h4>
                    <p>${this.formatCurrency(reportData.summary?.totalSpent || 0)}</p>
                </div>
                <div class="print-stat">
                    <h4>Remaining</h4>
                    <p>${this.formatCurrency(reportData.summary?.remaining || 0)}</p>
                </div>
            </div>
            ${reportData.categories && reportData.categories.length > 0 ? `
                <div class="print-categories">
                    <h3>Category Breakdown</h3>
                    ${reportData.categories.map(cat => `
                        <div class="print-category">
                            <span>${this.getCategoryName(cat.name)}</span>
                            <span>${this.formatCurrency(cat.spent)} (${cat.percentage?.toFixed(1) || 0}%)</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${reportData.transactions && reportData.transactions.length > 0 ? `
                <div class="print-transactions">
                    <h3>All Transactions</h3>
                    ${reportData.transactions.map(t => `
                        <div class="print-transaction">
                            <span>${this.formatDate(t.date)}</span>
                            <span>${this.getCategoryName(t.category)}</span>
                            <span>${t.description || ''}</span>
                            <span class="${t.type === 'expense' ? 'negative' : 'positive'}">
                                ${t.type === 'expense' ? '-' : '+'}${this.formatCurrency(t.amount)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
}