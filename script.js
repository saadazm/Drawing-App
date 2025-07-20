const draw = SVG().addTo('#drawing').size('800', '500');
let currentColor = document.getElementById("colorPicker").value;
let isDrawing = false;
let poly = null;

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
    isDrawing = false;
    poly = null;
    document.getElementById("drawing").style.cursor = "crosshair";
    draw.on('pointerdown', startPen);
    draw.on('pointermove', drawPen);
    draw.on('pointerup', endPen);
}


function deactivatePen() {
    isDrawing = false;
    poly = null;
    draw.off();
    document.getElementById("drawing").style.cursor = "default";
}


function startPen(event) {
    event.preventDefault(); // Prevents page drag/scroll
    isDrawing = true;
    const [x, y] = getMouse(event);
    poly = draw.polyline([[x, y]])
        .fill('none')
        .stroke({ color: currentColor, width: 2 });
}
function drawPen(event) {
    event.preventDefault(); // Prevents page drag/scroll
    if (!isDrawing || !poly) return;
    const [x, y] = getMouse(event);
    const points = poly.array().valueOf();
    points.push([x, y]);
    poly.plot(points);
}
function endPen(event) {
    event.preventDefault(); // Prevents page drag/scroll
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
