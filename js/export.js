// Export functionality
class ExportManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    exportAsPNG() {
        if (STATE.elements.length === 0) {
            alert('Canvas is empty. Nothing to export.');
            return;
        }

        // Calculate bounds of all elements
        const bounds = this.calculateBounds();
        
        // Create temporary canvas with proper dimensions
        const tempCanvas = document.createElement('canvas');
        const padding = 40;
        tempCanvas.width = bounds.width + padding * 2;
        tempCanvas.height = bounds.height + padding * 2;
        
        const tempCtx = tempCanvas.getContext('2d');
        
        // White background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Translate to account for bounds
        tempCtx.translate(padding - bounds.minX, padding - bounds.minY);
        
        // Draw all elements
        STATE.elements.forEach(element => {
            element.draw(tempCtx);
        });
        
        // Convert to PNG and download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `flowchart_${new Date().getTime()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    calculateBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        STATE.elements.forEach(element => {
            if (element instanceof Connector) {
                minX = Math.min(minX, element.start.x, element.end.x);
                minY = Math.min(minY, element.start.y, element.end.y);
                maxX = Math.max(maxX, element.start.x, element.end.x);
                maxY = Math.max(maxY, element.start.y, element.end.y);
            } else {
                minX = Math.min(minX, element.x);
                minY = Math.min(minY, element.y);
                maxX = Math.max(maxX, element.x + element.width);
                maxY = Math.max(maxY, element.y + element.height);
            }
        });
        
        return {
            minX: minX,
            minY: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}