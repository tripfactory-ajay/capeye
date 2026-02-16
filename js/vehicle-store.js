/**
 * Capeye Vehicle Store Module
 * Manages vehicle data from ClickDealer imports
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
     * Get vehicle by registration
     */
    getByRegistration(reg) {
        const vehicles = this.getAll();
        return vehicles.find(v => v.registration && v.registration.toUpperCase() === reg.toUpperCase());
    },
    
    /**
     * Add new vehicle
     */
    add(vehicle) {
        const vehicles = this.getAll();
        vehicle.id = 'veh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        vehicle.createdAt = new Date().toISOString();
        vehicles.push(vehicle);
        this.save(vehicles);
        return vehicle;
    },
    
    /**
     * Update vehicle
     */
    update(reg, updates) {
        const vehicles = this.getAll();
        const index = vehicles.findIndex(v => v.registration && v.registration.toUpperCase() === reg.toUpperCase());
        if (index !== -1) {
            vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
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
     * Bulk import from CSV data
     */
    bulkImport(csvData) {
        const vehicles = this.getAll();
        const stats = { total: 0, created: 0, updated: 0, errors: [] };
        
        csvData.forEach((row, idx) => {
            try {
                // Map CSV columns to vehicle object
                const vehicle = this.mapCSVRow(row);
                
                if (vehicle.registration) {
                    const existing = this.getByRegistration(vehicle.registration);
                    
                    if (existing) {
                        // Update existing
                        this.update(vehicle.registration, vehicle);
                        stats.updated++;
                    } else {
                        // Add new
                        this.add(vehicle);
                        stats.created++;
                    }
                    stats.total++;
                }
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
     */
    mapCSVRow(row) {
        return {
            registration: row.registration || row.Reg || row.REG || row.vrm || '',
            make: row.make || row.Make || row.MANUFACTURER || '',
            model: row.model || row.Model || row.MODEL || '',
            variant: row.variant || row.Variant || row.trim || '',
            year: parseInt(row.year || row.YEAR || row.regYear) || null,
            colour: row.colour || row.Colour || row.COLOR || '',
            fuelType: row.fuelType || row.fuel || row.FUEL || '',
            transmission: row.transmission || row.Transmission || row.GEARBOX || '',
            mileage: parseInt(row.mileage || row.MILEAGE || row.miles) || 0,
            location: row.location || row.Location || row.SITE || 'Unknown',
            status: row.status || row.Status || row.STOCK_STATUS || 'In Stock',
            dateInStock: row.dateInStock || row.date_in_stock || new Date().toISOString(),
            costPrice: parseFloat(row.costPrice || row.cost || row.COST) || 0,
            retailPrice: parseFloat(row.retailPrice || row.retail || row.PRICE) || 0,
            totalCost: parseFloat(row.totalCost) || parseFloat(row.costPrice) || 0,
            daysInStock: parseInt(row.daysInStock) || 0
        };
    },
    
    /**
     * Record import in history
     */
    recordImport(stats) {
        const history = this.getImportHistory();
        history.unshift({
            timestamp: new Date().toISOString(),
            ...stats
        });
        // Keep last 20 imports
        localStorage.setItem(this.IMPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    },
    
    /**
     * Get import history
     */
    getImportHistory() {
        const data = localStorage.getItem(this.IMPORT_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    }
};
