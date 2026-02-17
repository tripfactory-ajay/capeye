/**
 * CAPEYE CORE SYSTEM
 * Shared functionality for all pages
 */

const Capeye = {
    // Configuration
    config: {
        sessionKey: 'capeye_session',
        dataKey: 'capeye_vehicles',
        refreshInterval: 30000
    },

    // Initialize page
    init: function() {
        this.checkAuth();
        this.initNavigation();
        this.loadHeader();
        this.startAutoRefresh();
    },

    // Check authentication
    checkAuth: function() {
        const session = localStorage.getItem(this.config.sessionKey);
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (!session && !isLoginPage) {
            window.location.replace('./login.html');
            return false;
        }
        
        if (session && isLoginPage) {
            window.location.replace('./index.html');
            return false;
        }
        
        return true;
    },

    // Initialize navigation active state
    initNavigation: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.cy-nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Load header with user info
    loadHeader: function() {
        const session = JSON.parse(localStorage.getItem(this.config.sessionKey) || '{}');
        if (session.username) {
            const userElements = document.querySelectorAll('[data-cy-user]');
            userElements.forEach(el => {
                el.textContent = session.username;
            });
        }
    },

    // Auto refresh data
    startAutoRefresh: function() {
        setInterval(() => {
            if (typeof window.refreshData === 'function') {
                window.refreshData();
            }
        }, this.config.refreshInterval);
    },

    // Utility: Format currency
    formatCurrency: function(value) {
        return '£' + parseFloat(value || 0).toLocaleString('en-GB', {
            maximumFractionDigits: 0
        });
    },

    // Utility: Format date
    formatDate: function(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    },

    // Utility: Calculate days between dates
    daysBetween: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = date2 ? new Date(date2) : new Date();
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    // Get filtered vehicles based on current filters
    getFilteredVehicles: function() {
        let vehicles = JSON.parse(localStorage.getItem(this.config.dataKey) || '[]');
        
        // Get filter values if they exist
        const dateFrom = document.getElementById('filter-date-from')?.value;
        const dateTo = document.getElementById('filter-date-to')?.value;
        const make = document.getElementById('filter-make')?.value;
        const status = document.getElementById('filter-status')?.value;
        const location = document.getElementById('filter-location')?.value;
        const reg = document.getElementById('filter-reg')?.value?.toUpperCase();
        
        return vehicles.filter(v => {
            if (make && v.make !== make) return false;
            if (status && v.status !== status) return false;
            if (location && v.location !== location) return false;
            if (reg && !v.registration?.toUpperCase().includes(reg)) return false;
            if (dateFrom && v.dateInStock && new Date(v.dateInStock) < new Date(dateFrom)) return false;
            if (dateTo && v.dateInStock && new Date(v.dateInStock) > new Date(dateTo)) return false;
            return true;
        });
    },

    // Load filter options
    loadFilters: function() {
        const vehicles = JSON.parse(localStorage.getItem(this.config.dataKey) || '[]');
        
        // Populate makes
        const makeSelect = document.getElementById('filter-make');
        if (makeSelect) {
            const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))].sort();
            makes.forEach(make => {
                if (!makeSelect.querySelector(`option[value="${make}"]`)) {
                    const opt = document.createElement('option');
                    opt.value = make;
                    opt.textContent = make;
                    makeSelect.appendChild(opt);
                }
            });
        }
        
        // Populate locations
        const locSelect = document.getElementById('filter-location');
        if (locSelect) {
            const locations = [...new Set(vehicles.map(v => v.location).filter(Boolean))].sort();
            locations.forEach(loc => {
                if (!locSelect.querySelector(`option[value="${loc}"]`)) {
                    const opt = document.createElement('option');
                    opt.value = loc;
                    opt.textContent = loc;
                    locSelect.appendChild(opt);
                }
            });
        }
    },

    // Reset filters
    resetFilters: function() {
        ['filter-date-from', 'filter-date-to', 'filter-make', 'filter-status', 'filter-location', 'filter-reg'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
    },

    // Logout
    logout: function() {
        localStorage.removeItem(this.config.sessionKey);
        window.location.replace('./login.html');
    },

    // Stage name mapping
    stageNames: {
        1: 'intake', 2: 'bodywork', 3: 'paint', 4: 'legal', 
        5: 'mechanical', 6: 'external', 7: 'valeting', 8: 'faults', 
        9: 'advertising', 10: 'delivery', 11: 'accounts', 12: 'management'
    },

    getStageFileName: function(stageId) {
        return this.stageNames[stageId] || 'stage';
    },

    // Show notification
    notify: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cy-alert cy-alert-${type} fixed top-20 right-4 z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="cy-alert-icon" style="background: ${type === 'success' ? 'var(--cy-accent-green-soft)' : type === 'warning' ? 'var(--cy-accent-orange-soft)' : 'var(--cy-accent-blue-soft)'}; color: ${type === 'success' ? 'var(--cy-accent-green)' : type === 'warning' ? 'var(--cy-accent-orange)' : 'var(--cy-accent-blue)'};">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}"></i>
            </div>
            <div class="cy-alert-content">
                <div class="cy-alert-text">${message}</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Capeye.init();
});

// Make available globally
window.Capeye = Capeye;
window.logout = () => Capeye.logout();
window.resetFilters = () => Capeye.resetFilters();
