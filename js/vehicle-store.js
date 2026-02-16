/**
 * Capeye Vehicle Store Module
 * Manages vehicle data from ClickDealer imports with upsert support
 */

const VehicleStore = {
    STORAGE_KEY: 'capeye_vehicles',
    IMPORT_HISTORY_KEY: 'capeye_import_history',
    
    /**
     * Get all vehicles
     */
    getAll() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    /**
     * Get vehicle by Stock No (primary key)
     */
    getByStockNo(stockNo) {
        if (!stockNo) return null;
        const vehicles = this.getAll();
        return vehicles.find(v => v.stockNo && v.stockNo.toUpperCase() === stockNo.toUpperCase());
    },
    
    /**
     * Get vehicle by registration (fallback)
     */
    getByRegistration(reg) {
        if (!reg) return null;
        const vehicles = this.getAll();
        return vehicles.find(v => v.registration && v.registration.toUpperCase() === reg.toUpperCase());
    },
    
    /**
     * Find existing vehicle by Stock No or Registration
     */
    findExisting(vehicle) {
        // First try Stock No (most reliable)
        if (vehicle.stockNo) {
            const byStockNo = this.getByStockNo(vehicle.stockNo);
            if (byStockNo) return byStockNo;
        }
        
        // Fallback to Registration
        if (vehicle.registration) {
            const byReg = this.getByRegistration(vehicle.registration);
            if (byReg) return byReg;
        }
        
        return null;
    },
    
    /**
     * Add new vehicle
     */
    add(vehicle) {
        const vehicles = this.getAll();
        vehicle.id = 'veh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        vehicle.createdAt = new Date().toISOString();
        vehicle.lastImportDate = new Date().toISOString();
        vehicles.push(vehicle);
        this.save(vehicles);
        return vehicle;
    },
    
    /**
     * Update vehicle - merges new data with existing, preserving fields not in CSV
     */
    update(existingId, newData) {
        const vehicles = this.getAll();
        const index = vehicles.findIndex(v => v.id === existingId);
        
        if (index !== -1) {
            const existing = vehicles[index];
            
            // Fields that should NOT be overwritten if they have values in existing
            // but are empty in new data (preserve existing data)
            const preserveFields = ['workshopStatus', 'valetStatus', 'accountsStatus', 
                                   'mechanicalNotes', 'bodyworkNotes', 'valetNotes',
                                   'accountsNotes', 'salesNotes', 'images', 'documents',
                                   'pdIComplete', 'prepComplete', 'salePrice', 'customer',
                                   'saleDate', 'margin', 'salesPerson', 'workshopAssigned',
                                   'valetAssigned', 'accountsAssigned', 'prepStatus',
                                   'bodyworkStatus', 'mechanicalStatus', 'partsStatus'];
            
            // Start with new data
            let merged = { ...newData };
            
            // Preserve existing fields that have values but are empty in new data
            preserveFields.forEach(field => {
                if (existing[field] && (!newData[field] || newData[field] === '' || newData[field] === 0)) {
                    merged[field] = existing[field];
                }
            });
            
            // Always preserve the original ID and creation date
            merged.id = existing.id;
            merged.createdAt = existing.createdAt;
            merged.updatedAt = new Date().toISOString();
            merged.lastImportDate = new Date().toISOString();
            
            // Keep the stockNo from new data if available, otherwise keep existing
            if (!merged.stockNo && existing.stockNo) {
                merged.stockNo = existing.stockNo;
            }
            
            // Keep the registration from new data if available, otherwise keep existing
            if (!merged.registration && existing.registration) {
                merged.registration = existing.registration;
            }
            
            vehicles[index] = merged;
            this.save(vehicles);
            return vehicles[index];
        }
        return null;
    },
    
    /**
     * Save all vehicles
     */
    save(vehicles) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vehicles));
    },
    
    /**
     * Clear all vehicles
     */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    /**
     * Bulk import from CSV data - UPSERT operation
     * Updates existing vehicles by Stock No or Registration
     * Adds new vehicles if not found
     */
    bulkImport(csvData) {
        const stats = { total: 0, created: 0, updated: 0, errors: [], details: [] };
        
        csvData.forEach((row, idx) => {
            try {
                // Map CSV columns to vehicle object
                const vehicle = this.mapCSVRow(row);
                
                // Skip if no identifiers
                if (!vehicle.stockNo && !vehicle.registration) {
                    stats.errors.push({ row: idx, error: 'No Stock No or Registration found' });
                    return;
                }
                
                // Find existing vehicle
                const existing = this.findExisting(vehicle);
                
                if (existing) {
                    // UPDATE existing vehicle
                    this.update(existing.id, vehicle);
                    stats.updated++;
                    stats.details.push({
                        row: idx,
                        action: 'updated',
                        stockNo: vehicle.stockNo,
                        registration: vehicle.registration,
                        make: vehicle.make,
                        model: vehicle.model
                    });
                } else {
                    // ADD new vehicle
                    this.add(vehicle);
                    stats.created++;
                    stats.details.push({
                        row: idx,
                        action: 'created',
                        stockNo: vehicle.stockNo,
                        registration: vehicle.registration,
                        make: vehicle.make,
                        model: vehicle.model
                    });
                }
                stats.total++;
                
            } catch (error) {
                stats.errors.push({ row: idx, error: error.message });
            }
        });
        
        // Record import
        this.recordImport(stats);
        
        return stats;
    },
    
    /**
     * Map CSV row to vehicle object
     * Handles ClickDealer column variations
     */
    mapCSVRow(row) {
        // Helper to clean numeric values
        const cleanNumber = (val) => {
            if (!val) return 0;
            const cleaned = val.toString().replace(/[£,$,€,\s,comm]/g, '').replace(/,/g, '');
            return parseFloat(cleaned) || 0;
        };
        
        // Helper to clean string values
        const cleanString = (val) => {
            if (!val) return '';
            return val.toString().trim();
        };
        
        // Extract year from Reg Date if available
        let year = null;
        const regDate = row.regDate || row['Reg Date'] || '';
        if (regDate && regDate.includes('/')) {
            const parts = regDate.split('/');
            if (parts.length === 3) {
                year = parseInt(parts[2]);
            }
        }
        
        return {
            // Primary identifier - Stock No
            stockNo: cleanString(row.stockNo || row['Stock No'] || row.stock_no || row.stockno || row.stock || ''),
            
            // Registration
            registration: cleanString(row.registration || row['Reg No'] || row.Reg || row.REG || row.vrm || ''),
            
            // Vehicle details
            make: cleanString(row.make || row.Make || row.MANUFACTURER || ''),
            model: cleanString(row.model || row.Model || row.MODEL || ''),
            variant: cleanString(row.variant || row.Variant || row.VARIANT || row.trim || ''),
            year: parseInt(row.year || row.YEAR) || year || null,
            colour: cleanString(row.colour || row.Colour || row.COLOR || row.Colour || ''),
            fuelType: cleanString(row.fuelType || row.Fuel || row.FUEL || ''),
            transmission: cleanString(row.transmission || row.Transmission || row.Gbox || row.GEARBOX || ''),
            mileage: cleanNumber(row.mileage || row.Mileage || row.MILEAGE),
            body: cleanString(row.body || row.Body || row.BODY || ''),
            doors: parseInt(row.doors || row.Doors) || 0,
            
            // Location and Status
            location: cleanString(row.location || row.Location || row['Location '] || 'Unknown'),
            status: cleanString(row.status || row.Status || row.STATUS || 'In Stock'),
            
            // Dates
            dateInStock: row.dateInStock || row['Date In Stock'] || new Date().toISOString(),
            regDate: regDate,
            mot: row.mot || row.MOT || '',
            
            // Financial
            costPrice: cleanNumber(row.costPrice || row['Cost Price'] || row.Cost || row.PRICE),
            retailPrice: cleanNumber(row.retailPrice || row['Retail Price'] || row.retail),
            rfl: cleanNumber(row.rfl || row.RFL),
            
            // Additional fields from CSV
            fsh: row.fsh || row.FSH || '',
            keytag: row.keytag || row.Keytag || '',
            
            // Calculated fields
            daysInStock: this.calculateDaysInStock(row['Date In Stock'] || row.dateInStock)
        };
    },
    
    /**
     * Calculate days in stock from date
     */
    calculateDaysInStock(dateString) {
        if (!dateString) return 0;
        try {
            // Handle DD/MM/YYYY format
            let dateIn;
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    dateIn = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            } else {
                dateIn = new Date(dateString);
            }
            
            if (isNaN(dateIn.getTime())) return 0;
            
            const today = new Date();
            const diffTime = Math.abs(today - dateIn);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (e) {
            return 0;
        }
    },
    
    /**
     * Record import in history
     */
    recordImport(stats) {
        const history = this.getImportHistory();
        history.unshift({
            timestamp: new Date().toISOString(),
            total: stats.total,
            created: stats.created,
            updated: stats.updated,
            errors: stats.errors.length
        });
        // Keep last 50 imports
        localStorage.setItem(this.IMPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    },
    
    /**
     * Get import history
     */
    getImportHistory() {
        const data = localStorage.getItem(this.IMPORT_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    /**
     * Get vehicles by location
     */
    getByLocation(location) {
        const vehicles = this.getAll();
        return vehicles.filter(v => v.location && v.location.toUpperCase() === location.toUpperCase());
    },
    
    /**
     * Get vehicles by status
     */
    getByStatus(status) {
        const vehicles = this.getAll();
        return vehicles.filter(v => v.status && v.status.toUpperCase() === status.toUpperCase());
    },
    
    /**
     * Get vehicles by make
     */
    getByMake(make) {
        const vehicles = this.getAll();
        return vehicles.filter(v => v.make && v.make.toUpperCase() === make.toUpperCase());
    },
    
    /**
     * Search vehicles
     */
    search(query) {
        const vehicles = this.getAll();
        const q = query.toUpperCase();
        return vehicles.filter(v => 
            (v.stockNo && v.stockNo.toUpperCase().includes(q)) ||
            (v.registration && v.registration.toUpperCase().includes(q)) ||
            (v.make && v.make.toUpperCase().includes(q)) ||
            (v.model && v.model.toUpperCase().includes(q))
        );
    },
    
    /**
     * Get vehicle counts by status
     */
    getCountsByStatus() {
        const vehicles = this.getAll();
        const counts = {};
        vehicles.forEach(v => {
            const status = v.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    },
    
    /**
     * Get vehicle counts by location
     */
    getCountsByLocation() {
        const vehicles = this.getAll();
        const counts = {};
        vehicles.forEach(v => {
            const location = v.location || 'Unknown';
            counts[location] = (counts[location] || 0) + 1;
        });
        return counts;
    },
    
    /**
     * Get total investment
     */
    getTotalInvestment() {
        const vehicles = this.getAll();
        return vehicles.reduce((total, v) => total + (v.costPrice || 0), 0);
    },
    
    /**
     * Get vehicles ready for sale
     */
    getReadyForSale() {
        const vehicles = this.getAll();
        return vehicles.filter(v => v.status === 'In Stock' && v.location !== 'With Supplier');
    }
};
