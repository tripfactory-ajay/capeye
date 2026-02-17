/**
 * Capeye Auto Capital - Fault Types & Categories
 * Standardized fault classification for workshop assessments
 */

const FAULT_DATA = {
    categories: [
        { id: 'mechanical', name: 'Mechanical', color: '#ef4444', icon: '🔧' },
        { id: 'electrical', name: 'Electrical', color: '#f59e0b', icon: '⚡' },
        { id: 'bodywork', name: 'Bodywork', color: '#8b5cf6', icon: '🎨' },
        { id: 'interior', name: 'Interior', color: '#10b981', icon: '🪑' },
        { id: 'tyres', name: 'Tyres & Wheels', color: '#3b82f6', icon: '🛞' },
        { id: 'documentation', name: 'Documentation', color: '#64748b', icon: '📄' }
    ],
    
    faultTypes: {
        mechanical: [
            'Engine Warning Light',
            'Brake Wear',
            'Suspension Noise',
            'Steering Vibration',
            'Clutch Slipping',
            'Gearbox Issues',
            'Oil Leak',
            'Coolant Leak',
            'Timing Belt Due',
            'Service Overdue',
            'Exhaust Leak',
            'Turbo Fault',
            'Injector Problem',
            'DPF Blocked'
        ],
        electrical: [
            'Battery Low',
            'Alternator Fault',
            'Starter Motor',
            'Sensor Fault',
            'Wiring Issue',
            'Light Not Working',
            'Central Locking',
            'Window Motor',
            'Infotainment',
            'Airbag Light',
            'ABS Light',
            'ESP Fault'
        ],
        bodywork: [
            'Dent - Minor',
            'Dent - Major',
            'Scratch - Surface',
            'Scratch - Deep',
            'Rust Spot',
            'Panel Misalignment',
            'Bumper Scuff',
            'Mirror Damage',
            'Door Seal',
            'Windscreen Chip',
            'Windscreen Crack'
        ],
        interior: [
            'Seat Wear',
            'Carpet Stain',
            'Trim Damage',
            'Odour',
            'Dashboard Crack',
            'Handle Broken',
            'Storage Compartment',
            'Sun Visor',
            'Floor Mat Missing'
        ],
        tyres: [
            'Tread Low - Front',
            'Tread Low - Rear',
            'Sidewall Damage',
            'Wheel Scuff',
            'Wheel Bent',
            'Spare Missing',
            'Locking Nut Missing'
        ],
        documentation: [
            'V5 Missing',
            'Service History Missing',
            'MOT Expired',
            'MOT Due Soon',
            'Key Missing',
            'Manual Missing'
        ]
    },
    
    // Get faults by category
    getByCategory: function(category) {
        return this.faultTypes[category] || [];
    },
    
    // Get all faults flattened
    getAllFaults: function() {
        let all = [];
        Object.keys(this.faultTypes).forEach(cat => {
            this.faultTypes[cat].forEach(fault => {
                all.push({
                    category: cat,
                    fault: fault,
                    categoryInfo: this.categories.find(c => c.id === cat)
                });
            });
        });
        return all;
    },
    
    // Get category info
    getCategoryInfo: function(categoryId) {
        return this.categories.find(c => c.id === categoryId) || {};
    }
};
