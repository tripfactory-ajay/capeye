/**
 * Capeye Import Manager Module
 * Orchestrates CSV import workflow with validation and progress tracking
 */

const ImportManager = {
    currentFile: null,
    parsedData: null,
    validationResult: null,
    
    /**
     * Initialize import interface
     * @param {string} dropZoneId - ID of drop zone element
     * @param {string} fileInputId - ID of file input element
     */
    init(dropZoneId = 'dropZone', fileInputId = 'fileInput') {
        const dropZone = document.getElementById(dropZoneId);
        const fileInput = document.getElementById(fileInputId);
        
        if (!dropZone || !fileInput) return;
        
        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
        
        // Click to browse
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    },
    
    /**
     * Handle file selection
     * @param {File} file 
     */
    async handleFileSelect(file) {
        this.currentFile = file;
        
        // Validate file type
        if (!file.name.match(/\.(csv|xlsx?)$/i)) {
            this.showError('Please upload a CSV or Excel file');
            return;
        }
        
        // Show file info
        this.showFileInfo(file);
        
        // Parse file
        try {
            this.showProgress('Parsing file...', 20);
            
            let result;
            if (file.name.endsWith('.csv')) {
                result = await CSVParser.parseClickDealer(file);
            } else {
                // For Excel, would need SheetJS library
                this.showError('Excel files not yet supported. Please convert to CSV.');
                return;
            }
            
            this.parsedData = result.data;
            this.showProgress('Validating data...', 50);
            
            // Validate
            this.validationResult = CSVParser.validate(this.parsedData);
            
            this.showProgress('Analysis complete', 100);
            
            // Show preview
            this.showPreview();
            this.showValidationResults();
            
        } catch (error) {
            this.showError('Failed to parse file: ' + error.message);
        }
    },
    
    /**
     * Show file information
     * @param {File} file 
     */
    showFileInfo(file) {
        const infoDiv = document.getElementById('fileInfo');
        if (!infoDiv) return;
        
        const size = (file.size / 1024).toFixed(2);
        infoDiv.innerHTML = `
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-center">
                    <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <div>
                        <p class="font-medium text-slate-900">${file.name}</p>
                        <p class="text-sm text-slate-500">${size} KB • ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <button onclick="ImportManager.clearFile()" class="text-red-500 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        infoDiv.classList.remove('hidden');
    },
    
    /**
     * Show progress indicator
     * @param {string} message 
     * @param {number} percent 
     */
    showProgress(message, percent) {
        const progressDiv = document.getElementById('progressSection');
        if (!progressDiv) return;
        
        progressDiv.classList.remove('hidden');
        progressDiv.innerHTML = `
            <div class="mb-2 flex justify-between text-sm">
                <span class="text-slate-600">${message}</span>
                <span class="text-slate-900 font-medium">${percent}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
            </div>
        `;
    },
    
    /**
     * Show data preview
     */
    showPreview() {
        const previewDiv = document.getElementById('previewSection');
        if (!previewDiv || !this.parsedData) return;
        
        const preview = CSVParser.preview(this.parsedData, 5);
        const headers = CSVParser.getHeaders(this.parsedData);
        
        // Show key columns first
        const priorityCols = ['stockNo', 'registration', 'make', 'model', 'status', 'location'];
        const sortedHeaders = [
            ...priorityCols.filter(h => headers.includes(h)),
            ...headers.filter(h => !priorityCols.includes(h))
        ];
        
        let tableHtml = `
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Preview (${this.parsedData.length} records found)</h3>
            <div class="overflow-x-auto border border-slate-200 rounded-lg">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            ${sortedHeaders.map(h => `<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-200">
                        ${preview.map((row, idx) => `
                            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                                ${sortedHeaders.map(h => `
                                    <td class="px-4 py-3 text-sm text-slate-900 truncate max-w-xs">
                                        ${row[h] || '-'}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        previewDiv.innerHTML = tableHtml;
        previewDiv.classList.remove('hidden');
    },
    
    /**
     * Show validation results
     */
    showValidationResults() {
        const validationDiv = document.getElementById('validationSection');
        const actionDiv = document.getElementById('actionSection');
        if (!validationDiv || !this.validationResult) return;
        
        const { valid, errors, warnings, stats } = this.validationResult;
        
        let html = '<div class="space-y-3">';
        
        // Errors
        if (errors.length > 0) {
            html += `
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h4 class="font-medium text-red-900">Errors (${errors.length})</h4>
                    </div>
                    <ul class="text-sm text-red-700 space-y-1 ml-7">
                        ${errors.map(e => `<li>• ${e}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Warnings
        if (warnings.length > 0) {
            html += `
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h4 class="font-medium text-yellow-900">Warnings (${warnings.length})</h4>
                    </div>
                    <ul class="text-sm text-yellow-700 space-y-1 ml-7">
                        ${warnings.map(w => `<li>• ${w}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Stats
        html += `
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h4 class="font-medium text-green-900">Data Summary</h4>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm ml-7">
                    <div><span class="text-green-700">Total Records:</span> <span class="font-medium text-green-900">${stats.totalRows}</span></div>
                    <div><span class="text-green-700">With Stock No:</span> <span class="font-medium text-green-900">${stats.totalRows - (stats.emptyIds || 0)}</span></div>
                    <div><span class="text-green-700">With Make:</span> <span class="font-medium text-green-900">${stats.totalRows - (stats.missingMake || 0)}</span></div>
                    <div><span class="text-green-700">With Model:</span> <span class="font-medium text-green-900">${stats.totalRows - (stats.missingModel || 0)}</span></div>
                </div>
            </div>
        `;
        
        html += '</div>';
        validationDiv.innerHTML = html;
        validationDiv.classList.remove('hidden');
        
        // Show action buttons
        if (actionDiv) {
            actionDiv.innerHTML = `
                <div class="flex space-x-4">
                    <button onclick="ImportManager.processImport()" 
                        class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition ${!valid ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${!valid ? 'disabled' : ''}>
                        ${valid ? 'Import Data' : 'Fix Errors to Import'}
                    </button>
                    <button onclick="ImportManager.clearFile()" 
                        class="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition">
                        Cancel
                    </button>
                </div>
            `;
            actionDiv.classList.remove('hidden');
        }
    },
    
    /**
     * Process the import
     */
    async processImport() {
        if (!this.parsedData || !this.validationResult?.valid) return;
        
        const confirmBtn = document.querySelector('#actionSection button');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⟳</span> Importing...';
        }
        
        try {
            // Simulate progress steps
            this.showProgress('Matching existing records...', 25);
            await this.delay(500);
            
            this.showProgress('Updating vehicle data...', 50);
            await this.delay(500);
            
            this.showProgress('Calculating days in stock...', 75);
            await this.delay(500);
            
            // Perform actual import
            const stats = VehicleStore.bulkImport(this.parsedData);
            
            this.showProgress('Import complete!', 100);
            
            // Show success message
            this.showSuccess(stats);
            
            // Update last import timestamp on dashboard if visible
            this.updateDashboardTimestamp();
            
        } catch (error) {
            this.showError('Import failed: ' + error.message);
        }
    },
    
    /**
     * Show success message with stats
     * @param {Object} stats 
     */
    showSuccess(stats) {
        const resultDiv = document.getElementById('resultSection');
        if (!resultDiv) return;
        
        // Build details table
        let detailsHtml = '';
        if (stats.details && stats.details.length > 0) {
            const recentDetails = stats.details.slice(0, 10); // Show first 10
            detailsHtml = `
                <div class="mt-4 text-left">
                    <p class="text-sm font-medium text-slate-700 mb-2">Recent Changes:</p>
                    <div class="overflow-x-auto max-h-48 overflow-y-auto">
                        <table class="min-w-full text-xs">
                            <thead class="bg-slate-100">
                                <tr>
                                    <th class="px-2 py-1 text-left">Action</th>
                                    <th class="px-2 py-1 text-left">Stock No</th>
                                    <th class="px-2 py-1 text-left">Reg</th>
                                    <th class="px-2 py-1 text-left">Vehicle</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentDetails.map(d => `
                                    <tr class="${d.action === 'created' ? 'text-green-700' : 'text-blue-700'}">
                                        <td class="px-2 py-1 font-medium">${d.action === 'created' ? 'NEW' : 'UPD'}</td>
                                        <td class="px-2 py-1">${d.stockNo || '-'}</td>
                                        <td class="px-2 py-1">${d.registration || '-'}</td>
                                        <td class="px-2 py-1">${d.make} ${d.model}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${stats.details.length > 10 ? `<p class="text-xs text-slate-500 mt-1">... and ${stats.details.length - 10} more</p>` : ''}
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="text-xl font-semibold text-green-900 mb-2">Import Successful!</h3>
                <div class="grid grid-cols-3 gap-4 my-6">
                    <div class="p-4 bg-white rounded-lg">
                        <p class="text-2xl font-bold text-slate-900">${stats.total}</p>
                        <p class="text-sm text-slate-500">Total Processed</p>
                    </div>
                    <div class="p-4 bg-white rounded-lg">
                        <p class="text-2xl font-bold text-green-600">${stats.created}</p>
                        <p class="text-sm text-slate-500">New Vehicles</p>
                    </div>
                    <div class="p-4 bg-white rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">${stats.updated}</p>
                        <p class="text-sm text-slate-500">Updated</p>
                    </div>
                </div>
                ${detailsHtml}
                ${stats.errors.length > 0 ? `
                    <div class="text-left p-4 bg-red-50 rounded-lg mb-4 mt-4">
                        <p class="text-sm font-medium text-red-900 mb-2">Errors (${stats.errors.length}):</p>
                        <ul class="text-xs text-red-700 space-y-1">
                            ${stats.errors.slice(0, 5).map(e => `<li>Row ${e.row}: ${e.error}</li>`).join('')}
                            ${stats.errors.length > 5 ? `<li>... and ${stats.errors.length - 5} more</li>` : ''}
                        </ul>
                    </div>
                ` : ''}
                <div class="space-x-4 mt-4">
                    <a href="inventory.html" class="inline-block py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition">
                        View Inventory
                    </a>
                    <a href="dashboard.html" class="inline-block py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        
        // Hide other sections
        ['fileInfo', 'previewSection', 'validationSection', 'actionSection'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    },
    
    /**
     * Show error message
     * @param {string} message 
     */
    showError(message) {
        const errorDiv = document.getElementById('errorSection');
        if (!errorDiv) {
            alert(message);
            return;
        }
        
        errorDiv.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-red-900">${message}</span>
            </div>
        `;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    },
    
    /**
     * Clear file and reset
     */
    clearFile() {
        this.currentFile = null;
        this.parsedData = null;
        this.validationResult = null;
        
        ['fileInfo', 'previewSection', 'validationSection', 'actionSection', 'resultSection', 'progressSection'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.innerHTML = '';
            }
        });
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    },
    
    /**
     * Update dashboard timestamp
     */
    updateDashboardTimestamp() {
        localStorage.setItem('capeye_last_import', new Date().toISOString());
    },
    
    /**
     * Delay helper
     * @param {number} ms 
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
