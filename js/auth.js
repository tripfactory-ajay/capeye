/**
 * Capeye Authentication Module
 * Handles session management, permissions, and route protection
 */

const Auth = {
    // Session key names
    SESSION_KEY: 'capeye_session',
    TEMP_SESSION_KEY: 'capeye_temp_session',
    
    /**
     * Get current session
     * @returns {Object|null} Session data or null if not logged in
     */
    getSession() {
        const session = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.TEMP_SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getSession() !== null;
    },
    
    /**
     * Get current user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.getSession();
    },
    
    /**
     * Check if user has specific role
     * @param {string|string[]} roles - Role or array of roles to check
     * @returns {boolean}
     */
    hasRole(roles) {
        const session = this.getSession();
        if (!session) return false;
        
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(session.role);
    },
    
    /**
     * Check if user can access specific department
     * @param {string} department 
     * @returns {boolean}
     */
    canAccess(department) {
        const session = this.getSession();
        if (!session) return false;
        
        // Admin and management can access everything
        if (['admin', 'management'].includes(session.role)) return true;
        
        // Check department match
        return session.department === department || session.role === department;
    },
    
    /**
     * Protect page - redirect to login if not authenticated
     * @param {string[]} allowedRoles - Optional array of allowed roles
     */
    protectPage(allowedRoles = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (allowedRoles && !this.hasRole(allowedRoles)) {
            alert('You do not have permission to access this page');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        // Update UI with user info
        this.updateUI();
        return true;
    },
    
    /**
     * Logout user
     * @param {boolean} redirect - Whether to redirect to login page
     */
    logout(redirect = true) {
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.TEMP_SESSION_KEY);
        
        if (redirect) {
            window.location.href = 'login.html';
        }
    },
    
    /**
     * Update UI elements with user info
     */
    updateUI() {
        const session = this.getSession();
        if (!session) return;
        
        // Update user name displays
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => el.textContent = session.name);
        
        // Update user role displays
        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(el => el.textContent = this.formatRole(session.role));
        
        // Show/hide elements based on role
        this.applyPermissions();
    },
    
    /**
     * Apply permission-based visibility
     */
    applyPermissions() {
        const session = this.getSession();
        if (!session) return;
        
        // Elements with data-role attribute
        document.querySelectorAll('[data-role]').forEach(el => {
            const requiredRoles = el.dataset.role.split(',').map(r => r.trim());
            if (!this.hasRole(requiredRoles)) {
                el.style.display = 'none';
            }
        });
        
        // Elements with data-department attribute
        document.querySelectorAll('[data-department]').forEach(el => {
            const requiredDepts = el.dataset.department.split(',').map(d => d.trim());
            if (!requiredDepts.includes(session.department) && !['admin', 'management'].includes(session.role)) {
                el.style.display = 'none';
            }
        });
    },
    
    /**
     * Format role for display
     * @param {string} role 
     * @returns {string}
     */
    formatRole(role) {
        const roleMap = {
            'admin': 'Administrator',
            'sales': 'Sales',
            'workshop': 'Workshop',
            'accounts': 'Accounts',
            'valet': 'Valet',
            'management': 'Management'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    },
    
    /**
     * Get navigation items based on role
     * @returns {Array} Navigation items
     */
    getNavigation() {
        const session = this.getSession();
        if (!session) return [];
        
        const allNav = [
            { id: 'dashboard', label: 'Dashboard', icon: 'home', url: 'dashboard.html', roles: ['admin', 'management', 'sales', 'workshop', 'accounts', 'valet'] },
            { id: 'inventory', label: 'Inventory', icon: 'truck', url: 'inventory.html', roles: ['admin', 'management', 'sales'] },
            { id: 'workflow', label: 'Workflow', icon: 'cogs', url: 'workflow.html', roles: ['admin', 'management', 'workshop', 'sales'] },
            { id: 'analytics', label: 'Analytics', icon: 'chart-bar', url: 'analytics.html', roles: ['admin', 'management', 'accounts'] },
            { id: 'staff', label: 'Staff', icon: 'users', url: 'staff.html', roles: ['admin', 'management'] },
            { id: 'accounts', label: 'Accounts', icon: 'pound-sign', url: 'accounts.html', roles: ['admin', 'management', 'accounts'] },
            { id: 'valet', label: 'Valet', icon: 'spray-can', url: 'valet.html', roles: ['admin', 'management', 'valet'] },
            { id: 'alerts', label: 'Alerts', icon: 'bell', url: 'alerts.html', roles: ['admin', 'management', 'sales', 'workshop'] },
            { id: 'import', label: 'Import Data', icon: 'file-upload', url: 'import.html', roles: ['admin', 'management'] },
            { id: 'reference', label: 'Reference Data', icon: 'database', url: 'reference-import.html', roles: ['admin', 'management'] }
        ];
        
        return allNav.filter(item => this.hasRole(item.roles));
    },
    
    /**
     * Initialize auth on page load
     * Call this on every protected page
     */
    init() {
        // Add logout handler to logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
        
        // Protect page
        this.protectPage();
    }
};

// Auto-initialize on non-login pages
if (!window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
}
