/**
 * PAGE CONVERSION HELPER
 * Run this in browser console on old pages to get conversion hints
 */

const CapeyeConverter = {
    // Map old classes to new classes
    classMap: {
        // Headers
        'header': 'cy-header',
        'header-content': 'cy-header-content',
        
        // Cards
        'metric-card': 'cy-card-elevated',
        'workflow-card': 'cy-workflow-card',
        'filters-section': 'cy-filters',
        'workflow-section': 'cy-card',
        'stuck-section': 'cy-card',
        'alerts-section': 'cy-card',
        'actions-section': 'cy-card',
        'activity-section': 'cy-card',
        
        // Tables
        'data-table': 'cy-table',
        'table-container': 'cy-table-container',
        
        // Badges
        'stock-badge': 'cy-badge-stock',
        'stage-badge': 'cy-badge-purple',
        'status-badge': 'cy-status',
        
        // Layout
        'main-container': 'cy-container',
        'metrics-grid': 'cy-grid-4',
        'workflow-grid': 'cy-grid-6',
        'two-column': 'cy-grid-2',
        'filters-grid': 'cy-filters-grid',
        
        // Text
        'metric-label': 'cy-metric-label',
        'metric-value': 'cy-metric-value',
        'section-title': 'cy-section-title',
        
        // Alerts
        'alert-item': 'cy-alert',
        'alert-warning': 'cy-alert-warning',
        'alert-danger': 'cy-alert-danger',
        'alert-success': 'cy-alert-success',
    },

    // Analyze current page
    analyze: function() {
        console.log('=== CAPEYE CONVERSION ANALYSIS ===\n');
        
        const findings = [];
        
        // Check for old classes
        Object.keys(this.classMap).forEach(oldClass => {
            const elements = document.querySelectorAll('.' + oldClass);
            if (elements.length > 0) {
                findings.push({
                    old: oldClass,
                    new: this.classMap[oldClass],
                    count: elements.length
                });
            }
        });
        
        if (findings.length === 0) {
            console.log('✓ No old classes found - page may already be converted');
            return;
        }
        
        console.log('Classes to convert:');
        console.table(findings);
        
        console.log('\n=== QUICK FIXES ===');
        console.log('1. Add to <head>:');
        console.log('   <link rel="stylesheet" href="./css/capeye-system.css">');
        console.log('   <script src="./js/capeye-core.js"><\/script>');
        
        console.log('\n2. Replace body background:');
        console.log('   Add: <div class="cy-bg-grid"></div>');
        console.log('   Add: <div class="cy-ambient-glow"></div>');
        
        console.log('\n3. Update header structure (see template.html)');
        
        console.log('\n4. Replace container:');
        console.log('   Old: <div class="main-container">');
        console.log('   New: <main class="cy-container">');
    },

    // Generate conversion report
    generateReport: function() {
        this.analyze();
        
        // Check for inline styles that should be moved to CSS
        const inlineStyled = document.querySelectorAll('[style]');
        console.log(`\n⚠ Found ${inlineStyled.length} elements with inline styles`);
        console.log('Consider moving these to the page-specific CSS section');
    }
};

// Run analysis
CapeyeConverter.generateReport();
