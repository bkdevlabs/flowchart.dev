// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas manager
    window.canvasManager = new CanvasManager('flowchartCanvas');
    
    // Initialize zoom manager
    window.zoomManager = new ZoomManager(window.canvasManager);
    
    // Initialize touch support
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        window.touchManager = new TouchManager(window.canvasManager);
    }
    
    // Initialize mobile UI
    mobileUIManager = new MobileUIManager();
    
    // Initialize drag and drop
    const dragDropManager = new DragDropManager(window.canvasManager);
    
    // Initialize export manager
    const exportManager = new ExportManager(window.canvasManager);
    
    // Initialize embed manager
    embedManager = new EmbedManager(window.canvasManager);
    
    // Setup event listeners
    setupEventListeners(exportManager);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize history with empty state
    historyManager.saveState();
});

function setupEventListeners(exportManager) {
    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        exportManager.exportAsPNG();
    });
    
    // Embed button
    document.getElementById('embedBtn').addEventListener('click', () => {
        embedManager.generateEmbed();
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        window.canvasManager.clearCanvas();
    });
    
    // Undo/Redo buttons
    document.getElementById('undoBtn').addEventListener('click', () => {
        historyManager.undo();
    });
    
    document.getElementById('redoBtn').addEventListener('click', () => {
        historyManager.redo();
    });
    
    // Connector buttons
    document.getElementById('lineBtn').addEventListener('click', () => {
        toggleConnectorMode('line');
    });
    
    document.getElementById('arrowBtn').addEventListener('click', () => {
        toggleConnectorMode('arrow');
    });
    
    document.getElementById('pathBtn').addEventListener('click', () => {
        toggleConnectorMode('path');
    });
    
    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (e.target.id === 'flowchartCanvas') {
            return; // Handled by canvas events
        }
        
        // Check if clicking on UI elements
        const isUIElement = e.target.closest('.toolbar, .properties-panel, .app-header, .modal');
        if (!isUIElement && !STATE.isDragging) {
            STATE.selectedElement = null;
            updateProperties(null);
            window.canvasManager.render();
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Prevent shortcuts when typing in inputs
        if (isInputFocused()) {
            return;
        }
        
        // Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (STATE.selectedElement) {
                e.preventDefault();
                window.canvasManager.deleteSelected();
            }
        }
        
        // Escape key - cancel connector drawing or close modal
        if (e.key === 'Escape') {
            if (document.querySelector('.modal.show')) {
                embedManager.closeModal();
            } else if (STATE.isDrawingConnector || STATE.connectorMode === 'path') {
                disableConnectorMode();
                window.canvasManager.render();
            }
        }
        
        // Ctrl/Cmd + Z - Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            historyManager.undo();
        }
        
        // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            historyManager.redo();
        }
        
        // Ctrl/Cmd + E - Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('exportBtn').click();
        }
        
        // Ctrl/Cmd + Plus - Zoom In
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            window.zoomManager.zoomIn();
        }
        
        // Ctrl/Cmd + Minus - Zoom Out
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            window.zoomManager.zoomOut();
        }
        
        // Ctrl/Cmd + 0 - Reset Zoom
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            window.zoomManager.resetZoom();
        }
    });
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.tagName === 'SELECT';
}