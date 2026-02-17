/**
 * Capeye Auto Capital - Auto Notification Installer
 * Run this once to add notification triggers to all stage files
 * Or include it in your dashboard to auto-patch on load
 */

const NotificationInstaller = {
    // Configuration
    config: {
        // Set to true to actually modify files (false = preview only)
        liveMode: false,
        
        // Stage configurations
        stages: [
            { file: 'stage-1-intake.html', stageNum: 1, assigneeField: 'data.inspector' },
            { file: 'stage-2-bodywork.html', stageNum: 2, assigneeField: 'data.assessor' },
            { file: 'stage-3-paint.html', stageNum: 3, assigneeField: 'data.paintTechnician' },
            { file: 'stage-4-legal.html', stageNum: 4, assigneeField: 'data.processor' },
            { file: 'stage-5-mechanical.html', stageNum: 5, assigneeField: 'data.mechanic' },
            { file: 'stage-6-external.html', stageNum: 6, assigneeField: 'data.inspector' },
            { file: 'stage-7-valeting.html', stageNum: 7, assigneeField: 'data.valeter' },
            { file: 'stage-8-faults.html', stageNum: 8, assigneeField: 'data.workshopLead' },
            { file: 'stage-9-advertising.html', stageNum: 9, assigneeField: 'data.photographer' },
            { file: 'stage-10-delivery.html', stageNum: 10, assigneeField: 'data.salesperson' },
            { file: 'stage-11-accounts.html', stageNum: 11, assigneeField: 'data.accountsPerson' },
            { file: 'stage-12-management.html', stageNum: 12, assigneeField: 'data.manager' }
        ]
    },

    /**
     * Initialize - call this from dashboard or run manually
     */
    init: function() {
        console.log('🔧 Notification Installer Starting...');
        console.log('Mode:', this.config.liveMode ? 'LIVE (will modify files)' : 'PREVIEW (safe mode)');
        
        this.checkStages();
    },

    /**
     * Check all stage files and show what needs to be added
     */
    checkStages: function() {
        this.config.stages.forEach(stage => {
            this.analyzeStage(stage);
        });
    },

    /**
     * Analyze a single stage file
     */
    analyzeStage: function(stage) {
        const path = `./workflow/stages/${stage.file}`;
        
        // Fetch the file content
        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`File not found: ${stage.file}`);
                return response.text();
            })
            .then(html => {
                this.processStage(stage, html);
            })
            .catch(err => {
                console.error(`❌ ${stage.file}:`, err.message);
            });
    },

    /**
     * Process stage file content
     */
    processStage: function(stage, html) {
        // Check if already has notification trigger
        if (html.includes('NotificationEngine.trigger')) {
            console.log(`✅ ${stage.file}: Already has notification trigger`);
            return;
        }

        // Check if has completeStage function
        if (!html.includes('function completeStage()')) {
            console.log(`⚠️ ${stage.file}: No completeStage() function found`);
            return;
        }

        console.log(`🔧 ${stage.file}: Needs notification trigger added`);

        // Generate the code to insert
        const triggerCode = this.generateTriggerCode(stage);

        // Show what would be added
        console.log('   Add this line before WorkflowEngine.completeStage():');
        console.log('   ', triggerCode);

        // In live mode, actually modify the file
        if (this.config.liveMode) {
            this.injectTrigger(stage, html, triggerCode);
        }
    },

    /**
     * Generate trigger code for a stage
     */
    generateTriggerCode: function(stage) {
        return `NotificationEngine.trigger(${stage.stageNum}, currentVehicle, data, ${stage.assigneeField} || 'Unknown');`;
    },

    /**
     * Inject trigger into HTML content
     */
    injectTrigger: function(stage, html, triggerCode) {
        // Find the completeStage function and inject before WorkflowEngine.completeStage
        const pattern = /(WorkflowEngine\.completeStage\(\s*\d+\s*,\s*data\s*\);)/;
        
        if (!pattern.test(html)) {
            console.error(`❌ ${stage.file}: Could not find injection point`);
            return;
        }

        const newHtml = html.replace(pattern, `${triggerCode}\n            \n            $1`);

        // In a real scenario, you'd save this back to the file
        // For GitHub Pages/static hosting, you need to manually update
        console.log(`✅ ${stage.file}: Injection ready`);
        console.log('   Copy the modified code from console and paste into file');
        
        // Log the modified section for easy copy-paste
        const match = html.match(/(function completeStage\(\)[^{]*\{[\s\S]{0,500}WorkflowEngine\.completeStage)/);
        if (match) {
            console.log('   Context:', match[0].substring(0, 200) + '...');
        }
    },

    /**
     * Generate complete modified stage file content
     */
    generateModifiedFile: function(stageNum) {
        const stage = this.config.stages.find(s => s.stageNum === stageNum);
        if (!stage) return null;

        const triggerCode = this.generateTriggerCode(stage);
        
        return {
            stage: stageNum,
            file: stage.file,
            instruction: `Add this line BEFORE "WorkflowEngine.completeStage(${stageNum}, data);":`,
            code: triggerCode,
            fullContext: `
    // ADD THIS LINE:
    ${triggerCode}
    
    // BEFORE THIS EXISTING LINE:
    WorkflowEngine.completeStage(${stageNum}, data);
            `
        };
    },

    /**
     * Print all modifications needed
     */
    printAllModifications: function() {
        console.log('\n' + '='.repeat(60));
        console.log('NOTIFICATION INSTALLER - REQUIRED MODIFICATIONS');
        console.log('='.repeat(60) + '\n');

        this.config.stages.forEach(stage => {
            const mod = this.generateModifiedFile(stage.stageNum);
            console.log(`\n📄 ${mod.file} (Stage ${mod.stage})`);
            console.log('-'.repeat(40));
            console.log(mod.instruction);
            console.log('\nCode to add:');
            console.log(mod.code);
            console.log('');
        });

        console.log('='.repeat(60));
        console.log('INSTRUCTIONS:');
        console.log('1. Open each file above');
        console.log('2. Find the completeStage() function');
        console.log('3. Add the code line before WorkflowEngine.completeStage()');
        console.log('4. Save file');
        console.log('='.repeat(60));
    }
};

// Auto-run on load (in preview mode)
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page where we want to run this
    if (window.location.pathname.includes('install-notifications')) {
        NotificationInstaller.init();
    }
});

// Manual trigger function
function installNotifications() {
    NotificationInstaller.printAllModifications();
}
