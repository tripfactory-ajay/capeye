/**
 * Capeye Auto Capital - Form Components
 * Reusable form elements for workflow stages
 */

const FormComponents = {
    /**
     * Initialize all components on page
     */
    init: function() {
        this.initDropdowns();
        this.initPhotoUploads();
        this.initSignaturePads();
        this.initDatePickers();
        this.initStaffSelectors();
        this.initVehicleSearch();
    },

    /**
     * Create dropdown component
     */
    createDropdown: function(config) {
        const {
            id,
            label,
            options,
            required = false,
            multiple = false,
            placeholder = 'Select...',
            onChange = null
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''}`;
        wrapper.appendChild(labelEl);

        const select = document.createElement('select');
        select.id = id;
        select.name = id;
        select.className = 'form-select';
        if (multiple) select.multiple = true;
        if (required) select.required = true;

        // Placeholder option
        const placeholderOpt = document.createElement('option');
        placeholderOpt.value = '';
        placeholderOpt.textContent = placeholder;
        placeholderOpt.disabled = true;
        placeholderOpt.selected = true;
        select.appendChild(placeholderOpt);

        // Add options
        options.forEach(opt => {
            const option = document.createElement('option');
            if (typeof opt === 'object') {
                option.value = opt.value || opt.id;
                option.textContent = opt.label || opt.name;
                if (opt.data) option.dataset.extra = JSON.stringify(opt.data);
            } else {
                option.value = opt;
                option.textContent = opt;
            }
            select.appendChild(option);
        });

        if (onChange) {
            select.addEventListener('change', onChange);
        }

        wrapper.appendChild(select);
        return wrapper;
    },

    /**
     * Create photo upload component
     */
    createPhotoUpload: function(config) {
        const {
            id,
            label,
            maxPhotos = 10,
            required = false,
            minPhotos = 0
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group photo-upload-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''} <span class="photo-count">(0/${maxPhotos})</span>`;
        wrapper.appendChild(labelEl);

        const container = document.createElement('div');
        container.id = `${id}-container`;
        container.className = 'photo-grid';

        // Hidden input to store photo data
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = id;
        input.name = id;
        wrapper.appendChild(input);

        // Add photo button
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'photo-add-btn';
        addBtn.innerHTML = '📷 Add Photo';
        addBtn.onclick = () => this.openCamera(id, container, input, labelEl, maxPhotos);

        wrapper.appendChild(addBtn);
        wrapper.appendChild(container);

        // Store photos array
        wrapper.dataset.photos = '[]';

        return wrapper;
    },

    /**
     * Open camera/file picker
     */
    openCamera: function(inputId, container, hiddenInput, labelEl, maxPhotos) {
        const currentPhotos = JSON.parse(container.parentElement.dataset.photos || '[]');
        
        if (currentPhotos.length >= maxPhotos) {
            alert(`Maximum ${maxPhotos} photos allowed`);
            return;
        }

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment';
        fileInput.multiple = true;

        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            const remaining = maxPhotos - currentPhotos.length;
            const toProcess = files.slice(0, remaining);

            toProcess.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const photoData = {
                        id: Date.now() + Math.random(),
                        data: event.target.result,
                        timestamp: new Date().toISOString(),
                        name: file.name
                    };
                    
                    currentPhotos.push(photoData);
                    this.updatePhotoDisplay(container, hiddenInput, labelEl, currentPhotos, maxPhotos, inputId);
                };
                reader.readAsDataURL(file);
            });
        };

        fileInput.click();
    },

    /**
     * Update photo display
     */
    updatePhotoDisplay: function(container, hiddenInput, labelEl, photos, maxPhotos, inputId) {
        container.innerHTML = '';
        
        photos.forEach((photo, index) => {
            const photoEl = document.createElement('div');
            photoEl.className = 'photo-item';
            
            const img = document.createElement('img');
            img.src = photo.data;
            img.alt = `Photo ${index + 1}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'photo-remove';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                photos.splice(index, 1);
                this.updatePhotoDisplay(container, hiddenInput, labelEl, photos, maxPhotos, inputId);
            };
            
            photoEl.appendChild(img);
            photoEl.appendChild(removeBtn);
            container.appendChild(photoEl);
        });

        // Update hidden input
        hiddenInput.value = JSON.stringify(photos);
        
        // Update parent dataset
        container.parentElement.dataset.photos = JSON.stringify(photos);
        
        // Update label count
        const countSpan = labelEl.querySelector('.photo-count');
        if (countSpan) {
            countSpan.textContent = `(${photos.length}/${maxPhotos})`;
        }

        // Trigger change event
        const event = new CustomEvent('photosUpdated', { 
            detail: { id: inputId, count: photos.length, photos: photos } 
        });
        document.dispatchEvent(event);
    },

    /**
     * Create signature pad component
     */
    createSignaturePad: function(config) {
        const {
            id,
            label,
            required = false
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group signature-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''}`;
        wrapper.appendChild(labelEl);

        const canvas = document.createElement('canvas');
        canvas.id = `${id}-canvas`;
        canvas.className = 'signature-pad';
        canvas.width = 400;
        canvas.height = 200;
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        let isDrawing = false;
        let hasSignature = false;

        const startDraw = (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            ctx.lineTo(x, y);
            ctx.stroke();
            hasSignature = true;
        };

        const endDraw = () => {
            isDrawing = false;
            ctx.beginPath();
            this.updateSignatureInput(id, canvas, hasSignature);
        };

        // Mouse events
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseout', endDraw);

        // Touch events
        canvas.addEventListener('touchstart', startDraw);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', endDraw);

        wrapper.appendChild(canvas);

        // Hidden input
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = id;
        input.name = id;
        if (required) input.dataset.required = 'true';
        wrapper.appendChild(input);

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn-secondary';
        clearBtn.textContent = 'Clear Signature';
        clearBtn.onclick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasSignature = false;
            this.updateSignatureInput(id, canvas, false);
        };
        wrapper.appendChild(clearBtn);

        return wrapper;
    },

    /**
     * Update signature input value
     */
    updateSignatureInput: function(id, canvas, hasSignature) {
        const input = document.getElementById(id);
        if (input) {
            if (hasSignature) {
                input.value = canvas.toDataURL();
                input.dataset.hasSignature = 'true';
            } else {
                input.value = '';
                input.dataset.hasSignature = 'false';
            }
        }
    },

    /**
     * Create date picker component
     */
    createDatePicker: function(config) {
        const {
            id,
            label,
            required = false,
            min = null,
            max = null,
            value = ''
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''}`;
        wrapper.appendChild(labelEl);

        const input = document.createElement('input');
        input.type = 'date';
        input.id = id;
        input.name = id;
        input.className = 'form-input';
        if (required) input.required = true;
        if (min) input.min = min;
        if (max) input.max = max;
        if (value) input.value = value;

        wrapper.appendChild(input);
        return wrapper;
    },

    /**
     * Create staff selector by department
     */
    createStaffSelector: function(config) {
        const {
            id,
            label,
            department = null, // null = all departments
            required = false,
            multiple = false
        } = config;

        let options = [];
        
        if (department && STAFF_DATA) {
            options = STAFF_DATA.getStaffByDept(department).map(s => ({
                value: s.id,
                label: `${s.name} - ${s.role}`
            }));
        } else if (STAFF_DATA) {
            options = STAFF_DATA.getAllStaff().map(s => ({
                value: s.id,
                label: `${s.name} - ${s.departmentName}`
            }));
        }

        return this.createDropdown({
            id,
            label,
            options,
            required,
            multiple,
            placeholder: 'Select staff member...'
        });
    },

    /**
     * Create vehicle search component
     */
    createVehicleSearch: function(config) {
        const {
            id = 'vehicle-search',
            onSelect = null,
            showDetails = true
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'vehicle-search-component';

        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.placeholder = 'Search by Stock No, Reg, or Model...';
        input.className = 'form-input search-input';
        
        const results = document.createElement('div');
        results.id = `${id}-results`;
        results.className = 'search-results';

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                results.innerHTML = '';
                return;
            }

            // Search in VehicleStore if available
            let vehicles = [];
            if (typeof VehicleStore !== 'undefined') {
                vehicles = VehicleStore.search(query);
            }

            this.displaySearchResults(results, vehicles, input, onSelect, showDetails);
        });

        searchBox.appendChild(input);
        wrapper.appendChild(searchBox);
        wrapper.appendChild(results);

        // Selected vehicle display
        const selectedDisplay = document.createElement('div');
        selectedDisplay.id = `${id}-selected`;
        selectedDisplay.className = 'selected-vehicle';
        wrapper.appendChild(selectedDisplay);

        return wrapper;
    },

    /**
     * Display search results
     */
    displaySearchResults: function(container, vehicles, input, onSelect, showDetails) {
        container.innerHTML = '';
        
        if (vehicles.length === 0) {
            container.innerHTML = '<div class="no-results">No vehicles found</div>';
            return;
        }

        vehicles.forEach(vehicle => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            
            let details = '';
            if (showDetails) {
                details = `
                    <div class="vehicle-details">
                        <span>${vehicle.make} ${vehicle.model}</span>
                        <span class="vehicle-reg">${vehicle.registration}</span>
                        <span class="vehicle-status status-${vehicle.status?.toLowerCase().replace(' ', '-')}">${vehicle.status}</span>
                    </div>
                `;
            }

            item.innerHTML = `
                <div class="vehicle-main">
                    <strong>${vehicle.stockNo}</strong>
                    ${details}
                </div>
            `;

            item.onclick = () => {
                input.value = vehicle.stockNo;
                container.innerHTML = '';
                this.displaySelectedVehicle(`${input.id}-selected`, vehicle);
                if (onSelect) onSelect(vehicle);
                
                // Set in workflow engine
                if (typeof WorkflowEngine !== 'undefined') {
                    WorkflowEngine.setVehicle(vehicle);
                }
            };

            container.appendChild(item);
        });
    },

    /**
     * Display selected vehicle
     */
    displaySelectedVehicle: function(containerId, vehicle) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="vehicle-card">
                <div class="vehicle-header">
                    <h3>${vehicle.stockNo}</h3>
                    <span class="badge">${vehicle.status}</span>
                </div>
                <div class="vehicle-info">
                    <p><strong>${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}</strong></p>
                    <p>Reg: ${vehicle.registration} | Year: ${vehicle.year}</p>
                    <p>Location: ${vehicle.location}</p>
                    <p>Colour: ${vehicle.colour}</p>
                </div>
            </div>
        `;
    },

    /**
     * Create checkbox group
     */
    createCheckboxGroup: function(config) {
        const {
            id,
            label,
            options,
            required = false,
            columns = 2
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group checkbox-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'form-label';
        labelEl.textContent = label;
        wrapper.appendChild(labelEl);

        const grid = document.createElement('div');
        grid.className = `checkbox-grid cols-${columns}`;

        options.forEach((opt, index) => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = `${id}[]`;
            checkbox.value = typeof opt === 'object' ? opt.value : opt;
            checkbox.id = `${id}_${index}`;
            
            const text = document.createElement('span');
            text.textContent = typeof opt === 'object' ? opt.label : opt;
            
            item.appendChild(checkbox);
            item.appendChild(text);
            grid.appendChild(item);
        });

        wrapper.appendChild(grid);
        return wrapper;
    },

    /**
     * Create text area
     */
    createTextArea: function(config) {
        const {
            id,
            label,
            required = false,
            rows = 4,
            placeholder = '',
            maxLength = null
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''}`;
        wrapper.appendChild(labelEl);

        const textarea = document.createElement('textarea');
        textarea.id = id;
        textarea.name = id;
        textarea.className = 'form-textarea';
        textarea.rows = rows;
        textarea.placeholder = placeholder;
        if (required) textarea.required = true;
        if (maxLength) textarea.maxLength = maxLength;

        wrapper.appendChild(textarea);
        return wrapper;
    },

    /**
     * Create text input
     */
    createTextInput: function(config) {
        const {
            id,
            label,
            type = 'text',
            required = false,
            placeholder = '',
            pattern = null
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.className = 'form-label';
        labelEl.innerHTML = `${label} ${required ? '<span class="required">*</span>' : ''}`;
        wrapper.appendChild(labelEl);

        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.name = id;
        input.className = 'form-input';
        input.placeholder = placeholder;
        if (required) input.required = true;
        if (pattern) input.pattern = pattern;

        wrapper.appendChild(input);
        return wrapper;
    },

    /**
     * Initialize all dropdowns on page
     */
    initDropdowns: function() {
        document.querySelectorAll('[data-component="dropdown"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createDropdown(config));
        });
    },

    /**
     * Initialize all photo uploads
     */
    initPhotoUploads: function() {
        document.querySelectorAll('[data-component="photo-upload"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createPhotoUpload(config));
        });
    },

    /**
     * Initialize all signature pads
     */
    initSignaturePads: function() {
        document.querySelectorAll('[data-component="signature"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createSignaturePad(config));
        });
    },

    /**
     * Initialize all date pickers
     */
    initDatePickers: function() {
        document.querySelectorAll('[data-component="datepicker"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createDatePicker(config));
        });
    },

    /**
     * Initialize all staff selectors
     */
    initStaffSelectors: function() {
        document.querySelectorAll('[data-component="staff-selector"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createStaffSelector(config));
        });
    },

    /**
     * Initialize vehicle search
     */
    initVehicleSearch: function() {
        document.querySelectorAll('[data-component="vehicle-search"]').forEach(el => {
            const config = JSON.parse(el.dataset.config || '{}');
            el.replaceWith(this.createVehicleSearch(config));
        });
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    FormComponents.init();
});
