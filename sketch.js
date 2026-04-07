// Github: https://github.com/camelCaseSensitive/Stereogram-Generator-Online

// Stereogram Generator UI with clickable uploads, loading bar, and "Tile Texture" checkbox
let depthImg = null;
let textureImg = null;

function preload() {
  depthImg = loadImage("Teapot.jpg");
  textureImg = loadImage("Bushes.jpg");
}

let numStripsInput, depthMultInput, imgScaleInput, tileTextureCheckbox;
let mirrorTilesCheckbox, crossviewCheckbox;
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

  // global drag listener
  window.addEventListener('dragover', (event) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

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
  createElement('h3', 'Output Image')
    .style('text-align', 'center')
    .style('margin-top', '10px');

  outputImgElement = createImg('', 'Generated Stereogram');
  outputImgElement.style('display', 'block')
    .style('margin', '20px auto')
    .style('border', '1px solid #ccc')
    .style('background', '#fafafa')
    .style('padding', '10px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
    .style('max-width', '90vw')
    .style('height', 'auto')
    .style('max-height', '80vh')
    .style('object-fit', 'contain')
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
  loadingContainer.show();
  loadingText.show();
  loadingBar.style('width', '0%');
  loadingText.html('0%');

  // --- Read settings ---
  const numStrips   = parseInt(numStripsInput.value());
  const depthMult   = parseFloat(depthMultInput.value());
  const imgScale    = parseFloat(imgScaleInput.value());
  const tileTexture = tileTextureCheckbox ? tileTextureCheckbox.checked() : false;
  const mirrorTiles = mirrorTilesCheckbox ? mirrorTilesCheckbox.checked() : false;
  const crossview   = typeof crossviewCheckbox !== 'undefined'
                    ? crossviewCheckbox.checked()
                    : false;

  // --- Safe copy and scale for depth map ---
  let depthCopy = depthImg.get();
  depthCopy.resize(depthCopy.width * imgScale, depthCopy.height * imgScale);

  const outW = depthCopy.width;
  const outH = depthCopy.height;
  const repeatSize = Math.max(1, Math.floor(outW / numStrips));

  // Preserve your old slider feel:
  // old code used max shift ≈ 15 * depthMult px
  // so keep that in pixels rather than making it proportional to strip width
  const maxSep = Math.min(repeatSize - 1, Math.max(0, Math.round(15 * depthMult)));

  // --- Create output buffer ---
  const cnv = createGraphics(outW, outH);
  cnv.pixelDensity(1);
  cnv.noSmooth();

  // --- Build the texture source exactly like your original pipeline ---
  let texSrc;
  let textureCopy = textureImg.get();

  if (tileTexture) {
    const targetW = Math.ceil(repeatSize * 1.1);
    const targetH = Math.round(textureCopy.height * targetW / textureCopy.width);
    textureCopy.resize(targetW, targetH);

    const newTexture = createGraphics(textureCopy.width, outH);
    newTexture.pixelDensity(1);
    newTexture.noSmooth();

    const copies = Math.ceil(outH / textureCopy.height);
    for (let i = 0; i < copies; i++) {
      if (mirrorTiles && (i % 2 === 1)) {
        newTexture.push();
        newTexture.translate(0, (i + 1) * textureCopy.height);
        newTexture.scale(1, -1);
        newTexture.image(textureCopy, 0, 0);
        newTexture.pop();
      } else {
        newTexture.image(textureCopy, 0, i * textureCopy.height);
      }
    }

    texSrc = newTexture;
  } else {
    const minW = Math.ceil(repeatSize * 1.1);
    if (textureCopy.width < minW) {
      const newH = Math.round(textureCopy.height * minW / textureCopy.width);
      textureCopy.resize(minW, newH);
    }

    if (textureCopy.height < outH) {
      const newW = Math.round(textureCopy.width * outH / textureCopy.height);
      textureCopy.resize(newW, outH);
    }

    texSrc = textureCopy;
  }

  // --- Load pixels once ---
  depthCopy.loadPixels();
  texSrc.loadPixels();
  cnv.loadPixels();

  const dpx = depthCopy.pixels;
  const tpx = texSrc.pixels;
  const cpx = cnv.pixels;

  const texW = texSrc.width;
  const texH = texSrc.height;

  const progressEvery = Math.max(1, Math.floor(outH / 80));

  // helper
  const clampIndex = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);
  const mod = (a, b) => ((a % b) + b) % b;

  for (let y = 0; y < outH; y++) {
    // --- Read normalized depth row ---
    const depthRow = new Float32Array(outW);
    for (let x = 0; x < outW; x++) {
      const di = 4 * (x + y * outW);
      depthRow[x] = dpx[di] / 255; // assume grayscale depth map
    }

    // --- Bidirectional propagation of texture coordinates ---
    const L = new Float32Array(outW);
    const R = new Float32Array(outW);

    for (let i = 0; i < outW; i++) {
      let gap = repeatSize;
      for (let j = 0; j < 4; j++) {
        const probe = clampIndex(i - ((gap / 2) | 0), 0, outW - 1);
        gap = repeatSize - Math.round(maxSep * depthRow[probe]);
        if (gap < 1) gap = 1;
      }
      L[i] = (i < gap) ? i : (L[i - gap] + repeatSize);
    }

    for (let i = outW - 1; i >= 0; i--) {
      let gap = repeatSize;
      for (let j = 0; j < 4; j++) {
        const probe = clampIndex(i + ((gap / 2) | 0), 0, outW - 1);
        gap = repeatSize - Math.round(maxSep * depthRow[probe]);
        if (gap < 1) gap = 1;
      }
      R[i] = (i + gap >= outW) ? i : (R[i + gap] - repeatSize);
    }

    // --- Average the two texture coordinates ---
    for (let x = 0; x < outW; x++) {
      let avg = 0.5 * (L[x] + R[x]);

      // crossview: mirror disparity direction
      if (crossview) avg = -avg;

      const texX = mod(Math.round(avg), repeatSize);
      const sampleX = mod(texX, texW);
      const sampleY = mod(y, texH);

      const si = 4 * (sampleX + sampleY * texW);
      const di = 4 * (x + y * outW);

      cpx[di    ] = tpx[si    ];
      cpx[di + 1] = tpx[si + 1];
      cpx[di + 2] = tpx[si + 2];
      cpx[di + 3] = 255;
    }

    if ((y % progressEvery) === 0) {
      cnv.updatePixels();
      const percent = Math.floor((y / outH) * 100);
      loadingBar.style('width', percent + '%');
      loadingText.html(percent + '%');
      await sleep(0);
    }
  }

  cnv.updatePixels();

  // --- Finalize to blob URL ---
  const oldURL = outputImgElement.attribute('src');
  if (oldURL && oldURL.startsWith('blob:')) URL.revokeObjectURL(oldURL);

  cnv.elt.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    outputImgElement.attribute('width', cnv.width);
    outputImgElement.attribute('height', cnv.height);
    outputImgElement.attribute('src', url);

    outputImgElement.elt.onload = () => {
      outputImgElement.style('width', 'auto');
      outputImgElement.style('height', 'auto');
    };

    loadingBar.style('width', '100%');
    loadingText.html('100%');
    loadingContainer.hide();
    loadingText.hide();
    outputImgElement.show();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
