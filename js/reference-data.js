/**
 * Capeye Reference Data Module
 * Auto-loads from CSV files in the same folder
 */

const ReferenceData = {
    STORAGE_PREFIX: 'capeye_ref_',
    
    // CSV file mappings - update these to match your actual filenames
    csvFiles: {
        staff: [
            'Auto Capital  - Staff List-639068391990284525.csv',
            'Global list - Staff-639068391659046081.csv'
        ],
        departments: [
            'Auto Capital Department-639068391905010435.csv',
            'Department-639068391633821326.csv'
        ],
        parts: [
            'Auto Capital - Parts Recommended-639068391928034792.csv',
            'Part Recommended-639068391689789867.csv'
        ],
        faults: ['Faults Identified-639068391883133076.csv'],
        models: ['Model-639068391852264711.csv'],
        repairs: [
            'Recommended Repairs-639068391830074776.csv',
            'Work shop recommended-639068391721622464.csv'
        ],
        locations: ['Vehicle Location-639068391810075150.csv'],
        engineVariants: ['Vehicle Engine Variant-639068391786705591.csv']
    },
    
    /**
     * Initialize - load all data from CSV files
     */
    async init() {
        console.log('Initializing reference data from CSV files...');
        
        // Check if we already have data in localStorage
        const hasExistingData = localStorage.getItem(this.STORAGE_PREFIX + 'staff');
        
        if (!hasExistingData) {
            // Try to load from CSV files
            await this.loadAllFromCSV();
        } else {
            console.log('Using cached reference data');
        }
        
        return true;
    },
    
    /**
     * Load all data from CSV files
     */
    async loadAllFromCSV() {
        console.log('Loading data from CSV files...');
        
        const loadPromises = [];
        
        // Load each data type
        for (const [dataType, filenames] of Object.entries(this.csvFiles)) {
            loadPromises.push(this.loadDataType(dataType, filenames));
        }
        
        await Promise.all(loadPromises);
        
        console.log('All reference data loaded');
    },
    
    /**
     * Load a specific data type (try multiple filenames)
     */
    async loadDataType(dataType, filenames) {
        for (const filename of filenames) {
            try {
                const data = await this.fetchCSV(filename);
                if (data && data.length > 0) {
                    const parsed = this.parseData(dataType, data);
                    this.save(dataType, parsed);
                    console.log(`Loaded ${parsed.length} ${dataType} from ${filename}`);
                    return;
                }
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error.message);
            }
        }
        
        console.warn(`Could not load ${dataType} from any file`);
        this.save(dataType, []);
    },
    
    /**
     * Fetch CSV file from same folder
     */
    async fetchCSV(filename) {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const text = await response.text();
        return this.parseCSV(text);
    },
    
    /**
     * Parse CSV text into array of arrays
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        return lines.map(line => {
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
        }).filter(row => row.some(cell => cell.length > 0));
    },
    
    /**
     * Parse raw CSV data based on data type
     */
    parseData(dataType, rows) {
        switch (dataType) {
            case 'staff':
                return rows.map((row, idx) => ({
                    id: `staff_${idx}`,
                    name: row[0] || '',
                    role: row[1] || '',
                    department: row[2] || '',
                    email: row[3] || '',
                    phone: row[4] || '',
                    active: true
                })).filter(s => s.name);
                
            case 'departments':
                const uniqueDepts = [...new Set(rows.map(r => r[0]).filter(Boolean))];
                return uniqueDepts.map((name, idx) => ({
                    id: `dept_${idx}`,
                    name: name,
                    active: true
                }));
                
            case 'parts':
                return rows.map((row, idx) => ({
                    id: `part_${idx}`,
                    code: row[0] || '',
                    name: row[1] || row[0] || '',
                    category: row[2] || 'General',
                    cost: parseFloat(row[3]) || 0,
                    supplier: row[4] || '',
                    active: true
                })).filter(p => p.name);
                
            case 'faults':
                return rows.map((row, idx) => ({
                    id: `fault_${idx}`,
                    code: row[0] || `F${String(idx + 1).padStart(3, '0')}`,
                    name: row[1] || row[0] || '',
                    category: row[2] || 'General',
                    severity: row[3] || 'Medium',
                    active: true
                })).filter(f => f.name);
                
            case 'models':
                return rows.map((row, idx) => ({
                    id: `model_${idx}`,
                    name: row[0] || '',
                    make: row[1] || '',
                    active: true
                })).filter(m => m.name);
                
            case 'repairs':
                return rows.map((row, idx) => ({
                    id: `repair_${idx}`,
                    name: row[0] || '',
                    category: row[1] || 'General',
                    estimatedHours: parseFloat(row[2]) || 0,
                    active: true
                })).filter(r => r.name);
                
            case 'locations':
                return rows.map((row, idx) => ({
                    id: `loc_${idx}`,
                    name: row[0] || '',
                    type: row[1] || 'General',
                    address: row[2] || '',
                    active: true
                })).filter(l => l.name);
                
            case 'engineVariants':
                return rows.map((row, idx) => ({
                    id: `engine_${idx}`,
                    name: row[0] || '',
                    fuelType: row[1] || '',
                    power: row[2] || '',
                    active: true
                })).filter(e => e.name);
                
            default:
                return rows.map((row, idx) => ({
                    id: `${dataType}_${idx}`,
                    name: row[0] || '',
                    active: true
                })).filter(item => item.name);
        }
    },
    
    // ===== STORAGE METHODS =====
    
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
    
    clearAll() {
        Object.keys(this.csvFiles).forEach(type => {
            localStorage.removeItem(this.STORAGE_PREFIX + type);
        });
    },
    
    // ===== DROPDOWN METHODS =====
    
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
    
    getUniqueValues(type, field) {
        const data = this.get(type);
        const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
        return values.sort();
    }
};
