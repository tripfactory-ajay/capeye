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
            // Stock Number (PRIMARY KEY)
            'stock no': 'stockNo',
            'stock number': 'stockNo',
            'stockno': 'stockNo',
            'stock_id': 'stockNo',
            'stock': 'stockNo',
            
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
            'reg date': 'regDate',
            'colour': 'colour',
            'color': 'colour',
            'paint': 'colour',
            'fuel': 'fuelType',
            'fuel type': 'fuelType',
            'transmission': 'transmission',
            'gearbox': 'transmission',
            'gbox': 'transmission',
            'engine': 'engineSize',
            'engine size': 'engineSize',
            'cc': 'engineSize',
            'mileage': 'mileage',
            'miles': 'mileage',
            'body': 'body',
            'body type': 'body',
            'doors': 'doors',
            
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
            'mot': 'mot',
            'mot date': 'mot',
            
            // Financial
            'cost': 'costPrice',
            'cost price': 'costPrice',
            'purchase price': 'costPrice',
            'price': 'retailPrice',
            'retail': 'retailPrice',
            'retail price': 'retailPrice',
            'sale price': 'retailPrice',
            'total cost': 'totalCost',
            'total investment': 'totalCost',
            'loss': 'estimatedLoss',
            'est loss': 'estimatedLoss',
            'estimated loss': 'estimatedLoss',
            'profit': 'estimatedProfit',
            'rfl': 'rfl',
            'road tax': 'rfl',
            
            // Flags
            'ready': 'readyForSale',
            'ready for sale': 'readyForSale',
            'prepared': 'readyForSale',
            'reserved': 'reserved',
            'on hold': 'reserved',
            'sold': 'sold',
            'sale': 'sold',
            'fsh': 'fsh',
            'full service history': 'fsh',
            
            // Source
            'source': 'source',
            'supplier': 'source',
            'vendor': 'source',
            'source id': 'sourceId',
            'ref': 'sourceId',
            'reference': 'sourceId',
            'keytag': 'keytag'
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
        
        // Clean stock number
        if (transformed.stockNo) {
            transformed.stockNo = transformed.stockNo.toString().toUpperCase().trim();
        }
        
        // Clean numeric fields
        ['costPrice', 'retailPrice', 'totalCost', 'estimatedLoss', 'mileage', 'rfl'].forEach(field => {
            if (transformed[field]) {
                const cleaned = transformed[field].toString().replace(/[£,$,€,\s,comm]/g, '').replace(/,/g, '');
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
        
        // Check for Stock No OR Registration (either is acceptable)
        const sampleRow = data[0];
        const hasStockNo = 'stockNo' in sampleRow;
        const hasReg = 'registration' in sampleRow;
        
        if (!hasStockNo && !hasReg) {
            errors.push('CSV must have either Stock No or Registration column');
        }
        
        // Check for empty identifiers - WARNING only (not blocking)
        const emptyIds = data.filter((row, idx) => {
            const noStock = !row.stockNo || row.stockNo.toString().trim() === '';
            const noReg = !row.registration || row.registration.toString().trim() === '';
            return noStock && noReg;
        });
        
        if (emptyIds.length > 0) {
            // Only make this an error if more than 5% of rows are affected
            const threshold = Math.ceil(data.length * 0.05);
            if (emptyIds.length > threshold) {
                errors.push(`${emptyIds.length} rows missing both Stock No and Registration (${Math.round(emptyIds.length/data.length*100)}% of data)`);
            } else {
                warnings.push(`${emptyIds.length} rows missing both Stock No and Registration - these will be skipped during import`);
            }
        }
        
        // Check for duplicate Stock Nos - WARNING only
        const stockNos = data.map(r => r.stockNo).filter(Boolean);
        const dupStocks = stockNos.filter((item, index) => stockNos.indexOf(item) !== index);
        if (dupStocks.length > 0) {
            warnings.push(`Duplicate Stock Nos found: ${[...new Set(dupStocks)].slice(0, 5).join(', ')}${dupStocks.length > 5 ? '...' : ''} - duplicates will update the same record`);
        }
        
        // Check data quality - all warnings only
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
                emptyIds: emptyIds.length,
                duplicateStocks: [...new Set(dupStocks)].length,
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
        const clickDealerSignatures = ['stock no', 'reg', 'registration', 'vrm', 'make', 'model', 'cost price', 'retail price'];
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
