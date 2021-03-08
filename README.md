## RGBSplit Effect for Images using SVG Filters

How to use:
``
  <img src="myImage.png" class="rgb-split" title="Cool image" />
``

``
  let splitter = new RGBSplitter();
      splitter.split('.rgb-split')
``

*Optional*: Set the element which will hold the svgFilters (defauly is <body/>)

``
  let svgParent = document.querySelector('#svgContainer');
  let splitter = new RGBSplitter(svgParent);
      splitter.split('.rgb-split')
``
