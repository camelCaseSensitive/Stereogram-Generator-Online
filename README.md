# Stereogram-Generator-Online
Generate stereograms online - Drag and drop depthmap and texture to make magic eye images online.  Allows you to make autostereograms in your browser for free.  Made by lavaboosted with p5js.

### [Try It Out](https://camelcasesensitive.github.io/Stereogram-Generator-Online/)

[![Stereogram Generator Software](./Example.jpg "Stereogram generator")](https://camelcasesensitive.github.io/Stereogram-Generator-Online/)

# Tips
Drag and drop an image or click the dropbox to upload a depthmap from your computer. If you don't upload images it will use the defailt Teapot and Bushes seen above. 

By default the texture image will be be scaled to match the height of the depthmap image. 

If you select "Tile Texture" it will instead scale the texture image to be the width of one strip and tile it vertically. 

Larger depthmap images will take longer to render but have smoother 3D surfaces.

For best results, scale the texture to your image ahead of time and use a texture that has a lot of visual noise. 

The more detailed your depthmap is the more noise your texture will need in order for the details to be discernable. 

You can find depthmaps online and I've posted many of the ones I've made to the depthmaps subreddit [r/depthmaps](https://www.reddit.com/r/depthMaps/)

Here is a good ["Image to depthmap" converter online](https://huggingface.co/spaces/xingyang1/Distill-Any-Depth)

And here is [the Blender file](https://sketchfab.com/3d-models/depth-map-generator-c945ab12857843edb66d2755de4986ec) that I use to make depthmaps of 3D models
