// History management for undo/redo functionality
class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = CONFIG.MAX_HISTORY;
    }

    // Save current state to history
    saveState() {
        // Remove any states after current index (when we're in the middle of history)
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Create deep copy of current state
        const stateCopy = {
            elements: this.serializeElements(STATE.elements),
            timestamp: Date.now()
        };

        // Add to history
        this.history.push(stateCopy);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.updateButtons();
    }

    // Serialize elements for storage
    serializeElements(elements) {
        return elements.map(el => {
            if (el instanceof Connector) {
                return {
                    type: 'connector',
                    data: {
                        start: { ...el.start },
                        end: { ...el.end },
                        startElementId: el.startElement ? el.startElement.id : null,
                        endElementId: el.endElement ? el.endElement.id : null,
                        connectorType: el.type,
                        strokeColor: el.strokeColor,
                        strokeWidth: el.strokeWidth,
                        id: el.id
                    }
                };
            } else {
                return {
                    type: 'shape',
                    data: {
                        shapeType: el.type,
                        x: el.x,
                        y: el.y,
                        width: el.width,
                        height: el.height,
                        text: el.text,
                        fillColor: el.fillColor,
                        strokeColor: el.strokeColor,
                        textColor: el.textColor,
                        strokeWidth: el.strokeWidth,
                        id: el.id
                    }
                };
            }
        });
    }

    // Deserialize elements from storage
    deserializeElements(serialized) {
        const elements = [];
        const idMap = new Map();

        // First pass: create all shapes
        serialized.forEach(item => {
            if (item.type === 'shape') {
                const shape = new Shape(
                    item.data.shapeType,
                    item.data.x,
                    item.data.y,
                    item.data.width,
                    item.data.height
                );
                Object.assign(shape, {
                    text: item.data.text,
                    fillColor: item.data.fillColor,
                    strokeColor: item.data.strokeColor,
                    textColor: item.data.textColor,
                    strokeWidth: item.data.strokeWidth,
                    id: item.data.id
                });
                elements.push(shape);
                idMap.set(shape.id, shape);
            }
        });

        // Second pass: create connectors with references
        serialized.forEach(item => {
            if (item.type === 'connector') {
                const startElement = item.data.startElementId ? idMap.get(item.data.startElementId) : null;
                const endElement = item.data.endElementId ? idMap.get(item.data.endElementId) : null;
                
                const connector = new Connector(
                    item.data.start,
                    item.data.end,
                    startElement,
                    endElement,
                    item.data.connectorType
                );
                Object.assign(connector, {
                    strokeColor: item.data.strokeColor,
                    strokeWidth: item.data.strokeWidth,
                    id: item.data.id
                });
                elements.push(connector);
            }
        });

        return elements;
    }

    // Undo last action
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            STATE.elements = this.deserializeElements(state.elements);
            STATE.selectedElement = null;
            updateProperties(null);
            window.canvasManager.render();
            this.updateButtons();
            return true;
        }
        return false;
    }

    // Redo last undone action
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            STATE.elements = this.deserializeElements(state.elements);
            STATE.selectedElement = null;
            updateProperties(null);
            window.canvasManager.render();
            this.updateButtons();
            return true;
        }
        return false;
    }

    // Update undo/redo button states
    updateButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.currentIndex <= 0;
        }
        if (redoBtn) {
            redoBtn.disabled = this.currentIndex >= this.history.length - 1;
        }
    }

    // Clear history
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateButtons();
    }
}

// Global history manager instance
const historyManager = new HistoryManager();