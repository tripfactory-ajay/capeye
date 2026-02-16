/**
 * Capeye Data Module
 * Central data management with reference schemas and CSV mappings
 */

const Data = {
    // Reference data schemas for validation and forms
    schemas: {
        vehicle: {
            fields: [
                { name: 'registration', type: 'string', required: true, label: 'Registration' },
                { name: 'make', type: 'string', required: true, label: 'Make', ref: 'manufacturers' },
                { name: 'model', type: 'string', required: true, label: 'Model' },
                { name: 'variant', type: 'string', required: false, label: 'Variant' },
                { name: 'year', type: 'number', required: false, label: 'Year' },
                { name: 'colour', type: 'string', required: false, label: 'Colour' },
                { name: 'fuelType', type: 'string', required: false, label: 'Fuel Type', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
                { name: 'transmission', type: 'string', required: false, label: 'Transmission', options: ['Manual', 'Automatic'] },
                { name: 'engineSize', type: 'string', required: false, label: 'Engine Size' },
                { name: 'mileage', type: 'number', required: false, label: 'Mileage' },
                { name: 'location', type: 'string', required: true, label: 'Location', ref: 'locations' },
                { name: 'status', type: 'string', required: true, label: 'Status', ref: 'statuses' },
                { name: 'dateInStock', type: 'date', required: false, label: 'Date In Stock' },
                { name: 'costPrice', type: 'currency', required: false, label: 'Cost Price' },
                { name: 'retailPrice', type: 'currency', required: false, label: 'Retail Price' },
                { name: 'totalCost', type: 'currency', required: false, label: 'Total Cost' },
                { name: 'estimatedLoss', type: 'currency', required: false, label: 'Est. Loss' },
                { name: 'readyForSale', type: 'boolean', required: false, label: 'Ready for Sale' },
                { name: 'reserved', type: 'boolean', required: false, label: 'Reserved' },
                { name: 'sold', type: 'boolean', required: false, label: 'Sold' }
            ]
        },
        
        staff: {
            fields: [
                { name: 'name', type: 'string', required: true, label: 'Full Name' },
                { name: 'department', type: 'string', required: true, label: 'Department', ref: 'departments' },
                { name: 'role', type: 'string', required: false, label: 'Job Role' },
                { name: 'email', type: 'email', required: false, label: 'Email' },
                { name: 'phone', type: 'string', required: false, label: 'Phone' },
                { name: 'active', type: 'boolean', required: false, label: 'Active', default: true }
            ]
        },
        
        workflow: {
            stages: [
                { id: 'intake', name: 'Vehicle Intake', department: 'any', order: 1 },
                { id: 'inspection', name: 'Initial Inspection', department: 'workshop', order: 2 },
                { id: 'valuation', name: 'Valuation', department: 'sales', order: 3 },
                { id: 'bodywork', name: 'Bodywork', department: 'bodywork', order: 4 },
                { id: 'mechanical', name: 'Mechanical', department: 'workshop', order: 5 },
                { id: 'valet', name: 'Valet', department: 'valet', order: 6 },
                { id: 'photography', name: 'Photography', department: 'sales', order: 7 },
                { id: 'listing', name: 'Listing', department: 'sales', order: 8 },
                { id: 'advertising', name: 'Advertising', department: 'sales', order: 9 },
                { id: 'enquiries', name: 'Enquiries', department: 'sales', order: 10 },
                { id: 'sale', name: 'Sale', department: 'sales', order: 11 },
                { id: 'delivery', name: 'Delivery', department: 'sales', order: 12 }
            ]
        }
    },
    
    // ClickDealer CSV column mappings
    csvMappings: {
        clickDealer: {
            // Registration variations
            'reg': 'registration',
            'reg no': 'registration',
            'reg number': 'registration',
            'registration': 'registration',
            'plate': 'registration',
            'vrm': 'registration',
            'vehicle reg': 'registration',
            
            // Make/Manufacturer
            'make': 'make',
            'manufacturer': 'make',
            'brand': 'make',
            'marque': 'make',
            
            // Model
            'model': 'model',
            'range': 'model',
            
            // Variant/Trim
            'variant': 'variant',
            'trim': 'variant',
            'description': 'variant',
            'spec': 'variant',
            'derivative': 'variant',
            
            // Year
            'year': 'year',
            'reg year': 'year',
            'registration year': 'year',
            'manufacture year': 'year',
            
            // Colour
            'colour': 'colour',
            'color': 'colour',
            'paint': 'colour',
            'body colour': 'colour',
            
            // Fuel Type
            'fuel': 'fuelType',
            'fuel type': 'fuelType',
            'fueltype': 'fuelType',
            
            // Transmission
            'transmission': 'transmission',
            'gearbox': 'transmission',
            'trans': 'transmission',
            
            // Engine
            'engine': 'engineSize',
            'engine size': 'engineSize',
            'cc': 'engineSize',
            'capacity': 'engineSize',
            
            // Mileage
            'mileage': 'mileage',
            'miles': 'mileage',
            'km': 'mileage',
            'odometer': 'mileage',
            
            // Location
            'location': 'location',
            'site': 'location',
            'place': 'location',
            'yard': 'location',
            
            // Status
            'status': 'status',
            'stock status': 'status',
            'availability': 'status',
            'state': 'status',
            
            // Dates
            'date in stock': 'dateInStock',
            'stock date': 'dateInStock',
            'date added': 'dateInStock',
            'purchase date': 'dateInStock',
            'acquisition date': 'dateInStock',
            
            // Financial - Cost
            'cost': 'costPrice',
            'cost price': 'costPrice',
            'purchase price': 'costPrice',
            'buy price': 'costPrice',
            'trade': 'costPrice',
            
            // Financial - Retail
            'retail': 'retailPrice',
            'retail price': 'retailPrice',
            'sale price': 'retailPrice',
            'price': 'retailPrice',
            'asking price': 'retailPrice',
            
            // Financial - Total/Profit
            'total cost': 'totalCost',
            'total investment': 'totalCost',
            'total': 'totalCost',
            'loss': 'estimatedLoss',
            'est loss': 'estimatedLoss',
            'estimated loss': 'estimatedLoss',
            'profit': 'estimatedProfit',
            'margin': 'estimatedProfit',
            
            // Flags
            'ready': 'readyForSale',
            'ready for sale': 'readyForSale',
            'prepared': 'readyForSale',
            'preped': 'readyForSale',
            'reserved': 'reserved',
            'on hold': 'reserved',
            'deposit': 'reserved',
            'sold': 'sold',
            'sale': 'sold',
            
            // Source
            'source': 'source',
            'supplier': 'source',
            'vendor': 'source',
            'from': 'source',
            'source id': 'sourceId',
            'ref': 'sourceId',
            'reference': 'sourceId',
            'supplier ref': 'sourceId'
        }
    },
    
    // Sample data for testing
    sampleVehicles: [
        {
            registration: 'AB12CDE',
            make: 'Ford',
            model: 'Transit',
            variant: '350 L3 H2',
            year: 2021,
            colour: 'White',
            fuelType: 'Diesel',
            transmission: 'Manual',
            location: 'Stanmore Retail',
            status: 'In Stock',
            dateInStock: '2026-01-15T00:00:00.000Z',
            costPrice: 18500,
            retailPrice: 22995,
            daysInStock: 32,
            readyForSale: true
        },
        {
            registration: 'EF34GHJ',
            make: 'Mercedes',
            model: 'Vito',
            variant: '114 CDI',
            year: 2022,
            colour: 'Silver',
            fuelType: 'Diesel',
            transmission: 'Automatic',
            location: 'Stanmore PDI',
            status: 'In Stock',
            dateInStock: '2026-01-20T00:00:00.000Z',
            costPrice: 24500,
            retailPrice: 28995,
            daysInStock: 27,
            readyForSale: false
        }
    ],
    
    /**
     * Get schema for data type
     * @param {string} type 
     * @returns {Object}
     */
    getSchema(type) {
        return this.schemas[type] || null;
    },
    
    /**
     * Get field definition
     * @param {string} schemaType 
     * @param {string} fieldName 
     * @returns {Object}
     */
    getField(schemaType, fieldName) {
        const schema = this.getSchema(schemaType);
        if (!schema) return null;
        return schema.fields.find(f => f.name === fieldName);
    },
    
    /**
     * Normalize CSV header using mappings
     * @param {string} header 
     * @returns {string}
     */
    normalizeHeader(header) {
        const normalized = header.toString().toLowerCase().trim();
        return this.csvMappings.clickDealer[normalized] || normalized.replace(/\s+/g, '_');
    },
    
    /**
     * Get all possible CSV headers for a field
     * @param {string} fieldName 
     * @returns {Array}
     */
    getPossibleHeaders(fieldName) {
        const mappings = this.csvMappings.clickDealer;
        return Object.entries(mappings)
            .filter(([_, target]) => target === fieldName)
            .map(([source, _]) => source);
    },
    
    /**
     * Validate data against schema
     * @param {Object} data 
     * @param {string} schemaType 
     * @returns {Object}
     */
    validate(data, schemaType) {
        const schema = this.getSchema(schemaType);
        if (!schema) return { valid: false, errors: ['Unknown schema'] };
        
        const errors = [];
        
        schema.fields.forEach(field => {
            if (field.required && !data[field.name]) {
                errors.push(`${field.label} is required`);
            }
            
            if (data[field.name] && field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data[field.name])) {
                    errors.push(`${field.label} is not a valid email`);
                }
            }
            
            if (data[field.name] && field.type === 'number') {
                if (isNaN(parseFloat(data[field.name]))) {
                    errors.push(`${field.label} must be a number`);
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    /**
     * Format value for display
     * @param {*} value 
     * @param {string} type 
     * @returns {string}
     */
    formatValue(value, type) {
        if (value === null || value === undefined) return '-';
        
        switch (type) {
            case 'currency':
                return '£' + parseFloat(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            case 'date':
                return new Date(value).toLocaleDateString('en-GB');
            case 'boolean':
                return value ? 'Yes' : 'No';
            case 'number':
                return parseInt(value).toLocaleString();
            default:
                return String(value);
        }
    },
    
    /**
     * Get workflow stage by ID
     * @param {string} stageId 
     * @returns {Object}
     */
    getWorkflowStage(stageId) {
        return this.schemas.workflow.stages.find(s => s.id === stageId);
    },
    
    /**
     * Get next workflow stage
     * @param {string} currentStageId 
     * @returns {Object|null}
     */
    getNextStage(currentStageId) {
        const stages = this.schemas.workflow.stages;
        const currentIndex = stages.findIndex(s => s.id === currentStageId);
        if (currentIndex === -1 || currentIndex >= stages.length - 1) return null;
        return stages[currentIndex + 1];
    },
    
    /**
     * Get previous workflow stage
     * @param {string} currentStageId 
     * @returns {Object|null}
     */
    getPreviousStage(currentStageId) {
        const stages = this.schemas.workflow.stages;
        const currentIndex = stages.findIndex(s => s.id === currentStageId);
        if (currentIndex <= 0) return null;
        return stages[currentIndex - 1];
    },
    
    /**
     * Load sample data for testing
     */
    loadSampleData() {
        if (VehicleStore && VehicleStore.getAll().length === 0) {
            this.sampleVehicles.forEach(v => VehicleStore.add(v));
        }
    }
};
