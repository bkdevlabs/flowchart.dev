// Canvas management and rendering
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
    }

    handleMouseDown(e) {
        if (STATE.isPanning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(e.clientX, e.clientY) :
            { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const x = coords.x;
        const y = coords.y;

        if (STATE.isDrawingConnector) {
            this.startConnector(x, y);
            return;
        }

        // Check if clicking on an element
        const clickedElement = this.getElementAt(x, y);
        
        if (clickedElement) {
            STATE.selectedElement = clickedElement;
            STATE.isDragging = true;
            STATE.dragStart = { x: x - clickedElement.x, y: y - clickedElement.y };
            this.canvas.style.cursor = 'move';
            updateProperties(clickedElement);
        } else {
            STATE.selectedElement = null;
            updateProperties(null);
        }
        
        this.render();
    }

    handleMouseMove(e) {
        if (STATE.isPanning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(e.clientX, e.clientY) :
            { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const x = coords.x;
        const y = coords.y;

        if (STATE.isDrawingConnector && STATE.connectorStart) {
            STATE.tempConnector = {
                start: STATE.connectorStart,
                end: { x, y }
            };
            this.render();
        } else if (STATE.isDragging && STATE.selectedElement) {
            const oldX = STATE.selectedElement.x;
            const oldY = STATE.selectedElement.y;
            
            STATE.selectedElement.x = x - STATE.dragStart.x;
            STATE.selectedElement.y = y - STATE.dragStart.y;
            
            // Only save to history when movement is significant
            if (Math.abs(oldX - STATE.selectedElement.x) > 5 || 
                Math.abs(oldY - STATE.selectedElement.y) > 5) {
                if (!this.dragHistorySaved) {
                    historyManager.saveState();
                    this.dragHistorySaved = true;
                }
            }
            
            this.render();
        }
    }

    handleMouseUp(e) {
        if (STATE.isPanning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(e.clientX, e.clientY) :
            { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const x = coords.x;
        const y = coords.y;

        if (STATE.isDrawingConnector && STATE.connectorStart) {
            this.endConnector(x, y);
        }

        STATE.isDragging = false;
        this.dragHistorySaved = false;
        this.canvas.style.cursor = STATE.isDrawingConnector ? 'crosshair' : 'default';
    }

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(e.clientX, e.clientY) :
            { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const x = coords.x;
        const y = coords.y;

        const clickedElement = this.getElementAt(x, y);
        if (clickedElement && !(clickedElement instanceof Connector)) {
            const newText = prompt('Enter text:', clickedElement.text);
            if (newText !== null) {
                historyManager.saveState();
                clickedElement.text = newText;
                this.render();
            }
        }
    }

    startConnector(x, y) {
        const element = this.getShapeAt(x, y);
        if (element) {
            const point = element.getNearestConnectionPoint(x, y);
            STATE.connectorStart = { point, element };
        }
    }

    endConnector(x, y) {
        if (!STATE.connectorStart) return;

        const element = this.getShapeAt(x, y);
        if (element && element !== STATE.connectorStart.element) {
            const endPoint = element.getNearestConnectionPoint(x, y);
            const connector = new Connector(
                STATE.connectorStart.point,
                endPoint,
                STATE.connectorStart.element,
                element,
                STATE.connectorType
            );
            STATE.elements.push(connector);
            historyManager.saveState();
        }

        STATE.connectorStart = null;
        STATE.tempConnector = null;
        this.render();
    }

    getElementAt(x, y) {
        // Check connectors first (they should be on top)
        for (let i = STATE.elements.length - 1; i >= 0; i--) {
            if (STATE.elements[i] instanceof Connector && STATE.elements[i].contains(x, y)) {
                return STATE.elements[i];
            }
        }
        
        // Then check shapes
        for (let i = STATE.elements.length - 1; i >= 0; i--) {
            if (!(STATE.elements[i] instanceof Connector) && STATE.elements[i].contains(x, y)) {
                return STATE.elements[i];
            }
        }
        return null;
    }

    getShapeAt(x, y) {
        for (let i = STATE.elements.length - 1; i >= 0; i--) {
            if (!(STATE.elements[i] instanceof Connector) && STATE.elements[i].contains(x, y)) {
                return STATE.elements[i];
            }
        }
        return null;
    }

    addShape(type, x, y) {
        let width = CONFIG.DEFAULT_SHAPE_WIDTH;
        let height = CONFIG.DEFAULT_SHAPE_HEIGHT;
        
        if (type === 'connector') {
            width = height = CONFIG.MIN_SHAPE_SIZE;
        } else if (type === 'decision') {
            width = height = CONFIG.DEFAULT_SHAPE_HEIGHT;
        }
        
        const shape = new Shape(type, x - width/2, y - height/2, width, height);
        STATE.elements.push(shape);
        historyManager.saveState();
        this.render();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply zoom and pan transformations
        this.ctx.translate(STATE.panOffset.x, STATE.panOffset.y);
        this.ctx.scale(STATE.zoom, STATE.zoom);
        
        // Draw elements
        STATE.elements.forEach(element => {
            element.draw(this.ctx);
        });
        
        // Draw selection
        if (STATE.selectedElement && !(STATE.selectedElement instanceof Connector)) {
            this.drawSelection(STATE.selectedElement);
        }
        
        // Draw temporary connector
        if (STATE.tempConnector) {
            this.drawTempConnector();
        }
        
        // Draw connection handles when drawing connectors
        if (STATE.isDrawingConnector) {
            this.drawConnectionHandles();
        }
        
        // Restore context state
        this.ctx.restore();
    }

    drawSelection(element) {
        this.ctx.save();
        this.ctx.strokeStyle = CONFIG.DEFAULT_COLORS.selection;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const padding = CONFIG.SELECTION_PADDING;
        this.ctx.strokeRect(
            element.x - padding,
            element.y - padding,
            element.width + padding * 2,
            element.height + padding * 2
        );
        
        this.ctx.restore();
    }

    drawTempConnector() {
        this.ctx.save();
        this.ctx.strokeStyle = CONFIG.DEFAULT_COLORS.connector;
        this.ctx.lineWidth = CONFIG.STROKE_WIDTH;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(STATE.tempConnector.start.x, STATE.tempConnector.start.y);
        this.ctx.lineTo(STATE.tempConnector.end.x, STATE.tempConnector.end.y);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawConnectionHandles() {
        STATE.elements.forEach(element => {
            if (element instanceof Connector) return;
            
            const points = element.getConnectionPoints();
            this.ctx.save();
            this.ctx.fillStyle = CONFIG.DEFAULT_COLORS.handle;
            
            points.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, CONFIG.CONNECTOR_HANDLE_SIZE / 2, 0, 2 * Math.PI);
                this.ctx.fill();
            });
            
            this.ctx.restore();
        });
    }

    deleteSelected() {
        if (STATE.selectedElement) {
            const index = STATE.elements.indexOf(STATE.selectedElement);
            if (index > -1) {
                // If deleting a shape, also delete connected connectors
                if (!(STATE.selectedElement instanceof Connector)) {
                    STATE.elements = STATE.elements.filter(el => {
                        if (el instanceof Connector) {
                            return el.startElement !== STATE.selectedElement && 
                                   el.endElement !== STATE.selectedElement;
                        }
                        return true;
                    });
                }
                
                STATE.elements.splice(index, 1);
                STATE.selectedElement = null;
                updateProperties(null);
                historyManager.saveState();
                this.render();
            }
        }
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            STATE.elements = [];
            STATE.selectedElement = null;
            updateProperties(null);
            historyManager.clear();
            historyManager.saveState();
            this.render();
        }
    }
}