// Embed functionality
class EmbedManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.modal = null;
        this.createModal();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="embedModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Embed Flowchart</h2>
                        <button class="modal-close" onclick="embedManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="embed-preview">
                            <h3>Preview</h3>
                            <img id="embedPreview" src="" alt="Flowchart preview">
                        </div>
                        
                        <div class="embed-section">
                            <h3>Image Tag (HTML)</h3>
                            <div class="code-block" id="htmlCode"></div>
                            <button class="btn btn-primary copy-btn" onclick="embedManager.copyCode('html')">Copy HTML</button>
                        </div>
                        
                        <div class="embed-section">
                            <h3>Base64 Data URL</h3>
                            <div class="code-block" id="base64Code" style="max-height: 150px; overflow-y: auto;"></div>
                            <button class="btn btn-primary copy-btn" onclick="embedManager.copyCode('base64')">Copy Base64</button>
                        </div>
                        
                        <div class="embed-section">
                            <h3>Markdown</h3>
                            <div class="code-block" id="markdownCode"></div>
                            <button class="btn btn-primary copy-btn" onclick="embedManager.copyCode('markdown')">Copy Markdown</button>
                        </div>
                        
                        <div class="embed-section">
                            <h3>Direct Link (for forums, social media)</h3>
                            <p style="color: #7f8c8d; font-size: 0.875rem;">
                                Save the image and upload it to your preferred image hosting service 
                                (Imgur, CloudFlare Images, etc.) to get a direct URL.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('embedModal');
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    generateEmbed() {
        if (STATE.elements.length === 0) {
            alert('Canvas is empty. Nothing to embed.');
            return;
        }

        // Calculate bounds with zoom reset
        const originalZoom = STATE.zoom;
        const originalPan = { ...STATE.panOffset };
        STATE.zoom = 1;
        STATE.panOffset = { x: 0, y: 0 };

        const bounds = this.calculateBounds();
        const padding = 40;
        
        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
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
        
        // Restore zoom and pan
        STATE.zoom = originalZoom;
        STATE.panOffset = originalPan;
        
        // Generate base64
        const base64 = tempCanvas.toDataURL('image/png');
        
        // Update modal content
        document.getElementById('embedPreview').src = base64;
        
        // Generate embed codes
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `flowchart_${timestamp}.png`;
        
        // HTML code
        const htmlCode = `<img src="${base64}" alt="Flowchart created with flowchart.dev" width="${tempCanvas.width}" height="${tempCanvas.height}">`;
        document.getElementById('htmlCode').textContent = htmlCode;
        
        // Base64 code
        document.getElementById('base64Code').textContent = base64;
        
        // Markdown code
        const markdownCode = `![Flowchart created with flowchart.dev](${base64})`;
        document.getElementById('markdownCode').textContent = markdownCode;
        
        // Show modal
        this.openModal();
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

    copyCode(type) {
        let text = '';
        let message = '';
        
        switch(type) {
            case 'html':
                text = document.getElementById('htmlCode').textContent;
                message = 'HTML code copied to clipboard!';
                break;
            case 'base64':
                text = document.getElementById('base64Code').textContent;
                message = 'Base64 data URL copied to clipboard!';
                break;
            case 'markdown':
                text = document.getElementById('markdownCode').textContent;
                message = 'Markdown code copied to clipboard!';
                break;
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            // Show success message
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            button.style.backgroundColor = '#27ae60';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = '✓ Copied!';
                button.style.backgroundColor = '#27ae60';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            } catch (err) {
                alert('Failed to copy to clipboard');
            }
            
            document.body.removeChild(textArea);
        });
    }

    openModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Global embed manager instance
let embedManager = null;