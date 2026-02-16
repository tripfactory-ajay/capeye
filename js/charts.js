// CAPEYE Charts Module
// Handles all Chart.js visualizations

const CapeyeCharts = {
    instances: {},

    // Initialize all charts on dashboard
    initDashboard() {
        this.initMakeChart();
        this.initLocationChart();
    },

    // Stock by Manufacturer Chart
    initMakeChart() {
        const ctx = document.getElementById('makeChart');
        if (!ctx) return;

        const makeData = CapeyeData.getStockByMake();
        
        this.instances.makeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(makeData),
                datasets: [{
                    data: Object.values(makeData),
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { 
                            color: '#94a3b8',
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Stock by Location Chart
    initLocationChart() {
        const ctx = document.getElementById('locationChart');
        if (!ctx) return;

        const locationData = CapeyeData.getStockByLocation();
        
        this.instances.locationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationData),
                datasets: [{
                    label: 'Vehicles',
                    data: Object.values(locationData),
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 },
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    },

    // Aging Analysis Chart
    initAgingChart() {
        const ctx = document.getElementById('agingChart');
        if (!ctx) return;

        // Calculate aging buckets
        const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        CapeyeData.inventory.forEach(v => {
            const days = CapeyeData.getDaysInStock(v.regDate);
            if (days <= 30) aging['0-30']++;
            else if (days <= 60) aging['31-60']++;
            else if (days <= 90) aging['61-90']++;
            else aging['90+']++;
        });

        this.instances.agingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(aging),
                datasets: [{
                    label: 'Vehicles',
                    data: Object.values(aging),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    },

    // Cost Analysis Chart
    initCostChart() {
        const ctx = document.getElementById('costChart');
        if (!ctx) return;

        // Calculate cost breakdown
        const totalCost = CapeyeData.inventory.reduce((sum, v) => sum + (v.cost || 0), 0);
        const totalValue = CapeyeData.inventory.reduce((sum, v) => sum + (v.price || 0), 0);
        const margin = totalValue - totalCost;

        this.instances.costChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Purchase Cost', 'Gross Margin'],
                datasets: [{
                    data: [totalCost, margin],
                    backgroundColor: ['#3b82f6', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed || 0;
                                return `£${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Update all charts with new data
    updateAll() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.initDashboard();
    }
};
