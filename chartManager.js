class ChartManager {
    constructor() {
        this.chart = null;
        this.colors = {
            transportation: '#4361ee',
            food: '#4cc9f0',
            lrt: '#7209b7',
            drinks: '#f72585',
            others: '#f8961e',
            added_money: '#38b000'
        };
    }

    initializeChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Clear any existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [100],
                    backgroundColor: ['#e9ecef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 37, 41, 0.9)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ₱${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
        
        // Initialize empty legend
        this.updateChartLegend([]);
    }

    updateChart(categoryBreakdown) {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }
        
        if (!categoryBreakdown || categoryBreakdown.length === 0) {
            this.chart.data.labels = ['No Expenses'];
            this.chart.data.datasets[0].data = [100];
            this.chart.data.datasets[0].backgroundColor = ['#e9ecef'];
            this.chart.update('none');
            this.updateChartLegend([]);
            return;
        }
        
        // Sort by amount (descending)
        const sortedData = [...categoryBreakdown].sort((a, b) => b.spent - a.spent);
        
        const labels = sortedData.map(cat => {
            const names = {
                transportation: 'Transport',
                food: 'Food',
                lrt: 'LRT',
                drinks: 'Drinks',
                others: 'Others'
            };
            return names[cat.name] || cat.name;
        });
        
        const data = sortedData.map(cat => cat.spent);
        const backgroundColors = sortedData.map(cat => this.colors[cat.name] || '#6c757d');
        
        // Update chart
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].backgroundColor = backgroundColors;
        this.chart.update();
        
        // Update legend
        this.updateChartLegend(sortedData);
    }

    updateChartLegend(categoryBreakdown) {
        const legendContainer = document.getElementById('chartLegend');
        if (!legendContainer) return;
        
        if (categoryBreakdown.length === 0) {
            legendContainer.innerHTML = '<div class="empty-state"><p>No spending data</p></div>';
            return;
        }
        
        let html = '';
        categoryBreakdown.forEach((cat, index) => {
            const name = this.getCategoryDisplayName(cat.name);
            const percentage = cat.percentage?.toFixed(1) || 0;
            const color = this.colors[cat.name] || '#6c757d';
            
            html += `
                <div class="legend-item" data-category="${cat.name}">
                    <div class="legend-color" style="background: ${color}"></div>
                    <span class="legend-name">${name}</span>
                    <span class="legend-percentage">${percentage}%</span>
                </div>
            `;
        });
        
        legendContainer.innerHTML = html;
        
        // Add click events to legend items
        legendContainer.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.highlightCategory(category);
            });
        });
    }

    getCategoryDisplayName(category) {
        const names = {
            transportation: 'Transport',
            food: 'Food',
            lrt: 'LRT',
            drinks: 'Drinks',
            others: 'Others'
        };
        return names[category] || category;
    }

    highlightCategory(category) {
        if (!this.chart) return;
        
        const meta = this.chart.getDatasetMeta(0);
        const index = this.chart.data.labels.findIndex(label => 
            label.toLowerCase().includes(category.toLowerCase())
        );
        
        if (index === -1) return;
        
        // Toggle highlight
        meta.data.forEach((arc, i) => {
            if (i === index) {
                arc.hidden = !arc.hidden;
            }
        });
        
        this.chart.update();
    }

    createProgressBar(percentage) {
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, percentage)}%"></div>
                </div>
                <div class="progress-text">${percentage.toFixed(1)}% spent</div>
            </div>
        `;
    }

    createCategoryInsights(categoryBreakdown) {
        if (!categoryBreakdown || categoryBreakdown.length === 0) {
            return '<p>No spending insights available.</p>';
        }
        
        const sorted = [...categoryBreakdown].sort((a, b) => b.spent - a.spent);
        const biggest = sorted[0];
        const total = sorted.reduce((sum, cat) => sum + cat.spent, 0);
        
        let html = `
            <div class="insights-card">
                <h4>💰 Spending Insights</h4>
                <div class="insight-item">
                    <span>Biggest Expense:</span>
                    <span class="insight-value">${this.getCategoryDisplayName(biggest.name)} (${biggest.percentage.toFixed(1)}%)</span>
                </div>
                <div class="insight-item">
                    <span>Total Categories:</span>
                    <span class="insight-value">${sorted.length}</span>
                </div>
                <div class="insight-item">
                    <span>Average per Category:</span>
                    <span class="insight-value">₱${(total / sorted.length).toFixed(2)}</span>
                </div>
            </div>
        `;
        
        return html;
    }

    exportChartAsImage() {
        if (!this.chart) return null;
        return this.chart.toBase64Image();
    }

    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}