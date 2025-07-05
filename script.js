const draw = SVG().addTo('#drawing').size('800', '500');
let currentColor = document.getElementById("colorPicker").value;
let isDrawing = false;
let poly = null;

// Watch color
document.getElementById("colorPicker").addEventListener("change", e => {
    currentColor = e.target.value;
});


function drawRect() {
    deactivatePen();
    console.log("Drawing Rectangle mode");
    let rect = draw.rect(100,80)
                    .fill(currentColor)
                    .stroke({ width:2, color:'#333' })
                    .move(50,50)
                    .draggable();
}


function drawCircle() {
    deactivatePen();
    console.log("Drawing Circle mode");
    let circ = draw.circle(80)
                    .fill(currentColor)
                    .stroke({ width:2, color:'#333' })
                    .move(100,100)
                    .draggable();
}


function activatePen() {
    console.log("Pen tool activated");
    // deactivatePen(); <--- Removed this line
    isDrawing = false;
    poly = null;
    document.getElementById("drawing").style.cursor = "crosshair";
    draw.on('mousedown', startPen);
    draw.on('mousemove', drawPen);
    draw.on('mouseup', endPen);
}


function deactivatePen() {
    isDrawing = false;
    poly = null;
    draw.off();
    document.getElementById("drawing").style.cursor = "default";
}


function startPen(event) {
    isDrawing = true;
    const [x,y] = getMouse(event);
    poly = draw.polyline([[x,y]])
         .fill('none')
         .stroke({ color: currentColor, width: 2 });
}
function drawPen(event) {
    if (!isDrawing || !poly) return;
    console.log("Value of poly in drawPen:", poly);
    const [x,y] = getMouse(event);
    const points = poly.array().valueOf(); // Get a plain array of points
    points.push([x, y]);
    poly.plot(points);
}
function endPen(event) {
    if (!isDrawing) return;
    isDrawing = false;
    poly.draggable();
    poly = null;
}


function getMouse(event) {
    let r = draw.node.getBoundingClientRect();
    return [event.clientX - r.left, event.clientY - r.top];
}

function exportSVG() {
    let svgData = draw.svg();
    let blob = new Blob([svgData], {type:"image/svg+xml"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
