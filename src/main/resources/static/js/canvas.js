const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let color = '#3B3B3B';
let size = '3';
let undoStack = [];
let redoStack = [];
let timeout;

function startPosition(event) {
  isDrawing = true;
  draw(event);
}

function finishedPosition() {
  isDrawing = false;
  ctx.beginPath();
}

function draw(event) {
  if (!isDrawing) {
    return;
  }
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;

  ctx.lineTo(event.clientX, event.clientY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(event.clientX, event.clientY);

  clearTimeout(timeout);
  timeout = setTimeout(function () {
    const base64ImageData = canvas.toDataURL('image/png');
    localStorage.setItem('canvasimg', base64ImageData);
  }, 400);
}

function handleFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  // Clear the canvas before drawing new images
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // Define maximum dimensions for the image
        const maxWidth = 800; // Adjust as needed
        const maxHeight = 600; // Adjust as needed

        // Calculate scaling factor to fit the image within the maximum dimensions
        let scaleFactor = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          const widthScale = maxWidth / img.width;
          const heightScale = maxHeight / img.height;
          scaleFactor = Math.min(widthScale, heightScale);
        }

        // Calculate new dimensions
        const newWidth = img.width * scaleFactor;
        const newHeight = img.height * scaleFactor;

        // Draw the image on the canvas centered and scaled
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;
        ctx.drawImage(img, x, y, newWidth, newHeight);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(files[i]);
  }
}


function handleSizeChange(event) {
  size = event.target.value;
}

function handleColorChange(newColor) {
  color = newColor;
}

function undoAction() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    redoStack.push(canvas.toDataURL('image/png'));
    const image = new Image();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = lastAction;
  }
}

function redoAction() {
  if (redoStack.length > 0) {
    const lastAction = redoStack.pop();
    undoStack.push(canvas.toDataURL('image/png'));
    const image = new Image();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = lastAction;
  }
}

function clearCanvas() {
  localStorage.removeItem('canvasimg');
  undoStack.push(canvas.toDataURL('image/png'));
  redoStack = [];
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getPen() {
  cursor = 'default';
  size = '3';
  color = '#3B3B3B';

  // Ensure drawing context settings are updated
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
}

function eraseCanvas() {
  cursor = 'grab';
  size = '20';
  color = '#FFFFFF';

  if (!isDrawing) {
    return;
  }
}

function saveCanvas() {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas_image.jpg'; // Change the extension to JPG
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      localStorage.setItem('canvasimg', url);
    }
  }, 'image/jpeg'); // Change MIME type to image/jpeg for JPG
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const canvasimg = localStorage.getItem('canvasimg');
if (canvasimg) {
  const image = new Image();
  image.onload = function () {
    ctx.drawImage(image, 0, 0);
    isDrawing = false;
  };
  image.src = canvasimg;
}
