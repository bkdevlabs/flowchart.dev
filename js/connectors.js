// Connector class and drawing logic
class Connector {
    constructor(start, end, startElement, endElement, type = 'arrow') {
        this.id = Date.now() + Math.random();
        this.start = start;
        this.end = end;
        this.startElement = startElement;
        this.endElement = endElement;
        this.type = type;
        this.strokeColor = CONFIG.DEFAULT_COLORS.connector;
        this.strokeWidth = CONFIG.STROKE_WIDTH;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        // Update positions based on connected elements
        if (this.startElement) {
            this.start = this.startElement.getNearestConnectionPoint(this.end.x, this.end.y);
        }
        if (this.endElement) {
            this.end = this.endElement.getNearestConnectionPoint(this.start.x, this.start.y);
        }
        
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        
        // Draw arrow head if type is arrow
        if (this.type === 'arrow') {
            this.drawArrowHead(ctx);
        }
        
        ctx.restore();
    }

    drawArrowHead(ctx) {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        ctx.save();
        ctx.fillStyle = this.strokeColor;
        
        ctx.beginPath();
        ctx.moveTo(this.end.x, this.end.y);
        ctx.lineTo(
            this.end.x - arrowLength * Math.cos(angle - arrowAngle),
            this.end.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
            this.end.x - arrowLength * Math.cos(angle + arrowAngle),
            this.end.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    contains(x, y) {
        // Check if point is near the line
        const distance = this.pointToLineDistance(x, y, this.start, this.end);
        return distance < 10; // 10 pixel tolerance
    }

    pointToLineDistance(px, py, start, end) {
        const A = px - start.x;
        const B = py - start.y;
        const C = end.x - start.x;
        const D = end.y - start.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = start.x;
            yy = start.y;
        } else if (param > 1) {
            xx = end.x;
            yy = end.y;
        } else {
            xx = start.x + param * C;
            yy = start.y + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Connector management functions
function toggleConnectorMode(type) {
    STATE.isDrawingConnector = true;
    STATE.connectorType = type;
    
    const canvas = document.getElementById('flowchartCanvas');
    canvas.style.cursor = 'crosshair';
    
    // Update button states
    document.querySelectorAll('.btn-tool').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (type === 'arrow') {
        document.getElementById('arrowBtn').classList.add('active');
    } else {
        document.getElementById('lineBtn').classList.add('active');
    }
}

function disableConnectorMode() {
    STATE.isDrawingConnector = false;
    STATE.connectorStart = null;
    STATE.tempConnector = null;
    
    const canvas = document.getElementById('flowchartCanvas');
    canvas.style.cursor = 'default';
}