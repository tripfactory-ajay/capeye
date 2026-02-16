/**
 * Capeye Authentication Module
 */

const Auth = {
    // Demo users - in production, this would be server-side
    users: {
        'admin': { password: 'admin123', name: 'Administrator', role: 'admin', department: 'Management' },
        'sales': { password: 'sales123', name: 'Sales User', role: 'sales', department: 'Sales' },
        'workshop': { password: 'workshop123', name: 'Workshop User', role: 'workshop', department: 'Workshop' },
        'keith': { password: 'keith123', name: 'Keith Hardy', role: 'management', department: 'Management' },
        'ibrahim': { password: 'ibrahim123', name: 'Ibrahim Ata', role: 'sales', department: 'Sales' },
        'CapEye': { password: 'Ajay', name: 'Ajay Kawa', role: 'admin', department: 'Management' }
    },
    
    SESSION_KEY: 'capeye_session',
    
    /**
     * Login user
     */
    login(username, password) {
        const user = this.users[username.toLowerCase()];
        if (user && user.password === password) {
            const session = {
                username: username.toLowerCase(),
                name: user.name,
                role: user.role,
                department: user.department,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return true;
        }
        return false;
    },
    
    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            const data = JSON.parse(session);
            // Check if session is not expired (24 hours)
            const loginTime = new Date(data.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            if (hoursDiff < 24) {
                return true;
            }
            localStorage.removeItem(this.SESSION_KEY);
        }
        return false;
    },
    
    /**
     * Get current user
     */
    getCurrentUser() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    /**
     * Update UI with user info
     */
    updateUI() {
        const user = this.getCurrentUser();
        if (user) {
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = user.name;
            });
            document.querySelectorAll('.user-role').forEach(el => {
                el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            });
        }
    },
    
    /**
     * Protect page - redirect to login if not authenticated
     */
    protectPage(allowedRoles = []) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (allowedRoles.length > 0) {
            const user = this.getCurrentUser();
            if (!allowedRoles.includes(user.role)) {
                alert('You do not have permission to access this page');
                window.location.href = 'index.html';
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Get navigation items based on role
     */
    getNavigation() {
        const user = this.getCurrentUser();
        const allNav = [
            { label: 'Dashboard', url: 'index.html', icon: 'home', roles: ['admin', 'sales', 'workshop', 'management'] },
            { label: 'Inventory', url: 'inventory.html', icon: 'truck', roles: ['admin', 'sales', 'management'] },
            { label: 'Workflow', url: 'workflow.html', icon: 'cogs', roles: ['admin', 'workshop', 'sales', 'management'] },
            { label: 'Staff', url: 'staff.html', icon: 'users', roles: ['admin', 'management'] },
            { label: 'Valet', url: 'valet.html', icon: 'sparkles', roles: ['admin', 'workshop'] },
            { label: 'Accounts', url: 'accounts.html', icon: 'currency', roles: ['admin', 'management'] },
            { label: 'Analytics', url: 'analytics.html', icon: 'chart', roles: ['admin', 'management'] }
        ];
        
        return allNav.filter(item => item.roles.includes(user?.role));
    }
};
