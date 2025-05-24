// Shape definitions and drawing functions
class Shape {
    constructor(type, x, y, width, height) {
        this.id = Date.now() + Math.random();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = type.charAt(0).toUpperCase() + type.slice(1);
        this.fillColor = CONFIG.DEFAULT_COLORS.fill;
        this.strokeColor = CONFIG.DEFAULT_COLORS.stroke;
        this.textColor = CONFIG.DEFAULT_COLORS.text;
        this.strokeWidth = CONFIG.STROKE_WIDTH;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        this.drawShape(ctx);
        
        ctx.restore();
        this.drawText(ctx);
    }

    drawShape(ctx) {
        switch(this.type) {
            case 'process':
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                break;
                
            case 'decision':
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width / 2, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'terminal':
                const radius = this.height / 2;
                ctx.beginPath();
                ctx.moveTo(this.x + radius, this.y);
                ctx.lineTo(this.x + this.width - radius, this.y);
                ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + radius, radius);
                ctx.lineTo(this.x + this.width, this.y + this.height - radius);
                ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height, radius);
                ctx.lineTo(this.x + radius, this.y + this.height);
                ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - radius, radius);
                ctx.lineTo(this.x, this.y + radius);
                ctx.arcTo(this.x, this.y, this.x + radius, this.y, radius);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'io':
                const offset = this.width * 0.15;
                ctx.beginPath();
                ctx.moveTo(this.x + offset, this.y);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.lineTo(this.x + this.width - offset, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'document':
                const waveHeight = this.height * 0.15;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height - waveHeight);
                ctx.quadraticCurveTo(
                    this.x + this.width * 0.75, this.y + this.height,
                    this.x + this.width * 0.5, this.y + this.height - waveHeight
                );
                ctx.quadraticCurveTo(
                    this.x + this.width * 0.25, this.y + this.height - waveHeight * 2,
                    this.x, this.y + this.height - waveHeight
                );
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'data':
                const skew = this.width * 0.2;
                ctx.beginPath();
                ctx.moveTo(this.x + skew, this.y);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.lineTo(this.x + this.width - skew, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'predefined':
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                // Draw vertical lines
                const lineOffset = this.width * 0.15;
                ctx.beginPath();
                ctx.moveTo(this.x + lineOffset, this.y);
                ctx.lineTo(this.x + lineOffset, this.y + this.height);
                ctx.moveTo(this.x + this.width - lineOffset, this.y);
                ctx.lineTo(this.x + this.width - lineOffset, this.y + this.height);
                ctx.stroke();
                break;
                
            case 'connector':
                const centerX = this.x + this.width / 2;
                const centerY = this.y + this.height / 2;
                const connectorRadius = Math.min(this.width, this.height) / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, connectorRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    drawText(ctx) {
        ctx.save();
        ctx.fillStyle = this.textColor;
        ctx.font = `${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Word wrap for long text
        const maxWidth = this.width - 20;
        const words = this.text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        const lineHeight = CONFIG.FONT_SIZE * 1.2;
        const startY = centerY - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, centerX, startY + index * lineHeight);
        });
        
        ctx.restore();
    }

    contains(x, y) {
        if (this.type === 'connector') {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const radius = Math.min(this.width, this.height) / 2;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            return distance <= radius;
        }
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    getConnectionPoints() {
        return [
            { x: this.x + this.width / 2, y: this.y }, // top
            { x: this.x + this.width, y: this.y + this.height / 2 }, // right
            { x: this.x + this.width / 2, y: this.y + this.height }, // bottom
            { x: this.x, y: this.y + this.height / 2 } // left
        ];
    }

    getNearestConnectionPoint(x, y) {
        const points = this.getConnectionPoints();
        let nearest = points[0];
        let minDistance = Infinity;
        
        points.forEach(point => {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        });
        
        return nearest;
    }
}