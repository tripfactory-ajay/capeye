// js/vehicle-search.js
class VehicleSearch {
    constructor(containerId, onSelect) {
        this.container = document.getElementById(containerId);
        this.onSelect = onSelect;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="vehicle-search" style="position: relative;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="vs-input" placeholder="Search stock no, reg, make, model..." 
                           style="flex: 1; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #f8fafc; font-size: 13px;">
                    <button id="vs-search" style="padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div id="vs-results" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: #1a1a24; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; max-height: 300px; overflow-y: auto; z-index: 100; display: none;"></div>
            </div>
        `;

        this.input = this.container.querySelector('#vs-input');
        this.results = this.container.querySelector('#vs-results');
        
        this.container.querySelector('#vs-search').addEventListener('click', () => this.search());
        this.input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.search();
            if (this.input.value.length > 2) this.search();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.results.style.display = 'none';
            }
        });
    }

    search() {
        const query = this.input.value.trim();
        if (!query) return;

        const vehicles = VehicleStore.search(query);
        this.showResults(vehicles);
    }

    showResults(vehicles) {
        if (vehicles.length === 0) {
            this.results.innerHTML = '<div style="padding: 12px; color: #64748b; font-size: 13px;">No vehicles found</div>';
            this.results.style.display = 'block';
            return;
        }

        this.results.innerHTML = vehicles.map(v => `
            <div class="vs-result" data-stock="${v.stockNo}" style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; hover: background: rgba(59,130,246,0.1);">
                <div style="font-weight: 600; color: #f8fafc; font-size: 13px;">${v.registration} - ${v.make} ${v.model}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    ${v.stockNo} | ${VehicleStore.STAGES[v.stage]?.name || v.stage} | ${v.assignedTo}
                </div>
            </div>
        `).join('');

        this.results.querySelectorAll('.vs-result').forEach(el => {
            el.addEventListener('click', () => {
                const stockNo = el.dataset.stock;
                const vehicle = VehicleStore.get(stockNo);
                this.onSelect(vehicle);
                this.results.style.display = 'none';
                this.input.value = vehicle.registration;
            });
        });

        this.results.style.display = 'block';
    }
}

window.VehicleSearch = VehicleSearch;
