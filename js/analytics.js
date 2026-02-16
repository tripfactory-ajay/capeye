// CAPEYE Analytics Module
document.addEventListener('DOMContentLoaded', function() {
    CapeyeData.loadFromStorage();
    initAnalyticsCharts();
});

function initAnalyticsCharts() {
    // Aging Chart
    const agingCtx = document.getElementById('agingChart');
    if (agingCtx) {
        new Chart(agingCtx, {
            type: 'bar',
            data: {
                labels: ['0-30 days', '31-60 days', '61-90 days', '91-120 days', '120+ days'],
                datasets: [{
                    label: 'Current Stock',
                    data: [142, 89, 34, 12, 7],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7c2d12'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
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
    }

    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Units Sold',
                    data: [45, 52, 48, 61, 55, 67],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target',
                    data: [50, 50, 55, 55, 60, 60],
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                },
                scales: {
                    y: {
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
    }

    // Margin Chart
    const marginCtx = document.getElementById('marginChart');
    if (marginCtx) {
        new Chart(marginCtx, {
            type: 'bar',
            data: {
                labels: ['Ford', 'Mercedes', 'VW', 'Vauxhall', 'Peugeot'],
                datasets: [{
                    label: 'Margin %',
                    data: [18.5, 15.2, 16.8, 19.2, 17.5],
                    backgroundColor: '#8b5cf6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // Department Chart
    const deptCtx = document.getElementById('deptChart');
    if (deptCtx) {
        new Chart(deptCtx, {
            type: 'doughnut',
            data: {
                labels: ['Intake', 'Workshop', 'Valeting', 'Sales', 'Accounts'],
                datasets: [{
                    data: [2, 5, 1, 3, 1],
                    backgroundColor: ['#3b82f6', '#ef4444', '#06b6d4', '#10b981', '#f59e0b'],
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
                    }
                }
            }
        });
    }
}
