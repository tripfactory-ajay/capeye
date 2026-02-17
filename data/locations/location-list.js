/**
 * Capeye Auto Capital - Vehicle Locations
 * All physical locations where vehicles can be stored or processed
 */

const LOCATION_DATA = {
    locations: [
        { id: 'stanmore_retail', name: 'Stanmore Retail', type: 'showroom', address: '' },
        { id: 'stanmore_2', name: 'Stanmore 2', type: 'storage', address: '' },
        { id: 'stanmore_pdi', name: 'Stanmore PDI', type: 'prep', address: '' },
        { id: 'acl', name: 'ACL', type: 'storage', address: '' },
        { id: 'with_supplier', name: 'With Supplier', type: 'external', address: '' },
        { id: 'offsite', name: 'Off-site R', type: 'external', address: '' },
        { id: 'bodyshop', name: 'Bodyshop', type: 'workshop', address: '' },
        { id: 'workshop', name: 'Main Workshop', type: 'workshop', address: '' },
        { id: 'valeting', name: 'Valeting Bay', type: 'prep', address: '' },
        { id: 'photography', name: 'Photo Studio', type: 'media', address: '' },
        { id: 'transit', name: 'In Transit', type: 'transport', address: '' },
        { id: 'delivered', name: 'Delivered', type: 'complete', address: '' }
    ],
    
    // Get locations by type
    getByType: function(type) {
        return this.locations.filter(loc => loc.type === type);
    },
    
    // Get all location names for dropdowns
    getAllNames: function() {
        return this.locations.map(loc => loc.name);
    },
    
    // Get location by ID
    getById: function(id) {
        return this.locations.find(loc => loc.id === id) || null;
    }
};
