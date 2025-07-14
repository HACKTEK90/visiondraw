let strokes = [], images = [], texts = [], shapes = [], redoStack = [], zoom = 1, panX = 0, panY = 0;
let currentTool = 'brush'; // 'brush', 'rect', 'circle', 'line', 'text', 'eraser'
let drawingShape = false;
let startShapeX, startShapeY;
let mouseIsDown = false; // To track if mouse is down for panning/drawing
let drawing = false; // Added to track if brush/eraser is active

const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const qInput = document.getElementById('q');
const textInputContainer = document.getElementById('textInputContainer');
const textToInsertInput = document.getElementById('textToInsert');
const colorInput = document.getElementById('color');
const colorDisplay = document.getElementById('color-display');
const sizeSlider = document.getElementById('size');
const brushCap = document.getElementById('brushCap');
const brushJoin = document.getElementById('brushJoin');
const toolButtons = document.querySelectorAll('.tool-group button');
const imgInput = document.getElementById('imgInput');
const filterSelect = document.getElementById('filterSelect');
const applyFilterBtn = document.getElementById('applyFilterBtn');


resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  const rect = canvasEl.getBoundingClientRect();
  canvasEl.width = rect.width;
  canvasEl.height = rect.height;
  redraw();
}

function updateStatus(extra = '') {
  const status = document.getElementById('status');
  status.textContent = `🖼️ Images: ${images.length} | ✏️ Strokes: ${strokes.length} | 📝 Text: ${texts.length} | 🔳 Shapes: ${shapes.length}` + (extra ? ` | ${extra}` : '');
}

function saveState() {
  redoStack = []; 
}

function redraw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.setTransform(zoom, 0, 0, zoom, panX, panY);

  images.forEach(o => {
    ctx.save(); 
    applyFilterToContext(ctx, o.filter); 
    ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
    ctx.restore(); 
  });

  strokes.forEach(path => {
    ctx.strokeStyle = path[0].col;
    ctx.lineWidth = path[0].sz;
    ctx.lineCap = path[0].cap || 'round';
    ctx.lineJoin = path[0].join || 'round';
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });

  shapes.forEach(shape => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.fillStyle = shape.fill || 'transparent';
    ctx.lineCap = shape.cap || 'round';
    ctx.lineJoin = shape.join || 'round';

    ctx.beginPath();
    if (shape.type === 'rect') {
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === 'circle') {
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    } else if (shape.type === 'line') {
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
    }
    ctx.stroke();
    if (shape.fill !== 'transparent') {
      ctx.fill();
    }
  });

  texts.forEach(t => {
    ctx.fillStyle = t.color;
    ctx.font = `${t.size}px sans-serif`; 
    ctx.fillText(t.text, t.x, t.y);
  });
}

function applyFilterToCanvas(filterType) {
  if (!filterType) return;
  const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
  const pixels = imageData.data;
  
  if (filterType === 'grayscale') {
    for (let i = 0; i < pixels.length; i += 4) {
      const lightness = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114);
      pixels[i] = lightness;
      pixels[i + 1] = lightness;
      pixels[i + 2] = lightness;
    }
  } else if (filterType === 'invert') {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyFilterToContext(context, filterType) {
  if (filterType === 'grayscale') {
    context.filter = 'grayscale(100%)';
  } else if (filterType === 'invert') {
    context.filter = 'invert(100%)';
  } else {
    context.filter = 'none';
  }
}

// --- Tool Selection ---
toolButtons.forEach(button => {
  button.addEventListener('click', () => {
    toolButtons.forEach(btn => btn.classList.remove('active-tool'));
    button.classList.add('active-tool');
    currentTool = button.id.replace('Tool', '');
    answer(`Tool selected: ${currentTool}`);

    if (currentTool === 'text') {
      textInputContainer.style.display = 'flex'; // Use flex to enable column stacking
      qInput.style.display = 'none';
      document.getElementById('askBtn').style.display = 'none'; 
    } else {
      textInputContainer.style.display = 'none';
      qInput.style.display = 'flex'; 
      document.getElementById('askBtn').style.display = 'flex'; 
    }
  });
});

// --- Drawing Logic (adapted for shapes and tools) ---
canvasEl.addEventListener('pointerdown', e => {
  mouseIsDown = true;
  const x = (e.offsetX - panX) / zoom;
  const y = (e.offsetY - panY) / zoom;
  const color = colorInput.value;
  const size = parseInt(sizeSlider.value);
  const cap = brushCap.value;
  const join = brushJoin.value;

  saveState(); 

  if (currentTool === 'brush' || currentTool === 'eraser') {
    drawing = true;
    const s = [{ x, y, col: currentTool === 'eraser' ? '#ffffff' : color, sz: size, cap, join }];
    strokes.push(s);
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    updateStatus('Drawing…');
  } else if (['rect', 'circle', 'line'].includes(currentTool)) {
    drawingShape = true;
    startShapeX = x;
    startShapeY = y;
    updateStatus('Drawing Shape…');
  } else if (currentTool === 'text') {
    const textContent = textToInsertInput.value.trim();
    if (textContent) {
      texts.push({ x, y, text: textContent, color: color, size: size * 2 }); 
      redraw();
      updateStatus('Text added');
    } else {
      answer('❗ Type text in the dedicated field to add it.');
    }
  }
});

canvasEl.addEventListener('pointermove', e => {
  if (!mouseIsDown) return; 

  const x = (e.offsetX - panX) / zoom;
  const y = (e.offsetY - panY) / zoom;
  const color = colorInput.value;
  const size = parseInt(sizeSlider.value);
  const cap = brushCap.value;
  const join = brushJoin.value;

  if (drawing) { 
    const s = strokes[strokes.length - 1];
    s.push({ x, y });
    redraw();
  } else if (drawingShape) {
    redraw(); 
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = cap;
    ctx.lineJoin = join;
    ctx.beginPath();
    if (currentTool === 'rect') {
      ctx.rect(startShapeX, startShapeY, x - startShapeX, y - startShapeY);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2)) / 2;
      ctx.arc(startShapeX + (x - startShapeX) / 2, startShapeY + (y - startShapeY) / 2, radius, 0, Math.PI * 2);
    } else if (currentTool === 'line') {
      ctx.moveTo(startShapeX, startShapeY);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (!drawing && !drawingShape && e.buttons === 1) { 
    panX += e.movementX;
    panY += e.movementY;
    redraw();
  }
});

['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
  canvasEl.addEventListener(ev, (event) => { 
    mouseIsDown = false;
    if (drawing) {
      drawing = false;
      updateStatus();
    }
    if (drawingShape) {
      drawingShape = false;
      const x = (event.offsetX - panX) / zoom;
      const y = (event.offsetY - panY) / zoom;
      const color = colorInput.value;
      const size = parseInt(sizeSlider.value);
      const cap = brushCap.value;
      const join = brushJoin.value;

      if (currentTool === 'rect') {
        shapes.push({ type: 'rect', x: startShapeX, y: startShapeY, width: x - startShapeX, height: y - startShapeY, color, size, cap, join, fill: 'transparent' });
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2)) / 2;
        shapes.push({ type: 'circle', x: startShapeX + (x - startShapeX) / 2, y: startShapeY + (y - startShapeY) / 2, radius, color, size, cap, join, fill: 'transparent' });
      } else if (currentTool === 'line') {
        shapes.push({ type: 'line', x1: startShapeX, y1: startShapeY, x2: x, y2: y, color, size, cap, join });
      }
      redraw();
      updateStatus('Shape added');
    }
  })
);


colorInput.oninput = () => {
  colorDisplay.textContent = colorInput.value.toUpperCase();
  redraw();
};
sizeSlider.oninput = redraw;
brushCap.onchange = redraw;
brushJoin.onchange = redraw;

function answer(msg) {
  document.getElementById('answer').textContent = msg;
}

document.getElementById('clearBtn').onclick = () => {
  strokes.length = 0;
  images.length = 0;
  texts.length = 0;
  shapes.length = 0;
  redoStack.length = 0;
  redraw();
  updateStatus();
  answer('🧹 Canvas cleared.');
};

document.getElementById('undoBtn').onclick = () => {
  if (redoStack.length > 0 || strokes.length > 0 || images.length > 0 || texts.length > 0 || shapes.length > 0) {
    let undone = false;
    if (strokes.length > 0 && !undone) { 
      redoStack.push({ type: 'stroke', data: strokes.pop() });
      undone = true;
    } else if (shapes.length > 0 && !undone) {
      redoStack.push({ type: 'shape', data: shapes.pop() });
      undone = true;
    } else if (texts.length > 0 && !undone) {
      redoStack.push({ type: 'text', data: texts.pop() });
      undone = true;
    } else if (images.length > 0 && !undone) {
      redoStack.push({ type: 'image', data: images.pop() });
      undone = true;
    }

    if (undone) {
      redraw();
      updateStatus('Undo');
    }
  }
};

document.getElementById('redoBtn').onclick = () => {
  if (redoStack.length > 0) {
    const lastUndone = redoStack.pop();
    if (lastUndone.type === 'stroke') {
      strokes.push(lastUndone.data);
    } else if (lastUndone.type === 'shape') {
      shapes.push(lastUndone.data);
    } else if (lastUndone.type === 'text') {
      texts.push(lastUndone.data);
    } else if (lastUndone.type === 'image') {
      images.push(lastUndone.data);
    }
    redraw();
    updateStatus('Redo');
  }
};

document.getElementById('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvasEl.toDataURL();
  link.click();
};

document.getElementById('zoomInBtn').onclick = () => {
  zoom *= 1.1;
  redraw();
  updateStatus('Zoom In');
};
document.getElementById('zoomOutBtn').onclick = () => {
  zoom /= 1.1;
  redraw();
  updateStatus('Zoom Out');
};

let dragging = false, startX = 0, startY = 0;
canvasEl.addEventListener('mousedown', e => {
  if (!drawing && !drawingShape && currentTool !== 'text') { 
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    canvasEl.style.cursor = 'grabbing';
  }
});
canvasEl.addEventListener('mouseup', () => {
  dragging = false;
  canvasEl.style.cursor = 'grab';
});


imgInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const maxW = canvasEl.width * 0.6, maxH = canvasEl.height * 0.6;
    let w = img.width, h = img.height;
    const ratio = Math.min(maxW / w, maxH / h, 1);
    w *= ratio; h *= ratio;
    const x = (canvasEl.width - w) / 2 / zoom - panX / zoom;
    const y = (canvasEl.height - h) / 2 / zoom - panY / zoom;
    images.push({ img, x, y, w, h, filter: filterSelect.value }); 
    redraw();
    updateStatus('Image added');
    saveState();
  };
  img.src = URL.createObjectURL(file);
  e.target.value = '';
};


applyFilterBtn.onclick = () => {
  const selectedFilter = filterSelect.value;
  if (selectedFilter) {
    applyFilterToCanvas(selectedFilter);
    answer(`Applied ${selectedFilter} filter.`);
  } else {
    answer('❗ Select a filter to apply.');
  }
};

document.getElementById('askBtn').onclick = async () => {
  const q = document.getElementById('q').value.trim();
  if (!q) {
    answer('❗ Enter a question.');
    return;
  }
  answer('⏳ Processing…');
  const imgData = canvasEl.toDataURL('image/png');
  try {
    if (typeof puter !== 'undefined' && puter.ai && puter.ai.chat) {
      const reply = await puter.ai.chat(q, imgData);
      answer(reply || '(no reply)');
    } else {
      answer('❌ AI chat service not available.');
      console.error("Puter AI chat service not found. Ensure 'https://js.puter.com/v2/' is loaded correctly and the service is active.");
    }
  } catch (err) {
    console.error(err);
    answer('❌ ' + err.message);
  }
};

// Initialize color display
colorDisplay.textContent = colorInput.value.toUpperCase();

updateStatus();
