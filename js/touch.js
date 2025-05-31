// Touch event handling for mobile devices
class TouchManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.lastTouchPos = { x: 0, y: 0 };
        this.touchMode = null; // 'drag', 'pan', 'pinch'
        this.pinchStartDistance = 0;
        this.draggedElement = null;
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const canvas = this.canvasManager.canvas;
        
        // Canvas touch events
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Symbol touch events for drag
        this.setupSymbolTouch();
    }

    setupSymbolTouch() {
        const symbols = document.querySelectorAll('.symbol-item[data-touch="true"]');
        symbols.forEach(symbol => {
            symbol.addEventListener('touchstart', (e) => this.handleSymbolTouchStart(e), { passive: false });
            symbol.addEventListener('touchmove', (e) => this.handleSymbolTouchMove(e), { passive: false });
            symbol.addEventListener('touchend', (e) => this.handleSymbolTouchEnd(e), { passive: false });
        });
    }

    handleTouchStart(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(touch.clientX, touch.clientY) :
            { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        
        this.touchStartTime = Date.now();
        this.touchStartPos = coords;
        this.lastTouchPos = coords;
        
        // Handle pinch zoom
        if (e.touches.length === 2) {
            this.touchMode = 'pinch';
            const touch2 = e.touches[1];
            const dx = touch2.clientX - touch.clientX;
            const dy = touch2.clientY - touch.clientY;
            this.pinchStartDistance = Math.sqrt(dx * dx + dy * dy);
            return;
        }
        
        // Check if touching an element
        const element = this.canvasManager.getElementAt(coords.x, coords.y);
        if (element) {
            this.touchMode = 'drag';
            this.draggedElement = element;
            STATE.selectedElement = element;
            STATE.dragStart = { x: coords.x - element.x, y: coords.y - element.y };
            updateProperties(element);
            this.canvasManager.render();
        } else {
            // Start pan if no element touched
            this.touchMode = 'pan';
            STATE.isPanning = true;
            STATE.panStart = {
                x: touch.clientX - STATE.panOffset.x,
                y: touch.clientY - STATE.panOffset.y
            };
        }
        
        // Show touch indicator
        this.showTouchIndicator(touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 2 && this.touchMode === 'pinch') {
            // Handle pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const scale = distance / this.pinchStartDistance;
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            
            const rect = this.canvasManager.canvas.getBoundingClientRect();
            const canvasCenterX = centerX - rect.left;
            const canvasCenterY = centerY - rect.top;
            
            // Calculate new zoom
            const oldZoom = STATE.zoom;
            const newZoom = Math.min(Math.max(oldZoom * scale, CONFIG.ZOOM_MIN), CONFIG.ZOOM_MAX);
            
            if (window.zoomManager) {
                window.zoomManager.zoom(newZoom - oldZoom, canvasCenterX, canvasCenterY);
            }
            
            this.pinchStartDistance = distance;
            return;
        }
        
        const touch = e.touches[0];
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(touch.clientX, touch.clientY) :
            { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        
        if (this.touchMode === 'drag' && this.draggedElement) {
            // Drag element
            this.draggedElement.x = coords.x - STATE.dragStart.x;
            this.draggedElement.y = coords.y - STATE.dragStart.y;
            this.canvasManager.render();
        } else if (this.touchMode === 'pan') {
            // Pan canvas
            STATE.panOffset = {
                x: touch.clientX - STATE.panStart.x,
                y: touch.clientY - STATE.panStart.y
            };
            this.canvasManager.render();
        }
        
        this.lastTouchPos = coords;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        const touchDuration = Date.now() - this.touchStartTime;
        const touchDistance = Math.sqrt(
            Math.pow(this.lastTouchPos.x - this.touchStartPos.x, 2) +
            Math.pow(this.lastTouchPos.y - this.touchStartPos.y, 2)
        );
        
        // Detect tap (short duration, small movement)
        if (touchDuration < 300 && touchDistance < 10) {
            this.handleTap(this.lastTouchPos);
        }
        
        // Reset states
        if (this.touchMode === 'drag' && this.draggedElement) {
            historyManager.saveState();
        }
        
        this.touchMode = null;
        this.draggedElement = null;
        STATE.isPanning = false;
        STATE.isDragging = false;
    }

    handleTap(coords) {
        // Check if tapping on a connector to select it
        const element = this.canvasManager.getElementAt(coords.x, coords.y);
        if (element) {
            STATE.selectedElement = element;
            updateProperties(element);
            this.canvasManager.render();
        } else {
            STATE.selectedElement = null;
            updateProperties(null);
            this.canvasManager.render();
        }
    }

    // Symbol drag and drop for touch
    handleSymbolTouchStart(e) {
        e.preventDefault();
        const symbol = e.currentTarget;
        const touch = e.touches[0];
        
        // Create draggable clone
        const clone = symbol.cloneNode(true);
        clone.classList.add('touch-dragging');
        clone.style.left = (touch.clientX - 50) + 'px';
        clone.style.top = (touch.clientY - 30) + 'px';
        document.body.appendChild(clone);
        
        this.draggedSymbol = {
            element: clone,
            type: symbol.getAttribute('data-shape'),
            offsetX: 50,
            offsetY: 30
        };
    }

    handleSymbolTouchMove(e) {
        e.preventDefault();
        if (!this.draggedSymbol) return;
        
        const touch = e.touches[0];
        this.draggedSymbol.element.style.left = (touch.clientX - this.draggedSymbol.offsetX) + 'px';
        this.draggedSymbol.element.style.top = (touch.clientY - this.draggedSymbol.offsetY) + 'px';
    }

    handleSymbolTouchEnd(e) {
        e.preventDefault();
        if (!this.draggedSymbol) return;
        
        const touch = e.changedTouches[0];
        const canvas = this.canvasManager.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Check if dropped on canvas
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            
            const coords = window.zoomManager ? 
                window.zoomManager.screenToCanvas(touch.clientX, touch.clientY) :
                { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
            
            this.canvasManager.addShape(this.draggedSymbol.type, coords.x, coords.y);
        }
        
        // Remove clone
        document.body.removeChild(this.draggedSymbol.element);
        this.draggedSymbol = null;
    }

    showTouchIndicator(x, y) {
        const indicator = document.getElementById('touchIndicator');
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        indicator.style.display = 'block';
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 500);
    }
}