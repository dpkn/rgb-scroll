
let svgFilter = `<svg style="opacity:0;width:0;height:0;">
      <filter id="red">
        <feColorMatrix
          type="matrix"
          values="1   0   0   0   0
            0   0   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "
        />
      </filter>
      <filter id="blue">
        <feColorMatrix
          type="matrix"
          values="0   0   0   0   0
            0   0   0   0   0
            0   0   1   0   0
            0   0   0   1   0 "
        />
      </filter>
      <filter id="green">
        <feColorMatrix
          type="matrix"
          values="0   0   0   0   0
            0   1   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "
        />
      </filter>
    </svg>`;

class RGBSplitter {
    
  constructor(filterContainer = document.body){

    let template = document.createRange().createContextualFragment(svgFilter);
    filterContainer.appendChild(template);

    this.lastStepTime = 0;
    this.scrollPosition = 0;
    this.splittedImages = [];
    this.targetXOffset = 0;
    this.maxXOffset = 15;

    window.addEventListener('scroll',()=>{ this.onScroll() });

    this.step();
  }

  onScroll(){
    this.targetXOffset = window.scrollY - this.scrollPosition; // Target offset is the amount scrolled
    if (this.targetXOffset > this.maxXOffset) {
      this.targetXOffset = this.maxXOffset;
    } else if (this.targetXOffset < -this.maxXOffset) {
      this.targetXOffset = -this.maxXOffset;
    }
    this.scrollPosition = window.scrollY;
  }


  /**
   * Prepares one or mulitple <img />'s for splitting
   * @param {*} query 
   */
  split(query){
    let elements = document.querySelectorAll(query);
    for(let originalElement of elements){
      let splittedImage = new RGBSplittedImage(originalElement);
      this.splittedImages.push(splittedImage);
    }
  }

  /**
   * Step is called every draw frame
   */
  step(timestamp){
      let deltaTime = timestamp - this.lastStepTime;
      if (isNaN(deltaTime)) deltaTime = 0;

      for(let image of this.splittedImages){
        image.step(deltaTime, this.targetXOffset);
      }

      // If stopped scrolling, target offset becomes zero.
      if (window.scrollY === this.scrollPosition) {
        this.targetXOffset = 0;
      }

     this.lastStepTime = timestamp;
     requestAnimationFrame((timestamp)=>{this.step(timestamp)});
  }
}

class RGBSplittedImage {
  constructor(originalElement) {
    
    this.currentXOffset = 0;
    this.easingSpeed = 6;
    this.colorNodes = {};

    this.html = this.generateSplitHTML(originalElement);
    originalElement.parentNode.replaceChild(this.html, originalElement);


  }

  generateSplitHTML(originalElement) {
    let splitElement = document.createElement('div');

    splitElement.id = originalElement.id;
    splitElement.classList = originalElement.classList;
    splitElement.classList.add('rgb-splitted');

    for (let color of ['invisible','red', 'green', 'blue']) {
      let colorNode = document.createElement('img');
      colorNode.src = originalElement.src;
      colorNode.classList.add(color);

      splitElement.appendChild(colorNode);
      this.colorNodes[color] = colorNode;
    }
    return splitElement;
  }

  step(deltaTime, targetXOffset){
    let speed = this.easingSpeed * deltaTime * 0.02;
    if(speed>1) speed = 1;

    let addition = (targetXOffset - this.currentXOffset) * speed;

    this.currentXOffset += addition;

    this.currentXOffset = Math.floor(this.currentXOffset * 100) / 100; // Round to two decimals

    this.setOffset(this.currentXOffset);
  }

  setOffset(pixels) {
    if(!this.colorNodes) return;

    let center = (pixels * 3) / 2;
    this.colorNodes.blue.style.transform = 'translateY(' + (pixels - center) + 'px)';
    this.colorNodes.red.style.transform = 'translateY(' + (pixels * 2 - center) + 'px)';
    this.colorNodes.green.style.transform = 'translateY(' + (pixels * 3 - center) + 'px)';
  }

}