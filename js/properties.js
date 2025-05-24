// Properties panel functionality
function updateProperties(element) {
    const propertiesContent = document.getElementById('propertiesContent');
    
    if (!element) {
        propertiesContent.innerHTML = '<p class="empty-state">Select an element to edit its properties</p>';
        return;
    }
    
    let html = '';
    
    if (element instanceof Connector) {
        html = `
            <div class="property-group">
                <label>Type</label>
                <select id="connectorType" onchange="updateConnectorType()">
                    <option value="arrow" ${element.type === 'arrow' ? 'selected' : ''}>Arrow</option>
                    <option value="line" ${element.type === 'line' ? 'selected' : ''}>Line</option>
                </select>
            </div>
            <div class="property-group">
                <label>Stroke Color</label>
                <input type="color" id="strokeColor" value="${element.strokeColor}" onchange="updateElementProperty('strokeColor', this.value)">
            </div>
            <div class="property-group">
                <label>Stroke Width</label>
                <input type="number" id="strokeWidth" value="${element.strokeWidth}" min="1" max="10" onchange="updateElementProperty('strokeWidth', parseInt(this.value))">
            </div>
        `;
    } else {
        html = `
            <div class="property-group">
                <label>Text</label>
                <input type="text" id="shapeText" value="${element.text}" onchange="updateElementProperty('text', this.value)">
            </div>
            <div class="property-group">
                <label>Fill Color</label>
                <input type="color" id="fillColor" value="${element.fillColor}" onchange="updateElementProperty('fillColor', this.value)">
            </div>
            <div class="property-group">
                <label>Stroke Color</label>
                <input type="color" id="strokeColor" value="${element.strokeColor}" onchange="updateElementProperty('strokeColor', this.value)">
            </div>
            <div class="property-group">
                <label>Text Color</label>
                <input type="color" id="textColor" value="${element.textColor}" onchange="updateElementProperty('textColor', this.value)">
            </div>
            <div class="property-group">
                <label>Width</label>
                <input type="number" id="width" value="${Math.round(element.width)}" min="${CONFIG.MIN_SHAPE_SIZE}" onchange="updateElementProperty('width', parseInt(this.value))">
            </div>
            <div class="property-group">
                <label>Height</label>
                <input type="number" id="height" value="${Math.round(element.height)}" min="${CONFIG.MIN_SHAPE_SIZE}" onchange="updateElementProperty('height', parseInt(this.value))">
            </div>
        `;
    }
    
    html += `
        <div class="property-actions">
            <button class="btn btn-danger" onclick="deleteSelectedElement()">Delete</button>
        </div>
    `;
    
    propertiesContent.innerHTML = html;
}

function updateElementProperty(property, value) {
    if (STATE.selectedElement) {
        STATE.selectedElement[property] = value;
        historyManager.saveState();
        window.canvasManager.render();
    }
}

function updateConnectorType() {
    const select = document.getElementById('connectorType');
    if (STATE.selectedElement && STATE.selectedElement instanceof Connector) {
        STATE.selectedElement.type = select.value;
        historyManager.saveState();
        window.canvasManager.render();
    }
}

function deleteSelectedElement() {
    window.canvasManager.deleteSelected();
}