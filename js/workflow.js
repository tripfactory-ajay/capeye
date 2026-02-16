// CAPEYE Workflow Module
// 12-stage vehicle workflow management

let currentVehicle = null;
let currentStage = 0;
let workflowData = {};

// Stage definitions
const stages = [
    { id: 1, name: "Vehicle Intake", dept: "Sales/Logistics", icon: "fa-clipboard-check", color: "blue" },
    { id: 2, name: "Bodywork & Cosmetic", dept: "Workshop", icon: "fa-car-crash", color: "purple" },
    { id: 3, name: "Dent & Paint", dept: "Bodyshop", icon: "fa-fill-drip", color: "pink" },
    { id: 4, name: "Legal & Documentation", dept: "Admin", icon: "fa-file-contract", color: "yellow" },
    { id: 5, name: "Mechanical & Diagnostic", dept: "Workshop", icon: "fa-cogs", color: "red" },
    { id: 6, name: "External & Electrical", dept: "Workshop", icon: "fa-bolt", color: "orange" },
    { id: 7, name: "Interior & Valeting", dept: "Valeting", icon: "fa-spray-can", color: "cyan" },
    { id: 8, name: "Fault Overview", dept: "Workshop Lead", icon: "fa-clipboard-list", color: "indigo" },
    { id: 9, name: "Ready/Advertising", dept: "Sales", icon: "fa-camera", color: "green" },
    { id: 10, name: "Customer Delivery", dept: "Sales", icon: "fa-key", color: "emerald" },
    { id: 11, name: "Accounts & Warranty", dept: "Accounts", icon: "fa-shield-alt", color: "teal" },
    { id: 12, name: "Management Overview", dept: "Management", icon: "fa-chart-line", color: "slate" }
];

document.addEventListener('DOMContentLoaded', function() {
    CapeyeData.loadFromStorage();
    populateVehicleSelect();
    renderStageGrid();
    
    // Check for reg parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const reg = urlParams.get('reg');
    if (reg) {
        document.getElementById('regSearch').value = reg;
        searchByReg();
    }
});

// Populate vehicle dropdown
function populateVehicleSelect() {
    const select = document.getElementById('vehicleSelect');
    CapeyeData.inventory.forEach(vehicle => {
        select.innerHTML += `<option value="${vehicle.reg}">${vehicle.reg} - ${vehicle.make} ${vehicle.model}</option>`;
    });
}

// Search by registration
function searchByReg() {
    const reg = document.getElementById('regSearch').value.trim();
    if (!reg) return;
    
    const vehicle = CapeyeData.getVehicleByReg(reg);
    if (vehicle) {
        document.getElementById('vehicleSelect').value = vehicle.reg;
        loadVehicleWorkflow();
    } else {
        alert('Vehicle not found: ' + reg);
    }
}

// Load vehicle workflow
function loadVehicleWorkflow() {
    const reg = document.getElementById('vehicleSelect').value;
    if (!reg) {
        document.getElementById('vehicleInfo').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('stageFormContainer').classList.add('hidden');
        return;
    }
    
    currentVehicle = CapeyeData.getVehicleByReg(reg);
    if (!currentVehicle) return;
    
    // Load workflow data from storage or initialize
    const stored = localStorage.getItem(`workflow_${reg}`);
    workflowData = stored ? JSON.parse(stored) : { currentStage: 1, stages: {} };
    
    // Update UI
    updateVehicleInfo();
    renderStageGrid();
    
    document.getElementById('vehicleInfo').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

// Update vehicle info display
function updateVehicleInfo() {
    document.getElementById('infoReg').textContent = currentVehicle.reg;
    document.getElementById('infoVehicle').textContent = `${currentVehicle.make} ${currentVehicle.model}`;
    
    const currentStageName = stages[workflowData.currentStage - 1]?.name || 'Not Started';
    document.getElementById('infoStage').textContent = currentStageName;
    
    const progress = ((workflowData.currentStage - 1) / 12) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '%';
}

// Render stage grid
function renderStageGrid() {
    const grid = document.getElementById('stageGrid');
    
    grid.innerHTML = stages.map(stage => {
        const isCompleted = workflowData.stages[stage.id]?.completed;
        const isCurrent = workflowData.currentStage === stage.id;
        const isPending = stage.id > workflowData.currentStage;
        
        let statusClass = isCompleted ? 'completed' : isCurrent ? 'active' : 'pending';
        let statusIcon = isCompleted ? 'fa-check-circle text-green-400' : 
                        isCurrent ? 'fa-clock text-blue-400' : 
                        'fa-hourglass text-slate-500';
        let statusText = isCompleted ? 'Complete' : isCurrent ? 'In Progress' : 'Pending';
        
        return `
            <div class="workflow-stage glass-panel rounded-lg p-4 border-2 ${statusClass === 'completed' ? 'border-green-500/50' : statusClass === 'active' ? 'border-blue-500/50' : 'border-slate-600'}" 
                 onclick="openStage(${stage.id})">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-slate-500">STAGE ${stage.id}</span>
                    <i class="fas ${stage.icon} text-${stage.color}-400"></i>
                </div>
                <h4 class="font-semibold text-white text-sm">${stage.name}</h4>
                <p class="text-xs text-slate-400 mt-1">${stage.dept}</p>
                <div class="mt-3 flex items-center text-xs ${isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-slate-500'}">
                    <i class="fas ${statusIcon} mr-1"></i> ${statusText}
                </div>
            </div>
        `;
    }).join('');
}

// Open stage form
function openStage(stageId) {
    if (!currentVehicle) {
        alert('Please select a vehicle first');
        return;
    }
    
    // Don't allow jumping ahead
    if (stageId > workflowData.currentStage && !workflowData.stages[stageId]?.completed) {
        alert('Please complete previous stages first');
        return;
    }
    
    currentStage = stageId;
    const stage = stages[stageId - 1];
    
    document.getElementById('formTitle').textContent = stage.name;
    document.getElementById('formSubtitle').textContent = `${stage.dept} - Complete the required information`;
    document.getElementById('formContent').innerHTML = generateStageForm(stageId);
    
    document.getElementById('stageFormContainer').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
    
    // Scroll to form
    document.getElementById('stageFormContainer').scrollIntoView({ behavior: 'smooth' });
}

// Generate stage form HTML
function generateStageForm(stageId) {
    const forms = {
        1: generateIntakeForm(),
        2: generateBodyworkForm(),
        3: generateDentPaintForm(),
        4: generateLegalForm(),
        5: generateMechanicalForm(),
        6: generateExternalForm(),
        7: generateValetForm(),
        8: generateFaultOverviewForm(),
        9: generateAdvertisingForm(),
        10: generateDeliveryForm(),
        11: generateAccountsForm(),
        12: generateManagementForm()
    };
    
    return forms[stageId] || '<p class="text-slate-400">Form template for Stage ' + stageId + '</p>';
}

// Stage 1: Vehicle Intake
function generateIntakeForm() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Staff Member</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Stanslaw Marzec</option>
                    <option>Ibrahim Ata</option>
                    <option>Ali Soliemani</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Intake Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Registration</label>
                <input type="text" class="form-input w-full px-4 py-2 rounded-lg text-white" value="${currentVehicle?.reg || ''}">
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">VIN</label>
                <input type="text" class="form-input w-full px-4 py-2 rounded-lg text-white" placeholder="Enter VIN">
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Make</label>
                <input type="text" class="form-input w-full px-4 py-2 rounded-lg text-white" value="${currentVehicle?.make || ''}">
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Model</label>
                <input type="text" class="form-input w-full px-4 py-2 rounded-lg text-white" value="${currentVehicle?.model || ''}">
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Mileage</label>
                <input type="number" class="form-input w-full px-4 py-2 rounded-lg text-white" value="${currentVehicle?.mileage || ''}">
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Supplier Approval</label>
            <div class="flex space-x-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="approval" value="approved" class="text-blue-500">
                    <span class="text-white">Approved</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="approval" value="pending" class="text-blue-500">
                    <span class="text-white">Pending</span>
                </label>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Vehicle Photos</label>
            <div class="grid grid-cols-4 gap-4">
                <div class="photo-upload rounded-lg p-4 text-center cursor-pointer">
                    <i class="fas fa-camera text-2xl text-slate-500 mb-2"></i>
                    <p class="text-xs text-slate-400">Front</p>
                </div>
                <div class="photo-upload rounded-lg p-4 text-center cursor-pointer">
                    <i class="fas fa-camera text-2xl text-slate-500 mb-2"></i>
                    <p class="text-xs text-slate-400">Rear</p>
                </div>
                <div class="photo-upload rounded-lg p-4 text-center cursor-pointer">
                    <i class="fas fa-camera text-2xl text-slate-500 mb-2"></i>
                    <p class="text-xs text-slate-400">Side</p>
                </div>
                <div class="photo-upload rounded-lg p-4 text-center cursor-pointer">
                    <i class="fas fa-camera text-2xl text-slate-500 mb-2"></i>
                    <p class="text-xs text-slate-400">Interior</p>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Video Walkaround</label>
            <div class="photo-upload rounded-lg p-6 text-center cursor-pointer">
                <i class="fas fa-video text-3xl text-slate-500 mb-2"></i>
                <p class="text-sm text-slate-400">Click to upload video</p>
            </div>
        </div>
    `;
}

// Stage 2: Bodywork & Cosmetic
function generateBodyworkForm() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Inspector</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Marcin Kiljan</option>
                    <option>Morteza Rahamian</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Inspection Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="font-medium text-white">Bodywork Checklist</h4>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white">Dents</span>
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white">
                            <option>None</option>
                            <option>Minor</option>
                            <option>Major</option>
                        </select>
                    </div>
                </div>
                
                <div class="bg-slate-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white">Scratches</span>
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white">
                            <option>None</option>
                            <option>Minor</option>
                            <option>Major</option>
                        </select>
                    </div>
                </div>
                
                <div class="bg-slate-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white">Rust</span>
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white">
                            <option>None</option>
                            <option>Surface</option>
                            <option>Structural</option>
                        </select>
                    </div>
                </div>
                
                <div class="bg-slate-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white">Panel Alignment</span>
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white">
                            <option>Good</option>
                            <option>Minor Issue</option>
                            <option>Major Issue</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Damage Photos</label>
            <div class="grid grid-cols-4 gap-4">
                <div class="photo-upload rounded-lg p-4 text-center cursor-pointer">
                    <i class="fas fa-plus text-2xl text-slate-500 mb-2"></i>
                    <p class="text-xs text-slate-400">Add Photo</p>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Repair Required?</label>
            <div class="flex space-x-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="repair" value="yes" class="text-blue-500">
                    <span class="text-white">Yes - Send to Bodyshop</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="repair" value="no" class="text-blue-500">
                    <span class="text-white">No - Proceed to Next Stage</span>
                </label>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Inspector Notes</label>
            <textarea class="form-input w-full px-4 py-2 rounded-lg text-white h-24" placeholder="Enter detailed observations..."></textarea>
        </div>
    `;
}

// Stage 5: Mechanical & Diagnostic (comprehensive)
function generateMechanicalForm() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Technician</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Morteza Rahamian</option>
                    <option>Marcin Kiljan</option>
                    <option>Sia Vajihi</option>
                    <option>Iman Zarien</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Inspection Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="font-medium text-white">Fluid Levels & Condition</h4>
            <div class="grid grid-cols-2 gap-4">
                ${['Engine Oil', 'Coolant', 'Brake Fluid', 'Power Steering', 'Transmission', 'AdBlue', 'Washer Fluid', 'Differential'].map(fluid => `
                    <div class="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                        <span class="text-slate-300">${fluid}</span>
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white">
                            <option>OK</option>
                            <option>Top Up</option>
                            <option>Replace</option>
                            <option>Leak</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="font-medium text-white">Brake Condition</h4>
            <div class="grid grid-cols-4 gap-4">
                ${['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map(brake => `
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">${brake}</label>
                        <select class="form-input w-full px-3 py-2 rounded text-white text-sm">
                            <option>Good</option>
                            <option>Worn</option>
                            <option>Replace</option>
                        </select>
                        <input type="number" placeholder="mm" class="form-input w-full mt-2 px-3 py-1 rounded text-white text-sm">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="font-medium text-white">Tyre Condition</h4>
            <div class="grid grid-cols-4 gap-4">
                ${['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map(tyre => `
                    <div class="bg-slate-800 p-3 rounded-lg">
                        <label class="block text-xs text-slate-400 mb-1">${tyre}</label>
                        <input type="number" placeholder="Tread mm" class="form-input w-full px-3 py-1 rounded text-white text-sm mb-2">
                        <select class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white w-full">
                            <option>Good</option>
                            <option>Worn</option>
                            <option>Replace</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Diagnostic Scan</label>
            <div class="photo-upload rounded-lg p-6 text-center cursor-pointer">
                <i class="fas fa-upload text-3xl text-slate-500 mb-2"></i>
                <p class="text-sm text-slate-400">Upload diagnostic report or photo of codes</p>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Additional Notes</label>
            <textarea class="form-input w-full px-4 py-2 rounded-lg text-white h-24" placeholder="Enter any additional mechanical observations..."></textarea>
        </div>
    `;
}

// Stage 8: Fault Overview
function generateFaultOverviewForm() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Workshop Lead</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Marcin Kiljan</option>
                    <option>Morteza Rahamian</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Review Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>

        <div class="space-y-3">
            <label class="block text-sm text-slate-400">Faults Identified</label>
            <div class="grid grid-cols-3 gap-3">
                ${CapeyeData.reference.faults.map(fault => `
                    <label class="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                        <input type="checkbox" class="rounded text-blue-500" value="${fault}">
                        <span class="text-white text-sm">${fault}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <div class="space-y-3">
            <label class="block text-sm text-slate-400">Works Required</label>
            <div class="grid grid-cols-4 gap-3">
                ${CapeyeData.reference.repairs.map(repair => `
                    <label class="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                        <input type="checkbox" class="rounded text-blue-500" value="${repair}">
                        <span class="text-white text-sm">${repair}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Parts Recommended</label>
            <select multiple class="form-input w-full px-4 py-2 rounded-lg text-white h-32">
                ${CapeyeData.reference.parts.map(part => `<option>${part}</option>`).join('')}
            </select>
            <p class="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Workshop Notes</label>
            <textarea class="form-input w-full px-4 py-2 rounded-lg text-white h-24" placeholder="Summary of all work completed..."></textarea>
        </div>

        <div class="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <input type="checkbox" id="readyForValet" class="rounded text-blue-500 w-5 h-5">
            <label for="readyForValet" class="text-white font-medium">Vehicle Ready - Send to Valet</label>
        </div>
    `;
}

// Stage 10: Customer Delivery
function generateDeliveryForm() {
    return `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Sales Executive</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Ibrahim Ata</option>
                    <option>Ali Soliemani</option>
                    <option>Germaine Dua</option>
                    <option>Haider Ahmed</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Handover Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Customer Name</label>
                <input type="text" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Delivery Type</label>
                <select class="form-input w-full px-4 py-2 rounded-lg text-white">
                    <option>Collection</option>
                    <option>Delivery</option>
                </select>
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Delivery Address</label>
            <textarea class="form-input w-full px-4 py-2 rounded-lg text-white h-20"></textarea>
        </div>

        <div class="space-y-3">
            <label class="block text-sm text-slate-400">Documentation Checklist</label>
            <div class="space-y-2">
                ${['V5C Document Handed Over', 'Service Book Stamped', 'Spare Keys Provided', 'Breakdown Cover Explained', 'Road Tax Arranged', 'Bluetooth/Features Demo'].map(item => `
                    <label class="flex items-center space-x-2 bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                        <input type="checkbox" class="rounded text-blue-500 w-5 h-5">
                        <span class="text-white">${item}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-slate-400 mb-2">Warranty Start Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
            <div>
                <label class="block text-sm text-slate-400 mb-2">Warranty End Date</label>
                <input type="date" class="form-input w-full px-4 py-2 rounded-lg text-white">
            </div>
        </div>

        <div>
            <label class="block text-sm text-slate-400 mb-2">Customer Signature</label>
            <div class="bg-slate-800 border border-slate-600 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                <div class="text-center text-slate-500">
                    <i class="fas fa-signature text-3xl mb-2"></i>
                    <p class="text-sm">Click to sign</p>
                </div>
            </div>
        </div>
    `;
}

// Other stage forms (simplified)
function generateDentPaintForm() { return '<p class="text-slate-400">Dent and paint repair details form...</p>'; }
function generateLegalForm() { return '<p class="text-slate-400">Legal documentation checklist form...</p>'; }
function generateExternalForm() { return '<p class="text-slate-400">External and electrical checks form...</p>'; }
function generateValetForm() { return '<p class="text-slate-400">Interior and valeting checklist form...</p>'; }
function generateAdvertisingForm() { return '<p class="text-slate-400">Vehicle ready and advertising form...</p>'; }
function generateAccountsForm() { return '<p class="text-slate-400">Accounts and warranty processing form...</p>'; }
function generateManagementForm() { return '<p class="text-slate-400">Management overview and sign-off...</p>'; }

// Save stage draft
function saveStageDraft() {
    const formData = collectFormData();
    workflowData.stages[currentStage] = { ...workflowData.stages[currentStage], ...formData, draft: true };
    saveWorkflowData();
    alert('Draft saved successfully!');
}

// Submit stage
function submitStage() {
    const formData = collectFormData();
    
    // Validate required fields
    if (!validateForm()) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Save stage data
    workflowData.stages[currentStage] = { ...formData, completed: true, completedDate: new Date().toISOString() };
    
    // Move to next stage
    if (currentStage < 12) {
        workflowData.currentStage = currentStage + 1;
    }
    
    saveWorkflowData();
    
    // Trigger automation
    handleStageAutomation(currentStage);
    
    // Update UI
    updateVehicleInfo();
    renderStageGrid();
    
    alert(`Stage ${currentStage} completed successfully!`);
    
    // Move to next stage or close
    if (currentStage < 12) {
        openStage(currentStage + 1);
    } else {
        document.getElementById('stageFormContainer').classList.add('hidden');
    }
}

// Collect form data
function collectFormData() {
    const form = document.getElementById('formContent');
    const data = {};
    
    form.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'checkbox') {
            if (!data[field.name]) data[field.name] = [];
            if (field.checked) data[field.name].push(field.value);
        } else if (field.type === 'radio') {
            if (field.checked) data[field.name] = field.value;
        } else {
            data[field.name || field.id] = field.value;
        }
    });
    
    return data;
}

// Validate form
function validateForm() {
    // Basic validation - check required fields
    return true;
}

// Save workflow data
function saveWorkflowData() {
    if (currentVehicle) {
        localStorage.setItem(`workflow_${currentVehicle.reg}`, JSON.stringify(workflowData));
    }
}

// Handle stage automation triggers
function handleStageAutomation(stageId) {
    const triggers = {
        1: () => console.log('Notify Workshop Lead: New vehicle intake'),
        3: () => console.log('If repairs needed, create repair task'),
        7: () => alert('Valet complete - Vehicle sent to Sales for advertising!'),
        8: () => alert('Vehicle ready notification sent to Valet team!'),
        10: () => console.log('Notify Accounts: Vehicle delivered'),
        12: () => console.log('Archive to Google Sheets')
    };
    
    if (triggers[stageId]) {
        triggers[stageId]();
    }
}

// Global access
window.loadVehicleWorkflow = loadVehicleWorkflow;
window.searchByReg = searchByReg;
window.openStage = openStage;
window.saveStageDraft = saveStageDraft;
window.submitStage = submitStage;
