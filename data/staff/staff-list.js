/**
 * Capeye Auto Capital - Staff Reference Data
 * Department mapping and staff lists for workflow assignments
 */

const STAFF_DATA = {
    departments: [
        { id: 'sales', name: 'Sales', color: '#3b82f6', icon: '💼' },
        { id: 'workshop', name: 'Workshop', color: '#f59e0b', icon: '🔧' },
        { id: 'bodyshop', name: 'Bodyshop', color: '#8b5cf6', icon: '🎨' },
        { id: 'valeting', name: 'Valeting', color: '#10b981', icon: '✨' },
        { id: 'accounts', name: 'Accounts', color: '#64748b', icon: '💰' },
        { id: 'management', name: 'Management', color: '#6366f1', icon: '👔' }
    ],
    
    staffByDepartment: {
        sales: [
            { id: 'ibrahim', name: 'Ibrahim Ata', role: 'Sales Manager', phone: '', email: '' },
            { id: 'keith_sales', name: 'Keith Hardy', role: 'General Manager', phone: '', email: '' }
        ],
        workshop: [
            { id: 'ali', name: 'Ali Amood', role: 'Workshop Lead', phone: '', email: '' },
            { id: 'morteza', name: 'Morteza Rahamian', role: 'Technician', phone: '', email: '' },
            { id: 'marcin', name: 'Marcin Kiljan', role: 'Technician', phone: '', email: '' },
            { id: 'sia', name: 'Sia Vajihi', role: 'Technician', phone: '', email: '' },
            { id: 'iman', name: 'Iman Zarien', role: 'Technician', phone: '', email: '' }
        ],
        bodyshop: [
            { id: 'stash', name: 'Stash', role: 'Bodyshop Specialist', phone: '', email: '' }
        ],
        valeting: [
            { id: 'marcin_valet', name: 'Marcin Kiljan', role: 'Valeting Specialist', phone: '', email: '' }
        ],
        accounts: [
            { id: 'keith_accts', name: 'Keith Hardy', role: 'General Manager', phone: '', email: '' }
        ],
        management: [
            { id: 'ajay', name: 'Ajay Kawa', role: 'Business Transition Officer', phone: '', email: '' },
            { id: 'keith_mgmt', name: 'Keith Hardy', role: 'General Manager', phone: '', email: '' },
            { id: 'ali_mgmt', name: 'Ali Amood', role: 'Workshop Lead', phone: '', email: '' }
        ]
    },
    
    // Helper function to get staff by department
    getStaffByDept: function(deptId) {
        return this.staffByDepartment[deptId] || [];
    },
    
    // Helper function to get department info
    getDeptInfo: function(deptId) {
        return this.departments.find(d => d.id === deptId) || {};
    },
    
    // Get all staff for dropdown
    getAllStaff: function() {
        let allStaff = [];
        Object.keys(this.staffByDepartment).forEach(dept => {
            this.staffByDepartment[dept].forEach(staff => {
                allStaff.push({
                    ...staff,
                    department: dept,
                    departmentName: this.getDeptInfo(dept).name
                });
            });
        });
        return allStaff;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STAFF_DATA;
}
