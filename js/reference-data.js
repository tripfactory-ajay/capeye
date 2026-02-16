/**
 * Capeye Reference Data Module
 * Manages reference lists for dropdowns across all forms
 */

const ReferenceData = {
    STORAGE_PREFIX: 'capeye_ref_',
    
    // Default data structures
    defaults: {
        staff: [
            { name: 'Keith Hardy', department: 'Management', role: 'General Manager', email: 'keith@autocapital.co.uk', phone: '', active: true },
            { name: 'Ibrahim Ata', department: 'Sales', role: 'Sales Manager', email: 'ibrahim@autocapital.co.uk', phone: '', active: true },
            { name: 'Ali Amood', department: 'Management', role: 'CEO', email: 'ali@autocapital.co.uk', phone: '', active: true },
            { name: 'Adam', department: 'Management', role: 'CEO', email: 'adam@autocapital.co.uk', phone: '', active: true },
            { name: 'Sol Adam', department: 'Management', role: 'CEO', email: 'sol@autocapital.co.uk', phone: '', active: true },
            { name: 'Morteza Rahamian', department: 'Workshop', role: 'Technician', email: '', phone: '', active: true },
            { name: 'Marcin Kiljan', department: 'Workshop', role: 'Technician', email: '', phone: '', active: true },
            { name: 'Sia Vajihi', department: 'Workshop', role: 'Technician', email: '', phone: '', active: true },
            { name: 'Iman Zarien', department: 'Workshop', role: 'Technician', email: '', phone: '', active: true }
        ],
        manufacturers: [
            { name: 'Ford', country: 'USA', website: '', active: true },
            { name: 'Mercedes-Benz', country: 'Germany', website: '', active: true },
            { name: 'Volkswagen', country: 'Germany', website: '', active: true },
            { name: 'Vauxhall', country: 'UK', website: '', active: true },
            { name: 'Peugeot', country: 'France', website: '', active: true },
            { name: 'Citroen', country: 'France', website: '', active: true },
            { name: 'Renault', country: 'France', website: '', active: true },
            { name: 'Fiat', country: 'Italy', website: '', active: true },
            { name: 'Iveco', country: 'Italy', website: '', active: true },
            { name: 'Nissan', country: 'Japan', website: '', active: true },
            { name: 'Toyota', country: 'Japan', website: '', active: true },
            { name: 'Mitsubishi', country: 'Japan', website: '', active: true }
        ],
        locations: [
            { name: 'Stanmore Retail', type: 'Retail', address: '', active: true },
            { name: 'Stanmore PDI', type: 'Workshop', address: '', active: true },
            { name: 'Stanmore 2', type: 'Storage', address: '', active: true },
            { name: 'With Supplier', type: 'External', address: '', active: true },
            { name: 'ACL', type: 'External', address: '', active: true }
        ],
        statuses: [
            { name: 'In Stock', category: 'Available', description: 'Vehicle on site and available', active: true },
            { name: 'In Transit', category: 'Pending', description: 'Vehicle en route to location', active: true },
            { name: 'Off-site R', category: 'Pending', description: 'Off-site for repairs', active: true },
            { name: 'Subject to', category: 'Pending', description: 'Awaiting confirmation', active: true },
            { name: 'With Supplier', category: 'External', description: 'At external supplier', active: true },
            { name: 'Reserved', category: 'Sold', description: 'Customer deposit received', active: true },
            { name: 'Sold', category: 'Sold', description: 'Vehicle sold', active: true }
        ],
        parts: [
            { code: 'BRK001', name: 'Brake Pads', category: 'Brakes', cost: 45.00, supplier: 'Bosch', active: true },
            { code: 'BRK002', name: 'Brake Discs', category: 'Brakes', cost: 65.00, supplier: 'Bosch', active: true },
            { code: 'OIL001', name: 'Engine Oil 5W30', category: 'Fluids', cost: 25.99, supplier: 'Castrol', active: true },
            { code: 'FIL001', name: 'Oil Filter', category: 'Filters', cost: 12.50, supplier: 'Mann', active: true },
            { code: 'TIR001', name: 'Tyre 215/65 R16', category: 'Tyres', cost: 89.00, supplier: 'Michelin', active: true }
        ],
        faults: [
            { code: 'B001', name: 'Bodywork Damage', category: 'Bodywork', severity: 'Medium', estimatedCost: 500, active: true },
            { code: 'B002', name: 'Paint Scratch', category: 'Bodywork', severity: 'Low', estimatedCost: 150, active: true },
            { code: 'M001', name: 'Engine Warning Light', category: 'Mechanical', severity: 'High', estimatedCost: 800, active: true },
            { code: 'M002', name: 'Service Due', category: 'Mechanical', severity: 'Low', estimatedCost: 200, active: true },
            { code: 'E001', name: 'Battery Issue', category: 'Electrical', severity: 'Medium', estimatedCost: 120, active: true }
        ],
        engineVariants: [
            { name: '2.0 TDCi', fuelType: 'Diesel', power: '130hp', active: true },
            { name: '2.2 TDCi', fuelType: 'Diesel', power: '155hp', active: true },
            { name: '1.6 CDTi', fuelType: 'Diesel', power: '115hp', active: true },
            { name: '2.1 CDI', fuelType: 'Diesel', power: '150hp', active: true },
            { name: '1.5 dCi', fuelType: 'Diesel', power: '110hp', active: true }
        ],
        departments: [
            { name: 'Sales', description: 'Vehicle sales team', active: true },
            { name: 'Workshop', description: 'Mechanical repairs and servicing', active: true },
            { name: 'Bodywork', description: 'Body repairs and painting', active: true },
            { name: 'Valet', description: 'Vehicle cleaning and preparation', active: true },
            { name: 'Accounts', description: 'Finance and accounting', active: true },
            { name: 'Management', description: 'Senior management', active: true }
        ]
    },
    
    /**
     * Initialize with defaults if empty
     */
    init() {
        Object.keys(this.defaults).forEach(key => {
            if (!localStorage.getItem(this.STORAGE_PREFIX + key)) {
                this.save(key, this.defaults[key]);
            }
        });
    },
    
    /**
     * Get reference data by type
     * @param {string} type 
     * @returns {Array}
     */
    get(type) {
        const data = localStorage.getItem(this.STORAGE_PREFIX + type);
        return data ? JSON.parse(data) : [];
    },
    
    /**
     * Save reference data
     * @param {string} type 
     * @param {Array} data 
     */
    save(type, data) {
        localStorage.setItem(this.STORAGE_PREFIX + type, JSON.stringify(data));
    },
    
    /**
     * Add single entry
     * @param {string} type 
     * @param {Object} entry 
     */
    add(type, entry) {
        const data = this.get(type);
        entry.id = this.generateId();
        entry.createdAt = new Date().toISOString();
        data.push(entry);
        this.save(type, data);
        return entry;
    },
    
    /**
     * Remove entry by index
     * @param {string} type 
     * @param {number} index 
     */
    remove(type, index) {
        const data = this.get(type);
        data.splice(index, 1);
        this.save(type, data);
    },
    
    /**
     * Update entry
     * @param {string} type 
     * @param {number} index 
     * @param {Object} updates 
     */
    update(type, index, updates) {
        const data = this.get(type);
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        this.save(type, data);
        return data[index];
    },
    
    /**
     * Clear all data of type
     * @param {string} type 
     */
    clear(type) {
        localStorage.removeItem(this.STORAGE_PREFIX + type);
    },
    
    /**
     * Import data from CSV/array
     * @param {string} type 
     * @param {Array} newData 
     * @returns {number} Count imported
     */
    import(type, newData) {
        const existing = this.get(type);
        const config = this.getConfig(type);
        
        let imported = 0;
        
        newData.forEach(row => {
            // Map CSV columns to standard fields if needed
            const mapped = this.mapColumns(row, type);
            
            // Validate required fields
            const hasRequired = config.required.every(field => mapped[field]);
            
            if (hasRequired) {
                // Check for duplicates by name
                const isDuplicate = existing.some(e => 
                    e.name && mapped.name && e.name.toLowerCase() === mapped.name.toLowerCase()
                );
                
                if (!isDuplicate) {
                    mapped.active = mapped.active !== false; // Default to true
                    existing.push({
                        ...mapped,
                        id: this.generateId(),
                        createdAt: new Date().toISOString()
                    });
                    imported++;
                }
            }
        });
        
        this.save(type, existing);
        return imported;
    },
    
    /**
     * Map CSV columns to standard fields
     * @param {Object} row 
     * @param {string} type 
     * @returns {Object}
     */
    mapColumns(row, type) {
        const mapped = { ...row };
        
        // Common column name variations
        const mappings = {
            name: ['name', 'Name', 'fullName', 'Full Name', 'staffName', 'Staff Name', 'make', 'Make', 'manufacturer', 'Manufacturer'],
            department: ['department', 'Department', 'dept', 'Dept', 'team', 'Team'],
            role: ['role', 'Role', 'position', 'Position', 'jobTitle', 'Job Title'],
            email: ['email', 'Email', 'e-mail', 'E-mail', 'mail'],
            phone: ['phone', 'Phone', 'telephone', 'Telephone', 'mobile', 'Mobile', 'tel'],
            active: ['active', 'Active', 'status', 'Status', 'enabled', 'Enabled']
        };
        
        Object.entries(mappings).forEach(([standard, variants]) => {
            if (!mapped[standard]) {
                const match = variants.find(v => row[v] !== undefined);
                if (match) {
                    mapped[standard] = row[match];
                }
            }
        });
        
        // Normalize active field
        if (mapped.active !== undefined) {
            const val = String(mapped.active).toLowerCase().trim();
            mapped.active = ['true', 'yes', '1', 'active', 'enabled', 'y'].includes(val);
        }
        
        return mapped;
    },
    
    /**
     * Get config for data type
     * @param {string} type 
     * @returns {Object}
     */
    getConfig(type) {
        const configs = {
            staff: { required: ['name', 'department'], displayField: 'name' },
            manufacturers: { required: ['name'], displayField: 'name' },
            locations: { required: ['name', 'type'], displayField: 'name' },
            statuses: { required: ['name', 'category'], displayField: 'name' },
            parts: { required: ['name', 'category'], displayField: 'name' },
            faults: { required: ['name', 'category'], displayField: 'name' },
            engineVariants: { required: ['name'], displayField: 'name' },
            departments: { required: ['name'], displayField: 'name' }
        };
        return configs[type] || { required: ['name'], displayField: 'name' };
    },
    
    /**
     * Get active items only
     * @param {string} type 
     * @returns {Array}
     */
    getActive(type) {
        return this.get(type).filter(item => item.active !== false);
    },
    
    /**
     * Get dropdown options for select element
     * @param {string} type 
     * @param {string} valueField - Field to use as option value
     * @param {string} labelField - Field to use as option label
     * @returns {Array} Array of {value, label} objects
     */
    getDropdownOptions(type, valueField = 'name', labelField = 'name') {
        return this.getActive(type).map(item => ({
            value: item[valueField],
            label: item[labelField]
        }));
    },
    
    /**
     * Populate a select element with reference data
     * @param {string} selectId - ID of select element
     * @param {string} type - Reference data type
     * @param {Object} options - { includeEmpty, emptyLabel, valueField, labelField }
     */
    populateSelect(selectId, type, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const { 
            includeEmpty = true, 
            emptyLabel = 'Select...',
            valueField = 'name',
            labelField = 'name'
        } = options;
        
        // Clear existing
        select.innerHTML = '';
        
        // Add empty option
        if (includeEmpty) {
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = emptyLabel;
            select.appendChild(emptyOpt);
        }
        
        // Add options
        const items = this.getDropdownOptions(type, valueField, labelField);
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.value;
            opt.textContent = item.label;
            select.appendChild(opt);
        });
    },
    
    /**
     * Populate multiple selects at once
     * @param {Object} mappings - { selectId: dataType }
     */
    populateMultiple(mappings) {
        Object.entries(mappings).forEach(([selectId, type]) => {
            this.populateSelect(selectId, type);
        });
    },
    
    /**
     * Search within reference data
     * @param {string} type 
     * @param {string} query 
     * @returns {Array}
     */
    search(type, query) {
        const data = this.get(type);
        const lowerQuery = query.toLowerCase();
        return data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowerQuery)
            )
        );
    },
    
    /**
     * Get unique values from a field
     * @param {string} type 
     * @param {string} field 
     * @returns {Array}
     */
    getUniqueValues(type, field) {
        const data = this.get(type);
        const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
        return values.sort();
    },
    
    /**
     * Export all reference data
     * @returns {Object}
     */
    exportAll() {
        const exportData = {};
        Object.keys(this.defaults).forEach(key => {
            exportData[key] = this.get(key);
        });
        return {
            referenceData: exportData,
            exportedAt: new Date().toISOString()
        };
    },
    
    /**
     * Import all reference data (restore)
     * @param {Object} data 
     */
    importAll(data) {
        if (data.referenceData) {
            Object.entries(data.referenceData).forEach(([key, value]) => {
                this.save(key, value);
            });
        }
    },
    
    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Get staff by department
     * @param {string} department 
     * @returns {Array}
     */
    getStaffByDepartment(department) {
        return this.getActive('staff').filter(s => 
            s.department && s.department.toLowerCase() === department.toLowerCase()
        );
    },
    
    /**
     * Get locations by type
     * @param {string} type 
     * @returns {Array}
     */
    getLocationsByType(type) {
        return this.getActive('locations').filter(l => 
            l.type && l.type.toLowerCase() === type.toLowerCase()
        );
    }
};

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => ReferenceData.init());
