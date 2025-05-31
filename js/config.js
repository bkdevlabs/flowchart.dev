// Configuration and Constants
const CONFIG = {
    GRID_SIZE: 20,
    MIN_SHAPE_SIZE: 60,
    DEFAULT_SHAPE_WIDTH: 120,
    DEFAULT_SHAPE_HEIGHT: 80,
    CONNECTOR_HANDLE_SIZE: 8,
    SELECTION_PADDING: 10,
    DEFAULT_COLORS: {
        fill: '#ffffff',
        stroke: '#2c3e50',
        text: '#2c3e50',
        selection: '#3498db',
        connector: '#2c3e50',
        handle: '#3498db'
    },
    STROKE_WIDTH: 2,
    FONT_SIZE: 14,
    FONT_FAMILY: 'Arial, sans-serif',
    MAX_HISTORY: 50,
    ZOOM_MIN: 0.25,
    ZOOM_MAX: 3,
    ZOOM_STEP: 0.1
};

// Global state
const STATE = {
    elements: [],
    selectedElement: null,
    isDrawingConnector: false,
    connectorStart: null,
    tempConnector: null,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    connectorType: 'arrow', // 'arrow' or 'line'
    connectorMode: null, // 'direct' or 'path'
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isPanning: false,
    panStart: { x: 0, y: 0 },
    draggingControlPoint: false,
    tempPath: null
};