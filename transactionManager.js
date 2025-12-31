class TransactionManager {
    constructor() {
        // This class handles transaction display formatting
    }

    formatCurrency(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '₱0.00';
        return `₱${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    getCategoryIcon(category) {
        const icons = {
            transportation: '🚗',
            food: '🍔',
            lrt: '🚆',
            drinks: '🥤',
            others: '📦',
            added_money: '💰'
        };
        return icons[category] || '💳';
    }

    getCategoryName(category) {
        const names = {
            transportation: 'Transport',
            food: 'Food',
            lrt: 'LRT Fare',
            drinks: 'Drinks',
            others: 'Others',
            added_money: 'Added Money'
        };
        return names[category] || category;
    }

    getCategoryColor(category) {
        const colors = {
            transportation: '#4361ee',
            food: '#4cc9f0',
            lrt: '#7209b7',
            drinks: '#f72585',
            others: '#f8961e',
            added_money: '#38b000'
        };
        return colors[category] || '#6c757d';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        return date.toLocaleDateString('en-PH', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    createTransactionElement(transaction, showActions = false) {
        const isExpense = transaction.type === 'expense';
        const icon = this.getCategoryIcon(transaction.category);
        const amount = this.formatCurrency(transaction.amount);
        const date = this.formatDate(transaction.date);
        const category = this.getCategoryName(transaction.category);
        const color = this.getCategoryColor(transaction.category);
        
        let description = transaction.description || category;
        if (transaction.category === 'lrt' && transaction.savedAmount > 0) {
            description += ` (Saved ${this.formatCurrency(transaction.savedAmount)})`;
        }
        
        return `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-icon ${isExpense ? 'expense' : 'income'}" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div class="transaction-details">
                        <h4>${description}</h4>
                        <span class="transaction-date">${date} • ${category}</span>
                    </div>
                </div>
                <div class="transaction-amount ${isExpense ? 'negative' : 'positive'}">
                    ${isExpense ? '-' : '+'}${amount}
                </div>
                ${showActions ? `
                    <div class="transaction-actions">
                        <button class="icon-btn small edit-btn" data-id="${transaction.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createDailySummary(dailyData) {
        if (!dailyData || dailyData.transactions.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-coins"></i>
                    <p>No spending recorded</p>
                </div>
            `;
        }
        
        let html = `
            <div class="daily-total">
                <h4>Total: ${this.formatCurrency(dailyData.total)}</h4>
            </div>
        `;
        
        // Group by category for summary
        const categories = {};
        dailyData.transactions.forEach(t => {
            const cat = this.getCategoryName(t.category);
            categories[cat] = (categories[cat] || 0) + t.amount;
        });
        
        html += '<div class="daily-categories">';
        Object.entries(categories).forEach(([cat, amount]) => {
            html += `
                <div class="daily-item">
                    <div class="daily-category">
                        <i class="fas fa-circle" style="color: ${this.getCategoryColor(this.getCategoryKeyByName(cat))};"></i>
                        <span>${cat}</span>
                    </div>
                    <span class="negative">${this.formatCurrency(amount)}</span>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }

    getCategoryKeyByName(name) {
        const map = {
            'Transport': 'transportation',
            'Food': 'food',
            'LRT Fare': 'lrt',
            'Drinks': 'drinks',
            'Others': 'others',
            'Added Money': 'added_money'
        };
        return map[name] || name.toLowerCase();
    }

    createArchiveItem(budget) {
        const startDate = this.formatDate(budget.startDate);
        const endDate = budget.endDate ? this.formatDate(budget.endDate) : 'Present';
        const totalBudget = this.formatCurrency(budget.totalBudget);
        const totalSpent = this.formatCurrency(budget.totalSpent || 0);
        const savings = budget.savings ? this.formatCurrency(budget.savings) : this.formatCurrency(0);
        const status = budget.status === 'completed' ? 'Completed' : 'Incomplete';
        const transactions = budget.transactions?.length || 0;
        const statusClass = budget.status === 'completed' ? 'success' : 'warning';
        
        return `
            <div class="archive-item" data-id="${budget.id}">
                <div class="archive-header">
                    <h4>${budget.name}</h4>
                    <span class="status-badge ${statusClass}">${status}</span>
                </div>
                <div class="archive-dates">${startDate} - ${endDate}</div>
                <div class="archive-numbers">
                    <div>
                        <span class="label">Budget:</span>
                        <span class="value">${totalBudget}</span>
                    </div>
                    <div>
                        <span class="label">Spent:</span>
                        <span class="value">${totalSpent}</span>
                    </div>
                    <div>
                        <span class="label">Transactions:</span>
                        <span class="value">${transactions}</span>
                    </div>
                    <div>
                        <span class="label">Saved:</span>
                        <span class="value positive">${savings}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createReportHTML(reportData, reportType) {
        if (!reportData) {
            return '<p>No data available for report</p>';
        }
        
        let html = '<div class="print-report">';
        
        switch (reportType) {
            case 'spending':
                html += this.createSpendingReport(reportData);
                break;
            case 'category':
                html += this.createCategoryReport(reportData);
                break;
            case 'savings':
                html += this.createSavingsReport(reportData);
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
                <h2>${reportData.budgetName || 'Spending Report'}</h2>
                <p>${reportData.period || ''}</p>
                <p>Generated on ${this.formatDateTime(new Date())}</p>
            </div>
            
            <div class="print-summary">
                <h3>Summary</h3>
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
                        <h4>Spending Progress</h4>
                        <p>${reportData.summary?.percentage?.toFixed(1) || 0}%</p>
                    </div>
                </div>
            </div>
            
            ${reportData.categories && reportData.categories.length > 0 ? `
                <div class="print-section">
                    <h3>Category Breakdown</h3>
                    <div class="print-categories">
                        ${reportData.categories.map(cat => `
                            <div class="print-category">
                                <span>${this.getCategoryName(cat.name)}</span>
                                <span>${this.formatCurrency(cat.spent)}</span>
                                <span>${cat.percentage?.toFixed(1) || 0}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${reportData.lrtSavings > 0 ? `
                <div class="print-section">
                    <h3>LRT Savings</h3>
                    <p>Total saved from student discount: ${this.formatCurrency(reportData.lrtSavings)}</p>
                </div>
            ` : ''}
        `;
    }

    createCategoryReport(reportData) {
        if (!reportData.categories || reportData.categories.length === 0) {
            return '<p>No category data available</p>';
        }
        
        return `
            <div class="print-header">
                <h2>Category Report</h2>
                <p>${reportData.budgetName || ''}</p>
            </div>
            
            <div class="print-section">
                <h3>Spending by Category</h3>
                <div class="print-categories detailed">
                    ${reportData.categories.map(cat => `
                        <div class="print-category-item">
                            <div class="category-header">
                                <span>${this.getCategoryIcon(cat.name)} ${this.getCategoryName(cat.name)}</span>
                                <span>${this.formatCurrency(cat.spent)}</span>
                            </div>
                            <div class="category-details">
                                <span>${cat.count} transaction${cat.count !== 1 ? 's' : ''}</span>
                                <span>${cat.percentage?.toFixed(1) || 0}% of total</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createSavingsReport(reportData) {
        const remaining = reportData.summary?.remaining || 0;
        const totalBudget = reportData.summary?.totalBudget || 1;
        const savingsRate = ((remaining / totalBudget) * 100).toFixed(1);
        const lrtSavings = reportData.lrtSavings || 0;
        const totalSavings = remaining + lrtSavings;
        
        return `
            <div class="print-header">
                <h2>Savings Report</h2>
                <p>${reportData.budgetName || ''}</p>
            </div>
            
            <div class="print-section">
                <h3>Savings Summary</h3>
                <div class="print-stats">
                    <div class="print-stat highlight">
                        <h4>Total Savings</h4>
                        <p>${this.formatCurrency(totalSavings)}</p>
                    </div>
                    <div class="print-stat">
                        <h4>Remaining Budget</h4>
                        <p>${this.formatCurrency(remaining)}</p>
                    </div>
                    <div class="print-stat">
                        <h4>LRT Discount Savings</h4>
                        <p>${this.formatCurrency(lrtSavings)}</p>
                    </div>
                    <div class="print-stat">
                        <h4>Savings Rate</h4>
                        <p>${savingsRate}%</p>
                    </div>
                </div>
            </div>
            
            <div class="print-section">
                <h3>Savings Analysis</h3>
                <p>You have saved <strong>${this.formatCurrency(totalSavings)}</strong> in total.</p>
                ${remaining > 0 ? `
                    <p>You still have <strong>${this.formatCurrency(remaining)}</strong> left in your budget.</p>
                ` : `
                    <p>You have spent your entire budget. Consider creating a new budget.</p>
                `}
            </div>
        `;
    }

    createFullReport(reportData) {
        return `
            <div class="print-header">
                <h2>Complete Budget Report</h2>
                <p>${reportData.budgetName || ''}</p>
                <p>${reportData.period || ''} • ${reportData.daysActive || 0} days active</p>
            </div>
            
            <div class="print-section">
                <h3>Executive Summary</h3>
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
            </div>
            
            ${reportData.categories && reportData.categories.length > 0 ? `
                <div class="print-section">
                    <h3>Category Analysis</h3>
                    <div class="print-categories">
                        ${reportData.categories.map(cat => `
                            <div class="print-category">
                                <span>${this.getCategoryIcon(cat.name)} ${this.getCategoryName(cat.name)}</span>
                                <span>${this.formatCurrency(cat.spent)}</span>
                                <span>${cat.percentage?.toFixed(1)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${reportData.transactions && reportData.transactions.length > 0 ? `
                <div class="print-section">
                    <h3>Transaction History (${reportData.transactions.length} transactions)</h3>
                    <div class="print-transactions">
                        ${reportData.transactions.slice(0, 20).map(t => `
                            <div class="print-transaction">
                                <span>${this.formatDate(t.date)}</span>
                                <span>${this.getCategoryName(t.category)}</span>
                                <span>${t.description || ''}</span>
                                <span class="${t.type === 'expense' ? 'negative' : 'positive'}">
                                    ${t.type === 'expense' ? '-' : '+'}${this.formatCurrency(t.amount)}
                                </span>
                            </div>
                        `).join('')}
                        ${reportData.transactions.length > 20 ? `
                            <p>... and ${reportData.transactions.length - 20} more transactions</p>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            <div class="print-footer">
                <p>Report generated on ${this.formatDateTime(new Date())}</p>
                <p>Budget Tracker Mobile App</p>
            </div>
        `;
    }
}