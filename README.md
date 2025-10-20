# Stereogram-Generator-Online
Generate stereograms online - Drag and drop depthmap and texture to make magic eye images online.  Allows you to make autostereograms in your browser for free.  Made by lavaboosted with p5js.

### [Try It Out](https://camelcasesensitive.github.io/Stereogram-Generator-Online/)

![Stereogram Generator Software](./Example.jpg "Stereogram generator")

## Depth map and Texture images
![Teapot Depthmap](./Teapot.jpg "Teapot depthmap")

Drag and drop an image or click the dropbox to upload a depthmap from your computer. 

![Bushes texture](./Bushes.jpg "Bushes texture")

By default the texture image will be be scaled to match the height of the depthmap image. 

If you select "Tile Texture" it will instead scale the texture image to be the width of one strip and tile it vertically. 

Larger depthmap images will take longer to render. 

For best results, scale the texture to your image ahead of time and use a texture that has a lot of visual noise. The more detailed your depthmap is the more noise your texture will need in order for the details to be discernable. 
