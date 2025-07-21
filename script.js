const draw = SVG().addTo('#drawing').size('90vw', '80vh');
let currentColor = document.getElementById("colorPicker").value;
let isDrawing = false;
let poly = null;
let penStrokes = []; // Store pen stroke elements

// Update color on picker change
document.getElementById("colorPicker").addEventListener("change", e => {
    currentColor = e.target.value;
});

// Draw rectangle and enable right-click drag
function drawRect() {
    deactivatePen();
    let rect = draw.rect(100, 80)
        .fill(currentColor)
        .stroke({ width: 2, color: '#333' })
        .move(50, 50);
    enableRightClickDrag(rect);
}

// Draw circle and enable right-click drag
function drawCircle() {
    deactivatePen();
    let circ = draw.circle(80)
        .fill(currentColor)
        .stroke({ width: 2, color: '#333' })
        .move(100, 100);
    enableRightClickDrag(circ);
}

// Activate pen tool for freehand drawing
function activatePen() {
    isDrawing = false;
    poly = null;
    setDraggable(false);
    document.getElementById("drawing").style.cursor = "crosshair";
    draw.on('pointerdown', startPen);
    draw.on('pointermove', drawPen);
    draw.on('pointerup', endPen);
}

// Deactivate pen tool and enable dragging
function deactivatePen() {
    isDrawing = false;
    poly = null;
    setDraggable(true);
    draw.off();
    document.getElementById("drawing").style.cursor = "default";
}

// Start drawing polyline
function startPen(event) {
    event.preventDefault();
    if (event.button !== 0) return; // Only left mouse/stylus
    isDrawing = true;
    const [x, y] = getMouse(event);
    poly = draw.polyline([[x, y]])
        .fill('none')
        .stroke({ color: currentColor, width: 2 });
}


// Draw polyline as mouse/stylus moves
function drawPen(event) {
    event.preventDefault();
    if (!isDrawing || !poly) return;
    const [x, y] = getMouse(event);
    const points = poly.array().valueOf();
    points.push([x, y]);
    poly.plot(points);
}

// End polyline and enable right-click drag
function endPen(event) {
    event.preventDefault();
    if (!isDrawing) return;
    isDrawing = false;
    enableRightClickDrag(poly);
    penStrokes.push(poly); // Save the stroke for undo
    poly = null;
}

// Get mouse/stylus position relative to SVG canvas
function getMouse(event) {
    let r = draw.node.getBoundingClientRect();
    return [event.clientX - r.left, event.clientY - r.top];
}

// Enable dragging for all shapes (used when pen tool is off)
function setDraggable(enabled) {
    draw.each(function() {
        if (enabled) {
            enableRightClickDrag(this);
        } else {
            this.off('pointerdown');
            this.off('contextmenu');
        }
    });
}

function undoPenStroke() {
    if (penStrokes.length > 0) {
        const lastStroke = penStrokes.pop();
        lastStroke.remove();
    }
}

// Custom right-click drag logic for a shape
function enableRightClickDrag(shape) {
    let dragging = false;
    let offset = [0, 0];

    shape.off('pointerdown');
    shape.off('contextmenu');

    shape.on('pointerdown', function(e) {
        if (e.button === 2) { // Right mouse button
            dragging = true;
            const [x, y] = getMouse(e);
            offset = [x - shape.x(), y - shape.y()];
            e.preventDefault();
        }
    });

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);

    function moveHandler(e) {
        if (dragging) {
            const [x, y] = getMouse(e);
            shape.move(x - offset[0], y - offset[1]);
        }
    }

    function upHandler(e) {
        if (dragging && e.button === 2) {
            dragging = false;
        }
    }

    shape.on('contextmenu', function(e) {
        e.preventDefault();
    });
}

// Export SVG drawing
function exportSVG() {
    let svgData = draw.svg();
    let blob = new Blob([svgData], { type: "image/svg+xml" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}