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
  
  // --- Mirror Tiles checkbox ---
  let mirrorContainer = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan('Mirror Tiles').style('margin-bottom', '5px').parent(mirrorContainer);
  mirrorTilesCheckbox = createCheckbox('', false).parent(mirrorContainer);
  inputContainer.child(mirrorContainer);

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
  // --- UI prep ---
  outputImgElement.hide();
  loadingContainer.show(); loadingText.show();
  loadingBar.style('width', '0%'); loadingText.html('0%');

  // --- Read settings ---
  const numStrips   = parseInt(numStripsInput.value());
  const depthMult   = parseFloat(depthMultInput.value());
  const imgScale    = parseFloat(imgScaleInput.value());
  const tileTexture = tileTextureCheckbox ? tileTextureCheckbox.checked() : false;
  
  const mirrorTiles = mirrorTilesCheckbox ? mirrorTilesCheckbox.checked() : false;

  // console.log('Mirror Tiles:', mirrorTiles);
  
  const crossview   = typeof crossviewCheckbox !== 'undefined'
                      ? crossviewCheckbox.checked() : false;

  // console.log('Number of Strips:', numStrips);
  // console.log('Depth Multiplier:', depthMult);
  // console.log('Image Scale:', imgScale);
  // console.log('Tile Texture:', tileTexture);
  // console.log('Crossview:', crossview);

  // --- Scale depth (OK to resize depth map copy-in-place if desired) ---
  depthImg.resize(depthImg.width * imgScale, depthImg.height * imgScale);

  const stripWidth  = Math.floor(depthImg.width / numStrips);
  const stripHeight = depthImg.height;

  // --- Create output buffer ---
  const cnv = createGraphics(depthImg.width + stripWidth, stripHeight);
  cnv.noSmooth();

 // --- Build the LEFTMOST strip texture source without mutating the user's texture ---
  let texSrc;

  // start from a copy so we never resize() the original upload
  let textureCopy = textureImg.get(); // p5.get() with no args returns a copy

  if (tileTexture) {
    const targetW = Math.ceil(stripWidth * 1.1);
    const targetH = Math.round(textureCopy.height * targetW / textureCopy.width);
    textureCopy.resize(targetW, targetH);

    const newTexture = createGraphics(textureCopy.width, stripHeight);
    newTexture.noSmooth();

    const copies = Math.ceil(stripHeight / textureCopy.height);
    for (let i = 0; i < copies; i++) {
      if (mirrorTiles && (i % 2 === 1)) {
        // draw mirrored tile
        newTexture.push();
        newTexture.translate(0, (i + 1) * textureCopy.height); // move down one tile height
        newTexture.scale(1, -1); // flip vertically
        newTexture.image(textureCopy, 0, 0);
        newTexture.pop();
      } else {
        // normal tile
        newTexture.image(textureCopy, 0, i * textureCopy.height);
      }
    }

    texSrc = newTexture;
  } else {
    // Match your “else” path:
    // (a) ensure min width of 1.1 * stripWidth
    const minW = Math.ceil(stripWidth * 1.1);
    if (stripWidth > textureCopy.width * 1.1) {
      const newH = Math.round(textureCopy.height * minW / textureCopy.width);
      textureCopy.resize(minW, newH);
    }

    // (b) if needed, scale up to match stripHeight (keep aspect)
    if (stripHeight > textureCopy.height) {
      const newW = Math.round(textureCopy.width * stripHeight / textureCopy.height);
      textureCopy.resize(newW, stripHeight);
    }

    texSrc = textureCopy;
  }

  // --- Paint the leftmost strip from texSrc (as in your pipeline) ---
  cnv.image(texSrc, 0, 0, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight);

  // --- Prep typed arrays ---
  depthImg.loadPixels();
  const dpx  = depthImg.pixels;             // Uint8ClampedArray
  const dW   = depthImg.width;
  const dH   = depthImg.height;
  const outW = cnv.width;

  // Disparity LUT
  const shiftLUT = new Int16Array(256);
  for (let v = 0; v < 256; v++) shiftLUT[v] = Math.floor(15 * v * depthMult / 255);

  const ctx = cnv.drawingContext; // CanvasRenderingContext2D

  // --- MAIN: build each row in memory, then write once ---
  const progressEvery = Math.max(1, Math.floor(dH / 80)); // ~80 ticks

  for (let y = 0; y < dH; y++) {
    // Take the current row (contains the leftmost strip we just drew)
    const rowImageData = ctx.getImageData(0, y, outW, 1);
    const row = rowImageData.data; // Uint8ClampedArray length = outW * 4

    // Grow the row strip-by-strip to the right, sampling already-written pixels
    for (let o = 0; o < numStrips; o++) {
      const stripX = o * stripWidth;

      for (let x = 0; x < stripWidth; x++) {
        const depthIdx = 4 * ((y * dW) + (x + stripX));
        const depthVal = dpx[depthIdx];             // grayscale from R channel
        const shift    = shiftLUT[depthVal];

        // Parallel vs Crossview: flip disparity direction when crossview is true
        let srcX = x + stripX + (crossview ? -shift : shift);

        if (srcX < 0) srcX = 0;
        if (srcX >= outW) srcX = outW - 1;

        const dstX = x + stripWidth + stripX;

        const si = (srcX << 2);
        const di = (dstX << 2);
        row[di    ] = row[si    ];
        row[di + 1] = row[si + 1];
        row[di + 2] = row[si + 2];
        row[di + 3] = 255;
      }
    }

    ctx.putImageData(rowImageData, 0, y);

    if ((y % progressEvery) === 0) {
      const percent = Math.floor((y / dH) * 100);
      loadingBar.style('width', percent + '%');
      loadingText.html(percent + '%');
      await sleep(0); // yield so UI can paint
    }
  }

  // --- Finalize to blob URL so "Open image in new tab" works ---
  // (optional) revoke previous blob URL to free memory
  const oldURL = outputImgElement.attribute('src');
  if (oldURL && oldURL.startsWith('blob:')) URL.revokeObjectURL(oldURL);

  cnv.elt.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    outputImgElement.attribute('src', url);
    loadingContainer.hide();
    loadingText.hide();
    outputImgElement.show();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
