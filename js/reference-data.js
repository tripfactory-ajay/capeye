/**
 * Capeye Reference Data Module
 * Auto-loads from user's existing CSV files
 */

const ReferenceData = {
    STORAGE_PREFIX: 'capeye_ref_',
    
    // File paths - adjust these to match your actual file locations
    filePaths: {
        staff: 'Auto Capital  - Staff List-639068391990284525.csv',
        staffAlt: 'Global list - Staff-639068391659046081.csv',
        departments: 'Auto Capital Department-639068391905010435.csv',
        departmentsAlt: 'Department-639068391633821326.csv',
        parts: 'Auto Capital - Parts Recommended-639068391928034792.csv',
        partsAlt: 'Part Recommended-639068391689789867.csv',
        faults: 'Faults Identified-639068391883133076.csv',
        models: 'Model-639068391852264711.csv',
        repairs: 'Recommended Repairs-639068391830074776.csv',
        repairsAlt: 'Work shop recommended-639068391721622464.csv',
        locations: 'Vehicle Location-639068391810075150.csv',
        engines: 'Vehicle Engine Variant-639068391786705591.csv'
    },
    
    /**
     * Initialize - load from CSV files if localStorage empty
     */
    async init() {
        // Check if we already have data in localStorage
        const hasData = localStorage.getItem(this.STORAGE_PREFIX + 'staff');
        
        if (!hasData) {
            console.log('Loading reference data from CSV files...');
            await this.loadAllFromCSV();
        }
        
        console.log('Reference data ready');
    },
    
    /**
     * Load all data from CSV files
     */
    async loadAllFromCSV() {
        try {
            // Load staff (try both files)
            const staffData = await this.loadCSV(this.filePaths.staff, 'staff') || 
                             await this.loadCSV(this.filePaths.staffAlt, 'staff');
            if (staffData) this.save('staff', this.parseStaff(staffData));
            
            // Load departments (try both files)
            const deptData = await this.loadCSV(this.filePaths.departments, 'departments') ||
                            await this.loadCSV(this.filePaths.departmentsAlt, 'departments');
            if (deptData) this.save('departments', this.parseDepartments(deptData));
            
            // Load parts (try both files)
            const partsData = await this.loadCSV(this.filePaths.parts, 'parts') ||
                             await this.loadCSV(this.filePaths.partsAlt, 'parts');
            if (partsData) this.save('parts', this.parseParts(partsData));
            
            // Load faults
            const faultsData = await this.loadCSV(this.filePaths.faults, 'faults');
            if (faultsData) this.save('faults', this.parseFaults(faultsData));
            
            // Load models
            const modelsData = await this.loadCSV(this.filePaths.models, 'models');
            if (modelsData) this.save('models', this.parseSimpleList(modelsData, 'model'));
            
            // Load repairs (try both files)
            const repairsData = await this.loadCSV(this.filePaths.repairs, 'repairs') ||
                               await this.loadCSV(this.filePaths.repairsAlt, 'repairs');
            if (repairsData) this.save('repairs', this.parseSimpleList(repairsData, 'repair'));
            
            // Load locations
            const locationsData = await this.loadCSV(this.filePaths.locations, 'locations');
            if (locationsData) this.save('locations', this.parseLocations(locationsData));
            
            // Load engine variants
            const enginesData = await this.loadCSV(this.filePaths.engines, 'engines');
            if (enginesData) this.save('engineVariants', this.parseSimpleList(enginesData, 'engine'));
            
        } catch (error) {
            console.error('Error loading CSV files:', error);
            // Fall back to defaults if CSV load fails
            this.loadDefaults();
        }
    },
    
    /**
     * Load CSV file via fetch
     */
    async loadCSV(filename, type) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                console.warn(`Could not load ${filename}`);
                return null;
            }
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.warn(`Error fetching ${filename}:`, error);
            return null;
        }
    },
    
    /**
     * Parse CSV text to array
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        return lines.map(line => {
            // Handle quoted fields and commas
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        });
    },
    
    /**
     * Parse staff data: Name, Role, Department
     */
    parseStaff(rows) {
        return rows.map((row, index) => ({
            id: 'staff_' + index,
            name: row[0] || '',
            role: row[1] || '',
            department: row[2] || '',
            email: '',
            phone: '',
            active: true
        })).filter(s => s.name);
    },
    
    /**
     * Parse department data
     */
    parseDepartments(rows) {
        const unique = [...new Set(rows.map(r => r[0]).filter(Boolean))];
        return unique.map((name, index) => ({
            id: 'dept_' + index,
            name: name,
            description: '',
            active: true
        }));
    },
    
    /**
     * Parse parts data
     */
    parseParts(rows) {
        return rows.map((row, index) => ({
            id: 'part_' + index,
            code: '',
            name: row[0] || '',
            category: row[1] || 'General',
            cost: 0,
            supplier: '',
            active: true
        })).filter(p => p.name);
    },
    
    /**
     * Parse faults data
     */
    parseFaults(rows) {
        return rows.map((row, index) => ({
            id: 'fault_' + index,
            code: 'F' + String(index + 1).padStart(3, '0'),
            name: row[0] || '',
            category: 'General',
            severity: 'Medium',
            estimatedCost: 0,
            active: true
        })).filter(f => f.name);
    },
    
    /**
     * Parse simple list (models, repairs, engines)
     */
    parseSimpleList(rows, fieldName) {
        return rows.map((row, index) => ({
            id: fieldName + '_' + index,
            name: row[0] || '',
            [fieldName]: row[0] || '',
            active: true
        })).filter(item => item.name);
    },
    
    /**
     * Parse locations data
     */
    parseLocations(rows) {
        return rows.map((row, index) => ({
            id: 'loc_' + index,
            name: row[0] || '',
            type: row[1] || 'General',
            address: row[2] || '',
            active: true
        })).filter(l => l.name);
    },
    
    /**
     * Load default data if CSV fails
     */
    loadDefaults() {
        const defaults = {
            staff: [
                { name: 'Keith Hardy', department: 'Management', role: 'General Manager', active: true },
                { name: 'Ibrahim Ata', department: 'Sales Department', role: 'Sales Manager', active: true }
            ],
            departments: [
                { name: 'Management', active: true },
                { name: 'Sales Department', active: true },
                { name: 'Workshop - Repairs', active: true }
            ],
            locations: [
                { name: 'Main Yard', type: 'Storage', active: true },
                { name: 'Showroom', type: 'Retail', active: true }
            ]
        };
        
        Object.entries(defaults).forEach(([key, value]) => {
            if (!localStorage.getItem(this.STORAGE_PREFIX + key)) {
                this.save(key, value);
            }
        });
    },
    
    // ===== STANDARD CRUD METHODS =====
    
    get(type) {
        const data = localStorage.getItem(this.STORAGE_PREFIX + type);
        return data ? JSON.parse(data) : [];
    },
    
    save(type, data) {
        localStorage.setItem(this.STORAGE_PREFIX + type, JSON.stringify(data));
    },
    
    getActive(type) {
        return this.get(type).filter(item => item.active !== false);
    },
    
    getDropdownOptions(type, valueField = 'name', labelField = 'name') {
        return this.getActive(type).map(item => ({
            value: item[valueField],
            label: item[labelField]
        }));
    },
    
    populateSelect(selectId, type, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const { includeEmpty = true, emptyLabel = 'Select...' } = options;
        
        select.innerHTML = '';
        
        if (includeEmpty) {
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = emptyLabel;
            select.appendChild(emptyOpt);
        }
        
        const items = this.getDropdownOptions(type);
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.value;
            opt.textContent = item.label;
            select.appendChild(opt);
        });
    },
    
    getStaffByDepartment(department) {
        return this.getActive('staff').filter(s => 
            s.department && s.department.toLowerCase() === department.toLowerCase()
        );
    },
    
    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
    }
};

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ReferenceData.init();
});
