<!-- workflow/stage-1-intake.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stage 1: Vehicle Intake | Capeye Workflow</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="../js/vehicle-store.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0f; color: #f8fafc; }
        .form-container { max-width: 800px; margin: 40px auto; padding: 24px; background: #12121a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        input, select, textarea { width: 100%; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #f8fafc; font-size: 14px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; }
        .btn-primary { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: rgba(255,255,255,0.03); color: #94a3b8; padding: 12px 24px; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; font-weight: 600; cursor: pointer; }
        .search-box { display: flex; gap: 10px; margin-bottom: 24px; }
        .vehicle-found { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .vehicle-not-found { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="form-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h1 style="font-size: 20px; font-weight: 700;">Stage 1: Vehicle Intake</h1>
            <a href="../operations.html" class="btn-secondary">Back to Operations</a>
        </div>

        <!-- Search -->
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Enter Stock No or Registration..." style="flex: 1;">
            <button onclick="searchVehicle()" class="btn-primary" style="width: auto;">Search</button>
            <button onclick="createNew()" class="btn-secondary">New Vehicle</button>
        </div>

        <!-- Results -->
        <div id="searchResult"></div>

        <!-- Form -->
        <form id="intakeForm" class="hidden">
            <input type="hidden" id="stockNo">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Registration</label>
                    <input type="text" id="registration" required>
                </div>
                <div class="form-group">
                    <label>Make</label>
                    <input type="text" id="make" required>
                </div>
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" id="model" required>
                </div>
                <div class="form-group">
                    <label>Year</label>
                    <input type="number" id="year" required>
                </div>
                <div class="form-group">
                    <label>Mileage</label>
                    <input type="number" id="mileage" required>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <input type="text" id="color" required>
                </div>
                <div class="form-group">
                    <label>Fuel Type</label>
                    <select id="fuel" required>
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <select id="location" required>
                        <option value="Stanmore Retail">Stanmore Retail</option>
                        <option value="Stanmore 2">Stanmore 2</option>
                        <option value="Stanmore PDI">Stanmore PDI</option>
                        <option value="With Supplier">With Supplier</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Assigned To</label>
                <select id="assignedTo" required></select>
            </div>

            <div class="form-group">
                <label>Intake Notes</label>
                <textarea id="notes" rows="3" placeholder="Condition, damage, special requirements..."></textarea>
            </div>

            <div style="display: flex; gap: 12px;">
                <button type="button" onclick="saveDraft()" class="btn-secondary" style="flex: 1;">Save Draft</button>
                <button type="submit" class="btn-primary" style="flex: 2;">Complete Intake & Send to Workshop</button>
            </div>
        </form>
    </div>

    <script>
        // Load staff dropdown
        function loadStaff() {
            const staff = VehicleStore.getStaff('Sales').concat(VehicleStore.getStaff('Management'));
            const select = document.getElementById('assignedTo');
            select.innerHTML = staff.map(s => `<option value="${s.name}">${s.name} (${s.role})</option>`).join('');
        }

        // Search for vehicle
        function searchVehicle() {
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;

            const vehicle = VehicleStore.get(query);
            const resultDiv = document.getElementById('searchResult');
            
            if (vehicle) {
                resultDiv.innerHTML = `
                    <div class="vehicle-found">
                        <strong>Vehicle Found:</strong> ${vehicle.registration} - ${vehicle.make} ${vehicle.model}<br>
                        <small>Current Stage: ${VehicleStore.STAGES[vehicle.stage]?.name || vehicle.stage} | Assigned: ${vehicle.assignedTo}</small>
                    </div>
                `;
                populateForm(vehicle);
            } else {
                resultDiv.innerHTML = `
                    <div class="vehicle-not-found">
                        <strong>Vehicle not found.</strong> Create new or check reference.
                    </div>
                `;
                document.getElementById('intakeForm').classList.remove('hidden');
                document.getElementById('registration').value = query.toUpperCase();
            }
        }

        // Create new vehicle
        function createNew() {
            document.getElementById('searchResult').innerHTML = '';
            document.getElementById('intakeForm').classList.remove('hidden');
            document.getElementById('intakeForm').reset();
            document.getElementById('stockNo').value = '';
        }

        // Populate form with vehicle data
        function populateForm(vehicle) {
            document.getElementById('intakeForm').classList.remove('hidden');
            document.getElementById('stockNo').value = vehicle.stockNo;
            document.getElementById('registration').value = vehicle.registration;
            document.getElementById('make').value = vehicle.make;
            document.getElementById('model').value = vehicle.model;
            document.getElementById('year').value = vehicle.year || '';
            document.getElementById('mileage').value = vehicle.mileage || '';
            document.getElementById('color').value = vehicle.color || '';
            document.getElementById('fuel').value = vehicle.fuel || 'Diesel';
            document.getElementById('location').value = vehicle.location || 'Stanmore Retail';
            document.getElementById('assignedTo').value = vehicle.assignedTo || '';
            document.getElementById('notes').value = vehicle.notes || '';
        }

        // Save draft
        function saveDraft() {
            const formData = {
                registration: document.getElementById('registration').value,
                make: document.getElementById('make').value,
                model: document.getElementById('model').value,
                year: parseInt(document.getElementById('year').value),
                mileage: parseInt(document.getElementById('mileage').value),
                color: document.getElementById('color').value,
                fuel: document.getElementById('fuel').value,
                location: document.getElementById('location').value,
                assignedTo: document.getElementById('assignedTo').value,
                notes: document.getElementById('notes').value
            };

            const stockNo = document.getElementById('stockNo').value;
            
            if (stockNo) {
                VehicleStore.update(stockNo, { ...formData, status: 'DRAFT' });
                alert('Draft saved!');
            } else {
                const result = VehicleStore.add({ ...formData, status: 'DRAFT' });
                if (result.success) {
                    document.getElementById('stockNo').value = result.vehicle.stockNo;
                    alert(`New vehicle created: ${result.vehicle.stockNo}\nDraft saved!`);
                }
            }
        }

        // Form submission
        document.getElementById('intakeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const stockNo = document.getElementById('stockNo').value;
            const formData = {
                registration: document.getElementById('registration').value.toUpperCase(),
                make: document.getElementById('make').value,
                model: document.getElementById('model').value,
                year: parseInt(document.getElementById('year').value),
                mileage: parseInt(document.getElementById('mileage').value),
                color: document.getElementById('color').value,
                fuel: document.getElementById('fuel').value,
                location: document.getElementById('location').value,
                assignedTo: document.getElementById('assignedTo').value,
                notes: document.getElementById('notes').value,
                status: 'NORMAL'
            };

            let result;
            if (stockNo) {
                // Update existing
                VehicleStore.update(stockNo, formData);
                // Advance to workshop
                result = VehicleStore.advance(stockNo, { 
                    notes: 'Intake completed',
                    staff: formData.assignedTo
                });
            } else {
                // Create new and advance
                const createResult = VehicleStore.add(formData);
                if (createResult.success) {
                    result = VehicleStore.advance(createResult.vehicle.stockNo, {
                        notes: 'Intake completed',
                        staff: formData.assignedTo
                    });
                }
            }

            if (result && result.success) {
                alert(`Vehicle ${result.vehicle.registration} sent to Workshop!\n\nStock No: ${result.vehicle.stockNo}`);
                window.location.href = '../operations.html';
            } else {
                alert('Error: ' + (result?.error || 'Unknown error'));
            }
        });

        // Initialize
        loadStaff();
    </script>
</body>
</html>
