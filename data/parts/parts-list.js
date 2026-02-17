/**
 * Capeye Auto Capital - Parts Database
 * Common parts used in repairs and servicing
 */

const PARTS_DATA = {
    categories: [
        { id: 'service', name: 'Service Items', icon: '🔧' },
        { id: 'brakes', name: 'Brakes', icon: '🛑' },
        { id: 'engine', name: 'Engine', icon: '⚙️' },
        { id: 'electrical', name: 'Electrical', icon: '🔋' },
        { id: 'body', name: 'Body Parts', icon: '🚗' },
        { id: 'tyres', name: 'Tyres', icon: '🛞' },
        { id: 'interior', name: 'Interior', icon: '🪑' }
    ],
    
    parts: {
        service: [
            'Engine Oil',
            'Oil Filter',
            'Air Filter',
            'Cabin/Pollen Filter',
            'Fuel Filter',
            'Spark Plugs',
            'Glow Plugs',
            'Timing Belt',
            'Auxiliary Belt',
            'Coolant',
            'Brake Fluid',
            'Power Steering Fluid',
            'Washer Fluid',
            'AdBlue'
        ],
        brakes: [
            'Front Brake Pads',
            'Rear Brake Pads',
            'Front Brake Discs',
            'Rear Brake Discs',
            'Brake Caliper',
            'Brake Hose',
            'Handbrake Cable',
            'Brake Master Cylinder',
            'Brake Servo'
        ],
        engine: [
            'Water Pump',
            'Thermostat',
            'Radiator',
            'Intercooler',
            'Turbocharger',
            'EGR Valve',
            'MAF Sensor',
            'Lambda Sensor',
            'Injectors',
            'Fuel Pump',
            'Starter Motor',
            'Alternator'
        ],
        electrical: [
            'Battery',
            'Headlight Bulb',
            'Brake Light Bulb',
            'Indicator Bulb',
            'Wiper Blades',
            'Fuse',
            'Relay',
            'Window Motor',
            'Mirror Motor',
            'Central Locking Actuator'
        ],
        body: [
            'Bumper - Front',
            'Bumper - Rear',
            'Bonnet',
            'Boot Lid',
            'Door - Front',
            'Door - Rear',
            'Wing - Front',
            'Wing - Rear',
            'Headlight',
            'Taillight',
            'Mirror',
            'Windscreen',
            'Rear Window',
            'Door Handle',
            'Fuel Cap'
        ],
        tyres: [
            'Tyre 195/65 R16',
            'Tyre 205/55 R16',
            'Tyre 215/60 R16',
            'Tyre 235/65 R16',
            'Tyre 215/70 R15',
            'Tyre 225/45 R17',
            'Tyre 235/45 R18',
            'Space Saver Spare',
            'Full Size Spare',
            'Valve Stem',
            'Wheel Nut',
            'Locking Wheel Nut Set'
        ],
        interior: [
            'Floor Mats Set',
            'Seat Cover',
            'Steering Wheel Cover',
            'Gear Knob',
            'Pedal Set',
            'Sun Visor',
            'Interior Bulb',
            '12V Socket',
            'USB Charger',
            'Phone Holder'
        ]
    },
    
    // Get parts by category
    getByCategory: function(category) {
        return this.parts[category] || [];
    },
    
    // Search parts
    search: function(query) {
        const results = [];
        const q = query.toLowerCase();
        Object.keys(this.parts).forEach(cat => {
            this.parts[cat].forEach(part => {
                if (part.toLowerCase().includes(q)) {
                    results.push({
                        category: cat,
                        part: part,
                        categoryInfo: this.categories.find(c => c.id === cat)
                    });
                }
            });
        });
        return results;
    },
    
    // Get all parts
    getAll: function() {
        let all = [];
        Object.keys(this.parts).forEach(cat => {
            this.parts[cat].forEach(part => {
                all.push({
                    category: cat,
                    part: part,
                    categoryInfo: this.categories.find(c => c.id === cat)
                });
            });
        });
        return all;
    }
};
