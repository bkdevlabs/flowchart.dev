# Flowchart.dev - Professional Flowchart Drawing Tool

Flowchart.dev is a modern, web-based flowchart drawing application that allows users to create professional diagrams using ANSI standard flowchart symbols. Built with vanilla JavaScript and HTML5 Canvas, it offers a clean, intuitive interface with powerful features like zoom controls, undo/redo functionality, and multiple export options.

## Features

### 🎨 ANSI Standard Flowchart Symbols
- **Process** - Rectangle for general processing steps
- **Decision** - Diamond for decision points and conditionals
- **Terminal** - Rounded rectangle for start/end points
- **Input/Output** - Parallelogram for data input/output operations
- **Document** - Document shape with wavy bottom
- **Data** - Parallelogram skewed right for data storage
- **Predefined Process** - Rectangle with vertical lines for subroutines
- **Connector** - Circle for connecting flow between pages

### 🔧 Core Functionality
- **Drag & Drop Interface** - Simply drag symbols from the toolbar onto the canvas
- **Smart Connectors** - Draw arrows and lines between shapes with automatic attachment points
- **Property Editor** - Customize colors, text, and dimensions for each element
- **Zoom Controls** - Zoom in/out up to 300% with mouse wheel or buttons
- **Pan Navigation** - Navigate large diagrams with Shift+drag or middle mouse button
- **Undo/Redo** - Up to 50 levels of undo/redo history
- **Auto-Save History** - Never lose your work with automatic state management

### 📤 Export & Sharing Options
- **PNG Export** - Download your flowchart as a high-quality PNG image
- **Embed Code** - Generate HTML, Base64, or Markdown embed codes
- **Clean Export** - Exports without UI elements or selection highlights

## Installation

1. Clone or download the repository to your web server:
```bash
git clone git@github.com:bkdevlabs/flowchart.dev.git
cd flowchart.dev
```

2. Ensure the following directory structure:
```
flowchart.dev/
├── index.html
├── styles/
│   ├── main.css
│   ├── toolbar.css
│   ├── canvas.css
│   └── properties.css
└── js/
    ├── config.js
    ├── shapes.js
    ├── canvas.js
    ├── drag-drop.js
    ├── connectors.js
    ├── properties.js
    ├── export.js
    ├── history.js
    ├── zoom.js
    ├── embed.js
    └── app.js
```

3. Serve the files through any web server or open `index.html` directly in a browser:
   - For local testing, you can use a simple HTTP server like Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
   - Then navigate to `http://localhost:8000` in your web browser.

## Usage Guide

### Creating a Flowchart

1. **Add Shapes**
   - Drag any symbol from the left toolbar onto the canvas
   - Shapes will snap to a grid for easy alignment

2. **Connect Shapes**
   - Click the "Draw Arrow" or "Draw Line" button in the toolbar
   - Click on the starting shape (connection points will appear)
   - Click on the ending shape to create a connection

3. **Edit Elements**
   - Click any shape to select it
   - Use the properties panel on the right to modify:
     - Text content
     - Fill color
     - Stroke color
     - Text color
     - Width and height
   - Double-click shapes to quickly edit text

4. **Navigate the Canvas**
   - **Zoom**: Ctrl/Cmd + Mouse wheel, or use zoom buttons
   - **Pan**: Shift + drag, or middle mouse button
   - **Reset View**: Click "Reset" in zoom controls

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected element |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo (alternative) |
| `Ctrl/Cmd + E` | Export as PNG |
| `Ctrl/Cmd + Plus` | Zoom in |
| `Ctrl/Cmd + Minus` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom to 100% |
| `Escape` | Cancel connector drawing / Close modal |

### Exporting Your Flowchart

#### As PNG Image
1. Click the "Export as PNG" button
2. The flowchart will be downloaded with a timestamp filename

#### For Web Embedding
1. Click the "Embed Code" button
2. Choose your preferred format:
   - **HTML**: Complete `<img>` tag with embedded base64 data
   - **Base64**: Raw base64 data URL for custom implementations
   - **Markdown**: Markdown syntax for documentation
3. Click "Copy" to copy the code to clipboard
4. Paste into your website, documentation, or application

### Tips & Best Practices

1. **Organizing Complex Flowcharts**
   - Use connector circles to link between different sections
   - Group related processes visually
   - Maintain consistent flow direction (typically top-to-bottom or left-to-right)

2. **Color Coding**
   - Use different colors to represent different types of operations
   - Maintain consistency throughout your diagram
   - Consider accessibility - ensure sufficient contrast

3. **Text Guidelines**
   - Keep text concise and action-oriented
   - Use consistent verb tenses
   - For decisions, use yes/no questions

4. **Performance**
   - For very large diagrams, zoom out to see the full picture
   - The tool handles hundreds of elements smoothly
   - History is limited to 50 states to maintain performance

## Technical Details

### Browser Requirements
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Canvas API support required

### Architecture
- **No Dependencies**: Pure vanilla JavaScript implementation
- **Modular Design**: Separated into logical modules for maintainability
- **Canvas-Based**: Leverages HTML5 Canvas for smooth rendering
- **State Management**: Centralized state with history tracking

### Configuration
Edit `js/config.js` to customize:
- Default colors
- Shape dimensions
- Grid size
- Zoom limits
- History depth

## Troubleshooting

### Common Issues

**Shapes not dropping on canvas**
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify all JS files are loaded correctly

**Zoom not working with mouse wheel**
- Hold Ctrl (Windows/Linux) or Cmd (Mac) while scrolling
- Check if browser zoom is interfering (reset with Ctrl/Cmd + 0)

**Export produces blank image**
- Ensure at least one element is on the canvas
- Check browser permissions for downloads

**Cannot connect shapes**
- Click "Draw Arrow" or "Draw Line" first
- Ensure you're clicking directly on shapes
- Connection points appear when in connector mode

### Performance Optimization

For large diagrams:
1. Zoom out to reduce rendering complexity
2. Clear unused elements regularly
3. Export and start fresh for new sections
4. Consider breaking very large flows into multiple diagrams

## Contributing

Contributions are welcome! Please consider:
- Adding new shape types
- Improving connector routing algorithms
- Adding collaborative features
- Implementing save/load functionality
- Creating themes

## Future Enhancements

Planned features for future releases:
- Save/Load functionality (JSON format)
- SVG export option
- Mobile optimization
- More shape types (database, cloud, etc.)
- Curved connectors
- Text formatting (bold, italic, size)
- Alignment and distribution tools
- Layers support
- Collaborative editing
- Keyboard-only shape creation
- Touch device support
- Dark mode

## Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Email: support@bkdevlabs.com

## Credits

Developed by: Bargav Kondapu  
Company: BKDevLabs  
Technical Assistance: Claude Opus 4 (Anthropic)

---

Built by BKDevLabs, with the goal of making flowchart creation simple, intuitive, and powerful. Happy flowcharting!  🚀

© 2025 BKDevLabs. All rights reserved.