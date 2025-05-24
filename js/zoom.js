// Zoom and pan functionality
class ZoomManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.setupZoomControls();
        this.setupMouseWheelZoom();
        this.setupPanning();
    }

    setupZoomControls() {
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomResetBtn').addEventListener('click', () => this.resetZoom());
        
        this.updateZoomDisplay();
    }

    setupMouseWheelZoom() {
        this.canvasManager.canvas.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                
                const rect = this.canvasManager.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const delta = e.deltaY > 0 ? -CONFIG.ZOOM_STEP : CONFIG.ZOOM_STEP;
                this.zoom(delta, mouseX, mouseY);
            }
        }, { passive: false });
    }

    setupPanning() {
        const canvas = this.canvasManager.canvas;
        
        // Middle mouse button or space+drag for panning
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                STATE.isPanning = true;
                STATE.panStart = {
                    x: e.clientX - STATE.panOffset.x,
                    y: e.clientY - STATE.panOffset.y
                };
                canvas.style.cursor = 'grab';
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (STATE.isPanning) {
                STATE.panOffset = {
                    x: e.clientX - STATE.panStart.x,
                    y: e.clientY - STATE.panStart.y
                };
                this.canvasManager.render();
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (STATE.isPanning) {
                STATE.isPanning = false;
                canvas.style.cursor = STATE.isDrawingConnector ? 'crosshair' : 'default';
            }
        });

        // Reset cursor on mouse leave
        canvas.addEventListener('mouseleave', () => {
            STATE.isPanning = false;
            canvas.style.cursor = STATE.isDrawingConnector ? 'crosshair' : 'default';
        });
    }

    zoom(delta, centerX = null, centerY = null) {
        const oldZoom = STATE.zoom;
        const newZoom = Math.min(Math.max(STATE.zoom + delta, CONFIG.ZOOM_MIN), CONFIG.ZOOM_MAX);
        
        if (newZoom === oldZoom) return;

        // If center point provided (mouse wheel zoom), adjust pan to zoom around that point
        if (centerX !== null && centerY !== null) {
            const scale = newZoom / oldZoom;
            STATE.panOffset.x = centerX - (centerX - STATE.panOffset.x) * scale;
            STATE.panOffset.y = centerY - (centerY - STATE.panOffset.y) * scale;
        }

        STATE.zoom = newZoom;
        this.updateZoomDisplay();
        this.canvasManager.render();
    }

    zoomIn() {
        const canvas = this.canvasManager.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        this.zoom(CONFIG.ZOOM_STEP, centerX, centerY);
    }

    zoomOut() {
        const canvas = this.canvasManager.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        this.zoom(-CONFIG.ZOOM_STEP, centerX, centerY);
    }

    resetZoom() {
        STATE.zoom = 1;
        STATE.panOffset = { x: 0, y: 0 };
        this.updateZoomDisplay();
        this.canvasManager.render();
    }

    updateZoomDisplay() {
        const zoomLevel = document.getElementById('zoomLevel');
        zoomLevel.textContent = Math.round(STATE.zoom * 100) + '%';
        
        // Update button states
        document.getElementById('zoomInBtn').disabled = STATE.zoom >= CONFIG.ZOOM_MAX;
        document.getElementById('zoomOutBtn').disabled = STATE.zoom <= CONFIG.ZOOM_MIN;
    }

    // Convert screen coordinates to canvas coordinates
    screenToCanvas(x, y) {
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const screenX = x - rect.left;
        const screenY = y - rect.top;
        
        return {
            x: (screenX - STATE.panOffset.x) / STATE.zoom,
            y: (screenY - STATE.panOffset.y) / STATE.zoom
        };
    }

    // Convert canvas coordinates to screen coordinates
    canvasToScreen(x, y) {
        return {
            x: x * STATE.zoom + STATE.panOffset.x,
            y: y * STATE.zoom + STATE.panOffset.y
        };
    }
}