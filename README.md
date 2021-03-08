## RGBSplit Effect for Images using SVG Filters
Demo: https://rgb-scroll.surge.sh


How to use:
```HTML
  <img src="myImage.png" class="rgb-split" title="Cool image" />
```

```JavaScript
  let splitter = new RGBSplitter();
      splitter.split('.rgb-split')
```

*Optional*: Set the element which will hold the svgFilters (defauly is <body>)

```JavaScript
  let svgParent = document.querySelector('#svgContainer');
  let splitter = new RGBSplitter(svgParent);
      splitter.split('.rgb-split')
```
