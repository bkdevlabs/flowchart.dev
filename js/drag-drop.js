// Drag and drop functionality
class DragDropManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.setupDragDrop();
    }

    setupDragDrop() {
        // Setup draggable symbols
        const symbols = document.querySelectorAll('.symbol-item');
        symbols.forEach(symbol => {
            symbol.addEventListener('dragstart', (e) => this.handleDragStart(e));
            symbol.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Setup canvas as drop target
        const canvas = this.canvasManager.canvas;
        canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        canvas.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        
        const shapeType = e.target.getAttribute('data-shape');
        e.dataTransfer.setData('shape-type', shapeType);
        
        // Create custom drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 50, 30);
        
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDrop(e) {
        e.preventDefault();
        
        const shapeType = e.dataTransfer.getData('shape-type');
        if (!shapeType) return;
        
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const coords = window.zoomManager ? 
            window.zoomManager.screenToCanvas(e.clientX, e.clientY) :
            { x: e.clientX - rect.left, y: e.clientY - rect.top };
        
        this.canvasManager.addShape(shapeType, coords.x, coords.y);
    }
}