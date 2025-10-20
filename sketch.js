// Github: https://github.com/camelCaseSensitive/Stereogram-Generator-Online

// Stereogram Generator UI with clickable uploads, loading bar, and "Tile Texture" checkbox
let depthImg = null;
let textureImg = null;

function preload() {
  depthImg = loadImage("Teapot.jpg")
  textureImg = loadImage("Bushes.jpg")
}

let numStripsInput, depthMultInput, imgScaleInput, tileTextureCheckbox;
let generateButton;
let outputGraphics;
let outputImgElement;
let depthZone, textureZone;
let loadingContainer, loadingBar, loadingText;

function setup() {
  noCanvas();

  // --- Title ---
  createElement('h1', 'Stereogram Generator').style('text-align', 'center');

  // --- Drag and drop zones container ---
  let dropZoneContainer = createDiv().style('display', 'flex')
    .style('justify-content', 'center')
    .style('gap', '20px')
    .style('margin-bottom', '20px');

  depthZone = createDropZone('Drop Depth Map Here', gotDepthFile);
  dropZoneContainer.child(depthZone.container);

  textureZone = createDropZone('Drop Texture Image Here', gotTextureFile);
  dropZoneContainer.child(textureZone.container);

  // --- Input controls ---
  let inputContainer = createDiv().style('display', 'flex')
    .style('justify-content', 'center')
    .style('gap', '20px')
    .style('margin-bottom', '20px')
    .style('flex-wrap', 'wrap');

  numStripsInput = createLabeledInput('Number of Strips', 6, inputContainer);
  depthMultInput = createLabeledInput('Depth Multiplier', 1.0, inputContainer);
  imgScaleInput = createLabeledInput('Image Scale', 1.0, inputContainer);

  // --- Tile Texture checkbox ---
  // let tileContainer = createDiv().style('display', 'flex')
  //   .style('flex-direction', 'column')
  //   .style('align-items', 'center');
  // createSpan('Tile Texture').style('margin-bottom', '5px').parent(tileContainer);
  // tileTextureCheckbox = createCheckbox('', false).parent(tileContainer);
  // inputContainer.child(tileContainer);
  
  // --- Tile Texture checkbox ---
  let tileContainer = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan('Tile Texture').style('margin-bottom', '5px').parent(tileContainer);
  tileTextureCheckbox = createCheckbox('', false).parent(tileContainer);
  inputContainer.child(tileContainer);

  // --- Crossview checkbox ---
  let crossContainer = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan('Crossview').style('margin-bottom', '5px').parent(crossContainer);
  crossviewCheckbox = createCheckbox('', false).parent(crossContainer);
  inputContainer.child(crossContainer);

  // --- Generate button ---
  generateButton = createButton('Generate Stereogram');
  generateButton.style('display', 'block')
    .style('margin', '0 auto 20px auto')
    .style('padding', '10px 20px')
    .style('font-size', '16px')
    .style('cursor', 'pointer');
  generateButton.mousePressed(generateStereogram);

  // --- Output display area ---
  createElement('h3', 'Output Image').style('text-align', 'center').style('margin-top', '10px');
  outputImgElement = createImg('', 'Generated Stereogram');
  outputImgElement.style('display', 'block')
    .style('margin', '0 auto')
    .style('max-width', '90%')
    .style('border', '1px solid #ccc')
    .style('background', '#fafafa')
    .style('padding', '10px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
    .hide();

  // --- Loading bar ---
  loadingContainer = createDiv().style('width', '80%')
    .style('height', '25px')
    .style('background', '#ddd')
    .style('border-radius', '12px')
    .style('margin', '0 auto 20px auto')
    .style('overflow', 'hidden')
    .hide();

  loadingBar = createDiv().style('width', '0%')
    .style('height', '100%')
    .style('background', '#33aaff')
    .style('transition', 'width 0.1s')
    .parent(loadingContainer);

  loadingText = createP('0%').style('text-align', 'center')
    .style('margin-top', '5px')
    .hide();
  
  // --- Footer ---
  createElement('footer', '© Copyright lavaboosted')
    .style('text-align', 'center')
    .style('margin-top', '40px')
    .style('padding', '10px')
    .style('font-size', '14px')
    .style('color', '#666');
}

function createLabeledInput(label, defaultValue, parentDiv) {
  let container = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan(label).style('margin-bottom', '5px').parent(container);
  let input = createInput(defaultValue, 'number')
    .style('width', '100px')
    .parent(container);
  parentDiv.child(container);
  return input;
}

function createDropZone(labelText, callback) {
  let container = createDiv()
    .style('border', '2px dashed #999')
    .style('padding', '40px')
    .style('text-align', 'center')
    .style('width', '200px')
    .style('height', '150px')
    .style('line-height', '150px')
    .style('cursor', 'pointer')
    .style('background-color', '#fafafa')
    .style('position', 'relative')
    .style('overflow', 'hidden');

  let label = createSpan(labelText).parent(container);

  let fileInput = createFileInput((file) => {
    if (file && file.type === 'image') callback(file);
  });
  fileInput.parent(container);
  fileInput.elt.style.display = 'none';

  container.mousePressed(() => fileInput.elt.click());

  container.dragOver(() => {
    container.style('border-color', '#33aaff').style('background-color', '#e6f4ff');
  });
  container.dragLeave(() => {
    container.style('border-color', '#999').style('background-color', '#fafafa');
  });

  container.drop((file) => {
    container.style('border-color', '#999').style('background-color', '#fafafa');
    if (file && file.type === 'image') callback(file);
  });

  return { container, fileInput, label };
}

function gotDepthFile(file) {
  if (file.type === 'image') {
    depthImg = loadImage(file.data, () => {
      displayImageInZone(depthZone, depthImg);
      console.log('Depth image loaded.');
    });
  }
}

function gotTextureFile(file) {
  if (file.type === 'image') {
    textureImg = loadImage(file.data, () => {
      displayImageInZone(textureZone, textureImg);
      console.log('Texture image loaded.');
    });
  }
}

function displayImageInZone(zone, img) {
  zone.container.html('');
  createImg(img.canvas.toDataURL(), '')
    .style('width', '100%')
    .style('height', '100%')
    .style('object-fit', 'cover')
    .parent(zone.container);
}

async function generateStereogram() {
  // --- UI prep (yours) ---
  outputImgElement.hide();
  loadingContainer.show(); loadingText.show();
  loadingBar.style('width', '0%'); loadingText.html('0%');

  // --- Read settings (yours) ---
  const numStrips = parseInt(numStripsInput.value());
  const depthMult = parseFloat(depthMultInput.value());
  const imgScale   = parseFloat(imgScaleInput.value());
  const tileTexture = tileTextureCheckbox ? tileTextureCheckbox.checked() : false;
  const crossview = crossviewCheckbox ? crossviewCheckbox.checked() : false;
console.log('Tile Texture:', tileTexture);

  console.log('Number of Strips:', numStrips);
  console.log('Depth Multiplier:', depthMult);
  console.log('Image Scale:', imgScale);
  console.log('Tile Texture:', tileTexture);
  console.log('Crossview:', crossview);
  

  // --- Scale depth/texture (same as your code) ---
  depthImg.resize(depthImg.width * imgScale, depthImg.height * imgScale);
  const stripWidth  = Math.floor(depthImg.width / numStrips);
  const stripHeight = depthImg.height;

  if (stripHeight > textureImg.height) {
    textureImg.resize(textureImg.width * stripHeight / textureImg.height, stripHeight);
  }

  // --- Create output buffer and draw the LEFTMOST strip from the texture (your first step) ---
  const cnv = createGraphics(depthImg.width + stripWidth, stripHeight);
  cnv.noSmooth();

  // Leftmost strip (as-is):
  // If you want tiling, you can draw a repeated texture pattern across 'stripWidth' here.
  if (!tileTexture) {
    cnv.image(textureImg, 0, 0, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight);
  } else {
    // simple horizontal tiling to fill the first strip region
    let tx = 0;
    while (tx < stripWidth) {
      const w = Math.min(textureImg.width, stripWidth - tx);
      cnv.image(textureImg, tx, 0, w, stripHeight, 0, 0, w, stripHeight);
      tx += w;
    }
  }

  // --- Prep typed arrays ---
  depthImg.loadPixels();
  const dpx = depthImg.pixels;              // Uint8ClampedArray
  const dW  = depthImg.width;
  const dH  = depthImg.height;
  const outW = cnv.width;

  // Disparity LUT
  const shiftLUT = new Int16Array(256);
  for (let v = 0; v < 256; v++) shiftLUT[v] = Math.floor(15 * v * depthMult / 255);

  const ctx = cnv.drawingContext; // CanvasRenderingContext2D

  // --- MAIN: build each row in memory, then write once ---
  const totalUnits = dH * numStrips;
  const progressEvery = Math.max(1, Math.floor(dH / 80)); // ~80 ticks total

  for (let y = 0; y < dH; y++) {
    // Grab the ENTIRE existing row once (contains the leftmost strip we drew)
    // This returns a fresh ImageData; we'll mutate its .data and then put it back.
    const rowImageData = ctx.getImageData(0, y, outW, 1);
    const row = rowImageData.data; // Uint8ClampedArray length = outW * 4

    // For each strip o (0..numStrips-1), extend the row to the right by one strip
    // by sampling previously "drawn" pixels in this same 'row' array (in-memory).
    for (let o = 0; o < numStrips; o++) {
      const stripX = o * stripWidth;

      for (let x = 0; x < stripWidth; x++) {
        // const depthIdx = 4 * ((y * dW) - (x + stripX));
        const depthIdx = 4 * ((y * dW) + (x + stripX));
        
        const depthVal = dpx[depthIdx];             // grayscale from R channel
        const shift    = shiftLUT[depthVal];

        // let srcX = x + stripX + shift;
        
        // let crossview = true;
        let srcX = x + stripX + (crossview ? -shift : shift);
        
        if (srcX < 0) srcX = 0;
        if (srcX >= outW) srcX = outW - 1;

        const dstX = x + stripWidth + stripX;       // write into next strip area

        // copy 4 bytes RGBA from srcX -> dstX inside the same row buffer
        const si = (srcX << 2);
        const di = (dstX << 2);
        row[di    ] = row[si    ];
        row[di + 1] = row[si + 1];
        row[di + 2] = row[si + 2];
        row[di + 3] = 255;
      }
    }

    // Write the completed row back in one go
    ctx.putImageData(rowImageData, 0, y);

    // Progress updates (throttled)
    if ((y % progressEvery) === 0) {
      const percent = Math.floor(((y) / dH) * 100);
      loadingBar.style('width', percent + '%');
      loadingText.html(percent + '%');
      // yield so UI can paint
      await sleep(0);
    }
  }

  // --- Finalize like you already do ---
  outputGraphics = cnv;
  
  cnv.elt.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    outputImgElement.attribute('src', url);
  });

  loadingContainer.hide();
  loadingText.hide();
  outputImgElement.show();
}

// tiny helper
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

