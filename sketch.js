// Stereogram Generator UI with clickable uploads, loading bar, and "Tile Texture" checkbox
let depthImg = null;
let textureImg = null;

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
  let tileContainer = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan('Tile Texture').style('margin-bottom', '5px').parent(tileContainer);
  tileTextureCheckbox = createCheckbox('', false).parent(tileContainer);
  inputContainer.child(tileContainer);

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
  // Hide previous output, show loading UI
  outputImgElement.hide();
  loadingContainer.show();
  loadingText.show();
  loadingBar.style('width', '0%');
  loadingText.html('0%');

  // Read all settings
  let numStrips = parseInt(numStripsInput.value());
  let depthMult = parseFloat(depthMultInput.value());
  let imgScale = parseFloat(imgScaleInput.value());
  let tileTexture = tileTextureCheckbox.checked();

  console.log('Number of Strips:', numStrips);
  console.log('Depth Multiplier:', depthMult);
  console.log('Image Scale:', imgScale);
  console.log('Tile Texture:', tileTexture);

  // Simulate a heavy computation with progress feedback
  // let totalIterations = 100000;
  // for (let i = 0; i <= totalIterations; i++) {
  //   if (i % 100 === 0) {
  //     let percent = int((i / totalIterations) * 100);
  //     loadingBar.style('width', percent + '%');
  //     loadingText.html(percent + '%');
  //     await sleep(10); // yield briefly to update UI
  //   }
  // }
  
  
  let strips = numStrips;
  
  depthImg.resize(depthImg.width * imgScale, depthImg.height * imgScale)

  // Width of each strip
  let stripWidth = floor(depthImg.width / strips);
  
  // Height of each strip
  let stripHeight = depthImg.height;
  
  // Create a copy of the original texture image
  textureCopy = textureImg.get(); 

  
  if(tileTexture) {
    textureCopy.resize(stripWidth * 1.1, textureCopy.height * stripWidth * 1.1 / textureCopy.width)
    let newTexture = createGraphics(textureCopy.width, depthImg.height)
    let copies = ceil(depthImg.height / textureCopy.height)
    for(let i = 0; i < copies; i++){
      newTexture.image(textureCopy, 0, i * textureCopy.height)
    }
    textureCopy = newTexture;
  } else {
    console.log("No tile")
    if(stripWidth > textureCopy.width * 1.1){
      textureCopy.resize(stripWidth * 1.1, textureCopy.height * stripWidth * 1.1 / textureCopy.width)
    }

    if(stripHeight > textureCopy.height){
      textureCopy.resize(textureCopy.width * stripHeight / textureCopy.height, stripHeight)
    }
  }
  
  
  
  // cnv = createCanvas(depthImg.width + stripWidth, depthImg.height) ;
  let cnv = createGraphics(depthImg.width + stripWidth, depthImg.height) ;
  
  
  
  // Left most strip drawn as is (no horizontal offsets)
  cnv.image(textureCopy, 0, 0, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight)
  cnv.noStroke();

  // Generate the stereogram
    for(let o = 0; o < strips; o++){
      cnv.translate(stripWidth, 0) 
      // image(pattern, 0, 0, 100, 400, 0, 0, 100, 400)
      for(let j = 0; j < depthImg.height; j++){
        // let offset = o;
        let percent = int(( (j + o * depthImg.height) / (depthImg.height*strips)) * 100);
        loadingBar.style('width', percent + '%');
        loadingText.html(percent + '%');
        await sleep(10); // yield briefly to update UI
        for(let i = 0; i < stripWidth; i++){
          let d = depthImg.get(i + stripWidth * o, j);
          let c;
          if(d[0] >= 0) {
            c = cnv.get(i + stripWidth*o + 15 * d[0] * depthMult /255, j);
          } else {
            c = cnv.get(i, j);
          }
          cnv.fill(c);
          cnv.rect(i, j, 1, 1);
        }
      }
    }

  // Once done, render final result
  outputGraphics = cnv;
  // outputGraphics.background(230);
  // if (depthImg) outputGraphics.image(depthImg, 0, 0, outputGraphics.width / 2, outputGraphics.height);
  // if (textureImg) outputGraphics.image(textureImg, outputGraphics.width / 2, 0, outputGraphics.width / 2, outputGraphics.height);

  let imgData = outputGraphics.elt.toDataURL('image/png');
  outputImgElement.attribute('src', imgData);

  // Hide loading UI, show final image
  loadingContainer.hide();
  loadingText.hide();
  outputImgElement.show();

  console.log('Stereogram generation complete.');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
