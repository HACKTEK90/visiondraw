// Enhanced Drawing Application
document.addEventListener('DOMContentLoaded', function() {
  // Mobile UI Variables
  let isSidebarOpen = false;
  let currentMobileSection = 'drawing-tools';
  const menuToggleBtn = document.getElementById('menuToggle');
  const closeSidebarBtn = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtns = document.querySelectorAll('.mobile-menu-btn');
  const toolSections = document.querySelectorAll('.tool-section');
  const mobileActionBtns = {
    undo: document.getElementById('mobileUndoBtn'),
    redo: document.getElementById('mobileRedoBtn'),
    ai: document.getElementById('mobileAIBtn'),
    download: document.getElementById('mobileDownloadBtn')
  };
  
  // ===== DATA STRUCTURES =====
  let layers = [
    { id: 0, name: "Background", visible: true, strokes: [], images: [], texts: [], shapes: [] }
  ];
  let currentLayerId = 0;
  let redoStack = [];
  let undoStack = [];
  let zoom = 1;
  let panX = 0, panY = 0;
  let currentTool = 'brush';
  let drawingShape = false;
  let startShapeX, startShapeY;
  let mouseIsDown = false;
  let drawing = false;
  let fillEnabled = false;
  let opacity = 100;
  let textAlign = 'left';
  let isDarkTheme = false;
  let polygonPoints = [];
  let starPoints = 5;
  let currentColor = '#4a6ee0';
  let currentFillColor = '#ffffff';
  let brushSize = 5;
  let brushOpacity = 1;
  let brushCap = 'round';
  let brushJoin = 'round';
  let brushHardness = 100;
  let brushSpacing = 25;
  let brushFlow = 100;
  let showGrid = false;
  let snapToGrid = false;
  let showRulers = false;
  let cloneSource = null;

  // ===== DOM ELEMENTS =====
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');
  const colorInput = document.getElementById('color');
  const colorPreview = document.getElementById('colorPreview');
  const colorDisplay = document.getElementById('color-display');
  const fillColorInput = document.getElementById('fillColor');
  const fillColorDisplay = document.getElementById('fill-color-display');
  const enableFillCheckbox = document.getElementById('enableFill');
  const sizeSlider = document.getElementById('size');
  const sizeDisplay = document.getElementById('size-display');
  const opacitySlider = document.getElementById('opacity');
  const opacityDisplay = document.getElementById('opacity-display');
  const hardnessSlider = document.getElementById('hardness');
  const hardnessDisplay = document.getElementById('hardness-display');
  const spacingSlider = document.getElementById('spacing');
  const spacingDisplay = document.getElementById('spacing-display');
  const flowSlider = document.getElementById('flow');
  const flowDisplay = document.getElementById('flow-display');
  const enableGridCheckbox = document.getElementById('enableGrid');
  const enableSnapCheckbox = document.getElementById('enableSnap');
  const enableRulersCheckbox = document.getElementById('enableRulers');
  const videoInput = document.getElementById('videoInput');
  const videoOverlay = document.getElementById('videoOverlay');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const videoProgress = document.getElementById('videoProgress');
  const videoOpacity = document.getElementById('videoOpacity');
  const videoOpacityDisplay = document.getElementById('video-opacity-display');
  const enableVideoOverlay = document.getElementById('enableVideoOverlay');
  let isVideoLoaded = false;
  const brushCapSelect = document.getElementById('brushCap');
  const brushJoinSelect = document.getElementById('brushJoin');
  const toolButtons = document.querySelectorAll('.tool-group button');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const imgInput = document.getElementById('imgInput');
  const filterSelect = document.getElementById('filterSelect');
  const applyFilterBtn = document.getElementById('applyFilterBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const resetViewBtn = document.getElementById('resetViewBtn');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  const coordinatesDisplay = document.getElementById('coordinates');
  const textToolPanel = document.getElementById('textToolPanel');
  const textToInsertInput = document.getElementById('textToInsert');
  const fontFamilySelect = document.getElementById('fontFamily');
  const fontStyleSelect = document.getElementById('fontStyle');
  const aiPanel = document.getElementById('aiPanel');
  const qInput = document.getElementById('q');
  const askBtn = document.getElementById('askBtn');
  const answerContainer = document.getElementById('answer-container');
  const closeAnswerBtn = document.getElementById('closeAnswer');
  const themeToggleBtn = document.getElementById('themeToggle');
  const hideNavbarBtn = document.getElementById('hideNavbarBtn');
  const showNavbarBtn = document.getElementById('showNavbarBtn');
  const header = document.querySelector('header');
  let isNavbarHidden = false;
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const modalContainer = document.getElementById('modal-container');
  const closeModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const canvasSizeSelect = document.getElementById('canvasSize');
  
  // Canvas size presets
  const canvasSizes = {
    fit: { width: 'fit', height: 'fit' },
    a4: { width: 794, height: 1123 }, // A4 at 96 DPI
    letter: { width: 816, height: 1056 }, // Letter at 96 DPI
    square: { width: 800, height: 800 },
    wide: { width: 1200, height: 600 },
    custom: { width: 1000, height: 700 }
  };
  
  let currentCanvasSize = 'fit';

  // ===== INITIALIZATION =====
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  initializeColorPicker();
  updateLayersUI();
  updateStatus();

  // ===== CANVAS FUNCTIONS =====
  function resizeCanvas() {
    const container = canvasEl.parentElement;
    const rect = container.getBoundingClientRect();
    const size = canvasSizes[currentCanvasSize];
    
    let width, height;
    
    if (size.width === 'fit') {
      // Fit to screen with aspect ratio
      const aspectRatio = 16 / 9;
      width = rect.width - 40;
      height = width / aspectRatio;
      
      if (height > rect.height - 40) {
        height = rect.height - 40;
        width = height * aspectRatio;
      }
    } else {
      // Use preset size, but scale down if too large for container
      width = size.width;
      height = size.height;
      
      const maxWidth = rect.width - 40;
      const maxHeight = rect.height - 40;
      
      if (width > maxWidth || height > maxHeight) {
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY);
        
        width *= scale;
        height *= scale;
      }
    }
    
    canvasEl.width = width;
    canvasEl.height = height;
    redraw();
  }

  function redraw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    
    // Fill with white/dark background based on theme
    ctx.fillStyle = isDarkTheme ? '#2c2c2c' : '#ffffff';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    
    ctx.setTransform(zoom, 0, 0, zoom, panX, panY);

    // Draw each visible layer in order
    layers.forEach(layer => {
      if (!layer.visible) return;

      // Draw images
      layer.images.forEach(o => {
        ctx.save();
        applyFilterToContext(ctx, o.filter);
        ctx.globalAlpha = o.opacity || 1;
        ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      // Draw strokes
      layer.strokes.forEach(path => {
        ctx.strokeStyle = path[0].col;
        ctx.lineWidth = path[0].sz;
        ctx.lineCap = path[0].cap || 'round';
        ctx.lineJoin = path[0].join || 'round';
        ctx.globalAlpha = path[0].opacity || 1;
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw shapes
      layer.shapes.forEach(shape => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.fillStyle = shape.fill || 'transparent';
        ctx.lineCap = shape.cap || 'round';
        ctx.lineJoin = shape.join || 'round';
        ctx.globalAlpha = shape.opacity || 1;

        ctx.beginPath();
        if (shape.type === 'rect') {
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === 'circle') {
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        } else if (shape.type === 'line') {
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
        } else if (shape.type === 'triangle') {
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.lineTo(shape.x3, shape.y3);
          ctx.closePath();
        } else if (shape.type === 'polygon') {
          if (shape.points && shape.points.length > 0) {
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.closePath();
          }
        } else if (shape.type === 'star') {
          drawStar(ctx, shape.x, shape.y, shape.points, shape.outerRadius, shape.innerRadius);
        }
        
        if (shape.fill !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw texts
      layer.texts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = `${t.style || 'normal'} ${t.size}px ${t.font || 'Arial'}`;
        ctx.textAlign = t.align || 'left';
        ctx.globalAlpha = t.opacity || 1;
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
      });
    });
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid();
    }
    
    // Draw rulers if enabled
    if (showRulers) {
      drawRulers();
    }
  }
  
  function drawGrid() {
    const gridSize = 20;
    ctx.save();
    ctx.strokeStyle = isDarkTheme ? '#444' : '#ddd';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    
    for (let x = 0; x < canvasEl.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasEl.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvasEl.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasEl.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  function drawRulers() {
    ctx.save();
    ctx.fillStyle = isDarkTheme ? '#333' : '#f0f0f0';
    ctx.strokeStyle = isDarkTheme ? '#666' : '#ccc';
    ctx.font = '10px Arial';
    ctx.fillStyle = isDarkTheme ? '#fff' : '#000';
    
    // Top ruler
    ctx.fillRect(0, 0, canvasEl.width, 20);
    for (let x = 0; x < canvasEl.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 20);
      ctx.stroke();
      ctx.fillText(x.toString(), x + 2, 15);
    }
    
    // Left ruler
    ctx.fillRect(0, 0, 20, canvasEl.height);
    for (let y = 0; y < canvasEl.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(20, y);
      ctx.stroke();
      ctx.save();
      ctx.translate(15, y - 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(y.toString(), 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  function drawArrow(ctx, x1, y1, x2, y2) {
    const headlen = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
  }

  function drawHeart(ctx, x, y, width, height) {
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
  }

  function drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function smudgePaint(x, y) {
    const imageData = ctx.getImageData(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
    ctx.putImageData(imageData, x - brushSize / 2, y - brushSize / 2);
  }

  function clonePaint(x, y) {
    if (!cloneSource) return;
    const sourceData = ctx.getImageData(cloneSource.x - brushSize / 2, cloneSource.y - brushSize / 2, brushSize, brushSize);
    ctx.putImageData(sourceData, x - brushSize / 2, y - brushSize / 2);
  }

  function blurPaint(x, y) {
    const imageData = ctx.getImageData(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = avg;
    }
    
    ctx.putImageData(imageData, x - brushSize, y - brushSize);
  }

  function sharpenPaint(x, y) {
    const imageData = ctx.getImageData(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.min(255, pixels[i] * 1.2);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * 1.2);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * 1.2);
    }
    
    ctx.putImageData(imageData, x - brushSize, y - brushSize);
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
    } else if (filterType === 'sepia') {
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        pixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        pixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        pixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
    } else if (filterType === 'blur') {
      const tempPixels = new Uint8ClampedArray(pixels.length);
      tempPixels.set(pixels);
      
      const width = canvasEl.width;
      const height = canvasEl.height;
      const blurRadius = 2;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          
          for (let ky = -blurRadius; ky <= blurRadius; ky++) {
            for (let kx = -blurRadius; kx <= blurRadius; kx++) {
              const posX = Math.min(width - 1, Math.max(0, x + kx));
              const posY = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (posY * width + posX) * 4;
              
              r += tempPixels[idx];
              g += tempPixels[idx + 1];
              b += tempPixels[idx + 2];
              a += tempPixels[idx + 3];
              count++;
            }
          }
          
          const idx = (y * width + x) * 4;
          pixels[idx] = r / count;
          pixels[idx + 1] = g / count;
          pixels[idx + 2] = b / count;
          pixels[idx + 3] = a / count;
        }
      }
    } else if (filterType === 'brightness') {
      const factor = 1.2;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, pixels[i] * factor);
        pixels[i + 1] = Math.min(255, pixels[i + 1] * factor);
        pixels[i + 2] = Math.min(255, pixels[i + 2] * factor);
      }
    } else if (filterType === 'contrast') {
      const factor = 1.5;
      const midpoint = 128;
      
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, midpoint + (pixels[i] - midpoint) * factor);
        pixels[i + 1] = Math.min(255, midpoint + (pixels[i + 1] - midpoint) * factor);
        pixels[i + 2] = Math.min(255, midpoint + (pixels[i + 2] - midpoint) * factor);
      }
    } else if (filterType === 'hue-rotate') {
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Convert RGB to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Rotate hue by 90 degrees
        const newHue = (h + 90) % 360;
        
        // Convert back to RGB
        const [newR, newG, newB] = hslToRgb(newHue, s, l);
        
        pixels[i] = newR;
        pixels[i + 1] = newG;
        pixels[i + 2] = newB;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  function applyFilterToContext(context, filterType) {
    if (filterType === 'grayscale') {
      context.filter = 'grayscale(100%)';
    } else if (filterType === 'invert') {
      context.filter = 'invert(100%)';
    } else if (filterType === 'sepia') {
      context.filter = 'sepia(100%)';
    } else if (filterType === 'blur') {
      context.filter = 'blur(2px)';
    } else if (filterType === 'brightness') {
      context.filter = 'brightness(120%)';
    } else if (filterType === 'contrast') {
      context.filter = 'contrast(150%)';
    } else if (filterType === 'hue-rotate') {
      context.filter = 'hue-rotate(90deg)';
    } else {
      context.filter = 'none';
    }
  }

  // ===== HELPER FUNCTIONS =====
  function getCurrentLayer() {
    return layers.find(layer => layer.id === currentLayerId);
  }

  function updateStatus(extra = '') {
    const layer = getCurrentLayer();
    const status = document.getElementById('status');
    status.textContent = `🖼️ Images: ${layer.images.length} | ✏️ Strokes: ${layer.strokes.length} | 📝 Text: ${layer.texts.length} | 🔳 Shapes: ${layer.shapes.length}` + (extra ? ` | ${extra}` : '');
  }

  function saveState() {
    // Save current state for undo
    const state = JSON.stringify(layers);
    undoStack.push(state);
    
    // Clear redo stack when new action is performed
    redoStack = [];
    
    // Limit undo stack size
    if (undoStack.length > 20) {
      undoStack.shift();
    }
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
      case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
      case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
      case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
      default: icon = '<i class="fas fa-info-circle"></i>';
    }
    
    toast.innerHTML = `${icon} ${message}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function showModal(title, content) {
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modalContainer.classList.add('active');
  }

  function hideModal() {
    modalContainer.classList.remove('active');
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, (h / 360 + 1/3) % 1);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, (h / 360 - 1/3) % 1);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function getColorAtPoint(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0].toString(16).padStart(2, '0');
    const g = pixel[1].toString(16).padStart(2, '0');
    const b = pixel[2].toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  function initializeColorPicker() {
    colorPreview.style.backgroundColor = colorInput.value;
    colorDisplay.textContent = colorInput.value.toUpperCase();
    fillColorDisplay.textContent = fillColorInput.value.toUpperCase();
  }

  // ===== EVENT HANDLERS =====
  
  // Tool Selection
  toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tool buttons
      document.querySelectorAll('.tool-group button').forEach(btn => {
        btn.classList.remove('active-tool');
      });
      
      // Add active class to clicked button
      button.classList.add('active-tool');
      currentTool = button.id.replace('Tool', '');
      console.log('Selected tool:', currentTool);
      
      // Close sidebar on mobile after tool selection
      if (window.innerWidth <= 992) {
        setTimeout(() => {
          isSidebarOpen = false;
          sidebar.classList.remove('active');
        }, 300);
      }
      
      // Show/hide text tool panel
      if (currentTool === 'text') {
        textToolPanel.classList.add('active');
        aiPanel.classList.add('hidden');
      } else {
        textToolPanel.classList.remove('active');
        aiPanel.classList.remove('hidden');
      }
      
      // Set cursor based on tool
      if (currentTool === 'eyedropper') {
        canvasEl.style.cursor = 'crosshair';
      } else if (currentTool === 'fill') {
        canvasEl.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z\'/%3E%3C/svg%3E") 0 24, auto';
      } else if (currentTool === 'eraser') {
        canvasEl.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20h7.66l8.72-8.72c.78-.78.78-2.05 0-2.83l-4.85-4.86c-.39-.39-.9-.59-1.42-.59M6.45 18L4.03 15.58l8.5-8.5 2.44 2.44-8.52 8.48\'/%3E%3C/svg%3E") 0 24, auto';
      } else {
        canvasEl.style.cursor = 'crosshair';
      }
      
      showToast(`${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} tool selected`, 'info');
    });
  });

  // Color Picker
  colorInput.addEventListener('input', () => {
    currentColor = colorInput.value;
    colorPreview.style.backgroundColor = currentColor;
    colorDisplay.textContent = currentColor.toUpperCase();
  });

  // Color Swatches
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      colorInput.value = color;
      currentColor = color;
      colorPreview.style.backgroundColor = color;
      colorDisplay.textContent = color.toUpperCase();
      swatch.classList.add('pulse');
      setTimeout(() => swatch.classList.remove('pulse'), 500);
    });
  });

  // Fill Color
  fillColorInput.addEventListener('input', () => {
    currentFillColor = fillColorInput.value;
    fillColorDisplay.textContent = currentFillColor.toUpperCase();
  });

  // Enable Fill
  enableFillCheckbox.addEventListener('change', () => {
    fillEnabled = enableFillCheckbox.checked;
  });

  // Brush Size
  sizeSlider.addEventListener('input', () => {
    brushSize = parseInt(sizeSlider.value);
    sizeDisplay.textContent = `${brushSize}px`;
  });

  // Opacity
  opacitySlider.addEventListener('input', () => {
    opacity = parseInt(opacitySlider.value);
    brushOpacity = opacity / 100;
    opacityDisplay.textContent = `${opacity}%`;
  });

  // Hardness
  if (hardnessSlider) {
    hardnessSlider.addEventListener('input', () => {
      brushHardness = parseInt(hardnessSlider.value);
      hardnessDisplay.textContent = `${brushHardness}%`;
    });
  }

  // Spacing
  if (spacingSlider) {
    spacingSlider.addEventListener('input', () => {
      brushSpacing = parseInt(spacingSlider.value);
      spacingDisplay.textContent = `${brushSpacing}%`;
    });
  }

  // Flow
  if (flowSlider) {
    flowSlider.addEventListener('input', () => {
      brushFlow = parseInt(flowSlider.value);
      flowDisplay.textContent = `${brushFlow}%`;
    });
  }

  // Grid options
  if (enableGridCheckbox) {
    enableGridCheckbox.addEventListener('change', () => {
      showGrid = enableGridCheckbox.checked;
      redraw();
      showToast(`Grid ${showGrid ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  if (enableSnapCheckbox) {
    enableSnapCheckbox.addEventListener('change', () => {
      snapToGrid = enableSnapCheckbox.checked;
      showToast(`Snap to grid ${snapToGrid ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  if (enableRulersCheckbox) {
    enableRulersCheckbox.addEventListener('change', () => {
      showRulers = enableRulersCheckbox.checked;
      redraw();
      showToast(`Rulers ${showRulers ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  // Brush Cap & Join
  brushCapSelect.addEventListener('change', () => {
    brushCap = brushCapSelect.value;
  });
  
  brushJoinSelect.addEventListener('change', () => {
    brushJoin = brushJoinSelect.value;
  });

  // Canvas Drawing Events
  canvasEl.addEventListener('pointerdown', handlePointerDown);
  canvasEl.addEventListener('pointermove', handlePointerMove);
  canvasEl.addEventListener('pointerup', handlePointerUp);
  canvasEl.addEventListener('pointerleave', handlePointerUp);

  function handlePointerDown(e) {
    mouseIsDown = true;
    const x = (e.offsetX - panX) / zoom;
    const y = (e.offsetY - panY) / zoom;
    const layer = getCurrentLayer();

    saveState();

    if (['brush', 'pencil', 'eraser', 'marker', 'calligraphy'].includes(currentTool)) {
      drawing = true;
      let strokeColor = currentColor;
      let strokeWidth = brushSize;
      
      if (currentTool === 'eraser') {
        strokeColor = isDarkTheme ? '#2c2c2c' : '#ffffff';
      } else if (currentTool === 'pencil') {
        strokeWidth = Math.max(1, brushSize / 2);
      } else if (currentTool === 'marker') {
        strokeWidth = brushSize * 1.5;
        brushOpacity = Math.min(brushOpacity, 0.7);
      } else if (currentTool === 'calligraphy') {
        strokeWidth = brushSize * 0.8;
      }
      
      const s = [{ 
        x, y, 
        col: strokeColor, 
        sz: strokeWidth, 
        cap: brushCap, 
        join: brushJoin,
        opacity: brushOpacity,
        tool: currentTool
      }];
      
      layer.strokes.push(s);
      redraw();
      updateStatus('Drawing…');
    } else if (currentTool === 'spray') {
      drawing = true;
      sprayPaint(x, y);
      updateStatus('Spraying…');
    } else if (currentTool === 'smudge') {
      drawing = true;
      smudgePaint(x, y);
      updateStatus('Smudging…');
    } else if (currentTool === 'clone') {
      if (cloneSource) {
        drawing = true;
        clonePaint(x, y);
        updateStatus('Cloning…');
      } else {
        cloneSource = {x, y};
        showToast('Clone source set. Click to clone.', 'info');
      }
    } else if (currentTool === 'blur') {
      drawing = true;
      blurPaint(x, y);
      updateStatus('Blurring…');
    } else if (currentTool === 'sharpen') {
      drawing = true;
      sharpenPaint(x, y);
      updateStatus('Sharpening…');
    } else if (['rect', 'circle', 'line', 'triangle'].includes(currentTool)) {
      drawingShape = true;
      startShapeX = x;
      startShapeY = y;
      updateStatus('Drawing Shape…');
    } else if (currentTool === 'polygon') {
      if (polygonPoints.length === 0) {
        polygonPoints.push({x, y});
      } else {
        // Check if close to starting point to close the polygon
        const startPoint = polygonPoints[0];
        const dx = x - startPoint.x;
        const dy = y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20 && polygonPoints.length > 2) {
          // Close the polygon
          finishPolygon();
        } else {
          polygonPoints.push({x, y});
          redraw();
          
          // Draw the current polygon
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = brushSize;
          ctx.lineCap = brushCap;
          ctx.lineJoin = brushJoin;
          
          ctx.beginPath();
          ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
          for (let i = 1; i < polygonPoints.length; i++) {
            ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
          }
          ctx.stroke();
        }
      }
    } else if (currentTool === 'star') {
      drawingShape = true;
      startShapeX = x;
      startShapeY = y;
      updateStatus('Drawing Star…');
    } else if (currentTool === 'text') {
      const textContent = textToInsertInput.value.trim();
      if (textContent) {
        const fontFamily = fontFamilySelect.value;
        const fontStyle = fontStyleSelect.value;
        
        layer.texts.push({ 
          x, 
          y, 
          text: textContent, 
          color: currentColor, 
          size: brushSize * 2,
          font: fontFamily,
          style: fontStyle,
          align: textAlign,
          opacity: brushOpacity
        });
        
        redraw();
        updateStatus('Text added');
        showToast('Text added', 'success');
      } else {
        showToast('Please enter text first', 'warning');
      }
    } else if (currentTool === 'eyedropper') {
      const color = getColorAtPoint(e.offsetX, e.offsetY);
      colorInput.value = color;
      currentColor = color;
      colorPreview.style.backgroundColor = color;
      colorDisplay.textContent = color.toUpperCase();
      showToast(`Color picked: ${color.toUpperCase()}`, 'info');
    } else if (currentTool === 'fill') {
      if (layer.shapes.length > 0) {
        const lastShape = layer.shapes[layer.shapes.length - 1];
        lastShape.fill = currentFillColor;
        redraw();
        updateStatus('Shape filled');
        showToast('Shape filled', 'success');
      } else {
        showToast('No shape to fill', 'warning');
      }
    }
  }

  function handlePointerMove(e) {
    // Update coordinates display
    const x = Math.round((e.offsetX - panX) / zoom);
    const y = Math.round((e.offsetY - panY) / zoom);
    coordinatesDisplay.textContent = `X: ${x}, Y: ${y}`;

    if (!mouseIsDown) return;

    const layer = getCurrentLayer();
    const fillColor = fillEnabled ? currentFillColor : 'transparent';

    if (drawing) {
      if (currentTool === 'spray') {
        sprayPaint(x, y);
      } else {
        const s = layer.strokes[layer.strokes.length - 1];
        s.push({ x, y });
        redraw();
      }
    } else if (drawingShape) {
      redraw();
      
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = brushCap;
      ctx.lineJoin = brushJoin;
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = brushOpacity;

      ctx.beginPath();
      if (currentTool === 'rect') {
        ctx.rect(startShapeX, startShapeY, x - startShapeX, y - startShapeY);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2));
        ctx.arc(startShapeX, startShapeY, radius, 0, Math.PI * 2);
      } else if (currentTool === 'line') {
        ctx.moveTo(startShapeX, startShapeY);
        ctx.lineTo(x, y);
      } else if (currentTool === 'triangle') {
        const height = y - startShapeY;
        const halfWidth = (x - startShapeX) / 2;
        
        ctx.moveTo(startShapeX, y);
        ctx.lineTo(startShapeX + halfWidth * 2, y);
        ctx.lineTo(startShapeX + halfWidth, startShapeY);
        ctx.closePath();
      } else if (currentTool === 'star') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2));
        drawStar(ctx, startShapeX, startShapeY, starPoints, radius, radius / 2);
      } else if (currentTool === 'arrow') {
        drawArrow(ctx, startShapeX, startShapeY, x, y);
      } else if (currentTool === 'heart') {
        const width = Math.abs(x - startShapeX);
        const height = Math.abs(y - startShapeY);
        drawHeart(ctx, startShapeX, startShapeY, width, height);
      } else if (currentTool === 'hexagon') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2)) / 2;
        drawHexagon(ctx, startShapeX + (x - startShapeX) / 2, startShapeY + (y - startShapeY) / 2, radius);
      }
      
      if (fillEnabled) {
        ctx.fill();
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (!drawing && !drawingShape && e.buttons === 1) {
      // Panning the canvas
      panX += e.movementX;
      panY += e.movementY;
      redraw();
    }
  }

  function handlePointerUp(e) {
    if (!mouseIsDown) return;
    
    mouseIsDown = false;
    const x = (e.offsetX - panX) / zoom;
    const y = (e.offsetY - panY) / zoom;
    const layer = getCurrentLayer();
    const fillColor = fillEnabled ? currentFillColor : 'transparent';
    
    if (drawing) {
      drawing = false;
      updateStatus();
    }
    
    if (drawingShape) {
      drawingShape = false;
      
      if (currentTool === 'rect') {
        layer.shapes.push({ 
          type: 'rect', 
          x: startShapeX, 
          y: startShapeY, 
          width: x - startShapeX, 
          height: y - startShapeY, 
          color: currentColor, 
          size: brushSize, 
          cap: brushCap, 
          join: brushJoin, 
          fill: fillColor,
          opacity: brushOpacity
        });
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2));
        layer.shapes.push({ 
          type: 'circle', 
          x: startShapeX, 
          y: startShapeY, 
          radius: radius, 
          color: currentColor, 
          size: brushSize, 
          cap: brushCap, 
          join: brushJoin, 
          fill: fillColor,
          opacity: brushOpacity
        });
      } else if (currentTool === 'line') {
        layer.shapes.push({ 
          type: 'line', 
          x1: startShapeX, 
          y1: startShapeY, 
          x2: x, 
          y2: y, 
          color: currentColor, 
          size: brushSize, 
          cap: brushCap, 
          join: brushJoin,
          opacity: brushOpacity
        });
      } else if (currentTool === 'triangle') {
        const height = y - startShapeY;
        const halfWidth = (x - startShapeX) / 2;
        
        layer.shapes.push({ 
          type: 'triangle', 
          x1: startShapeX, 
          y1: y, 
          x2: startShapeX + halfWidth * 2, 
          y2: y, 
          x3: startShapeX + halfWidth, 
          y3: startShapeY, 
          color: currentColor, 
          size: brushSize, 
          cap: brushCap, 
          join: brushJoin, 
          fill: fillColor,
          opacity: brushOpacity
        });
      } else if (currentTool === 'star') {
        const radius = Math.sqrt(Math.pow(x - startShapeX, 2) + Math.pow(y - startShapeY, 2));
        layer.shapes.push({ 
          type: 'star', 
          x: startShapeX, 
          y: startShapeY, 
          points: starPoints, 
          outerRadius: radius, 
          innerRadius: radius / 2, 
          color: currentColor, 
          size: brushSize, 
          cap: brushCap, 
          join: brushJoin, 
          fill: fillColor,
          opacity: brushOpacity
        });
      }
      
      redraw();
      updateStatus('Shape added');
      showToast('Shape added', 'success');
    }
  }

  function sprayPaint(x, y) {
    const layer = getCurrentLayer();
    const density = brushSize * 2;
    const radius = brushSize * 3;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() * 2 - 1) * radius;
      const offsetY = (Math.random() * 2 - 1) * radius;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (distance <= radius) {
        const sprayX = x + offsetX;
        const sprayY = y + offsetY;
        
        const s = [{ 
          x: sprayX, 
          y: sprayY, 
          col: currentColor, 
          sz: 1, 
          cap: 'round', 
          join: 'round',
          opacity: brushOpacity * 0.8
        }];
        
        layer.strokes.push(s);
      }
    }
    
    redraw();
  }

  function finishPolygon() {
    if (polygonPoints.length < 3) {
      polygonPoints = [];
      return;
    }
    
    const layer = getCurrentLayer();
    const fillColor = fillEnabled ? currentFillColor : 'transparent';
    
    layer.shapes.push({ 
      type: 'polygon', 
      points: [...polygonPoints], 
      color: currentColor, 
      size: brushSize, 
      cap: brushCap, 
      join: brushJoin, 
      fill: fillColor,
      opacity: brushOpacity
    });
    
    polygonPoints = [];
    redraw();
    updateStatus('Polygon added');
    showToast('Polygon added', 'success');
  }

  // Zoom Controls
  zoomInBtn.addEventListener('click', () => {
    zoom *= 1.2;
    zoomLevelDisplay.textContent = `${Math.round(zoom * 100)}%`;
    redraw();
  });
  
  zoomOutBtn.addEventListener('click', () => {
    zoom /= 1.2;
    zoomLevelDisplay.textContent = `${Math.round(zoom * 100)}%`;
    redraw();
  });
  
  resetViewBtn.addEventListener('click', () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    zoomLevelDisplay.textContent = '100%';
    redraw();
  });

  // Layer Management
  document.getElementById('addLayerBtn').addEventListener('click', () => {
    const newLayerId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 0;
    const newLayer = {
      id: newLayerId,
      name: `Layer ${newLayerId}`,
      visible: true,
      strokes: [],
      images: [],
      texts: [],
      shapes: []
    };
    
    layers.push(newLayer);
    currentLayerId = newLayerId;
    
    updateLayersUI();
    updateStatus('New Layer Added');
    showToast('New layer added', 'success');
  });
  
  document.getElementById('deleteLayerBtn').addEventListener('click', () => {
    if (layers.length <= 1) {
      showToast('Cannot delete the only layer', 'error');
      return;
    }
    
    const layerIndex = layers.findIndex(l => l.id === currentLayerId);
    if (layerIndex !== -1) {
      layers.splice(layerIndex, 1);
      currentLayerId = layers[Math.max(0, layerIndex - 1)].id;
      
      updateLayersUI();
      redraw();
      updateStatus('Layer Deleted');
      showToast('Layer deleted', 'info');
    }
  });
  
  document.getElementById('moveLayerUpBtn').addEventListener('click', () => {
    const layerIndex = layers.findIndex(l => l.id === currentLayerId);
    if (layerIndex > 0) {
      [layers[layerIndex], layers[layerIndex - 1]] = [layers[layerIndex - 1], layers[layerIndex]];
      updateLayersUI();
      redraw();
      showToast('Layer moved up', 'info');
    }
  });
  
  document.getElementById('moveLayerDownBtn').addEventListener('click', () => {
    const layerIndex = layers.findIndex(l => l.id === currentLayerId);
    if (layerIndex < layers.length - 1) {
      [layers[layerIndex], layers[layerIndex + 1]] = [layers[layerIndex + 1], layers[layerIndex]];
      updateLayersUI();
      redraw();
      showToast('Layer moved down', 'info');
    }
  });

  function updateLayersUI() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    // Add layers in reverse order (top layer first in UI)
    [...layers].reverse().forEach(layer => {
      const layerEl = document.createElement('div');
      layerEl.className = `layer${layer.id === currentLayerId ? ' active-layer' : ''}`;
      layerEl.dataset.layerId = layer.id;
      
      const visibilityEl = document.createElement('span');
      visibilityEl.className = 'layer-visibility';
      visibilityEl.innerHTML = layer.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
      visibilityEl.onclick = (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        updateLayersUI();
        redraw();
      };
      
      const nameEl = document.createElement('span');
      nameEl.className = 'layer-name';
      nameEl.textContent = layer.name;
      
      layerEl.appendChild(visibilityEl);
      layerEl.appendChild(nameEl);
      
      layerEl.onclick = () => {
        currentLayerId = layer.id;
        updateLayersUI();
        updateStatus();
      };
      
      layersList.appendChild(layerEl);
    });
  }

  // Image Import
  imgInput.addEventListener('change', (e) => {
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
      
      const layer = getCurrentLayer();
      layer.images.push({ 
        img, 
        x, 
        y, 
        w, 
        h, 
        filter: filterSelect.value,
        opacity: brushOpacity
      });
      
      redraw();
      updateStatus('Image added');
      showToast('Image added', 'success');
      saveState();
    };
    
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  });

  // Filter Application
  applyFilterBtn.addEventListener('click', () => {
    const selectedFilter = filterSelect.value;
    if (selectedFilter) {
      applyFilterToCanvas(selectedFilter);
      showToast(`Applied ${selectedFilter} filter`, 'success');
    } else {
      showToast('Select a filter first', 'warning');
    }
  });

  // AI Assistant
  askBtn.addEventListener('click', () => {
    const question = qInput.value.trim();
    if (!question) {
      showToast('Please enter a question', 'warning');
      return;
    }
    
    const answer = document.getElementById('answer');
    answer.textContent = 'Processing...';
    answerContainer.classList.add('active');
    
    const imgData = canvasEl.toDataURL('image/png');
    
    puter.ai.chat(question, imgData)
      .then(reply => {
        answer.textContent = reply || 'No response from AI';
      })
      .catch(err => {
        console.error(err);
        answer.textContent = 'Error: ' + (err.message || 'Failed to get AI response');
        showToast('AI error occurred', 'error');
      });
  });

  closeAnswerBtn.addEventListener('click', () => {
    answerContainer.classList.remove('active');
  });

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    themeToggleBtn.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    redraw();
    showToast(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info');
  });
  
  // Hide/Show Navbar
  hideNavbarBtn.addEventListener('click', () => {
    isNavbarHidden = true;
    document.body.classList.add('navbar-hidden');
    header.classList.add('hidden');
    showToast('Navbar hidden. Click the eye icon to show it again.', 'info');
  });
  
  showNavbarBtn.addEventListener('click', () => {
    isNavbarHidden = false;
    document.body.classList.remove('navbar-hidden');
    header.classList.remove('hidden');
    showToast('Navbar shown', 'info');
  });

  // Undo/Redo
  undoBtn.addEventListener('click', () => {
    if (undoStack.length > 0) {
      const currentState = JSON.stringify(layers);
      redoStack.push(currentState);
      
      const previousState = undoStack.pop();
      layers = JSON.parse(previousState);
      
      redraw();
      updateLayersUI();
      updateStatus('Undo');
      showToast('Undo', 'info');
    } else {
      showToast('Nothing to undo', 'info');
    }
  });
  
  redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
      const currentState = JSON.stringify(layers);
      undoStack.push(currentState);
      
      const nextState = redoStack.pop();
      layers = JSON.parse(nextState);
      
      redraw();
      updateLayersUI();
      updateStatus('Redo');
      showToast('Redo', 'info');
    } else {
      showToast('Nothing to redo', 'info');
    }
  });

  // Clear Canvas
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      saveState();
      const layer = getCurrentLayer();
      layer.strokes = [];
      layer.images = [];
      layer.texts = [];
      layer.shapes = [];
      redraw();
      updateStatus();
      showToast('Canvas cleared', 'info');
    }
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'visiondraw-artwork.png';
    link.href = canvasEl.toDataURL('image/png');
    link.click();
    showToast('Image downloaded', 'success');
  });

  // Share
  shareBtn.addEventListener('click', () => {
    const imgData = canvasEl.toDataURL('image/png');
    
    const content = `
      <div class="share-options">
        <div class="share-preview">
          <img src="${imgData}" alt="Your artwork" style="max-width: 100%; max-height: 200px;">
        </div>
        <div class="share-links">
          <p>Copy this link to share your artwork:</p>
          <div class="copy-link">
            <input type="text" id="shareLink" value="${imgData.substring(0, 30)}..." readonly>
            <button id="copyLinkBtn" class="action-button">Copy</button>
          </div>
          <p>Or download and share manually:</p>
          <button id="shareDownloadBtn" class="action-button">Download</button>
        </div>
      </div>
    `;
    
    showModal('Share Your Artwork', content);
    
    // Add event listeners to the modal buttons
    document.getElementById('copyLinkBtn').addEventListener('click', () => {
      const shareLink = document.getElementById('shareLink');
      shareLink.value = imgData;
      shareLink.select();
      document.execCommand('copy');
      showToast('Link copied to clipboard', 'success');
    });
    
    document.getElementById('shareDownloadBtn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'visiondraw-shared-artwork.png';
      link.href = imgData;
      link.click();
      hideModal();
    });
  });

  closeModalBtn.addEventListener('click', hideModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      hideModal();
    }
  });

  // Canvas size change handler
  canvasSizeSelect.addEventListener('change', () => {
    currentCanvasSize = canvasSizeSelect.value;
    
    if (currentCanvasSize === 'custom') {
      const customWidth = prompt('Enter canvas width (pixels):', '1000');
      const customHeight = prompt('Enter canvas height (pixels):', '700');
      
      if (customWidth && customHeight) {
        canvasSizes.custom.width = parseInt(customWidth);
        canvasSizes.custom.height = parseInt(customHeight);
      }
    }
    
    resizeCanvas();
    showToast(`Canvas size changed to ${currentCanvasSize}`, 'info');
  });
  
  // Video functionality
  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoOverlay.src = url;
      videoOverlay.addEventListener('loadedmetadata', () => {
        isVideoLoaded = true;
        playPauseBtn.disabled = false;
        videoProgress.disabled = false;
        videoProgress.max = videoOverlay.duration;
        showToast('Video loaded successfully', 'success');
      });
    }
  });

  playPauseBtn.addEventListener('click', () => {
    if (videoOverlay.paused) {
      videoOverlay.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
      videoOverlay.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
  });

  videoProgress.addEventListener('input', () => {
    videoOverlay.currentTime = videoProgress.value;
  });

  videoOverlay.addEventListener('timeupdate', () => {
    videoProgress.value = videoOverlay.currentTime;
  });

  videoOpacity.addEventListener('input', () => {
    const opacity = videoOpacity.value;
    videoOverlay.style.opacity = opacity / 100;
    videoOpacityDisplay.textContent = `${opacity}%`;
  });

  enableVideoOverlay.addEventListener('change', () => {
    if (enableVideoOverlay.checked && isVideoLoaded) {
      videoOverlay.style.display = 'block';
      showToast('Video overlay enabled', 'info');
    } else {
      videoOverlay.style.display = 'none';
      showToast('Video overlay disabled', 'info');
    }
  });


  
  // Initialize with brush tool selected
  document.getElementById('brushTool').click();
  
  // Mobile UI Event Handlers
  menuToggleBtn.addEventListener('click', () => {
    isSidebarOpen = true;
    sidebar.classList.add('active');
  });
  
  closeSidebarBtn.addEventListener('click', () => {
    isSidebarOpen = false;
    sidebar.classList.remove('active');
  });
  
  // Handle clicks outside sidebar to close it
  document.addEventListener('click', (e) => {
    if (isSidebarOpen && !sidebar.contains(e.target) && e.target !== menuToggleBtn) {
      isSidebarOpen = false;
      sidebar.classList.remove('active');
    }
  });
  
  // Mobile menu buttons
  mobileMenuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSection = btn.getAttribute('data-target');
      console.log('Clicked mobile menu button:', targetSection);
      
      // Update active button
      mobileMenuBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding section
      toolSections.forEach(section => {
        if (section.id === targetSection) {
          section.classList.add('active-section');
          currentMobileSection = targetSection;
          console.log('Activating section:', section.id);
        } else {
          section.classList.remove('active-section');
        }
      });
      
      // Open sidebar if it's not already open
      if (!isSidebarOpen) {
        isSidebarOpen = true;
        sidebar.classList.add('active');
      }
      
      // Force redraw of the sidebar
      sidebar.style.display = 'none';
      setTimeout(() => {
        sidebar.style.display = 'flex';
      }, 10);
    });
  });
  
  // Mobile action buttons
  if (mobileActionBtns.undo) {
    mobileActionBtns.undo.addEventListener('click', () => {
      undoBtn.click();
    });
  }
  
  if (mobileActionBtns.redo) {
    mobileActionBtns.redo.addEventListener('click', () => {
      redoBtn.click();
    });
  }
  
  if (mobileActionBtns.ai) {
    mobileActionBtns.ai.addEventListener('click', () => {
      const question = prompt('Ask AI about your drawing:');
      if (question && question.trim()) {
        qInput.value = question;
        askBtn.click();
      }
    });
  }
  
  if (mobileActionBtns.download) {
    mobileActionBtns.download.addEventListener('click', () => {
      downloadBtn.click();
    });
  }
  
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 300);
  });
  
  // Initialize mobile UI
  function initMobileUI() {
    if (window.innerWidth <= 992) {
      // Set initial active section
      document.getElementById('mobileDrawingBtn').classList.add('active');
      
      // Hide all sections except the active one
      toolSections.forEach(section => {
        if (section.id === 'drawing-tools') {
          section.classList.add('active-section');
        } else {
          section.classList.remove('active-section');
        }
      });
      
      // Make sure sidebar is initially closed
      isSidebarOpen = false;
      sidebar.classList.remove('active');
    }
  }
  
  // Call the initialization function
  initMobileUI();
  
  // Re-initialize on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 992) {
      initMobileUI();
    } else {
      // On desktop, show all sections
      toolSections.forEach(section => {
        section.style.display = 'block';
      });
    }
  });
});
