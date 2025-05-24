// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas manager
    window.canvasManager = new CanvasManager('flowchartCanvas');
    
    // Initialize drag and drop
    const dragDropManager = new DragDropManager(window.canvasManager);
    
    // Initialize export manager
    const exportManager = new ExportManager(window.canvasManager);
    
    // Setup event listeners
    setupEventListeners(exportManager);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
});

function setupEventListeners(exportManager) {
    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        exportManager.exportAsPNG();
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        window.canvasManager.clearCanvas();
    });
    
    // Connector buttons
    document.getElementById('lineBtn').addEventListener('click', () => {
        toggleConnectorMode('line');
    });
    
    document.getElementById('arrowBtn').addEventListener('click', () => {
        toggleConnectorMode('arrow');
    });
    
    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (e.target.id === 'flowchartCanvas') {
            return; // Handled by canvas events
        }
        
        // Check if clicking on UI elements
        const isUIElement = e.target.closest('.toolbar, .properties-panel, .app-header');
        if (!isUIElement && !STATE.isDragging) {
            STATE.selectedElement = null;
            updateProperties(null);
            window.canvasManager.render();
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (STATE.selectedElement && !isInputFocused()) {
                e.preventDefault();
                window.canvasManager.deleteSelected();
            }
        }
        
        // Escape key - cancel connector drawing
        if (e.key === 'Escape') {
            if (STATE.isDrawingConnector) {
                disableConnectorMode();
                window.canvasManager.render();
            }
        }
        
        // Ctrl/Cmd + A - Select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            // Could implement select all functionality here
        }
        
        // Ctrl/Cmd + E - Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('exportBtn').click();
        }
    });
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.tagName === 'SELECT';
}