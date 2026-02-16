// CAPEYE Data Management Module
// Handles all data operations, CSV parsing, and state management

const CapeyeData = {
    // Sample inventory data structure based on ClickDealer export
    inventory: [
        {stockNo: "A1234", reg: "RF73 OSL", make: "Ford", model: "Transit Custom", variant: "280 Trend", colour: "White", mileage: 15200, fuel: "Diesel", body: "Panel Van", status: "In Stock", location: "Stanmore Retail", price: 24500, regDate: "2023-09-15", cost: 18500},
        {stockNo: "A1235", reg: "RK23 HFR", make: "Mercedes", model: "Sprinter", variant: "314 CDI", colour: "Silver", mileage: 8500, fuel: "Diesel", body: "Panel Van", status: "In Transit", location: "With Supplier", price: 38900, regDate: "2023-05-20", cost: 32000},
        {stockNo: "A1236", reg: "CE22 LMV", make: "VW", model: "Transporter", variant: "T32 Highline", colour: "Grey", mileage: 22100, fuel: "Diesel", body: "Panel Van", status: "Off-site R", location: "Workshop Bay 2", price: 28900, regDate: "2022-11-03", cost: 24000},
        {stockNo: "A1237", reg: "RJ23 ABC", make: "Vauxhall", model: "Vivaro", variant: "2900 Sportive", colour: "Black", mileage: 12000, fuel: "Diesel", body: "Panel Van", status: "In Stock", location: "Stanmore Retail", price: 19900, regDate: "2023-06-10", cost: 15500},
        {stockNo: "A1238", reg: "MX23 XYZ", make: "Ford", model: "Ranger", variant: "Wildtrak", colour: "Blue", mileage: 8000, fuel: "Diesel", body: "Pickup", status: "In Stock", location: "Stanmore 2", price: 32900, regDate: "2023-08-01", cost: 27500},
        {stockNo: "A1239", reg: "RF23 DEF", make: "Peugeot", model: "Expert", variant: "Professional", colour: "White", mileage: 18500, fuel: "Diesel", body: "Panel Van", status: "In Stock", location: "Stanmore Retail", price: 21500, regDate: "2023-07-15", cost: 17000},
        {stockNo: "A1240", reg: "RK23 GHI", make: "Citroen", model: "Dispatch", variant: "Enterprise", colour: "Grey", mileage: 9500, fuel: "Diesel", body: "Panel Van", status: "In Stock", location: "Stanmore PDI", price: 18900, regDate: "2023-08-20", cost: 14500},
    ],

    // Staff data
    staff: [
        {id: 1, name: "Keith Hardy", role: "General Manager", department: "Management", email: "keith@autocapital.co.uk"},
        {id: 2, name: "Ibrahim Ata", role: "Sales Manager", department: "Sales", email: "ibrahim@autocapital.co.uk"},
        {id: 3, name: "Ali Soliemani", role: "Showroom Manager", department: "Sales", email: "ali.s@autocapital.co.uk"},
        {id: 4, name: "Marcin Kiljan", role: "Workshop Lead", department: "Workshop", email: "marcin@autocapital.co.uk"},
        {id: 5, name: "Morteza Rahamian", role: "Senior Mechanic", department: "Workshop", email: "morteza@autocapital.co.uk"},
        {id: 6, name: "Stanslaw Marzec", role: "Procurement", department: "Intake", email: "stanslaw@autocapital.co.uk"},
        {id: 7, name: "Gorgino Barnes", role: "Valeting Lead", department: "Valeting", email: "gorgino@autocapital.co.uk"},
    ],

    // Reference data
    reference: {
        manufacturers: ["Ford", "Mercedes", "VW", "Vauxhall", "Peugeot", "Citroen", "Renault", "Toyota", "Maxus"],
        locations: ["Stanmore Retail", "Stanmore PDI", "Stanmore 2", "Workshop Bay 1", "Workshop Bay 2", "Workshop Bay 3", "Valeting", "With Supplier", "ACL"],
        statuses: ["In Stock", "In Transit", "Off-site R", "Subject to", "With Supplier"],
        departments: ["Management", "Sales", "Workshop", "Valeting", "Accounts", "Intake"],
        faults: ["Suspension", "Electrical", "Cooling", "AC", "Exhaust", "Brakes", "Bodywork", "Locks", "Lighting", "Tyres", "Turbo", "Fuel"],
        repairs: ["Inspect", "Adjust", "Clean", "Replace", "Repair", "Software Update", "Outsource", "Lubricate"],
        parts: ["Air Filter", "Oil Filter", "Fuel Filter", "Cabin Filter", "Brake Pads", "Brake Discs", "Timing Belt", "Water Pump", "Alternator", "Battery", "Tyres"]
    },

    // Calculate days in stock
    getDaysInStock(regDate) {
        const today = new Date();
        const reg = new Date(regDate);
        return Math.floor((today - reg) / (1000 * 60 * 60 * 24));
    },

    // Get KPI metrics
    getKPIs() {
        const total = this.inventory.length;
        const ready = this.inventory.filter(v => v.status === "In Stock").length;
        const overdue = this.inventory.filter(v => this.getDaysInStock(v.regDate) > 60).length;
        const totalValue = this.inventory.reduce((sum, v) => sum + (v.price || 0), 0);
        
        return {
            totalStock: total,
            readyStock: ready,
            overdueStock: overdue,
            stockValue: totalValue
        };
    },

    // Get stock by manufacturer
    getStockByMake() {
        const makes = {};
        this.inventory.forEach(v => {
            makes[v.make] = (makes[v.make] || 0) + 1;
        });
        return makes;
    },

    // Get stock by location
    getStockByLocation() {
        const locations = {};
        this.inventory.forEach(v => {
            locations[v.location] = (locations[v.location] || 0) + 1;
        });
        return locations;
    },

    // Parse CSV upload
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        return data;
    },

    // Import CSV data
    importCSV(csvText) {
        const parsed = this.parseCSV(csvText);
        // Map ClickDealer fields to our structure
        this.inventory = parsed.map(row => ({
            stockNo: row['Stock No'] || row['StockNo'] || '',
            reg: row['Reg No'] || row['Reg'] || '',
            make: row['Make'] || '',
            model: row['Model'] || '',
            variant: row['Variant'] || '',
            colour: row['Colour'] || '',
            mileage: parseInt(row['Mileage']) || 0,
            fuel: row['Fuel'] || '',
            body: row['Body'] || '',
            status: row['Status'] || 'In Stock',
            location: row['Location'] || 'Stanmore Retail',
            price: parseFloat(row['Price']) || 0,
            regDate: row['Reg Date'] || new Date().toISOString().split('T')[0],
            cost: parseFloat(row['Cost']) || 0
        }));
        
        // Save to localStorage
        this.saveToStorage();
        return this.inventory;
    },

    // Save to localStorage
    saveToStorage() {
        localStorage.setItem('capeye_inventory', JSON.stringify(this.inventory));
    },

    // Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('capeye_inventory');
        if (stored) {
            this.inventory = JSON.parse(stored);
        }
    },

    // Get vehicle by registration
    getVehicleByReg(reg) {
        return this.inventory.find(v => v.reg.toLowerCase() === reg.toLowerCase());
    },

    // Update vehicle
    updateVehicle(reg, updates) {
        const index = this.inventory.findIndex(v => v.reg.toLowerCase() === reg.toLowerCase());
        if (index !== -1) {
            this.inventory[index] = { ...this.inventory[index], ...updates };
            this.saveToStorage();
            return true;
        }
        return false;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    CapeyeData.loadFromStorage();
});
