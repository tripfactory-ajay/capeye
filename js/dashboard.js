// CAPEYE Dashboard Module
// Main dashboard functionality and event handlers

document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    CapeyeData.loadFromStorage();
    
    // Initialize charts
    CapeyeCharts.initDashboard();
    
    // Update KPI cards
    updateKPIs();
    
    // Setup upload handlers
    setupUploadHandlers();
    
    // Setup navigation
    setupNavigation();
});

// Update KPI displays
function updateKPIs() {
    const kpis = CapeyeData.getKPIs();
    
    document.getElementById('totalStock').textContent = kpis.totalStock;
    document.getElementById('readyStock').textContent = kpis.readyStock;
    document.getElementById('overdueStock').textContent = kpis.overdueStock;
    document.getElementById('stockValue').textContent = '£' + (kpis.stockValue / 1000000).toFixed(1) + 'M';
}

// Setup CSV upload handlers
function setupUploadHandlers() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('csvInput');
    
    // Click to upload
    uploadZone.addEventListener('click', () => fileInput.click());
    
    // File selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) {
                handleFileUpload(file);
            } else {
                showNotification('Please upload a CSV file', 'error');
            }
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Parse and import CSV
            CapeyeData.importCSV(e.target.result);
            
            // Update UI
            updateKPIs();
            CapeyeCharts.updateAll();
            
            showNotification(`Successfully imported ${CapeyeData.inventory.length} vehicles`, 'success');
            
            // Update recent intakes table
            updateRecentIntakes();
            
        } catch (error) {
            console.error('CSV parsing error:', error);
            showNotification('Error parsing CSV file. Please check the format.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Update recent intakes table
function updateRecentIntakes() {
    const tbody = document.getElementById('recentIntakes');
    if (!tbody) return;
    
    // Get 5 most recent vehicles
    const recent = [...CapeyeData.inventory]
        .sort((a, b) => new Date(b.regDate) - new Date(a.regDate))
        .slice(0, 5);
    
    tbody.innerHTML = recent.map(vehicle => {
        const days = CapeyeData.getDaysInStock(vehicle.regDate);
        const statusClass = vehicle.status === 'In Stock' ? 'status-instock' : 
                           vehicle.status === 'In Transit' ? 'status-transit' : 
                           vehicle.status === 'Off-site R' ? 'status-offsite' : 'status-supplier';
        
        return `
            <tr class="hover:bg-slate-800/50 transition cursor-pointer" onclick="viewVehicle('${vehicle.reg}')">
                <td class="py-3 px-4 font-mono text-blue-400">${vehicle.reg}</td>
                <td class="py-3 px-4">${vehicle.make} ${vehicle.model}</td>
                <td class="py-3 px-4"><span class="status-badge ${statusClass}">${vehicle.status}</span></td>
                <td class="py-3 px-4 text-slate-400">${vehicle.location}</td>
                <td class="py-3 px-4">${days} days</td>
            </tr>
        `;
    }).join('');
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 alert`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// View vehicle details
function viewVehicle(reg) {
    const vehicle = CapeyeData.getVehicleByReg(reg);
    if (vehicle) {
        // Store selected vehicle and redirect to inventory
        sessionStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
        window.location.href = 'inventory.html';
    }
}

// Show notifications panel
function showNotifications() {
    // Implementation for notifications dropdown/panel
    console.log('Show notifications panel');
}

// Setup navigation highlighting
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Export functions for global access
window.updateKPIs = updateKPIs;
window.viewVehicle = viewVehicle;
window.showNotification = showNotification;
