/**
 * Capeye Vehicle Store Module
 * Manages vehicle data in LocalStorage with registration-based matching
 */

const VehicleStore = {
    STORAGE_KEY: 'capeye_vehicles',
    IMPORT_HISTORY_KEY: 'capeye_import_history',
    
    /**
     * Get all vehicles
     * @returns {Array} Array of vehicle objects
     */
    getAll() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    /**
     * Get vehicle by registration
     * @param {string} registration 
     * @returns {Object|null}
     */
    getByRegistration(registration) {
        const vehicles = this.getAll();
        return vehicles.find(v => v.registration === registration) || null;
    },
    
    /**
     * Add new vehicle
     * @param {Object} vehicle 
     * @returns {Object} Added vehicle with ID
     */
    add(vehicle) {
        const vehicles = this.getAll();
        
        // Check for duplicate registration
        if (this.getByRegistration(vehicle.registration)) {
            throw new Error(`Vehicle with registration ${vehicle.registration} already exists`);
        }
        
        // Add metadata
        vehicle.id = this.generateId();
        vehicle.createdAt = new Date().toISOString();
        vehicle.updatedAt = new Date().toISOString();
        vehicle.version = 1;
        
        vehicles.push(vehicle);
        this.save(vehicles);
        
        return vehicle;
    },
    
    /**
     * Update existing vehicle by registration
     * @param {string} registration 
     * @param {Object} updates 
     * @returns {Object} Updated vehicle
     */
    update(registration, updates) {
        const vehicles = this.getAll();
        const index = vehicles.findIndex(v => v.registration === registration);
        
        if (index === -1) {
            throw new Error(`Vehicle with registration ${registration} not found`);
        }
        
        // Merge updates, preserve metadata
        vehicles[index] = {
            ...vehicles[index],
            ...updates,
            id: vehicles[index].id, // Preserve ID
            createdAt: vehicles[index].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString(),
            version: (vehicles[index].version || 1) + 1
        };
        
        this.save(vehicles);
        return vehicles[index];
    },
    
    /**
     * Upsert vehicle - update if exists, create if new
     * @param {Object} vehicleData 
     * @returns {Object} Result with action and vehicle
     */
    upsert(vehicleData) {
        const existing = this.getByRegistration(vehicleData.registration);
        
        if (existing) {
            // Preserve certain fields that shouldn't be overwritten
            const preservedFields = {
                id: existing.id,
                createdAt: existing.createdAt,
                workflowStage: existing.workflowStage, // Preserve workflow progress
                notes: existing.notes,
                assignedTo: existing.assignedTo,
                photos: existing.photos,
                documents: existing.documents
            };
            
            const updated = this.update(vehicleData.registration, {
                ...vehicleData,
                ...preservedFields
            });
            
            return { action: 'updated', vehicle: updated };
        } else {
            const created = this.add(vehicleData);
            return { action: 'created', vehicle: created };
        }
    },
    
    /**
     * Delete vehicle by registration
     * @param {string} registration 
     * @returns {boolean}
     */
    delete(registration) {
        const vehicles = this.getAll();
        const filtered = vehicles.filter(v => v.registration !== registration);
        
        if (filtered.length === vehicles.length) {
            return false; // Not found
        }
        
        this.save(filtered);
        return true;
    },
    
    /**
     * Bulk import from CSV data
     * @param {Array} csvData - Array of parsed CSV rows
     * @returns {Object} Import statistics
     */
    bulkImport(csvData) {
        const stats = {
            total: csvData.length,
            created: 0,
            updated: 0,
            errors: [],
            timestamp: new Date().toISOString()
        };
        
        csvData.forEach((row, index) => {
            try {
                // Normalize registration
                const registration = this.normalizeRegistration(row.reg || row.registration || row.Reg || '');
                
                if (!registration) {
                    stats.errors.push({ row: index + 1, error: 'Missing registration' });
                    return;
                }
                
                // Map CSV fields to vehicle object
                const vehicleData = this.mapCsvToVehicle(row, registration);
                
                // Calculate days in stock if date available
                if (vehicleData.dateInStock) {
                    vehicleData.daysInStock = this.calculateDaysInStock(vehicleData.dateInStock);
                }
                
                // Perform upsert
                const result = this.upsert(vehicleData);
                stats[result.action]++;
                
            } catch (error) {
                stats.errors.push({ row: index + 1, error: error.message });
            }
        });
        
        // Save import history
        this.saveImportHistory(stats);
        
        // Update last import timestamp
        localStorage.setItem('capeye_last_import', new Date().toISOString());
        
        return stats;
    },
    
    /**
     * Map CSV row to vehicle object
     * @param {Object} row 
     * @param {string} registration 
     * @returns {Object}
     */
    mapCsvToVehicle(row, registration) {
        return {
            registration: registration,
            make: row.make || row.Make || row.manufacturer || '',
            model: row.model || row.Model || '',
            variant: row.variant || row.Variant || row.trim || '',
            year: parseInt(row.year || row.Year || row.regYear || 0) || null,
            colour: row.colour || row.Colour || row.color || '',
            fuelType: row.fuelType || row['Fuel Type'] || row.fuel || '',
            transmission: row.transmission || row.Transmission || '',
            engineSize: row.engineSize || row['Engine Size'] || '',
            mileage: parseInt(row.mileage || row.Mileage || row.miles || 0) || 0,
            
            // Stock information
            location: row.location || row.Location || 'Unknown',
            status: row.status || row.Status || 'In Stock',
            dateInStock: this.parseDate(row.dateInStock || row['Date In Stock'] || row.stockDate),
            costPrice: parseFloat(row.costPrice || row['Cost Price'] || row.cost || 0) || 0,
            retailPrice: parseFloat(row.retailPrice || row['Retail Price'] || row.retail || 0) || 0,
            
            // Financial
            totalCost: parseFloat(row.totalCost || row['Total Cost'] || 0) || 0,
            estimatedLoss: parseFloat(row.estimatedLoss || row['Est. Loss'] || 0) || null,
            
            // Flags
            readyForSale: this.parseBoolean(row.readyForSale || row['Ready for Sale']),
            reserved: this.parseBoolean(row.reserved || row.Reserved),
            sold: this.parseBoolean(row.sold || row.Sold),
            
            // Source
            source: row.source || row.Source || 'ClickDealer',
            sourceId: row.sourceId || row['Source ID'] || '',
            
            // Metadata
            importBatch: new Date().toISOString().split('T')[0]
        };
    },
    
    /**
     * Save vehicles array to LocalStorage
     * @param {Array} vehicles 
     */
    save(vehicles) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vehicles));
    },
    
    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Normalize registration plate
     * @param {string} reg 
     * @returns {string}
     */
    normalizeRegistration(reg) {
        return reg.toString().toUpperCase().replace(/\s+/g, '').trim();
    },
    
    /**
     * Parse date from various formats
     * @param {string} dateStr 
     * @returns {string|null} ISO date string
     */
    parseDate(dateStr) {
        if (!dateStr) return null;
        
        // Try parsing various formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
        
        // Try UK format DD/MM/YYYY
        const ukMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (ukMatch) {
            const [, day, month, year] = ukMatch;
            const ukDate = new Date(`${year}-${month}-${day}`);
            if (!isNaN(ukDate.getTime())) {
                return ukDate.toISOString();
            }
        }
        
        return null;
    },
    
    /**
     * Parse boolean from various formats
     * @param {*} value 
     * @returns {boolean}
     */
    parseBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return ['yes', 'true', '1', 'y'].includes(value.toLowerCase());
        }
        return false;
    },
    
    /**
     * Calculate days in stock
     * @param {string} dateInStock ISO date string
     * @returns {number}
     */
    calculateDaysInStock(dateInStock) {
        const start = new Date(dateInStock);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    /**
     * Save import history
     * @param {Object} stats 
     */
    saveImportHistory(stats) {
        const history = this.getImportHistory();
        history.unshift(stats); // Add to beginning
        // Keep only last 50 imports
        if (history.length > 50) history.pop();
        localStorage.setItem(this.IMPORT_HISTORY_KEY, JSON.stringify(history));
    },
    
    /**
     * Get import history
     * @returns {Array}
     */
    getImportHistory() {
        const data = localStorage.getItem(this.IMPORT_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    /**
     * Search vehicles
     * @param {string} query 
     * @returns {Array}
     */
    search(query) {
        const vehicles = this.getAll();
        const lowerQuery = query.toLowerCase();
        
        return vehicles.filter(v => 
            v.registration.toLowerCase().includes(lowerQuery) ||
            v.make.toLowerCase().includes(lowerQuery) ||
            v.model.toLowerCase().includes(lowerQuery) ||
            (v.colour && v.colour.toLowerCase().includes(lowerQuery))
        );
    },
    
    /**
     * Filter vehicles by criteria
     * @param {Object} criteria 
     * @returns {Array}
     */
    filter(criteria) {
        let vehicles = this.getAll();
        
        if (criteria.location) {
            vehicles = vehicles.filter(v => v.location === criteria.location);
        }
        if (criteria.status) {
            vehicles = vehicles.filter(v => v.status === criteria.status);
        }
        if (criteria.make) {
            vehicles = vehicles.filter(v => v.make === criteria.make);
        }
        if (criteria.overdue) {
            vehicles = vehicles.filter(v => v.daysInStock > 60);
        }
        if (criteria.lossMakers) {
            vehicles = vehicles.filter(v => v.estimatedLoss && v.estimatedLoss > 0);
        }
        if (criteria.readyForSale) {
            vehicles = vehicles.filter(v => v.readyForSale && !v.sold);
        }
        
        return vehicles;
    },
    
    /**
     * Get unique values for dropdowns
     * @param {string} field 
     * @returns {Array}
     */
    getUniqueValues(field) {
        const vehicles = this.getAll();
        const values = [...new Set(vehicles.map(v => v[field]).filter(Boolean))];
        return values.sort();
    },
    
    /**
     * Export all data (for backup)
     * @returns {Object}
     */
    exportAll() {
        return {
            vehicles: this.getAll(),
            importHistory: this.getImportHistory(),
            exportedAt: new Date().toISOString()
        };
    },
    
    /**
     * Import from backup (restore)
     * @param {Object} data 
     */
    importBackup(data) {
        if (data.vehicles) {
            this.save(data.vehicles);
        }
        if (data.importHistory) {
            localStorage.setItem(this.IMPORT_HISTORY_KEY, JSON.stringify(data.importHistory));
        }
    },
    
    /**
     * Clear all data (use with caution)
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.IMPORT_HISTORY_KEY);
        localStorage.removeItem('capeye_last_import');
    }
};
