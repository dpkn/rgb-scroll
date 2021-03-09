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
  constructor(filterContainer = document.body) {
    // Inject SVG filter into the HTML document
    let template = document.createRange().createContextualFragment(svgFilter);
    filterContainer.appendChild(template);

    this.lastStepTime = 0;
    this.scrollPosition = 0;
    this.splittedImages = [];

    this.targetXOffset = 0;
    this.maxXOffset = 15;

    window.addEventListener('scroll', () => {
      this.onScroll();
    });

    this.observer = new IntersectionObserver((entries)=>{
      for(let entry of entries){

        var result = this.splittedImages.find((obj) => {
          return obj.html === entry.target;
        });
        result.isIntersecting = entry.isIntersecting;

      }
    });

    this.step();
  }

  /**
   * Called on every scroll event. Sets the target offset to the amount scrolled.
   */
  onScroll() {
    this.targetXOffset = window.scrollY - this.scrollPosition;

    if (this.targetXOffset > this.maxXOffset) {
      this.targetXOffset = this.maxXOffset;
    } else if (this.targetXOffset < -this.maxXOffset) {
      this.targetXOffset = -this.maxXOffset;
    }

    this.scrollPosition = window.scrollY;
  }

  /**
   * Prepares one or mulitple <img />'s for splitting
   * @param {*} query A selector (e.g. class or ID) for one or more <img/> tags to split.
   */
  split(query) {
    let elements = document.querySelectorAll(query);
    for (let originalElement of elements) {
      let splittedImage = new RGBSplittedImage(originalElement);
      this.splittedImages.push(splittedImage);
      this.observer.observe(splittedImage.html);
    }
  }

  /**
   * Step is called every draw frame. Updates all splitted images.
   */
  step(timestamp) {
    let deltaTime = timestamp - this.lastStepTime;
    if (isNaN(deltaTime)) deltaTime = 0;

    for (let image of this.splittedImages) {
      image.step(deltaTime, this.targetXOffset);
    }

    // If user stopped scrolling, target offset becomes zero.
    if (window.scrollY === this.scrollPosition) {
      this.targetXOffset = 0;
    }

    this.lastStepTime = timestamp;

    requestAnimationFrame((timestamp) => {
      this.step(timestamp);
    });
  }
}

class RGBSplittedImage {
  constructor(originalElement) {
    this.currentXOffset = 0;
    this.easingSpeed = 6;
    this.colorNodes = {};
    this.isIntersecting = false;

    this.html = this.generateSplitHTML(originalElement);
    originalElement.parentNode.replaceChild(this.html, originalElement);
  }

  /**
   * Turns an <img/> tag into a div with 4 images: r, g, b, and original.
   * @param {Tue} originalElement
   */
  generateSplitHTML(originalElement) {
    let splitElement = document.createElement('div');

    splitElement.id = originalElement.id;
    splitElement.classList = originalElement.classList;
    splitElement.classList.add('rgb-splitted');

    for (let color of ['invisible', 'red', 'green', 'blue']) {
      let colorNode = document.createElement('img');
      colorNode.src = originalElement.src;
      colorNode.classList.add(color);

      splitElement.appendChild(colorNode);
      this.colorNodes[color] = colorNode;
    }
    return splitElement;
  }

  /**
   * Is called every frame by the RGBSplitter class
   * @param {*} deltaTime Amount of time since last call
   * @param {*} targetXOffset Amount of pixels to move to.
   */
  step(deltaTime, targetXOffset) {
    if(!this.isIntersecting) return;

    let speed = this.easingSpeed * deltaTime * 0.02;
    if (speed > 1.5) speed = 1.5; // I think the glitch problem lies here, because it becomes to slow/clunky and needs a higer step. But if i remove this everything spaces out.

    this.currentXOffset += (targetXOffset - this.currentXOffset) * speed;

    this.currentXOffset = Math.floor(this.currentXOffset * 100) / 100; // Round to two decimals

    this.setOffset(this.currentXOffset);
  }

  /**
   * Offsets the three colour layers by a certain amount of pixels.
   * @param {*} pixels The amount of pixels to offset by
   */
  setOffset(pixels) {
    if (!this.colorNodes) return;

    let center = (pixels * 3) / 2;
    this.colorNodes.blue.style.transform = 'translateY(' + (pixels - center) + 'px)';
    this.colorNodes.red.style.transform = 'translateY(' + (pixels * 2 - center) + 'px)';
    this.colorNodes.green.style.transform = 'translateY(' + (pixels * 3 - center) + 'px)';
  }
}
