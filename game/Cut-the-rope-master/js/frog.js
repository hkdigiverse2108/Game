class Frog {
  constructor(position) {
    this.position = position;
    this.animationSpeed = 80;
    this.frogSupportImage = new Image();
    this.image = this.frogImage = new Image();
    this.frogSad = new Image();
    this.frogChew = new Image();
    this.forgMouthOpen = new Image();
    this.frogMouthClose = new Image();
    this.frogSupportImage.src = './images/support.png';
    this.frogImage.src = './images/frog.png';
    this.frogSad.src = './images/frogSad.png';
    this.frogChew.src = './images/frogChew.png';
    this.forgMouthOpen.src = './images/frogMouthOpen.png';
    this.frogMouthClose.src = './images/frogMouthClose.png';
    this.listOfImages = [this.frogSad, this.frogChew, this.forgMouthOpen, this.frogMouthClose, this.frogSupportImage];
    this.loadAllImages();
    this.loadFrogImage();
    this.animateFrogAlways();

  }

  loadAllImages() {
    for (let image of this.listOfImages) {
      image.onload;
    }
  }

  loadFrogImage() {
    this.numOfRows = 19;
    this.index = 0;
    this.frogImage.onload = (e) => {
      this.getSpriteDimension();
    }
  }

  loadFrogSadImage() {
    this.numOfRows = 14;
    this.index = 0;
    this.getSpriteDimension();
  }

  loadFrogChewImage() {
    this.numOfRows = 34;
    this.index = 0;
    this.getSpriteDimension();
  }

  loadFrogMouthImage() {
    this.numOfRows = 4;
    this.index = 0;
    this.getSpriteDimension();
  }

  setFrogStatus(status) {
    switch (status.toLowerCase()) {
      case 'sad':
        this.image = this.frogSad;
        this.loadFrogSadImage();
        sadSound.play();
        break;

      case 'chew':
        this.image = this.frogChew;
        this.loadFrogChewImage();
        eatSound.play();
        break;

      case 'mouthopen':
        this.image = this.forgMouthOpen;
        this.loadFrogMouthImage();
        this.animateFrogPartial();
        break;

      case 'mouthclose':
        this.image = this.frogMouthClose;
        this.loadFrogMouthImage();

        setTimeout(() => {
          clearInterval(this.partialFrogAnimation);
          this.setFrogStatus('frog');
          this.loadFrogImage();
          this.animateFrogAlways();
        }, this.numOfRows * this.animationSpeed)
        break;

      default:
        this.image = this.frogImage;
        this.loadFrogImage();
    }

  }

  getSpriteDimension() {
    this.spriteWidth = this.image.width;
    this.spriteHeight = this.image.height;
    this.singleSpriteHeight = this.spriteHeight / this.numOfRows;
  }

  animateFrogAlways() {
    this.frogAnimation = setInterval(() => {
      this.index = ++this.index % this.numOfRows;
    }, this.animationSpeed);
  }

  animateFrogPartial() {
    clearInterval(this.frogAnimation);
    this.partialFrogAnimation = setInterval(() => {
      this.index++;
      if (this.index >= this.numOfRows) {
        this.index = this.numOfRows - 1;
      }
    }, this.animationSpeed);
  }

  drawFrogImage() {
    this.drawFrogSupportImage();
    ctx.beginPath();
    ctx.drawImage(this.image, 0, this.index * this.singleSpriteHeight, this.spriteWidth, this.singleSpriteHeight,
      this.position.x - this.spriteWidth / 2, this.position.y - this.singleSpriteHeight / 2, this.spriteWidth, this.singleSpriteHeight);
    ctx.closePath();
  }

  drawFrogSupportImage() {
    ctx.beginPath();
    ctx.drawImage(this.frogSupportImage, this.position.x - this.frogSupportImage.width / 2,
      this.position.y - this.frogSupportImage.height / 4, this.frogSupportImage.width, this.frogSupportImage.height);
    ctx.closePath();
  }

  update() {
    // this.draw();
  }
}