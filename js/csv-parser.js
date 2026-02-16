/**
 * Capeye CSV Parser Module
 * Uses Papa Parse for robust CSV parsing with ClickDealer format support
 */

const CSVParser = {
    // Papa Parse configuration defaults
    defaultConfig: {
        header: true,
        skipEmptyLines: true,
        transformHeader: function(header) {
            return header.trim().replace(/\s+/g, ' ');
        },
        transform: function(value) {
            return value.trim();
        }
    },
    
    /**
     * Parse CSV file or string
     * @param {File|string} input - CSV file or string
     * @param {Object} options - Additional Papa Parse options
     * @returns {Promise} Parsed data
     */
    parse(input, options = {}) {
        return new Promise((resolve, reject) => {
            const config = {
                ...this.defaultConfig,
                ...options,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    resolve({
                        data: results.data,
                        meta: results.meta,
                        errors: results.errors
                    });
                },
                error: (error) => {
                    reject(error);
                }
            };
            
            if (input instanceof File) {
                Papa.parse(input, config);
            } else {
                Papa.parse(input, config);
            }
        });
    },
    
    /**
     * Parse ClickDealer specific format
     * Handles common ClickDealer column variations
     * @param {File|string} input 
     * @returns {Promise}
     */
    parseClickDealer(input) {
        return this.parse(input, {
            transformHeader: (header) => this.normalizeClickDealerHeader(header),
            beforeFirstChunk: (chunk) => {
                // Remove BOM if present
                return chunk.replace(/^\uFEFF/, '');
            }
        }).then(result => {
            // Post-process ClickDealer data
            return {
                ...result,
                data: result.data.map(row => this.transformClickDealerRow(row))
            };
        });
    },
    
    /**
     * Normalize ClickDealer column headers
     * @param {string} header 
     * @returns {string}
     */
    normalizeClickDealerHeader(header) {
        const headerMap = {
            // Registration
            'reg': 'registration',
            'reg no': 'registration',
            'reg number': 'registration',
            'registration': 'registration',
            'plate': 'registration',
            'vrm': 'registration',
            
            // Vehicle details
            'make': 'make',
            'manufacturer': 'make',
            'brand': 'make',
            'model': 'model',
            'variant': 'variant',
            'trim': 'variant',
            'description': 'variant',
            'year': 'year',
            'reg year': 'year',
            'colour': 'colour',
            'color': 'colour',
            'paint': 'colour',
            'fuel': 'fuelType',
            'fuel type': 'fuelType',
            'transmission': 'transmission',
            'gearbox': 'transmission',
            'engine': 'engineSize',
            'engine size': 'engineSize',
            'cc': 'engineSize',
            'mileage': 'mileage',
            'miles': 'mileage',
            
            // Location & Status
            'location': 'location',
            'site': 'location',
            'place': 'location',
            'status': 'status',
            'stock status': 'status',
            'availability': 'status',
            
            // Dates
            'date in stock': 'dateInStock',
            'stock date': 'dateInStock',
            'date added': 'dateInStock',
            'purchase date': 'dateInStock',
            
            // Financial
            'cost': 'costPrice',
            'cost price': 'costPrice',
            'purchase price': 'costPrice',
            'retail': 'retailPrice',
            'retail price': 'retailPrice',
            'sale price': 'retailPrice',
            'price': 'retailPrice',
            'total cost': 'totalCost',
            'total investment': 'totalCost',
            'loss': 'estimatedLoss',
            'est loss': 'estimatedLoss',
            'estimated loss': 'estimatedLoss',
            'profit': 'estimatedProfit',
            
            // Flags
            'ready': 'readyForSale',
            'ready for sale': 'readyForSale',
            'prepared': 'readyForSale',
            'reserved': 'reserved',
            'on hold': 'reserved',
            'sold': 'sold',
            'sale': 'sold',
            
            // Source
            'source': 'source',
            'supplier': 'source',
            'vendor': 'source',
            'source id': 'sourceId',
            'ref': 'sourceId',
            'reference': 'sourceId'
        };
        
        const normalized = header.toString().toLowerCase().trim();
        return headerMap[normalized] || normalized.replace(/\s+/g, '_');
    },
    
    /**
     * Transform ClickDealer row data
     * @param {Object} row 
     * @returns {Object}
     */
    transformClickDealerRow(row) {
        const transformed = { ...row };
        
        // Clean registration
        if (transformed.registration) {
            transformed.registration = transformed.registration.toString().toUpperCase().replace(/\s+/g, '');
        }
        
        // Clean numeric fields
        ['costPrice', 'retailPrice', 'totalCost', 'estimatedLoss', 'mileage'].forEach(field => {
            if (transformed[field]) {
                const cleaned = transformed[field].toString().replace(/[£,$,€,\s]/g, '').replace(/,/g, '');
                transformed[field] = parseFloat(cleaned) || 0;
            }
        });
        
        // Clean year
        if (transformed.year) {
            transformed.year = parseInt(transformed.year) || null;
        }
        
        // Normalize booleans
        ['readyForSale', 'reserved', 'sold'].forEach(field => {
            if (transformed[field] !== undefined) {
                const val = transformed[field].toString().toLowerCase().trim();
                transformed[field] = ['yes', 'true', '1', 'y', 'x', '✓'].includes(val);
            }
        });
        
        return transformed;
    },
    
    /**
     * Validate parsed data structure
     * @param {Array} data 
     * @returns {Object} Validation result
     */
    validate(data) {
        const errors = [];
        const warnings = [];
        
        if (!Array.isArray(data) || data.length === 0) {
            return { valid: false, errors: ['No data found in file'], warnings: [] };
        }
        
        const requiredFields = ['registration'];
        const sampleRow = data[0];
        
        // Check for required fields
        requiredFields.forEach(field => {
            if (!(field in sampleRow)) {
                errors.push(`Missing required field: ${field}`);
            }
        });
        
        // Check for empty registrations
        const emptyRegs = data.filter((row, idx) => !row.registration || row.registration.trim() === '');
        if (emptyRegs.length > 0) {
            errors.push(`${emptyRegs.length} rows missing registration numbers`);
        }
        
        // Check for duplicate registrations
        const regs = data.map(r => r.registration).filter(Boolean);
        const duplicates = regs.filter((item, index) => regs.indexOf(item) !== index);
        if (duplicates.length > 0) {
            warnings.push(`Duplicate registrations found: ${[...new Set(duplicates)].join(', ')}`);
        }
        
        // Check data quality
        const noMake = data.filter(r => !r.make).length;
        const noModel = data.filter(r => !r.model).length;
        const noPrice = data.filter(r => !r.costPrice && !r.retailPrice).length;
        
        if (noMake > 0) warnings.push(`${noMake} rows missing make information`);
        if (noModel > 0) warnings.push(`${noModel} rows missing model information`);
        if (noPrice > 0) warnings.push(`${noPrice} rows missing price information`);
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            stats: {
                totalRows: data.length,
                emptyRegs: emptyRegs.length,
                duplicates: [...new Set(duplicates)].length,
                missingMake: noMake,
                missingModel: noModel
            }
        };
    },
    
    /**
     * Preview first N rows
     * @param {Array} data 
     * @param {number} count 
     * @returns {Array}
     */
    preview(data, count = 5) {
        return data.slice(0, count);
    },
    
    /**
     * Get column headers from data
     * @param {Array} data 
     * @returns {Array}
     */
    getHeaders(data) {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]);
    },
    
    /**
     * Map columns to standard fields
     * @param {Array} data 
     * @param {Object} mapping - { csvColumn: standardField }
     * @returns {Array}
     */
    remapColumns(data, mapping) {
        return data.map(row => {
            const newRow = {};
            Object.entries(row).forEach(([key, value]) => {
                const newKey = mapping[key] || key;
                newRow[newKey] = value;
            });
            return newRow;
        });
    },
    
    /**
     * Detect ClickDealer format
     * @param {Array} headers 
     * @returns {boolean}
     */
    isClickDealerFormat(headers) {
        const clickDealerSignatures = ['reg', 'registration', 'vrm', 'make', 'model', 'cost price', 'retail price'];
        const lowerHeaders = headers.map(h => h.toLowerCase());
        return clickDealerSignatures.some(sig => lowerHeaders.includes(sig));
    },
    
    /**
     * Export data to CSV string
     * @param {Array} data 
     * @returns {string}
     */
    exportToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csv = Papa.unparse({
            fields: headers,
            data: data
        });
        
        return csv;
    },
    
    /**
     * Download CSV file
     * @param {string} csvContent 
     * @param {string} filename 
     */
    downloadCSV(csvContent, filename = 'export.csv') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Load Papa Parse from CDN if not already loaded
if (typeof Papa === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
    script.async = true;
    document.head.appendChild(script);
}
