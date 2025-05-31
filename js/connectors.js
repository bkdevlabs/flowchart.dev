// Connector class and drawing logic
class Connector {
    constructor(start, end, startElement, endElement, type = 'arrow', points = []) {
        this.id = Date.now() + Math.random();
        this.start = start;
        this.end = end;
        this.startElement = startElement;
        this.endElement = endElement;
        this.type = type;
        this.strokeColor = CONFIG.DEFAULT_COLORS.connector;
        this.strokeWidth = CONFIG.STROKE_WIDTH;
        this.points = points; // Array of intermediate points for path connectors
        this.selectedPointIndex = -1;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        // Update positions based on connected elements
        if (this.startElement) {
            this.start = this.startElement.getNearestConnectionPoint(
                this.points.length > 0 ? this.points[0] : this.end
            );
        }
        if (this.endElement) {
            this.end = this.endElement.getNearestConnectionPoint(
                this.points.length > 0 ? this.points[this.points.length - 1] : this.start
            );
        }
        
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        
        // Draw path through points
        if (this.points.length > 0) {
            this.points.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
        }
        
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        
        // Draw arrow head if type is arrow
        if (this.type === 'arrow') {
            this.drawArrowHead(ctx);
        }
        
        // Draw control points if selected
        if (STATE.selectedElement === this && this.points.length > 0) {
            this.drawControlPoints(ctx);
        }
        
        ctx.restore();
    }

    drawArrowHead(ctx) {
        let angle;
        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            angle = Math.atan2(this.end.y - lastPoint.y, this.end.x - lastPoint.x);
        } else {
            angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        }
        
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

    drawControlPoints(ctx) {
        ctx.save();
        ctx.fillStyle = CONFIG.DEFAULT_COLORS.handle;
        ctx.strokeStyle = CONFIG.DEFAULT_COLORS.handle;
        ctx.lineWidth = 2;
        
        this.points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            if (index === this.selectedPointIndex) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    contains(x, y) {
        // Check if point is near any segment of the path
        const segments = this.getSegments();
        for (let segment of segments) {
            const distance = this.pointToLineDistance(x, y, segment.start, segment.end);
            if (distance < 10) return true;
        }
        return false;
    }

    getSegments() {
        const segments = [];
        let prevPoint = this.start;
        
        if (this.points.length > 0) {
            this.points.forEach(point => {
                segments.push({ start: prevPoint, end: point });
                prevPoint = point;
            });
        }
        
        segments.push({ start: prevPoint, end: this.end });
        return segments;
    }

    getControlPointAt(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance < 10) {
                return i;
            }
        }
        return -1;
    }

    addPoint(x, y, index = -1) {
        const newPoint = { x, y };
        if (index === -1) {
            this.points.push(newPoint);
        } else {
            this.points.splice(index, 0, newPoint);
        }
    }

    movePoint(index, x, y) {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = { x, y };
        }
    }

    removePoint(index) {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
        }
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

// Path connector for multi-point connections
class PathConnector {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.isDrawing = false;
        this.currentPath = [];
        this.startElement = null;
        this.type = 'arrow';
    }

    startPath(x, y) {
        const element = this.canvasManager.getShapeAt(x, y);
        if (element) {
            this.isDrawing = true;
            this.startElement = element;
            const point = element.getNearestConnectionPoint(x, y);
            this.currentPath = [point];
            STATE.isDrawingConnector = true;
        }
    }

    addPathPoint(x, y) {
        if (this.isDrawing) {
            this.currentPath.push({ x, y });
            this.canvasManager.render();
            this.drawTempPath();
        }
    }

    finishPath(x, y) {
        if (!this.isDrawing) return;
        
        const element = this.canvasManager.getShapeAt(x, y);
        if (element && element !== this.startElement) {
            const endPoint = element.getNearestConnectionPoint(x, y);
            const points = this.currentPath.slice(1); // Remove start point
            
            const connector = new Connector(
                this.currentPath[0],
                endPoint,
                this.startElement,
                element,
                this.type,
                points
            );
            
            STATE.elements.push(connector);
            historyManager.saveState();
        }
        
        this.reset();
        this.canvasManager.render();
    }

    drawTempPath() {
        const ctx = this.canvasManager.ctx;
        ctx.save();
        ctx.strokeStyle = CONFIG.DEFAULT_COLORS.connector;
        ctx.lineWidth = CONFIG.STROKE_WIDTH;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
        
        for (let i = 1; i < this.currentPath.length; i++) {
            ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
        }
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = CONFIG.DEFAULT_COLORS.handle;
        this.currentPath.forEach((point, index) => {
            if (index > 0) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }

    reset() {
        this.isDrawing = false;
        this.currentPath = [];
        this.startElement = null;
        STATE.isDrawingConnector = false;
    }
}

// Connector management functions
let pathConnector = null;

function toggleConnectorMode(type) {
    if (type === 'path') {
        // Initialize path connector if needed
        if (!pathConnector) {
            pathConnector = new PathConnector(window.canvasManager);
        }
        pathConnector.type = 'arrow';
        STATE.connectorMode = 'path';
    } else {
        STATE.isDrawingConnector = true;
        STATE.connectorType = type;
        STATE.connectorMode = 'direct';
    }
    
    const canvas = document.getElementById('flowchartCanvas');
    canvas.style.cursor = 'crosshair';
    
    // Update button states
    document.querySelectorAll('.btn-tool').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (type === 'arrow') {
        document.getElementById('arrowBtn').classList.add('active');
    } else if (type === 'line') {
        document.getElementById('lineBtn').classList.add('active');
    } else if (type === 'path') {
        document.getElementById('pathBtn').classList.add('active');
    }
}

function disableConnectorMode() {
    STATE.isDrawingConnector = false;
    STATE.connectorStart = null;
    STATE.tempConnector = null;
    STATE.connectorMode = null;
    
    if (pathConnector) {
        pathConnector.reset();
    }
    
    const canvas = document.getElementById('flowchartCanvas');
    canvas.style.cursor = 'default';
}