class Star {
  constructor(position, index) {
    this.position = position;
    this.starImage = new Image();
    this.starImage.src = './images/starSprite.png';
    this.starBloom = new Image();
    this.starBloom.src = './images/starBloom.png'
    this.starDisappearImage = new Image();
    this.starDisappearImage.src = './images/starDisappear.png';
    this.index = index;
    this.hasDisappeared = false;
    this.hasAnimated = false;
    this.bouncingUp = true;
    this.isDisappearing = false;
    this.dy = 0;
    this.numOfRows = 18;
    this.animationTime = 45;

    this.sounds = [star1Sound, star2Sound, star3Sound];

    this.loadStarImage();
    this.animateStar();

  }

  loadStarImage() {
    this.starImage.onload = (e) => {
      this.spriteWidth = this.starImage.width;
      this.spriteHeight = this.starImage.height
      this.singleSpriteHeight = this.spriteHeight / this.numOfRows;
    }
  }

  animateStar() {
    this.starAnimation = setInterval(() => {
      this.index = ++this.index % this.numOfRows;
      if (this.bouncingUp) {
        this.dy += 0.3;
        this.bouncingUp = (this.dy > 6) ? false : true;
      }
      if (!this.bouncingUp) {
        this.dy -= 0.3;
        this.bouncingUp = (this.dy <= 0) ? true : false;
      }
    }, this.animationTime);
  }

  starDisappearAnimation() {
    this.setDisappearStatus(true);
    this.starAnimationIndex = 0;
    this.starAnimationNumOfRows = 11;
    this.starAnimationSpriteWidth = this.starDisappearImage.width;
    this.starAnimationSpriteHeight = this.starDisappearImage.height;
    this.starAnimationSingleSpriteHeight = this.starAnimationSpriteHeight / this.starAnimationNumOfRows;


    if (!this.isDisappearing) {
      this.sounds[newGame.inGameScore.getStarScore() - 1].currentTime = 0;
      this.sounds[newGame.inGameScore.getStarScore() - 1].play();
      this.isDisappearing = true;
      this.starDisappear = setInterval(() => {
        this.starAnimationIndex++;
        if (this.starAnimationIndex > this.starAnimationNumOfRows) {
          this.starAnimationIndex = this.starAnimationNumOfRows - 1;
          this.hasAnimated = true;
          clearInterval(this.starDisappear);
        }
      }, this.animationTime);
    }
  }

  getStarDisappearAnimationTime() {
    return this.starAnimationNumOfRows * this.animationTime;
  }

  drawDisappearStar() {
    if (!this.hasAnimated) {
      ctx.beginPath();
      ctx.drawImage(this.starDisappearImage, 0, this.starAnimationIndex * this.starAnimationSingleSpriteHeight,
        this.starAnimationSpriteWidth, this.starAnimationSingleSpriteHeight, this.position.x - this.starAnimationSpriteWidth / 2,
        this.position.y - this.starAnimationSingleSpriteHeight / 2 - this.dy,
        this.starAnimationSpriteWidth, this.starAnimationSingleSpriteHeight);
      ctx.closePath();
    }
  }

  setDisappearStatus(value) {
    this.hasDisappeared = value;
  }

  draw() {
    if (!this.hasDisappeared) {
      ctx.beginPath();
      ctx.drawImage(this.starBloom, this.position.x - this.spriteWidth,
        this.position.y - this.singleSpriteHeight - this.dy);
      ctx.drawImage(this.starImage, 0, this.index * this.singleSpriteHeight, this.spriteWidth,
        this.singleSpriteHeight, this.position.x - this.spriteWidth / 2,
        this.position.y - this.singleSpriteHeight / 2 - this.dy,
        this.spriteWidth, this.singleSpriteHeight);
      ctx.closePath();
    }
  }

  update() {
    this.draw();
  }
}